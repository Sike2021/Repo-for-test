
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

    if (selectedPlayer) {
        return (
            <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
                {/* Background Accents */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                    <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
                </div>

                <header className="px-5 py-6 md:px-6 md:py-8 border-b border-white/5 relative z-10 flex justify-between items-center">
                    <div className="flex flex-col gap-0.5 md:gap-1">
                        <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-teal-500/60">
                            ASSET_MOD // v2.6.0
                        </h2>
                        <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">PLAYER EDITOR</h1>
                    </div>
                    <div className="flex gap-2 md:gap-3">
                        <button onClick={() => setSelectedPlayer(null)} className="p-2.5 md:p-3 bg-white/5 rounded-lg md:rounded-xl border border-white/10 text-white/40">
                            <Icons.X size={18} md:size={20} />
                        </button>
                        <button onClick={savePlayer} className="p-2.5 md:p-3 bg-teal-500 rounded-lg md:rounded-xl text-black shadow-lg">
                            <Icons.Check size={18} md:size={20} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 md:space-y-8 scrollbar-hide pb-10 relative z-10">
                    <div className="bg-white/[0.03] border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 flex flex-col items-center text-center backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-4 left-4 md:top-6 md:left-6 text-[8px] md:text-[10px] font-black text-teal-500/40 uppercase tracking-[0.3em]">DOM</div>
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 text-[8px] md:text-[10px] font-black text-teal-500/40 uppercase tracking-[0.3em]">{selectedPlayer.role.toUpperCase()} // DOM</div>

                        <div className="relative mb-4 md:mb-6">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-teal-500/20 p-1.5 md:p-2 shadow-[0_0_40px_rgba(20,184,166,0.1)]">
                                <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center p-3 md:p-4 overflow-hidden">
                                    <PlayerAvatar player={selectedPlayer} size="md" className="w-full h-full" />
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedPlayer({...selectedPlayer, avatarSeed: `seed-${Math.random()}`})}
                                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-teal-500 text-black px-3 md:px-4 py-0.5 md:py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1.5 md:gap-2"
                            >
                                <Icons.RefreshCw size={10} md:size={12} />
                                MUTATE
                            </button>
                        </div>

                        <div className="w-full space-y-4 md:space-y-6">
                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">PLAYER_NAME</label>
                                <input 
                                    type="text" 
                                    value={selectedPlayer.name}
                                    onChange={(e) => setSelectedPlayer({ ...selectedPlayer, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-black text-white outline-none focus:border-teal-500 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5 md:space-y-2 text-left">
                                <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">ASSET_ROLE</label>
                                <select 
                                    value={selectedPlayer.role}
                                    onChange={(e) => setSelectedPlayer({ ...selectedPlayer, role: e.target.value as any })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-black text-white outline-none focus:border-teal-500 transition-all appearance-none"
                                >
                                    {Object.values(PlayerRole).map(r => <option key={r} value={r} className="bg-[#050808]">{getRoleFullName(r)}</option>)}
                                </select>
                            </div>

                            <div className="space-y-4 md:space-y-6 pt-2 md:pt-4">
                                {[
                                    { label: 'BATTING_POWER', key: 'battingSkill' },
                                    { label: 'BOWLING_SPEED', key: 'secondarySkill' },
                                    { label: 'OVERALL_RATING', key: 'rating' }
                                ].map((attr) => (
                                    <div key={attr.key} className="space-y-2 md:space-y-3">
                                        <div className="flex justify-between text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/40">
                                            <span>{attr.label}</span>
                                            <span>{selectedPlayer[attr.key as keyof Player] as number || 0}</span>
                                        </div>
                                        <input 
                                            type="range" min="1" max="99" 
                                            value={selectedPlayer[attr.key as keyof Player] as number || 0}
                                            onChange={(e) => setSelectedPlayer({ ...selectedPlayer, [attr.key]: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-white/5 rounded-full appearance-none accent-teal-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        SYSTEM_CONFIG // v2.6.0
                    </h2>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">CENTRAL EDITOR</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 md:space-y-6 scrollbar-hide pb-10 relative z-10">
                {/* Mode Selector */}
                <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/10">
                    {(['players', 'grounds', 'rules'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setEditType(m)}
                            className={`flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                                editType === m ? 'bg-teal-500 text-black shadow-lg' : 'text-white/40 hover:text-white/60'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {editType === 'players' && (
                    <div className="space-y-3 md:space-y-4">
                        <button 
                            onClick={handleAddNewPlayer}
                            className="w-full py-5 md:py-6 bg-white text-black rounded-2xl md:rounded-3xl font-black uppercase italic tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 md:gap-3 shadow-xl"
                        >
                            <Icons.Plus size={18} md:size={20} />
                            CREATE_NEW_ASSET
                        </button>
                        <div className="grid grid-cols-1 gap-2 md:gap-3">
                            {gameData.allPlayers.map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => handleSelectPlayer(p.id)}
                                    className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 group active:scale-95 transition-all"
                                >
                                    <PlayerAvatar player={p} size="sm" className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/10" />
                                    <div className="flex-1">
                                        <h4 className="text-base md:text-lg font-black italic uppercase tracking-tighter text-white">{p.name}</h4>
                                        <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">{p.role}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg md:text-xl font-black italic text-teal-500">{p.battingSkill}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {editType === 'grounds' && (
                    <div className="space-y-3 md:space-y-4">
                        {gameData.grounds.map(g => (
                            <div key={g.code} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[28px] md:rounded-[32px] space-y-5 md:space-y-6">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                        <Icons.Venue size={18} md:size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={g.name}
                                            onChange={(e) => handleGroundChange(g.code, 'name', e.target.value)}
                                            className="w-full bg-transparent border-none text-lg md:text-xl font-black italic uppercase tracking-tighter text-white outline-none"
                                        />
                                        <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">{g.code}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 md:gap-3">
                                    <select 
                                        value={g.pitch}
                                        onChange={(e) => handleGroundChange(g.code, 'pitch', e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black text-white outline-none"
                                    >
                                        {PITCH_TYPES.map(pt => <option key={pt} value={pt} className="bg-[#050808]">{pt}</option>)}
                                    </select>
                                    <select 
                                        value={g.boundarySize || 'Medium'}
                                        onChange={(e) => handleGroundChange(g.code, 'boundarySize', e.target.value)}
                                        className="bg-white/5 border border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-black text-white outline-none"
                                    >
                                        {['Small', 'Medium', 'Large'].map(s => <option key={s} value={s} className="bg-[#050808]">{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {editType === 'rules' && (
                    <div className="space-y-5 md:space-y-6">
                        {gameData.grounds.map(g => (
                            <div key={g.code} className="bg-white/5 border border-white/10 p-5 md:p-6 rounded-[28px] md:rounded-[32px] space-y-5 md:space-y-6">
                                <h3 className="text-lg md:text-xl font-black italic uppercase tracking-tighter text-teal-500">{g.name}</h3>
                                <div className="space-y-3 md:space-y-4">
                                    {Object.values(Format).map(f => (
                                        <div key={f} className="space-y-2 md:space-y-3">
                                            <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">{f} PROTOCOL</p>
                                            <div className="grid grid-cols-2 gap-2 md:gap-3">
                                                <div className="space-y-1">
                                                    <label className="text-[7px] md:text-[8px] font-black text-white/10 uppercase ml-2">MAX_RUNS</label>
                                                    <input 
                                                        type="number"
                                                        value={gameData.scoreLimits?.[g.code]?.[f]?.[1]?.maxRuns || ''}
                                                        onChange={(e) => handleUpdateScoreLimits(g.code, f, 'maxRuns', e.target.value, 1)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg md:rounded-xl p-2.5 md:p-3 text-[10px] md:text-xs font-black text-white outline-none"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[7px] md:text-[8px] font-black text-white/10 uppercase ml-2">MAX_WKTS</label>
                                                    <input 
                                                        type="number"
                                                        value={gameData.scoreLimits?.[g.code]?.[f]?.[1]?.maxWickets || ''}
                                                        onChange={(e) => handleUpdateScoreLimits(g.code, f, 'maxWickets', e.target.value, 1)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg md:rounded-xl p-2.5 md:p-3 text-[10px] md:text-xs font-black text-white outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Editor;