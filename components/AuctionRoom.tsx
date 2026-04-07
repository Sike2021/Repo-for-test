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
    const [directSigningPhase, setDirectSigningPhase] = useState(true);
    const [directSignedPlayers, setDirectSignedPlayers] = useState<{foreign?: Player, national?: Player, emerging?: Player}>({});

    const currentPlayer = sortedPool[currentPlayerIdx] || null;
    const userTeam = teams.find(t => t.id === gameData.userTeamId);

    const handleDirectSign = (player: Player, category: 'foreign' | 'national' | 'emerging') => {
        if (!userTeam) return;
        const cost = getBasePrice(player) * 2;
        if (userTeam.purse < cost) return;

        setTeams(prev => prev.map(t => {
            if (t.id === userTeam.id) {
                return {
                    ...t,
                    squad: [...t.squad, { ...player, auctionPrice: cost }],
                    purse: t.purse - cost
                };
            }
            return t;
        }));

        setDirectSignedPlayers(prev => ({ ...prev, [category]: player }));
    };

    const startAuction = () => {
        setDirectSigningPhase(false);
    };

    // --- Direct Signing Logic ---


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
                    } else if (currentPlayer.isEmerging) {
                        // Emerging players lower priority initially
                        needFactor *= 0.8;
                    } else {
                        // National players (Local/Pakistan) priority
                        needFactor *= 1.5;
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
                                <Icons.ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                            </span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#050808] relative overflow-hidden font-sans text-[#E4E3E0]">
            {directSigningPhase && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-[200] bg-[#050808] flex flex-col p-8 overflow-y-auto"
                >
                    <div className="max-w-6xl mx-auto w-full">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter">Direct Signing</h2>
                                <p className="text-teal-500 font-bold tracking-widest text-sm uppercase mt-2">Pre-Auction Exclusive // 2X Value</p>
                            </div>
                            <button 
                                onClick={startAuction}
                                className="bg-teal-500 text-black px-12 py-6 rounded-3xl font-black italic uppercase tracking-tighter text-3xl hover:scale-105 transition-all shadow-[0_0_50px_rgba(20,184,166,0.4)]"
                            >
                                Start Auction
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {/* Foreign */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-white/40 uppercase tracking-widest border-b border-white/10 pb-3">Foreign Star</h3>
                                {directSignedPlayers.foreign ? (
                                    <div className="bg-teal-500/10 border border-teal-500/50 p-6 rounded-3xl flex items-center gap-6">
                                        <PlayerAvatar player={directSignedPlayers.foreign} size="lg" />
                                        <div>
                                            <p className="text-white font-black uppercase italic text-xl">{directSignedPlayers.foreign.name}</p>
                                            <p className="text-teal-500 text-xs font-bold">SIGNED @ {(getBasePrice(directSignedPlayers.foreign) * 2).toFixed(2)} Cr</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {sortedPool.filter(p => p.isForeign).slice(0, 10).map(p => (
                                            <button 
                                                key={p.id}
                                                onClick={() => handleDirectSign(p, 'foreign')}
                                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <PlayerAvatar player={p} size="sm" />
                                                    <div className="text-left">
                                                        <p className="text-white font-bold text-sm uppercase">{p.name}</p>
                                                        <p className="text-white/40 text-[10px] font-bold uppercase">{p.role}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-teal-500 font-black text-sm">{(getBasePrice(p) * 2).toFixed(2)}</p>
                                                    <p className="text-[8px] text-white/20 font-bold uppercase">SIGN_NOW</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* National */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-white/40 uppercase tracking-widest border-b border-white/10 pb-3">National Hero</h3>
                                {directSignedPlayers.national ? (
                                    <div className="bg-teal-500/10 border border-teal-500/50 p-6 rounded-3xl flex items-center gap-6">
                                        <PlayerAvatar player={directSignedPlayers.national} size="lg" />
                                        <div>
                                            <p className="text-white font-black uppercase italic text-xl">{directSignedPlayers.national.name}</p>
                                            <p className="text-teal-500 text-xs font-bold">SIGNED @ {(getBasePrice(directSignedPlayers.national) * 2).toFixed(2)} Cr</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {sortedPool.filter(p => !p.isForeign && !p.isEmerging && p.nationality === 'Pakistan').slice(0, 10).map(p => (
                                            <button 
                                                key={p.id}
                                                onClick={() => handleDirectSign(p, 'national')}
                                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <PlayerAvatar player={p} size="sm" />
                                                    <div className="text-left">
                                                        <p className="text-white font-bold text-sm uppercase">{p.name}</p>
                                                        <p className="text-white/40 text-[10px] font-bold uppercase">{p.role}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-teal-500 font-black text-sm">{(getBasePrice(p) * 2).toFixed(2)}</p>
                                                    <p className="text-[8px] text-white/20 font-bold uppercase">SIGN_NOW</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Emerging */}
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-white/40 uppercase tracking-widest border-b border-white/10 pb-3">Emerging Talent</h3>
                                {directSignedPlayers.emerging ? (
                                    <div className="bg-teal-500/10 border border-teal-500/50 p-6 rounded-3xl flex items-center gap-6">
                                        <PlayerAvatar player={directSignedPlayers.emerging} size="lg" />
                                        <div>
                                            <p className="text-white font-black uppercase italic text-xl">{directSignedPlayers.emerging.name}</p>
                                            <p className="text-teal-500 text-xs font-bold">SIGNED @ {(getBasePrice(directSignedPlayers.emerging) * 2).toFixed(2)} Cr</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {sortedPool.filter(p => p.isEmerging).slice(0, 10).map(p => (
                                            <button 
                                                key={p.id}
                                                onClick={() => handleDirectSign(p, 'emerging')}
                                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <PlayerAvatar player={p} size="sm" />
                                                    <div className="text-left">
                                                        <p className="text-white font-bold text-sm uppercase">{p.name}</p>
                                                        <p className="text-white/40 text-[10px] font-bold uppercase">{p.role}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-teal-500 font-black text-sm">{(getBasePrice(p) * 2).toFixed(2)}</p>
                                                    <p className="text-[8px] text-white/20 font-bold uppercase">SIGN_NOW</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            {/* Header */}
            <div className="relative z-10 px-3 md:px-8 py-2 md:py-8 border-b border-white/5 flex items-center justify-between backdrop-blur-xl bg-[#050808]/40">
                <div className="flex items-center gap-2 md:gap-6">
                    <div className="w-8 h-8 md:w-14 md:h-14 bg-teal-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(20,184,166,0.3)] rotate-3">
                        <Icons.Gavel className="text-black w-3.5 h-3.5 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-xs md:text-2xl font-black italic uppercase tracking-tighter text-white leading-none">DRAFT_ROOM</h1>
                        <div className="flex items-center gap-1 md:gap-2 mt-0.5">
                            <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-teal-500 animate-pulse" />
                            <p className="text-[4px] md:text-[9px] font-mono font-black text-teal-500 uppercase tracking-[0.3em]">LIVE_BIDDING // v2.6</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2 md:gap-8">
                    <div className="text-right">
                        <p className="text-[5px] md:text-[9px] font-mono font-black text-white/30 uppercase tracking-[0.3em] mb-0 md:mb-1">YOUR_PURSE</p>
                        <p className="text-sm md:text-3xl font-black italic text-teal-500 tracking-tighter leading-none">
                            ${userTeam?.purse.toFixed(2)}<span className="text-[6px] md:text-sm ml-0.5 md:ml-1">Cr</span>
                        </p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveOverlay('franchises')}
                        className="w-7 h-7 md:w-14 md:h-14 bg-white/[0.03] rounded-lg md:rounded-2xl border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-all shadow-xl"
                    >
                        <Icons.Users className="text-white w-3.5 h-3.5 md:w-6 md:h-6" />
                    </motion.button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row relative z-10 scrollbar-hide">
                {/* Player Card Section */}
                <div className="flex-1 p-3 md:p-8 lg:p-12 flex flex-col items-center justify-start lg:justify-center relative">
                    <AnimatePresence mode="wait">
                        {currentPlayer && (
                            <motion.div 
                                key={currentPlayer.id}
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                className="w-full max-w-md"
                            >
                                <div className="relative bg-white/[0.03] border border-white/10 rounded-[24px] md:rounded-[40px] p-4 md:p-10 lg:p-12 backdrop-blur-3xl overflow-hidden shadow-2xl">
                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="relative mb-2 md:mb-6">
                                            <div className="absolute inset-0 bg-teal-500/20 blur-[20px] md:blur-[40px] rounded-full" />
                                            <div className="relative">
                                                <PlayerAvatar player={currentPlayer} size="md" className="w-16 h-16 md:w-40 md:h-40 border-2 md:border-4 border-white/10 shadow-2xl rounded-full" />
                                                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 md:px-4 py-0.5 md:py-1 rounded-md md:rounded-xl font-black text-[4px] md:text-[9px] uppercase tracking-widest shadow-xl border border-white/10 ${getRoleColor(currentPlayer.role)}`}>
                                                    {getRoleFullName(currentPlayer.role)}
                                                </div>
                                            </div>
                                        </div>

                                        <h2 className="text-base md:text-3xl font-black italic uppercase tracking-tighter text-white text-center mb-0.5 md:mb-2 leading-none">
                                            {currentPlayer.name}
                                        </h2>
                                        
                                        <div className="flex items-center gap-1.5 md:gap-4 mb-2 md:mb-8">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[4px] md:text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5 md:mb-1">Rating</span>
                                                <span className="text-[7px] md:text-xs font-black text-teal-500">{Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill)}</span>
                                            </div>
                                            <div className="w-px h-1.5 md:h-4 bg-white/10" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[4px] md:text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5 md:mb-1">Style</span>
                                                <span className="text-[7px] md:text-xs font-black text-white">{currentPlayer.style}</span>
                                            </div>
                                        </div>

                                        {/* Current Bid Display */}
                                        <div className="w-full bg-black/40 rounded-[14px] md:rounded-[24px] p-2.5 md:p-6 border border-white/5 text-center relative overflow-hidden">
                                            <p className="text-[5px] md:text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-0.5 md:mb-2">CURRENT_BID</p>
                                            <div className="flex items-center justify-center gap-1.5 md:gap-4">
                                                <span className="text-lg md:text-4xl font-black italic text-white tracking-tighter leading-none">${currentBid.toFixed(2)}<span className="text-[8px] md:text-xl ml-0.5 md:ml-1">Cr</span></span>
                                                {highestBidderId === gameData.userTeamId && (
                                                    <div className="bg-teal-500 text-black px-1 md:px-3 py-0.5 md:py-1 rounded-sm md:rounded-lg text-[4px] md:text-[8px] font-black uppercase tracking-widest">
                                                        LEADING
                                                    </div>
                                                )}
                                            </div>
                                            {highestBidderId && (
                                                <p className="text-[6px] md:text-[10px] font-black text-teal-500 mt-0.5 md:mt-2 uppercase tracking-widest">
                                                    {teams.find(t => t.id === highestBidderId)?.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bidding Controls */}
                    <div className="mt-2 md:mt-6 w-full max-w-md grid grid-cols-1 gap-1.5 md:gap-3 px-1">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUserBid(1)}
                            disabled={highestBidderId === gameData.userTeamId || (userTeam?.purse || 0) < (currentBid + getBidIncrement(currentBid))}
                            className="bg-teal-500 disabled:bg-white/5 disabled:text-white/10 text-black py-2.5 md:py-5 rounded-lg md:rounded-2xl font-black uppercase italic tracking-widest text-[7px] md:text-xs transition-all shadow-xl"
                        >
                            {highestBidderId === gameData.userTeamId ? 'HIGHEST BIDDER' : `PLACE BID (+${getBidIncrement(currentBid).toFixed(1)}Cr)`}
                        </motion.button>
                        <div className="grid grid-cols-2 gap-1.5 md:gap-3">
                            <button 
                                onClick={skipPlayer}
                                className="bg-white/5 text-white py-1.5 md:py-4 rounded-lg md:rounded-2xl font-black uppercase italic tracking-widest text-[6px] md:text-[10px] border border-white/10"
                            >
                                PASS
                            </button>
                            <button 
                                onClick={autoAuctionRemaining}
                                className="bg-red-500/10 text-red-500 py-1.5 md:py-4 rounded-lg md:rounded-2xl font-black uppercase italic tracking-widest text-[6px] md:text-[10px] border border-red-500/20"
                            >
                                AUTO
                            </button>
                        </div>
                    </div>
                </div>

                {/* Log Section - Compact for Mobile */}
                <div className="w-full lg:w-[400px] bg-[#050808]/40 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-white/5 p-2 md:p-6 flex flex-col max-h-[100px] md:max-h-[300px] lg:max-h-none">
                    <div className="flex items-center justify-between mb-1 md:mb-4">
                        <h3 className="text-[5px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-1 md:gap-2">
                            <Icons.Activity className="w-1.5 h-1.5 md:w-3.5 md:h-3.5 text-teal-500" />
                            BID_LOG
                        </h3>
                        <span className="text-[4px] md:text-[8px] font-mono font-black text-teal-500 uppercase tracking-widest">POOL: {sortedPool.length - currentPlayerIdx}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-0.5 md:space-y-2 pr-1 md:pr-2 scrollbar-hide">
                        {biddingLog.map((log, i) => (
                            <div key={log.time + i} className="flex items-center justify-between p-0.5 md:p-3 bg-white/[0.03] rounded-md md:rounded-xl border border-white/5">
                                <span className="text-[6px] md:text-[10px] font-black text-white uppercase truncate max-w-[60px] md:max-w-[120px]">{log.teamName}</span>
                                <span className="text-[8px] md:text-sm font-black italic text-teal-500">${log.bid.toFixed(2)}Cr</span>
                            </div>
                        ))}
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
                        className="absolute inset-0 z-50 bg-[#050808]/95 backdrop-blur-2xl p-4 md:p-10 lg:p-20 overflow-y-auto scrollbar-hide"
                    >
                        <div className="max-w-7xl mx-auto">
                            <div className="flex justify-between items-center mb-10 md:mb-20">
                                <div className="space-y-1 md:space-y-2">
                                    <div className="text-teal-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em]">FRANCHISE_DATABASE // v2.6</div>
                                    <h2 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter text-white">SQUAD_ROSTERS</h2>
                                </div>
                                <motion.button 
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setActiveOverlay('none')} 
                                    className="w-10 h-10 md:w-16 md:h-16 bg-white/10 rounded-xl md:rounded-[20px] text-white flex items-center justify-center hover:bg-teal-500 hover:text-black transition-all shadow-2xl"
                                >
                                    <Icons.X className="w-5 h-5 md:w-8 md:h-8" />
                                </motion.button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-10">
                                {teams.map(team => (
                                    <div key={team.id} className={`bg-white/[0.03] rounded-[24px] md:rounded-[40px] p-5 md:p-8 border backdrop-blur-xl transition-all duration-500 ${team.id === gameData.userTeamId ? 'border-teal-500/40 shadow-[0_20px_40px_rgba(20,184,166,0.1)]' : 'border-white/10'}`}>
                                        <div className="flex items-center justify-between mb-4 md:mb-8">
                                            <h3 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter text-white group-hover:text-teal-500 transition-colors">{team.name}</h3>
                                            <div className="text-right">
                                                <p className="text-[7px] md:text-[9px] font-mono font-black text-white/20 uppercase tracking-[0.2em] mb-0.5 md:mb-1">PURSE</p>
                                                <p className="text-sm md:text-lg font-black text-teal-500 italic">${team.purse.toFixed(2)}Cr</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:space-y-3">
                                            {team.squad.map((p, i) => (
                                                <div key={p.id + i} className="flex items-center justify-between p-2.5 md:p-4 bg-black/40 rounded-xl md:rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                                    <div className="flex items-center gap-2 md:gap-4">
                                                        <span className={`text-[7px] md:text-[9px] font-black uppercase px-1.5 md:px-2 py-0.5 rounded-md ${getRoleColor(p.role)}`}>{p.role.substring(0, 3)}</span>
                                                        <span className="text-[11px] md:text-sm font-black text-white/80 truncate max-w-[100px] md:max-w-none">{p.name}</span>
                                                    </div>
                                                    <span className="text-[9px] md:text-[11px] font-black text-teal-500 italic">${p.auctionPrice?.toFixed(2)}Cr</span>
                                                </div>
                                            ))}
                                            {team.squad.length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-8 md:py-12 opacity-10 text-center">
                                                    <Icons.Users className="w-6 h-6 md:w-10 md:h-10 mb-2 md:mb-4" />
                                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">EMPTY_ROSTER</p>
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