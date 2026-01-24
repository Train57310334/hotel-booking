import '@/styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdminProvider } from '@/contexts/AdminContext'
import { ToastProvider } from '@/contexts/ToastContext'
import NavBar from '@/components/NavBar'
import ThemeToggle from '@/components/ThemeToggle'

import { Toaster } from 'react-hot-toast'

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AdminProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-gray-100 transition-colors">
            <main className="flex-1">
              <Component {...pageProps} />
            </main>
          </div>
          <Toaster position="top-center" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
        </ToastProvider>
      </AdminProvider>
    </AuthProvider>
  )
}
