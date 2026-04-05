
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameData, Format, Player, PlayerStats } from '../types';
import { aggregateStats } from '../utils';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';

interface StatsProps {
    gameData: GameData;
    viewPlayerProfile: (player: Player, format: Format) => void;
}

type StatFormatOption = Format | 'All_T20' | 'All_ListA' | 'All_FC' | 'Overall';

const ThSortable = ({ label, sortKey, sortIndicator, onRequestSort }: { label: string, sortKey: string, sortIndicator: string | null, onRequestSort: (key: string) => void }) => (
    <th className="p-8 text-center cursor-pointer font-black text-[10px] uppercase tracking-[0.4em] text-white/20 hover:text-teal-500 transition-colors" onClick={() => onRequestSort(sortKey)}>
        {label}{sortIndicator}
    </th>
);

const Stats: React.FC<StatsProps> = ({ gameData, viewPlayerProfile }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(gameData.allPlayers[0]?.id || null);
    const [format, setFormat] = useState<Format>(gameData.currentFormat);
    const [activeTab, setActiveTab] = useState<'STATS' | 'ANALYSIS'>('STATS');
    const [sortKey, setSortKey] = useState<keyof PlayerStats>('runs');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const userTeam = gameData.teams.find(t => t.id === gameData.userTeamId);
    const allPlayers = gameData.allPlayers;
    const selectedPlayer = allPlayers.find(p => p.id === selectedPlayerId);
    const selectedStats = selectedPlayer ? (selectedPlayer.stats[format] || aggregateStats(selectedPlayer, [])) : aggregateStats(allPlayers[0], []);

    const sortedPlayers = useMemo(() => {
        return [...allPlayers].sort((a, b) => {
            const statsA = a.stats[format] || aggregateStats(a, []);
            const statsB = b.stats[format] || aggregateStats(b, []);
            const valA = (statsA as any)[sortKey] || 0;
            const valB = (statsB as any)[sortKey] || 0;
            return sortOrder === 'desc' ? valB - valA : valA - valB;
        });
    }, [allPlayers, format, sortKey, sortOrder]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key as any);
            setSortOrder('desc');
        }
    };

    const milestones = useMemo(() => {
        const ms: { player: string; milestone: string }[] = [];
        allPlayers.forEach(p => {
            const s = p.stats[format];
            if (s.runs >= 500) ms.push({ player: p.name, milestone: `${s.runs} RUNS IN ${format}` });
            if (s.wickets >= 20) ms.push({ player: p.name, milestone: `${s.wickets} WICKETS IN ${format}` });
        });
        return ms;
    }, [allPlayers, format]);

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-4 py-4 md:px-6 md:py-6 border-b border-white/5 relative z-10 flex justify-between items-end">
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <h2 className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.4em] text-teal-500/60">
                        ANALYTICS_CORE // v2.6.0 // {userTeam?.name.toUpperCase() || 'KINGS'}
                    </h2>
                    <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">PLAYER ANALYTICS</h1>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto scrollbar-hide max-w-[150px] md:max-w-none">
                        {Object.values(Format).map(f => (
                            <button 
                                key={f}
                                onClick={() => setFormat(f)}
                                className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${format === f ? 'bg-teal-500 text-black shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'text-white/30 hover:text-white/60'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                        {(['STATS', 'ANALYSIS'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white/10 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide pb-10 relative z-10">
                {/* Featured Player Card */}
                {selectedPlayer && (
                    <motion.div 
                        key={selectedPlayer.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.03] border border-white/10 rounded-[32px] p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10 backdrop-blur-xl relative overflow-hidden"
                    >
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-teal-500/20 p-1.5 md:p-2 shadow-[0_0_40px_rgba(20,184,166,0.1)]">
                                <PlayerAvatar 
                                    player={selectedPlayer} 
                                    className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-3 md:p-4 overflow-hidden"
                                />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-teal-500 text-black px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl">
                                {selectedPlayer.rating} OVR
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">{selectedPlayer.name}</h3>
                            <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-6">{selectedPlayer.role.toUpperCase()} // {selectedPlayer.teamName || 'FREE AGENT'}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'AVG', val: selectedStats.average.toFixed(1) },
                                    { label: 'SR', val: selectedStats.strikeRate.toFixed(1) },
                                    { label: 'WKT', val: selectedStats.wickets },
                                    { label: 'ECO', val: selectedStats.economy.toFixed(2) }
                                ].map((s, i) => (
                                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <p className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-0.5">{s.label}</p>
                                        <p className="text-xs md:text-base font-black italic text-white">{s.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full md:w-auto flex flex-col gap-2">
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => viewPlayerProfile(selectedPlayer, format)}
                                className="bg-teal-500 text-black font-black px-6 py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] md:text-[9px] shadow-xl"
                            >
                                VIEW_PROFILE
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                className="bg-white/5 border border-white/10 text-white font-black px-6 py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] md:text-[9px]"
                            >
                                COMPARE
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Full Stats Table */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl">
                    <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <h4 className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">{activeTab === 'STATS' ? 'LEAGUE_STATS_MATRIX' : 'PERFORMANCE_ANALYSIS'}</h4>
                        <span className="text-[8px] font-mono text-teal-500/40 uppercase tracking-widest">SORTED_BY_{sortKey.toUpperCase()}</span>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-white/[0.03]">
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-widest text-white/20">PLAYER</th>
                                    {activeTab === 'STATS' ? (
                                        <>
                                            <ThSortable label="M" sortKey="matches" sortIndicator={sortKey === 'matches' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="RUNS" sortKey="runs" sortIndicator={sortKey === 'runs' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="AVG" sortKey="average" sortIndicator={sortKey === 'average' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="SR" sortKey="strikeRate" sortIndicator={sortKey === 'strikeRate' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="WKT" sortKey="wickets" sortIndicator={sortKey === 'wickets' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="ECO" sortKey="economy" sortIndicator={sortKey === 'economy' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                        </>
                                    ) : (
                                        <>
                                            <ThSortable label="DOT%" sortKey="dotBallPercentage" sortIndicator={sortKey === 'dotBallPercentage' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="BND%" sortKey="boundaryPercentage" sortIndicator={sortKey === 'boundaryPercentage' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="4s" sortKey="fours" sortIndicator={sortKey === 'fours' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="6s" sortKey="sixes" sortIndicator={sortKey === 'sixes' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="HS" sortKey="highestScore" sortIndicator={sortKey === 'highestScore' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                            <ThSortable label="BBI" sortKey="bestBowlingWickets" sortIndicator={sortKey === 'bestBowlingWickets' ? (sortOrder === 'desc' ? ' ↓' : ' ↑') : null} onRequestSort={handleSort} />
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {sortedPlayers.slice(0, 50).map(player => {
                                    const pStats = player.stats[format] || aggregateStats(player, [format]);
                                    return (
                                        <tr 
                                            key={player.id} 
                                            onClick={() => setSelectedPlayerId(player.id)}
                                            className={`group hover:bg-white/[0.04] transition-colors cursor-pointer ${selectedPlayerId === player.id ? 'bg-teal-500/5' : ''}`}
                                        >
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/5 p-1 flex-shrink-0">
                                                        <PlayerAvatar player={player} className="w-full h-full rounded-md overflow-hidden" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black italic uppercase tracking-tight text-white group-hover:text-teal-500 transition-colors">{player.name}</p>
                                                        <p className="text-[7px] font-black text-white/20 uppercase tracking-widest">{player.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {activeTab === 'STATS' ? (
                                                <>
                                                    <td className="px-6 py-3 text-[10px] font-mono text-white/40 text-center">{pStats.matches}</td>
                                                    <td className="px-6 py-3 text-xs font-black italic text-white text-center">{pStats.runs}</td>
                                                    <td className="px-6 py-3 text-xs font-black italic text-teal-500 text-center">{pStats.average.toFixed(1)}</td>
                                                    <td className="px-6 py-3 text-[10px] font-mono text-white/40 text-center">{pStats.strikeRate.toFixed(1)}</td>
                                                    <td className="px-6 py-3 text-xs font-black italic text-teal-500 text-center">{pStats.wickets}</td>
                                                    <td className="px-6 py-3 text-[10px] font-mono text-white/40 text-center">{pStats.economy.toFixed(2)}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-3 text-[10px] font-mono text-white/40 text-center">{(pStats.dotBallPercentage || 0).toFixed(1)}%</td>
                                                    <td className="px-6 py-3 text-[10px] font-mono text-white/40 text-center">{(pStats.boundaryPercentage || 0).toFixed(1)}%</td>
                                                    <td className="px-6 py-3 text-xs font-black italic text-white text-center">{pStats.fours}</td>
                                                    <td className="px-6 py-3 text-xs font-black italic text-white text-center">{pStats.sixes}</td>
                                                    <td className="px-6 py-3 text-xs font-black italic text-teal-500 text-center">{pStats.highestScore}</td>
                                                    <td className="px-6 py-3 text-xs font-black italic text-teal-500 text-center">{pStats.bestBowling || '-'}</td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
