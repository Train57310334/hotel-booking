import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Globe, CreditCard, ChevronRight, Menu, X, ArrowLeft, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

// Map icon strings from frontmatter to Lucide components
const iconMap = { BookOpen, Globe, CreditCard, Info, HelpCircle };

export async function getStaticProps({ locale }) {
    const docsDir = path.join(process.cwd(), 'docs/help');
    const lang = locale || 'en';
    let topics = [];

    try {
        if (fs.existsSync(docsDir)) {
            const files = fs.readdirSync(docsDir);

            // Try to load locale-specific file, fallback to .en.md
            const uniqueIds = [...new Set(
                files
                    .filter(fn => fn.match(/\.(en|th)\.md$/))
                    .map(fn => fn.replace(/\.(en|th)\.md$/, ''))
            )];

            topics = uniqueIds.map(id => {
                const localFile = path.join(docsDir, `${id}.${lang}.md`);
                const fallbackFile = path.join(docsDir, `${id}.en.md`);
                const filePath = fs.existsSync(localFile) ? localFile : fallbackFile;

                if (!fs.existsSync(filePath)) return null;

                const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
                const { data, content } = matter(markdownWithMeta);

                return {
                    id: data.id || id,
                    title: data.title || id,
                    iconName: data.icon || 'HelpCircle',
                    order: data.order || 99,
                    content
                };
            }).filter(Boolean);

            topics.sort((a, b) => a.order - b.order);
        }
    } catch (err) {
        console.error("Failed to read markdown files", err);
    }

    return { props: { topics } };
}

export default function HelpCenter({ topics }) {
    const [activeTopicId, setActiveTopicId] = useState(topics?.length > 0 ? topics[0].id : null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    const currentTopic = topics?.find(t => t.id === activeTopicId) || topics?.[0];

    const MarkdownComponents = {
        h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-900 mb-6" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 border-b border-slate-100 pb-3" {...props} />,
        h3: ({node, ...props}) => <h3 className="font-bold text-lg text-slate-800 mt-6 mb-2" {...props} />,
        p:  ({node, ...props}) => <p  className="text-slate-600 text-sm leading-relaxed mb-4" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc pl-5 text-slate-600 space-y-1 mb-4" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal pl-5 text-slate-600 space-y-1 mb-4" {...props} />,
        li: ({node, ...props}) => <li className="text-sm" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold text-slate-800" {...props} />,
        code: ({node, inline, ...props}) => inline
            ? <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
            : <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-4"><code {...props} /></pre>,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary-500 pl-4 py-2 italic bg-slate-50 text-slate-700 my-4 rounded-r-lg" {...props} />,
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <Head>
                <title>{language === 'th' ? 'ศูนย์ช่วยเหลือ - BookingKub' : 'Help Center - BookingKub'}</title>
            </Head>

            {/* Header */}
            <header className="bg-[#0A0F1C] text-white border-b border-slate-800 sticky top-0 z-30">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                            <ArrowLeft size={16} /> {language === 'th' ? 'กลับหน้าหลัก' : 'Back to Site'}
                        </Link>
                        <div className="h-6 w-px bg-slate-800"></div>
                        <div className="font-display font-bold text-lg flex items-center gap-2">
                            BookingKub <span className="text-primary-400">{language === 'th' ? 'ศูนย์ช่วยเหลือ' : 'Help Center'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
                        >
                            <Globe size={14} />
                            {language === 'en' ? 'TH' : 'EN'}
                        </button>
                        <button
                            className="md:hidden p-2 text-slate-400 hover:text-white"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 lg:w-72 shrink-0`}>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 sticky top-24 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">
                            {language === 'th' ? 'เอกสารคู่มือ' : 'Documentation'}
                        </h3>
                        <nav className="space-y-1">
                            {topics?.map(topic => {
                                const isActive = activeTopicId === topic.id || currentTopic?.id === topic.id;
                                const Icon = iconMap[topic.iconName] || HelpCircle;
                                return (
                                    <button
                                        key={topic.id}
                                        onClick={() => { setActiveTopicId(topic.id); setMobileMenuOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                                    >
                                        <Icon size={18} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                                        {topic.title}
                                        {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
                                    </button>
                                );
                            })}
                            {(!topics || topics.length === 0) && (
                                <div className="px-3 py-2 text-slate-400 text-sm">No topics available</div>
                            )}
                        </nav>

                        <div className="mt-8 pt-6 border-t border-slate-100 px-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                {language === 'th' ? 'ต้องการความช่วยเหลือเพิ่มเติม?' : 'Still need help?'}
                            </h3>
                            <a href="/#contact" className="block w-full text-center py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors">
                                {language === 'th' ? 'ติดต่อทีมสนับสนุน' : 'Contact Support'}
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 max-w-4xl min-w-0">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm min-h-[600px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${currentTopic?.id}-${language}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {currentTopic ? (
                                    <ReactMarkdown components={MarkdownComponents}>
                                        {currentTopic.content}
                                    </ReactMarkdown>
                                ) : (
                                    <div className="text-slate-500 text-center py-20">
                                        <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p>Please add markdown files to docs/help/</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <footer className="border-t border-slate-200 bg-white py-8 mt-auto text-center text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} BookingKub. {language === 'th' ? 'สงวนลิขสิทธิ์' : 'All rights reserved.'}</p>
            </footer>
        </div>
    );
}


