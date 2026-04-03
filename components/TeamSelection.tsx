
import React from 'react';
import { motion } from 'motion/react';
import { TEAMS } from '../data';
import { Trophy, Users, Star, ShieldCheck, Zap } from 'lucide-react';

interface TeamSelectionProps {
    onTeamSelected: (teamId: string) => void;
    theme: 'light' | 'dark';
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamSelected, theme }) => {
    const mainTeams = TEAMS.filter(t => !t.isYouthTeam);
    const devTeams = TEAMS.filter(t => t.isYouthTeam);

    return (
        <div className="h-full flex flex-col bg-[#050808] relative overflow-hidden font-sans text-[#E4E3E0]">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
            </div>

            {/* Header */}
            <div className="relative z-10 px-8 pt-16 pb-12 border-b border-white/5 backdrop-blur-xl bg-[#050808]/40">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-teal-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4"
                        >
                            <ShieldCheck size={14} />
                            FRANCHISE_ACQUISITION_PORTAL // v2.6
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.8] text-white"
                        >
                            SELECT YOUR<br/>
                            <span className="text-teal-500 font-light not-italic">LEGACY</span>
                        </motion.h1>
                    </div>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-8 text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]"
                    >
                        <div className="flex flex-col items-end">
                            <span className="text-white font-black">{TEAMS.length} FRANCHISES</span>
                            <span>AVAILABLE_FOR_TAKEOVER</span>
                        </div>
                        <div className="w-[1px] h-10 bg-white/10" />
                        <div className="flex flex-col items-end">
                            <span className="text-teal-500 font-black">SEASON 26</span>
                            <span>REGISTRATION_OPEN</span>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-hide relative z-10">
                <div className="max-w-7xl mx-auto space-y-20 pb-32">
                    {/* Main League */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white/90">
                                PRO LEAGUE DIVISION I
                            </h2>
                            <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent" />
                            <div className="flex items-center gap-3 text-[10px] font-black text-teal-500/40 uppercase tracking-[0.3em]">
                                <Star size={14} className="fill-current" />
                                ELITE_TIER_ACCESS
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mainTeams.map((team, idx) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -12 }}
                                    onClick={() => onTeamSelected(team.id)}
                                    className="group cursor-pointer relative"
                                >
                                    <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[48px] blur-2xl" />
                                    
                                    <div className="relative bg-white/[0.03] border border-white/10 p-10 rounded-[48px] backdrop-blur-2xl hover:bg-white/[0.05] hover:border-teal-500/40 transition-all duration-500 overflow-hidden shadow-2xl h-full flex flex-col items-center text-center">
                                        <div className="absolute -right-12 -bottom-12 text-white/[0.02] text-[200px] font-black italic select-none group-hover:text-teal-500/[0.05] transition-colors duration-700 leading-none">
                                            {team.name.charAt(0)}
                                        </div>

                                        <div className="relative z-10 mb-8">
                                            <div className="w-32 h-32 bg-black/60 rounded-[32px] flex items-center justify-center border border-white/5 group-hover:border-teal-500/30 transition-all duration-700 shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden group-hover:rotate-3">
                                                <div className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-700" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4 group-hover:text-teal-400 transition-colors duration-500 leading-none">
                                            {team.name}
                                        </h3>
                                        
                                        <div className="flex items-center gap-4 mt-auto opacity-40 group-hover:opacity-100 transition-all duration-500">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-500">
                                                <Users size={14} />
                                                SQUAD_READY
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40">
                                                EST_2026
                                            </div>
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="w-full bg-teal-500 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(20,184,166,0.3)]">
                                                INITIALIZE_CONTRACT
                                                <Zap size={14} fill="currentColor" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Academy Teams */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white/90">
                                DEV ACADEMY TALENT
                            </h2>
                            <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent" />
                            <div className="flex items-center gap-3 text-[10px] font-black text-blue-500/40 uppercase tracking-[0.3em]">
                                <Zap size={14} className="fill-current" />
                                EMERGING_TALENT_POOL
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {devTeams.map((team, idx) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 + 0.5 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    onClick={() => onTeamSelected(team.id)}
                                    className="group cursor-pointer relative bg-white/[0.03] border border-white/10 p-8 rounded-[32px] backdrop-blur-xl hover:bg-white/[0.05] hover:border-blue-500/40 transition-all duration-500 overflow-hidden flex flex-col items-center text-center"
                                >
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-black/40 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-blue-500/30 transition-all duration-500 overflow-hidden shadow-xl">
                                            <div className="w-12 h-12 object-contain grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" dangerouslySetInnerHTML={{ __html: team.logo }}></div>
                                        </div>
                                        <h3 className="text-sm font-black italic uppercase tracking-tighter text-white/40 group-hover:text-white transition-colors duration-500">
                                            {team.name}
                                        </h3>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-[#050808] to-transparent pointer-events-none z-20">
                <div className="max-w-7xl mx-auto flex justify-between items-center opacity-20">
                    <div className="text-[9px] font-mono font-black text-white uppercase tracking-[0.5em]">
                        SECURE_ENCRYPTION_ACTIVE // END_TO_END_TUNNEL
                    </div>
                    <div className="text-[9px] font-mono font-black text-white uppercase tracking-[0.5em]">
                        SYSTEM_READY_FOR_INPUT // v2.6.0_STABLE
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSelection;
