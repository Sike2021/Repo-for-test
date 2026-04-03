
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameData, Player, PlayerRole, Format, BattingStyle, ScoreLimits, Ground } from '../types';
import { getBatterTier, BATTING_PROFILES, getRoleColor, getRoleFullName, getBattingStyleLabel, BATTING_STYLE_OPTIONS } from '../utils';
import { PITCH_TYPES, generateInitialStats } from '../data';
import { PlayerAvatar } from './PlayerAvatar';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Icons } from './Icons';

interface EditorProps {
    gameData: GameData;
    handleUpdatePlayer: (player: Player) => void;
    handleCreatePlayer: (player: Player) => void;
    handleUpdateGround: (code: string, updates: Partial<Ground> | string) => void;
    handleUpdateScoreLimits: (groundCode: string, format: Format, field: keyof ScoreLimits, value: any, inning: number) => void;
}

const Editor: React.FC<EditorProps> = ({ gameData, handleUpdatePlayer, handleCreatePlayer, handleUpdateGround, handleUpdateScoreLimits }) => {
    const [editType, setEditType] = useState<'players' | 'grounds' | 'rules'>('players');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editorFormatTab, setEditorFormatTab] = useState<Format>(Format.T20);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedPlayer) return;

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${selectedPlayer.id}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setSelectedPlayer(prev => prev ? { ...prev, avatarUrl: url } : null);
        } catch (error) {
            console.error("Error uploading photo:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const getPlayerProfileForFormat = useCallback((player: Player, format: Format) => {
        const custom = player.customProfiles?.[format];
        if (custom && custom.avg > 0 && custom.sr > 0) {
            return custom;
        }
        const tier = getBatterTier(player.battingSkill);
        const style = player.style;
        return BATTING_PROFILES[format][tier][style] || BATTING_PROFILES[format][tier]['N'];
    }, []);

    const handleProfileChange = (field: 'avg' | 'sr', value: string) => {
        if (!selectedPlayer) return;
        const numericValue = value ? parseFloat(value) : 0;
        if (isNaN(numericValue)) return;

        setSelectedPlayer(prev => {
            if (!prev) return null;
            const newProfiles = { ...(prev.customProfiles || {}) };
            const newFormatProfile = { avg: 0, sr: 0, ...(newProfiles[editorFormatTab] || {}) };
            newFormatProfile[field] = numericValue;

            if (newFormatProfile.avg <= 0 && newFormatProfile.sr <= 0) {
                delete newProfiles[editorFormatTab];
            } else {
                newProfiles[editorFormatTab] = newFormatProfile;
            }

            if (Object.keys(newProfiles).length === 0) {
                const updatedPlayer = {...prev};
                delete updatedPlayer.customProfiles;
                return updatedPlayer;
            }
            return { ...prev, customProfiles: newProfiles };
        });
    };

    const handleSelectPlayer = (playerId: string) => {
        setIsCreating(false);
        setSelectedPlayer(gameData.allPlayers.find(p => p.id === playerId) || null);
    };

    const handleAddNewPlayer = () => {
        setIsCreating(true);
        setSelectedPlayer({
            id: `new-player-${Date.now()}`,
            name: '',
            nationality: 'Local',
            role: PlayerRole.BATSMAN,
            battingSkill: 50,
            secondarySkill: 10,
            style: 'N',
            isOpener: false,
            isForeign: false,
            stats: generateInitialStats(),
            recentPerformances: []
        });
    }

    const savePlayer = () => {
        if (!selectedPlayer) return;
        if (isCreating) {
            handleCreatePlayer(selectedPlayer);
        } else {
            handleUpdatePlayer(selectedPlayer);
        }
        setSelectedPlayer(null);
        setIsCreating(false);
    }

    const handleGroundChange = (code: string, field: keyof Ground, value: any) => {
        if (field === 'pitch') {
            // Maintain backward compatibility if the function expects a string for pitch only
            // But prefer object update
            handleUpdateGround(code, { pitch: value });
        } else {
            handleUpdateGround(code, { [field]: value });
        }
    };

    const renderPlayerEditor = () => {
        if (!selectedPlayer) return null;

        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-screen bg-[#050808] text-[#E4E3E0] font-sans p-6 md:p-12"
            >
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-8 bg-teal-500 rounded-full" />
                                <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white">PLAYER_LAB</h2>
                            </div>
                            <p className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5">GENETIC_MODIFICATION_ACTIVE // v2.6.0</p>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button 
                                onClick={() => setSelectedPlayer(null)}
                                className="flex-1 md:flex-none px-10 py-4 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] bg-white/[0.03] border border-white/10 text-white/40 hover:bg-white/[0.08] hover:text-white transition-all duration-300"
                            >
                                DISCARD_CHANGES
                            </button>
                            <button 
                                onClick={savePlayer}
                                className="flex-1 md:flex-none px-12 py-4 rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] bg-teal-500 text-black shadow-[0_20px_40px_rgba(20,184,166,0.2)] hover:bg-teal-400 hover:-translate-y-1 transition-all duration-300"
                            >
                                COMMIT_SYNTHESIS
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left Column: Avatar Maker */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white/[0.02] rounded-[48px] p-10 border border-white/10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700">
                                    <Icons.Database className="w-48 h-48" />
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-teal-500/50 mb-12 text-center">AVATAR_SYNTHESIS_ENGINE</h3>
                                    
                                    {/* Main Avatar Display */}
                                    <div className="relative flex justify-center items-center mb-16">
                                        <div className="absolute inset-0 bg-teal-500/5 blur-[120px] rounded-full animate-pulse" />
                                        
                                        <div className="relative">
                                            {/* DNA Helix Decoration */}
                                            <div className="absolute -inset-12 border border-teal-500/10 rounded-full animate-[spin_60s_linear_infinite]" />
                                            <div className="absolute -inset-8 border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                                            <div className="absolute -inset-4 border border-teal-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                                            
                                            <motion.div 
                                                key={selectedPlayer.avatarSeed}
                                                initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                                transition={{ type: "spring", damping: 15 }}
                                                className="relative z-10"
                                            >
                                                <div className="relative group/avatar">
                                                    <PlayerAvatar player={selectedPlayer} size="xl" className="w-72 h-72 border-[12px] border-white/5 shadow-[0_60px_100px_rgba(0,0,0,0.8)] rounded-full transition-transform duration-700 group-hover/avatar:scale-105" />
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500/20 to-transparent opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                                </div>
                                                
                                                <motion.button 
                                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute -bottom-4 -right-4 bg-teal-500 text-black p-6 rounded-[24px] shadow-[0_20px_40px_rgba(20,184,166,0.4)] z-20 hover:bg-white transition-all duration-500 group/edit"
                                                >
                                                    <Icons.Database size={28} className="group-hover/edit:scale-110 transition-transform" />
                                                </motion.button>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-1 rounded-full bg-teal-500 animate-ping" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">DNA_SEQUENCES</span>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedPlayer({...selectedPlayer, avatarSeed: `seed-${Math.random()}`})}
                                                className="text-[10px] font-black uppercase tracking-widest text-teal-500 hover:text-white transition-all duration-300 flex items-center gap-3 group/regen"
                                            >
                                                <Icons.RefreshCw size={14} className="group-hover/regen:rotate-180 transition-transform duration-700" />
                                                MUTATE_GENOME
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-4 gap-4 px-2">
                                            {[1, 2, 3, 4].map(i => (
                                                <motion.button 
                                                    key={i}
                                                    whileHover={{ scale: 1.1, y: -5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setSelectedPlayer({...selectedPlayer, avatarSeed: `seed-${selectedPlayer.id}-${i}-${Math.random()}`})}
                                                    className="aspect-square rounded-[24px] bg-white/[0.03] border border-white/10 hover:border-teal-500/50 hover:bg-white/[0.08] transition-all duration-500 overflow-hidden p-1.5 group/thumb shadow-xl"
                                                >
                                                    <div className="w-full h-full rounded-[18px] overflow-hidden opacity-30 group-hover/thumb:opacity-100 transition-opacity">
                                                        <PlayerAvatar player={{...selectedPlayer, avatarSeed: `preview-${i}-${selectedPlayer.id}`}} size="sm" className="w-full h-full" />
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>

                                        <div className="pt-8">
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full py-7 bg-white/[0.03] hover:bg-teal-500 hover:text-black rounded-[28px] font-black uppercase tracking-[0.4em] text-[11px] transition-all duration-500 border border-white/10 flex items-center justify-center gap-5 group/upload shadow-2xl"
                                            >
                                                <Icons.Database size={18} className="group-hover/upload:rotate-12 transition-transform" />
                                                {isUploading ? 'SYNTHESIZING_DNA...' : 'INJECT_EXTERNAL_DNA'}
                                            </button>
                                            <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Details & Skills */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Basic Info */}
                            <div className="bg-white/[0.02] rounded-[48px] p-10 border border-white/10 backdrop-blur-3xl shadow-2xl">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30">CORE_IDENTITY_MATRIX</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                    <div className="md:col-span-8">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 block ml-4">DESIGNATION_ID</label>
                                        <input 
                                            type="text" 
                                            value={selectedPlayer.name} 
                                            onChange={e => setSelectedPlayer({...selectedPlayer, name: e.target.value})}
                                            className="w-full px-10 py-8 bg-white/[0.03] border border-white/10 rounded-[32px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter transition-all duration-500 text-4xl text-white placeholder:text-white/5 shadow-inner"
                                            placeholder="ENTER_NAME..."
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 block ml-4">CHRONO_AGE</label>
                                        <input 
                                            type="number" 
                                            value={selectedPlayer.age || 25} 
                                            onChange={e => setSelectedPlayer({...selectedPlayer, age: +e.target.value})}
                                            className="w-full px-10 py-8 bg-white/[0.03] border border-white/10 rounded-[32px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic transition-all duration-500 text-4xl text-white shadow-inner"
                                        />
                                    </div>
                                    <div className="md:col-span-12">
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-4 block ml-4">FRANCHISE_ASSIGNMENT</label>
                                        <div className="relative">
                                            <select 
                                                value={selectedPlayer.teamName || ''} 
                                                onChange={e => setSelectedPlayer({...selectedPlayer, teamName: e.target.value})}
                                                className="w-full px-10 py-8 bg-white/[0.03] border border-white/10 rounded-[32px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter transition-all duration-500 text-2xl text-white appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="" className="bg-[#050808]">UNASSIGNED_ASSET</option>
                                                {gameData.teams.map(t => <option key={t.id} value={t.name} className="bg-[#050808]">{t.name}</option>)}
                                            </select>
                                            <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                <Icons.ChevronRight className="rotate-90" size={24} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Attributes & Skills */}
                            <div className="bg-white/[0.02] rounded-[48px] p-10 border border-white/10 backdrop-blur-3xl shadow-2xl">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30">TACTICAL_ATTRIBUTES_INDEX</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 block ml-2">PRIMARY_ROLE</label>
                                        <div className="relative">
                                            <select 
                                                value={selectedPlayer.role} 
                                                onChange={e => setSelectedPlayer({...selectedPlayer, role: e.target.value as PlayerRole})}
                                                className="w-full px-8 py-6 bg-white/[0.03] border border-white/10 rounded-[24px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter transition-all duration-500 text-xl text-white appearance-none cursor-pointer"
                                            >
                                                {Object.values(PlayerRole).map(r => <option key={r} value={r} className="bg-[#050808]">{getRoleFullName(r)}</option>)}
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                <Icons.ChevronRight className="rotate-90" size={18} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 block ml-2">BATTING_STYLE</label>
                                        <div className="relative">
                                            <select 
                                                value={selectedPlayer.style} 
                                                onChange={e => setSelectedPlayer({...selectedPlayer, style: e.target.value as BattingStyle})}
                                                className="w-full px-8 py-6 bg-white/[0.03] border border-white/10 rounded-[24px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter transition-all duration-500 text-xl text-white appearance-none cursor-pointer"
                                            >
                                                {BATTING_STYLE_OPTIONS.map(s => <option key={s} value={s} className="bg-[#050808]">{getBattingStyleLabel(s)}</option>)}
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                <Icons.ChevronRight className="rotate-90" size={18} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                                    {[
                                        { label: 'BATTING_POWER', key: 'battingSkill', value: selectedPlayer.battingSkill, color: 'from-teal-500 to-teal-700' },
                                        { label: 'BOWLING_SPEED', key: 'secondarySkill', value: selectedPlayer.secondarySkill, color: 'from-red-500 to-red-700' },
                                        { label: 'FIELDING_REFLEX', key: 'fielding', value: selectedPlayer.fielding || 50, color: 'from-blue-500 to-blue-700' },
                                        { label: 'ACCURACY_INDEX', key: 'accuracy', value: selectedPlayer.accuracy || 50, color: 'from-yellow-500 to-yellow-700' }
                                    ].map(skill => (
                                        <div key={skill.key} className="group/skill">
                                            <div className="flex justify-between items-end mb-5">
                                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/skill:text-white/60 transition-colors">{skill.label}</label>
                                                <span className="text-2xl font-black font-mono text-white tracking-tighter">{skill.value}<span className="text-[10px] text-white/20 ml-1">%</span></span>
                                            </div>
                                            <div className="relative h-3 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${skill.value}%` }}
                                                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                                                    className={`absolute inset-y-0 left-0 bg-gradient-to-r ${skill.color} shadow-[0_0_20px_rgba(20,184,166,0.2)]`}
                                                />
                                                <input 
                                                    type="range" 
                                                    min="1" max="99" 
                                                    value={skill.value} 
                                                    onChange={e => setSelectedPlayer({...selectedPlayer, [skill.key]: +e.target.value})}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (selectedPlayer) return renderPlayerEditor();

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden">
            {/* Header */}
            <div className="px-10 py-12 border-b border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-white/[0.01] backdrop-blur-3xl">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-8 bg-teal-500 rounded-full" />
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">CENTRAL_EDITOR</h1>
                    </div>
                    <p className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5">SYSTEM_CONFIGURATION_INTERFACE // v2.6.0</p>
                </div>
                <div className="flex bg-white/[0.03] p-2 rounded-[24px] border border-white/10 backdrop-blur-xl shadow-2xl">
                    {(['players', 'grounds', 'rules'] as const).map(type => (
                        <button 
                            key={type}
                            onClick={() => setEditType(type)}
                            className={`px-10 py-4 rounded-[18px] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-500 ${editType === type ? 'bg-teal-500 text-black shadow-[0_10px_30px_rgba(20,184,166,0.3)]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-hide">
                <div className="max-w-7xl mx-auto">
                    {editType === 'players' && (
                        <div className="space-y-12">
                            <motion.button 
                                whileHover={{ scale: 1.01, y: -4 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleAddNewPlayer} 
                                className="w-full py-10 bg-white text-black rounded-[40px] font-black uppercase italic tracking-[0.2em] text-lg hover:bg-teal-500 hover:text-white transition-all duration-500 shadow-[0_30px_60px_rgba(0,0,0,0.3)] flex items-center justify-center gap-6 group"
                            >
                                <div className="w-12 h-12 bg-black/5 rounded-2xl flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                                    <Icons.Plus size={32} />
                                </div>
                                CREATE_NEW_PLAYER_ASSET
                            </motion.button>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {gameData.allPlayers.map((p, idx) => (
                                    <motion.div 
                                        key={p.id} 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        onClick={() => handleSelectPlayer(p.id)} 
                                        className="bg-white/[0.02] p-8 rounded-[40px] border border-white/10 cursor-pointer hover:bg-white/[0.06] hover:border-teal-500/40 transition-all duration-500 group shadow-xl"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <PlayerAvatar player={p} size="md" className="w-20 h-20 border-4 border-white/5 relative z-10" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white truncate group-hover:text-teal-500 transition-colors">{p.name}</h4>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border border-white/10 ${getRoleColor(p.role)} bg-white/5`}>{p.role}</span>
                                                    <span className="text-[9px] font-mono font-black text-white/20 uppercase tracking-widest">{p.nationality}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-mono font-black text-white/10 uppercase tracking-widest mb-1">RATING</p>
                                                <p className="text-3xl font-black italic text-teal-500 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]">{p.battingSkill}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {editType === 'grounds' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {gameData.grounds.map((g, idx) => (
                                <motion.div 
                                    key={g.code}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/[0.02] p-10 rounded-[48px] border border-white/10 backdrop-blur-3xl shadow-2xl group"
                                >
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white group-hover:text-teal-500 transition-colors">{g.name}</h3>
                                            <p className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.3em] mt-2">VENUE_CODE: {g.code}</p>
                                        </div>
                                        <div className="w-16 h-16 bg-white/[0.03] rounded-[24px] flex items-center justify-center text-white/20 border border-white/5 group-hover:text-teal-500 group-hover:border-teal-500/30 transition-all duration-500">
                                            <Icons.Venue size={32} />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-8">
                                        <div className="group/field">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 block ml-2 group-hover/field:text-white/40 transition-colors">PITCH_COMPOSITION</label>
                                            <div className="relative">
                                                <select 
                                                    value={g.pitch} 
                                                    onChange={e => handleGroundChange(g.code, 'pitch', e.target.value)} 
                                                    className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-[20px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter text-lg text-white appearance-none cursor-pointer transition-all duration-500"
                                                >
                                                    {PITCH_TYPES.map(pt => <option key={pt} value={pt} className="bg-[#050808]">{pt}</option>)}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                    <Icons.ChevronRight className="rotate-90" size={18} />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="group/field">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 block ml-2 group-hover/field:text-white/40 transition-colors">ATMOSPHERE</label>
                                                <div className="relative">
                                                    <select 
                                                        value={g.weather || 'Sunny'} 
                                                        onChange={e => handleGroundChange(g.code, 'weather', e.target.value)} 
                                                        className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-[20px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter text-lg text-white appearance-none cursor-pointer transition-all duration-500"
                                                    >
                                                        {['Sunny', 'Overcast', 'Rainy', 'Humid', 'Dry'].map(w => <option key={w} value={w} className="bg-[#050808]">{w}</option>)}
                                                    </select>
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                        <Icons.ChevronRight className="rotate-90" size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="group/field">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 block ml-2 group-hover/field:text-white/40 transition-colors">OUTFIELD_FRICTION</label>
                                                <div className="relative">
                                                    <select 
                                                        value={g.outfieldSpeed || 'Medium'} 
                                                        onChange={e => handleGroundChange(g.code, 'outfieldSpeed', e.target.value)} 
                                                        className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-[20px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter text-lg text-white appearance-none cursor-pointer transition-all duration-500"
                                                    >
                                                        {['Fast', 'Medium', 'Slow', 'Lightning'].map(s => <option key={s} value={s} className="bg-[#050808]">{s}</option>)}
                                                    </select>
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                        <Icons.ChevronRight className="rotate-90" size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="group/field">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 block ml-2 group-hover/field:text-white/40 transition-colors">BOUNDARY_SCALE</label>
                                                <div className="relative">
                                                    <select 
                                                        value={g.boundarySize || 'Medium'} 
                                                        onChange={e => handleGroundChange(g.code, 'boundarySize', e.target.value)} 
                                                        className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-[20px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter text-lg text-white appearance-none cursor-pointer transition-all duration-500"
                                                    >
                                                        {['Small', 'Medium', 'Large'].map(s => <option key={s} value={s} className="bg-[#050808]">{s}</option>)}
                                                    </select>
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                        <Icons.ChevronRight className="rotate-90" size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="group/field">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 block ml-2 group-hover/field:text-white/40 transition-colors">SPATIAL_DIMENSIONS</label>
                                                <input 
                                                    type="text" 
                                                    value={g.dimensions || ''} 
                                                    onChange={e => handleGroundChange(g.code, 'dimensions', e.target.value)} 
                                                    className="w-full px-6 py-5 bg-white/[0.03] border border-white/10 rounded-[20px] focus:bg-white/[0.08] focus:border-teal-500 outline-none font-black italic uppercase tracking-tighter text-lg text-white transition-all duration-500" 
                                                    placeholder="E.G. 70M / 65M" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {editType === 'rules' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {gameData.grounds.map((g, idx) => (
                                <motion.div 
                                    key={g.code}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white/[0.02] p-12 rounded-[48px] border border-white/10 backdrop-blur-3xl shadow-2xl"
                                >
                                    <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{g.name}</h3>
                                    </div>
                                    
                                    <div className="space-y-12">
                                        {Object.values(Format).map(format => (
                                            <div key={format} className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-[1px] bg-white/10" />
                                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">{format}_PROTOCOL</p>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {(format === Format.SHIELD ? [1, 2, 3, 4] : [1, 2]).map(inning => (
                                                        <div key={inning} className="bg-white/[0.03] p-6 rounded-[24px] border border-white/5 hover:bg-white/[0.06] transition-all duration-500">
                                                            <p className="text-[10px] font-mono font-black text-teal-500/40 uppercase tracking-[0.2em] mb-5">PHASE_{inning}</p>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div>
                                                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2 ml-1">MAX_RUNS</label>
                                                                    <input 
                                                                        type="number" 
                                                                        value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxRuns || ''}
                                                                        onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxRuns', e.target.value, inning)}
                                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm font-black italic outline-none focus:border-teal-500 transition-all"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-2 ml-1">MAX_WKTS</label>
                                                                    <input 
                                                                        type="number"
                                                                        value={gameData.scoreLimits?.[g.code]?.[format]?.[inning]?.maxWickets || ''}
                                                                        onChange={(e) => handleUpdateScoreLimits(g.code, format, 'maxWickets', e.target.value, inning)}
                                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-sm font-black italic outline-none focus:border-teal-500 transition-all"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Editor;