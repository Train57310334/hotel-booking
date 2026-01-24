import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { ArrowRight, Star, MapPin, Coffee, Wifi, Tv } from 'lucide-react';

export default function Home({ hotel, error }) {
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-20 text-center">
          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-red-600 mb-2">System Not Ready</h3>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Use dynamic content or fallbacks
  const heroTitle = hotel.heroTitle || `Welcome to ${hotel.name}`;
  const heroDescription = hotel.heroDescription || hotel.description || "Experience luxury and comfort in the heart of the city.";
  const heroImage = hotel.imageUrl || "/images/hero-bg.png"; // Fallback image

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-2xl text-white animate-in slide-in-from-bottom-10 fade-in duration-700">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 font-bold text-sm mb-6 backdrop-blur-sm">
              Premium Hospitality
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
              {heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-lg">
              {heroDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/hotel/${hotel.id}`}
                className="btn-primary px-8 py-4 text-lg shadow-xl shadow-primary-600/30 flex items-center justify-center gap-2 group"
              >
                Book Your Stay
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold hover:bg-white/20 transition-all text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <span className="text-xs font-bold tracking-widest uppercase">Scroll to Discover</span>
        </div>
      </div>

      {/* Featured Rooms Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Luxurious Accommodations</h2>
            <p className="text-slate-600">Choose from our wide range of premium rooms and suites, designed for your ultimate comfort.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(() => {
              const featured = hotel.roomTypes?.filter(rt => rt.isFeatured);
              const display = (featured && featured.length > 0) ? featured : hotel.roomTypes?.slice(0, 3);
              return display.map((rt, idx) => (
                <div key={rt.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
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
                      <Link href={`/hotel/${hotel.id}#room-${rt.id}`} className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-primary-600 transition-colors">
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>

          <div className="text-center mt-12">
            <Link href={`/hotel/${hotel.id}`} className="inline-flex items-center gap-2 font-bold text-slate-900 hover:text-primary-600 transition-colors">
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
