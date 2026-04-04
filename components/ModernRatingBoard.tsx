
import React from 'react';
import { motion } from 'motion/react';
import { Player, PlayerRole, Format, GameData } from '../types';
import { getRoleColor } from '../utils';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';

interface ModernRatingBoardProps {
  players: Player[];
  title?: string;
  currentFormat?: Format;
  gameData?: GameData;
}

const calculatePerformanceRating = (player: Player, format: Format = Format.T20): number => {
  const stats = player.stats[format];
  const skillRating = Math.max(player.battingSkill, player.secondarySkill);
  
  // Base skill includes fielding and accuracy (weighted)
  const baseSkill = (skillRating * 0.7) + ((player.fielding || 50) * 0.15) + ((player.accuracy || 50) * 0.15);
  
  // Condition modifier (Form and Fitness)
  const conditionMod = (((player.form || 50) / 50) * 0.5) + (((player.fitness || 80) / 80) * 0.5);
  
  if (!stats || stats.matches === 0) return Math.round(baseSkill * conditionMod);

  // Batting Performance (0-100)
  const battingScore = (stats.average * 1.2) + (stats.strikeRate / 2.5);
  let performanceScore: number;
  
  // Bowling Performance (0-100)
  const bowlingScore = (stats.wickets / stats.matches * 30) + (Math.max(0, 10 - stats.economy) * 7);
  
  if (player.role === PlayerRole.BATSMAN || player.role === PlayerRole.WICKET_KEEPER) {
    performanceScore = battingScore;
  } else if (player.role === PlayerRole.FAST_BOWLER || player.role === PlayerRole.SPIN_BOWLER) {
    performanceScore = bowlingScore;
  } else {
    performanceScore = (battingScore + bowlingScore) / 1.6;
  }

  // Blend skill with performance (60% performance, 40% skill)
  const finalRating = ((performanceScore * 0.6) + (baseSkill * 0.4)) * conditionMod;
  return Math.min(99, Math.max(40, Math.round(finalRating)));
};

const getRatingColor = (rating: number) => {
  if (rating >= 95) return 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]';
  if (rating >= 90) return 'text-yellow-400';
  if (rating >= 85) return 'text-purple-500';
  if (rating >= 80) return 'text-teal-400';
  if (rating >= 70) return 'text-orange-400';
  return 'text-slate-400';
};

const ModernRatingBoard: React.FC<ModernRatingBoardProps> = ({ players, title = "PERFORMANCE_BOARD", currentFormat = Format.T20, gameData }) => {
  const playersWithPR = players.map(p => ({
    ...p,
    pr: calculatePerformanceRating(p, currentFormat)
  }));

  const sortedPlayers = [...playersWithPR].sort((a, b) => b.pr - a.pr);

  const avgBatting = Math.round(players.reduce((acc, p) => acc + p.battingSkill, 0) / players.length) || 0;
  const avgBowling = Math.round(players.reduce((acc, p) => acc + p.secondarySkill, 0) / players.length) || 0;
  const avgStrength = Math.round((avgBatting + avgBowling) / 2);
  const stars = Math.min(5, Math.max(1, Math.floor(avgStrength / 15)));

  return (
    <div className="bg-[#050808] min-h-full p-3 md:p-12 font-sans text-[#E4E3E0] overflow-y-auto scrollbar-hide relative pb-10">
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-500/5 blur-[100px] md:blur-[160px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/5 blur-[100px] md:blur-[160px] rounded-full" />
      </div>

      {/* Board Ratings Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/[0.02] border border-white/10 rounded-[20px] md:rounded-[48px] p-3 md:p-10 mb-3 md:mb-12 relative overflow-hidden backdrop-blur-3xl shadow-2xl z-10"
      >
        <div className="absolute top-0 right-0 p-4 md:p-12 opacity-[0.02] pointer-events-none">
            <Icons.Trophy className="w-16 h-16 md:w-48 md:h-48" />
        </div>

        <div className="flex justify-between items-start mb-3 md:mb-10 relative z-10">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-2">
                <div className="w-1 md:w-2 h-4 md:h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                <h2 className="text-lg md:text-4xl font-black italic tracking-tighter uppercase text-white leading-none">
                    BOARD_RATINGS
                </h2>
            </div>
            <p className="text-[6px] md:text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-3 md:ml-5">SEASON_0{gameData?.currentSeason || 1}_METRICS</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-2 md:px-6 py-0.5 md:py-2 rounded-full text-[5px] md:text-[10px] font-black uppercase tracking-widest text-white/60">
            ENCRYPTED_FEED
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 relative z-10">
          {[
            { label: 'STRENGTH', value: avgStrength, icon: <Icons.Activity className="w-2 h-2 md:w-3 md:h-3" /> },
            { label: 'BOWLING', value: avgBowling, icon: <Icons.Target className="w-2 h-2 md:w-3 md:h-3" /> },
            { label: 'BATTING', value: avgBatting, icon: <Icons.Zap className="w-2 h-2 md:w-3 md:h-3" /> },
            { label: 'STARS', value: stars, icon: <Icons.Trophy className="w-2 h-2 md:w-3 md:h-3" /> }
          ].map((stat, idx) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (idx * 0.05) }}
              className="bg-white/[0.03] border border-white/10 p-2 md:p-6 rounded-[12px] md:rounded-[24px] hover:bg-white/[0.06] transition-all duration-500 group"
            >
              <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-3">
                <span className="text-teal-500 group-hover:scale-110 transition-transform">{stat.icon}</span>
                <p className="text-[5px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
              </div>
              <p className="text-base md:text-3xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Table Header */}
      <div className="grid grid-cols-[25px_1fr_50px_50px] md:grid-cols-[60px_1fr_100px_100px] gap-1.5 md:gap-6 px-3 md:px-10 py-2 md:py-6 bg-white/[0.03] border border-white/10 rounded-t-[16px] md:rounded-t-[32px] text-[6px] md:text-[10px] font-black text-teal-500 uppercase tracking-[0.3em] backdrop-blur-xl relative z-10">
        <span>RANK</span>
        <span>ASSET_IDENTITY</span>
        <span className="text-center">CLASS</span>
        <span className="text-right">P_RATING</span>
      </div>

      {/* Player List */}
      <div className="bg-white/[0.01] border-x border-b border-white/10 rounded-b-[16px] md:rounded-b-[32px] overflow-hidden mb-4 md:mb-12 relative z-10">
        {sortedPlayers.slice(0, 50).map((player, index) => {
          const ratingColor = getRatingColor(player.pr);
          
          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              key={player.id}
              className="grid grid-cols-[25px_1fr_50px_50px] md:grid-cols-[60px_1fr_100px_100px] gap-1.5 md:gap-6 px-3 md:px-10 py-2 md:py-6 border-b border-white/5 hover:bg-white/[0.04] transition-all group cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center">
                <span className="font-mono text-[7px] md:text-xs font-black text-white/20 group-hover:text-teal-500 transition-colors">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-1.5 md:gap-6 overflow-hidden">
                <PlayerAvatar player={player} size="sm" className="w-5 h-5 md:w-12 md:h-12 border border-white/10 group-hover:border-teal-500/30 transition-colors" />
                <div className="flex flex-col justify-center overflow-hidden">
                    <div className="flex items-center gap-1 md:gap-3 overflow-hidden">
                    <span className="font-black text-[10px] md:text-xl tracking-tighter uppercase italic text-white group-hover:text-teal-500 transition-colors leading-none truncate">
                        {player.name}
                    </span>
                    {player.isForeign && (
                        <span className="text-[4px] md:text-[8px] font-black border border-white/10 bg-white/5 px-0.5 md:px-2 py-0.5 rounded-full text-white/40 uppercase tracking-widest shrink-0">INTL</span>
                    )}
                    </div>
                    <span className="text-[5px] md:text-[9px] font-black text-white/20 uppercase tracking-widest mt-0 md:mt-1 truncate">{player.nationality}</span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span className={`text-[5px] md:text-[9px] font-black px-1 md:px-4 py-0.5 md:py-1.5 bg-white/5 border border-white/10 rounded-full uppercase tracking-widest ${getRoleColor(player.role)} truncate`}>
                  {player.role.split(' ')[0]}
                </span>
              </div>

              <div className="flex items-center justify-end">
                <div className="text-right w-full max-w-[30px] md:max-w-[80px]">
                  <span className={`font-mono text-sm md:text-3xl font-black italic leading-none ${ratingColor}`}>
                    {player.pr}
                  </span>
                  <div className="h-0.5 md:h-1 w-full bg-white/5 mt-0.5 md:mt-2 overflow-hidden rounded-full">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${player.pr}%` }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className={`h-full ${ratingColor.replace('text-', 'bg-')} shadow-[0_0_10px_rgba(20,184,166,0.3)]`} 
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Decoration */}
      <div className="pt-4 md:pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-8 relative z-10">
        <div className="flex gap-4 md:gap-12">
          <div className="flex flex-col">
            <span className="text-[5px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-0.5 md:mb-2">DATABASE_SIZE</span>
            <span className="text-sm md:text-2xl font-black italic text-white">#{players.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[5px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-0.5 md:mb-2">FORMAT_FOCUS</span>
            <span className="text-sm md:text-2xl font-black italic text-teal-500">{currentFormat}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
            <div className="text-right">
                <p className="text-[5px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-0 md:mb-1">SYSTEM_STATUS</p>
                <p className="text-[7px] md:text-[11px] font-black text-teal-500 uppercase tracking-widest">ENCRYPTED_FEED_ACTIVE</p>
            </div>
            <div className="w-6 h-6 md:w-14 md:h-14 bg-teal-500 flex items-center justify-center rotate-45 shadow-[0_0_30px_rgba(20,184,166,0.3)]">
              <span className="text-[7px] md:text-[11px] font-black text-black -rotate-45 leading-none">SIG</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ModernRatingBoard;
