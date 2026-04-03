
import React from 'react';
import { motion } from 'motion/react';
import { NewsArticle } from '../types';
import { Icons } from './Icons';

interface NewsProps {
    news: NewsArticle[];
}

const News: React.FC<NewsProps> = ({ news }) => (
    <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
        </div>

        <header className="px-10 py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                <Icons.News className="w-64 h-64" />
            </div>

            <div className="flex justify-between items-start relative z-10">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="w-2 h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">NEWS_FEED</h2>
                    </motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5"
                    >
                        GLOBAL_LEAGUE_INTEL
                    </motion.p>
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide relative z-10">
            {news.map((article, index) => (
                <motion.div 
                    key={article.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.04)' }}
                    className="bg-white/[0.02] border border-white/10 p-8 rounded-[48px] shadow-2xl backdrop-blur-xl group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-[0.01] pointer-events-none group-hover:opacity-[0.03] transition-opacity">
                        <Icons.News className="w-32 h-32" />
                    </div>

                    <div className="flex justify-between items-start mb-6 relative z-10">
                         <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-tight group-hover:text-teal-500 transition-colors">{article.headline}</h3>
                         <div className="flex flex-col items-end gap-2">
                             <span className="text-[9px] bg-white/5 border border-white/10 px-4 py-1 rounded-full font-black uppercase tracking-widest text-white/40 whitespace-nowrap ml-4">{article.date}</span>
                             <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                         </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-white/60 leading-relaxed font-medium" dangerouslySetInnerHTML={{__html: article.content}}></p>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                                <Icons.Activity size={14} className="text-teal-500" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">VERIFIED_SOURCE</span>
                        </div>
                        <Icons.ArrowRight size={18} className="text-teal-500" />
                    </div>
                </motion.div>
            ))}
            {news.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-white/20">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-32 h-32 bg-white/[0.02] rounded-[40px] flex items-center justify-center mb-10 border border-white/10 backdrop-blur-3xl shadow-2xl"
                    >
                        <Icons.News size={64} className="text-white/10" />
                    </motion.div>
                    <p className="font-black text-[11px] uppercase tracking-[0.5em]">NO_INTEL_AVAILABLE_AT_THIS_TIME</p>
                </div>
            )}
        </div>

        {/* Bottom Info Bar */}
        <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-20 backdrop-blur-3xl">
            <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">LIVE_NEWS_FEED_STABLE // DATA_SYNC_COMPLETE</p>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">ENCRYPTION_STATUS</p>
                <p className="text-[11px] font-black text-teal-500 uppercase tracking-widest">SECURE_CONNECTION_VERIFIED</p>
            </div>
        </div>
    </div>
);

export default News;
