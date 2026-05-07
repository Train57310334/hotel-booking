import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
// SaaS Components
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';
import TrustStats from '@/components/landing/TrustStats';
import Integrations from '@/components/landing/Integrations';
import Testimonials from '@/components/landing/Testimonials';

import HotelLanding from '@/components/HotelLanding';
import ModernTheme from '@/components/themes/ModernTheme';
import BoutiqueTheme from '@/components/themes/BoutiqueTheme';

import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/api';
import { apiPaths } from '@/lib/apiPaths';

export default function Home({ hotel, error, isSaaSLanding, saasSettings }) {
  const router = useRouter();
  const { user } = useAuth();

  // Inject dynamic brand color from SaaS settings as CSS custom properties
  if (typeof window !== 'undefined' && saasSettings?.primaryColor) {
    document.documentElement.style.setProperty('--color-brand', saasSettings.primaryColor);
  }


  // If we have a specific hotel and we are NOT in SaaS mode, show the hotel landing
  if (!isSaaSLanding && hotel && !error) {
    if (hotel.theme === 'modern') {
      return <ModernTheme hotel={hotel} />;
    }
    if (hotel.theme === 'boutique') {
      return <BoutiqueTheme hotel={hotel} />;
    }
    return <HotelLanding hotel={hotel} />;
  }

  // Build SEO props from saasSettings
  const siteName = saasSettings?.siteName || 'BookingKub';
  const seoTitle = saasSettings?.landingHeroTitle
    ? `${saasSettings.landingHeroTitle} | ${siteName}`
    : `${siteName} — Hotel Management & Booking System`;
  const seoDesc = saasSettings?.landingHeroDescription ||
    'The all-in-one hotel management platform. Manage bookings, sync with Agoda & Booking.com, boost direct sales with 0% commission.';

  return (
    <Layout
      navbarProps={{ brandName: siteName, logo: saasSettings?.logoUrl, mode: 'saas' }}
      seoProps={{
        title: seoTitle,
        description: seoDesc,
        keywords: 'hotel management system, channel manager, booking engine, yield management, housekeeping, PMS',
        image: saasSettings?.logoUrl || '/og-image.png',
        canonicalUrl: saasSettings?.siteUrl || undefined,
      }}
      hideFooter
    >
      <Hero
        title={saasSettings?.landingHeroTitle}
        description={saasSettings?.landingHeroDescription}
        ctaText={saasSettings?.landingCTA}
      />
      <Integrations />
      <Features saasSettings={saasSettings} />
      <TrustStats />
      <Pricing saasSettings={saasSettings} />
      <Testimonials />
      <ContactSection />
      <Footer saasSettings={saasSettings} />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { req, query } = context;
  const host = req.headers.host || '';

  // 1. Detect Mode
  // - If subdomain is 'app' or 'www' or 'localhost', show SaaS Landing
  // - If query param ?mode=hotel is present, show Hotel Landing
  // - For now, we DEFAULT to SaaS Landing as requested by user

  const isSaaSLanding = !query.hotelId && !query.mode;

  // If we want to show a specific hotel (e.g. demo mode), fetch it
  let hotel = null;
  let saasSettings = null;
  let error = null;

  const backend = API_BASE;

  if (!isSaaSLanding) {
    try {
      // If hotelId is provided in query, use it. Otherwise fetch all (legacy demo)
      const endpoint = query.hotelId ? `${backend}/hotels/${query.hotelId}` : `${backend}/hotels`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('Failed to fetch hotel');

      const data = await res.json();

      if (Array.isArray(data)) {
        // Find best hotel if list returned
        if (data.length === 0) throw new Error('No hotels found');
        hotel = data.reduce((prev, current) =>
          (prev.roomTypes?.length || 0) > (current.roomTypes?.length || 0) ? prev : current
        );
      } else {
        hotel = data;
      }

    } catch (err) {
      error = err.message;
    }
  } else {
    // Fetch SaaS Settings
    try {
      const res = await fetch(`${backend}${apiPaths.publicSettings}`);
      if (res.ok) {
        saasSettings = await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch SaaS settings", e);
    }
  }

  return {
    props: {
      hotel,
      error,
      isSaaSLanding,
      saasSettings: saasSettings || null
    }
  };
}
