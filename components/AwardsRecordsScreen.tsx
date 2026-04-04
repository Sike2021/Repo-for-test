
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { GameData } from '../types';
import { Icons } from './Icons';

interface AwardsRecordsScreenProps {
    gameData: GameData;
}

const AwardsAndRecordsScreen: React.FC<AwardsRecordsScreenProps> = ({ gameData }) => {
    const { awardsHistory, records, promotionHistory } = gameData;
    
    const sortedBvb = useMemo(() => records ? [...records.batterVsBowler].sort((a,b) => b.dismissals - a.dismissals || b.runs - a.runs) : [], [records]);
    const sortedTvt = useMemo(() => records ? [...records.teamVsTeam].sort((a,b) => b.matches - a.matches) : [], [records]);
    const sortedPvt = useMemo(() => records ? [...records.playerVsTeam].sort((a,b) => (b.runs + b.wickets * 20) - (a.runs + a.wickets * 20)) : [], [records]);

    if (awardsHistory.length === 0 && (!records || sortedBvb.length === 0) && promotionHistory.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#050808] text-white/20 p-10 text-center">
                <Icons.Trophy className="w-16 h-16 mb-6 opacity-10" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em]">NO_ACCOLADES_RECORDED</p>
                <p className="text-[9px] font-medium uppercase tracking-widest mt-2">COMPLETE_TOURNAMENTS_TO_UNLOCK</p>
            </div>
        );
    }

    const groupedBySeason = awardsHistory.reduce((acc: any, award) => {
        (acc[award.season] = acc[award.season] || []).push(award);
        return acc;
    }, {});

    return (
        <div className="h-full bg-[#050808] text-[#E4E3E0] font-sans overflow-y-auto scrollbar-hide relative pb-20">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-500/5 blur-[100px] md:blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/5 blur-[100px] md:blur-[160px] rounded-full" />
            </div>

            <header className="px-3 py-4 md:px-10 md:py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
                <div className="absolute top-0 right-0 p-4 md:p-12 opacity-[0.02] pointer-events-none">
                    <Icons.Trophy className="w-16 h-16 md:w-64 md:h-64" />
                </div>

                <div className="relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-2"
                    >
                        <div className="w-1 md:w-2 h-4 md:h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                        <h2 className="text-lg md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">HALL_OF_FAME</h2>
                    </motion.div>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-[6px] md:text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-3 md:ml-5"
                    >
                        CAREER_MILESTONES // ARCHIVE_v1.0
                    </motion.p>
                </div>
            </header>

            <div className="p-2 md:p-10 space-y-4 md:space-y-16 relative z-10">
                {promotionHistory.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-6">
                            <Icons.TrendingUp className="text-teal-500 w-2.5 h-2.5 md:w-4 md:h-4" />
                            <h3 className="text-[7px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40">PROMOTION_LOGS</h3>
                            <div className="h-[1px] bg-white/5 flex-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-3">
                            {promotionHistory.map((ph, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/[0.02] border border-white/10 p-2.5 md:p-5 rounded-[12px] md:rounded-[24px] flex flex-col gap-1.5 md:gap-3"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-[6px] md:text-[8px] font-mono font-black text-teal-500 uppercase tracking-widest">SEASON_0{ph.season}</span>
                                        <Icons.Activity className="text-white/10 w-2 h-2 md:w-3 md:h-3" />
                                    </div>
                                    <div className="space-y-1 md:space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">PROMOTED</span>
                                            <span className="text-[10px] md:text-sm font-black italic text-green-400 uppercase tracking-tighter">{ph.promotedTeamName}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">RELEGATED</span>
                                            <span className="text-[10px] md:text-sm font-black italic text-red-400 uppercase tracking-tighter">{ph.relegatedTeamName}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-6">
                        <Icons.Trophy className="text-teal-500 w-2.5 h-2.5 md:w-4 md:h-4" />
                        <h3 className="text-[7px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40">SEASON_AWARDS</h3>
                        <div className="h-[1px] bg-white/5 flex-1" />
                    </div>
                    <div className="space-y-4 md:space-y-8">
                        {Object.entries(groupedBySeason).reverse().map(([season, awards]: [string, any], sIdx) => (
                            <div key={season} className="space-y-2 md:space-y-4">
                                <h4 className="text-[7px] md:text-[9px] font-black text-teal-500 uppercase tracking-[0.3em]">SEASON_0{season}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                                    {awards.map((award: any, aIdx: number) => (
                                        <motion.div 
                                            key={award.format}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: (sIdx * 0.1) + (aIdx * 0.05) }}
                                            className="bg-white/[0.03] border border-white/10 p-3 md:p-6 rounded-[16px] md:rounded-[32px] relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 p-3 md:p-6 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
                                                <Icons.Zap className="w-8 h-8 md:w-16 md:h-16" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-center mb-2 md:mb-4">
                                                    <span className="text-[6px] md:text-[8px] font-black bg-teal-500 text-black px-1 md:px-2 py-0.5 rounded-full uppercase tracking-widest">{award.format}</span>
                                                </div>
                                                <div className="mb-2 md:mb-4">
                                                    <p className="text-[7px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mb-0 md:mb-1">CHAMPIONS</p>
                                                    <p className="text-lg md:text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{award.winnerTeamName}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 md:gap-4 pt-2 md:pt-4 border-t border-white/5">
                                                    <div>
                                                        <p className="text-[5px] md:text-[7px] font-black text-white/20 uppercase tracking-widest mb-0 md:mb-1">BEST_BATTER</p>
                                                        <p className="text-[8px] md:text-[11px] font-black text-white truncate">{award.bestBatter.playerName}</p>
                                                        <p className="text-[7px] md:text-[9px] font-mono text-teal-500 font-bold">{award.bestBatter.runs} RUNS</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[5px] md:text-[7px] font-black text-white/20 uppercase tracking-widest mb-0 md:mb-1">BEST_BOWLER</p>
                                                        <p className="text-[8px] md:text-[11px] font-black text-white truncate">{award.bestBowler.playerName}</p>
                                                        <p className="text-[7px] md:text-[9px] font-mono text-teal-500 font-bold">{award.bestBowler.wickets} WKTS</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {records && (
                    <section className="space-y-4 md:space-y-10">
                        <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-6">
                            <Icons.Activity className="text-teal-500 w-2.5 h-2.5 md:w-4 md:h-4" />
                            <h3 className="text-[7px] md:text-xs font-black uppercase tracking-[0.4em] text-white/40">CAREER_RECORDS</h3>
                            <div className="h-[1px] bg-white/5 flex-1" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                            {/* Batter vs Bowler */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-[16px] md:rounded-[32px] overflow-hidden">
                                <div className="px-3 md:px-6 py-2 md:py-4 bg-white/5 border-b border-white/5">
                                    <h4 className="text-[7px] md:text-[9px] font-black text-teal-500 uppercase tracking-widest">BATTER_VS_BOWLER</h4>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {sortedBvb.slice(0, 5).map((r, idx) => (
                                        <div key={idx} className="p-2 md:p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[8px] md:text-[10px] font-black text-white truncate max-w-[80px] md:max-w-[120px]">{r.batterName}</span>
                                                <span className="text-[6px] md:text-[8px] font-black text-white/20 uppercase tracking-widest truncate">VS {r.bowlerName}</span>
                                            </div>
                                            <div className="flex gap-2 md:gap-4 items-center shrink-0">
                                                <div className="text-right">
                                                    <p className="text-[9px] md:text-xs font-black text-white leading-none">{r.runs}</p>
                                                    <p className="text-[5px] md:text-[7px] font-black text-white/20 uppercase">RUNS</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] md:text-xs font-black text-teal-500 leading-none">{r.dismissals}</p>
                                                    <p className="text-[5px] md:text-[7px] font-black text-white/20 uppercase">OUTS</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Team vs Team */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-[16px] md:rounded-[32px] overflow-hidden">
                                <div className="px-3 md:px-6 py-2 md:py-4 bg-white/5 border-b border-white/5">
                                    <h4 className="text-[7px] md:text-[9px] font-black text-teal-500 uppercase tracking-widest">TEAM_VS_TEAM</h4>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {sortedTvt.slice(0, 5).map((r, idx) => (
                                        <div key={idx} className="p-2 md:p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[8px] md:text-[10px] font-black text-white truncate max-w-[80px] md:max-w-[120px]">{r.teamAName}</span>
                                                <span className="text-[6px] md:text-[8px] font-black text-white/20 uppercase tracking-widest truncate">VS {r.teamBName}</span>
                                            </div>
                                            <div className="flex gap-2 md:gap-4 items-center shrink-0">
                                                <div className="text-right">
                                                    <p className="text-[9px] md:text-xs font-black text-white leading-none">{r.matches}</p>
                                                    <p className="text-[5px] md:text-[7px] font-black text-white/20 uppercase">PLAYED</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[9px] md:text-xs font-black text-teal-500 leading-none">{r.teamAWins}-{r.matches - r.teamAWins}</p>
                                                    <p className="text-[5px] md:text-[7px] font-black text-white/20 uppercase">W-L</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default AwardsAndRecordsScreen;
