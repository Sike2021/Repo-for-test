
import React from 'react';
import { motion } from 'motion/react';
import { GameData, Team, CareerScreen, Match } from '../types';
import { Icons } from './Icons';
import { SPONSOR_THRESHOLDS, TOURNAMENT_LOGOS } from '../data';
import { resolveMatch } from '../utils';

interface DashboardProps {
    gameData: GameData;
    userTeam: Team | null;
    setScreen: (screen: CareerScreen) => void;
    handlePlayMatch: () => void;
    handleForwardDay: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ gameData, userTeam, setScreen, handlePlayMatch, handleForwardDay }) => {
    const currentSchedule = gameData.schedule?.[gameData.currentFormat] || [];
    const matchIndex = gameData.currentMatchIndex?.[gameData.currentFormat] || 0;
    const sponsorship = gameData.sponsorships?.[gameData.currentFormat];
    const popularity = gameData.popularity || 0;

    if (!currentSchedule || matchIndex >= currentSchedule.length) {
        return (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center bg-[#050808] relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-at-t from-teal-500/5 to-transparent pointer-events-none" />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-white/[0.02] rounded-[40px] flex items-center justify-center mb-10 border border-white/10 backdrop-blur-3xl shadow-2xl relative z-10"
                >
                    <Icons.Trophy size={64} className="text-teal-500 drop-shadow-[0_0_20px_rgba(20,184,166,0.4)]" />
                </motion.div>
                <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white mb-4 relative z-10">SEASON_CONCLUDED</h2>
                <p className="text-[12px] font-mono font-black text-teal-500 uppercase tracking-[0.6em] relative z-10">FINALIZING_TOURNAMENT_METRICS...</p>
            </div>
        );
    }

    const nextMatch = resolveMatch(currentSchedule[matchIndex], gameData, gameData.currentFormat);

    const isUserMatch = userTeam ? (
        nextMatch.teamA.trim().toLowerCase() === userTeam.name.trim().toLowerCase() || 
        nextMatch.teamB.trim().toLowerCase() === userTeam.name.trim().toLowerCase()
    ) : false;
    
    const teamAData = gameData.allTeamsData.find(t => t.name === nextMatch.teamA);
    const teamBData = gameData.allTeamsData.find(t => t.name === nextMatch.teamB);
    const homeGround = teamAData ? gameData.grounds.find(g => g.code === teamAData.homeGround) : null;

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-4 py-4 md:px-6 md:py-8 border-b border-white/5 relative z-10">
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <h2 className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.4em] text-teal-500/60">
                        {sponsorship?.sponsorName || "SIKE'S"} {sponsorship?.tournamentName || "T20 CHAMPIONSHIP"} // SEASON {gameData.currentSeason}
                    </h2>
                    <h1 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">THE CAREER HUB</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide pb-10 relative z-10">
                {/* Team Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.03] border border-white/10 rounded-[24px] md:rounded-[32px] p-3.5 md:p-6 flex items-center gap-3.5 md:gap-5 backdrop-blur-xl"
                >
                    <div 
                        className="w-10 h-10 md:w-16 md:h-16 bg-white/5 rounded-lg md:rounded-2xl border border-white/10 flex items-center justify-center p-1.5 md:p-3 shadow-xl"
                        dangerouslySetInnerHTML={{ __html: userTeam?.logo || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` }}
                    />
                    <div className="flex-1">
                        <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none mb-0.5 md:mb-1">{userTeam?.name || 'N/A'}</h3>
                        <p className="text-[7px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">MANAGER: <span className="text-teal-500">SIKE G.</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-0.5 md:mb-1">PURSE</p>
                        <p className="text-base md:text-xl font-black italic text-teal-500 tracking-tighter leading-none">${userTeam?.purse.toFixed(2)}Cr</p>
                    </div>
                </motion.div>

                {/* Next Match Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.03] border border-white/10 rounded-[28px] md:rounded-[40px] p-5 md:p-8 relative overflow-hidden group shadow-2xl backdrop-blur-2xl"
                >
                    <div className="absolute top-0 right-0 bg-teal-500 text-black px-3 md:px-6 py-1 md:py-2 text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em] rounded-bl-lg md:rounded-bl-2xl shadow-xl z-10">
                        NEXT MATCH
                    </div>
                    
                    <div className="space-y-5 md:space-y-8 relative z-10">
                        <div className="flex items-center justify-between gap-3 md:gap-6">
                            <div className="flex flex-col items-center gap-1.5 md:gap-3">
                                <div 
                                    className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-lg md:rounded-xl border border-white/10 flex items-center justify-center p-1.5 md:p-3"
                                    dangerouslySetInnerHTML={{ __html: teamAData?.logo || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` }}
                                />
                                <span className="text-[7px] md:text-[10px] font-black uppercase text-white/40 tracking-widest">{nextMatch.teamA.substring(0, 3)}</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-sm md:text-lg font-black italic text-teal-500">VS</span>
                                <p className="text-[7px] md:text-[9px] font-mono text-white/20 uppercase tracking-[0.2em] mt-0.5 md:mt-1">{nextMatch.date}</p>
                            </div>
                            
                            <div className="flex flex-col items-center gap-1.5 md:gap-3">
                                <div 
                                    className="w-10 h-10 md:w-14 md:h-14 bg-white/5 rounded-lg md:rounded-xl border border-white/10 flex items-center justify-center p-1.5 md:p-3"
                                    dangerouslySetInnerHTML={{ __html: teamBData?.logo || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` }}
                                />
                                <span className="text-[7px] md:text-[10px] font-black uppercase text-white/40 tracking-widest">{nextMatch.teamB.substring(0, 3)}</span>
                            </div>
                        </div>

                        {isUserMatch ? (
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handlePlayMatch} 
                                className="w-full bg-teal-500 text-black font-black py-3.5 md:py-5 rounded-xl md:rounded-[24px] uppercase tracking-[0.3em] text-[9px] md:text-[11px] transition-all shadow-[0_20px_40px_rgba(20,184,166,0.2)] flex items-center justify-center gap-2 md:gap-3"
                            >
                                <Icons.PlayMatch size={14} md:size={18} />
                                PLAY MATCH
                            </motion.button>
                        ) : (
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleForwardDay} 
                                className="w-full bg-white text-black font-black py-3.5 md:py-5 rounded-xl md:rounded-[24px] uppercase tracking-[0.3em] text-[9px] md:text-[11px] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 md:gap-3"
                            >
                                <Icons.FastForward size={14} md:size={18} />
                                SIMULATE DAY
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            
                {/* Navigation Grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {[
                        { screen: 'NEWS', icon: <Icons.News size={16} />, label: 'NEWS', desc: 'MEDIA' },
                        { screen: 'LINEUPS', icon: <Icons.Lineups size={16} />, label: 'LINEUPS', desc: 'SQUAD' },
                        { screen: 'PLAYER_DATABASE', icon: <Icons.Database size={16} />, label: 'DATABASE', desc: 'INTEL' },
                        { screen: 'TRANSFERS', icon: <Icons.Transfers size={16} />, label: 'TRANSFERS', desc: 'MARKET' },
                        { screen: 'EDITOR', icon: <Icons.Settings size={16} />, label: 'EDITOR', desc: 'SYSTEM' },
                        { screen: 'STATS', icon: <Icons.Stats size={16} />, label: 'ANALYTICS', desc: 'DATA' },
                    ].map((item, idx) => (
                        <motion.button 
                            key={item.screen}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setScreen(item.screen as CareerScreen)}
                            className="p-3.5 md:p-6 bg-white/[0.02] border border-white/10 rounded-[20px] md:rounded-[32px] text-left transition-all group backdrop-blur-xl"
                        >
                            <div className="mb-2.5 md:mb-4 text-teal-500 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-white leading-none mb-0.5 md:mb-1">{item.label}</p>
                                <p className="text-[6px] md:text-[8px] font-black uppercase tracking-[0.3em] text-white/20">{item.desc}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-white/[0.02] border border-white/10 p-3.5 md:p-6 rounded-[20px] md:rounded-[32px] backdrop-blur-xl">
                        <p className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1.5 md:mb-3">POPULARITY</p>
                        <div className="flex items-end justify-between">
                            <span className="text-xl md:text-3xl font-black italic text-white leading-none">{popularity}%</span>
                            <div className="w-8 md:w-12 h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500" style={{ width: `${popularity}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/10 p-3.5 md:p-6 rounded-[20px] md:rounded-[32px] backdrop-blur-xl">
                        <p className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1.5 md:mb-3">RANKING</p>
                        <div className="flex items-end justify-between">
                            <span className="text-xl md:text-3xl font-black italic text-teal-500 leading-none">#01</span>
                            <span className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">ELITE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
