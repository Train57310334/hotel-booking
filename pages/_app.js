import '@/styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminProvider } from '@/contexts/AdminContext'
import NavBar from '@/components/NavBar'
import ThemeToggle from '@/components/ThemeToggle'

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-slate-900 dark:text-gray-100 transition-colors">
          {/* <NavBar /> */}
          <main className="flex-1">
            <Component {...pageProps} />
          </main>
        </div>
      </AdminProvider>
    </AuthProvider>
  )
}
