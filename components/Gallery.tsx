import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GALLERY_PLAYERS } from '../data';
import { PlayerAvatar } from './PlayerAvatar';
import PlayerCard from './PlayerCard';
import { Search, Filter, Grid, List as ListIcon, UserPlus } from 'lucide-react';
import { PlayerRole, GameData, Player } from '../types';

interface GalleryProps {
  gameData?: GameData;
  setGameData?: React.Dispatch<React.SetStateAction<GameData | null>>;
  setScreen?: (screen: any) => void;
  setSelectedPlayer?: (player: Player) => void;
}

const Gallery: React.FC<GalleryProps> = ({ gameData, setGameData, setScreen, setSelectedPlayer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<PlayerRole | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPlayers = GALLERY_PLAYERS.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || player.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleViewPlayer = (player: Player) => {
    if (setSelectedPlayer && setScreen) {
      setSelectedPlayer(player);
      setScreen('PLAYER_PROFILE');
    }
  };

  const handleRecruit = (e: React.MouseEvent, player: Player) => {
    e.stopPropagation();
    if (!gameData || !setGameData) return;
    
    const userTeam = gameData.teams.find(t => t.id === gameData.userTeamId);
    if (!userTeam) return;

    if (userTeam.squad.some(p => p.id === player.id)) {
      alert("Player already in squad!");
      return;
    }

    setGameData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        teams: prev.teams.map(t => t.id === prev.userTeamId ? { ...t, squad: [...t.squad, player] } : t)
      };
    });
    alert(`${player.name} recruited to ${userTeam.name}!`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic text-emerald-400 leading-none">Elite Gallery</h2>
            <p className="text-slate-400 text-[10px] md:text-xs mt-1 font-bold uppercase tracking-widest">Your Custom Player Collection</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full md:w-48 transition-all"
              />
            </div>
            
            <div className="flex bg-slate-800 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                <ListIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4 md:mt-6 overflow-x-auto pb-2 scrollbar-hide">
          <Filter className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          {(['ALL', ...Object.values(PlayerRole)] as const).map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-black whitespace-nowrap transition-all border uppercase tracking-widest ${
                roleFilter === role
                  ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-800 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {role.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-24">
        {filteredPlayers.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 justify-items-center"
            : "flex flex-col gap-3"
          }>
            {filteredPlayers.map((player) => (
              viewMode === 'grid' ? (
                <div key={player.id} className="w-full flex flex-col items-center gap-2" onClick={() => handleViewPlayer(player)}>
                   <PlayerCard player={player} />
                   {gameData && (
                     <button 
                      onClick={(e) => handleRecruit(e, player)}
                      className="w-full max-w-[200px] py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                     >
                       <UserPlus size={12} /> Recruit
                     </button>
                   )}
                </div>
              ) : (
                <div 
                  key={player.id} 
                  onClick={() => handleViewPlayer(player)}
                  className="bg-slate-900/50 border border-white/5 rounded-xl p-3 md:p-4 flex items-center justify-between hover:border-emerald-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <PlayerAvatar player={player} size="md" className="group-hover:scale-110 transition-transform" />
                    <div>
                      <h4 className="font-black text-white uppercase tracking-tight text-sm md:text-base leading-none mb-1">{player.name}</h4>
                      <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">{player.nationality} • {player.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden sm:flex flex-col items-center">
                      <span className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase">Bat</span>
                      <span className="text-base md:text-lg font-black text-white">{player.battingSkill}</span>
                    </div>
                    <div className="hidden sm:flex flex-col items-center">
                      <span className="text-[7px] md:text-[8px] text-slate-500 font-bold uppercase">Bowl</span>
                      <span className="text-base md:text-lg font-black text-white">{player.secondarySkill}</span>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 md:px-3 py-1 flex flex-col items-center min-w-[50px] md:min-w-[60px]">
                      <span className="text-[7px] md:text-[8px] text-emerald-500 font-bold uppercase">Total</span>
                      <span className="text-base md:text-lg font-black text-emerald-400">{player.battingSkill + player.secondarySkill}</span>
                    </div>
                    {gameData && (
                      <button 
                        onClick={(e) => handleRecruit(e, player)}
                        className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition-all"
                        title="Recruit to Team"
                      >
                        <UserPlus size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Search className="w-10 h-10 md:w-12 md:h-12 mb-4 opacity-20" />
            <p className="text-base md:text-lg font-bold uppercase tracking-widest">No players found</p>
            <button 
              onClick={() => { setSearchTerm(''); setRoleFilter('ALL'); }}
              className="mt-4 text-emerald-500 text-[10px] md:text-xs font-black hover:underline uppercase tracking-widest"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
