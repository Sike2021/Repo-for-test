
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
    handleSimulateWithPlay: () => void;
    handleForwardDay: () => void;
    handleQuickSimulate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ gameData, userTeam, setScreen, handlePlayMatch, handleSimulateWithPlay, handleForwardDay, handleQuickSimulate }) => {
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
                    <Icons.Trophy className="w-12 h-12 md:w-16 md:h-16 text-teal-500 drop-shadow-[0_0_20px_rgba(20,184,166,0.4)]" />
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
    const userTeamData = gameData.allTeamsData.find(t => t.id === userTeam?.id);
    const homeGround = teamAData ? gameData.grounds.find(g => g.code === teamAData.homeGround) : null;

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-4 py-3 md:px-6 md:py-5 border-b border-white/5 relative z-10">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-teal-500/60">
                        {sponsorship?.sponsorName || "SIKE'S"} {sponsorship?.tournamentName || "T20 CHAMPIONSHIP"} // SEASON {gameData.currentSeason}
                    </h2>
                    <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">THE CAREER HUB</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5 scrollbar-hide pb-8 relative z-10">
                {/* Team Profile Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-5 flex items-center gap-4 md:gap-5 backdrop-blur-xl"
                >
                    <div 
                        className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 flex items-center justify-center p-2 md:p-3 shadow-xl"
                        dangerouslySetInnerHTML={{ __html: userTeamData?.logo || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` }}
                    />
                    <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">{userTeam?.name || 'N/A'}</h3>
                        <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">MANAGER: <span className="text-teal-500">SIKE G.</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">PURSE</p>
                        <p className="text-lg md:text-xl font-black italic text-teal-500 tracking-tighter leading-none">${userTeam?.purse.toFixed(2)}Cr</p>
                    </div>
                </motion.div>

                {/* Next Match Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/[0.03] border border-white/10 rounded-[30px] md:rounded-[40px] p-5 md:p-6 relative overflow-hidden group shadow-2xl backdrop-blur-2xl"
                >
                    <div className="absolute top-0 right-0 bg-teal-500 text-black px-4 md:px-5 py-1 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] rounded-bl-2xl md:rounded-bl-3xl shadow-xl z-10">
                        NEXT MATCH
                    </div>
                    
                    <div className="space-y-3 md:space-y-4 relative z-10">
                        <div className="flex items-center justify-between gap-2 md:gap-3">
                            <div className="flex flex-col items-center gap-1 md:gap-1.5">
                                <div 
                                    className="w-7 h-7 md:w-9 md:h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center p-1 md:p-1.5"
                                    dangerouslySetInnerHTML={{ __html: teamAData?.logo || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` }}
                                />
                                <span className="text-[5px] md:text-[7px] font-black uppercase text-white/40 tracking-widest">{nextMatch.teamA.substring(0, 3)}</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] md:text-xs font-black italic text-teal-500">VS</span>
                                <p className="text-[5px] md:text-[7px] font-mono text-white/20 uppercase tracking-[0.2em] mt-0.5">{nextMatch.date}</p>
                            </div>
                            
                            <div className="flex flex-col items-center gap-1 md:gap-1.5">
                                <div 
                                    className="w-7 h-7 md:w-9 md:h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center p-1 md:p-1.5"
                                    dangerouslySetInnerHTML={{ __html: teamBData?.logo || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` }}
                                />
                                <span className="text-[5px] md:text-[7px] font-black uppercase text-white/40 tracking-widest">{nextMatch.teamB.substring(0, 3)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            {isUserMatch ? (
                                <>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePlayMatch} 
                                        className="w-full bg-teal-500 text-black font-black py-2 md:py-2.5 rounded-lg uppercase tracking-[0.3em] text-[6px] md:text-[8px] transition-all shadow-[0_10px_30px_rgba(20,184,166,0.2)] flex items-center justify-center gap-2"
                                    >
                                        <Icons.PlayMatch className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                        PLAY MATCH
                                    </motion.button>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSimulateWithPlay} 
                                        className="w-full bg-white/5 border border-white/10 text-white font-black py-2 md:py-2.5 rounded-lg uppercase tracking-[0.3em] text-[6px] md:text-[8px] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Icons.FastForward className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                        SIMULATE WITH PLAY
                                    </motion.button>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleQuickSimulate} 
                                            className="bg-white/5 border border-white/10 text-white/60 font-black py-1.5 rounded-lg uppercase tracking-[0.3em] text-[5px] md:text-[6px] transition-all flex items-center justify-center gap-1.5 hover:text-white"
                                        >
                                            <Icons.Zap className="w-2 h-2 md:w-2.5 md:h-2.5" />
                                            QUICK SIM
                                        </motion.button>
                                        <motion.button 
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleForwardDay} 
                                            className="bg-white/5 border border-white/10 text-white/40 font-black py-1.5 rounded-lg uppercase tracking-[0.3em] text-[5px] md:text-[6px] transition-all flex items-center justify-center gap-1.5 hover:text-white"
                                        >
                                            <Icons.FastForward className="w-2 h-2 md:w-2.5 md:h-2.5" />
                                            SKIP DAY
                                        </motion.button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePlayMatch} 
                                        className="w-full bg-teal-500 text-black font-black py-2 md:py-2.5 rounded-lg uppercase tracking-[0.3em] text-[6px] md:text-[8px] transition-all shadow-[0_10px_30px_rgba(20,184,166,0.2)] flex items-center justify-center gap-2"
                                    >
                                        <Icons.FastForward className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                        SIMULATE MATCH
                                    </motion.button>
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleForwardDay} 
                                        className="w-full bg-white/5 border border-white/10 text-white/40 font-black py-1.5 rounded-lg uppercase tracking-[0.3em] text-[5px] md:text-[6px] transition-all flex items-center justify-center gap-1.5 hover:text-white"
                                    >
                                        SKIP TO NEXT DAY
                                    </motion.button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            
                {/* Navigation Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {[
                        { screen: 'NEWS', icon: <Icons.News className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: 'NEWS', desc: 'MEDIA' },
                        { screen: 'LINEUPS', icon: <Icons.Lineups className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: 'LINEUPS', desc: 'SQUAD' },
                        { screen: 'GALLERY', icon: <Icons.Layout className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: 'GALLERY', desc: 'ELITE' },
                        { screen: 'TRANSFERS', icon: <Icons.Transfers className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: 'TRANSFERS', desc: 'MARKET' },
                        { screen: 'CUSTOMIZATION', icon: <Icons.Settings className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: 'CUSTOMIZE', desc: 'SQUAD' },
                        { screen: 'STATS', icon: <Icons.Stats className="w-3.5 h-3.5 md:w-4 md:h-4" />, label: 'ANALYTICS', desc: 'DATA' },
                    ].map((item, idx) => (
                        <motion.button 
                            key={item.screen}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + idx * 0.05 }}
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setScreen(item.screen as CareerScreen)}
                            className="p-3 md:p-4 bg-white/[0.02] border border-white/10 rounded-[16px] md:rounded-[24px] text-left transition-all group backdrop-blur-xl"
                        >
                            <div className="mb-2 md:mb-3 text-teal-500 group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white leading-none mb-0.5">{item.label}</p>
                                <p className="text-[5px] md:text-[7px] font-black uppercase tracking-[0.3em] text-white/20">{item.desc}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="bg-white/[0.02] border border-white/10 p-3 md:p-4 rounded-[16px] md:rounded-[24px] backdrop-blur-xl">
                        <p className="text-[6px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 md:mb-2">POPULARITY</p>
                        <div className="flex items-end justify-between">
                            <span className="text-lg md:text-xl font-black italic text-white leading-none">{popularity}%</span>
                            <div className="w-8 md:w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500" style={{ width: `${popularity}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/10 p-3 md:p-4 rounded-[16px] md:rounded-[24px] backdrop-blur-xl">
                        <p className="text-[6px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 md:mb-2">RANKING</p>
                        <div className="flex items-end justify-between">
                            <span className="text-lg md:text-xl font-black italic text-teal-500 leading-none">#01</span>
                            <span className="text-[6px] md:text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">ELITE</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
