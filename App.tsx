import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameData, Team, Format, MatchResult, Standing, Player, Match } from './types';
import { PLAYERS, TEAMS, GROUNDS, PRE_BUILT_SQUADS, INITIAL_SPONSORSHIPS, INITIAL_NEWS } from './data';
import { LoadingSpinner, generateLeagueSchedule } from './utils';
import ConfirmModal from './components/ConfirmModal';
import { Icons } from './components/Icons';

// Components
import MainMenu from './components/MainMenu';
import TeamSelection from './components/TeamSelection';
import CareerHub from './components/CareerHub';
import AuctionRoom from './components/AuctionRoom';
import Lineups from './components/Lineups';
import Editor from './components/Editor';

export const MAX_SQUAD_SIZE = 16;
export const MIN_SQUAD_SIZE = 16;
export const MAX_FOREIGN_PLAYERS = 3;

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] bg-[#050808] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.2)_0%,transparent_70%)]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
        className="relative mb-8 md:mb-10 z-10"
      >
        <div className="w-24 h-24 md:w-48 md:h-48 bg-[#050808] rounded-[24px] md:rounded-[40px] flex items-center justify-center shadow-[0_0_60px_rgba(20,184,166,0.4)] border-[6px] md:border-[12px] border-white/10 relative overflow-hidden group">
            <img src="/favicon.svg" alt="Cricket Manager 26 Logo" className="w-14 h-14 md:w-32 md:h-32 relative z-10 drop-shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
            />
        </div>
        
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-6 md:-inset-12 border border-dashed border-teal-500/30 rounded-full"
        />
      </motion.div>
      
      <div className="z-10">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-3 md:mb-4"
        >
            <div className="h-[1px] w-6 md:w-8 bg-gradient-to-r from-transparent to-teal-500/50" />
            <span className="text-[7px] md:text-[8px] font-black text-teal-500 uppercase tracking-[0.6em]">SIKES_INTERACTIVE</span>
            <div className="h-[1px] w-6 md:w-8 bg-gradient-to-l from-transparent to-teal-500/50" />
        </motion.div>
        
        <motion.h1 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-1.5 md:mb-2 font-display leading-[0.85]"
        >
            CRICKET<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-500 to-teal-700">MANAGER</span>
        </motion.h1>
        
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex items-center justify-center gap-3 md:gap-4 mt-4 md:mt-6"
        >
            <div className="flex flex-col items-center">
                <span className="text-[7px] md:text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">VERSION</span>
                <span className="text-[10px] md:text-xs font-black text-white/80">26.0.1</span>
            </div>
            <div className="w-px h-5 md:h-6 bg-white/10" />
            <div className="flex flex-col items-center">
                <span className="text-[7px] md:text-[8px] font-bold text-white/20 uppercase tracking-widest mb-0.5">ENGINE</span>
                <span className="text-[10px] md:text-xs font-black text-teal-500">APEX_V3</span>
            </div>
        </motion.div>
      </div>

      <div className="absolute bottom-20 w-40 md:w-72 h-1 bg-white/5 rounded-full overflow-hidden z-10">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 3.5, ease: [0.65, 0, 0.35, 1] }}
          className="h-full bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600 shadow-[0_0_20px_rgba(20,184,166,0.6)]"
        />
      </div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="absolute bottom-8 text-[8px] font-black text-white/10 uppercase tracking-[0.4em]"
      >
        EST. 2026 // SECURE_BOOT
      </motion.p>
    </motion.div>
  );
};

const GameCover = ({ onStart, isInstallable, onInstall }: { onStart: () => void; isInstallable: boolean; onInstall: () => void }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[90] bg-[#050808] flex flex-col items-center justify-between p-6 md:p-12 overflow-hidden font-sans"
        >
            {/* Premium Background */}
            <div className="absolute inset-0 z-0">
                <motion.img 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                    src="/cover.svg" 
                    alt="Cover" 
                    className="w-full h-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#050808] via-transparent to-[#050808]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,8,8,0.8)_100%)]" />
            </div>

            {/* Top Branding */}
            <div className="z-10 w-full flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-[7px] md:text-[10px] font-black text-teal-500 uppercase tracking-[0.4em]">SIKES_INTERACTIVE</span>
                    <span className="text-[6px] md:text-[8px] font-mono font-bold text-white/20 uppercase tracking-widest">LICENSED_2026</span>
                </div>
                {isInstallable && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onInstall}
                        className="bg-teal-500 text-black p-1.5 md:p-3 rounded-lg md:rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.4)] flex items-center gap-1.5 md:gap-2"
                    >
                        <Icons.Download className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest">INSTALL</span>
                    </motion.button>
                )}
            </div>

            <div className="z-10 text-center">
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-1.5 md:gap-2 bg-teal-500/10 text-teal-500 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[7px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-4 md:mb-8 border border-teal-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(20,184,166,0.1)]">
                        <Icons.Trophy className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        NEXT_GEN_STRATEGY
                    </div>
                    
                    <h1 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-1.5 md:mb-4 font-display leading-[0.8] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                        CRICKET<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-teal-500 to-teal-700">MANAGER</span>
                    </h1>
                    
                    <div className="flex items-center justify-center gap-3 md:gap-4 mt-1.5 md:mt-2">
                        <div className="h-[1px] w-10 md:w-12 bg-gradient-to-r from-transparent to-white/20" />
                        <span className="text-2xl md:text-5xl font-black italic text-teal-500 font-display tracking-widest drop-shadow-[0_0_20px_rgba(20,184,166,0.5)]">26</span>
                        <div className="h-[1px] w-10 md:w-12 bg-gradient-to-l from-transparent to-white/20" />
                    </div>
                </motion.div>
            </div>

            <div className="z-10 w-full flex flex-col items-center gap-6 md:gap-12 mb-4 md:mb-8">
                <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStart}
                    className="group relative w-full max-w-[200px] md:max-w-xs py-4 md:py-6 bg-white text-black font-black uppercase italic tracking-[0.2em] text-sm md:text-lg rounded-xl md:rounded-2xl overflow-hidden transition-all shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:bg-teal-500 hover:text-white"
                >
                    <span className="relative z-10">INITIALIZE_SYSTEM</span>
                    <motion.div 
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                    />
                </motion.button>

                <div className="flex items-center gap-6 md:gap-12">
                    <div className="flex flex-col items-center">
                        <span className="text-[6px] md:text-[9px] font-bold text-white/20 uppercase tracking-widest mb-0.5">PLATFORM</span>
                        <div className="flex items-center gap-1">
                            <Icons.Smartphone className="w-2 h-2 md:w-2.5 md:h-2.5 text-teal-500" />
                            <span className="text-[8px] md:text-[11px] font-black text-white/80">PWA_MOBILE</span>
                        </div>
                    </div>
                    <div className="w-px h-6 md:h-10 bg-white/10" />
                    <div className="flex flex-col items-center">
                        <span className="text-[6px] md:text-[9px] font-bold text-white/20 uppercase tracking-widest mb-0.5">SECURITY</span>
                        <div className="flex items-center gap-1">
                            <Icons.ShieldCheck className="w-2 h-2 md:w-2.5 md:h-2.5 text-teal-500" />
                            <span className="text-[8px] md:text-[11px] font-black text-white/80">ENCRYPTED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50" />
            
            {/* Corner Decor */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-white/10 rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-white/10 rounded-br-2xl pointer-events-none" />
        </motion.div>
    );
};

export type AppState = 'MAIN_MENU' | 'TEAM_SELECTION' | 'AUCTION' | 'CAREER_HUB' | 'EDITOR';

export const App = () => {
  const [appState, setAppState] = useState<AppState>('MAIN_MENU');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showCover, setShowCover] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('cricketManagerTheme') || 'dark';
    setTheme(savedTheme as 'light' | 'dark');
    const savedGame = localStorage.getItem('cricketManagerSave');
    if (savedGame) {
        setHasSaveData(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
    localStorage.setItem('cricketManagerTheme', theme);
  }, [theme]);

  useEffect(() => {
    if (gameData && !isLoading) {
      localStorage.setItem('cricketManagerSave', JSON.stringify(gameData));
      setHasSaveData(true);
    }
  }, [gameData, isLoading]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const saveGame = () => {
    showFeedback("Progress is saved automatically!");
  };

  const validateGameData = (data: any): GameData | null => {
    if (!data || typeof data !== 'object') return null;
    
    // Basic required fields
    if (!data.teams || !Array.isArray(data.teams)) return null;
    if (!data.allPlayers || !Array.isArray(data.allPlayers)) return null;
    if (!data.schedule || typeof data.schedule !== 'object') return null;
    if (!data.currentMatchIndex || typeof data.currentMatchIndex !== 'object') return null;
    if (!data.standings || typeof data.standings !== 'object') return null;
    if (!data.matchResults || typeof data.matchResults !== 'object') return null;

    // Ensure all formats are present in keys
    const formats = Object.values(Format);
    formats.forEach(f => {
        if (!data.schedule[f]) data.schedule[f] = [];
        if (data.currentMatchIndex[f] === undefined) data.currentMatchIndex[f] = 0;
        if (!data.standings[f]) data.standings[f] = [];
        if (!data.matchResults[f]) data.matchResults[f] = [];
    });

    // Ensure other fields exist
    if (!data.awardsHistory) data.awardsHistory = [];
    if (!data.playingXIs) data.playingXIs = {};
    if (!data.sponsorships) data.sponsorships = INITIAL_SPONSORSHIPS;
    if (!data.news) data.news = INITIAL_NEWS;
    if (!data.records) data.records = { batterVsBowler: [], teamVsTeam: [], playerVsTeam: [] };
    if (!data.currentSeason) data.currentSeason = 1;
    if (!data.currentFormat) data.currentFormat = Format.T20;
    if (data.popularity === undefined) data.popularity = 50;

    return data as GameData;
  };

  const loadGame = () => {
    setConfirmModal({
        isOpen: true,
        title: "Load Game",
        message: "Loading a saved game will overwrite your current unsaved progress. Continue?",
        type: 'warning',
        onConfirm: () => {
            const savedGame = localStorage.getItem('cricketManagerSave');
            if (savedGame) {
                try {
                    const parsed = JSON.parse(savedGame);
                    const validated = validateGameData(parsed);
                    if (validated) {
                        setGameData(validated);
                        showFeedback("Game Loaded!", "success");
                        setAppState('CAREER_HUB');
                    } else {
                        throw new Error("Invalid game data structure");
                    }
                } catch (e) {
                    console.error("Failed to parse saved game data during load:", e);
                    localStorage.removeItem('cricketManagerSave');
                    setHasSaveData(false);
                    showFeedback("Failed to load saved game. It may be corrupt.", "error");
                }
            } else {
                showFeedback("No saved game found.", "error");
            }
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const resumeGame = () => {
    const savedGame = localStorage.getItem('cricketManagerSave');
    if (savedGame) {
        try {
            const parsed = JSON.parse(savedGame);
            const validated = validateGameData(parsed);
            if (validated) {
                setGameData(validated);
                setAppState('CAREER_HUB');
                showFeedback("Game Resumed!", "success");
            } else {
                throw new Error("Invalid game data structure");
            }
        } catch(e) {
            console.error("Failed to parse saved game data:", e);
            localStorage.removeItem('cricketManagerSave');
            setHasSaveData(false);
            showFeedback("Failed to load saved game. It may be corrupt.", "error");
        }
    }
  };

  const handleStartNewGame = () => {
    if (hasSaveData) {
        setConfirmModal({
            isOpen: true,
            title: "New Career",
            message: "Starting a new game will overwrite your saved progress. Are you sure?",
            type: 'danger',
            onConfirm: () => {
                setAppState('TEAM_SELECTION');
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    } else {
        setAppState('TEAM_SELECTION');
    }
  };

  const handleOpenEditor = () => {
    if (!gameData) {
      // Provide default data if no save exists
      setGameData({
        userTeamId: '',
        teams: [],
        grounds: [...GROUNDS],
        allTeamsData: [...TEAMS],
        allPlayers: [...PLAYERS],
        schedule: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: [] }), {} as Record<Format, Match[]>),
        currentMatchIndex: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<Format, number>),
        standings: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: [] }), {} as Record<Format, Standing[]>),
        matchResults: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: [] }), {} as Record<Format, MatchResult[]>),
        playingXIs: {},
        currentSeason: 1,
        currentFormat: Format.T20,
        awardsHistory: [],
        scoreLimits: {},
        records: { batterVsBowler: [], teamVsTeam: [], playerVsTeam: [] },
        promotionHistory: [],
        popularity: 50,
        sponsorships: INITIAL_SPONSORSHIPS,
        news: INITIAL_NEWS,
        activeMatch: null,
        settings: { isDoubleRoundRobin: true }
      });
    }
    setAppState('EDITOR');
  };

  const initializeNewGame = (userTeamId: string) => {
    setIsLoading(true);
    const allPlayersPool = [...PLAYERS].sort(() => Math.random() - 0.5);
    const initialTeamsData = [...TEAMS];
    const usedPlayerIds = new Set<string>();

    const initialTeams: Team[] = initialTeamsData.map(teamData => {
        // For a meaningful auction, we only retain a few core players (e.g., 4)
        const targetRetainedSize = 4;
        
        const squad: Player[] = [];
        // 1. Try to use pre-built if available (first 4)
        const preBuiltIds = (PRE_BUILT_SQUADS[teamData.id] || []).slice(0, targetRetainedSize);
        preBuiltIds.forEach(pid => {
            const p = PLAYERS.find(pl => pl.id === pid);
            if (p && !usedPlayerIds.has(pid)) {
                squad.push(JSON.parse(JSON.stringify(p)));
                usedPlayerIds.add(pid);
            }
        });

        // 2. If for some reason we don't have enough, fill to 4
        while (squad.length < targetRetainedSize) {
            const leftoverIndex = allPlayersPool.findIndex(p => !usedPlayerIds.has(p.id));
            if (leftoverIndex !== -1) {
                const p = allPlayersPool[leftoverIndex];
                squad.push(JSON.parse(JSON.stringify(p)));
                usedPlayerIds.add(p.id);
            } else {
                break;
            }
        }

        return { id: teamData.id, name: teamData.name, squad, captains: {}, purse: 100.0 };
    });

    const initialStandings = (teams: Team[]) => teams.map(team => ({ 
        teamId: team.id, teamName: team.name, played: 0, won: 0, lost: 0, drawn: 0, points: 0, netRunRate: 0, runsFor: 0, runsAgainst: 0 
    }));

    const schedules = Object.values(Format).reduce((acc, format) => {
        acc[format] = generateLeagueSchedule(initialTeams, format, true);
        return acc;
    }, {} as Record<Format, Match[]>);

    const newGameData: GameData = {
      userTeamId,
      teams: initialTeams,
      grounds: [...GROUNDS],
      allTeamsData: initialTeamsData,
      allPlayers: [...PLAYERS],
      schedule: schedules,
      currentMatchIndex: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<Format, number>),
      standings: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: initialStandings(initialTeams) }), {} as Record<Format, Standing[]>),
      matchResults: Object.values(Format).reduce((acc, format) => {
        acc[format] = [];
        return acc;
      }, {} as Record<Format, MatchResult[]>),
      playingXIs: {},
      currentSeason: 1,
      currentFormat: Format.T20, 
      awardsHistory: [],
      scoreLimits: {},
      records: {
        batterVsBowler: [],
        teamVsTeam: [],
        playerVsTeam: [],
      },
      promotionHistory: [],
      popularity: 50,
      sponsorships: INITIAL_SPONSORSHIPS,
      news: INITIAL_NEWS,
      activeMatch: null,
      settings: {
          isDoubleRoundRobin: true
      }
    };
    setGameData(newGameData);
    setAppState('AUCTION');
    setIsLoading(false);
  };

  const handleAuctionComplete = (finalTeams: Team[]) => {
      setGameData(prev => {
          if (!prev) return null;
          return { ...prev, teams: finalTeams };
      });
      setAppState('CAREER_HUB');
      showFeedback("Draft Room Closed! Ready for Match 1.", "success");
  };

  const resetGame = () => {
    setConfirmModal({
        isOpen: true,
        title: "Reset Progress",
        message: "Are you sure you want to reset all progress? This cannot be undone.",
        type: 'danger',
        onConfirm: () => {
            localStorage.removeItem('cricketManagerSave');
            setGameData(null);
            setAppState('MAIN_MENU');
            setHasSaveData(false);
            showFeedback("Reset successful.", "success");
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const renderContent = () => {
    if (isLoading) {
        return (
          <div className="bg-[#050808] h-full flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner />
            <p className="text-[10px] font-black tracking-widest text-teal-500 uppercase">Loading Data...</p>
          </div>
        );
    }
    switch(appState) {
        case 'MAIN_MENU': return <MainMenu onStartNewGame={handleStartNewGame} onResumeGame={resumeGame} onOpenEditor={handleOpenEditor} hasSaveData={hasSaveData} />;
        case 'TEAM_SELECTION': return <TeamSelection onTeamSelected={initializeNewGame} theme={theme} />;
        case 'AUCTION': return gameData ? <AuctionRoom gameData={gameData} onAuctionComplete={handleAuctionComplete} /> : null;
        case 'CAREER_HUB': return gameData ? <CareerHub gameData={gameData} setGameData={setGameData} onResetGame={resetGame} theme={theme} setTheme={setTheme} saveGame={saveGame} loadGame={loadGame} showFeedback={showFeedback} /> : null;
        case 'EDITOR': return gameData ? (
            <div className="h-full flex flex-col">
                <div className="bg-[#050808] p-4 border-b-2 border-white/10 flex justify-between items-center">
                    <button onClick={() => setAppState('MAIN_MENU')} className="text-teal-500 font-black uppercase italic text-xs hover:text-white transition-colors flex items-center gap-2">
                        <span>← BACK_TO_MENU</span>
                    </button>
                    <span className="text-[10px] font-mono font-bold opacity-30 uppercase tracking-widest">SYSTEM_ADMIN_MODE</span>
                </div>
                <div className="flex-grow overflow-hidden">
                    <Editor 
                        gameData={gameData} 
                        handleUpdatePlayer={(p) => setGameData(prev => prev ? ({...prev, allPlayers: prev.allPlayers.map(pl => pl.id === p.id ? p : pl)}) : null)}
                        handleCreatePlayer={(p) => setGameData(prev => prev ? ({...prev, allPlayers: [...prev.allPlayers, p]}) : null)}
                        handleUpdateGround={(code, updates) => setGameData(prev => prev ? ({...prev, grounds: prev.grounds.map(g => g.code === code ? {...g, ...(typeof updates === 'string' ? {pitch: updates} : updates)} : g)}) : null)}
                        handleUpdateScoreLimits={(groundCode, format, field, value, inning) => {
                            setGameData(prev => {
                                if (!prev) return null;
                                const numValue = parseInt(value, 10);
                                const newLimits: any = JSON.parse(JSON.stringify(prev.scoreLimits || {}));
                                if (!newLimits[groundCode]) newLimits[groundCode] = {};
                                if (!newLimits[groundCode][format]) newLimits[groundCode][format] = {};
                                if (!newLimits[groundCode][format][inning]) newLimits[groundCode][format][inning] = {};
                                if (value === '' || isNaN(numValue) || numValue <= 0) delete newLimits[groundCode][format][inning][field];
                                else newLimits[groundCode][format][inning][field] = numValue;
                                return { ...prev, scoreLimits: newLimits };
                            });
                        }}
                    />
                </div>
            </div>
        ) : null;
        default: return <div>Error</div>;
    }
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full h-screen md:max-w-md md:max-h-[932px] md:h-[90vh] bg-gray-50 dark:bg-[#050808] md:border-4 md:border-gray-300 md:dark:border-gray-700 md:rounded-[60px] md:shadow-2xl md:shadow-black/50 overflow-hidden relative text-gray-900 dark:text-gray-200 flex flex-col">
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
          {!showSplash && showCover && <GameCover onStart={() => setShowCover(false)} isInstallable={isInstallable} onInstall={handleInstallClick} />}
        </AnimatePresence>
        {!showSplash && !showCover && renderContent()}
        {feedbackMessage && (
            <div className={`absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg z-50 shadow-lg text-white font-semibold ${feedbackMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {feedbackMessage.text}
            </div>
        )}
        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
};