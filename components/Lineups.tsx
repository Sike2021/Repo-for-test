import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameData, Team, Format, Player, PlayerRole } from '../types';
import { Icons } from './Icons';
import { getRoleColor, generateAutoXI, calculateTeamRatings, getTeamHighlights } from '../utils';
import { PlayerAvatar } from './PlayerAvatar';

interface LineupsProps {
    gameData: GameData;
    userTeam: Team | null;
    handleUpdatePlayingXI: (teamId: string, format: Format, newXI: string[]) => void;
    handleUpdateCaptain: (teamId: string, format: Format, playerId: string) => void;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const Lineups: React.FC<LineupsProps> = ({ gameData, userTeam, handleUpdatePlayingXI, handleUpdateCaptain, showFeedback }) => {
    const [selectedTeamId, setSelectedTeamId] = useState(userTeam?.id || '');
    const selectedTeam = useMemo(() => gameData.teams.find(t => t.id === selectedTeamId), [gameData.teams, selectedTeamId]);
    
    const [category, setCategory] = useState<'T20' | 'List A' | 'First Class'>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);
    const [playerToSwap, setPlayerToSwap] = useState<Player | null>(null);

    const teamRatings = useMemo(() => selectedTeam ? calculateTeamRatings(selectedTeam.squad) : null, [selectedTeam]);
    const teamHighlights = useMemo(() => selectedTeam ? getTeamHighlights(selectedTeam.squad) : null, [selectedTeam]);

    const getFormatsForCategory = (cat: 'T20' | 'List A' | 'First Class') => {
        switch(cat) {
            case 'T20': return [Format.T20];
            case 'List A': return [Format.ODI];
            case 'First Class': return [Format.SHIELD];
        }
    };

    const formats = useMemo(() => getFormatsForCategory(category), [category]);

    useEffect(() => {
        if (!formats.includes(selectedFormat)) {
            setTimeout(() => setSelectedFormat(formats[0]), 0);
        }
    }, [formats, selectedFormat]);

    const isDomesticOnlyFormat = [Format.ODI, Format.SHIELD].includes(selectedFormat);

    const { playingXI, bench } = useMemo(() => {
        if (!selectedTeam) return { playingXI: [], bench: [] };
        const teamData = gameData.teams.find(t => t.id === selectedTeam.id);
        if (!teamData) return { playingXI: [], bench: [] };

        const xiIds = gameData.playingXIs[teamData.id]?.[selectedFormat] || [];
        let xiPlayers: Player[];

        if (xiIds.length === 11) {
             const foundPlayers = xiIds.map(id => teamData.squad.find(p => p.id === id)).filter(Boolean) as Player[];
             if (foundPlayers.length === 11) {
                xiPlayers = foundPlayers;
             } else {
                xiPlayers = generateAutoXI(teamData.squad, selectedFormat);
             }
        } else {
            xiPlayers = generateAutoXI(teamData.squad, selectedFormat);
        }
        
        const xiIdSet = new Set(xiPlayers.map(p => p.id));
        const benchPlayers = teamData.squad.filter(p => !xiIdSet.has(p.id));
        return { playingXI: xiPlayers, bench: benchPlayers };
    }, [selectedTeam, selectedFormat, gameData.playingXIs, gameData.teams]);

    useEffect(() => {
        if (!selectedTeam) return;
        const xiIds = gameData.playingXIs[selectedTeam.id]?.[selectedFormat] || [];
        if (xiIds.length !== 11) {
            const autoXI = generateAutoXI(selectedTeam.squad, selectedFormat);
            handleUpdatePlayingXI(selectedTeam.id, selectedFormat, autoXI.map(p => p.id));
        }
    }, [selectedTeam, selectedFormat, gameData.playingXIs, handleUpdatePlayingXI]);

    useEffect(() => {
        setTimeout(() => setPlayerToSwap(null), 0);
    }, [selectedTeamId, selectedFormat]);

    if (!userTeam || !selectedTeam) {
        return (
            <div className="bg-[#050808] h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(20,184,166,0.3)]"></div>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">INITIALIZING_SQUAD_DNA...</p>
            </div>
        );
    }

    const captainId = selectedTeam.captains[selectedFormat] || '';
    const captain = selectedTeam.squad.find(p => p.id === captainId);

    const setCaptain = (playerId: string) => {
        if (playerToSwap) {
            showFeedback("Finish the current player swap first.", "error");
            return;
        }
        const player = playingXI.find(p => p.id === playerId);
        if (isDomesticOnlyFormat && player?.isForeign) {
            showFeedback("Foreign players cannot be captain in ODI & First-Class formats.", "error");
            return;
        }
        handleUpdateCaptain(selectedTeam.id, selectedFormat, playerId);
    };

    const selectPlayerForSwap = (player: Player) => {
        if (player.id === captainId) {
            showFeedback("Cannot swap the captain. Please assign a new captain first.", "error");
            return;
        }
        if (playerToSwap && playerToSwap.id === player.id) {
            setPlayerToSwap(null);
        } else {
            setPlayerToSwap(player);
        }
    };

    const completeSwap = (playerFromBench: Player) => {
        if (!playerToSwap) return;
        if (isDomesticOnlyFormat && playerFromBench.isForeign) {
            showFeedback("Foreign players are not allowed in this format.", "error");
            return;
        }
        
        const newXI = playingXI.map(p => p.id === playerToSwap.id ? playerFromBench : p);
        const newBench = bench.filter(p => p.id !== playerFromBench.id);
        newBench.push(playerToSwap);
        newBench.sort((a, b) => a.name.localeCompare(b.name));

        handleUpdatePlayingXI(selectedTeam.id, selectedFormat, newXI.map(p => p.id));
        setPlayerToSwap(null);
        showFeedback("Players swapped successfully!", "success");
    };

    const getDropStatus = (player: Player) => {
        if (!player.recentPerformances || player.recentPerformances.length === 0) return null;
        const isHighQuality = Math.max(player.battingSkill, player.secondarySkill) >= 80;
        const matchesToCheck = isHighQuality ? 8 : 3;
        if (player.recentPerformances.length < matchesToCheck) return null;
        const recent = player.recentPerformances.slice(-matchesToCheck);
        const avgRuns = recent.reduce((sum, p) => sum + p.runs, 0) / matchesToCheck;
        const avgWickets = recent.reduce((sum, p) => sum + p.wickets, 0) / matchesToCheck;
        if (avgRuns < 15 && avgWickets < 0.5) {
            return {
                type: 'at_risk',
                message: `POOR_FORM // LAST_${matchesToCheck}_MATCHES`
            };
        }
        return null;
    };

    const renderPlayerCard = (player: Player, isXI: boolean, index: number) => {
        const isSelected = playerToSwap?.id === player.id;
        const isCaptain = player.id === captainId;
        const dropStatus = getDropStatus(player);

        return (
            <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => isXI ? selectPlayerForSwap(player) : completeSwap(player)}
                className={`relative group cursor-pointer p-2 md:p-4 rounded-[12px] md:rounded-[24px] border transition-all duration-500 overflow-hidden ${
                    isSelected 
                    ? 'bg-teal-500 border-teal-400 shadow-[0_15px_30px_rgba(20,184,166,0.3)]' 
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06] hover:border-teal-500/40 shadow-xl'
                } ${dropStatus ? 'border-l-4 border-l-red-500' : ''}`}
            >
                <div className={`absolute -right-2 -bottom-2 text-3xl md:text-6xl font-black italic opacity-[0.03] pointer-events-none transition-colors ${isSelected ? 'text-black' : 'text-white'}`}>
                    {index + 1}
                </div>

                <div className="flex items-center gap-2 md:gap-4 relative z-10">
                    <div className="relative">
                        <div className={`absolute inset-0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'bg-white/40' : 'bg-teal-500/20'}`} />
                        <PlayerAvatar player={player} size="sm" className={`w-8 h-8 md:w-12 md:h-12 border-2 md:border-3 relative z-10 transition-colors ${isSelected ? 'border-white/40' : 'border-white/5 group-hover:border-teal-500/30'}`} />
                        {isCaptain && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-black w-3.5 h-3.5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[5px] md:text-[8px] font-black shadow-lg border-2 border-[#050808] z-20">
                                C
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                            <h4 className={`text-xs md:text-lg font-black italic uppercase tracking-tighter truncate transition-colors ${isSelected ? 'text-black' : 'text-white group-hover:text-teal-500'}`}>
                                {player.name}
                            </h4>
                            {player.isForeign && <Icons.Globe className={isSelected ? 'text-black/40 w-1.5 h-1.5 md:w-2 md:h-2' : 'text-white/20 w-1.5 h-1.5 md:w-2 md:h-2'} />}
                        </div>
                        
                        <div className="flex items-center gap-1 md:gap-2">
                            <span className={`text-[5px] md:text-[8px] font-black uppercase tracking-widest px-1 md:px-2 py-0.5 rounded-full border transition-colors ${
                                isSelected 
                                ? 'bg-black/10 border-black/10 text-black' 
                                : `bg-white/5 border-white/10 ${getRoleColor(player.role)}`
                            }`}>
                                {player.role}
                            </span>
                            {dropStatus && (
                                <span className="text-[5px] md:text-[7px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-1 py-0.5 rounded-full border border-red-500/20">
                                    AT_RISK
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-right">
                        <p className={`text-sm md:text-xl font-black italic leading-none mb-0.5 transition-colors ${isSelected ? 'text-black' : 'text-teal-500'}`}>
                            {Math.max(player.battingSkill, player.secondarySkill)}
                        </p>
                        <p className={`text-[5px] md:text-[7px] font-black uppercase tracking-widest transition-colors ${isSelected ? 'text-black/40' : 'text-white/20'}`}>
                            RATING
                        </p>
                    </div>
                </div>

                {/* Actions Overlay for Captaincy */}
                {isXI && !isCaptain && !isSelected && (
                    <motion.button 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        onClick={(e) => { e.stopPropagation(); setCaptain(player.id); }}
                        className="absolute inset-0 bg-yellow-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 transition-opacity z-30"
                    >
                        <span className="text-black text-[6px] md:text-[10px] font-black uppercase tracking-[0.4em]">ASSIGN_CAPTAINCY</span>
                    </motion.button>
                )}
            </motion.div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-500/5 blur-[100px] md:blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/5 blur-[100px] md:blur-[160px] rounded-full" />
            </div>

            <header className="px-3 md:px-6 py-3 md:py-6 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
                <div className="absolute top-0 right-0 p-4 md:p-6 opacity-[0.02] pointer-events-none">
                    <Icons.Users className="w-16 h-16 md:w-32 md:h-32" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-2 md:gap-6 mb-3 md:mb-6 relative z-10">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 md:gap-3 mb-0.5"
                        >
                            <div className="w-1 md:w-1.5 h-4 md:h-6 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                            <h2 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">SQUAD_LINEUP</h2>
                        </motion.div>
                        <div className="flex items-center gap-2 md:gap-3 ml-3 md:ml-4">
                            <select 
                                value={selectedTeamId} 
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                className="bg-transparent text-[6px] md:text-[9px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] outline-none cursor-pointer hover:text-white transition-colors"
                            >
                                {gameData.teams.map(team => <option key={team.id} value={team.id} className="bg-[#050808]">{team.name.toUpperCase()}</option>)}
                            </select>
                            <span className="text-white/10">//</span>
                            <span className="text-[6px] md:text-[9px] font-mono font-black text-white/40 uppercase tracking-[0.4em]">ROSTER_MGMT</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end gap-2 md:gap-3 w-full md:w-auto">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex bg-white/[0.03] p-0.5 md:p-1 rounded-lg md:rounded-[16px] border border-white/10 backdrop-blur-xl w-full md:w-auto overflow-x-auto scrollbar-hide"
                        >
                            {['T20', 'List A', 'First Class'].map((cat) => (
                                <button 
                                    key={cat} 
                                    onClick={() => setCategory(cat as any)} 
                                    className={`flex-1 md:flex-none px-2 md:px-6 py-1 md:py-2 rounded-md md:rounded-[14px] text-[5px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                                        category === cat 
                                        ? 'bg-white text-black shadow-xl' 
                                        : 'text-white/30 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </motion.div>
                        <select
                            value={selectedFormat}
                            onChange={(e) => setSelectedFormat(e.target.value as Format)}
                            className="bg-white/[0.03] border border-white/10 px-2 md:px-4 py-1 md:py-1.5 rounded-full text-[5px] md:text-[9px] font-black uppercase tracking-widest text-white/60 outline-none cursor-pointer hover:bg-white/[0.08] transition-all w-full md:w-auto"
                        >
                            {getFormatsForCategory(category).map(f => (
                                <option key={f} value={f} className="bg-[#050808]">{f}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Team Ratings Summary */}
                {teamRatings && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 relative z-10">
                        {[
                            { label: 'STRENGTH', value: teamRatings.strength, icon: <Icons.Activity className="w-1.5 h-1.5 md:w-2.5 md:h-2.5" /> },
                            { label: 'BOWLING', value: teamRatings.bowling, icon: <Icons.Target className="w-1.5 h-1.5 md:w-2.5 md:h-2.5" /> },
                            { label: 'BATTING', value: teamRatings.batting, icon: <Icons.Zap className="w-1.5 h-1.5 md:w-2.5 md:h-2.5" /> },
                            { label: 'STARS', value: teamRatings.starPlayers, icon: <Icons.Trophy className="w-1.5 h-1.5 md:w-2.5 md:h-2.5" /> }
                        ].map(stat => (
                            <motion.div 
                                key={stat.label} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.03] border border-white/10 p-1.5 md:p-4 rounded-lg md:rounded-[20px] hover:bg-white/[0.06] transition-all duration-500 group"
                            >
                                <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-2">
                                    <span className="text-teal-500 group-hover:scale-110 transition-transform">{stat.icon}</span>
                                    <p className="text-[5px] md:text-[8px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
                                </div>
                                <p className="text-sm md:text-2xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-3 md:p-10 scrollbar-hide relative z-10">
                {isDomesticOnlyFormat && (
                    <div className="mb-3 md:mb-12 p-2 md:p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg md:rounded-[32px] flex items-center gap-2 md:gap-6">
                        <Icons.AlertTriangle className="text-yellow-500 w-3 h-3 md:w-8 md:h-8" />
                        <div>
                            <p className="text-[6px] md:text-[11px] font-black text-yellow-500 uppercase tracking-widest mb-0.5 md:mb-1">DOMESTIC_PROTOCOL_ACTIVE</p>
                            <p className="text-[5px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">ONLY_LOCAL_ASSETS_PERMITTED_IN_THIS_FORMAT</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4 md:space-y-16">
                    {/* Playing XI Section */}
                    <section className="space-y-2 md:space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 md:gap-6">
                                <h3 className="text-[6px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/20">PLAYING_XI</h3>
                                <div className="h-[1px] bg-white/5 w-6 md:w-32"></div>
                                <span className="text-[6px] md:text-[11px] font-black text-teal-500 italic tracking-tighter">{playingXI.length}/11</span>
                            </div>
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const newXI = generateAutoXI(selectedTeam.squad, selectedFormat);
                                    handleUpdatePlayingXI(selectedTeam.id, selectedFormat, newXI.map(p => p.id));
                                    showFeedback("Auto-generated a balanced XI!", "success");
                                }}
                                className="bg-white/5 border border-white/10 px-2 md:px-6 py-1 md:py-3 rounded-lg md:rounded-2xl text-[5px] md:text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-teal-500 hover:text-black hover:border-teal-500 transition-all duration-500 w-full sm:w-auto"
                            >
                                AUTO_SELECT_OPTIMAL
                            </motion.button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6">
                            <AnimatePresence mode="popLayout">
                                {playingXI.map((player, idx) => renderPlayerCard(player, true, idx))}
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* Bench Section */}
                    <section className="space-y-2 md:space-y-8">
                        <div className="flex items-center gap-2 md:gap-6">
                            <h3 className="text-[6px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/20">RESERVE_BENCH</h3>
                            <div className="h-[1px] bg-white/5 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6">
                            <AnimatePresence mode="popLayout">
                                {bench.map((player, idx) => renderPlayerCard(player, false, idx))}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="px-3 md:px-10 py-1.5 md:py-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-1.5">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className={`w-1 h-1 md:w-3 md:h-3 rounded-full animate-pulse ${playerToSwap ? 'bg-teal-500' : 'bg-white/20'}`} />
                    <p className="text-[5px] md:text-[10px] font-black uppercase tracking-widest text-white/40 text-center sm:text-left">
                        {playerToSwap ? `SELECT_TARGET_FOR_SWAP_WITH_${playerToSwap.name.toUpperCase()}` : 'TAP_ASSET_TO_INITIALIZE_TRANSFER'}
                    </p>
                </div>
                <div className="text-center sm:text-right">
                    <p className="text-[4px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-0 md:mb-1">SYSTEM_STATUS</p>
                    <p className="text-[6px] md:text-[11px] font-black text-teal-500 uppercase tracking-widest">ROSTER_DNA_VERIFIED</p>
                </div>
            </div>
        </div>
    );
};

export default Lineups;
