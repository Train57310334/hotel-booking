import NavBar from '@/components/NavBar'
import { Github, Twitter, Instagram } from 'lucide-react'

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
            <NavBar />
            <main className="flex-1 w-full">
                {children}
            </main>

            <footer className="bg-white border-t border-slate-100 pt-16 pb-8 mt-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <span className="text-xl font-display font-bold tracking-tight text-slate-900 mb-4 block">
                                BookingKub
                            </span>
                            <p className="text-slate-500 text-sm leading-relaxed">
                                Discover the world's best hotels and resorts. Book your perfect stay with confidence and ease.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Help Center</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Follow Us</h4>
                            <div className="flex gap-4">
                                <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors"><Twitter size={20} /></a>
                                <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors"><Instagram size={20} /></a>
                                <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors"><Github size={20} /></a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                        <p>© 2024 BookingKub. All rights reserved.</p>
                        <p>Made with ❤️ for travelers.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}