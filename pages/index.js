import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
// SaaS Components
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';
// Hotel Component
import HotelLanding from '@/components/HotelLanding';

import { useAuth } from '@/contexts/AuthContext';
import { API_BASE } from '@/lib/api';

export default function Home({ hotel, error, isSaaSLanding, saasSettings }) {
  const router = useRouter();
  const { user } = useAuth();

  // If we have a specific hotel and we are NOT in SaaS mode, show the hotel landing
  if (!isSaaSLanding && hotel && !error) {
    return <HotelLanding hotel={hotel} />;
  }

  // --- SaaS Landing Page ---
  return (
    <Layout navbarProps={{ brandName: saasSettings?.siteName || 'BookingKub', mode: 'saas' }} hideFooter>
      <Hero
        title={saasSettings?.landingHeroTitle}
        description={saasSettings?.landingHeroDescription}
        ctaText={saasSettings?.landingCTA}
      />
      <Features />
      <Pricing />
      <ContactSection />
      <Footer />
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
      const res = await fetch(`${backend}/public-settings`);
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
