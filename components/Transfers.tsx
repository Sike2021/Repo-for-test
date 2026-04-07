import React, { useState, useMemo } from 'react';
import { Search, Filter, UserPlus, UserMinus } from 'lucide-react';
import { GameData, Player, Team, PlayerRole } from '../types';
import { getRoleColor } from '../utils';

interface TransfersProps {
    gameData: GameData;
    userTeam: Team | null;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const Transfers: React.FC<TransfersProps> = ({ gameData, userTeam, setGameData, showFeedback }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string>(userTeam?.id || gameData.teams[0]?.id || '');
    const [searchQuery, setSearchQuery] = useState('');

    const selectedTeam = useMemo(() => 
        gameData.teams.find(t => t.id === selectedTeamId), 
    [gameData.teams, selectedTeamId]);

    const freeAgents = useMemo(() => {
        const ownedIds = new Set(gameData.teams.flatMap(t => t.squad.map(p => p.id)));
        return gameData.allPlayers.filter(p => !ownedIds.has(p.id));
    }, [gameData.allPlayers, gameData.teams]);

    const filteredFreeAgents = useMemo(() => {
        return freeAgents.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
    }, [freeAgents, searchQuery]);

    const handleBuy = (player: Player) => {
        if (!selectedTeam) return;
        const price = (player.battingSkill + player.secondarySkill) / 10;
        
        if (selectedTeam.purse < price) {
            showFeedback("Insufficient funds!", "error");
            return;
        }
        if (selectedTeam.squad.length >= 25) {
            showFeedback("Squad full (Max 25)!", "error");
            return;
        }

        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                teams: prev.teams.map(t => {
                    if (t.id === selectedTeam.id) {
                        return { 
                            ...t, 
                            purse: Number((t.purse - price).toFixed(2)), 
                            squad: [...t.squad, player] 
                        };
                    }
                    return t;
                })
            };
        });
        showFeedback(`Signed ${player.name} for ${price.toFixed(2)} Cr`, "success");
    };

    const handleSell = (player: Player) => {
        if (!selectedTeam) return;
        const price = ((player.battingSkill + player.secondarySkill) / 10) * 0.8;
        
        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                teams: prev.teams.map(t => {
                    if (t.id === selectedTeam.id) {
                        return { 
                            ...t, 
                            purse: Number((t.purse + price).toFixed(2)), 
                            squad: t.squad.filter(p => p.id !== player.id) 
                        };
                    }
                    return t;
                })
            };
        });
        showFeedback(`Sold ${player.name} for ${price.toFixed(2)} Cr`, "success");
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0f0f] text-gray-100 font-sans overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-black/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-teal-500">TEAM MANAGEMENT</h1>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Market & Squad Optimization</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select 
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:border-teal-500 appearance-none pr-10"
                            >
                                {gameData.teams.map(t => (
                                    <option key={t.id} value={t.id} className="bg-[#0a0f0f]">{t.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                <Filter className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                            <p className="text-[8px] font-black opacity-40 uppercase tracking-widest leading-none mb-1">PURSE</p>
                            <p className="text-lg font-black font-mono text-teal-400 leading-none">
                                {selectedTeam?.purse.toFixed(2)}<span className="text-[10px] ml-1 opacity-40">CR</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 bg-black/20 border-b border-white/5">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                    <input 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search players..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-teal-500 transition-all"
                    />
                </div>
            </div>

            {/* Main Content: Two Columns */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Left Column: SQUAD */}
                <div className="flex-1 flex flex-col border-r border-white/10">
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white/60">SQUAD ({selectedTeam?.squad.length || 0})</h2>
                        <span className="text-[10px] font-bold opacity-40 uppercase">Click - to release</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {selectedTeam?.squad.map(player => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center font-black text-sm ${getRoleColor(player.role)} bg-white/5`}>
                                        {player.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-none mb-1">
                                            {player.name} {player.isForeign && <span className="text-blue-400 text-[10px] ml-1">(F)</span>}
                                        </p>
                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{player.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs font-black font-mono text-teal-500">{Math.max(player.battingSkill, player.secondarySkill)}</p>
                                        <p className="text-[8px] opacity-20 uppercase font-black">Skill</p>
                                    </div>
                                    <button 
                                        onClick={() => handleSell(player)}
                                        className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: FREE AGENTS */}
                <div className="flex-1 flex flex-col bg-black/10">
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-sm font-black uppercase tracking-widest text-white/60">FREE AGENTS ({filteredFreeAgents.length})</h2>
                        <span className="text-[10px] font-bold opacity-40 uppercase">Click + to sign</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                        {filteredFreeAgents.map(player => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center font-black text-sm ${getRoleColor(player.role)} bg-white/5`}>
                                        {player.name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-none mb-1">
                                            {player.name} {player.isForeign && <span className="text-blue-400 text-[10px] ml-1">(F)</span>}
                                        </p>
                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{player.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs font-black font-mono text-teal-500">{Math.max(player.battingSkill, player.secondarySkill)}</p>
                                        <p className="text-[8px] opacity-20 uppercase font-black">Skill</p>
                                    </div>
                                    <button 
                                        onClick={() => handleBuy(player)}
                                        className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-black flex items-center justify-center transition-all"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transfers;
