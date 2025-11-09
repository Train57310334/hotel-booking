export default function Hero({ children }){
  return (
    <section className="relative h-[36vh] md:h-[44vh] rounded-3xl overflow-hidden mb-6">
      <img src="https://images.unsplash.com/photo-1502920917128-1aa500764ce7?q=80&w=1920&auto=format&fit=crop" alt="City skyline" className="absolute inset-0 w-full h-full object-cover"/>
      <div className="absolute inset-0 bg-gradient-to-r from-ink-900/70 to-ink-800/30" />
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-white">Find your perfect stay</h1>
          <p className="text-white/80 mt-2 max-w-xl">Search deals across hotels and resorts worldwide.</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  )
}