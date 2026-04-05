
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Player, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';
import { PlayerAvatar } from './PlayerAvatar';
import { ChevronLeft, Activity, Target, Shield, Zap, Camera } from 'lucide-react';

interface PlayerProfileProps {
    player: Player | null;
    onBack: () => void;
    initialFormat: Format;
    onUpdatePlayer?: (player: Player) => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onBack, initialFormat, onUpdatePlayer }) => {
    const [selectedFormat, setSelectedFormat] = useState<Format | 'Summary'>(initialFormat);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && player && onUpdatePlayer) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onUpdatePlayer({
                    ...player,
                    avatarUrl: base64String
                });
            };
            reader.readAsDataURL(file);
        }
    };
    
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
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full opacity-30" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full opacity-30" />
            </div>

            {/* Header */}
            <header className="px-3 py-2 md:px-4 md:py-3 border-b border-white/5 flex items-center justify-between backdrop-blur-xl bg-[#050808]/50 sticky top-0 z-50">
                <motion.button 
                    whileHover={{ x: -3 }}
                    onClick={onBack} 
                    className="flex items-center gap-1.5 text-white/40 hover:text-teal-500 transition-all group"
                >
                    <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-teal-500/50 transition-colors">
                        <ChevronLeft className="w-3 h-3" />
                    </div>
                    <span className="text-[6px] font-black uppercase tracking-[0.3em] hidden md:block">RETURN_TO_HUB</span>
                </motion.button>
                <div className="flex gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10 overflow-x-auto scrollbar-hide max-w-[220px] md:max-w-none">
                    {['Summary', ...Object.values(Format)].map(format => (
                        <button 
                            key={format} 
                            onClick={() => setSelectedFormat(format as any)} 
                            className={`px-2 py-1 rounded-md text-[6px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedFormat === format ? 'bg-teal-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.4)]' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                        >
                            {format}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 scrollbar-hide pb-6 relative z-10">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    
                    {/* Left Column: Player Identity */}
                    <div className="lg:col-span-4 space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] border border-white/10 rounded-[24px] p-4 md:p-6 flex flex-col items-center text-center relative overflow-hidden shadow-2xl backdrop-blur-xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-teal-500/10 to-transparent" />
                            <div className="relative z-10 mb-4 group/avatar">
                                <PlayerAvatar player={player} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-3 border-white/10 shadow-[0_0_30px_rgba(20,184,166,0.2)]" />
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center border-3 border-[#050808] shadow-xl">
                                    <span className="text-black font-black italic text-xs">{player.rating}</span>
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Camera className="w-6 h-6 text-white" />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter mb-0.5 relative z-10 text-white leading-none">{player.name}</h2>
                            <p className={`text-[7px] font-black uppercase tracking-[0.4em] mb-4 relative z-10 ${getRoleColor(player.role)}`}>{getRoleFullName(player.role)}</p>
                            
                            <div className="w-full grid grid-cols-2 gap-2 relative z-10">
                                <div className="bg-black/40 border border-white/5 rounded-xl p-2 backdrop-blur-md">
                                    <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/20 mb-0.5">BATTING_STYLE</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white">{player.style === 'A' ? 'Aggressive' : player.style === 'D' ? 'Defensive' : 'Balanced'}</p>
                                </div>
                                <div className="bg-black/40 border border-white/5 rounded-xl p-2 backdrop-blur-md">
                                    <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/20 mb-0.5">AGE_INDEX</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-white">{player.age || 25}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Skill Ratings */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/[0.03] border border-white/10 rounded-[24px] p-4 shadow-2xl backdrop-blur-xl"
                        >
                            <h3 className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">CORE_ATTRIBUTES</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Batting Power', val: player.battingSkill, color: 'bg-teal-500' },
                                    { label: 'Bowling Speed', val: player.secondarySkill, color: 'bg-teal-500' },
                                    { label: 'Fielding Intel', val: player.fielding || 50, color: 'bg-teal-500' }
                                ].map((skill, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-[7px] font-black uppercase tracking-[0.2em] mb-1.5">
                                            <span className="text-white/60">{skill.label}</span>
                                            <span className="text-teal-400 font-mono">{skill.val}</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${skill.val}%` }} 
                                                transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                                                className={`h-full ${skill.color} shadow-[0_0_10px_rgba(20,184,166,0.4)]`} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Stats Dashboard */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Mini Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                    className="bg-white/[0.03] border border-white/10 rounded-[20px] p-3.5 flex flex-col justify-between h-24 group hover:border-teal-500/30 transition-colors shadow-xl backdrop-blur-xl"
                                >
                                    <item.icon className="w-4 h-4 text-teal-500 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-[7px] font-black uppercase tracking-[0.3em] text-white/20 mb-0.5">{item.label}</p>
                                        <p className="text-lg font-black italic font-mono text-white leading-none tracking-tighter">{item.val}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Detailed Stats Tables */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Batting Details */}
                            <motion.div 
                                initial={{ opacity: 0, x: -15 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/[0.03] border border-white/10 rounded-[24px] p-4 shadow-2xl backdrop-blur-xl"
                            >
                                <h3 className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">BATTING_METRICS</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Total Runs', val: stats.runs },
                                        { label: 'High Score', val: stats.highestScore },
                                        { label: '50s / 100s', val: `${stats.fifties} / ${stats.hundreds}` },
                                        { label: 'Boundaries (4/6)', val: `${stats.fours} / ${stats.sixes}` },
                                        { label: 'Fastest 50', val: stats.fastestFifty > 0 ? `${stats.fastestFifty}b` : '-' }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/60">{stat.label}</span>
                                            <span className="text-sm font-black italic font-mono text-teal-400 leading-none">{stat.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Bowling Details */}
                            <motion.div 
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white/[0.03] border border-white/10 rounded-[24px] p-4 shadow-2xl backdrop-blur-xl"
                            >
                                <h3 className="text-[7px] font-black uppercase tracking-[0.4em] text-white/20 mb-4">BOWLING_METRICS</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Economy Rate', val: stats.economy.toFixed(2) },
                                        { label: 'Bowling Avg', val: stats.bowlingAverage.toFixed(1) },
                                        { label: 'Best Bowling', val: stats.bestBowling || '-' },
                                        { label: '3-Wicket Hauls', val: stats.threeWicketHauls },
                                        { label: '5-Wicket Hauls', val: stats.fiveWicketHauls }
                                    ].map((stat, idx) => (
                                        <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/60">{stat.label}</span>
                                            <span className="text-sm font-black italic font-mono text-teal-400 leading-none">{stat.val}</span>
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
