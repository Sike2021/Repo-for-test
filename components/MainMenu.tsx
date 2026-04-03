
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Play, RotateCcw, Trophy, Users, Settings, BarChart3 } from 'lucide-react';

interface MainMenuProps {
    onStartNewGame: () => void;
    onResumeGame: () => void;
    onOpenEditor: () => void;
    hasSaveData: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartNewGame, onResumeGame, onOpenEditor, hasSaveData }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 md:p-10 bg-[#050808] relative overflow-hidden font-sans text-[#E4E3E0]">
            {/* Dynamic Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0],
                        opacity: [0.05, 0.1, 0.05]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.15)_0%,transparent_70%)]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] opacity-50" />
                
                {/* Geometric Accents */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] border-[1px] border-teal-500/20 rotate-12 rounded-[100px]" />
                    <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] border-[1px] border-white/5 -rotate-12 rounded-[100px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[1px] border-white/[0.02] rounded-full" />
                </div>
            </div>

            <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
                {/* Logo Section */}
                <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16 text-center"
                >
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-3 bg-white/[0.03] text-teal-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-8 border border-white/10 backdrop-blur-xl shadow-2xl"
                    >
                        <Trophy size={14} className="fill-current" />
                        SIKE'S_MANAGEMENT_SYSTEM_v2.6
                    </motion.div>
                    
                    <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.8] text-white font-display mb-6 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        CRICKET<br/>
                        <span className="text-teal-500 font-light not-italic">MANAGER</span>
                    </h1>
                    
                    <div className="flex items-center justify-center gap-8 mt-4">
                        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-5xl md:text-7xl font-black italic text-white/10 font-display tracking-[0.2em] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">26</span>
                        <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                </motion.div>

                {/* Main Actions */}
                <div className="w-full space-y-6 mb-16">
                    <AnimatePresence mode="wait">
                        {hasSaveData ? (
                            <motion.button
                                key="resume"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onResumeGame}
                                className="w-full group relative overflow-hidden bg-teal-500 text-black py-8 px-10 rounded-[32px] font-black italic tracking-tighter text-3xl md:text-4xl uppercase transition-all shadow-[0_30px_60px_rgba(20,184,166,0.3)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center shadow-inner">
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                        <span>CONTINUE_CAREER</span>
                                    </div>
                                    <div className="text-[11px] font-mono font-black opacity-40 tracking-[0.3em]">LOAD_LATEST</div>
                                </div>
                            </motion.button>
                        ) : null}
                    </AnimatePresence>
                    
                    <motion.button
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartNewGame}
                        className="w-full group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] text-white py-8 px-10 rounded-[32px] font-black italic tracking-tighter text-3xl md:text-4xl uppercase transition-all border border-white/10 backdrop-blur-2xl hover:border-teal-500/40 shadow-2xl"
                    >
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-teal-500 group-hover:rotate-12 transition-transform duration-500">
                                    <RotateCcw size={32} />
                                </div>
                                <span>{hasSaveData ? "NEW_LEGACY" : "START_LEGACY"}</span>
                            </div>
                            <div className="text-[11px] font-mono font-black opacity-20 tracking-[0.3em]">FRESH_START</div>
                        </div>
                    </motion.button>

                    <div className="grid grid-cols-2 gap-6">
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onOpenEditor}
                            className="group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] text-white py-7 px-8 rounded-[32px] font-black italic tracking-tighter text-xl uppercase transition-all border border-white/10 backdrop-blur-2xl hover:border-teal-500/40 shadow-xl"
                        >
                            <div className="flex flex-col items-start gap-4">
                                <Database size={24} className="text-teal-500 group-hover:scale-110 transition-transform duration-500" />
                                <span>DATA_EDITOR</span>
                            </div>
                        </motion.button>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="group relative overflow-hidden bg-white/[0.02] text-white/20 py-7 px-8 rounded-[32px] font-black italic tracking-tighter text-xl uppercase transition-all border border-white/5 backdrop-blur-xl cursor-not-allowed"
                        >
                            <div className="flex flex-col items-start gap-4">
                                <Settings size={24} className="text-white/10" />
                                <span>SETTINGS</span>
                            </div>
                        </motion.button>
                    </div>
                </div>

                {/* Footer Info */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-10 text-[10px] font-mono font-black opacity-20 uppercase tracking-[0.4em]"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        SERVER_ONLINE
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div>BUILD_V2.6.0_STABLE</div>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-3">
                        <Users size={12} />
                        1.2M_ACTIVE
                    </div>
                </motion.div>
            </div>

            {/* Bottom Corner Stats Decor */}
            <div className="absolute bottom-12 left-12 hidden lg:block opacity-10">
                <div className="flex items-center gap-6">
                    <BarChart3 size={48} className="text-teal-500" />
                    <div className="font-mono text-[11px] leading-relaxed tracking-widest">
                        <div className="text-white font-black uppercase">MARKET_VOLATILITY: +12.4%</div>
                        <div className="text-teal-500 uppercase">PLAYER_LIQUIDITY: HIGH</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainMenu;
