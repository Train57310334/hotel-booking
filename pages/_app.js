import '@/styles/globals.css'
import NavBar from '@/components/NavBar'
import ThemeToggle from '@/components/ThemeToggle'

export default function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-slate-900 dark:text-gray-100 transition-colors">
      {/* <NavBar /> */}
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      {/* <footer className="text-center text-xs text-gray-500 dark:text-gray-400 py-8">
        © BookingKub
        <div className="mt-3 md:hidden flex justify-center">
          <ThemeToggle compact />
        </div>
      </footer> */}
    </div>
  )
}
