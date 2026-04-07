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
    const [leftTeamId, setLeftTeamId] = useState<string>(userTeam?.id || gameData.teams[0]?.id || '');
    const [rightTeamId, setRightTeamId] = useState<string>('FREE_AGENTS');
    const [searchQuery, setSearchQuery] = useState('');

    const leftTeam = useMemo(() => 
        gameData.teams.find(t => t.id === leftTeamId), 
    [gameData.teams, leftTeamId]);

    const rightTeam = useMemo(() => 
        gameData.teams.find(t => t.id === rightTeamId), 
    [gameData.teams, rightTeamId]);

    const freeAgents = useMemo(() => {
        const ownedIds = new Set(gameData.teams.flatMap(t => t.squad.map(p => p.id)));
        return gameData.allPlayers.filter(p => !ownedIds.has(p.id));
    }, [gameData.allPlayers, gameData.teams]);

    const rightList = useMemo(() => {
        if (rightTeamId === 'FREE_AGENTS') {
            return freeAgents.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
        }
        return rightTeam?.squad || [];
    }, [rightTeamId, rightTeam, freeAgents, searchQuery]);

    const handleMove = (player: Player, fromId: string, toId: string) => {
        if (fromId === toId) return;

        setGameData(prev => {
            if (!prev) return null;
            let newTeams = [...prev.teams];
            
            // Remove from source
            if (fromId !== 'FREE_AGENTS') {
                newTeams = newTeams.map(t => {
                    if (t.id === fromId) {
                        return { ...t, squad: t.squad.filter(p => p.id !== player.id) };
                    }
                    return t;
                });
            }

            // Add to destination
            if (toId !== 'FREE_AGENTS') {
                const destTeam = newTeams.find(t => t.id === toId);
                if (destTeam && destTeam.squad.length >= 25) {
                    showFeedback("Destination squad full!", "error");
                    return prev;
                }
                newTeams = newTeams.map(t => {
                    if (t.id === toId) {
                        return { ...t, squad: [...t.squad, player] };
                    }
                    return t;
                });
            }

            return { ...prev, teams: newTeams };
        });

        const fromName = fromId === 'FREE_AGENTS' ? 'Free Agents' : gameData.teams.find(t => t.id === fromId)?.name;
        const toName = toId === 'FREE_AGENTS' ? 'Free Agents' : gameData.teams.find(t => t.id === toId)?.name;
        showFeedback(`Moved ${player.name} from ${fromName} to ${toName}`, "success");
    };

    return (
        <div className="min-h-full flex flex-col bg-[#0a0f0f] text-gray-100 font-sans">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/40 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase italic text-teal-500">TRANSFER MARKET</h1>
                        <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Move players between squads or sign free agents</p>
                    </div>
                </div>
            </div>

            {/* Main Content: Two Columns */}
            <div className="flex-1 flex flex-row overflow-hidden">
                {/* Left Column */}
                <div className="flex-1 flex flex-col border-r border-white/10">
                    <div className="p-4 bg-white/5 border-b border-white/5 space-y-3 sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">SOURCE</h2>
                            <span className="text-[8px] md:text-[10px] font-bold text-teal-500">{leftTeam?.purse.toFixed(2)} CR</span>
                        </div>
                        <select 
                            value={leftTeamId}
                            onChange={(e) => setLeftTeamId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] md:text-sm font-bold focus:outline-none focus:border-teal-500 appearance-none"
                        >
                            {gameData.teams.map(t => (
                                <option key={t.id} value={t.id} className="bg-[#0a0f0f]">{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 md:p-2 space-y-1 scrollbar-hide">
                        {leftTeam?.squad.map(player => (
                            <div key={player.id} className="flex items-center justify-between p-1.5 md:p-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors group">
                                <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden">
                                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center font-black text-[8px] md:text-xs ${getRoleColor(player.role)} bg-white/5 shrink-0`}>
                                        {player.name[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] md:text-xs font-bold leading-none mb-0.5 md:mb-1 truncate">
                                            {player.name}
                                        </p>
                                        <p className="text-[7px] md:text-[9px] font-bold opacity-40 uppercase">{player.role}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleMove(player, leftTeamId, rightTeamId)}
                                    className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-black flex items-center justify-center transition-all shrink-0"
                                >
                                    <UserPlus className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col bg-black/10">
                    <div className="p-4 bg-white/5 border-b border-white/5 space-y-3 sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">MARKET</h2>
                            {rightTeam && <span className="text-[8px] md:text-[10px] font-bold text-teal-500">{rightTeam.purse.toFixed(2)} CR</span>}
                        </div>
                        <select 
                            value={rightTeamId}
                            onChange={(e) => setRightTeamId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] md:text-sm font-bold focus:outline-none focus:border-teal-500 appearance-none"
                        >
                            <option value="FREE_AGENTS" className="bg-[#0a0f0f]">FREE AGENTS</option>
                            {gameData.teams.map(t => (
                                <option key={t.id} value={t.id} className="bg-[#0a0f0f]">{t.name}</option>
                            ))}
                        </select>
                        {rightTeamId === 'FREE_AGENTS' && (
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 opacity-20" />
                                <input 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-[9px] md:text-[11px] focus:outline-none focus:border-teal-500 transition-all"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 md:p-2 space-y-1 scrollbar-hide">
                        {rightList.map(player => (
                            <div key={player.id} className="flex items-center justify-between p-1.5 md:p-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors group">
                                <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden">
                                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center font-black text-[8px] md:text-xs ${getRoleColor(player.role)} bg-white/5 shrink-0`}>
                                        {player.name[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] md:text-xs font-bold leading-none mb-0.5 md:mb-1 truncate">
                                            {player.name}
                                        </p>
                                        <p className="text-[7px] md:text-[9px] font-bold opacity-40 uppercase">{player.role}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleMove(player, rightTeamId, leftTeamId)}
                                    className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-black flex items-center justify-center transition-all shrink-0"
                                >
                                    <UserPlus className="w-3 md:w-3.5 h-3 md:h-3.5 rotate-180" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transfers;
