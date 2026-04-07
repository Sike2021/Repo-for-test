
import React from 'react';
import { Player, PlayerRole, Format } from '../types';
import { getRoleFullName, aggregateStats } from '../utils';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerCardProps {
  player: Player;
  onAction?: (player: Player) => void;
  actionLabel?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onAction, actionLabel }) => {
  const totalValue = player.battingSkill + player.secondarySkill;

  return (
    <div className="relative group w-full max-w-[280px] aspect-[3/4] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-800/30 hover:border-emerald-500/50 transition-all duration-500 flex flex-col">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(16,185,129,0.15),transparent_70%)]" />
      
      {/* Top Header: Nationality & Style */}
      <div className="relative z-10 bg-black/40 backdrop-blur-md py-2 px-4 flex justify-between items-center border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase leading-none mb-1">
            {player.nationality}
          </span>
          <h3 className="text-sm font-black text-white tracking-tight uppercase truncate max-w-[140px]">
            {player.name}
          </h3>
        </div>
        <div className="flex flex-col items-end">
          <div className="px-2 py-0.5 bg-emerald-500/20 rounded border border-emerald-500/30">
            <span className="text-[10px] font-black text-emerald-400 uppercase">{player.style}</span>
          </div>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)] z-0" />
        <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-700 ease-out">
          <PlayerAvatar 
            player={player} 
            size="xl" 
            className="border-none shadow-none bg-transparent" 
          />
        </div>
        
        {/* Total Value Badge - Floating */}
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-emerald-600 border-2 border-white/20 rounded-xl px-3 py-2 shadow-xl flex flex-col items-center min-w-[50px]">
            <span className="text-[8px] text-emerald-100 font-black uppercase leading-none mb-1">Total</span>
            <span className="text-xl text-white font-black leading-none">{totalValue}</span>
          </div>
        </div>
      </div>

      {/* Role Section */}
      <div className="relative z-10 bg-emerald-900/40 py-1.5 border-y border-white/5 backdrop-blur-sm">
        <div className="text-[10px] font-black text-emerald-300 text-center tracking-[0.2em] uppercase">
          {getRoleFullName(player.role)}
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 p-4 bg-black/60 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Batting</span>
            <div className="text-2xl font-black text-white leading-none">{player.battingSkill}</div>
          </div>
          <div className="flex flex-col items-center border-l border-white/10">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bowling</span>
            <div className="text-2xl font-black text-white leading-none">{player.secondarySkill}</div>
          </div>
        </div>
      </div>

      {/* Action Button Overlay */}
      {onAction && actionLabel && (
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-8 z-30">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction(player);
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-2xl transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)] uppercase tracking-widest text-xs"
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
