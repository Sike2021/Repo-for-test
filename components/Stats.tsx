
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
    const [statType, setStatType] = useState<'batting' | 'bowling' | 'milestones'>('batting');
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');
    const [selectedFormatOption, setSelectedFormatOption] = useState<StatFormatOption>(gameData.currentFormat);
    const [sortConfig, setSortConfig] = useState({ key: 'runs', direction: 'descending' });

    const getFormatsForCategory = (cat: 'T20' | 'List A' | 'First Class') => {
        switch(cat) {
            case 'T20': return [Format.T20];
            case 'List A': return [Format.ODI];
            case 'First Class': return [Format.SHIELD];
        }
    };

    useEffect(() => {
        const formats = getFormatsForCategory(category);
        if (!formats.includes(selectedFormatOption as Format) && !['All_T20', 'All_ListA', 'All_FC', 'Overall'].includes(selectedFormatOption)) {
            setTimeout(() => setSelectedFormatOption(formats[0]), 0);
        }
    }, [category, selectedFormatOption]);

    const allPlayersWithStats = useMemo(() => {
        return gameData.allPlayers.map(p => {
            const team = gameData.teams.find(t => t.squad.some(sp => sp.id === p.id));
            let stats: PlayerStats;

            if (selectedFormatOption === 'Overall') {
                stats = aggregateStats(p, Object.values(Format));
            } else if (selectedFormatOption === 'All_T20') {
                stats = aggregateStats(p, [Format.T20]);
            } else if (selectedFormatOption === 'All_ListA') {
                stats = aggregateStats(p, [Format.ODI]);
            } else if (selectedFormatOption === 'All_FC') {
                stats = aggregateStats(p, [Format.SHIELD]);
            } else {
                stats = p.stats[selectedFormatOption as Format] || aggregateStats(p, []); // Fallback to empty stats
            }

            return { ...p, teamName: team?.name || 'Free Agent', displayStats: stats };
        }).filter(p => p.displayStats.matches > 0);
    }, [gameData, selectedFormatOption]);

    const requestSort = (key: string) => {
        let direction = 'descending';
        if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = 'ascending';
        } else if (sortConfig.key !== key && ['average', 'bowlingAverage', 'economy'].includes(key)) {
            direction = 'ascending';
        }
        setSortConfig({ key, direction });
    };

    const handleStatTypeChange = (type: 'batting' | 'bowling' | 'milestones') => {
        setStatType(type);
        if (type === 'batting') {
            setSortConfig({ key: 'runs', direction: 'descending' });
        } else if (type === 'bowling') {
            setSortConfig({ key: 'wickets', direction: 'descending' });
        }
    };
    
    const getSortIndicator = (key: string) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    const sortedPlayers = useMemo(() => {
        if (statType === 'milestones') return [];

        const sortablePlayers = [...allPlayersWithStats];

        sortablePlayers.sort((a, b) => {
            if (sortConfig.key === 'name') {
                 if (a.name < b.name) return sortConfig.direction === 'ascending' ? -1 : 1;
                 if (a.name > b.name) return sortConfig.direction === 'ascending' ? 1 : -1;
                 return 0;
            }

            const aStat = a.displayStats;
            const bStat = b.displayStats;
            
            if (sortConfig.key === 'bestBowling') {
                if (!aStat.bestBowling || aStat.bestBowling === '-') return 1;
                if (!bStat.bestBowling || bStat.bestBowling === '-') return -1;
                const [aWickets, aRuns] = aStat.bestBowling.split('/').map(Number);
                const [bWickets, bRuns] = bStat.bestBowling.split('/').map(Number);

                if (aWickets !== bWickets) {
                    return sortConfig.direction === 'ascending' ? aWickets - bWickets : bWickets - aWickets;
                }
                return sortConfig.direction === 'ascending' ? bRuns - aRuns : aRuns - bRuns;
            }

            // @ts-expect-error - dynamic key
            const valA = aStat[sortConfig.key];
            // @ts-expect-error - dynamic key
            const valB = bStat[sortConfig.key];

            if (valA < valB) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (valA > valB) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return sortablePlayers;
    }, [allPlayersWithStats, sortConfig, statType]);

    const sortedFastestFifties = useMemo(() => {
        return allPlayersWithStats
            .filter(p => p.displayStats.fastestFifty > 0)
            .sort((a,b) => a.displayStats.fastestFifty - b.displayStats.fastestFifty);
    }, [allPlayersWithStats]);

    const sortedFastestHundreds = useMemo(() => {
        return allPlayersWithStats
            .filter(p => p.displayStats.fastestHundred > 0)
            .sort((a,b) => a.displayStats.fastestHundred - b.displayStats.fastestHundred);
    }, [allPlayersWithStats]);

    const getCategoryLabel = (cat: string) => {
        if(cat === 'T20') return 'All T20s';
        if(cat === 'List A') return 'All List A';
        if(cat === 'First Class') return 'All First-Class';
        return '';
    }

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden pb-24">
            <header className="px-10 py-12 border-b border-white/5 relative overflow-hidden bg-white/[0.01] backdrop-blur-3xl">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <Icons.Activity className="w-64 h-64" />
                </div>
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-8 bg-teal-500 rounded-full" />
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">ANALYTICS_CORE</h2>
                        </div>
                        <p className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5">PERFORMANCE_METRICS_v2.6</p>
                    </div>
                    
                    <div className="flex bg-white/[0.03] p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl">
                        {['T20', 'List A', 'First Class'].map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setCategory(cat as any)} 
                                className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${category === cat ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                    <div className="flex-1 flex gap-6 items-center">
                        <div className="relative min-w-[280px]">
                            <select
                                value={selectedFormatOption}
                                onChange={(e) => setSelectedFormatOption(e.target.value as StatFormatOption)}
                                className="w-full pl-8 pr-12 py-5 bg-white/[0.03] border border-white/10 rounded-[24px] focus:bg-white/10 focus:border-teal-500 outline-none font-black uppercase tracking-widest text-[11px] appearance-none transition-all text-white/80 shadow-inner"
                            >
                                <option value="Overall" className="bg-[#050808]">OVERALL_CAREER_DNA</option>
                                <option value={`All_${category.replace(' ', '')}`} className="bg-[#050808]">{getCategoryLabel(category).toUpperCase()}_FEED</option>
                                {getFormatsForCategory(category).map(f => (
                                    <option key={f} value={f} className="bg-[#050808]">{f}</option>
                                ))}
                            </select>
                            <Icons.ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" />
                        </div>

                        <div className="flex bg-white/[0.03] p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl">
                            {['batting', 'bowling', 'milestones'].map((type) => (
                                <button 
                                    key={type}
                                    onClick={() => handleStatTypeChange(type as any)} 
                                    className={`px-10 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${statType === type ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                <AnimatePresence mode="wait">
                    {statType !== 'milestones' ? (
                        <motion.div 
                            key="table"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/[0.01] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl backdrop-blur-xl"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.03] border-b border-white/10">
                                        <tr>
                                            <th className="p-8 cursor-pointer font-black text-[10px] uppercase tracking-[0.5em] text-teal-500" onClick={() => requestSort('name')}>
                                                ASSET_IDENTIFIER{getSortIndicator('name')}
                                            </th>
                                            {statType === 'batting' ? <>
                                                <ThSortable label="M" sortKey="matches" sortIndicator={getSortIndicator('matches')} onRequestSort={requestSort} />
                                                <ThSortable label="RUNS" sortKey="runs" sortIndicator={getSortIndicator('runs')} onRequestSort={requestSort} />
                                                <ThSortable label="AVG" sortKey="average" sortIndicator={getSortIndicator('average')} onRequestSort={requestSort} />
                                                <ThSortable label="SR" sortKey="strikeRate" sortIndicator={getSortIndicator('strikeRate')} onRequestSort={requestSort} />
                                                <ThSortable label="HS" sortKey="highestScore" sortIndicator={getSortIndicator('highestScore')} onRequestSort={requestSort} />
                                            </> : <>
                                                <ThSortable label="M" sortKey="matches" sortIndicator={getSortIndicator('matches')} onRequestSort={requestSort} />
                                                <ThSortable label="WKTS" sortKey="wickets" sortIndicator={getSortIndicator('wickets')} onRequestSort={requestSort} />
                                                <ThSortable label="AVG" sortKey="bowlingAverage" sortIndicator={getSortIndicator('bowlingAverage')} onRequestSort={requestSort} />
                                                <ThSortable label="ECON" sortKey="economy" sortIndicator={getSortIndicator('economy')} onRequestSort={requestSort} />
                                                <ThSortable label="BEST" sortKey="bestBowling" sortIndicator={getSortIndicator('bestBowling')} onRequestSort={requestSort} />
                                            </>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                    {sortedPlayers.slice(0, 50).map((p, idx) => (
                                        <motion.tr 
                                            key={p.id} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            onClick={() => viewPlayerProfile(p, gameData.currentFormat)} 
                                            className="group cursor-pointer hover:bg-white/[0.04] transition-all duration-500"
                                        >
                                            <td className="p-8">
                                                <div className="flex items-center gap-8">
                                                    <PlayerAvatar player={p} size="sm" className="w-16 h-16 border border-white/10 shadow-2xl group-hover:border-teal-500/50 transition-all duration-500" />
                                                    <div>
                                                        <div className="font-black text-2xl tracking-tighter uppercase italic text-white group-hover:text-teal-500 transition-colors leading-none mb-2">{p.name}</div>
                                                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{p.teamName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {statType === 'batting' ? <>
                                                <td className="p-8 text-center font-mono text-sm font-black text-white/20 group-hover:text-white/40 transition-colors">{p.displayStats.matches}</td>
                                                <td className="p-8 text-center">
                                                    <span className="text-4xl font-black italic text-teal-500 tracking-tighter drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]">{p.displayStats.runs}</span>
                                                </td>
                                                <td className="p-8 text-center font-mono text-sm font-black text-white/40">{p.displayStats.average.toFixed(1)}</td>
                                                <td className="p-8 text-center font-mono text-sm font-black text-white/40">{p.displayStats.strikeRate.toFixed(1)}</td>
                                                <td className="p-8 text-center font-black italic text-2xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{p.displayStats.highestScore}</td>
                                            </> : <>
                                                <td className="p-8 text-center font-mono text-sm font-black text-white/20 group-hover:text-white/40 transition-colors">{p.displayStats.matches}</td>
                                                <td className="p-8 text-center">
                                                    <span className="text-4xl font-black italic text-teal-500 tracking-tighter drop-shadow-[0_0_15px_rgba(20,184,166,0.3)]">{p.displayStats.wickets}</span>
                                                </td>
                                                <td className="p-8 text-center font-mono text-sm font-black text-white/40">{p.displayStats.bowlingAverage.toFixed(1)}</td>
                                                <td className="p-8 text-center font-mono text-sm font-black text-white/40">{p.displayStats.economy.toFixed(2)}</td>
                                                <td className="p-8 text-center font-black italic text-2xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{p.displayStats.bestBowling}</td>
                                            </>}
                                        </motion.tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="milestones"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-6xl mx-auto space-y-12 pb-24"
                        >
                            <div className="bg-white/[0.01] rounded-[56px] border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
                                <div className="bg-white/[0.03] p-10 border-b border-white/10 flex items-center gap-4">
                                    <div className="w-2 h-6 bg-teal-500 rounded-full" />
                                    <h3 className="font-black text-[11px] uppercase tracking-[0.6em] text-teal-500">FASTEST_FIFTIES_DNA</h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {sortedFastestFifties.slice(0, 25).map((p, idx) => (
                                        <motion.div 
                                            key={p.id} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => viewPlayerProfile(p, gameData.currentFormat)} 
                                            className="p-10 flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] transition-all duration-500"
                                        >
                                            <div className="flex items-center gap-8">
                                                <PlayerAvatar player={p} size="sm" className="w-16 h-16 border border-white/10 group-hover:border-teal-500/50 transition-all duration-500" />
                                                <div>
                                                    <div className="font-black text-2xl tracking-tighter uppercase italic text-white group-hover:text-teal-500 transition-colors mb-1">{p.name}</div>
                                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{p.teamName}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-teal-500 text-black px-12 py-4 rounded-[24px] font-black italic text-xl uppercase tracking-tighter shadow-[0_15px_30px_rgba(20,184,166,0.25)] group-hover:scale-110 transition-transform duration-500 inline-block">
                                                    {p.displayStats.fastestFifty} <span className="text-[10px] tracking-widest ml-2">BALLS</span>
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/[0.01] rounded-[56px] border border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
                                <div className="bg-white/[0.03] p-10 border-b border-white/10 flex items-center gap-4">
                                    <div className="w-2 h-6 bg-teal-500 rounded-full" />
                                    <h3 className="font-black text-[11px] uppercase tracking-[0.6em] text-teal-500">FASTEST_HUNDREDS_DNA</h3>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {sortedFastestHundreds.slice(0, 25).map((p, idx) => (
                                        <motion.div 
                                            key={p.id} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => viewPlayerProfile(p, gameData.currentFormat)} 
                                            className="p-10 flex items-center justify-between group cursor-pointer hover:bg-white/[0.04] transition-all duration-500"
                                        >
                                            <div className="flex items-center gap-8">
                                                <PlayerAvatar player={p} size="sm" className="w-16 h-16 border border-white/10 group-hover:border-teal-500/50 transition-all duration-500" />
                                                <div>
                                                    <div className="font-black text-2xl tracking-tighter uppercase italic text-white group-hover:text-teal-500 transition-colors mb-1">{p.name}</div>
                                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{p.teamName}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-teal-500 text-black px-12 py-4 rounded-[24px] font-black italic text-xl uppercase tracking-tighter shadow-[0_15px_30px_rgba(20,184,166,0.25)] group-hover:scale-110 transition-transform duration-500 inline-block">
                                                    {p.displayStats.fastestHundred} <span className="text-[10px] tracking-widest ml-2">BALLS</span>
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Stats;
