import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Team, GameData, PlayerRole, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';

interface AuctionRoomProps {
    gameData: GameData;
    onAuctionComplete: (updatedTeams: Team[]) => void;
}

const STARTING_PURSE = 100.0;
const MAX_FOREIGN_LIMIT = 3; 
const MAX_EMERGING_LIMIT = 3;
const MAX_SQUAD_SIZE = 16;
const DOMESTIC_LIMIT = 10;

// Targeted Balanced Squad Ratios
const TARGET_OPENERS = 4;
const TARGET_BATTERS = 7; 
const TARGET_KEEPERS = 1;
const TARGET_ALL_ROUNDERS = 3;
const TARGET_SPINNERS = 3;
const TARGET_FAST = 5;

// Helper to shuffle array
const shuffle = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const AuctionRoom: React.FC<AuctionRoomProps> = ({ gameData, onAuctionComplete }) => {
    const mainTeamIds = useMemo(() => 
        gameData.allTeamsData.filter(td => !td.isYouthTeam).map(td => td.id), 
    [gameData.allTeamsData]);

    const [teams, setTeams] = useState<Team[]>(() => 
        gameData.teams.map(t => ({ ...t, squad: t.squad || [], purse: t.purse || STARTING_PURSE }))
    );

    const [activeOverlay, setActiveOverlay] = useState<'none' | 'franchises' | 'pool'>('none');

    const sortedPool = useMemo(() => {
        const retainedPlayerIds = new Set(teams.flatMap(t => t.squad.map(p => p.id)));
        const pool = gameData.allPlayers
            .filter(pl => !retainedPlayerIds.has(pl.id))
            .map(p => {
                // Use a deterministic "random" value based on player ID for stability
                const seed = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const pseudoRandom = (seed % 20 - 10);
                return { ...p, _skill: Math.max(p.battingSkill, p.secondarySkill) + pseudoRandom };
            });
        
        return pool.sort((a, b) => b._skill - a._skill);
    }, [gameData.allPlayers, teams]);

    const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
    const [currentBid, setCurrentBid] = useState(0);
    const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
    const [isAuctioning, setIsAuctioning] = useState(false);
    const [biddingLog, setBiddingLog] = useState<{teamName: string, bid: number, time: string}[]>([]);
    const [auctionFinished, setAuctionFinished] = useState(false);

    const currentPlayer = sortedPool[currentPlayerIdx] || null;
    const userTeam = teams.find(t => t.id === gameData.userTeamId);

    const getBasePrice = (player: Player) => {
        if (player.basePrice !== undefined) {
            return player.basePrice / 100;
        }
        const attr = Math.max(player.battingSkill, player.secondarySkill);
        if (attr > 70) return 2.0;
        if (attr >= 61) return 1.0; 
        if (attr >= 51) return 0.6;
        return 0.25;
    };

    const getBidIncrement = (price: number) => {
        if (price >= 10.0) return 1.0;
        if (price >= 5.0) return 0.5;
        if (price >= 2.0) return 0.2;
        return 0.1;
    };

    const startNextPlayer = useCallback(() => {
        if (auctionFinished) return;
        if (currentPlayerIdx >= sortedPool.length) {
            setAuctionFinished(true);
            return;
        }
        const player = sortedPool[currentPlayerIdx];
        if (!player) {
            setCurrentPlayerIdx(prev => prev + 1);
            return;
        }
        const bp = getBasePrice(player);
        setCurrentBid(bp);
        setHighestBidderId(null);
        setIsAuctioning(true);
        setBiddingLog([]);
    }, [currentPlayerIdx, sortedPool, auctionFinished]);

    const handleUserBid = (multiplier: number = 1) => {
        if (!userTeam || !isAuctioning || !currentPlayer) return;
        
        if (currentPlayer.isForeign && userTeam.squad.filter(p => p.isForeign).length >= MAX_FOREIGN_LIMIT) return;
        if (currentPlayer.isEmerging && userTeam.squad.filter(p => p.isEmerging).length >= MAX_EMERGING_LIMIT) return;

        const increment = getBidIncrement(currentBid) * multiplier;
        const nextBid = Number((currentBid + increment).toFixed(2));
        if (userTeam.purse < nextBid) return;
        
        setCurrentBid(nextBid);
        setHighestBidderId(userTeam.id);
        setBiddingLog(prev => [{
            teamName: userTeam.name, 
            bid: nextBid,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }, ...prev].slice(0, 10));
    };

    const skipPlayer = () => {
        if (!currentPlayer || !isAuctioning) return;
        setIsAuctioning(false);

        const eligibleTeams = teams.filter(t => 
            mainTeamIds.includes(t.id) &&
            t.id !== gameData.userTeamId &&
            t.purse >= (getBasePrice(currentPlayer) + 0.2) &&
            t.squad.length < MAX_SQUAD_SIZE &&
            (!currentPlayer.isForeign || t.squad.filter(p => p.isForeign).length < MAX_FOREIGN_LIMIT) &&
            (!currentPlayer.isEmerging || t.squad.filter(p => p.isEmerging).length < MAX_EMERGING_LIMIT) &&
            (!(!currentPlayer.isForeign && !currentPlayer.isEmerging) || t.squad.filter(p => !p.isForeign && !p.isEmerging).length < DOMESTIC_LIMIT)
        );

        if (eligibleTeams.length > 0) {
            const winner = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];
            const finalPrice = Number((getBasePrice(currentPlayer) + (Math.random() * 0.4)).toFixed(2));
            setTeams(prev => prev.map(t => {
                if (t.id === winner.id) {
                    return { ...t, purse: Number((t.purse - finalPrice).toFixed(2)), squad: [...t.squad, currentPlayer] };
                }
                return t;
            }));
        }
        
        setCurrentPlayerIdx(prev => prev + 1);
    };

    const autoAuctionRemaining = () => {
        setIsAuctioning(false);
        setAuctionFinished(true);
    };

    const sellPlayer = useCallback(() => {
        const winner = teams.find(t => t.id === highestBidderId);
        if (winner && currentPlayer) {
            setTeams(prev => prev.map(t => {
                if (t.id === winner.id) {
                    return {
                        ...t,
                        purse: Number((t.purse - currentBid).toFixed(2)),
                        squad: [...t.squad, { ...currentPlayer, auctionPrice: currentBid }]
                    };
                }
                return t;
            }));
        }
        setIsAuctioning(false);
        setCurrentPlayerIdx(prev => prev + 1);
    }, [teams, highestBidderId, currentPlayer, currentBid]);

    const unsoldPlayer = useCallback(() => {
        setIsAuctioning(false);
        setCurrentPlayerIdx(prev => prev + 1);
    }, []);

    useEffect(() => {
        if (!isAuctioning || !currentPlayer || auctionFinished) return;

        const timer = setTimeout(() => {
            if (!isAuctioning) return;
            const increment = getBidIncrement(currentBid);
            const eligibleTeams = teams.filter(t => 
                mainTeamIds.includes(t.id) &&
                t.id !== highestBidderId && 
                t.purse >= (currentBid + increment) &&
                t.squad.length < MAX_SQUAD_SIZE &&
                (!currentPlayer.isForeign || t.squad.filter(p => p.isForeign).length < MAX_FOREIGN_LIMIT) &&
                (!currentPlayer.isEmerging || t.squad.filter(p => p.isEmerging).length < MAX_EMERGING_LIMIT) &&
                (currentPlayer.isForeign || currentPlayer.isEmerging || t.squad.filter(p => !p.isForeign && !p.isEmerging).length < DOMESTIC_LIMIT)
            );

            if (eligibleTeams.length > 0) {
                const rating = Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill);
                
                const biddingTeam = eligibleTeams.find(t => {
                    if (t.id === gameData.userTeamId) return false;
                    const baseValuation = Math.pow(rating / 50, 3.5) * 1.2;
                    const squad = t.squad;
                    const roleCount = squad.filter(p => p.role === currentPlayer.role).length;
                    
                    let targetCount = 3;
                    if (currentPlayer.role === PlayerRole.BATSMAN) targetCount = TARGET_BATTERS;
                    if (currentPlayer.role === PlayerRole.WICKET_KEEPER) targetCount = TARGET_KEEPERS;
                    if (currentPlayer.role === PlayerRole.ALL_ROUNDER) targetCount = TARGET_ALL_ROUNDERS;
                    if (currentPlayer.role === PlayerRole.SPIN_BOWLER) targetCount = TARGET_SPINNERS;
                    if (currentPlayer.role === PlayerRole.FAST_BOWLER) targetCount = TARGET_FAST;

                    let needFactor = 1.0;
                    if (roleCount >= targetCount) needFactor = 0.4;
                    else if (roleCount < targetCount / 2) needFactor = 1.6;

                    if (currentPlayer.isForeign) {
                        const foreignCount = squad.filter(p => p.isForeign).length;
                        if (foreignCount >= MAX_FOREIGN_LIMIT - 1) needFactor *= 0.2;
                    }

                    const personalityJitter = 0.7 + (Math.random() * 0.6);
                    const finalValuation = baseValuation * needFactor * personalityJitter;

                    return (currentBid + increment) <= finalValuation;
                });

                if (biddingTeam) {
                    const nextBid = Number((currentBid + increment).toFixed(2));
                    setCurrentBid(nextBid);
                    setHighestBidderId(biddingTeam.id);
                    setBiddingLog(prev => [{
                        teamName: biddingTeam.name, 
                        bid: nextBid,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    }, ...prev].slice(0, 10));
                } else if (highestBidderId) {
                    sellPlayer();
                } else {
                    unsoldPlayer();
                }
            } else if (highestBidderId) {
                sellPlayer();
            } else {
                unsoldPlayer();
            }
        }, 1200 + Math.random() * 1000);

        return () => clearTimeout(timer);
    }, [isAuctioning, currentBid, highestBidderId, currentPlayer, gameData.userTeamId, mainTeamIds, teams, auctionFinished, sellPlayer, unsoldPlayer]);

    useEffect(() => {
        if (!isAuctioning && !auctionFinished) {
            const timer = setTimeout(() => {
                startNextPlayer();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [currentPlayerIdx, sortedPool, isAuctioning, auctionFinished, startNextPlayer]);

    const finishAuction = () => {
        const soldPlayerIds = new Set(teams.flatMap(t => t.squad.map(p => p.id)));
        const unauctioned = gameData.allPlayers.filter(p => !soldPlayerIds.has(p.id));
        const pool = shuffle([...unauctioned]);

        const finalTeams = teams.map(team => {
            const isDev = gameData.allTeamsData.find(td => td.id === team.id)?.isYouthTeam;
            const squad = [...team.squad];
            let purse = team.purse;

            const fillNeeded = (type: 'FOREIGN' | 'EMERGING' | 'DOMESTIC', count: number) => {
                let existing = 0;
                if (type === 'FOREIGN') existing = squad.filter(p => p.isForeign).length;
                if (type === 'EMERGING') existing = squad.filter(p => p.isEmerging).length;
                if (type === 'DOMESTIC') existing = squad.filter(p => !p.isForeign && !p.isEmerging).length;
                
                while (existing < count && pool.length > 0) {
                    const choices = pool.filter(p => {
                        if (type === 'FOREIGN') return p.isForeign;
                        if (type === 'EMERGING') return p.isEmerging;
                        return !p.isForeign && !p.isEmerging;
                    }).slice(0, 20);
                    
                    if (choices.length > 0) {
                        choices.sort((a, b) => Math.max(b.battingSkill, b.secondarySkill) - Math.max(a.battingSkill, a.secondarySkill));
                        const p = choices[0];
                        const poolIdx = pool.findIndex(pl => pl.id === p.id);
                        pool.splice(poolIdx, 1);
                        squad.push({ ...p, auctionPrice: 0.2 });
                        existing++;
                        if (!isDev) purse = Math.max(0, purse - 0.2);
                    } else break;
                }
            };

            fillNeeded('FOREIGN', MAX_FOREIGN_LIMIT);
            fillNeeded('EMERGING', MAX_EMERGING_LIMIT);
            fillNeeded('DOMESTIC', DOMESTIC_LIMIT);

            return { ...team, squad, purse };
        });

        onAuctionComplete(finalTeams);
    };

    if (auctionFinished) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#050808] p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, 0],
                            opacity: [0.05, 0.1, 0.05]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.15)_0%,transparent_70%)]"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] opacity-50" />
                </div>
                
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 40 }} 
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 15, stiffness: 100 }}
                    className="relative z-10 max-w-2xl"
                >
                    <motion.div 
                        initial={{ rotate: -10, scale: 0.5 }}
                        animate={{ rotate: 3, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-40 h-40 bg-teal-500 rounded-[48px] flex items-center justify-center mx-auto mb-12 shadow-[0_30px_80px_rgba(20,184,166,0.4)] border-4 border-white/20"
                    >
                        <Icons.Check className="text-black w-20 h-20" strokeWidth={3} />
                    </motion.div>
                    
                    <h2 className="text-7xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-8 leading-[0.85]">
                        AUCTION<br/>
                        <span className="text-teal-500 font-light not-italic">COMPLETE</span>
                    </h2>
                    
                    <p className="text-gray-400 font-mono text-[11px] uppercase tracking-[0.6em] mb-20 bg-white/[0.03] py-4 px-10 rounded-full border border-white/5 inline-block backdrop-blur-xl">
                        ALL_ROSTERS_FINALIZED // SEASON_26_READY
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                        <motion.button 
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={finishAuction}
                            className="group relative overflow-hidden bg-white text-black px-20 py-6 rounded-[28px] font-black uppercase italic tracking-[0.2em] text-lg transition-all shadow-[0_40px_80px_rgba(0,0,0,0.5)] hover:bg-teal-500 hover:text-white"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative flex items-center gap-4">
                                ENTER_CAREER_HUB
                                <Icons.ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#050808] relative overflow-hidden font-sans text-[#E4E3E0]">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            {/* Header */}
            <div className="relative z-10 px-8 py-8 border-b border-white/5 flex items-center justify-between backdrop-blur-xl bg-[#050808]/40">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(20,184,166,0.3)] rotate-3">
                        <Icons.Gavel className="text-black w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">DRAFT_ROOM</h1>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            <p className="text-[9px] font-mono font-black text-teal-500 uppercase tracking-[0.3em]">LIVE_BIDDING_ACTIVE // v2.6</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-mono font-black text-white/30 uppercase tracking-[0.3em] mb-1">YOUR_PURSE</p>
                        <p className="text-3xl font-black italic text-teal-500 tracking-tighter leading-none">
                            ${userTeam?.purse.toFixed(2)}<span className="text-sm ml-1">Cr</span>
                        </p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveOverlay('franchises')}
                        className="w-14 h-14 bg-white/[0.03] rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-all shadow-xl"
                    >
                        <Icons.Users className="text-white w-6 h-6" />
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10">
                {/* Player Card Section */}
                <div className="flex-1 p-8 lg:p-12 flex flex-col items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {currentPlayer && (
                            <motion.div 
                                key={currentPlayer.id}
                                initial={{ x: 100, opacity: 0, scale: 0.95 }}
                                animate={{ x: 0, opacity: 1, scale: 1 }}
                                exit={{ x: -100, opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                className="w-full max-w-xl"
                            >
                                <div className="relative bg-white/[0.03] border border-white/10 rounded-[48px] p-12 backdrop-blur-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                                    {/* Card Background Decor */}
                                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                                        <Icons.CricketBall className="w-64 h-64 rotate-12" />
                                    </div>
                                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full" />

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="relative mb-10">
                                            <div className="absolute inset-0 bg-teal-500/20 blur-[60px] rounded-full" />
                                            <div className="relative">
                                                <PlayerAvatar player={currentPlayer} size="xl" className="w-56 h-56 border-4 border-white/10 shadow-2xl rounded-[40px]" />
                                                <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl border border-white/10 ${getRoleColor(currentPlayer.role)}`}>
                                                    {getRoleFullName(currentPlayer.role)}
                                                </div>
                                            </div>
                                        </div>

                                        <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white text-center mb-4 leading-none">
                                            {currentPlayer.name}
                                        </h2>
                                        
                                        <div className="flex items-center gap-8 mb-12">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Nationality</span>
                                                <span className="text-sm font-black text-white">{currentPlayer.nationality}</span>
                                            </div>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Rating</span>
                                                <span className="text-sm font-black text-teal-500">{Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill)}</span>
                                            </div>
                                            <div className="w-px h-8 bg-white/10" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Style</span>
                                                <span className="text-sm font-black text-white">{currentPlayer.style}</span>
                                            </div>
                                        </div>

                                        {/* Current Bid Display */}
                                        <div className="w-full bg-black/40 rounded-[32px] p-8 border border-white/5 text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 mb-4 relative z-10">CURRENT_BID</p>
                                            <div className="flex items-center justify-center gap-6 relative z-10">
                                                <span className="text-6xl font-black italic text-white tracking-tighter leading-none">${currentBid.toFixed(2)}<span className="text-2xl ml-1">Cr</span></span>
                                                {highestBidderId === gameData.userTeamId && (
                                                    <motion.div 
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        className="bg-teal-500 text-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(20,184,166,0.4)]"
                                                    >
                                                        LEADING
                                                    </motion.div>
                                                )}
                                            </div>
                                            {highestBidderId && (
                                                <motion.p 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-xs font-black text-teal-500 mt-4 uppercase tracking-[0.2em]"
                                                >
                                                    {teams.find(t => t.id === highestBidderId)?.name}
                                                </motion.p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bidding Controls */}
                    <div className="mt-16 w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUserBid(1)}
                            disabled={highestBidderId === gameData.userTeamId || (userTeam?.purse || 0) < (currentBid + getBidIncrement(currentBid))}
                            className="bg-teal-500 disabled:bg-white/5 disabled:text-white/10 text-black py-6 rounded-2xl font-black uppercase italic tracking-[0.2em] text-sm transition-all shadow-[0_20px_40px_rgba(20,184,166,0.2)] disabled:shadow-none"
                        >
                            PLACE_BID (+${getBidIncrement(currentBid).toFixed(1)}Cr)
                        </motion.button>
                        <div className="grid grid-cols-2 gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={skipPlayer}
                                className="bg-white/[0.03] hover:bg-white/[0.08] text-white py-6 rounded-2xl font-black uppercase italic tracking-[0.2em] text-[11px] border border-white/10 transition-all shadow-xl"
                            >
                                PASS_PLAYER
                            </motion.button>
                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={autoAuctionRemaining}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 py-6 rounded-2xl font-black uppercase italic tracking-[0.2em] text-[11px] border border-red-500/20 transition-all shadow-xl"
                            >
                                AUTO_DRAFT
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Log & Info */}
                <div className="w-full lg:w-[400px] bg-[#050808]/40 backdrop-blur-2xl border-l border-white/5 p-10 flex flex-col">
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-3">
                                <Icons.Activity size={16} className="text-teal-500" />
                                BIDDING_LOG
                            </h3>
                            <div className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-mono font-black text-white/40 uppercase tracking-widest">
                                LIVE_FEED
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                            <AnimatePresence initial={false}>
                                {biddingLog.map((log, i) => (
                                    <motion.div 
                                        key={log.time + i}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        className="flex items-center justify-between p-5 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.06] transition-colors group"
                                    >
                                        <div>
                                            <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-teal-400 transition-colors">{log.teamName}</p>
                                            <p className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mt-1">{log.time}</p>
                                        </div>
                                        <div className="text-xl font-black italic text-teal-500 tracking-tighter">
                                            ${log.bid.toFixed(2)}<span className="text-xs ml-0.5">Cr</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {biddingLog.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center py-20">
                                    <Icons.Gavel size={64} className="mb-6" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.4em]">WAITING_FOR_BIDS</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 pt-10 border-t border-white/5 space-y-6">
                        <div className="flex justify-between items-center text-[10px] font-mono font-black uppercase tracking-[0.3em]">
                            <span className="text-white/20">POOL_REMAINING</span>
                            <span className="text-teal-500">{sortedPool.length - currentPlayerIdx} PLAYERS</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(currentPlayerIdx / sortedPool.length) * 100}%` }}
                                className="h-full bg-teal-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Roster Overlay */}
            <AnimatePresence>
                {activeOverlay === 'franchises' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-[#050808]/95 backdrop-blur-2xl p-10 lg:p-20 overflow-y-auto scrollbar-hide"
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="flex justify-between items-center mb-20">
                                <div className="space-y-2">
                                    <div className="text-teal-500 text-[10px] font-black uppercase tracking-[0.5em]">FRANCHISE_DATABASE // v2.6</div>
                                    <h2 className="text-6xl font-black italic uppercase tracking-tighter text-white">SQUAD_ROSTERS</h2>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setActiveOverlay('none')} 
                                    className="w-16 h-16 bg-white/10 rounded-[20px] text-white flex items-center justify-center hover:bg-teal-500 hover:text-black transition-all shadow-2xl"
                                >
                                    <Icons.X size={32} />
                                </motion.button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {teams.map(team => (
                                    <div key={team.id} className={`bg-white/[0.03] rounded-[40px] p-8 border backdrop-blur-xl transition-all duration-500 ${team.id === gameData.userTeamId ? 'border-teal-500/40 shadow-[0_20px_40px_rgba(20,184,166,0.1)]' : 'border-white/10'}`}>
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-teal-500 transition-colors">{team.name}</h3>
                                            <div className="text-right">
                                                <p className="text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mb-1">PURSE</p>
                                                <p className="text-lg font-black text-teal-500 italic">${team.purse.toFixed(2)}Cr</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {team.squad.map((p, i) => (
                                                <div key={p.id + i} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${getRoleColor(p.role)}`}>{p.role.substring(0, 3)}</span>
                                                        <span className="text-sm font-black text-white/80">{p.name}</span>
                                                    </div>
                                                    <span className="text-[11px] font-black text-teal-500 italic">${p.auctionPrice?.toFixed(2)}Cr</span>
                                                </div>
                                            ))}
                                            {team.squad.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-12 opacity-10 text-center">
                                                    <Icons.Users size={40} className="mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">EMPTY_ROSTER</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuctionRoom;