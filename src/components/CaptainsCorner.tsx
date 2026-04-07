
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
}

interface TeamStats {
    teamId: string;
    teamName: string;
    matches: number;
    wins: number;
    losses: number;
    draws: number;
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
            [teamAId, teamBId].forEach(tid => {
                if (!teamMap.has(tid)) {
                    const team = gameData.teams.find(t => t.id === tid);
                    teamMap.set(tid, { teamId: tid, teamName: team?.name || 'Unknown', matches: 0, wins: 0, losses: 0, draws: 0 });
                }
                const tStat = teamMap.get(tid)!;
                tStat.matches++;
                if (res.winnerId === tid) tStat.wins++;
                else if (res.loserId === tid) tStat.losses++;
                else if (res.isDraw) tStat.draws++;
            });

            // Update Captain Stats
            if (captainAId && captainBId) {
                [captainAId, captainBId].forEach((cid, idx) => {
                    const tid = idx === 0 ? teamAId : teamBId;
                    if (!captainMap.has(cid)) {
                        const player = getPlayerById(cid, gameData.allPlayers);
                        const team = gameData.teams.find(t => t.id === tid);
                        captainMap.set(cid, { 
                            playerId: cid, 
                            playerName: player?.name || 'Unknown', 
                            teamId: tid, 
                            teamName: team?.name || 'Unknown',
                            matches: 0, wins: 0, losses: 0, draws: 0, winPercentage: 0 
                        });
                    }
                    const cStat = captainMap.get(cid)!;
                    cStat.matches++;
                    if (res.winnerId === tid) cStat.wins++;
                    else if (res.loserId === tid) cStat.losses++;
                    else if (res.isDraw) cStat.draws++;
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

        const teamList = Array.from(teamMap.values()).sort((a, b) => b.wins - a.wins);

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

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                {/* Team Stats Overview */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-teal-500 rounded-full" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Team Performance</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.teamList.map(team => (
                            <div key={team.teamId} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10">
                                        <div className="w-6 h-6" dangerouslySetInnerHTML={{ __html: gameData.allTeamsData.find(t => t.id === team.teamId)?.logo || '' }} />
                                    </div>
                                    <div>
                                        <p className="font-black uppercase italic tracking-tighter text-sm">{team.teamName}</p>
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{team.matches} Matches</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-center">
                                    <div>
                                        <p className="text-[10px] font-black text-teal-500">{team.wins}</p>
                                        <p className="text-[7px] font-bold text-white/20 uppercase">W</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-red-500">{team.losses}</p>
                                        <p className="text-[7px] font-bold text-white/20 uppercase">L</p>
                                    </div>
                                    {team.draws > 0 && (
                                        <div>
                                            <p className="text-[10px] font-black text-white/40">{team.draws}</p>
                                            <p className="text-[7px] font-bold text-white/20 uppercase">D</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Captain Stats */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-4 bg-blue-500 rounded-full" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white/40">Captain Analytics</h2>
                    </div>
                    <div className="space-y-3">
                        {stats.captainList.map(captain => (
                            <button 
                                key={captain.playerId}
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
                        ))}
                    </div>
                </section>

                {/* Captain Detail View (H2H) */}
                <AnimatePresence>
                    {selectedCaptain && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter">Head-to-Head Records</h3>
                                <div className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full">
                                    <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">{selectedCaptain.playerName}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {captainH2H.length > 0 ? captainH2H.map((h, i) => {
                                    const opponentId = h.captainAId === selectedCaptainId ? h.captainBId : h.captainAId;
                                    const opponent = stats.captainList.find(c => c.playerId === opponentId);
                                    const wins = h.captainAId === selectedCaptainId ? h.winsA : h.winsB;
                                    const losses = h.captainAId === selectedCaptainId ? h.winsB : h.winsA;

                                    return (
                                        <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-white/5">
                                                    <PlayerAvatar player={getPlayerById(opponentId, gameData.allPlayers)!} size="xs" />
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase italic tracking-tighter text-xs">vs {opponent?.playerName}</p>
                                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{opponent?.teamName}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-lg font-black text-teal-500">{wins}</span>
                                                    <span className="text-xs font-black text-white/10">-</span>
                                                    <span className="text-lg font-black text-red-500">{losses}</span>
                                                </div>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">W - L</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="col-span-full py-12 text-center">
                                        <Icons.Activity className="w-8 h-8 text-white/5 mx-auto mb-3" />
                                        <p className="text-white/20 font-black uppercase tracking-widest text-xs">No head-to-head data available yet</p>
                                    </div>
                                )}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
