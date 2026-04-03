import React, { useMemo } from 'react';
import { Player, PlayerRole } from '../types';
import { getRoleBorderClass, hashString } from '../utils';

interface PlayerAvatarProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Simple hash function

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, size = 'md', className = '' }) => {
  // Use avatarSeed if it exists, otherwise generate one
  const seedStr = player?.avatarSeed || (player?.avatarUrl ? `${player?.id}-${player?.name}-${player?.avatarUrl}` : `${player?.id}-${player?.name}`);
  const seed = hashString(seedStr || '');
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32'
  };

  const borderClass = player ? getRoleBorderClass(player.role) : '';
  
  // Generate a deterministic SVG avatar
  const svgContent = useMemo(() => {
    if (!player) return '';
    const bgColors = [
      '#0F172A', '#1E293B', '#334155', '#475569', // Slate
      '#450A0A', '#7F1D1D', '#991B1B', '#B91C1C', // Red
      '#064E3B', '#065F46', '#047857', '#059669', // Emerald
      '#1E1B4B', '#312E81', '#3730A3', '#4338CA', // Indigo
      '#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', // Violet
      '#701A75', '#86198F', '#A21CAF', '#C026D3', // Fuchsia
    ];
    
    const skinTones = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642'];
    const hairColors = ['#090806', '#2C1608', '#4E2708', '#A56B46', '#B55239', '#D6C4C2'];
    
    const bgColor = bgColors[seed % bgColors.length];
    const skinColor = skinTones[(seed >> 2) % skinTones.length];
    const hairColor = hairColors[(seed >> 4) % hairColors.length];
    
    // Face shape
    const faceType = (seed >> 6) % 3; // 0: Round, 1: Oval, 2: Squared
    const facePath = faceType === 0 
      ? 'M50,25 A25,25 0 1,1 50,75 A25,25 0 1,1 50,25'
      : faceType === 1 
        ? 'M50,20 A22,30 0 1,1 50,80 A22,30 0 1,1 50,20'
        : 'M30,25 Q50,20 70,25 L75,70 Q50,80 25,70 Z';

    // Eyes
    const eyeType = (seed >> 8) % 2;
    const eyeY = 45;
    const eyeX1 = 40;
    const eyeX2 = 60;
    const eyeSize = 3;
    const eyes = eyeType === 0 
      ? `<circle cx="${eyeX1}" cy="${eyeY}" r="${eyeSize}" fill="#111" /><circle cx="${eyeX2}" cy="${eyeY}" r="${eyeSize}" fill="#111" />`
      : `<path d="M${eyeX1-3},${eyeY} Q${eyeX1},${eyeY-2} ${eyeX1+3},${eyeY}" stroke="#111" stroke-width="2" fill="none" /><path d="M${eyeX2-3},${eyeY} Q${eyeX2},${eyeY-2} ${eyeX2+3},${eyeY}" stroke="#111" stroke-width="2" fill="none" />`;

    // Mouth
    const mouthType = (seed >> 10) % 3;
    const mouth = mouthType === 0 
      ? '<path d="M40,65 Q50,70 60,65" stroke="#111" stroke-width="2" fill="none" />' // Smile
      : mouthType === 1 
        ? '<path d="M42,68 Q50,68 58,68" stroke="#111" stroke-width="2" fill="none" />' // Neutral
        : '<circle cx="50" cy="68" r="3" fill="#111" opacity="0.6" />'; // Surprise

    // Hair
    const hairType = (seed >> 12) % 4;
    const hair = hairType === 0 
      ? `<path d="M25,40 Q50,10 75,40 L75,30 Q50,0 25,30 Z" fill="${hairColor}" />` // Short
      : hairType === 1 
        ? `<path d="M20,40 Q50,5 80,40 L85,60 Q50,70 15,60 Z" fill="${hairColor}" opacity="0.9" />` // Spiky
        : hairType === 2 
          ? `<circle cx="50" cy="30" r="25" fill="${hairColor}" />` // Afro/Round
          : `<path d="M25,40 L25,70 Q50,80 75,70 L75,40 Q50,15 25,40" fill="${hairColor}" />`; // Long-ish

    const initials = (player?.name || 'Unknown').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grad-${seed})" />
        
        <!-- Face -->
        <path d="${facePath}" fill="${skinColor}" />
        
        <!-- Features -->
        ${eyes}
        ${mouth}
        ${hair}

        <!-- Initials Overlay (Subtle) -->
        <text x="50" y="92" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="white" text-anchor="middle" opacity="0.3" letter-spacing="2">${initials}</text>
      </svg>
    `;
  }, [seed, player]);

  if (!player) return null;

  return (
    <div className={`relative rounded-full overflow-hidden border-2 flex-shrink-0 ${borderClass} ${sizeClasses[size]} ${className}`}>
      {player.avatarUrl && (player.avatarUrl.startsWith('http') || player.avatarUrl.startsWith('data:image/')) ? (
        <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
      ) : (
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`} alt={player.name} className="w-full h-full object-cover" />
      )}
    </div>
  );
};
