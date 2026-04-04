
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

    const userTeam = gameData.teams.find(t => t.id === gameData.userTeamId);
    const allPlayers = gameData.allPlayers;
    const selectedPlayer = allPlayers.find(p => p.id === selectedPlayerId);
    const selectedStats = selectedPlayer ? (selectedPlayer.stats[format] || aggregateStats(selectedPlayer, [])) : aggregateStats(allPlayers[0], []);

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

            <header className="px-5 py-6 md:px-6 md:py-8 border-b border-white/5 relative z-10">
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-teal-500/60">
                        ANALYTICS_CORE // v2.6.0 // FRANCHISE: {userTeam?.name.toUpperCase() || 'KINGS'}
                    </h2>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">PLAYER STATS</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 md:space-y-6 scrollbar-hide pb-10 relative z-10">
                {/* Player Selector (Compact) */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {allPlayers.slice(0, 20).map(player => (
                        <button
                            key={player.id}
                            onClick={() => setSelectedPlayerId(player.id)}
                            className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all ${
                                selectedPlayerId === player.id 
                                    ? 'border-teal-500 scale-110 shadow-[0_0_15px_rgba(20,184,166,0.5)]' 
                                    : 'border-white/10 opacity-40'
                            }`}
                        >
                            <PlayerAvatar 
                                player={player} 
                                className="w-full h-full rounded-full overflow-hidden bg-white/5 p-1"
                            />
                        </button>
                    ))}
                </div>

                {/* Player Card (Vertical) */}
                {selectedPlayer && (
                    <motion.div 
                        key={selectedPlayer.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/[0.03] border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col items-center text-center backdrop-blur-xl relative overflow-hidden"
                    >
                        <div className="absolute top-4 left-4 md:top-6 md:left-6 text-[8px] md:text-[10px] font-black text-teal-500/40 uppercase tracking-[0.3em]">DOM</div>
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 text-[8px] md:text-[10px] font-black text-teal-500/40 uppercase tracking-[0.3em]">{selectedPlayer.role.toUpperCase()} // DOM</div>

                        <div className="relative mb-4 md:mb-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-teal-500/20 p-1.5 md:p-2 shadow-[0_0_40px_rgba(20,184,166,0.1)]">
                                <PlayerAvatar 
                                    player={selectedPlayer} 
                                    className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-3 md:p-4 overflow-hidden"
                                />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-teal-500 text-black px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">
                                {selectedPlayer.rating} OVR
                            </div>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-1 md:mb-2">{selectedPlayer.name}</h3>
                        <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6 md:mb-8">PRIMARY_ASSET // {selectedPlayer.teamName || 'FREE AGENT'}</p>

                        {/* Stats Grid */}
                        <div className="w-full grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                            <div className="bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5">
                                <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5 md:mb-1">BATTING SR</p>
                                <p className="text-lg md:text-xl font-black italic text-white">{selectedStats.strikeRate.toFixed(1)}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/5">
                                <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mb-0.5 md:mb-1">BOWLING WKT</p>
                                <p className="text-lg md:text-xl font-black italic text-teal-500">{selectedStats.wickets}</p>
                            </div>
                        </div>

                        {/* Progress Bars */}
                        <div className="w-full space-y-4 md:space-y-6 mb-6 md:mb-8">
                            <div className="space-y-1.5 md:space-y-2">
                                <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-white/40">{format} STRIKE RATE</span>
                                    <span className="text-teal-500">{selectedStats.strikeRate.toFixed(0)}%</span>
                                </div>
                                <div className="h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, selectedStats.strikeRate / 2)}%` }}
                                        className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 md:space-y-2">
                                <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-white/40">ECONOMY</span>
                                    <span className="text-teal-500">{selectedStats.economy.toFixed(2)}</span>
                                </div>
                                <div className="h-1 md:h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (12 - selectedStats.economy) * 10)}%` }}
                                        className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Sliders (Visual only) */}
                        <div className="w-full space-y-4 md:space-y-6 mb-8 md:mb-10">
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">
                                    <span>BATTING POWER</span>
                                    <span>{selectedPlayer.battingSkill}</span>
                                </div>
                                <div className="relative h-1 flex items-center">
                                    <div className="absolute inset-0 bg-white/5 rounded-full" />
                                    <div className="absolute h-full bg-teal-500 rounded-full" style={{ width: `${selectedPlayer.battingSkill}%` }} />
                                    <div className="absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-white border-2 border-teal-500 rounded-full shadow-xl" style={{ left: `${selectedPlayer.battingSkill}%`, transform: 'translateX(-50%)' }} />
                                </div>
                            </div>
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">
                                    <span>BOWLING SPEED</span>
                                    <span>{selectedPlayer.secondarySkill}</span>
                                </div>
                                <div className="relative h-1 flex items-center">
                                    <div className="absolute inset-0 bg-white/5 rounded-full" />
                                    <div className="absolute h-full bg-teal-500 rounded-full" style={{ width: `${selectedPlayer.secondarySkill}%` }} />
                                    <div className="absolute w-2.5 h-2.5 md:w-3 md:h-3 bg-white border-2 border-teal-500 rounded-full shadow-xl" style={{ left: `${selectedPlayer.secondarySkill}%`, transform: 'translateX(-50%)' }} />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full space-y-2 md:space-y-3">
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => viewPlayerProfile(selectedPlayer, format)}
                                className="w-full bg-teal-500 text-black font-black py-4 md:py-5 rounded-xl md:rounded-2xl uppercase tracking-[0.2em] text-[9px] md:text-[10px] shadow-xl"
                            >
                                VIEW_PLAYER_PROFILE
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-white/5 border border-white/10 text-white font-black py-4 md:py-5 rounded-xl md:rounded-2xl uppercase tracking-[0.2em] text-[9px] md:text-[10px]"
                            >
                                COMPARE_PLAYER
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Milestones (Compact) */}
                <div className="space-y-3 md:space-y-4">
                    <h4 className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.4em] px-2">RECENT_MILESTONES</h4>
                    <div className="space-y-1.5 md:space-y-2">
                        {milestones.slice(0, 3).map((m, i) => (
                            <div key={i} className="bg-white/[0.02] border border-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-3 md:gap-4">
                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500">
                                    <Icons.Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-wider">{m.player}</p>
                                    <p className="text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest">{m.milestone}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
