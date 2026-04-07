import React, { useState, useMemo } from 'react';
import { GameData, Player, PlayerCustomization, PlayerRole } from '../types';
import { AVATAR_SEEDS } from '../constants';
import { generateInitialStats } from '../data';
import { PlayerAvatar } from './PlayerAvatar';
import AvatarSelector from './AvatarSelector';
import { motion, AnimatePresence } from 'motion/react';
import { Check, User, Shield, Settings2, Palette, Scissors, UserCircle, Image as ImageIcon, ArrowLeft, Globe, ChevronLeft, ChevronRight, RotateCcw, Save, Search, Filter, Plus } from 'lucide-react';

interface CustomizationHubProps {
    gameData: GameData;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
    setScreen: (screen: any) => void;
}

const getRandomCustomization = (hairColors: string[]): PlayerCustomization => {
    return {
        faceShape: Math.floor(Math.random() * 3),
        skinTone: Math.floor(Math.random() * 6),
        hairStyle: Math.floor(Math.random() * 10),
        hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
        beardStyle: Math.floor(Math.random() * 10),
        beardColor: hairColors[Math.floor(Math.random() * hairColors.length)],
        mustacheStyle: Math.floor(Math.random() * 10),
        mustacheColor: hairColors[Math.floor(Math.random() * hairColors.length)],
        eyeColor: ['#111', '#422006', '#1e3a8a', '#14532d', '#4b5563'][Math.floor(Math.random() * 5)],
        facialHair: 0,
        facialHairColor: '#090806'
    };
};

const CustomizationHub: React.FC<CustomizationHubProps> = ({ gameData, setGameData, setScreen }) => {
    const userTeam = gameData.teams.find(t => t.id === gameData.userTeamId);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(userTeam?.squad[0]?.id || null);
    const [activeTab, setActiveTab] = useState<'avatar' | 'manual' | 'details'>('avatar');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllPlayers, setShowAllPlayers] = useState(false);
    const [teamName, setTeamName] = useState(userTeam?.name || '');

    const selectedPlayer = gameData.allPlayers.find(p => p.id === selectedPlayerId);

    const filteredPlayers = useMemo(() => {
        let players = showAllPlayers ? gameData.allPlayers : (userTeam?.squad || []);
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            players = players.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.role.toLowerCase().includes(query) ||
                p.nationality.toLowerCase().includes(query)
            );
        }
        return players;
    }, [showAllPlayers, gameData.allPlayers, userTeam?.squad, searchQuery]);

    const handleUpdateAvatar = (seed: string, isGallery: boolean = false, isUrl: boolean = false, galleryPlayer?: Player) => {
        if (!selectedPlayerId) return;
        
        setGameData(prev => {
            if (!prev) return null;
            const newTeams = prev.teams.map(team => ({
                ...team,
                squad: team.squad.map(p => p.id === selectedPlayerId ? { 
                    ...p, 
                    name: galleryPlayer ? galleryPlayer.name : p.name,
                    nationality: galleryPlayer ? galleryPlayer.nationality : p.nationality,
                    avatarSeed: isUrl ? undefined : seed, 
                    avatarUrl: isUrl ? seed : undefined,
                    customization: undefined 
                } : p)
            }));
            
            const newAllPlayers = prev.allPlayers.map(p => p.id === selectedPlayerId ? { 
                ...p, 
                name: galleryPlayer ? galleryPlayer.name : p.name,
                nationality: galleryPlayer ? galleryPlayer.nationality : p.nationality,
                avatarSeed: isUrl ? undefined : seed, 
                avatarUrl: isUrl ? seed : undefined,
                customization: undefined 
            } : p);
            
            return { ...prev, teams: newTeams, allPlayers: newAllPlayers };
        });
    };

    const handleUpdateCustomization = (updates: Partial<PlayerCustomization>) => {
        if (!selectedPlayerId) return;

        setGameData(prev => {
            if (!prev) return null;
            const newTeams = prev.teams.map(team => ({
                ...team,
                squad: team.squad.map(p => {
                    if (p.id === selectedPlayerId) {
                        const currentCustom = p.customization || {
                            faceShape: 0, skinTone: 0, hairStyle: 1, hairColor: '#090806',
                            beardStyle: 0, beardColor: '#090806', mustacheStyle: 0, mustacheColor: '#090806',
                            eyeColor: '#111', facialHair: 0, facialHairColor: '#090806'
                        };
                        return { 
                            ...p, 
                            avatarSeed: undefined,
                            avatarUrl: undefined,
                            customization: { ...currentCustom, ...updates } 
                        };
                    }
                    return p;
                })
            }));
            
            const newAllPlayers = prev.allPlayers.map(p => {
                if (p.id === selectedPlayerId) {
                    const currentCustom = p.customization || {
                        faceShape: 0, skinTone: 0, hairStyle: 1, hairColor: '#090806',
                        beardStyle: 0, beardColor: '#090806', mustacheStyle: 0, mustacheColor: '#090806',
                        eyeColor: '#111', facialHair: 0, facialHairColor: '#090806'
                    };
                    return { 
                        ...p, 
                        avatarSeed: undefined,
                        avatarUrl: undefined,
                        customization: { ...currentCustom, ...updates } 
                    };
                }
                return p;
            });
            
            return { ...prev, teams: newTeams, allPlayers: newAllPlayers };
        });
    };

    const handleRandomize = () => {
        handleUpdateCustomization(getRandomCustomization(hairColors));
    };

    const handleUpdateTeamName = () => {
        if (!teamName.trim()) return;
        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                teams: prev.teams.map(t => t.id === prev.userTeamId ? { ...t, name: teamName } : t)
            };
        });
    };

    const handleUpdateTeamColor = (color: string) => {
        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                teams: prev.teams.map(t => t.id === prev.userTeamId ? { ...t, color } : t)
            };
        });
    };

    const handleCreatePlayer = () => {
        const newId = `custom-${Date.now()}`;
        const newPlayer: Player = {
            id: newId,
            name: 'New Player',
            nationality: 'Pakistan',
            role: PlayerRole.BATSMAN,
            battingSkill: 50,
            secondarySkill: 50,
            style: 'A',
            isOpener: false,
            isForeign: false,
            isEmerging: false,
            avatarSeed: AVATAR_SEEDS[0],
            stats: generateInitialStats(),
            recentPerformances: []
        };

        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                allPlayers: [...prev.allPlayers, newPlayer]
            };
        });
        setSelectedPlayerId(newId);
        setActiveTab('manual');
    };

    if (!userTeam) return null;

    const skinTones = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642', '#3D2314'];
    const hairColors = [
      '#090806', '#2C1608', '#4E2708', '#A56B46', '#B55239', '#D6C4C2', '#FFFFFF', '#4A4A4A', '#3B82F6', '#EF4444', '#10B981', '#F59E0B'
    ];

    return (
        <div className="h-full bg-slate-950 text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 md:p-6 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setScreen('DASHBOARD')}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black tracking-tighter text-emerald-400 uppercase leading-none">Customization Hub</h2>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Personalize your squad</p>
                    </div>
                </div>
                <div className="flex overflow-x-auto w-full md:w-auto gap-2 pb-2 md:pb-0 scrollbar-hide">
                    <button 
                        onClick={() => setActiveTab('avatar')}
                        className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'avatar' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <User size={14} /> Avatar
                    </button>
                    <button 
                        onClick={() => setActiveTab('manual')}
                        className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'manual' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Settings2 size={14} /> Manual
                    </button>
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'details' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Shield size={14} /> Team
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Player List Sidebar */}
                <div className="h-48 md:h-full w-full md:w-72 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-4 space-y-4 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Player Selection</h3>
                            <div className="flex gap-1">
                                <button 
                                    onClick={handleCreatePlayer}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black p-1.5 rounded transition-all"
                                    title="Add New Player"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                                <button 
                                    onClick={() => setShowAllPlayers(!showAllPlayers)}
                                    className={`text-[8px] font-black uppercase px-2 py-1 rounded transition-all ${showAllPlayers ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}
                                >
                                    {showAllPlayers ? 'All' : 'Squad'}
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                            <input 
                                type="text"
                                placeholder="Search players..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800 border border-white/5 rounded-lg pl-8 pr-4 py-2 text-[10px] font-bold uppercase outline-none focus:border-emerald-500/50 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto md:overflow-y-auto p-3 md:p-4 flex md:flex-col gap-2 scrollbar-hide custom-scrollbar">
                        {filteredPlayers.length > 0 ? (
                            filteredPlayers.map(player => (
                                <button
                                    key={player.id}
                                    onClick={() => setSelectedPlayerId(player.id)}
                                    className={`flex-shrink-0 md:flex-shrink md:w-full flex items-center gap-3 p-2 rounded-xl transition-all ${selectedPlayerId === player.id ? 'bg-emerald-500/10 border border-emerald-500/50' : 'hover:bg-slate-800 border border-transparent'}`}
                                >
                                    <PlayerAvatar player={player} size="sm" />
                                    <div className="text-left hidden md:block overflow-hidden">
                                        <div className={`text-xs font-black uppercase truncate ${selectedPlayerId === player.id ? 'text-emerald-400' : 'text-white'}`}>
                                            {player.name}
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-500 uppercase truncate">{player.role} • {player.nationality}</div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 py-10">
                                <Filter size={24} className="mb-2 opacity-20" />
                                <span className="text-[8px] font-black uppercase tracking-widest">No players found</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Editor Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_50%)] from-emerald-500/5">
                    <AnimatePresence mode="wait">
                        {activeTab === 'avatar' && selectedPlayer ? (
                            <motion.div 
                                key="avatar-tab"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto"
                            >
                                <div className="flex flex-col md:flex-row gap-12 items-start">
                                    {/* Preview Card */}
                                    <div className="w-full md:w-auto sticky top-0">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Live Preview</div>
                                        <div className="relative group w-[240px] aspect-[3/4] bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-400 flex flex-col mx-auto">
                                            <div className="bg-emerald-900/80 backdrop-blur-sm py-1.5 px-3 flex flex-col items-center border-b border-emerald-700/50">
                                                <div className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase leading-none mb-1">{selectedPlayer.nationality}</div>
                                                <div className="text-sm font-black text-white tracking-tight uppercase">{selectedPlayer.name}</div>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center">
                                                <PlayerAvatar player={selectedPlayer} size="2xl" className="border-none shadow-none bg-transparent" />
                                            </div>
                                            <div className="bg-emerald-900/90 py-2 border-t border-emerald-700/50">
                                                <div className="text-[11px] font-black text-emerald-400 text-center tracking-widest uppercase">
                                                    {selectedPlayer.role}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Avatar Grid */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-black uppercase tracking-tight">Avatar Selection</h3>
                                            <span className="text-xs font-bold text-slate-500 uppercase">{AVATAR_SEEDS.length} Styles Available</span>
                                        </div>
                                        
                                        <div className="space-y-8">
                                            <AvatarSelector 
                                                selectedSeed={selectedPlayer.avatarSeed} 
                                                selectedUrl={selectedPlayer.avatarUrl}
                                                onSelect={handleUpdateAvatar}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === 'manual' && selectedPlayer ? (
                            <motion.div 
                                key="manual-tab"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto"
                            >
                                <div className="flex flex-col md:flex-row gap-12 items-start">
                                    {/* Preview Card */}
                                    <div className="w-full md:w-auto sticky top-0">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Live Preview</div>
                                        <div className="relative group w-[240px] aspect-[3/4] bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-400 flex flex-col mx-auto">
                                            <div className="bg-emerald-900/80 backdrop-blur-sm py-1.5 px-3 flex flex-col items-center border-b border-emerald-700/50">
                                                <div className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase leading-none mb-1">{selectedPlayer.nationality}</div>
                                                <div className="text-sm font-black text-white tracking-tight uppercase">{selectedPlayer.name}</div>
                                            </div>
                                            <div className="flex-1 flex items-center justify-center">
                                                <PlayerAvatar player={selectedPlayer} size="2xl" className="border-none shadow-none bg-transparent" />
                                            </div>
                                            <div className="bg-emerald-900/90 py-2 border-t border-emerald-700/50">
                                                <div className="text-[11px] font-black text-emerald-400 text-center tracking-widest uppercase">
                                                    {selectedPlayer.role}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={handleRandomize}
                                            className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 flex items-center justify-center gap-2"
                                        >
                                            <Palette size={14} /> Randomize
                                        </button>
                                        <p className="mt-4 text-[10px] text-slate-500 text-center uppercase font-bold">Manual editing clears pre-made seeds</p>
                                    </div>

                                    {/* Manual Controls */}
                                    <div className="flex-1 space-y-8">
                                        {/* Face Shape */}
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 mb-4 tracking-widest">
                                                <UserCircle size={14} /> Face Shape
                                            </h4>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['Round', 'Oval', 'Squared'].map((label, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ faceShape: idx })}
                                                        className={`py-2 rounded-lg border-2 text-[10px] font-black uppercase transition-all ${selectedPlayer.customization?.faceShape === idx ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>
                                        </section>

                                        {/* Eye Color */}
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 mb-4 tracking-widest">
                                                <Palette size={14} /> Eye Color
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {['#111', '#422006', '#1e3a8a', '#14532d', '#4b5563'].map((color, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ eyeColor: color })}
                                                        className={`w-8 h-8 rounded-lg border-2 transition-all ${selectedPlayer.customization?.eyeColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </section>

                                        {/* Skin Tone */}
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 mb-4 tracking-widest">
                                                <Palette size={14} /> Skin Tone
                                            </h4>
                                            <div className="flex flex-wrap gap-3">
                                                {skinTones.map((color, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ skinTone: idx })}
                                                        className={`w-10 h-10 rounded-full border-2 transition-all ${selectedPlayer.customization?.skinTone === idx ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </section>

                                        {/* Hair Style & Color */}
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 mb-4 tracking-widest">
                                                <Scissors size={14} /> Hair Style
                                            </h4>
                                            <div className="grid grid-cols-5 gap-2 mb-4">
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ hairStyle: idx })}
                                                        className={`py-2 rounded-lg border-2 text-[10px] font-black uppercase transition-all ${selectedPlayer.customization?.hairStyle === idx ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                                                    >
                                                        Style {idx}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {hairColors.map((color, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ hairColor: color })}
                                                        className={`w-8 h-8 rounded-lg border-2 transition-all ${selectedPlayer.customization?.hairColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </section>

                                        {/* Beard Style */}
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 mb-4 tracking-widest">
                                                <UserCircle size={14} /> Beard Style
                                            </h4>
                                            <div className="grid grid-cols-5 gap-2 mb-4">
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ beardStyle: idx })}
                                                        className={`py-2 rounded-lg border-2 text-[10px] font-black uppercase transition-all ${selectedPlayer.customization?.beardStyle === idx ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                                                    >
                                                        Style {idx}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {hairColors.map((color, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ beardColor: color })}
                                                        className={`w-8 h-8 rounded-lg border-2 transition-all ${selectedPlayer.customization?.beardColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </section>

                                        {/* Mustache Style */}
                                        <section>
                                            <h4 className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 mb-4 tracking-widest">
                                                <Scissors size={14} /> Mustache Style
                                            </h4>
                                            <div className="grid grid-cols-5 gap-2 mb-4">
                                                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ mustacheStyle: idx })}
                                                        className={`py-2 rounded-lg border-2 text-[10px] font-black uppercase transition-all ${selectedPlayer.customization?.mustacheStyle === idx ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                                                    >
                                                        Style {idx}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {hairColors.map((color, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleUpdateCustomization({ mustacheColor: color })}
                                                        className={`w-8 h-8 rounded-lg border-2 transition-all ${selectedPlayer.customization?.mustacheColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="details-tab"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-2xl mx-auto text-center py-20"
                            >
                                <Shield size={64} className="mx-auto text-emerald-500/20 mb-6" />
                                <h3 className="text-2xl font-black uppercase mb-4">Team Branding</h3>
                                <p className="text-slate-400 mb-8 text-sm">Customize your team name and identity.</p>
                                
                                <div className="space-y-6">
                                    <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-left">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 block">Team Name</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="flex-1 bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-sm font-black uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                            />
                                            <button 
                                                onClick={handleUpdateTeamName}
                                                className="bg-emerald-500 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
                                            >
                                                Update
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-left">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 block">Primary Team Color</label>
                                        <div className="flex flex-wrap gap-3">
                                            {['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'].map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => handleUpdateTeamColor(color)}
                                                    className={`w-12 h-12 rounded-2xl border-2 transition-all ${userTeam.color === color ? 'border-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-transparent hover:scale-105'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-8 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800 opacity-50">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Logo Customization Coming Soon</p>
                                    </div>
                                    
                                    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500 uppercase">Team ID</span>
                                            <span className="text-sm font-mono text-emerald-400">{userTeam.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default CustomizationHub;
