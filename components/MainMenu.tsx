
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Play, RotateCcw, Trophy, Users, Settings, BarChart3, Image as ImageIcon } from 'lucide-react';

interface MainMenuProps {
    onStartNewGame: () => void;
    onResumeGame: () => void;
    onOpenEditor: () => void;
    onOpenGallery: () => void;
    hasSaveData: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartNewGame, onResumeGame, onOpenEditor, onOpenGallery, hasSaveData }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-4 md:p-10 bg-[#050808] relative overflow-hidden font-sans text-[#E4E3E0]">
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
                    <div className="absolute top-1/4 -left-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] border-[1px] border-teal-500/20 rotate-12 rounded-[60px] md:rounded-[100px]" />
                    <div className="absolute bottom-1/4 -right-20 w-[300px] md:w-[500px] h-[300px] md:h-[500px] border-[1px] border-white/5 -rotate-12 rounded-[60px] md:rounded-[100px]" />
                </div>
            </div>

            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
                {/* Logo Section */}
                <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8 md:mb-24 text-center"
                >
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 md:gap-4 bg-white/[0.03] text-teal-500 px-4 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[14px] font-black uppercase tracking-[0.5em] mb-6 md:mb-12 border border-white/10 backdrop-blur-xl shadow-2xl"
                    >
                        <Trophy className="fill-current w-3 h-3 md:w-5 md:h-5" />
                        SIKE'S_MANAGEMENT_v2.6
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-[11rem] font-black italic uppercase tracking-tighter leading-[0.8] text-white font-display mb-4 md:mb-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        CRICKET<br/>
                        <span className="text-teal-500 font-light not-italic">MANAGER</span>
                    </h1>
                    
                    <div className="flex items-center justify-center gap-4 md:gap-12 mt-2 md:mt-6">
                        <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-white/10" />
                        <span className="text-4xl md:text-9xl font-black italic text-white/10 font-display tracking-[0.2em] drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">26</span>
                        <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                </motion.div>

                {/* Main Actions */}
                <div className="w-full space-y-5 md:space-y-8 mb-8 md:mb-24">
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
                                className="w-full group relative overflow-hidden bg-teal-500 text-black py-6 md:py-12 px-6 md:px-15 rounded-[24px] md:rounded-[48px] font-black italic tracking-tighter text-2xl md:text-5xl uppercase transition-all shadow-[0_30px_60px_rgba(20,184,166,0.3)]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-4 md:gap-8">
                                        <div className="w-11 h-11 md:w-20 md:h-20 bg-black/10 rounded-xl md:rounded-3xl flex items-center justify-center shadow-inner">
                                            <Play className="w-6 h-6 md:w-9 md:h-9" fill="currentColor" />
                                        </div>
                                        <span>CONTINUE_CAREER</span>
                                    </div>
                                    <div className="text-[10px] md:text-[15px] font-mono font-black opacity-40 tracking-[0.3em] hidden sm:block">LOAD_LATEST</div>
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
                        className="w-full group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] text-white py-6 md:py-12 px-6 md:px-15 rounded-[24px] md:rounded-[48px] font-black italic tracking-tighter text-2xl md:text-5xl uppercase transition-all border border-white/10 backdrop-blur-2xl hover:border-teal-500/40 shadow-2xl"
                    >
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4 md:gap-8">
                                <div className="w-11 h-11 md:w-20 md:h-20 bg-white/5 rounded-xl md:rounded-3xl flex items-center justify-center text-teal-500 group-hover:rotate-12 transition-transform duration-500">
                                    <RotateCcw className="w-6 h-6 md:w-9 md:h-9" />
                                </div>
                                <span>{hasSaveData ? "NEW_LEGACY" : "START_LEGACY"}</span>
                            </div>
                            <div className="text-[10px] md:text-[15px] font-mono font-black opacity-20 tracking-[0.3em] hidden sm:block">FRESH_START</div>
                        </div>
                    </motion.button>

                    <div className="grid grid-cols-2 gap-5 md:gap-8">
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onOpenGallery}
                            className="group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] text-white py-5 md:py-10 px-6 md:px-12 rounded-[24px] md:rounded-[48px] font-black italic tracking-tighter text-xl md:text-3xl uppercase transition-all border border-white/10 backdrop-blur-2xl hover:border-teal-500/40 shadow-xl"
                        >
                            <div className="flex flex-col items-start gap-2 md:gap-6">
                                <ImageIcon className="text-teal-500 group-hover:scale-110 transition-transform duration-500 w-6 h-6 md:w-8 md:h-8" />
                                <span>ELITE_GALLERY</span>
                            </div>
                        </motion.button>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onOpenEditor}
                            className="group relative overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] text-white py-5 md:py-10 px-6 md:px-12 rounded-[24px] md:rounded-[48px] font-black italic tracking-tighter text-xl md:text-3xl uppercase transition-all border border-white/10 backdrop-blur-2xl hover:border-teal-500/40 shadow-xl"
                        >
                            <div className="flex flex-col items-start gap-2 md:gap-6">
                                <Database className="text-teal-500 group-hover:scale-110 transition-transform duration-500 w-6 h-6 md:w-8 md:h-8" />
                                <span>DATA_EDITOR</span>
                            </div>
                        </motion.button>
                    </div>
                </div>

                {/* Footer Info */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-3 md:gap-10 text-[7px] md:text-[10px] font-mono font-black opacity-20 uppercase tracking-[0.4em]"
                >
                    <div className="flex items-center gap-1.5 md:gap-3">
                        <div className="w-1 md:w-2 h-1 md:h-2 rounded-full bg-teal-500 animate-pulse" />
                        SERVER_ONLINE
                    </div>
                    <div className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
                    <div>BUILD_V2.6.0</div>
                    <div className="hidden md:block w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5 md:gap-3">
                        <Users className="w-2 h-2 md:w-2.5 md:h-2.5" />
                        1.2M_ACTIVE
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default MainMenu;
