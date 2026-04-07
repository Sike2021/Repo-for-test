
import { Player, PlayerRole, TeamData, Ground, Match, PlayerStats, NewsArticle, Format, Sponsorship } from './types';

export const MAX_SQUAD_SIZE = 22;
export const MIN_SQUAD_SIZE = 15;
export const MAX_FOREIGN_PLAYERS = 3;

export const BRANDS = [
    { name: "Sike's", color: "text-yellow-500", style: "font-extrabold tracking-tight font-display", logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" /></svg>' },
    { name: "Apex", color: "text-cyan-400", style: "font-sans tracking-widest uppercase", logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>' },
    { name: "Malik", color: "text-red-600", style: "font-serif italic font-bold", logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M14.06 9.02l.92.92L3.92 21h16.16V23H3a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h1V9.02zM12 3a2 2 0 0 1 2 2v4h-4V5a2 2 0 0 1 2-2z"/></svg>' },
    { name: "G.S", color: "text-green-500", style: "font-mono font-bold", logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>' }
];

export const TV_CHANNELS = [
    { id: 'tv-prime', name: 'PrimeCast Ultra', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="12" cy="12" r="4" fill="white" fill-opacity="0.3"/><path d="M10 9l5 3-5 3V9z" fill="white"/></svg>', color: 'text-purple-500', minPopularity: 40, tier: 'Premium' },
    { id: 'tv-roar', name: 'Roar Sports', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg>', color: 'text-red-600', minPopularity: 55, tier: 'Premium' },
    { id: 'tv-now', name: 'CricketNow HD', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4z"/><path d="M8 10h8v4H8z" fill="white"/></svg>', color: 'text-blue-500', minPopularity: 30, tier: 'Standard' },
    { id: 'tv-apex', name: 'Apex Sports', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2 12h20M2 12l10-9 10 9M2 12l10 9 10-9" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>', color: 'text-cyan-400', minPopularity: 50, tier: 'Premium' },
];

export const TOURNAMENT_LOGOS = [
    { id: 'cup-1', name: 'Classic Cup', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h14a1 1 0 0 1 1 1v4a3 3 0 0 1-3 3h-1v2h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3v3h2a1 1 0 0 1 1 1v1H6v-1a1 1 0 0 1 1-1h2v-3H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h2v-2H7a3 3 0 0 1-3-3V3a1 1 0 0 1 1-1z"/></svg>' },
    { id: 'shield-1', name: 'Grand Shield', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>' },
];

export const SPONSOR_THRESHOLDS = {
    [Format.T20]: { "Sike's": 40, "Apex": 35, "Malik": 30, "G.S": 25 },
    [Format.ODI]: { "Sike's": 45, "Apex": 40, "Malik": 30, "G.S": 25 },
    [Format.SHIELD]: { "Sike's": 40, "Apex": 35, "Malik": 30, "G.S": 25 },
};

export const INITIAL_SPONSORSHIPS: Record<Format, Sponsorship> = {
    [Format.T20]: { sponsorName: "Sike's", tournamentName: "Super Smash 26", logoColor: "text-yellow-500", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: "CricketNow HD", tvLogo: "" },
    [Format.ODI]: { sponsorName: "Apex", tournamentName: "Pro Cup 26", logoColor: "text-cyan-400", tournamentLogo: TOURNAMENT_LOGOS[0].svg, tvChannel: "Apex Sports", tvLogo: "" },
    [Format.SHIELD]: { sponsorName: "Malik", tournamentName: "Shield 26", logoColor: "text-red-600", tournamentLogo: TOURNAMENT_LOGOS[1].svg, tvChannel: "PrimeCast Ultra", tvLogo: "" },
};

export const TEAMS: TeamData[] = [
  { id: 'team1', name: 'Kings', homeGround: 'KCG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="#FBBF24" stroke="#B45309" stroke-width="4"/><path d="M50 30 l-15 40 l30 0 l-15 -40" fill="#FFFFFF"/><circle cx="50" cy="22" r="6" fill="#FFFFFF"/></svg>', isYouthTeam: false },
  { id: 'team2', name: 'Stars', homeGround: 'SG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#10B981" stroke="#065F46" stroke-width="4"/><path d="M50 20 L58 40 L80 40 L62 55 L68 75 L50 62 L32 75 L38 55 L20 40 L42 40 Z" fill="#FFFFFF"/></svg>', isYouthTeam: false },
  { id: 'team3', name: 'Sixers', homeGround: 'TG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="20" fill="#EC4899" stroke="#831843" stroke-width="4"/><text x="50" y="65" font-family="Arial" font-size="50" font-weight="bold" fill="#FFFFFF" text-anchor="middle">6</text></svg>', isYouthTeam: false },
  { id: 'team4', name: 'Gladiators', homeGround: 'LWG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M20 20 H80 L80 60 Q50 95 20 60 Z" fill="#8B5CF6" stroke="#4C1D95" stroke-width="4"/></svg>', isYouthTeam: false },
  { id: 'team5', name: 'Eagles', homeGround: 'MCG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#3B82F6" stroke="#1E3A8A" stroke-width="4"/></svg>', isYouthTeam: false },
  { id: 'team6', name: 'Hawks', homeGround: 'HGG', logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="#F97316" stroke="#7C2D12" stroke-width="4"/></svg>', isYouthTeam: false },
];

export const GROUNDS: Ground[] = [
  { name: "Keenjhur Cricket Ground", code: "KCG", pitch: "Balanced Sporting Pitch", dimensions: "70m / 68m", weather: "Sunny", boundarySize: "Medium", outfieldSpeed: "Fast", capacity: 25000 },
  { name: "School Ground", code: "SG", pitch: "Dusty Spinner’s Haven", dimensions: "62m / 60m", weather: "Dry", boundarySize: "Small", outfieldSpeed: "Slow", capacity: 5000 },
  { name: "Transformer Ground", code: "TG", pitch: "Green Top", dimensions: "75m / 72m", weather: "Overcast", boundarySize: "Large", outfieldSpeed: "Medium", capacity: 12000 },
  { name: "Lake Way Ground", code: "LWG", pitch: "Batting Paradise", dimensions: "65m / 65m", weather: "Sunny", boundarySize: "Small", outfieldSpeed: "Lightning", capacity: 18000 },
  { name: "Home Gate Ground", code: "HGG", pitch: "Dead Slow Track", dimensions: "68m / 68m", weather: "Humid", boundarySize: "Medium", outfieldSpeed: "Slow", capacity: 8000 },
  { name: "Mosque Cricket Ground", code: "MCG", pitch: "Cracked Worn Surface", dimensions: "72m / 70m", weather: "Dry", boundarySize: "Large", outfieldSpeed: "Medium", capacity: 15000 },
];

export const PITCH_TYPES = [ "Balanced Sporting Pitch", "Dusty Spinner’s Haven", "Green Top", "Batting Paradise", "Dead Slow Track", "Cracked Worn Surface" ];

export const generateSingleFormatInitialStats = (): PlayerStats => ({
    matches: 0, runs: 0, highestScore: 0, average: 0, strikeRate: 0, ballsFaced: 0, dismissals: 0,
    hundreds: 0, fifties: 0, thirties: 0, fours: 0, sixes: 0, fastestFifty: 0, fastestHundred: 0,
    wickets: 0, economy: 0, bestBowling: '-', bestBowlingWickets: 0, bestBowlingRuns: 0,
    bowlingAverage: 0, ballsBowled: 0, runsConceded: 0, threeWicketHauls: 0, fiveWicketHauls: 0,
    catches: 0, runOuts: 0, manOfTheMatchAwards: 0,
});

export const generateInitialStats = (): { [key in Format]: PlayerStats } => {
    const stats: any = {};
    Object.values(Format).forEach(f => stats[f] = generateSingleFormatInitialStats());
    return stats;
};

// --- RAW PLAYER DATA (2026 EDITION) ---
const playersRaw: any[] = [
  // --- AUSTRALIA ---
  { id: 'aus-1', name: 'M.G. Glaxen', nationality: 'Australia', role: PlayerRole.ALL_ROUNDER, battingSkill: 82, secondarySkill: 65, style: 'A', isOpener: true, isForeign: true, avatarSeed: 'Glaxen' },
  { id: 'aus-2', name: 'Lance', nationality: 'Australia', role: PlayerRole.BATSMAN, battingSkill: 76, secondarySkill: 0, style: 'N', isOpener: true, isForeign: true, avatarSeed: 'Lance' },
  { id: 'aus-3', name: 'Parsh', nationality: 'Australia', role: PlayerRole.WICKET_KEEPER, battingSkill: 76, secondarySkill: 0, style: 'N', isOpener: true, isForeign: true, avatarSeed: 'Parsh' },
  { id: 'aus-4', name: 'Wilton', nationality: 'Australia', role: PlayerRole.ALL_ROUNDER, battingSkill: 72, secondarySkill: 64, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Wilton' },
  { id: 'aus-5', name: 'Mausechate', nationality: 'Australia', role: PlayerRole.BATSMAN, battingSkill: 69, secondarySkill: 23, style: 'A', isOpener: false, isForeign: true, avatarSeed: 'Mausechate' },
  { id: 'aus-6', name: 'A. Haddin', nationality: 'Australia', role: PlayerRole.ALL_ROUNDER, battingSkill: 65, secondarySkill: 56, style: 'A', isOpener: false, isForeign: true, avatarSeed: 'Haddin' },
  { id: 'aus-7', name: 'J. Harris', nationality: 'Australia', role: PlayerRole.ALL_ROUNDER, battingSkill: 56, secondarySkill: 45, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Harris' },
  { id: 'aus-8', name: 'Lin', nationality: 'Australia', role: PlayerRole.FAST_BOWLER, battingSkill: 34, secondarySkill: 68, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Lin' },
  { id: 'aus-9', name: 'Wade', nationality: 'Australia', role: PlayerRole.FAST_BOWLER, battingSkill: 25, secondarySkill: 84, style: 'D', isOpener: false, isForeign: true, avatarSeed: 'Wade' },
  { id: 'aus-10', name: 'Langer', nationality: 'Australia', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 72, style: 'D', isOpener: false, isForeign: true, avatarSeed: 'Langer' },

  // --- NEW ZEALAND ---
  { id: 'nz-1', name: 'Sprike', nationality: 'New Zealand', role: PlayerRole.WICKET_KEEPER, battingSkill: 80, secondarySkill: 0, style: 'A', isOpener: true, isForeign: true, avatarSeed: 'Sprike' },
  { id: 'nz-2', name: 'S. Warner', nationality: 'New Zealand', role: PlayerRole.BATSMAN, battingSkill: 76, secondarySkill: 33, style: 'A', isOpener: true, isForeign: true, avatarSeed: 'Warner' },
  { id: 'nz-3', name: 'Addams', nationality: 'New Zealand', role: PlayerRole.ALL_ROUNDER, battingSkill: 55, secondarySkill: 45, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Addams' },
  { id: 'nz-4', name: 'B. Rington', nationality: 'New Zealand', role: PlayerRole.ALL_ROUNDER, battingSkill: 45, secondarySkill: 56, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Rington' },
  { id: 'nz-5', name: 'Waller', nationality: 'New Zealand', role: PlayerRole.FAST_BOWLER, battingSkill: 23, secondarySkill: 67, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Waller' },

  // --- ENGLAND ---
  { id: 'eng-1', name: 'N. Colin', nationality: 'England', role: PlayerRole.ALL_ROUNDER, battingSkill: 70, secondarySkill: 61, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Colin' },
  { id: 'eng-2', name: 'D. Quentin', nationality: 'England', role: PlayerRole.BATSMAN, battingSkill: 56, secondarySkill: 23, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Quentin' },

  // --- SOUTH AFRICA ---
  { id: 'sa-1', name: 'James', nationality: 'South Africa', role: PlayerRole.ALL_ROUNDER, battingSkill: 63, secondarySkill: 66, style: 'A', isOpener: false, isForeign: true, avatarSeed: 'James' },
  { id: 'sa-2', name: 'Aram', nationality: 'South Africa', role: PlayerRole.ALL_ROUNDER, battingSkill: 45, secondarySkill: 66, style: 'D', isOpener: false, isForeign: true, avatarSeed: 'Aram' },

  // --- SRI LANKA ---
  { id: 'sl-1', name: 'Sriwardna', nationality: 'Sri Lanka', role: PlayerRole.BATSMAN, battingSkill: 67, secondarySkill: 0, style: 'D', isOpener: false, isForeign: true, avatarSeed: 'Sriwardna' },
  { id: 'sl-2', name: 'C. Dhanushka', nationality: 'Sri Lanka', role: PlayerRole.ALL_ROUNDER, battingSkill: 45, secondarySkill: 66, style: 'D', isOpener: false, isForeign: true, avatarSeed: 'Dhanushka' },

  // --- WEST INDIES ---
  { id: 'wi-1', name: 'A. Chadwick', nationality: 'West Indies', role: PlayerRole.WICKET_KEEPER, battingSkill: 73, secondarySkill: 0, style: 'A', isOpener: true, isForeign: true, avatarSeed: 'Chadwick' },
  { id: 'wi-2', name: 'Jordan', nationality: 'West Indies', role: PlayerRole.FAST_BOWLER, battingSkill: 23, secondarySkill: 66, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Jordan' },
  { id: 'wi-3', name: 'N. Fill', nationality: 'West Indies', role: PlayerRole.SPIN_BOWLER, battingSkill: 22, secondarySkill: 68, style: 'N', isOpener: false, isForeign: true, avatarSeed: 'Fill' },

  // --- PAKISTAN (DOMESTIC) ---
  // Batsmen
  { id: 'pak-bt-1', name: 'Faisal Hasan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 83, secondarySkill: 60, style: 'NA', isOpener: true, isForeign: false, avatarSeed: 'Faisal' },
  { id: 'pak-bt-2', name: 'Nasir', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 81, secondarySkill: 48, style: 'NA', isOpener: true, isForeign: false, avatarSeed: 'Nasir' },
  { id: 'pak-bt-3', name: 'Abid', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 79, secondarySkill: 45, style: 'NA', isOpener: true, isForeign: false, avatarSeed: 'Abid' },
  { id: 'pak-bt-4', name: 'Farhan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 78, secondarySkill: 10, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Farhan' },
  { id: 'pak-bt-5', name: 'Azhar', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 75, secondarySkill: 45, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Azhar' },
  { id: 'pak-bt-6', name: 'Nauman', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 72, secondarySkill: 12, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Nauman' },
  { id: 'pak-bt-7', name: 'Husnain', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 72, secondarySkill: 22, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Husnain' },
  { id: 'pak-bt-8', name: 'K. Navid', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 72, secondarySkill: 45, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Navid' },
  { id: 'pak-bt-9', name: 'M. Musa', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 72, secondarySkill: 8, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Musa' },
  { id: 'pak-bt-10', name: 'Abass', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 72, secondarySkill: 0, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Abass' },
  { id: 'pak-bt-11', name: 'Aslam', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 71, secondarySkill: 12, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Aslam' },
  { id: 'pak-bt-12', name: 'Fakhrudin', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 70, secondarySkill: 23, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Fakhrudin' },
  { id: 'pak-bt-13', name: 'Hamid Hasan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 70, secondarySkill: 10, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Hamid' },
  { id: 'pak-bt-14', name: 'M. Shahzain', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 70, secondarySkill: 34, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Shahzain' },
  { id: 'pak-bt-15', name: 'A. Hafeez', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 68, secondarySkill: 11, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Hafeez' },
  { id: 'pak-bt-16', name: 'Shahid', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 68, secondarySkill: 45, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Shahid' },
  { id: 'pak-bt-17', name: 'Yasir', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 67, secondarySkill: 12, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Yasir' },
  { id: 'pak-bt-18', name: 'S. Hasan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 65, secondarySkill: 10, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Hasan' },
  { id: 'pak-bt-19', name: 'Siraj', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 63, secondarySkill: 22, style: 'D', isOpener: true, isForeign: false, avatarSeed: 'Siraj' },
  { id: 'pak-bt-20', name: 'Haider', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 62, secondarySkill: 25, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Haider' },
  { id: 'pak-bt-21', name: 'Jahid', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 61, secondarySkill: 22, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Jahid' },
  { id: 'pak-bt-22', name: 'Asad', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 60, secondarySkill: 11, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Asad' },
  { id: 'pak-bt-23', name: 'Zakir', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 59, secondarySkill: 11, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Zakir' },
  { id: 'pak-bt-24', name: 'A. Jamal', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 59, secondarySkill: 0, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Jamal' },
  { id: 'pak-bt-25', name: 'Shoaib Khan', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 56, secondarySkill: 25, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Shoaib' },
  { id: 'pak-bt-26', name: 'Altaf', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 55, secondarySkill: 10, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Altaf' },
  { id: 'pak-bt-27', name: 'Ashfaq', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 55, secondarySkill: 10, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Ashfaq' },
  { id: 'pak-bt-28', name: 'Aziz', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 53, secondarySkill: 22, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Aziz' },
  { id: 'pak-bt-29', name: 'A. Usman', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 53, secondarySkill: 22, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Usman' },
  { id: 'pak-bt-30', name: 'Aafaq', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 50, secondarySkill: 10, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Aafaq' },
  { id: 'pak-bt-31', name: 'Sadiq', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 46, secondarySkill: 10, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Sadiq' },
  { id: 'pak-bt-32', name: 'Qasim', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 45, secondarySkill: 12, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Qasim' },

  // All-Rounders
  { id: 'pak-ar-1', name: 'Sike', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 87, secondarySkill: 85, style: 'NA', isOpener: true, isForeign: false, avatarSeed: 'Sike' },
  { id: 'pak-ar-2', name: 'Amir', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 81, secondarySkill: 85, style: 'NA', isOpener: false, isForeign: false, avatarSeed: 'Amir' },
  { id: 'pak-ar-3', name: 'Aaqib Raza', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 78, secondarySkill: 70, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Aaqib' },
  { id: 'pak-ar-4', name: 'Aftab', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 70, secondarySkill: 61, style: 'NA', isOpener: true, isForeign: false, avatarSeed: 'Aftab' },
  { id: 'pak-ar-5', name: 'Irfaan Ali', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 70, secondarySkill: 56, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Irfaan' },
  { id: 'pak-ar-6', name: 'Saeed', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 60, secondarySkill: 58, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Saeed' },
  { id: 'pak-ar-7', name: 'M. Tahir', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 60, secondarySkill: 56, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Tahir' },
  { id: 'pak-ar-8', name: 'Jahangir', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 60, secondarySkill: 58, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Jahangir' },
  { id: 'pak-ar-9', name: 'Nawaz', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 57, secondarySkill: 67, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Nawaz' },
  { id: 'pak-ar-10', name: 'Taimoor', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 56, secondarySkill: 51, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Taimoor' },
  { id: 'pak-ar-11', name: 'M. Asghar', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 56, secondarySkill: 55, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Asghar' },
  { id: 'pak-ar-12', name: 'Mansoor', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 55, secondarySkill: 65, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Mansoor' },
  { id: 'pak-ar-13', name: 'Khalid', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 54, secondarySkill: 45, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Khalid' },
  { id: 'pak-ar-14', name: 'Wahab', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 50, secondarySkill: 51, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Wahab' },
  { id: 'pak-ar-15', name: 'Najaf', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 41, secondarySkill: 63, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Najaf' },

  // Wicket Keepers
  { id: 'pak-wk-1', name: 'I. Javed', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 84, secondarySkill: 85, style: 'NA', isOpener: true, isForeign: false, avatarSeed: 'Javed' },
  { id: 'pak-wk-2', name: 'M. Amin', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 79, secondarySkill: 80, style: 'NA', isOpener: true, isForeign: false, avatarSeed: 'Amin' },
  { id: 'pak-wk-3', name: 'Zahid', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 77, secondarySkill: 76, style: 'D', isOpener: true, isForeign: false, avatarSeed: 'Zahid' },
  { id: 'pak-wk-4', name: 'S. Khan', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 75, secondarySkill: 87, style: 'D', isOpener: true, isForeign: false, avatarSeed: 'Khan' },
  { id: 'pak-wk-5', name: 'Haseebullah', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 72, secondarySkill: 78, style: 'NA', isOpener: true, isForeign: false, avatarSeed: 'Haseebullah' },
  { id: 'pak-wk-6', name: 'Zulqarnain', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 70, secondarySkill: 78, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Zulqarnain' },
  { id: 'pak-wk-7', name: 'M. Imran', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 68, secondarySkill: 60, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Imran' },
  { id: 'pak-wk-8', name: 'Yaqoob', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 63, secondarySkill: 68, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Yaqoob' },
  { id: 'pak-wk-9', name: 'Atiq Ali', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 62, secondarySkill: 72, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Atiq' },
  { id: 'pak-wk-10', name: 'Ali', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 60, secondarySkill: 67, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Ali' },
  { id: 'pak-wk-11', name: 'R. Saad', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 60, secondarySkill: 70, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Saad' },
  { id: 'pak-wk-12', name: 'Shahid Latif', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 59, secondarySkill: 67, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Latif' },
  { id: 'pak-wk-13', name: 'A. Sajjad', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 55, secondarySkill: 69, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Sajjad' },
  { id: 'pak-wk-14', name: 'Aslam Sattar', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 55, secondarySkill: 60, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Sattar' },
  { id: 'pak-wk-15', name: 'Uddin Ali', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 55, secondarySkill: 65, style: 'N', isOpener: true, isForeign: false, avatarSeed: 'Uddin' },

  // Bowlers (BL & SB)
  { id: 'pak-bl-1', name: 'Iqrar', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 19, secondarySkill: 90, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Iqrar' },
  { id: 'pak-bl-2', name: 'Aramzad', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 25, secondarySkill: 85, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Aramzad' },
  { id: 'pak-bl-3', name: 'Zohaib', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 36, secondarySkill: 85, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Zohaib' },
  { id: 'pak-bl-4', name: 'Naseem', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 81, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Naseem' },
  { id: 'pak-sb-1', name: 'Anwar', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 28, secondarySkill: 81, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Anwar' },
  { id: 'pak-bl-5', name: 'Farhan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 24, secondarySkill: 80, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Farhan' },
  { id: 'pak-bl-6', name: 'Ahsan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 78, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Ahsan' },
  { id: 'pak-sb-2', name: 'Bilal', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 40, secondarySkill: 78, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Bilal' },
  { id: 'pak-bl-7', name: 'Naeem', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 75, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Naeem' },
  { id: 'pak-bl-8', name: 'Sohail', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 24, secondarySkill: 75, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Sohail' },
  { id: 'pak-bl-9', name: 'Salman', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 30, secondarySkill: 73, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Salman' },
  { id: 'pak-bl-10', name: 'Sameen', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 72, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Sameen' },
  { id: 'pak-bl-11', name: 'Zia', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 23, secondarySkill: 72, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Zia' },
  { id: 'pak-sb-3', name: 'Asim', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 23, secondarySkill: 71, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Asim' },
  { id: 'pak-bl-12', name: 'Muzafar', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 71, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Muzafar' },
  { id: 'pak-bl-13', name: 'Azam', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 23, secondarySkill: 70, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Azam' },
  { id: 'pak-bl-14', name: 'Rizwan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 70, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Rizwan' },
  { id: 'pak-bl-15', name: 'Akhlaq', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 69, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Akhlaq' },
  { id: 'pak-sb-4', name: 'Amjad', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 30, secondarySkill: 69, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Amjad' },
  { id: 'pak-sb-5', name: 'M. Amjad', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 45, secondarySkill: 68, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Amjad' },
  { id: 'pak-bl-16', name: 'M. Ali', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 23, secondarySkill: 67, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Ali' },
  { id: 'pak-bl-17', name: 'Ilyas', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 11, secondarySkill: 63, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Ilyas' },
  { id: 'pak-sb-6', name: 'Abrar', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 22, secondarySkill: 62, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Abrar' },
  { id: 'pak-sb-7', name: 'Mehrab', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 16, secondarySkill: 62, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Mehrab' },
  { id: 'pak-sb-8', name: 'Rehan', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 12, secondarySkill: 61, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Rehan' },
  { id: 'pak-sb-9', name: 'Rahat', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 12, secondarySkill: 59, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Rahat' },
  { id: 'pak-bl-18', name: 'Waheed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 16, secondarySkill: 59, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Waheed' },
  { id: 'pak-sb-10', name: 'Arshad', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 22, secondarySkill: 56, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Arshad' },
  { id: 'pak-bl-19', name: 'Faraz Khan', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 12, secondarySkill: 56, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Faraz' },
  { id: 'pak-sb-11', name: 'Adnan', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 12, secondarySkill: 56, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Adnan' },
  { id: 'pak-bl-20', name: 'Waleed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 23, secondarySkill: 55, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Waleed' },
  { id: 'pak-sb-12', name: 'Riaz', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 11, secondarySkill: 55, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Riaz' },
  { id: 'pak-sb-13', name: 'N. Samad', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 23, secondarySkill: 55, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Samad' },
  { id: 'pak-bl-21', name: 'M. Arif', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 12, secondarySkill: 55, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Arif' },
  { id: 'pak-bl-22', name: 'Atif Maqbool', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 12, secondarySkill: 53, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Maqbool' },
  { id: 'pak-bl-23', name: 'N. Javed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 22, secondarySkill: 49, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Javed' },
  { id: 'pak-bl-24', name: 'Sohail Ahmed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 23, secondarySkill: 46, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Ahmed' },

  // --- DOMESTIC PLAYERS (ADDITIONAL) ---
  { id: 'dom-bt-1', name: 'Rashid Nawaz', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 63, secondarySkill: 18, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Nawaz' },
  { id: 'dom-bt-2', name: 'Noman Ali', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 61, secondarySkill: 20, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Ali' },
  { id: 'dom-bt-3', name: 'Bilal Ahmed', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 60, secondarySkill: 18, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Ahmed' },
  { id: 'dom-bt-4', name: 'Imran Latif', nationality: 'Local', role: PlayerRole.BATSMAN, battingSkill: 62, secondarySkill: 10, style: 'A', isOpener: true, isForeign: false, avatarSeed: 'Latif' },
  { id: 'dom-ar-1', name: 'Naveed Anwar', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 62, secondarySkill: 63, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Anwar' },
  { id: 'dom-ar-2', name: 'Rizwan Khalid', nationality: 'Local', role: PlayerRole.ALL_ROUNDER, battingSkill: 60, secondarySkill: 61, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Khalid' },
  { id: 'dom-wk-1', name: 'Ali Raza', nationality: 'Local', role: PlayerRole.WICKET_KEEPER, battingSkill: 62, secondarySkill: 12, style: 'D', isOpener: false, isForeign: false, avatarSeed: 'Ali' },
  { id: 'dom-sb-1', name: 'Mohsin Ali', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 64, secondarySkill: 63, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Ali' },
  { id: 'dom-sb-2', name: 'Asad Niazi', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 60, secondarySkill: 62, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Asad' },
  { id: 'dom-sb-3', name: 'Hassan Zia', nationality: 'Local', role: PlayerRole.SPIN_BOWLER, battingSkill: 59, secondarySkill: 63, style: 'A', isOpener: false, isForeign: false, avatarSeed: 'Zia' },
  { id: 'dom-bl-1', name: 'Jahangir Ali', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 36, secondarySkill: 64, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Jahangir' },
  { id: 'dom-bl-2', name: 'Zohaib Malik', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 32, secondarySkill: 62, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Zohaib' },
  { id: 'dom-bl-3', name: 'Rauf Ahmed', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 36, secondarySkill: 61, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Ahmed' },
  { id: 'dom-bl-4', name: 'Asif Hanif', nationality: 'Local', role: PlayerRole.FAST_BOWLER, battingSkill: 42, secondarySkill: 64, style: 'N', isOpener: false, isForeign: false, avatarSeed: 'Ahmed' },
];

export const PLAYERS: Player[] = playersRaw.map(p => ({
    ...p,
    stats: generateInitialStats()
}));

export const PRE_BUILT_SQUADS: Record<string, string[]> = {
  'team1': [
    'aus-1', 'nz-1', 'eng-1', // Foreign
    'pak-bt-1', 'pak-bt-2', 'pak-bt-3', 'pak-bt-4', 'pak-bt-5', // Batsmen
    'pak-ar-1', 'pak-ar-2', 'pak-ar-3', // All-Rounders
    'pak-wk-1', 'pak-wk-2', // Wicket Keepers
    'pak-bl-1', 'pak-bl-2', 'pak-bl-3', 'pak-sb-1', 'pak-sb-2' // Bowlers
  ],
  'team2': [
    'aus-2', 'nz-2', 'eng-2', // Foreign
    'pak-bt-6', 'pak-bt-7', 'pak-bt-8', 'pak-bt-9', 'pak-bt-10',
    'pak-ar-4', 'pak-ar-5', 'pak-ar-6',
    'pak-wk-3', 'pak-wk-4',
    'pak-bl-4', 'pak-bl-5', 'pak-bl-6', 'pak-sb-3', 'pak-sb-4'
  ],
  'team3': [
    'aus-3', 'nz-3', 'sa-1', // Foreign
    'pak-bt-11', 'pak-bt-12', 'pak-bt-13', 'pak-bt-14', 'pak-bt-15',
    'pak-ar-7', 'pak-ar-8', 'pak-ar-9',
    'pak-wk-5', 'pak-wk-6',
    'pak-bl-7', 'pak-bl-8', 'pak-bl-9', 'pak-sb-5', 'pak-sb-6'
  ],
  'team4': [
    'aus-4', 'nz-4', 'sa-2', // Foreign
    'pak-bt-16', 'pak-bt-17', 'pak-bt-18', 'pak-bt-19', 'pak-bt-20',
    'pak-ar-10', 'pak-ar-11', 'pak-ar-12',
    'pak-wk-7', 'pak-wk-8',
    'pak-bl-10', 'pak-bl-11', 'pak-bl-12', 'pak-sb-7', 'pak-sb-8'
  ],
  'team5': [
    'aus-5', 'nz-5', 'sl-1', // Foreign
    'pak-bt-21', 'pak-bt-22', 'pak-bt-23', 'pak-bt-24', 'pak-bt-25',
    'pak-ar-13', 'pak-ar-14', 'pak-ar-15',
    'pak-wk-9', 'pak-wk-10',
    'pak-bl-13', 'pak-bl-14', 'pak-bl-15', 'pak-sb-9', 'pak-sb-10'
  ],
  'team6': [
    'aus-6', 'aus-7', 'sl-2', // Foreign
    'pak-bt-26', 'pak-bt-27', 'pak-bt-28', 'pak-bt-29', 'pak-bt-30',
    'dom-ar-1', 'dom-ar-2', 'pak-ar-15', // Changed pak-ar-1 to pak-ar-15 to avoid duplicate
    'pak-wk-11', 'pak-wk-12',
    'pak-bl-16', 'pak-bl-17', 'pak-bl-18', 'pak-sb-11', 'pak-sb-12'
  ],
};

export const INITIAL_NEWS: NewsArticle[] = [
    { id: 'n1', headline: "Season 26 Auction Concluded!", date: "28 Jun 2025", excerpt: "Teams have finalized their 18-man core squads.", content: "The hammer has fallen. Franchises have spent big to secure a mix of local grit and foreign flair. Minimum 15 player rule was strictly enforced.", type: 'league' },
    { id: 'n2', headline: "Triple Format Challenge 26", date: "29 Jun 2025", excerpt: "Teams brace for T20, One-Day, and Shield formats.", content: "Consistency will be key. The season opens with T20, followed by One-Day, and concluding with the multi-day Shield.", type: 'league' },
    { id: 'n3', headline: "Global Stars Arrive", date: "30 Jun 2025", excerpt: "Haddin, Warner, Sprike and others touch down.", content: "The foreign contingent has arrived. With only 3 foreign slots per team, the pressure is on the international stars to perform.", type: 'league' },
];

export const NEWS_ARTICLES = INITIAL_NEWS;
