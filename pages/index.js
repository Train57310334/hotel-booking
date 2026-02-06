import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import ComingSoon from '@/components/ComingSoon';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Star, MapPin, Coffee, Wifi, Tv } from 'lucide-react';

export default function Home({ hotel, error }) {
  if (error) {
    const { user } = useAuth();
    return (
      <Layout navbarProps={{ forceSolid: true }}>
        <div className="min-h-screen pt-28 flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full -z-10 bg-slate-50">
            <div className="absolute top-10 left-10 w-72 h-72 bg-primary-200 rounded-full blur-[100px] opacity-30 animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200 rounded-full blur-[100px] opacity-30 animate-pulse delay-700" />
          </div>

          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white shadow-xl mb-4 text-primary-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-900 tracking-tight leading-tight">
              {hotel.heroTitle ? (
                <span dangerouslySetInnerHTML={{ __html: hotel.heroTitle.replace(/\n/g, '<br/>') }} />
              ) : (
                <>
                  Welcome to <br className="hidden md:block" />
                  <span className="bg-gradient-to-r from-primary-600 to-teal-400 bg-clip-text text-transparent">{hotel.name}</span>
                </>
              )}
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {hotel.heroDescription || (user ? "Your account is ready. Let's set up your first property." : "Experience luxury and comfort in the heart of the city.")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              {user ? (
                <Link href="/admin/setup" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                  Setup My Hotel <ArrowRight size={20} />
                </Link>
              ) : (
                <Link href="/auth/register" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-primary-500/30 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                  Get Started <ArrowRight size={20} />
                </Link>
              )}

              {!user && (
                <Link href="/auth/login" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  I already have an account
                </Link>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Use dynamic content or fallbacks
  // Note: If heroTitle is present, use it. Otherwise use generic Greeting + Name
  const heroTitle = hotel.heroTitle || `Welcome to ${hotel.name}`;
  const heroDescription = hotel.heroDescription || hotel.description || "Experience luxury and comfort in the heart of the city.";
  const heroImage = hotel.imageUrl || "/images/hero-bg.png"; // Fallback image

  // Default parameters for links
  const now = new Date();
  const tmr = new Date(now);
  tmr.setDate(now.getDate() + 1);
  const formatDate = (d) => d.toISOString().split('T')[0];

  const defaultParams = `checkIn=${formatDate(now)}&checkOut=${formatDate(tmr)}&guests=1`;

  // 🔌 SAAS MODE: If hotel has no room types, show Coming Soon
  if (!hotel.roomTypes || hotel.roomTypes.length === 0) {
    return <ComingSoon hotelName={hotel.name} />;
  }

  return (
    <Layout navbarProps={{ logo: hotel.logoUrl, brandName: hotel.heroTitle ? hotel.name : 'BookingKub' }}>
      {/* Hero Section */}
      <Hero
        title={heroTitle}
        description={heroDescription}
        backgroundImage={heroImage}
      >
        <SearchBar />
      </Hero>

      {/* Featured Rooms Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Luxurious Accommodations</h2>
            <p className="text-slate-600">Choose from our wide range of premium rooms and suites, designed for your ultimate comfort.</p>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${hotel.roomTypes?.length < 3 ? 'justify-center md:flex md:flex-wrap' : ''}`}>
            {(() => {
              const featured = hotel.roomTypes?.filter(rt => rt.isFeatured);
              const display = (featured && featured.length > 0) ? featured : hotel.roomTypes?.slice(0, 3);
              return display.map((rt, idx) => (
                <div key={rt.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 w-full md:max-w-md">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={rt.images?.[0] || hotel.imageUrl}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur mb-2 px-3 py-1 rounded-lg text-sm font-bold text-slate-900 shadow-sm">
                      {rt.sizeSqm} m²
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{rt.name}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-2">{rt.description || "Experience elegance and comfort."}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {rt.amenities?.slice(0, 3).map((am, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-50 rounded text-xs text-slate-500 border border-slate-100 uppercase tracking-wide">{am}</span>
                      ))}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-medium">Starting from</p>
                        <p className="text-2xl font-display font-bold text-primary-600">
                          ฿{(rt.basePrice || 2000).toLocaleString()} <span className="text-sm text-slate-400 font-sans font-normal">/ night</span>
                        </p>
                      </div>
                      <Link href={`/search?${defaultParams}#room-${rt.id}`} className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-primary-600 transition-colors">
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>

          <div className="text-center mt-12">
            <Link href={`/search?${defaultParams}`} className="inline-flex items-center gap-2 font-bold text-slate-900 hover:text-primary-600 transition-colors">
              View All Rooms <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features / Why Choose Us */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-slate-900 mb-6">Experience the Difference</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                We go above and beyond to ensure your stay is memorable. From our world-class amenities to our personalized service, every detail is curated for you.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                    <Wifi size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">High-Speed Wi-Fi</h4>
                    <p className="text-slate-500">Stay connected with complimentary high-speed internet access throughout the property.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Tv size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Smart Entertainment</h4>
                    <p className="text-slate-500">Enjoy your favorite shows with our state-of-the-art smart TVs in every room.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Coffee size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Premium Dining</h4>
                    <p className="text-slate-500">Savor exquisite culinary delights prepared by our expert chefs.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden relative z-10">
                <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1000" className="object-cover w-full h-full" />
              </div>
              <div className="absolute -bottom-10 -left-10 w-2/3 h-2/3 bg-slate-100 rounded-3xl -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      {
        hotel.reviews && hotel.reviews.length > 0 && (
          <section className="py-24 bg-slate-900 text-white">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Guest Testimonials</h2>
                <p className="text-slate-400">See what our guests are saying about their stay.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {hotel.reviews.slice(0, 3).map((r, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors">
                    <div className="flex gap-1 text-yellow-400 mb-4">
                      {[...Array(r.rating)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-slate-300 italic mb-6 leading-relaxed">"{r.comment}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold">G</div>
                      <span className="font-bold">Valued Guest</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      }

    </Layout >
  );
}

export async function getServerSideProps() {
  try {
    const backend = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:3001/api';
    const res = await fetch(`${backend}/hotels`);

    if (!res.ok) throw new Error('Failed to fetch hotel');

    const hotels = await res.json();

    if (!hotels || hotels.length === 0) {
      return { props: { error: 'No hotels found' } };
    }

    // Use the hotel with the most room types (likely the active/main one)
    const bestHotel = hotels.reduce((prev, current) =>
      (prev.roomTypes?.length || 0) > (current.roomTypes?.length || 0) ? prev : current
    );

    return {
      props: {
        hotel: bestHotel
      }
    };
  } catch (err) {
    return { props: { error: err.message } };
  }
}
