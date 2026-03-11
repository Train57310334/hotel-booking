import '@/styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminProvider } from '@/contexts/AdminContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import { Toaster } from 'react-hot-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api'

function SeoHead({ hotel, platformSettings }) {
  const router = useRouter()

  const title = hotel?.seoTitle || (hotel ? hotel.name : platformSettings?.siteName || 'Hotel Booking')
  const description = hotel?.seoDescription || platformSettings?.seoDefaultDescription || ''
  const keywords = hotel?.seoKeywords || ''
  const ogImage = hotel?.ogImage || hotel?.imageUrl || platformSettings?.seoDefaultOgImage || ''
  const canonical = hotel?.canonicalUrl || ''
  const robotsContent = hotel?.robotsIndex === false ? 'noindex,nofollow' : 'index,follow'

  // Tracking IDs: hotel takes priority, platform is fallback
  const gaId = hotel?.googleAnalyticsId || platformSettings?.seoPlatformGaId || ''
  const gtmId = hotel?.googleTagManagerId || platformSettings?.seoPlatformGtmId || ''
  const fbPixelId = hotel?.facebookPixelId || platformSettings?.seoPlatformFbPixel || ''
  const gadsId = hotel?.googleAdsId || platformSettings?.seoPlatformGadsId || ''

  // JSON-LD Structured Data for LodgingBusiness
  const jsonLd = hotel ? JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: hotel.name,
    description: hotel.description || '',
    url: canonical || (typeof window !== 'undefined' ? `${window.location.origin}/?hotelId=${hotel.id}` : ''),
    telephone: hotel.contactPhone || '',
    email: hotel.contactEmail || '',
    address: hotel.address ? {
      '@type': 'PostalAddress',
      streetAddress: hotel.address,
      addressLocality: hotel.city || '',
      addressCountry: hotel.country || ''
    } : undefined,
    image: ogImage || undefined,
    geo: hotel.latitude && hotel.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: hotel.latitude,
      longitude: hotel.longitude
    } : undefined
  }) : null

  return (
    <>
      <Head>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="robots" content={robotsContent} />
        {canonical && <link rel="canonical" href={canonical} />}

        {/* Open Graph */}
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:type" content="website" />
        {canonical && <meta property="og:url" content={canonical} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        {description && <meta name="twitter:description" content={description} />}
        {ogImage && <meta name="twitter:image" content={ogImage} />}

        {/* Site Verification */}
        {platformSettings?.seoGoogleVerification && (
          <meta name="google-site-verification" content={platformSettings.seoGoogleVerification} />
        )}
        {platformSettings?.seoBingVerification && (
          <meta name="msvalidate.01" content={platformSettings.seoBingVerification} />
        )}

        {/* JSON-LD */}
        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      </Head>

      {/* Google Tag Manager */}
      {gtmId && (
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {/* Google Analytics 4 (only if no GTM) */}
      {gaId && !gtmId && (
        <>
          <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <Script id="ga4-script" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');`}
          </Script>
        </>
      )}

      {/* Google Ads */}
      {gadsId && !gtmId && (
        <Script id="gads-script" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('config', '${gadsId}');`}
        </Script>
      )}

      {/* Facebook Pixel */}
      {fbPixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${fbPixelId}');
          fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  )
}

import { ThemeProvider } from '@/contexts/ThemeContext'

// ... existing code ...

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [hotel, setHotel] = useState(pageProps?.hotel || null)
  const [platformSettings, setPlatformSettings] = useState(pageProps?.saasSettings || null)

  const hotelId = router.query.hotelId || pageProps?.hotel?.id

  useEffect(() => {
    // Fetch platform-level SEO settings (always)
    fetch(`${API_BASE}/settings/public`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setPlatformSettings(data) })
      .catch(() => { })
  }, [])

  useEffect(() => {
    if (!hotelId) { setHotel(null); return; }
    fetch(`${API_BASE}/hotels/${hotelId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setHotel(data) })
      .catch(() => { })
  }, [hotelId])

  return (
    <LanguageProvider>
      <AuthProvider>
        <AdminProvider>
          <ToastProvider>
            <ThemeProvider initialTheme={pageProps?.hotel?.theme || hotel?.theme || 'classic'}>
              <SeoHead hotel={hotel || pageProps?.hotel} platformSettings={platformSettings} />
              {/* Note: The 'theme-*' wrapper is already injected by ThemeProvider */}
              <div className="flex flex-col flex-1 transition-colors">
                <main className="flex-1">
                  <Component {...pageProps} />
                </main>
              </div>
              <Toaster position="top-center" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
            </ThemeProvider>
          </ToastProvider>
        </AdminProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
