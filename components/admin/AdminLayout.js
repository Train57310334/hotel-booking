import Link from 'next/link'
import { useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

const menus = [
  { href: '/admin', icon: '📊', label: 'Dashboard' },
  { href: '/admin/owners', icon: '👤', label: 'Owner Management' },
  { href: '/admin/rooms', icon: '🏨', label: 'Room' },
  { href: '/admin/bookings', icon: '📅', label: 'Booking' },
  { href: '/admin/guests', icon: '👥', label: 'Guest' },
  { href: '/admin/payments', icon: '💳', label: 'Payments' },
  { href: '/admin/messages', icon: '💬', label: 'Message' },
  { href: '/admin/account', icon: '⚙️', label: 'My Account' },
  { href: '/admin/settings', icon: '🛠', label: 'Settings' },
];

export default function AdminLayout({ children, title='Dashboard' }){
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-slate-900 dark:text-gray-100 transition-colors">
      <aside className="bg-white dark:bg-gray-800 w-64 shrink-0 border-r dark:border-gray-700 hidden md:flex flex-col relative">
        <div className="p-6 font-bold text-2xl">Logo</div>
        <nav className="px-3 space-y-1 flex-1">
          {menus.map(m => (
            <Link key={m.href} href={m.href} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span className="text-lg">{m.icon}</span>
              <span className="text-sm">{m.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <ThemeToggle />
        </div>
      </aside>
      <div className="flex-1">
        <header className="bg-white dark:bg-gray-800 sticky top-0 z-10 border-b dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <button onClick={()=>setOpen(!open)} className="md:hidden text-xl">☰</button>
              <div className="flex-1">
                <div className="relative">
                  <input placeholder="Search" className="w-full border dark:border-gray-700 rounded-xl pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700"/>
                  <span className="absolute left-3 top-2.5">🔎</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block"><ThemeToggle compact /></div>
            <div className="flex items-center gap-3">
              <select className="border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm">
                <option>This Month</option><option>Last Month</option><option>This Year</option>
              </select>
              <button className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm">Download ⤓</button>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                <img src="https://i.pravatar.cc/32" className="w-8 h-8 rounded-full" alt="user"/>
                <div className="text-sm">
                  <div className="font-medium">Watt Banana</div>
                  <div className="text-gray-500 dark:text-gray-300 text-xs">Admin</div>
                </div>
              </div>
              <button className="text-xl">🔔</button>
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </div>
    </div>
  )
}
