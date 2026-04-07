import React, { useMemo } from 'react';
import { Player, PlayerRole } from '../types';
import { getRoleBorderClass, hashString } from '../utils';
import { GET_AVATAR_URL } from '../constants';

interface PlayerAvatarProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, size = 'md', className = '' }) => {
  const seedStr = player?.avatarSeed || (player?.avatarUrl ? `${player?.id}-${player?.name}-${player?.avatarUrl}` : `${player?.id}-${player?.name}`);
  const seed = hashString(seedStr || '');
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
    '2xl': 'w-48 h-48'
  };

  const borderClass = player ? getRoleBorderClass(player.role) : '';
  const nationalityBorder = player?.nationality?.toLowerCase() === 'england' || player?.nationality?.toLowerCase() === 'english'
    ? 'border-white'
    : 'border-black';
  
  // Generate a deterministic SVG avatar
  const svgContent = useMemo(() => {
    if (!player || player.avatarSeed) return '';
    const bgColors = [
      '#0F172A', '#1E293B', '#334155', '#475569', // Slate
      '#450A0A', '#7F1D1D', '#991B1B', '#B91C1C', // Red
      '#064E3B', '#065F46', '#047857', '#059669', // Emerald
      '#1E1B4B', '#312E81', '#3730A3', '#4338CA', // Indigo
      '#4C1D95', '#5B21B6', '#6D28D9', '#7C3AED', // Violet
      '#701A75', '#86198F', '#A21CAF', '#C026D3', // Fuchsia
    ];
    
    const skinTones = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642', '#3D2314'];
    const hairColors = [
      '#090806', // Black
      '#2C1608', // Dark Brown
      '#4E2708', // Medium Brown
      '#A56B46', // Light Brown
      '#B55239', // Auburn
      '#D6C4C2', // Blonde
      '#FFFFFF', // White
      '#4A4A4A', // Gray
      '#3B82F6', // Blue
      '#EF4444', // Red
      '#10B981', // Emerald
      '#F59E0B'  // Amber
    ];
    
    const custom = player.customization;
    const skinColor = custom?.skinTone !== undefined ? skinTones[custom.skinTone % skinTones.length] : skinTones[(seed >> 2) % skinTones.length];
    const hairColor = custom?.hairColor || hairColors[(seed >> 4) % hairColors.length];
    const beardColor = custom?.beardColor || hairColor;
    const mustacheColor = custom?.mustacheColor || hairColor;
    
    // Face shape
    const faceType = custom?.faceShape !== undefined ? custom.faceShape : (seed >> 6) % 3;
    const facePath = faceType === 0 
      ? 'M50,25 A25,25 0 1,1 50,75 A25,25 0 1,1 50,25' // Round
      : faceType === 1 
        ? 'M50,20 A22,30 0 1,1 50,80 A22,30 0 1,1 50,20' // Oval
        : 'M30,25 Q50,20 70,25 L75,70 Q50,80 25,70 Z'; // Squared

    // Eyes
    const eyeColor = custom?.eyeColor || '#111';
    const eyeY = 45;
    const eyeX1 = 40;
    const eyeX2 = 60;
    const eyes = `<circle cx="${eyeX1}" cy="${eyeY}" r="3" fill="white" /><circle cx="${eyeX1}" cy="${eyeY}" r="1.5" fill="${eyeColor}" /><circle cx="${eyeX2}" cy="${eyeY}" r="3" fill="white" /><circle cx="${eyeX2}" cy="${eyeY}" r="1.5" fill="${eyeColor}" />`;

    // Mouth
    const mouth = '<path d="M42,68 Q50,72 58,68" stroke="#000" stroke-width="1" fill="none" opacity="0.4" />';

    // Mustache Styles (10 styles)
    const mustacheStyles = [
      '', // None
      `<path d="M40,62 Q50,60 60,62 L60,64 Q50,62 40,64 Z" fill="${mustacheColor}" />`, // Thin
      `<path d="M38,62 Q50,58 62,62 Q62,66 50,66 Q38,66 38,62" fill="${mustacheColor}" />`, // Thick
      `<path d="M40,62 Q45,62 48,65 L40,65 Z M52,65 Q55,62 60,62 L60,65 L52,65 Z" fill="${mustacheColor}" />`, // Pencil
      `<path d="M35,62 Q45,60 50,64 Q55,60 65,62 Q68,65 65,68 Q55,65 50,68 Q45,65 35,68 Q32,65 35,68" fill="${mustacheColor}" />`, // Handlebar
      `<path d="M40,62 L60,62 L62,66 L38,66 Z" fill="${mustacheColor}" />`, // Chevron
      `<path d="M42,62 Q50,61 58,62 L58,63 Q50,62 42,63 Z" fill="${mustacheColor}" />`, // Ultra Thin
      `<path d="M38,62 Q50,55 62,62 L62,68 L38,68 Z" fill="${mustacheColor}" />`, // Horseshoe
      `<path d="M40,62 Q50,64 60,62 L58,65 Q50,66 42,65 Z" fill="${mustacheColor}" />`, // Walrus
      `<path d="M45,62 L55,62 L55,65 L45,65 Z" fill="${mustacheColor}" />`, // Toothbrush
    ];
    const mustache = mustacheStyles[custom?.mustacheStyle || 0];

    // Beard Styles (10 styles)
    const beardStyles = [
      '', // None
      `<path d="M30,65 Q50,85 70,65 L70,70 Q50,90 30,70 Z" fill="${beardColor}" opacity="0.8" />`, // Goatee
      `<path d="M25,50 L25,70 Q50,85 75,70 L75,50 L70,50 L70,65 Q50,80 30,65 L30,50 Z" fill="${beardColor}" />`, // Full Beard
      `<path d="M30,75 Q50,85 70,75 L70,78 Q50,88 30,78 Z" fill="${beardColor}" />`, // Chin Strap
      `<path d="M25,50 L30,50 L30,65 L25,65 Z M70,50 L75,50 L75,65 L70,65 Z" fill="${beardColor}" />`, // Sideburns
      `<path d="M45,70 Q50,80 55,70 L55,75 Q50,85 45,75 Z" fill="${beardColor}" />`, // Soul Patch
      `<path d="M35,70 Q50,85 65,70 L65,72 Q50,87 35,72 Z" fill="${beardColor}" />`, // Van Dyke
      `<path d="M25,50 L25,70 Q50,90 75,70 L75,50 L72,50 L72,68 Q50,85 28,68 L28,50 Z" fill="${beardColor}" opacity="0.6" />`, // Stubble
      `<path d="M40,70 L60,70 L60,85 L40,85 Z" fill="${beardColor}" />`, // Ducktail
      `<path d="M30,65 Q50,95 70,65 L65,65 Q50,85 35,65 Z" fill="${beardColor}" />`, // Pointed
    ];
    const beard = beardStyles[custom?.beardStyle || 0];

    // Hair Styles (10 styles)
    const hairStyles = [
      '', // Bald
      `<path d="M25,40 Q50,10 75,40 L75,30 Q50,0 25,30 Z" fill="${hairColor}" />`, // Short
      `<path d="M20,40 Q50,5 80,40 L85,60 Q50,70 15,60 Z" fill="${hairColor}" />`, // Spiky
      `<circle cx="50" cy="30" r="25" fill="${hairColor}" />`, // Afro
      `<path d="M25,40 L25,70 Q50,80 75,70 L75,40 Q50,15 25,40" fill="${hairColor}" />`, // Long
      `<path d="M25,40 Q50,5 75,40 Q85,30 75,20 Q50,-10 25,20 Q15,30 25,40" fill="${hairColor}" />`, // Pompadour
      `<path d="M25,40 Q50,15 75,40 L80,50 L20,50 Z" fill="${hairColor}" />`, // Buzz Cut
      `<path d="M20,45 Q50,10 80,45 L85,55 Q50,65 15,55 Z" fill="${hairColor}" />`, // Messy
      `<path d="M30,30 Q50,10 70,30 L75,60 Q50,70 25,60 Z" fill="${hairColor}" />`, // Side Part
      `<path d="M25,40 Q50,0 75,40 L85,80 Q50,90 15,80 Z" fill="${hairColor}" />`, // Shoulder Length
    ];
    const hair = hairStyles[custom?.hairStyle !== undefined ? custom.hairStyle : (seed >> 12) % 4 + 1];

    const initials = (player?.name || 'Unknown').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColors[seed % bgColors.length]};stop-opacity:1" />
            <stop offset="100%" style="stop-color:#000;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#grad-${seed})" />
        
        <!-- Face -->
        <path d="${facePath}" fill="${skinColor}" />
        
        <!-- Features -->
        ${eyes}
        ${mouth}
        ${beard}
        ${mustache}
        ${hair}

        <!-- Initials Overlay (Subtle) -->
        <text x="50" y="92" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="white" text-anchor="middle" opacity="0.3" letter-spacing="2">${initials}</text>
      </svg>
    `;
  }, [seed, player]);

  if (!player) return null;

  const isDiceBear = player.avatarSeed && !player.avatarUrl;
  const diceBearUrl = player.avatarSeed ? GET_AVATAR_URL(player.avatarSeed!) : null;
  const localAvatarUrl = player.avatarSeed ? `/avatars/${player.avatarSeed}.png` : null;
  const avatarUrl = player.avatarUrl || localAvatarUrl || diceBearUrl;

  return (
    <div className={`relative rounded-full overflow-hidden border-2 flex-shrink-0 ${nationalityBorder} ${sizeClasses[size]} ${className}`}>
      {avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image/') || avatarUrl.startsWith('/')) ? (
        <img 
          src={avatarUrl} 
          alt={player.name} 
          className="w-full h-full object-cover object-top" 
          referrerPolicy="no-referrer"
          onError={(e) => {
            // If local image fails, fallback to DiceBear if seed exists
            if (player.avatarSeed && e.currentTarget.src !== diceBearUrl) {
              e.currentTarget.src = diceBearUrl!;
            }
          }}
        />
      ) : (
        <div 
          className="w-full h-full"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
};
