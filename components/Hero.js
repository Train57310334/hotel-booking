import { motion } from 'framer-motion'
import { MapPin, Calendar, Users } from 'lucide-react'

export default function Hero({ children }) {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden mb-12">
      {/* Background with overlay */}
      {/* Background with overlay */}
      <div className="absolute inset-x-0 top-0 h-[85vh] rounded-b-[3rem] overflow-hidden -z-10 bg-[#0B1121]">
        <div className="absolute inset-0 bg-[#0B1121]" /> {/* Fallback color layer */}
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000&auto=format&fit=crop" /* Classic Dark Luxury Hotel */
          alt="Luxury Hotel"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/80 via-transparent to-[#0F172A]/80" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-7xl font-bold font-display text-white mb-6 leading-tight tracking-tight"
          >
            Find your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">perfect stay</span>
            <br /> around the world
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-200 font-light max-w-2xl mx-auto"
          >
            Discover handpicked hotels, resorts, and vacation rentals with the best rates guaranteed.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-5xl mx-auto relative"
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}