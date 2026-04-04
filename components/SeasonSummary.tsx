
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, TrendingUp, TrendingDown, Minus, Award, Star, Users, ArrowRight } from 'lucide-react';
import { GameData, Player, Format, PlayerStats } from '../types';
import { getPlayerById, aggregateStats } from '../utils';

interface SeasonSummaryProps {
    gameData: GameData;
    onContinue: (updatedPlayers: Player[]) => void;
}

interface RatingChange {
    playerId: string;
    playerName: string;
    oldBatting: number;
    newBatting: number;
    oldBowling: number;
    newBowling: number;
    reason: string;
    type: 'up' | 'down' | 'neutral';
}

const SeasonSummary: React.FC<SeasonSummaryProps> = ({ gameData, onContinue }) => {
    const summaryData = useMemo(() => {
        const ratingChanges: RatingChange[] = [];
        const updatedPlayers = JSON.parse(JSON.stringify(gameData.allPlayers)) as Player[];

        updatedPlayers.forEach(player => {
            // Emerging Status Logic
            if (player.teamName && player.teamName !== 'Free Agent') {
                player.yearsInTeam = (player.yearsInTeam || 0) + 1;
                if (player.isEmerging && player.yearsInTeam >= 3) {
                    player.isEmerging = false;
                    ratingChanges.push({
                        playerId: player.id,
                        playerName: player.name,
                        oldBatting: player.battingSkill,
                        newBatting: player.battingSkill,
                        oldBowling: player.secondarySkill,
                        newBowling: player.secondarySkill,
                        reason: 'No longer an emerging player (3 years completed).',
                        type: 'neutral'
                    });
                }
            } else {
                player.yearsInTeam = 0; // Reset if they become free agent
            }

            const seasonStats = aggregateStats(player, Object.values(Format));
            const oldBatting = player.battingSkill;
            const oldBowling = player.secondarySkill;
            let newBatting = oldBatting;
            let newBowling = oldBowling;
            let reason = '';
            let type: 'up' | 'down' | 'neutral' = 'neutral';

            // Extraordinary Performance
            if (seasonStats.runs >= 1000 || seasonStats.wickets >= 50) {
                newBatting = Math.min(100, oldBatting + 3);
                newBowling = Math.min(100, oldBowling + 3);
                reason = seasonStats.runs >= 1000 ? 'Incredible 1000+ runs season!' : 'Historic 50+ wickets season!';
                type = 'up';
            }
            // Good Performance (No change)
            else if (seasonStats.runs >= 400 || seasonStats.wickets >= 20) {
                reason = 'Solid season performance.';
                type = 'neutral';
            }
            // Consistent Failures (Only if played enough matches)
            else if (seasonStats.matches >= 10) {
                if (seasonStats.runs < 150 && seasonStats.wickets < 5) {
                    newBatting = Math.max(30, oldBatting - 2);
                    newBowling = Math.max(30, oldBowling - 2);
                    reason = 'Poor form throughout the season.';
                    type = 'down';
                }
            }

            if (type !== 'neutral') {
                player.battingSkill = newBatting;
                player.secondarySkill = newBowling;
                ratingChanges.push({
                    playerId: player.id,
                    playerName: player.name,
                    oldBatting,
                    newBatting,
                    oldBowling,
                    newBowling,
                    reason,
                    type
                });
            }
        });

        // Top Performers for display
        const topBatters = [...updatedPlayers].sort((a, b) => aggregateStats(b, Object.values(Format)).runs - aggregateStats(a, Object.values(Format)).runs).slice(0, 5);
        const topBowlers = [...updatedPlayers].sort((a, b) => aggregateStats(b, Object.values(Format)).wickets - aggregateStats(a, Object.values(Format)).wickets).slice(0, 5);

        return { ratingChanges, updatedPlayers, topBatters, topBowlers };
    }, [gameData.allPlayers]);

    return (
        <div className="p-4 max-w-2xl mx-auto space-y-6 bg-[#050808] min-h-screen">
            <div className="text-center space-y-2 py-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block p-4 bg-teal-500/10 rounded-full text-teal-500 mb-2 shadow-[0_0_30px_rgba(20,184,166,0.2)]"
                >
                    <Trophy className="w-10 h-10" />
                </motion.div>
                <h1 className="text-3xl font-black tracking-tighter italic uppercase text-white leading-none">SEASON {gameData.currentSeason}</h1>
                <p className="text-[10px] font-mono font-black text-teal-500 uppercase tracking-[0.4em]">CAMPAIGN_SUMMARY_REPORT</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Top Batters */}
                <div className="bg-white/[0.02] rounded-[24px] p-5 border border-white/5 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4 text-orange-500">
                        <Star className="w-4 h-4" fill="currentColor" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">TOP_BATTERS_INDEX</h2>
                    </div>
                    <div className="space-y-2">
                        {summaryData.topBatters.map((p, i) => {
                            const stats = aggregateStats(p, Object.values(Format));
                            return (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono font-black text-white/10">0{i + 1}</span>
                                        <div>
                                            <p className="font-black italic uppercase tracking-tight text-sm text-white group-hover:text-teal-500 transition-colors">{p.name}</p>
                                            <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">{p.teamName || 'FREE AGENT'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg italic text-teal-500 leading-none">{stats.runs}</p>
                                        <p className="text-[8px] text-white/20 font-black uppercase tracking-tighter mt-1">RUNS</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Bowlers */}
                <div className="bg-white/[0.02] rounded-[24px] p-5 border border-white/5 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4 text-blue-500">
                        <Award className="w-4 h-4" fill="currentColor" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">TOP_BOWLERS_INDEX</h2>
                    </div>
                    <div className="space-y-2">
                        {summaryData.topBowlers.map((p, i) => {
                            const stats = aggregateStats(p, Object.values(Format));
                            return (
                                <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5 group hover:bg-white/[0.05] transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono font-black text-white/10">0{i + 1}</span>
                                        <div>
                                            <p className="font-black italic uppercase tracking-tight text-sm text-white group-hover:text-blue-500 transition-colors">{p.name}</p>
                                            <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">{p.teamName || 'FREE AGENT'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg italic text-blue-500 leading-none">{stats.wickets}</p>
                                        <p className="text-[8px] text-white/20 font-black uppercase tracking-tighter mt-1">WICKETS</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Rating Fluctuations */}
            <div className="bg-white/[0.02] rounded-[24px] p-5 border border-white/5 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4 h-4 text-teal-500" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">RATING_FLUCTUATIONS</h2>
                </div>
                
                {summaryData.ratingChanges.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                        {summaryData.ratingChanges.slice(0, 8).map(change => (
                            <div key={change.playerId} className="p-3 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-between group">
                                <div className="space-y-0.5">
                                    <p className="font-black italic uppercase tracking-tight text-xs text-white group-hover:text-teal-500 transition-colors">{change.playerName}</p>
                                    <p className="text-[8px] text-white/30 italic font-medium">{change.reason}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                            <span className="text-[10px] font-black text-white/20">{change.oldBatting}</span>
                                            <ArrowRight className="w-2 h-2 text-white/10" />
                                            <span className={`text-xs font-black italic ${change.type === 'up' ? 'text-teal-500' : 'text-rose-500'}`}>
                                                {change.newBatting}
                                            </span>
                                        </div>
                                        <p className="text-[7px] text-white/20 uppercase font-black tracking-tighter">RATING</p>
                                    </div>
                                    {change.type === 'up' ? (
                                        <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                                    ) : (
                                        <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-white/10">
                        <Minus className="w-6 h-6 mx-auto mb-2 opacity-20" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em]">STABLE_FORM_DETECTED</p>
                    </div>
                )}
                
                {summaryData.ratingChanges.length > 8 && (
                    <p className="text-center text-[8px] text-white/20 mt-4 uppercase font-black tracking-widest">
                        + {summaryData.ratingChanges.length - 8} ADDITIONAL_EVOLUTIONS
                    </p>
                )}
            </div>

            <div className="flex justify-center pt-4">
                <button
                    onClick={() => onContinue(summaryData.updatedPlayers)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-black font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition-all active:scale-95 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 group"
                >
                    PROCEED TO NEXT SEASON
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default SeasonSummary;
