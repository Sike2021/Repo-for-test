
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_70%)]" />
            </div>

            <header className="px-10 py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <Icons.Layout className="w-64 h-64" />
                </div>

                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="w-2 h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">COMMAND_CENTER</h2>
                        </motion.div>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5"
                        >
                            OPERATIONAL_HUB_v2.6
                        </motion.p>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-right"
                    >
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">FRANCHISE_IDENTITY</p>
                        <p className="text-xl font-black italic uppercase tracking-tighter text-teal-500 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]">{userTeam?.name || 'N/A'}</p>
                    </motion.div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide pb-32 relative z-10">
                {/* Tournament Info */}
                <section className="space-y-6">
                    <div className="flex items-center gap-6">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">ACTIVE_TOURNAMENT</h3>
                        <div className="h-[1px] bg-white/5 flex-1"></div>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/[0.02] border border-white/10 p-10 rounded-[48px] relative overflow-hidden group shadow-2xl backdrop-blur-xl"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-700">
                            <Icons.Trophy className="w-48 h-48" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-6 mb-4">
                                {sponsorship?.tournamentLogo && (
                                    <div 
                                        className={`w-16 h-16 ${sponsorship.logoColor || 'text-teal-400'} drop-shadow-[0_0_12px_rgba(20,184,166,0.4)]`}
                                        dangerouslySetInnerHTML={{ __html: sponsorship.tournamentLogo }}
                                    />
                                )}
                                {sponsorship ? (
                                    <h1 className={`text-6xl font-black italic uppercase tracking-tighter leading-none ${sponsorship.logoColor || 'text-white'}`}>
                                        {sponsorship.sponsorName} <span className="text-teal-500 font-light not-italic">{sponsorship.tournamentName}</span>
                                    </h1>
                                ) : (
                                    <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none text-white">{gameData.currentFormat}</h1>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">SEASON_0{gameData.currentSeason} // {nextMatch.group.replace('-', '_').toUpperCase()}_PHASE</p>
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                                <p className="text-[11px] font-black text-teal-500 uppercase tracking-[0.4em]">LIVE_COVERAGE</p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Next Match Card */}
                <section className="space-y-6">
                    <div className="flex items-center gap-6">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">UPCOMING_ENGAGEMENT</h3>
                        <div className="h-[1px] bg-white/5 flex-1"></div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.03] border border-white/10 rounded-[56px] p-12 relative overflow-hidden group shadow-2xl backdrop-blur-2xl"
                    >
                        <div className="absolute top-0 right-0 bg-teal-500 text-black px-10 py-3 text-[11px] font-black uppercase tracking-[0.4em] rounded-bl-[32px] shadow-xl z-10">
                            NEXT_MATCH
                        </div>
                        
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none group-hover:bg-teal-500/10 transition-colors duration-700" />
                        
                        <div className="space-y-12 relative z-10">
                            <div className="flex items-center justify-between gap-12">
                                <div className="flex-1 flex flex-col items-start">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">HOME_SIDE</p>
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-3 group-hover:border-teal-500/30 transition-all duration-500"
                                            dangerouslySetInnerHTML={{ __html: teamAData?.logo || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` }}
                                        />
                                        <h3 className="text-5xl font-black uppercase tracking-tighter italic text-white leading-none group-hover:text-teal-500 transition-colors duration-500">{nextMatch.teamA}</h3>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10 rotate-45 group-hover:rotate-0 transition-all duration-700 shadow-inner relative">
                                        <div className="absolute inset-0 bg-teal-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <span className="text-xl font-black italic text-teal-500 -rotate-45 group-hover:rotate-0 transition-all duration-700 relative z-10">VS</span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-col items-end text-right">
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">AWAY_SIDE</p>
                                    <div className="flex items-center gap-4 flex-row-reverse">
                                        <div 
                                            className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-3 group-hover:border-teal-500/30 transition-all duration-500"
                                            dangerouslySetInnerHTML={{ __html: teamBData?.logo || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-8 h-8 opacity-20"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>` }}
                                        />
                                        <h3 className="text-5xl font-black uppercase tracking-tighter italic text-white leading-none group-hover:text-teal-500 transition-colors duration-500">{nextMatch.teamB}</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 border-t border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-teal-500/30 transition-colors">
                                        <Icons.Stadium size={24} className="text-teal-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-widest text-white/80 mb-1">{homeGround?.name || 'Neutral Venue'}</p>
                                        <p className="text-[11px] font-mono text-white/30 uppercase tracking-[0.3em]">{nextMatch.date}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    {[1, 2, 3].map(i => <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i === 1 ? 'bg-teal-500 w-6' : 'bg-white/10'}`} />)}
                                </div>
                            </div>

                            {isUserMatch ? (
                                <motion.button 
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePlayMatch} 
                                    className="w-full bg-teal-500 text-black font-black py-8 px-10 rounded-[32px] uppercase tracking-[0.4em] text-sm transition-all duration-500 flex items-center justify-center space-x-6 shadow-[0_30px_60px_rgba(20,184,166,0.25)] group/btn relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                    <Icons.PlayMatch className="group-hover/btn:scale-125 transition-transform duration-500" />
                                    <span className="relative z-10">INITIALIZE_MATCH_SEQUENCE</span>
                                </motion.button>
                            ) : (
                                <motion.button 
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleForwardDay} 
                                    className="w-full bg-white text-black font-black py-8 px-10 rounded-[32px] uppercase tracking-[0.4em] text-sm transition-all duration-500 flex items-center justify-center space-x-6 shadow-[0_30px_60px_rgba(255,255,255,0.1)] group/btn relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/5 to-black/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                    <Icons.FastForward className="group-hover/btn:scale-125 transition-transform duration-500" />
                                    <span className="relative z-10">SIMULATE_CHRONOLOGY</span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </section>
            
                {/* Stats Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-white/[0.02] border border-white/10 p-10 rounded-[48px] flex flex-col justify-between h-56 relative overflow-hidden group backdrop-blur-xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                            <Icons.Fans size={80} />
                        </div>
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">POPULARITY_INDEX</p>
                        <div className="space-y-6">
                            <div className="flex items-end justify-between">
                                <span className="text-6xl font-black italic font-mono text-white leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{popularity}%</span>
                                <span className="text-[11px] font-black text-teal-500 uppercase tracking-[0.3em]">GLOBAL_RANKING</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${popularity}%` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-teal-600 via-teal-400 to-teal-300 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.4)]"
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="bg-white/[0.02] border border-white/10 p-10 rounded-[48px] flex flex-col justify-between h-56 relative overflow-hidden group backdrop-blur-xl"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                            <Icons.Trophy size={80} />
                        </div>
                        <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">LEGACY_STATUS</p>
                        <div className="space-y-2">
                            <p className="text-6xl font-black italic text-teal-500 uppercase tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                                {popularity >= 80 ? 'ELITE' : popularity >= 50 ? 'PRO' : 'ROOKIE'}
                            </p>
                            <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">TIER_LEVEL_0{popularity >= 80 ? '3' : popularity >= 50 ? '2' : '1'}</p>
                        </div>
                    </motion.div>
                </section>

                {/* Navigation Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { screen: 'LINEUPS', icon: <Icons.Lineups size={24} />, label: 'LINEUPS', desc: 'SQUAD_MGMT' },
                        { screen: 'TRANSFERS', icon: <Icons.Transfers size={24} />, label: 'TRANSFERS', desc: 'MARKET_HUB' },
                        { screen: 'PLAYER_DATABASE', icon: <Icons.Database size={24} />, label: 'DATABASE', desc: 'GLOBAL_INTEL' },
                        { screen: 'NEWS', icon: <Icons.News size={24} />, label: 'NEWS_FEED', desc: 'MEDIA_CENTER' },
                    ].map((item, idx) => (
                        <motion.button 
                            key={item.screen}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(20,184,166,0.3)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setScreen(item.screen as CareerScreen)}
                            className="p-8 bg-white/[0.02] border border-white/10 rounded-[40px] text-left transition-all group relative overflow-hidden backdrop-blur-xl"
                        >
                            <div className="mb-6 text-teal-500 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-1">{item.label}</p>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{item.desc}</p>
                            </div>
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-500">
                                <Icons.ArrowRight size={18} className="text-teal-500" />
                            </div>
                        </motion.button>
                    ))}
                </section>
            </div>

            {/* Bottom Status Bar */}
            <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center backdrop-blur-3xl relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">SYSTEM_UPTIME_STABLE // DATA_SYNC_COMPLETE</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">ENCRYPTION_STATUS</p>
                    <p className="text-[11px] font-black text-teal-500 uppercase tracking-widest">SECURE_CONNECTION_VERIFIED</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
