
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { GameData, Player, PlayerRole } from '../types';
import { getRoleColor, getRoleFullName } from '../utils';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerDatabaseProps {
    gameData: GameData;
    onAddPlayer: () => void;
    onViewPlayer: (player: Player) => void;
}

const PlayerDatabase: React.FC<PlayerDatabaseProps> = ({ gameData, onAddPlayer, onViewPlayer }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<PlayerRole | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'skill' | 'name'>('skill');
    const [showOnlyForeign, setShowOnlyForeign] = useState(false);

    const filteredPlayers = useMemo(() => {
        return gameData.allPlayers.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
            const matchesForeign = !showOnlyForeign || p.isForeign;
            return matchesSearch && matchesRole && matchesForeign;
        }).sort((a, b) => {
            if (sortBy === 'skill') {
                return (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill);
            }
            return a.name.localeCompare(b.name);
        });
    }, [gameData.allPlayers, searchTerm, roleFilter, sortBy, showOnlyForeign]);

    const groupedPlayers = useMemo(() => {
        const groups: Record<string, Player[]> = {};
        filteredPlayers.forEach(p => {
            const nat = p.nationality || 'Unspecified';
            if (!groups[nat]) groups[nat] = [];
            groups[nat].push(p);
        });
        return groups;
    }, [filteredPlayers]);

    const nationalities = useMemo(() => 
        Object.keys(groupedPlayers).sort((a, b) => a.localeCompare(b))
    , [groupedPlayers]);

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-10 py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <Icons.Database className="w-64 h-64" />
                </div>

                <div className="flex justify-between items-center mb-12 relative z-10">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="w-2 h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">PLAYER_REGISTRY</h2>
                        </motion.div>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5"
                        >
                            GLOBAL_TALENT_DATABASE // v2.6.0
                        </motion.p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onAddPlayer}
                        className="bg-white text-black p-5 rounded-[24px] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-teal-500 hover:text-white transition-all duration-500"
                    >
                        <Icons.Plus size={28} />
                    </motion.button>
                </div>

                <div className="space-y-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative group"
                    >
                        <Icons.Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-teal-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="SEARCH_WORLD_TALENT_DNA..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-8 py-6 bg-white/[0.03] border border-white/10 focus:border-teal-500/50 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] outline-none transition-all duration-500 placeholder:text-white/5 focus:bg-white/[0.08]"
                        />
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col md:flex-row gap-6 items-center justify-between"
                    >
                        <div className="flex bg-white/[0.03] p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl overflow-x-auto max-w-full scrollbar-hide">
                            {(['ALL', ...Object.values(PlayerRole)] as const).map(role => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                                        roleFilter === role 
                                        ? 'bg-teal-500 text-black shadow-[0_10px_20px_rgba(20,184,166,0.2)]' 
                                        : 'text-white/30 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {role === 'ALL' ? 'WORLD' : getRoleFullName(role as PlayerRole).toUpperCase()}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowOnlyForeign(!showOnlyForeign)}
                                className={`px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
                                    showOnlyForeign 
                                    ? 'bg-white text-black border-white shadow-xl' 
                                    : 'bg-white/[0.03] border-white/10 text-white/30 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                FOREIGN_ASSETS ✈️
                            </button>
                            
                            <div className="flex bg-white/[0.03] p-1.5 rounded-[20px] border border-white/10">
                                {(['skill', 'name'] as const).map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => setSortBy(s)}
                                        className={`px-6 py-2.5 rounded-[14px] text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${sortBy === s ? 'bg-white/10 text-white' : 'text-white/20 hover:text-white/40'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-16 scrollbar-hide relative z-10">
                {nationalities.length > 0 ? nationalities.map((nat, nIdx) => (
                    <motion.div 
                        key={nat} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: nIdx * 0.1 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">{nat}</h3>
                            <div className="h-[1px] bg-white/5 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {groupedPlayers[nat].map((player, pIdx) => (
                                <motion.div 
                                    key={player.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (nIdx * 0.1) + (pIdx * 0.02) }}
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    onClick={() => onViewPlayer(player)}
                                    className="group bg-white/[0.02] border border-white/10 p-8 rounded-[40px] flex items-center justify-between transition-all duration-500 cursor-pointer hover:bg-white/[0.06] hover:border-teal-500/40 shadow-xl"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <PlayerAvatar player={player} size="md" className="w-20 h-20 border-4 border-white/5 relative z-10 group-hover:border-teal-500/30 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-3 text-white group-hover:text-teal-500 transition-colors">{player.name}</p>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 bg-white/5 ${getRoleColor(player.role)}`}>
                                                    {player.role}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{player.style === 'A' ? 'AGGRESSIVE' : player.style === 'D' ? 'DEFENSIVE' : 'BALANCED'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-teal-500 italic leading-none mb-1 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]">{Math.max(player.battingSkill, player.secondarySkill)}</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-white/20">RATING</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:border-teal-500 group-hover:bg-teal-500 group-hover:text-black transition-all duration-500">
                                            <Icons.ChevronRight size={20} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 py-32">
                        <Icons.Database className="w-24 h-24 mb-8 animate-pulse" />
                        <p className="text-[11px] font-black uppercase tracking-[0.5em]">NO_ASSETS_MATCH_QUERY</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerDatabase;
