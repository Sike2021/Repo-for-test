
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Player, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';
import { PlayerAvatar } from './PlayerAvatar';
import { ChevronLeft, Activity, Target, Shield, Zap } from 'lucide-react';

interface PlayerProfileProps {
    player: Player | null;
    onBack: () => void;
    initialFormat: Format;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onBack, initialFormat }) => {
    const [selectedFormat, setSelectedFormat] = useState<Format | 'Summary'>(initialFormat);
    
    const summaryStats = useMemo(() => {
        if (!player) return null;
        
        const t20Formats = [Format.T20];
        const listAFormats = [Format.ODI];
        const fcFormats = [Format.SHIELD];
        
        const t20 = aggregateStats(player, t20Formats);
        const listA = aggregateStats(player, listAFormats);
        const fc = aggregateStats(player, fcFormats);
        const overall = aggregateStats(player, [...t20Formats, ...listAFormats, ...fcFormats]);

        return { t20, listA, fc, overall };
    }, [player]);

    if (!player || !summaryStats) return <div className="h-full flex items-center justify-center bg-[#050808] text-white">Player not found. <button onClick={onBack} className="ml-4 text-teal-500 font-black uppercase tracking-widest">Back</button></div>;
    
    const stats = selectedFormat === 'Summary' ? summaryStats.overall : player.stats[selectedFormat];
    
    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* Header */}
            <header className="px-8 pt-10 pb-8 border-b border-white/5 flex items-center justify-between backdrop-blur-xl bg-[#050808]/50 sticky top-0 z-50">
                <motion.button 
                    whileHover={{ x: -5 }}
                    onClick={onBack} 
                    className="flex items-center gap-3 text-white/40 hover:text-teal-500 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-teal-500/50 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">RETURN_TO_HUB</span>
                </motion.button>
                <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    {['Summary', ...Object.values(Format)].map(format => (
                        <button 
                            key={format} 
                            onClick={() => setSelectedFormat(format as any)} 
                            className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedFormat === format ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                        >
                            {format}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: Player Identity */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] border border-white/10 rounded-[48px] p-10 flex flex-col items-center text-center relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-teal-500/10 to-transparent" />
                            <div className="relative z-10 mb-8">
                                <PlayerAvatar player={player} size="xl" className="shadow-[0_0_60px_rgba(20,184,166,0.2)] border-4 border-white/10" />
                                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center border-4 border-[#050808] shadow-xl">
                                    <span className="text-black font-black italic text-lg">26</span>
                                </div>
                            </div>
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2 relative z-10 text-white leading-none">{player.name}</h2>
                            <p className={`text-[11px] font-black uppercase tracking-[0.4em] mb-8 relative z-10 ${getRoleColor(player.role)}`}>{getRoleFullName(player.role)}</p>
                            
                            <div className="w-full grid grid-cols-2 gap-4 relative z-10">
                                <div className="bg-black/40 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">BATTING_STYLE</p>
                                    <p className="text-sm font-black uppercase tracking-widest text-white">{player.style === 'A' ? 'Aggressive' : player.style === 'D' ? 'Defensive' : 'Balanced'}</p>
                                </div>
                                <div className="bg-black/40 border border-white/5 rounded-3xl p-5 backdrop-blur-md">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">AGE_INDEX</p>
                                    <p className="text-sm font-black uppercase tracking-widest text-white">{player.age || 25}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Skill Ratings */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/[0.03] border border-white/10 rounded-[48px] p-10 shadow-2xl"
                        >
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">CORE_ATTRIBUTES</h3>
                            <div className="space-y-8">
                                {[
                                    { label: 'Batting Power', val: player.battingSkill, color: 'bg-teal-500' },
                                    { label: 'Bowling Speed', val: player.secondarySkill, color: 'bg-teal-500' },
                                    { label: 'Fielding Intel', val: player.fielding || 50, color: 'bg-teal-500' }
                                ].map((skill, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                            <span className="text-white/60">{skill.label}</span>
                                            <span className="text-teal-400 font-mono">{skill.val}</span>
                                        </div>
                                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${skill.val}%` }} 
                                                transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                                                className={`h-full ${skill.color} shadow-[0_0_15px_rgba(20,184,166,0.4)]`} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Stats Dashboard */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Mini Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Matches', val: stats.matches, icon: Activity },
                                { label: 'Batting Avg', val: stats.average.toFixed(1), icon: Target },
                                { label: 'Strike Rate', val: stats.strikeRate.toFixed(1), icon: Zap },
                                { label: 'Wickets', val: stats.wickets, icon: Shield }
                            ].map((item, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 flex flex-col justify-between h-40 group hover:border-teal-500/30 transition-colors shadow-xl"
                                >
                                    <item.icon className="w-6 h-6 text-teal-500 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-1">{item.label}</p>
                                        <p className="text-4xl font-black italic font-mono text-white leading-none tracking-tighter">{item.val}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Detailed Stats Tables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Batting Details */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/[0.03] border border-white/10 rounded-[48px] p-10 shadow-2xl"
                            >
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">BATTING_METRICS</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Total Runs', val: stats.runs },
                                        { label: 'High Score', val: stats.highestScore },
                                        { label: '50s / 100s', val: `${stats.fifties} / ${stats.hundreds}` },
                                        { label: 'Boundaries (4/6)', val: `${stats.fours} / ${stats.sixes}` },
                                        { label: 'Fastest 50', val: stats.fastestFifty > 0 ? `${stats.fastestFifty}b` : '-' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-5 last:border-0 last:pb-0">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{stat.label}</span>
                                            <span className="text-2xl font-black italic font-mono text-teal-400 leading-none">{stat.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Bowling Details */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/[0.03] border border-white/10 rounded-[48px] p-10 shadow-2xl"
                            >
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8">BOWLING_METRICS</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Economy Rate', val: stats.economy.toFixed(2) },
                                        { label: 'Bowling Avg', val: stats.bowlingAverage.toFixed(1) },
                                        { label: 'Best Bowling', val: stats.bestBowling || '-' },
                                        { label: '3-Wicket Hauls', val: stats.threeWicketHauls },
                                        { label: '5-Wicket Hauls', val: stats.fiveWicketHauls }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-5 last:border-0 last:pb-0">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{stat.label}</span>
                                            <span className="text-2xl font-black italic font-mono text-teal-400 leading-none">{stat.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerProfile;
