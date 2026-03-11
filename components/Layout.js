import NavBar from '@/components/NavBar'
import Link from 'next/link'
import { Github, Twitter, Instagram, Heart } from 'lucide-react'

export default function Layout({ children, navbarProps, hideFooter = false, hideNavbar = false }) {
    return (
        <div className="min-h-screen flex flex-col w-full text-theme-text bg-theme-bg font-theme">
            {!hideNavbar && <NavBar {...navbarProps} />}
            <main className="flex-1 w-full">
                {children}
            </main>

            {!hideFooter && (
                <footer className="bg-theme-bg border-t border-theme-border pt-16 pb-8 mt-20 print:hidden text-theme-text">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                            <div className="col-span-1 md:col-span-1">
                                {navbarProps?.logo ? (
                                    <div className="h-10 w-10 relative rounded-xl overflow-hidden shadow-lg mb-4">
                                        <img src={navbarProps.logo} alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <span className="text-xl font-bold tracking-tight mb-4 block">
                                        {navbarProps?.brandName || 'BookingKub'}
                                    </span>
                                )}
                                <p className="text-theme-muted text-sm leading-relaxed whitespace-pre-wrap">
                                    {navbarProps?.footerDescription || "Discover the world's best hotels and resorts. Book your perfect stay with confidence and ease."}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-bold mb-4 font-display text-theme-text text-lg">Company</h4>
                                <ul className="space-y-2 text-sm text-theme-muted font-medium">
                                    <li><a href="#" className="hover:text-theme-accent transition-colors">About Us</a></li>
                                    <li><a href="#" className="hover:text-theme-accent transition-colors">Careers</a></li>
                                    <li><Link href="/auth/register" className="transition-colors font-bold text-theme-accent hover:opacity-80">List Your Property</Link></li>
                                    <li><a href="#" className="hover:text-theme-accent transition-colors">Blog</a></li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold mb-4 font-display text-theme-text text-lg">Support</h4>
                                <ul className="space-y-2 text-sm text-theme-muted font-medium">
                                    <li><a href="#" className="hover:text-theme-accent transition-colors">Help Center</a></li>
                                    <li><a href="#" className="hover:text-theme-accent transition-colors">Terms of Service</a></li>
                                    <li><a href="#" className="hover:text-theme-accent transition-colors">Privacy Policy</a></li>
                                </ul>
                            </div>

                            <div>
                                {(navbarProps?.facebookUrl || navbarProps?.instagramUrl || navbarProps?.twitterUrl) ? (
                                    <>
                                        <h4 className="font-bold mb-4">Follow Us</h4>
                                        <div className="flex gap-4">
                                            {navbarProps?.twitterUrl && (
                                                <a href={navbarProps.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-theme-accent transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {navbarProps?.instagramUrl && (
                                                <a href={navbarProps.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-theme-accent transition-colors"><Instagram size={20} /></a>
                                            )}
                                            {navbarProps?.facebookUrl && (
                                                <a href={navbarProps.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-theme-muted hover:text-theme-accent transition-colors">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                                </a>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="font-bold mb-4">Follow Us</h4>
                                        <div className="flex gap-4">
                                            <a href="#" className="text-theme-muted hover:text-theme-accent transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                            </a>
                                            <a href="#" className="text-theme-muted hover:text-theme-accent transition-colors"><Instagram size={20} /></a>
                                            <a href="#" className="text-theme-muted hover:text-theme-accent transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                                                </svg>
                                            </a>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-theme-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-theme-muted">
                            <p>© {new Date().getFullYear()} {navbarProps?.brandName || 'BookingKub'}. All rights reserved.</p>
                            <p className="flex items-center gap-1">Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> for travelers.</p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    )
}