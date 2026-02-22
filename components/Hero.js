import { motion } from 'framer-motion'

export default function Hero(props) {
  const { children, title, description, backgroundImage, backgroundVideo } = props;
  const bgImage = backgroundImage || "/images/hero-bg.png";

  // Use a default title if none provided
  const heroTitle = title || (
    <>
      Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">BookingKub</span>
      <br /> Luxury Resort
    </>
  );

  const heroDescription = description || "Experience the ultimate relaxation with our exclusive rooms and premium amenities.";

  return (
    <section className="relative h-[80vh] min-h-[600px] flex flex-col justify-end pb-24 overflow-hidden mb-0">
      {/* Background Media */}
      <div className="absolute inset-0 bg-slate-900">
        {props.backgroundVideo ? (
          <video
            src={props.backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        ) : (
          <img
            src={bgImage}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[20s] hover:scale-105"
          />
        )}

        {/* Gradients for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-display text-white mb-6 leading-tight tracking-tight drop-shadow-2xl">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 font-light max-w-2xl mx-auto drop-shadow-lg leading-relaxed opacity-90">
            {heroDescription}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}