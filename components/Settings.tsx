
import React from 'react';
import { motion } from 'motion/react';
import { Icons } from './Icons';

interface SettingsProps {
    onResetGame: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    saveGame: () => void;
    loadGame: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onResetGame, theme, setTheme, saveGame, loadGame }) => (
    <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
        {/* Background Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
        </div>

        <header className="px-3 py-4 md:px-10 md:py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
            <div className="absolute top-0 right-0 p-4 md:p-12 opacity-[0.02] pointer-events-none">
                <Icons.Settings className="w-16 h-16 md:w-64 md:h-64" />
            </div>

            <div className="relative z-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-2"
                >
                    <div className="w-1 md:w-2 h-4 md:h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                    <h2 className="text-lg md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">SYSTEM_SETTINGS</h2>
                </motion.div>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[6px] md:text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-3 md:ml-5"
                >
                    CORE_CONFIGURATION_v2.6
                </motion.p>
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-2 md:p-10 scrollbar-hide relative z-10 pb-10">
            <div className="max-w-2xl mx-auto space-y-2 md:space-y-8">
                {/* Theme Selection */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/10 p-3 md:p-8 rounded-[16px] md:rounded-[40px] backdrop-blur-xl"
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-8">
                        <div>
                            <h3 className="text-sm md:text-xl font-black italic uppercase tracking-tighter text-white">VISUAL_INTERFACE</h3>
                            <p className="text-[6px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mt-0 md:mt-1">THEME_SELECTION</p>
                        </div>
                        <div className="flex bg-white/[0.03] p-1 md:p-1.5 rounded-lg md:rounded-[24px] border border-white/10 w-full md:w-auto">
                            <button 
                                onClick={() => setTheme('light')} 
                                className={`flex-1 md:flex-none px-2 md:px-8 py-1 md:py-3 rounded-md md:rounded-[18px] text-[6px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${theme === 'light' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                LIGHT
                            </button>
                            <button 
                                onClick={() => setTheme('dark')} 
                                className={`flex-1 md:flex-none px-2 md:px-8 py-1 md:py-3 rounded-md md:rounded-[18px] text-[6px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${theme === 'dark' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                DARK
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Data Management */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.02] border border-white/10 p-3 md:p-8 rounded-[16px] md:rounded-[40px] backdrop-blur-xl space-y-1.5 md:space-y-4"
                >
                    <h3 className="text-sm md:text-xl font-black italic uppercase tracking-tighter text-white mb-2 md:mb-6">DATA_MANAGEMENT</h3>
                    
                    <button 
                        onClick={saveGame} 
                        className="w-full bg-teal-500 text-black py-2.5 md:py-6 rounded-lg md:rounded-[24px] font-black italic text-xs md:text-xl uppercase tracking-tighter hover:bg-white transition-all flex items-center justify-center gap-2 md:gap-4 shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                    >
                        <Icons.Save className="w-3 h-3 md:w-5 md:h-5" />
                        SAVE_CURRENT_STATE
                    </button>
                    
                    <button 
                        onClick={loadGame} 
                        className="w-full bg-white/5 border border-white/10 text-white py-2.5 md:py-6 rounded-lg md:rounded-[24px] font-black italic text-xs md:text-xl uppercase tracking-tighter hover:bg-white/10 transition-all flex items-center justify-center gap-2 md:gap-4"
                    >
                        <Icons.Download className="w-3 h-3 md:w-5 md:h-5" />
                        LOAD_PREVIOUS_STATE
                    </button>
                </motion.div>

                {/* Danger Zone */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-red-500/[0.02] border border-red-500/10 p-3 md:p-8 rounded-[16px] md:rounded-[40px] backdrop-blur-xl"
                >
                    <h3 className="text-sm md:text-xl font-black italic uppercase tracking-tighter text-red-500 mb-2 md:mb-6">DANGER_ZONE</h3>
                    <button 
                        onClick={onResetGame} 
                        className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-2.5 md:py-6 rounded-lg md:rounded-[24px] font-black italic text-xs md:text-xl uppercase tracking-tighter hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 md:gap-4"
                    >
                        <Icons.Trash2 className="w-3 h-3 md:w-5 md:h-5" />
                        ERASE_ALL_PROGRESS
                    </button>
                    <p className="text-[5px] md:text-[9px] font-black text-red-500/40 uppercase tracking-widest text-center mt-2 md:mt-6 italic leading-relaxed">
                        WARNING: THIS_ACTION_IS_IRREVERSIBLE
                    </p>
                </motion.div>
            </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="px-3 py-2 md:px-10 md:py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-20 backdrop-blur-3xl">
            <div className="flex items-center gap-2 md:gap-4">
                <div className="w-1 h-1 md:w-3 md:h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                <p className="text-[5px] md:text-[10px] font-black uppercase tracking-widest text-white/40">SYSTEM_CORE_ONLINE</p>
            </div>
            <div className="text-right">
                <p className="text-[5px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-0 md:mb-1">ENCRYPTION_STATUS</p>
                <p className="text-[7px] md:text-[11px] font-black text-teal-500 uppercase tracking-widest">AES_256_ACTIVE</p>
            </div>
        </div>
    </div>
);

export default Settings;
