
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameData, Format, MatchResult, Team, Player } from '../types';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';
import { getPlayerById } from '../utils';

interface CaptainsCornerProps {
    gameData: GameData;
}

interface CaptainStats {
    playerId: string;
    playerName: string;
    teamId: string;
    teamName: string;
    matches: number;
    wins: number;
    losses: number;
    draws: number;
    winPercentage: number;
    runsScoredAsCaptain: number;
    wicketsTakenAsCaptain: number;
    highestScoreAsCaptain: number;
    bestBowlingWicketsAsCaptain: number;
    bestBowlingRunsAsCaptain: number;
}

interface TeamStats {
    teamId: string;
    teamName: string;
    matches: number;
    wins: number;
    losses: number;
    draws: number;
    winPercentage: number;
    totalRuns: number;
    totalWickets: number;
}

interface H2HRecord {
    captainAId: string;
    captainBId: string;
    matches: number;
    winsA: number;
    winsB: number;
    draws: number;
}

export const CaptainsCorner: React.FC<CaptainsCornerProps> = ({ gameData }) => {
    const [selectedCaptainId, setSelectedCaptainId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'captains' | 'teams' | 'h2h'>('captains');
    const currentFormat = gameData.currentFormat;

    const stats = useMemo(() => {
        const results = gameData.matchResults[currentFormat] || [];
        const captainMap = new Map<string, CaptainStats>();
        const teamMap = new Map<string, TeamStats>();
        const h2hMap = new Map<string, H2HRecord>();

        results.forEach(res => {
            const teamAId = res.firstInning.teamId;
            const teamBId = res.secondInning.teamId;
            const captainAId = res.teamACaptainId;
            const captainBId = res.teamBCaptainId;

            // Update Team Stats
            [teamAId, teamBId].forEach((tid, idx) => {
                if (!teamMap.has(tid)) {
                    const team = gameData.teams.find(t => t.id === tid);
                    teamMap.set(tid, { teamId: tid, teamName: team?.name || 'Unknown', matches: 0, wins: 0, losses: 0, draws: 0, winPercentage: 0, totalRuns: 0, totalWickets: 0 });
                }
                const tStat = teamMap.get(tid)!;
                tStat.matches++;
                if (res.winnerId === tid) tStat.wins++;
                else if (res.loserId === tid) tStat.losses++;
                else if (res.isDraw) tStat.draws++;

                const inning = idx === 0 ? res.firstInning : res.secondInning;
                tStat.totalRuns += inning.score;
                tStat.totalWickets += inning.wickets;
            });

            // Update Captain Stats
            if (captainAId && captainBId) {
                [captainAId, captainBId].forEach((cid, idx) => {
                    const tid = idx === 0 ? teamAId : teamBId;
                    const inning = idx === 0 ? res.firstInning : res.secondInning;
                    const opponentInning = idx === 0 ? res.secondInning : res.firstInning;
                    
                    if (!captainMap.has(cid)) {
                        const player = getPlayerById(cid, gameData.allPlayers);
                        const team = gameData.teams.find(t => t.id === tid);
                        captainMap.set(cid, { 
                            playerId: cid, 
                            playerName: player?.name || 'Unknown', 
                            teamId: tid, 
                            teamName: team?.name || 'Unknown',
                            matches: 0, wins: 0, losses: 0, draws: 0, winPercentage: 0,
                            runsScoredAsCaptain: 0,
                            wicketsTakenAsCaptain: 0,
                            highestScoreAsCaptain: 0,
                            bestBowlingWicketsAsCaptain: 0,
                            bestBowlingRunsAsCaptain: 0
                        });
                    }
                    const cStat = captainMap.get(cid)!;
                    cStat.matches++;
                    if (res.winnerId === tid) cStat.wins++;
                    else if (res.loserId === tid) cStat.losses++;
                    else if (res.isDraw) cStat.draws++;

                    // Add individual performance as captain
                    const batterPerf = inning.batting.find(b => b.playerId === cid);
                    const bowlerPerf = opponentInning.bowling.find(b => b.playerId === cid);
                    
                    if (batterPerf) {
                        cStat.runsScoredAsCaptain += batterPerf.runs;
                        if (batterPerf.runs > cStat.highestScoreAsCaptain) {
                            cStat.highestScoreAsCaptain = batterPerf.runs;
                        }
                    }
                    
                    if (bowlerPerf) {
                        cStat.wicketsTakenAsCaptain += bowlerPerf.wickets;
                        // Best bowling calculation
                        if (bowlerPerf.wickets > cStat.bestBowlingWicketsAsCaptain || 
                           (bowlerPerf.wickets === cStat.bestBowlingWicketsAsCaptain && bowlerPerf.runsConceded < cStat.bestBowlingRunsAsCaptain) ||
                           (cStat.bestBowlingWicketsAsCaptain === 0 && cStat.bestBowlingRunsAsCaptain === 0)) {
                            cStat.bestBowlingWicketsAsCaptain = bowlerPerf.wickets;
                            cStat.bestBowlingRunsAsCaptain = bowlerPerf.runsConceded;
                        }
                    }
                });

                // Update H2H
                const h2hKey = [captainAId, captainBId].sort().join('_');
                if (!h2hMap.has(h2hKey)) {
                    h2hMap.set(h2hKey, { captainAId, captainBId, matches: 0, winsA: 0, winsB: 0, draws: 0 });
                }
                const h2h = h2hMap.get(h2hKey)!;
                h2h.matches++;
                if (res.winnerId === (captainAId === h2h.captainAId ? teamAId : teamBId)) h2h.winsA++;
                else if (res.winnerId === (captainBId === h2h.captainBId ? teamBId : teamAId)) h2h.winsB++;
                else if (res.isDraw) h2h.draws++;
            }
        });

        const captainList = Array.from(captainMap.values()).map(c => ({
            ...c,
            winPercentage: c.matches > 0 ? (c.wins / c.matches) * 100 : 0
        })).sort((a, b) => b.winPercentage - a.winPercentage);

        const teamList = Array.from(teamMap.values()).map(t => ({
            ...t,
            winPercentage: t.matches > 0 ? (t.wins / t.matches) * 100 : 0
        })).sort((a, b) => b.wins - a.wins);

        return { captainList, teamList, h2hMap };
    }, [gameData.matchResults, gameData.teams, gameData.allPlayers, currentFormat]);

    const selectedCaptain = useMemo(() => {
        if (!selectedCaptainId) return null;
        return stats.captainList.find(c => c.playerId === selectedCaptainId);
    }, [selectedCaptainId, stats.captainList]);

    const captainH2H = useMemo(() => {
        if (!selectedCaptainId) return [];
        return Array.from(stats.h2hMap.values()).filter(h => h.captainAId === selectedCaptainId || h.captainBId === selectedCaptainId);
    }, [selectedCaptainId, stats.h2hMap]);

    return (
        <div className="flex flex-col h-full bg-[#050808] text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-teal-500/10 to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
                        <Icons.Trophy className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Captains Corner</h1>
                        <p className="text-teal-500/60 font-black tracking-[0.3em] text-[10px] uppercase mt-1">Tactical Leadership & Match Analytics</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Tabs */}
                <div className="flex bg-white/5 p-1 mx-6 mt-4 rounded-xl border border-white/5 sticky top-0 z-10 backdrop-blur-md">
                    {[
                        { id: 'captains', label: 'Captains', icon: Icons.Users },
                        { id: 'teams', label: 'Teams', icon: Icons.Trophy },
                        { id: 'h2h', label: 'H2H', icon: Icons.Activity }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-teal-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
                        >
                            <tab.icon className="w-3 h-3" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-6 space-y-8">
                    {activeTab === 'teams' && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-4 bg-teal-500 rounded-full" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Team Performance</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats.teamList.map(team => {
                                    const teamColor = gameData.teams.find(t => t.id === team.teamId)?.color || '#14b8a6';
                                    return (
                                        <div key={team.teamId} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col gap-4 group hover:bg-white/[0.05] transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10" style={{ borderColor: `${teamColor}40` }}>
                                                        <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: gameData.allTeamsData.find(t => t.id === team.teamId)?.logo || '' }} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black uppercase italic tracking-tighter text-sm">{team.teamName}</p>
                                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{team.matches} Matches</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-black italic leading-none" style={{ color: teamColor }}>{team.winPercentage.toFixed(0)}%</p>
                                                    <p className="text-[7px] font-bold text-white/20 uppercase">Win Rate</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white/80">{team.wins}</p>
                                                    <p className="text-[7px] font-bold text-white/20 uppercase">Wins</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white/80">{team.totalRuns}</p>
                                                    <p className="text-[7px] font-bold text-white/20 uppercase">Runs</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white/80">{team.totalWickets}</p>
                                                    <p className="text-[7px] font-bold text-white/20 uppercase">Wkts</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-black text-white/80">{(team.totalRuns / team.matches).toFixed(0)}</p>
                                                    <p className="text-[7px] font-bold text-white/20 uppercase">Avg</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {activeTab === 'captains' && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Captain Analytics</h2>
                            </div>
                            <div className="space-y-3">
                                {stats.captainList.map(captain => (
                                    <div key={captain.playerId} className="space-y-3">
                                        <button 
                                            onClick={() => setSelectedCaptainId(selectedCaptainId === captain.playerId ? null : captain.playerId)}
                                            className={`w-full text-left bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between group transition-all ${selectedCaptainId === captain.playerId ? 'ring-2 ring-teal-500/50 bg-white/[0.08]' : 'hover:bg-white/[0.05]'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full border-2 border-white/10 overflow-hidden bg-black/40">
                                                    <PlayerAvatar player={getPlayerById(captain.playerId, gameData.allPlayers)!} size="sm" />
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase italic tracking-tighter text-lg">{captain.playerName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{captain.teamName}</span>
                                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{captain.matches} Matches Led</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xl font-black italic text-white leading-none">{captain.winPercentage.toFixed(1)}%</p>
                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">Win Rate</p>
                                                </div>
                                                <Icons.ChevronRight className={`w-5 h-5 text-white/10 transition-transform ${selectedCaptainId === captain.playerId ? 'rotate-90 text-teal-500' : ''}`} />
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {selectedCaptainId === captain.playerId && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 grid grid-cols-2 gap-4">
                                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Runs as Captain</p>
                                                            <p className="text-xl font-black italic text-teal-500">{captain.runsScoredAsCaptain}</p>
                                                            <p className="text-[7px] font-bold text-white/40 uppercase mt-1">Best: {captain.highestScoreAsCaptain}</p>
                                                        </div>
                                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Wickets as Captain</p>
                                                            <p className="text-xl font-black italic text-teal-500">{captain.wicketsTakenAsCaptain}</p>
                                                            <p className="text-[7px] font-bold text-white/40 uppercase mt-1">Best: {captain.bestBowlingWicketsAsCaptain}/{captain.bestBowlingRunsAsCaptain}</p>
                                                        </div>
                                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Wins / Losses</p>
                                                            <p className="text-xl font-black italic text-white">{captain.wins} / {captain.losses}</p>
                                                        </div>
                                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Win Percentage</p>
                                                            <p className="text-xl font-black italic text-white">{captain.winPercentage.toFixed(1)}%</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {activeTab === 'h2h' && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1 h-4 bg-purple-500 rounded-full" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Head-to-Head Battles</h2>
                            </div>
                            <div className="space-y-4">
                                {Array.from(stats.h2hMap.values()).length > 0 ? Array.from(stats.h2hMap.values()).map((h, i) => {
                                    const capA = stats.captainList.find(c => c.playerId === h.captainAId);
                                    const capB = stats.captainList.find(c => c.playerId === h.captainBId);
                                    
                                    return (
                                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className="flex flex-col items-center gap-2 w-1/3">
                                                    <div className="w-16 h-16 rounded-full border-2 border-teal-500/30 overflow-hidden bg-black/40 shadow-lg">
                                                        <PlayerAvatar player={getPlayerById(h.captainAId, gameData.allPlayers)!} size="md" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase italic tracking-tighter text-center">{capA?.playerName}</p>
                                                    <p className="text-[7px] font-bold text-teal-500 uppercase tracking-widest">{capA?.teamName}</p>
                                                </div>

                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-3xl font-black italic text-teal-500">{h.winsA}</span>
                                                        <span className="text-xl font-black text-white/10">VS</span>
                                                        <span className="text-3xl font-black italic text-purple-500">{h.winsB}</span>
                                                    </div>
                                                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{h.matches} MATCHES</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center gap-2 w-1/3">
                                                    <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 overflow-hidden bg-black/40 shadow-lg">
                                                        <PlayerAvatar player={getPlayerById(h.captainBId, gameData.allPlayers)!} size="md" />
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase italic tracking-tighter text-center">{capB?.playerName}</p>
                                                    <p className="text-[7px] font-bold text-purple-500 uppercase tracking-widest">{capB?.teamName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="py-20 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                                        <Icons.Activity className="w-12 h-12 text-white/5 mx-auto mb-4" />
                                        <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">No rivalries established yet</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};
