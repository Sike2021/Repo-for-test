
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match, GameData, MatchResult, Strategy, LiveMatchState, Player, Ground, Message, Format, PlayerRole } from '../types';
import { useLiveMatch } from '../hooks/useLiveMatch';
import { Icons } from './Icons';
import { TV_CHANNELS, INITIAL_SPONSORSHIPS, TOURNAMENT_LOGOS } from '../data';
import { getPlayerById } from '../utils';
import { streamAssistantResponse } from '../geminiService';
import { PlayerAvatar } from './PlayerAvatar';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface LiveMatchScreenProps {
    match: Match;
    gameData: GameData;
    onMatchComplete: (result: MatchResult) => void;
    onExit: (stateToSave?: LiveMatchState) => void;
    savedState?: LiveMatchState | null;
    startMode?: 'play' | 'simulate';
}

const StrategyToggle = ({ label, value, onChange }: { label: string, value: Strategy, onChange: (s: Strategy) => void }) => (
    <div className="flex flex-col items-center bg-white/[0.03] rounded-lg p-1 flex-1 border border-white/5">
        <span className="text-[7px] text-white/40 uppercase font-black tracking-widest mb-0.5">{label}</span>
        <div className="flex bg-black/40 rounded-md p-0.5 w-full justify-center">
            {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                <button
                    key={s}
                    onClick={() => onChange(s)}
                    className={`px-0.5 py-0.5 text-[7px] uppercase font-black rounded transition-all flex-1 ${value === s 
                        ? s === 'attacking' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' : s === 'defensive' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-teal-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.3)]' 
                        : 'text-white/20 hover:text-white/40'}`}
                >
                    {s.slice(0,3)}
                </button>
            ))}
        </div>
    </div>
);

const PreMatchPanel = ({ match, gameData, onStart, onSimulate, onEditLineup }: { match: Match, gameData: GameData, onStart: () => void, onSimulate: () => void, onEditLineup: () => void }) => {
    const sponsorship = gameData.sponsorships?.[gameData.currentFormat] || INITIAL_SPONSORSHIPS[gameData.currentFormat];
    const teamA = gameData.teams.find(t => t.name === match.teamA);
    const teamB = gameData.teams.find(t => t.name === match.teamB);
    const ground = gameData.grounds.find(g => g.code === (gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround || 'KCG'));
    
    const getWeatherIcon = (w?: string) => {
        switch(w) {
            case 'Sunny': return '☀️';
            case 'Overcast': return '☁️';
            case 'Rainy': return '🌧️';
            case 'Humid': return '🌫️';
            default: return '🌤️';
        }
    };

    return (
        <div className="absolute inset-0 z-[120] bg-[#050808] flex flex-col p-2 font-sans overflow-y-auto scrollbar-hide">
            {/* Header */}
            <header className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 ${sponsorship.logoColor} p-1 bg-white/5 rounded-lg border border-white/10`} dangerouslySetInnerHTML={{__html: sponsorship.tournamentLogo || TOURNAMENT_LOGOS[0].svg}}></div>
                    <div>
                        <p className="text-[5px] font-black text-teal-500 uppercase tracking-[0.4em] mb-0.5">{gameData.currentFormat} // PRE_MATCH</p>
                        <h1 className="text-xs font-black italic uppercase tracking-tighter text-white leading-none">{sponsorship.tournamentName}</h1>
                    </div>
                </div>
                <div className="w-8 h-4 opacity-20" dangerouslySetInnerHTML={{__html: sponsorship.tvLogo || ''}}></div>
            </header>

            <div className="flex-grow flex flex-col justify-center space-y-3 py-1">
                <div className="flex items-center justify-between px-1">
                    <motion.div 
                        initial={{ x: -30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center space-y-1.5 w-1/3"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-600/20 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.1)] border border-white/10 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-teal-500/10 animate-pulse" />
                            <div className="w-7 h-7 relative z-10" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === teamA?.id)?.logo || ''}}></div>
                        </div>
                        <h2 className="text-[9px] font-black uppercase tracking-tighter italic text-center text-white leading-tight">{teamA?.name}</h2>
                        <div className="px-1 py-0.5 bg-white/5 rounded-full border border-white/10">
                            <span className="text-[5px] font-black text-white/40 uppercase tracking-widest">HOME_SIDE</span>
                        </div>
                    </motion.div>

                    <div className="flex flex-col items-center">
                        <div className="text-xl font-black italic text-white/5 tracking-tighter mb-0.5">VS</div>
                        <div className="w-px h-4 bg-gradient-to-b from-transparent via-teal-500/40 to-transparent" />
                    </div>

                    <motion.div 
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center space-y-1.5 w-1/3"
                    >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center border border-white/10 overflow-hidden relative">
                            <div className="w-7 h-7 relative z-10" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === teamB?.id)?.logo || ''}}></div>
                        </div>
                        <h2 className="text-[9px] font-black uppercase tracking-tighter italic text-center text-white leading-tight">{teamB?.name}</h2>
                        <div className="px-1 py-0.5 bg-white/5 rounded-full border border-white/10">
                            <span className="text-[5px] font-black text-white/40 uppercase tracking-widest">AWAY_SIDE</span>
                        </div>
                    </motion.div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 mx-auto w-full max-w-xs backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[5px] font-black text-white/20 uppercase tracking-[0.3em]">GROUND_TELEMETRY</span>
                        <div className="flex gap-1">
                            {[1,2,3].map(i => <div key={i} className="w-0.5 h-0.5 bg-teal-500/40 rounded-full" />)}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                            <p className="text-[5px] font-black text-white/20 uppercase tracking-widest mb-0.5">PITCH_SURFACE</p>
                            <p className="text-[8px] font-black text-teal-500 italic uppercase">{ground?.pitch}</p>
                            <p className="text-[6px] text-white/10 mt-0.5 uppercase font-bold">FAVORS: {ground?.pitch.includes('Spin') ? 'SPIN' : ground?.pitch.includes('Green') ? 'PACE' : 'BAT'}</p>
                        </div>
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                            <p className="text-[5px] font-black text-white/20 uppercase tracking-widest mb-0.5">ATMOSPHERE</p>
                            <p className="text-[8px] font-black text-white italic uppercase flex items-center gap-1">
                                <span className="text-xs">{getWeatherIcon(ground?.weather)}</span> {ground?.weather || 'CLEAR'}
                            </p>
                            <p className="text-[6px] text-white/10 mt-0.5 uppercase font-bold">{ground?.outfieldSpeed || 'MED'} OUTFIELD</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-1.5 space-y-1.5">
                <button 
                    onClick={onEditLineup}
                    className="w-full bg-white/5 border border-white/10 text-white font-black py-2 px-4 rounded-lg uppercase tracking-[0.2em] text-[7px] hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group mb-1"
                >
                    EDIT LINEUP
                    <Icons.Settings className="w-2.5 h-2.5 group-hover:rotate-90 transition-transform" />
                </button>
                <button 
                    onClick={onStart}
                    className="w-full bg-teal-500 text-black font-black py-2.5 px-4 rounded-lg uppercase tracking-[0.2em] text-[7px] hover:bg-teal-400 transition-all duration-500 shadow-[0_10px_30px_rgba(20,184,166,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                    PLAY MATCH
                    <Icons.PlayMatch className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                    onClick={onSimulate}
                    className="w-full bg-white/5 border border-white/10 text-white font-black py-2 px-4 rounded-lg uppercase tracking-[0.2em] text-[7px] hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                    SIMULATE WITH PLAY
                    <Icons.FastForward className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

const AutoArrivalNotification = ({ playerName, onOverride, secondsLeft }: { playerName: string, onOverride: () => void, secondsLeft: number }) => (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border border-teal-500/50 rounded-lg shadow-2xl p-2.5 flex items-center gap-3 animate-slide-up min-w-[240px]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center text-teal-400 animate-pulse">
            <Icons.User className="w-4 h-4" />
        </div>
        <div className="flex-grow">
            <p className="text-[8px] text-teal-400 uppercase font-black tracking-widest">Next Batter Arriving</p>
            <p className="text-white font-black text-sm leading-tight">{playerName}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-mono text-slate-400">{secondsLeft}s</span>
            <div className="text-[7px] text-gray-500 uppercase font-black">Click to skip</div>
        </div>
    </div>
);

// Broadcast Style Chat Overlay
const MatchChat = ({ gameData, onClose }: { gameData: GameData, onClose: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([{ id: '1', text: "Analyzing real-time match data... How can I assist?", sender: 'bot' }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(p => [...p, userMsg]);
        setInput('');
        setIsTyping(true);
        try {
            const botId = (Date.now()+1).toString();
            setMessages(p => [...p, { id: botId, text: '', sender: 'bot' }]);
            const stream = streamAssistantResponse(userMsg.text, messages, gameData);
            let full = '';
            for await (const chunk of stream) {
                full += chunk;
                setMessages(p => p.map(m => m.id === botId ? { ...m, text: full } : m));
            }
        } catch {
            setMessages(p => [...p, { id: Date.now().toString(), text: "Signal lost.", sender: 'bot' }]);
        } finally { setIsTyping(false); }
    };

    return (
        <div className="absolute inset-0 bg-[#050808]/95 z-[130] flex flex-col p-2.5 animate-fade-in backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1.5">
                <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-500 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                        <Icons.Bot className="relative z-10 text-white w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h3 className="font-black italic uppercase tracking-tighter text-white text-xs leading-none">MATCH_ANALYST</h3>
                        <p className="text-[5px] text-teal-500 uppercase tracking-[0.3em] font-black leading-none mt-0.5">AI_TACTICAL_ENGINE</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 bg-white/5 rounded-lg hover:bg-white/10 border border-white/10 transition-all"><Icons.X className="text-white/40 w-3.5 h-3.5" /></button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-2.5 mb-2.5 pr-1 scrollbar-hide">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-xl text-[9px] font-medium leading-relaxed ${m.sender === 'user' ? 'bg-teal-500 text-black rounded-tr-sm shadow-lg shadow-teal-500/10' : 'bg-white/[0.03] text-white/80 rounded-tl-sm border border-white/5'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-center gap-1 text-[5px] text-teal-500 font-black uppercase tracking-widest animate-pulse">
                        <div className="w-0.5 h-0.5 bg-teal-500 rounded-full" />
                        ANALYZING...
                    </div>
                )}
                <div ref={endRef} />
            </div>
            <div className="flex gap-1.5 bg-white/[0.03] p-1 rounded-lg border border-white/5 backdrop-blur-xl">
                <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && send()} 
                    placeholder="QUERY_TACTICAL_ENGINE..." 
                    className="flex-grow bg-transparent border-none rounded-lg px-2.5 py-1.5 text-[8px] text-white font-black tracking-widest focus:ring-0 focus:outline-none placeholder:text-white/10" 
                />
                <button onClick={send} className="bg-white text-black hover:bg-teal-500 hover:text-white p-1.5 rounded-lg transition-all shadow-xl flex items-center justify-center group">
                    <Icons.PlayMatch className="h-3 w-3 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
};

const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ match, gameData, onMatchComplete, onExit, savedState, startMode = 'play' }) => {
    const { state, playBall, playOver, autoSimulate, simulateInning, simulateMatch, setBattingStrategy, setBowlingStrategy, selectOpeners, selectNextBatter, selectNextBowler, startMatch, beginMatch, declareInning, stopAutoPlay, swapPlayers, requestBowlerChange } = useLiveMatch(match, gameData, onMatchComplete, savedState);
    const commentaryRef = useRef<HTMLDivElement>(null);
    const [lastBallSpeed, setLastBallSpeed] = useState<string>("-");
    
    // Match Centre State
    const [showMatchCentre, setShowMatchCentre] = useState(false);
    const [showAnalyst, setShowAnalyst] = useState(false);
    const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'analysis'>('scorecard');
    const [scorecardSort, setScorecardSort] = useState<'order' | 'runs'>('order');
    
    const [selectedOpener1, setSelectedOpener1] = useState('');
    const [selectedOpener2, setSelectedOpener2] = useState('');
    const [selectedBatter, setSelectedBatter] = useState('');
    const [selectedBowler, setSelectedBowler] = useState('');
    const [tossState, setTossState] = useState<'coin' | 'result'>('coin');
    const [showPreMatch, setShowPreMatch] = useState(() => state?.status === 'ready' && !savedState);
    const [showLineupEditor, setShowLineupEditor] = useState(false);

    // Auto-Simulation effect
    useEffect(() => {
        if (state?.status === 'inprogress' && startMode === 'simulate' && !state.autoPlayType) {
            simulateMatch();
        }
    }, [state?.status, startMode, state?.autoPlayType, simulateMatch]);

    // Auto Arrival State
    const [autoArrivalSeconds, setAutoArrivalSeconds] = useState<number | null>(null);
    const autoArrivalTimerRef = useRef<any>(null);
    const [nextAutoPlayerId, setNextAutoPlayerId] = useState<string | null>(null);

    const sponsorship = gameData.sponsorships?.[gameData.currentFormat];
    const tvChannelData = TV_CHANNELS.find(t => t.name === sponsorship?.tvChannel);
    const tvLogo = sponsorship?.tvLogo;
    const tvColor = tvChannelData?.color || 'text-white';

    // Auto-select / Pre-fill logic AND Auto-Arrival
    useEffect(() => {
        if (!state) return;
        
        // Clear previous timer if state changes away from waiting
        if (!state.waitingFor) {
            if (autoArrivalTimerRef.current) {
                clearInterval(autoArrivalTimerRef.current);
                autoArrivalTimerRef.current = null;
            }
            if (autoArrivalSeconds !== null) setTimeout(() => setAutoArrivalSeconds(null), 0);
            if (nextAutoPlayerId !== null) setTimeout(() => setNextAutoPlayerId(null), 0);
            return;
        }

        // Helper to find next player
        const getNextPlayer = () => {
            const currentInning = state.innings[state.currentInningIndex];
            if (state.waitingFor === 'batter') {
                return currentInning.batting.find(b => !b.isOut && b.playerId !== state.currentBatters.strikerId && b.playerId !== state.currentBatters.nonStrikerId);
            } else if (state.waitingFor === 'bowler') {
                const overLimit = gameData.currentFormat.includes('T20') ? 4 : 10;
                const validBowlers = currentInning.bowling.filter(b => b.playerId !== state.currentBowlerId && b.ballsBowled < overLimit * 6);
                // Simple rotation logic for auto
                return validBowlers[0];
            }
            return null;
        };

        if (state.waitingFor === 'openers') {
             const currentInning = state.innings[state.currentInningIndex];
             const available = currentInning.batting.filter(b => !b.isOut);
             if (available.length >= 2) {
                 setTimeout(() => {
                    setSelectedOpener1(available[0].playerId);
                    setSelectedOpener2(available[1].playerId);
                 }, 0);
             }
        } else if (state.waitingFor === 'batter' || state.waitingFor === 'bowler') {
            const nextP = getNextPlayer();
            
            if (nextP) {
                // Pre-fill selection
                setTimeout(() => {
                    if (state.waitingFor === 'batter') setSelectedBatter(nextP.playerId);
                    if (state.waitingFor === 'bowler') setSelectedBowler(nextP.playerId);
                    setNextAutoPlayerId(nextP.playerId);
                }, 0);

                // Start Auto-Arrival Countdown
                if (!autoArrivalTimerRef.current) {
                    const timer = setTimeout(() => {
                        setAutoArrivalSeconds(5);
                    }, 0);
                    autoArrivalTimerRef.current = setInterval(() => {
                        setAutoArrivalSeconds(prev => {
                            if (prev === 1) {
                                clearInterval(autoArrivalTimerRef.current);
                                autoArrivalTimerRef.current = null;
                                // Trigger Action
                                if (state.waitingFor === 'batter') selectNextBatter(nextP.playerId);
                                if (state.waitingFor === 'bowler') selectNextBowler(nextP.playerId);
                                return 0;
                            }
                            return (prev || 0) - 1;
                        });
                    }, 1000);
                    return () => {
                        clearTimeout(timer);
                        if (autoArrivalTimerRef.current) clearInterval(autoArrivalTimerRef.current);
                    };
                }
            }
        }
    }, [state, gameData.currentFormat, selectNextBatter, selectNextBowler, autoArrivalSeconds, nextAutoPlayerId]);

    const handleOverrideAuto = () => {
        if (autoArrivalTimerRef.current) {
            clearInterval(autoArrivalTimerRef.current);
            autoArrivalTimerRef.current = null;
        }
        setAutoArrivalSeconds(null);
        setNextAutoPlayerId(null);
        
        // Immediate execution if click happens
        if (nextAutoPlayerId) {
             if (state?.waitingFor === 'batter') selectNextBatter(nextAutoPlayerId);
             if (state?.waitingFor === 'bowler') selectNextBowler(nextAutoPlayerId);
        }
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || !state) return;
        const { source, destination } = result;
        
        const teamId = gameData.userTeamId;
        const team = state.battingTeam.id === teamId ? state.battingTeam : state.bowlingTeam;
        
        const player1Id = team.squad[source.index].id;
        const player2Id = team.squad[destination.index].id;
        
        swapPlayers(teamId, player1Id, player2Id);
    };

    useEffect(() => {
        if (activeTab === 'commentary' && commentaryRef.current) {
            commentaryRef.current.scrollTop = commentaryRef.current.scrollHeight;
        }
    }, [state?.commentary, activeTab]);

    const lastBallCountRef = useRef(0);
    useEffect(() => {
        if (state?.recentBalls.length && state.recentBalls.length !== lastBallCountRef.current) {
            lastBallCountRef.current = state.recentBalls.length;
            const baseSpeed = 130;
            const variation = Math.floor(Math.random() * 25) - 10;
            setTimeout(() => setLastBallSpeed(`${baseSpeed + variation} km/h`), 0);
        }
    }, [state?.recentBalls.length]);

    // --- PREDICTIONS & STATS CALCULATIONS ---
    const predictions = useMemo(() => {
        if (!state) return null;
        const { innings, currentInningIndex, target, battingTeam, bowlingTeam, currentBatters } = state;
        const currentInning = innings[currentInningIndex];
        const maxOvers = gameData.currentFormat.includes('T20') ? 20 : 50;
        const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + (parseFloat(currentInning.overs) % 1 * 10);
        const ballsRemaining = (maxOvers * 6) - ballsBowled;
        const currentRunRate = ballsBowled > 0 ? (currentInning.score / ballsBowled) * 6 : 6;
        
        // Win Probability
        let winProb: number;
        if (target) {
            const runsNeeded = target - currentInning.score;
            const wicketsLeft = 10 - currentInning.wickets;
            
            if (runsNeeded <= 0) {
                winProb = 100;
            } else if (ballsRemaining <= 0 || wicketsLeft <= 0) {
                winProb = 0;
            } else {
                const reqRate = (runsNeeded / ballsRemaining) * 6;
                const parRate = maxOvers === 20 ? 8.5 : 6.0;
                const rateDiff = parRate - reqRate;
                
                // Base probability on wickets left and rate diff
                winProb = 30 + (wicketsLeft * 6) + (rateDiff * 10);
            }
        } else {
            // Batting first
            const projScore = currentInning.score + (currentRunRate * (ballsRemaining/6));
            const parScore = maxOvers === 20 ? 175 : 290;
            winProb = 50 + ((projScore - parScore) / 3);
        }
        winProb = Math.max(1, Math.min(99, winProb));

        // Projected Scores
        const projCurrent = Math.round(currentInning.score + (currentRunRate * (ballsRemaining/6)));
        const proj6 = Math.round(currentInning.score + (6 * (ballsRemaining/6)));
        const proj8 = Math.round(currentInning.score + (8 * (ballsRemaining/6)));
        const proj10 = Math.round(currentInning.score + (10 * (ballsRemaining/6)));

        // Player Prediction
        const striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
        let playerProj = 0;
        if (striker) {
            // Assume they face 40% of remaining balls if top order, less if tail
            const expectedBalls = ballsRemaining * 0.4; 
            const currentSR = striker.balls > 0 ? (striker.runs / striker.balls) : 0.8; // Default 80 SR
            playerProj = Math.round(striker.runs + (expectedBalls * currentSR));
        }

        return {
            winProb: Math.round(winProb),
            projCurrent,
            proj6,
            proj8,
            proj10,
            playerProj
        };
    }, [state, gameData.currentFormat]);


    if (!state) return <div className="h-full flex items-center justify-center bg-slate-900 text-white">Loading Match...</div>;

    const { battingTeam, bowlingTeam, innings, currentInningIndex, currentBatters, currentBowlerId, recentBalls, commentary, target, waitingFor, strategies } = state;
    
    const isUserBatting = battingTeam?.id === gameData.userTeamId;
    const isUserBowling = bowlingTeam?.id === gameData.userTeamId;

    const handleExit = () => {
        // If match not finished, save state
        if (state.status !== 'completed') {
            onExit(state);
        } else {
            onExit();
        }
    };

    if (showPreMatch && state.status === 'ready') {
        return (
            <>
                <PreMatchPanel 
                    match={match} 
                    gameData={gameData} 
                    onStart={() => { setShowPreMatch(false); beginMatch(); }} 
                    onSimulate={() => {
                        setShowPreMatch(false);
                        beginMatch();
                        // The useEffect will handle the simulation start once status is 'inprogress'
                    }}
                    onEditLineup={() => setShowLineupEditor(true)}
                />
                
                <AnimatePresence>
                    {showLineupEditor && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute inset-0 z-[130] bg-[#050808] flex flex-col p-4"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-black italic uppercase tracking-tighter text-white">EDIT_LINEUP</h2>
                                <button onClick={() => setShowLineupEditor(false)} className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                                    <Icons.X className="h-4 w-4 text-white/40" />
                                </button>
                            </div>
                            
                            <p className="text-[7px] text-white/40 uppercase font-black tracking-widest mb-4">Drag to reorder your playing XI</p>
                            
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="lineup">
                                    {(provided) => (
                                        <div 
                                            {...provided.droppableProps} 
                                            ref={provided.innerRef}
                                            className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide"
                                        >
                                            {(state.battingTeam.id === gameData.userTeamId ? state.battingTeam : state.bowlingTeam).squad.map((player, index) => (
                                                <Draggable key={player.id} draggableId={player.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`p-3 rounded-xl border transition-all flex items-center justify-between ${snapshot.isDragging ? 'bg-teal-500 border-teal-400 shadow-2xl scale-105 z-50' : 'bg-white/[0.03] border-white/5'}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-mono font-black text-white/20 w-4">{index + 1}</span>
                                                                <div className="w-8 h-8 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                                                                    <PlayerAvatar player={player} size="sm" />
                                                                </div>
                                                                <div>
                                                                    <p className={`text-[10px] font-black uppercase italic tracking-tighter ${snapshot.isDragging ? 'text-black' : 'text-white'}`}>{player.name}</p>
                                                                    <p className={`text-[6px] font-black uppercase tracking-widest ${snapshot.isDragging ? 'text-black/60' : 'text-white/40'}`}>{player.role}</p>
                                                                </div>
                                                            </div>
                                                            <div className={`text-[10px] font-black italic ${snapshot.isDragging ? 'text-black/40' : 'text-white/10'}`}>:::</div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                            
                            <button 
                                onClick={() => setShowLineupEditor(false)}
                                className="mt-4 w-full bg-teal-500 text-black font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] shadow-lg"
                            >
                                SAVE_LINEUP
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    if (state.status === 'toss') {
        return (
            <div className="absolute inset-0 z-[100] bg-[#050808] flex flex-col items-center justify-center p-6 text-white overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center max-w-md w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-teal-500 text-black px-2 py-0.5 font-black text-[10px] uppercase tracking-widest">LIVE BROADCAST</div>
                        <span className="text-[10px] font-mono font-bold opacity-40 uppercase tracking-widest">MATCH DAY // TOSS</span>
                    </div>
                    
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-12 text-center leading-none">THE <span className="text-teal-500">TOSS</span></h2>
                    
                    <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 w-full text-center shadow-2xl">
                        {tvLogo && (
                            <div className={`absolute -top-10 -right-4 w-20 h-20 opacity-80 ${tvColor}`} dangerouslySetInnerHTML={{ __html: tvLogo }} />
                        )}
                        
                        <div className="flex justify-between items-center mb-10 px-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-black italic mb-2 border border-white/10">
                                    {match.teamA[0]}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{match.teamA}</p>
                            </div>
                            <div className="text-xs font-mono font-bold opacity-20 uppercase tracking-widest">VS</div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-black italic mb-2 border border-white/10">
                                    {match.teamB[0]}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{match.teamB}</p>
                            </div>
                        </div>

                        {tossState === 'coin' ? (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const winnerId = Math.random() > 0.5 ? gameData.teams.find(t => t.name === match.teamA)?.id : gameData.teams.find(t => t.name === match.teamB)?.id;
                                    const winnerTeam = gameData.teams.find(t => t.id === winnerId);

                                    if (!winnerTeam) {
                                        console.error('Toss winner not found!');
                                        return;
                                    }

                                    if (winnerTeam.id === gameData.userTeamId) {
                                        setTossState('result');
                                    } else {
                                        const decision = Math.random() > 0.5 ? 'bat' : 'bowl';
                                        startMatch(winnerTeam.id, decision);
                                    }
                                }}
                                className="w-full bg-teal-500 text-black font-black py-6 rounded-3xl text-2xl uppercase italic tracking-tighter shadow-[0_0_30px_rgba(20,184,166,0.3)] hover:invert transition-all"
                            >
                                FLIP COIN 🪙
                            </motion.button>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div>
                                    <p className="text-teal-400 font-black text-2xl uppercase italic tracking-tighter">YOU WON THE TOSS!</p>
                                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">SELECT YOUR STRATEGY</p>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => { console.log("User chose to bat"); startMatch(gameData.userTeamId, 'bat'); }} 
                                        className="flex-1 bg-white text-black py-5 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-teal-500 transition-all"
                                    >
                                        BAT 🏏
                                    </button>
                                    <button 
                                        onClick={() => { console.log("User chose to bowl"); startMatch(gameData.userTeamId, 'bowl'); }} 
                                        className="flex-1 bg-white/10 text-white border border-white/10 py-5 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-white/20 transition-all"
                                    >
                                        BOWL ⚾
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (!innings || innings.length === 0) {
        console.warn('LiveMatchScreen: Innings data not available yet.');
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Initializing Match...</h2>
                <p className="text-xs font-mono opacity-40 uppercase tracking-widest mt-2">Preparing the field and players</p>
            </div>
        );
    }

    // Ensure currentInningIndex is valid
    if (currentInningIndex < 0 || currentInningIndex >= innings.length) {
        console.error('LiveMatchScreen: Invalid currentInningIndex:', currentInningIndex);
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">Error: Invalid Inning State</h2>
                <p className="text-xs font-mono opacity-40 uppercase tracking-widest mt-2">Something went wrong with the match initialization</p>
            </div>
        );
    }

    const currentInning = innings[currentInningIndex];
    console.log("LiveMatchScreen state status:", state.status);
    const striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
    const nonStriker = currentInning.batting.find(b => b.playerId === currentBatters.nonStrikerId);
    const bowler = currentInning.bowling.find(b => b.playerId === currentBowlerId);

    const runRate = parseFloat(currentInning.overs) > 0 ? (currentInning.score / parseFloat(currentInning.overs)).toFixed(2) : "0.00";
    let reqRate = "N/A";
    let runsNeeded = 0;
    let ballsRemaining = 0;
    
    if (target) {
        runsNeeded = target - currentInning.score + 1;
        const totalBalls = (gameData.currentFormat.includes('T20') ? 20 : 50) * 6;
        const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + (parseFloat(currentInning.overs) % 1 * 10);
        ballsRemaining = totalBalls - ballsBowled;
        if (ballsRemaining > 0) {
             reqRate = (runsNeeded / (ballsRemaining/6)).toFixed(2);
        }
    }

    const fielders = [
        { x: 160, y: 80 }, { x: 240, y: 80 }, { x: 100, y: 160 }, { x: 300, y: 160 },
        { x: 120, y: 280 }, { x: 280, y: 280 }, { x: 200, y: 340 }, { x: 60, y: 200 }, { x: 340, y: 200 }
    ];

    const lastBall = recentBalls.length > 0 ? recentBalls[0] : null;
    const isWicket = lastBall === 'W';
    const isBoundary = lastBall === '4' || lastBall === '6';

    // --- Selection Modals ---
    const renderSelectionModal = (title: string, options: any[], onSelect: (id: any) => void, onConfirm: () => void, selectedValue: string, setValue: (v: string) => void, extraSelect?: any) => {
        // If auto-arrival is active, don't show modal yet
        if (autoArrivalSeconds !== null) return null;

        if (state.autoPlayType === 'inning' || state.autoPlayType === 'match') return <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center text-white font-black animate-pulse text-[10px] uppercase tracking-widest">Simulating...</div>;
        
        // Sorting logic: if it's a bowler selection, sort by secondarySkill (bowling skill)
        const isBowlerSelection = title.toLowerCase().includes('bowler');
        const sortedOptions = [...options].sort((a, b) => {
            const pA = getPlayerById(a.playerId, gameData.allPlayers);
            const pB = getPlayerById(b.playerId, gameData.allPlayers);
            if (isBowlerSelection) {
                return pB.secondarySkill - pA.secondarySkill;
            }
            // For batters, sort by battingSkill
            return pB.battingSkill - pA.battingSkill;
        });

        return (
            <div className="absolute inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-3 backdrop-blur-md">
                <h3 className="text-sm font-black italic uppercase tracking-tighter mb-2 text-white text-center leading-none">{title}</h3>
                <div className="w-full max-w-[240px] space-y-2.5 bg-slate-800/80 p-3 rounded-xl shadow-2xl border border-white/10 backdrop-blur-xl">
                    {extraSelect}
                    <div className="space-y-1">
                        <label className="text-[6px] font-black text-white/40 uppercase tracking-widest ml-1">SELECT_PLAYER (SORTED BY SKILL)</label>
                        <select className="w-full p-1.5 bg-slate-900 text-white rounded-lg border border-white/10 text-[9px] font-black focus:ring-1 focus:ring-teal-500 outline-none" value={selectedValue} onChange={e => setValue(e.target.value)}>
                            <option value="">Select Player</option>
                            {sortedOptions.map(p => {
                                const pDetails = getPlayerById(p.playerId, gameData.allPlayers);
                                const skill = isBowlerSelection ? pDetails.secondarySkill : pDetails.battingSkill;
                                return (
                                    <option key={p.playerId} value={p.playerId}>
                                        {p.playerName} {p.overs ? `(${p.overs})` : ''} - Skill: {skill}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <button 
                        disabled={!selectedValue || (extraSelect && !selectedOpener1)} // Hacky check for openers
                        onClick={onConfirm}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black py-2 rounded-lg text-[8px] uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                        CONFIRM_SELECTION
                    </button>
                </div>
            </div>
        );
    };

    // --- Match Centre Overlay ---
    const renderMatchCentre = () => (
        <div className="absolute inset-0 bg-[#050808]/95 z-40 flex flex-col p-3 animate-fade-in backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-teal-500 rounded-full" />
                    <h2 className="text-sm font-black italic uppercase tracking-tighter text-white">MATCH_CENTRE</h2>
                </div>
                <button onClick={() => setShowMatchCentre(false)} className="p-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                    <Icons.X className="h-4 w-4 text-white/40" />
                </button>
            </div>
            
            <div className="flex bg-white/[0.03] rounded-xl p-0.5 mb-3 border border-white/5">
                {['scorecard', 'commentary', 'analysis'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all duration-500 ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                {activeTab === 'scorecard' && (
                    <div className="space-y-3">
                        <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1.5">
                                <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-teal-500">Batting - {battingTeam.name}</h3>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setScorecardSort(prev => prev === 'order' ? 'runs' : 'order')}
                                        className="text-[6px] font-black text-teal-500 uppercase tracking-widest hover:text-white transition-colors bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                                    >
                                        SORT: {scorecardSort === 'order' ? 'BATTING_ORDER' : 'MOST_RUNS'}
                                    </button>
                                    <div className="text-[8px] text-white/40 font-mono font-black">{currentInning.score}/{currentInning.wickets} ({currentInning.overs})</div>
                                </div>
                            </div>
                            <table className="w-full text-[9px]">
                                <thead>
                                    <tr className="text-white/20 text-left border-b border-white/5">
                                        <th className="pb-1 font-black uppercase tracking-widest text-[7px]">Batter</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">R</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">B</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">4s</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">6s</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">SR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...currentInning.batting]
                                        .sort((a, b) => {
                                            if (scorecardSort === 'runs') return b.runs - a.runs;
                                            return 0; // Keep original order
                                        })
                                        .map((b, idx) => {
                                            const isBatting = b.playerId === currentBatters.strikerId || b.playerId === currentBatters.nonStrikerId;
                                            const hasBatted = b.isOut || isBatting || b.runs > 0 || b.balls > 0;
                                            
                                            if (!hasBatted) return null;

                                            return (
                                                <tr key={b.playerId} className={`border-b border-white/[0.02] ${b.isOut ? 'text-white/30' : 'text-white'}`}>
                                                    <td className="py-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[7px] text-white/10 font-mono w-2">{currentInning.batting.findIndex(pb => pb.playerId === b.playerId) + 1}</span>
                                                            <div className="flex flex-col">
                                                                <span className="font-black italic uppercase tracking-tighter">
                                                                    {b.playerName} {b.playerId === currentBatters.strikerId ? '*' : ''}
                                                                </span>
                                                                <span className="text-[6px] text-teal-500/60 font-black uppercase tracking-widest">
                                                                    {b.isOut ? b.dismissalText : isBatting ? 'BATTING' : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-right font-black text-[10px]">{b.runs}</td>
                                                    <td className="text-right opacity-40">{b.balls}</td>
                                                    <td className="text-right opacity-40">{b.fours}</td>
                                                    <td className="text-right opacity-40">{b.sixes}</td>
                                                    <td className="text-right font-mono text-[8px] text-teal-500/60">{b.balls > 0 ? Math.round((b.runs/b.balls)*100) : 0}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                            
                            {/* Did Not Bat Section */}
                            {currentInning.batting.some(b => !b.isOut && b.playerId !== currentBatters.strikerId && b.playerId !== currentBatters.nonStrikerId && b.runs === 0 && b.balls === 0) && (
                                <div className="mt-2 pt-1.5 border-t border-white/5">
                                    <p className="text-[6px] font-black text-white/20 uppercase tracking-widest mb-0.5">DID_NOT_BAT</p>
                                    <p className="text-[8px] text-white/40 italic font-medium">
                                        {currentInning.batting
                                            .filter(b => !b.isOut && b.playerId !== currentBatters.strikerId && b.playerId !== currentBatters.nonStrikerId && b.runs === 0 && b.balls === 0)
                                            .map(b => b.playerName)
                                            .join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                            <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-blue-500 mb-2 border-b border-white/5 pb-1.5">Bowling - {bowlingTeam.name}</h3>
                            <table className="w-full text-[9px]">
                                <thead>
                                    <tr className="text-white/20 text-left border-b border-white/5">
                                        <th className="pb-1 font-black uppercase tracking-widest text-[7px]">Bowler</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">O</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">M</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">R</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">W</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">ECN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentInning.bowling.filter(b => parseFloat(b.overs) > 0 || b.playerId === currentBowlerId).map(b => (
                                        <tr key={b.playerId} className="border-b border-white/[0.02] text-white">
                                            <td className="py-1.5 font-black italic uppercase tracking-tighter">
                                                {b.playerName} {b.playerId === currentBowlerId ? '🥎' : ''}
                                            </td>
                                            <td className="text-right font-mono">{b.overs}</td>
                                            <td className="text-right">{b.maidens}</td>
                                            <td className="text-right">{b.runsConceded}</td>
                                            <td className="text-right font-black text-[10px] text-teal-500">{b.wickets}</td>
                                            <td className="text-right font-mono text-[8px] text-blue-500/60">{b.ballsBowled > 0 ? ((b.runsConceded/b.ballsBowled)*6).toFixed(1) : '0.0'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Fall of Wickets */}
                        {state.fallOfWickets.length > 0 && (
                            <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                                <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-red-500 mb-2 border-b border-white/5 pb-1.5">Fall of Wickets</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {state.fallOfWickets.map((fow, i) => (
                                        <div key={i} className="bg-black/40 px-2 py-1 rounded-lg border border-white/5 text-[8px]">
                                            <span className="font-black text-white">{fow.score}-{fow.wicket}</span>
                                            <span className="text-white/20 ml-1 font-bold">({fow.player}, {fow.over} ov)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'commentary' && (
                    <div className="space-y-1.5" ref={commentaryRef}>
                        {commentary.map((line, i) => (
                            <div key={i} className="bg-white/[0.02] p-2 rounded-lg text-[9px] font-mono text-white/60 border-l-2 border-teal-500/40 backdrop-blur-sm">
                                {line}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'analysis' && predictions && (
                    <div className="space-y-3">
                        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                            <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-white mb-2.5">WIN_PROBABILITY</h3>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                                <div className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-1000" style={{ width: `${battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[8px] mt-1.5 font-black uppercase tracking-widest">
                                <span className="text-teal-500">{gameData.userTeamId === battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                                <span className="text-white/20">{gameData.userTeamId !== battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id !== gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                            <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-white mb-2.5">PROJECTED_SCORE</h3>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                                    <div className="text-[6px] text-white/20 uppercase font-black tracking-widest mb-0.5">CURRENT_RATE</div>
                                    <div className="text-base font-black text-white italic">{predictions.projCurrent}</div>
                                </div>
                                <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                                    <div className="text-[6px] text-white/20 uppercase font-black tracking-widest mb-0.5">AT_8_RPO</div>
                                    <div className="text-base font-black text-white italic">{predictions.proj8}</div>
                                </div>
                                <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                                    <div className="text-[6px] text-white/20 uppercase font-black tracking-widest mb-0.5">AT_10_RPO</div>
                                    <div className="text-base font-black text-white italic">{predictions.proj10}</div>
                                </div>
                                 <div className="bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                                    <div className="text-[6px] text-teal-500 uppercase font-black tracking-widest mb-0.5">SAFE_SCORE</div>
                                    <div className="text-base font-black text-teal-500 italic">{gameData.currentFormat.includes('T20') ? 175 : 285}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                            <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-white mb-2">PLAYER_PREDICTION</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/60 font-black italic uppercase tracking-tighter">{striker?.playerName} TO_SCORE</span>
                                <span className="text-xl font-black text-teal-500 italic tracking-tighter">{predictions.playerProj}</span>
                            </div>
                            <p className="text-[6px] text-white/20 mt-1 uppercase font-black tracking-widest">BASED_ON_CURRENT_SR_AND_SITUATION</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white font-sans overflow-hidden relative">
            <style>{`
                @keyframes ball-path {
                    0% { cy: 175; cx: 205; opacity: 0; }
                    20% { opacity: 1; }
                    100% { cy: 220; cx: 200; }
                }
                @keyframes bat-swing {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(-45deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-ball { animation: ball-path 0.5s ease-in forwards; }
                .animate-bat { animation: bat-swing 0.3s ease-out; transform-origin: top center; }
                @keyframes slide-up { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
                .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
            `}</style>

            {/* Broadcaster Overlay */}
            {tvLogo && (
                <div className="absolute top-14 right-2 z-20 flex flex-col items-end pointer-events-none animate-fade-in">
                    <div className={`w-16 h-12 opacity-80 flex items-center justify-end ${tvColor}`} dangerouslySetInnerHTML={{ __html: tvLogo }} />
                    <div className="bg-red-600 text-white text-[8px] font-bold px-1 rounded flex items-center gap-1">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse"></span> LIVE
                    </div>
                </div>
            )}

            {/* Analyst Button */}
            <div className="absolute top-28 right-2 z-20">
                <button onClick={() => setShowAnalyst(true)} className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50 flex items-center justify-center text-white border-2 border-white/20 active:scale-95 transition-transform">
                    <Icons.Bot />
                </button>
            </div>

            {/* Clickable Area for Auto-Dismiss (Only visible when timer is active) */}
            {autoArrivalSeconds !== null && (
                <div 
                    className="absolute inset-0 z-25 cursor-pointer" 
                    onClick={handleOverrideAuto}
                    title="Click anywhere to skip timer"
                ></div>
            )}

            {/* Auto Arrival Notification */}
            {autoArrivalSeconds !== null && nextAutoPlayerId && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"> 
                    {/* Wrapper to position centered, content inside */}
                    <AutoArrivalNotification 
                        playerName={getPlayerById(nextAutoPlayerId, gameData.allPlayers).name} 
                        onOverride={handleOverrideAuto} 
                        secondsLeft={autoArrivalSeconds} 
                    />
                </div>
            )}

            {waitingFor === 'openers' && renderSelectionModal("Select Opening Pair", currentInning.batting.filter(p => !p.isOut && p.playerId !== selectedOpener1), (id) => setSelectedOpener2(id), () => { selectOpeners(selectedOpener1, selectedOpener2); setSelectedOpener1(''); setSelectedOpener2(''); }, selectedOpener2, setSelectedOpener2, (
                <div>
                    <label className="text-sm text-gray-300 block mb-1">Striker</label>
                    <select className="w-full p-2 bg-slate-900 text-white rounded border border-slate-600" value={selectedOpener1} onChange={e => setSelectedOpener1(e.target.value)}>
                        <option value="">Select Player</option>
                        {currentInning.batting.filter(p => !p.isOut).map(p => <option key={p.playerId} value={p.playerId}>{p.playerName}</option>)}
                    </select>
                </div>
            ))}
            {waitingFor === 'batter' && renderSelectionModal("Select Next Batter", currentInning.batting.filter(p => !p.isOut && p.playerId !== currentBatters.nonStrikerId && p.playerId !== currentBatters.strikerId), (id) => setSelectedBatter(id), () => { selectNextBatter(selectedBatter); setSelectedBatter(''); }, selectedBatter, setSelectedBatter)}
            {waitingFor === 'bowler' && renderSelectionModal("Select Next Bowler", currentInning.bowling.filter(p => p.playerId !== currentBowlerId), (id) => setSelectedBowler(id), () => { selectNextBowler(selectedBowler); setSelectedBowler(''); }, selectedBowler, setSelectedBowler)}

            {showMatchCentre && renderMatchCentre()}
            {showAnalyst && <MatchChat gameData={gameData} onClose={() => setShowAnalyst(false)} />}

            {/* TOP BAR - Broadcast Style */}
            <div className="bg-[#050808] p-2 flex justify-between items-center z-20 border-b border-white/10 flex-shrink-0 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-500/5 to-transparent pointer-events-none" />
                 
                 <div className="flex items-center gap-3 relative z-10">
                     <div className="flex flex-col">
                         <div className="flex items-center gap-1.5 mb-0.5">
                            <p className="text-[6px] font-black text-teal-500 uppercase tracking-[0.4em]">LIVE_STREAM</p>
                            <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                         </div>
                         <h2 className="text-xs font-black italic uppercase tracking-tighter text-white">
                            {match.teamA} <span className="text-white/30 not-italic">v</span> {match.teamB}
                         </h2>
                     </div>
                     <div className="h-6 w-px bg-white/10" />
                     <div className="flex flex-col">
                         <p className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Format</p>
                         <p className="text-[8px] font-black text-white/80 uppercase tracking-widest">{gameData.currentFormat}</p>
                     </div>
                 </div>

                 <div className="flex items-center gap-4 relative z-10">
                     <div className="text-right">
                         <p className="text-[6px] font-black text-white/30 uppercase tracking-[0.2em] mb-0.5">Overs</p>
                         <p className="text-base font-black text-teal-500 tracking-tighter leading-none">{currentInning.overs}</p>
                     </div>
                     <button 
                        onClick={handleExit} 
                        className="bg-white/5 hover:bg-white/10 text-[7px] font-black text-white/60 uppercase tracking-[0.2em] px-2 py-1.5 rounded-lg border border-white/10 transition-all active:scale-95"
                     >
                        {state.status === 'completed' ? 'Exit' : 'Save_Exit'}
                     </button>
                 </div>
                 
                 {/* Win Probability Bar - HUD */}
                 <div className="absolute bottom-0 left-0 w-full h-[2px] flex">
                    <div className="h-full bg-teal-500 shadow-[0_0_10px_#14b8a6] transition-all duration-1000" style={{ width: `${battingTeam.id === gameData.userTeamId ? predictions?.winProb : 100 - (predictions?.winProb||50)}%` }} />
                    <div className="h-full bg-white/10 flex-1" />
                 </div>
            </div>

            {/* MAIN FIELD */}
            <div className="flex-1 relative bg-[#050808] overflow-hidden flex flex-col items-center justify-center min-h-0">
                {/* Field Background Pattern */}
                <div className="absolute inset-0 bg-[#1a3a1a] opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
                
                {/* Top Left Stats - Broadcast Overlay */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="absolute top-3 left-3 z-10"
                >
                    <div className="bg-black/80 backdrop-blur-xl border-l-2 border-teal-500 p-2 rounded-r-xl shadow-2xl min-w-[100px]">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[6px] font-black text-teal-500 uppercase tracking-[0.3em]">{battingTeam.name}</span>
                            <div className="w-1 h-1 rounded-full bg-teal-500 animate-pulse" />
                        </div>
                        <div className="text-xl font-black text-white tracking-tighter italic leading-none mb-1.5">
                            {currentInning.score}<span className="text-white/30 not-italic mx-0.5">/</span>{currentInning.wickets}
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-white/10">
                            <div className="flex flex-col">
                                <span className="text-[5px] font-black text-white/30 uppercase tracking-widest">CRR</span>
                                <span className="text-[9px] font-black text-white/80">{runRate}</span>
                            </div>
                            {target && (
                                <div className="flex flex-col text-right">
                                    <span className="text-[5px] font-black text-white/30 uppercase tracking-widest">RRR</span>
                                    <span className="text-[9px] font-black text-teal-500">{reqRate}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Top Right Stats - Broadcast Overlay */}
                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="absolute top-3 right-3 z-10"
                >
                    <div className="bg-black/80 backdrop-blur-xl border-r-2 border-blue-500 p-2 rounded-l-xl shadow-2xl min-w-[100px] text-right">
                        <div className="flex justify-between items-center mb-0.5 flex-row-reverse">
                            <span className="text-[6px] font-black text-blue-500 uppercase tracking-[0.3em]">{bowlingTeam.name}</span>
                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                        </div>
                        
                        {target ? (
                            <>
                                <div className="text-lg font-black text-white tracking-tighter italic leading-none mb-0.5">
                                    {runsNeeded} <span className="text-[7px] font-light not-italic text-white/40 uppercase tracking-widest">Needed</span>
                                </div>
                                <p className="text-[7px] font-black text-white/60 uppercase tracking-widest leading-none">from {ballsRemaining} balls</p>
                            </>
                        ) : (
                            <>
                                <div className="text-lg font-black text-white tracking-tighter italic leading-none mb-0.5">
                                    {predictions?.projCurrent || '-'}
                                </div>
                                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest leading-none">Projected Score</p>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Field SVG */}
                <div className="w-full h-full flex items-center justify-center p-2">
                    <svg viewBox="0 0 400 400" className="h-full w-full max-h-[60vh] max-w-md drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <pattern id="grass" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                <rect width="10" height="10" fill="#35682d" />
                                <circle cx="1" cy="1" r="1" fill="#3e7a35" />
                            </pattern>
                        </defs>
                        <circle cx="200" cy="200" r="190" fill="url(#grass)" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
                        <circle cx="200" cy="200" r="80" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="4,4" />
                        <rect x="196" y="170" width="8" height="60" fill="#d2b48c" stroke="#bfa07a" strokeWidth="0.5" />
                        <line x1="194" y1="178" x2="206" y2="178" stroke="white" strokeWidth="0.5" />
                        <line x1="194" y1="222" x2="206" y2="222" stroke="white" strokeWidth="0.5" />
                        <circle cx="200" cy="177" r="1" fill="black" />
                        <circle cx="200" cy="223" r="1" fill="black" />
                        
                        <g transform="translate(200, 165)">
                             <circle r="3" fill="#ef4444" stroke="white" strokeWidth="1" />
                             <text y="-4" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">{bowler?.playerName.split(' ').pop()?.substring(0,1)}</text>
                        </g>
                        
                         <g transform="translate(200, 225)">
                             <circle r="3" fill="#eab308" stroke="white" strokeWidth="1" />
                             <rect x="2" y="-1" width="2" height="8" fill="#854d0e" className={lastBall ? "animate-bat" : ""} transform="rotate(15)" />
                        </g>
                        
                        <g transform="translate(190, 178)">
                             <circle r="3" fill="#eab308" stroke="white" strokeWidth="1" opacity="0.8" />
                        </g>
                        
                        <g transform="translate(200, 235)">
                             <circle r="2" fill="black" stroke="white" strokeWidth="0.5" />
                        </g>

                        {fielders.map((pos, i) => (
                            <circle key={i} cx={pos.x} cy={pos.y} r="3" fill="#ef4444" stroke="white" strokeWidth="0.5" opacity="0.9" />
                        ))}
                        
                        {lastBall && (
                            <circle cx="200" cy="175" r="1.5" fill="white" className="animate-ball" />
                        )}
                    </svg>
                </div>

                {/* Ball Result Overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
                    <AnimatePresence mode="wait">
                        {lastBall && (
                            <motion.div 
                                key={currentInning.overs}
                                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 1.2, opacity: 0, y: -20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className={`
                                    flex flex-col items-center justify-center rounded-[40px] p-10 min-w-[180px]
                                    ${isWicket ? 'bg-red-600 shadow-[0_0_60px_rgba(220,38,38,0.6)]' : 
                                      isBoundary ? 'bg-teal-500 shadow-[0_0_60px_rgba(20,184,166,0.6)]' : 
                                      'bg-black/80 backdrop-blur-2xl border border-white/10 shadow-2xl'}
                                    border-4 border-white/20
                                `}
                            >
                                <span className={`text-[11px] font-black uppercase tracking-[0.6em] mb-3 ${isWicket || isBoundary ? 'text-black/60' : 'text-teal-500'}`}>
                                    {isWicket ? 'Wicket' : isBoundary ? 'Boundary' : 'Result'}
                                </span>
                                <span className={`text-7xl font-black italic tracking-tighter ${isWicket || isBoundary ? 'text-black' : 'text-white'}`}>
                                    {lastBall === 'W' ? 'OUT' : lastBall}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="absolute bottom-2 right-2 z-10">
                    <button onClick={() => setShowMatchCentre(true)} className="bg-slate-800/90 text-xs font-bold text-white px-4 py-2 rounded-full border border-slate-600 shadow-lg flex items-center gap-2 animate-pulse">
                        <Icons.ChartPie /> Match Centre
                    </button>
                </div>
            </div>

            {/* BOTTOM INFO BAR - Broadcast Style */}
            <div className="bg-[#050808] border-t border-white/10 p-1.5 flex-shrink-0">
                <div className="flex items-stretch bg-white/[0.03] rounded-xl overflow-hidden text-[10px] border border-white/5">
                    
                    {/* Bowler Stats */}
                    <div className="flex-1 p-2 border-r border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <p className="text-[6px] font-black text-blue-500 uppercase tracking-[0.3em] mb-0.5">Bowling</p>
                        <div className="flex items-center gap-1.5">
                            {bowler && <PlayerAvatar player={getPlayerById(bowler.playerId, gameData.allPlayers)!} size="xs" />}
                            <div>
                                <button 
                                    onClick={() => {
                                        if (isUserBowling && state.status === 'inprogress' && !state.waitingFor) {
                                            requestBowlerChange();
                                        }
                                    }}
                                    className="font-black text-white truncate text-xs italic hover:text-teal-500 transition-colors text-left block"
                                >
                                    {bowler?.playerName}
                                </button>
                                <div className="text-white/40 font-black tracking-tighter">
                                    {bowler?.wickets}<span className="text-white/20 mx-0.5">-</span>{bowler?.runsConceded} 
                                    <span className="text-[8px] font-light ml-1 text-white/20">({bowler?.overs})</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Batters Stats - Enhanced */}
                    <div className="flex-[2.5] flex">
                        <div className={`flex-1 p-2 border-r border-white/5 transition-all duration-500 bg-teal-500/10`}>
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="text-[6px] font-black uppercase tracking-[0.3em] text-teal-500">Striker</p>
                                <div className="w-1 h-1 rounded-full bg-teal-500 animate-pulse shadow-[0_0_5px_#14b8a6]" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                {striker && <PlayerAvatar player={getPlayerById(striker.playerId, gameData.allPlayers)!} size="xs" />}
                                <div>
                                    <div className="font-black truncate text-xs italic transition-colors text-white">{striker?.playerName}</div>
                                    <div className="text-white/40 font-black tracking-tighter">
                                        {striker?.runs} <span className="text-[8px] font-light ml-1 text-white/20">({striker?.balls})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={`flex-1 p-2 border-r border-white/5 transition-all duration-500`}>
                            <div className="flex justify-between items-center mb-0.5">
                                <p className="text-[6px] font-black uppercase tracking-[0.3em] text-white/20">Non-Striker</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {nonStriker && <PlayerAvatar player={getPlayerById(nonStriker.playerId, gameData.allPlayers)!} size="xs" />}
                                <div>
                                    <div className="font-black truncate text-xs italic transition-colors text-white/40">{nonStriker?.playerName}</div>
                                    <div className="text-white/40 font-black tracking-tighter">
                                        {nonStriker?.runs} <span className="text-[8px] font-light ml-1 text-white/20">({nonStriker?.balls})</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Last Ball */}
                    <div className="flex-1 p-2 text-right bg-gradient-to-b from-white/[0.02] to-transparent">
                        <p className="text-[6px] font-black text-white/30 uppercase tracking-[0.3em] mb-0.5">Last Ball</p>
                        <div className="text-white/40 font-mono text-[8px] mb-0.5 tracking-widest">{lastBallSpeed}</div>
                        <div className={`font-black text-xl italic tracking-tighter leading-none ${isWicket ? 'text-red-500' : isBoundary ? 'text-teal-400' : 'text-white'}`}>
                            {lastBall || '-'}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROL PANEL - Apex Style */}
            <div className="bg-[#050808] p-3 pb-6 flex-shrink-0">
                 <div className="flex gap-2 mb-3">
                    {isUserBatting && (
                        <StrategyToggle label="Batting Tactics" value={strategies.batting} onChange={setBattingStrategy} />
                    )}
                    {isUserBowling && (
                        <StrategyToggle label="Bowling Tactics" value={strategies.bowling} onChange={setBowlingStrategy} />
                    )}
                 </div>

                <div className="flex items-center gap-2 mb-4 overflow-x-auto py-1 scrollbar-hide">
                     <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.3em] flex-shrink-0">This Over:</span>
                     {recentBalls.slice(0, 8).map((b, i) => (
                         <div key={i} className={`
                            h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 border transition-all
                            ${b === 'W' ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 
                              b === '6' ? 'bg-teal-500 border-teal-400 text-black shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 
                              b === '4' ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' : 
                              'bg-white/5 border-white/10 text-white/40'}
                         `}>
                             {b}
                         </div>
                     ))}
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {state.status === 'completed' ? (
                        <button 
                            onClick={handleExit} 
                            className="col-span-4 bg-red-500 text-white font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] hover:bg-red-600 transition-all active:scale-95 shadow-2xl shadow-red-500/20 flex items-center justify-center gap-2"
                        >
                            <Icons.X className="w-3 h-3" />
                            TERMINATE BROADCAST
                        </button>
                    ) : (
                        <>
                            {state.autoPlayType ? (
                                <button 
                                    onClick={stopAutoPlay} 
                                    className="col-span-4 bg-red-500 text-white font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] hover:bg-red-600 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl shadow-red-500/20 animate-pulse"
                                >
                                    <Icons.X className="w-3 h-3" />
                                    STOP SIMULATION
                                </button>
                            ) : (
                                <>
                                    <button 
                                        onClick={playBall} 
                                        className={`col-span-2 ${isUserBatting ? 'bg-teal-500 text-black' : 'bg-blue-500 text-white'} font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-2xl ${isUserBatting ? 'shadow-teal-500/30' : 'shadow-blue-500/30'}`}
                                    >
                                        <Icons.PlayMatch className="w-3 h-3" />
                                        {isUserBatting ? 'PLAY BALL' : 'BOWL BALL'}
                                    </button>
                                    <button 
                                        onClick={playOver} 
                                        className="bg-white/[0.05] text-white font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] hover:bg-white/10 transition-all active:scale-95 border border-white/10 flex flex-col items-center justify-center gap-0.5"
                                    >
                                        <Icons.Activity className="w-2.5 h-2.5" />
                                        OVER
                                    </button>
                                    <button 
                                        onClick={() => setShowMatchCentre(true)} 
                                        className="bg-white/[0.05] text-white font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] hover:bg-white/10 transition-all active:scale-95 border border-white/10 flex flex-col items-center justify-center gap-0.5"
                                    >
                                        <Icons.Menu className="w-2.5 h-2.5" />
                                        CENTRE
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveMatchScreen;
