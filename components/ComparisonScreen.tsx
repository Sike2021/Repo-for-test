
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameData, Format } from '../types';
import { Icons } from './Icons';

interface ComparisonScreenProps {
    gameData: GameData;
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ gameData }) => {
    const [comparisonType, setComparisonType] = useState<'player-vs-player' | 'team-vs-team' | 'player-vs-team'>('player-vs-player');
    const [selection1, setSelection1] = useState('');
    const [selection2, setSelection2] = useState('');
    const [pvpFormat, setPvpFormat] = useState<Format>(gameData.currentFormat);

    const sortedPlayers = useMemo(() => [...gameData.allPlayers].sort((a, b) => a.name.localeCompare(b.name)), [gameData.allPlayers]);
    const sortedTeams = useMemo(() => [...gameData.teams].sort((a, b) => a.name.localeCompare(b.name)), [gameData.teams]);

    const handleTypeChange = (type: 'player-vs-player' | 'team-vs-team' | 'player-vs-team') => {
        setComparisonType(type);
        setSelection1('');
        setSelection2('');
    };

    const renderSelectionDropdowns = () => {
        let options1: any[] = [];
        let options2: any[] = [];
        let label1 = '', label2 = '';

        switch (comparisonType) {
            case 'player-vs-player':
                options1 = sortedPlayers;
                options2 = sortedPlayers;
                label1 = 'ASSET_ALPHA';
                label2 = 'ASSET_BETA';
                break;
            case 'team-vs-team':
                options1 = sortedTeams;
                options2 = sortedTeams;
                label1 = 'FRANCHISE_ALPHA';
                label2 = 'FRANCHISE_BETA';
                break;
            case 'player-vs-team':
                options1 = sortedPlayers;
                options2 = sortedTeams;
                label1 = 'ASSET_UNIT';
                label2 = 'FRANCHISE_UNIT';
                break;
        }

        return (
            <div className="flex items-center gap-6 my-8 relative z-10">
                <div className="flex-1">
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 block ml-4">{label1}</label>
                    <div className="relative">
                        <select 
                            value={selection1} 
                            onChange={e => setSelection1(e.target.value)} 
                            className="w-full pl-6 pr-12 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-teal-500 outline-none font-black uppercase tracking-widest text-[11px] appearance-none transition-all text-white/80"
                        >
                            <option value="" className="bg-[#050808]">SELECT_IDENTIFIER...</option>
                            {options1.map(o => <option key={o.id} value={o.id} className="bg-[#050808]">{o.name.toUpperCase()}</option>)}
                        </select>
                        <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                </div>
                
                <div className="flex flex-col items-center gap-2 pt-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-teal-500 italic">VS</div>
                </div>

                <div className="flex-1">
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 block ml-4">{label2}</label>
                    <div className="relative">
                        <select 
                            value={selection2} 
                            onChange={e => setSelection2(e.target.value)} 
                            className="w-full pl-6 pr-12 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-teal-500 outline-none font-black uppercase tracking-widest text-[11px] appearance-none transition-all text-white/80"
                        >
                            <option value="" className="bg-[#050808]">SELECT_IDENTIFIER...</option>
                            {options2.map(o => <option key={o.id} value={o.id} className="bg-[#050808]">{o.name.toUpperCase()}</option>)}
                        </select>
                        <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                    </div>
                </div>
            </div>
        );
    };

    const StatRow = ({ label, value1, value2 }: { label: string, value1: any, value2: any }) => {
        const val1 = typeof value1 === 'number' ? parseFloat(value1.toFixed(2)) : value1;
        const val2 = typeof value2 === 'number' ? parseFloat(value2.toFixed(2)) : value2;
        const isBetter1 = val1 > val2;
        const isBetter2 = val2 > val1;
        const isLowerBetter = ['AVG', 'ECON'].includes(label.toUpperCase());
        const isBowlingBetter1 = isLowerBetter && val1 < val2;
        const isBowlingBetter2 = isLowerBetter && val2 < val1;

        return (
            <div className="flex justify-between items-center py-6 border-b border-white/5 group hover:bg-white/[0.02] transition-colors px-4">
                <span className={`w-1/3 text-left font-black italic text-2xl tracking-tighter transition-colors ${((isBetter1 && !isLowerBetter) || isBowlingBetter1) ? 'text-teal-500 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'text-white/40'}`}>{val1}</span>
                <span className="w-1/3 text-center text-[9px] font-black text-white/10 uppercase tracking-[0.4em] group-hover:text-white/30 transition-colors">{label}</span>
                <span className={`w-1/3 text-right font-black italic text-2xl tracking-tighter transition-colors ${((isBetter2 && !isLowerBetter) || isBowlingBetter2) ? 'text-teal-500 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]' : 'text-white/40'}`}>{val2}</span>
            </div>
        );
    };

    const renderComparisonResult = () => {
        if (!selection1 || !selection2 || selection1 === selection2) {
            return (
                <div className="flex flex-col items-center justify-center py-24 opacity-20">
                    <Icons.Scale className="w-24 h-24 mb-6" />
                    <p className="text-[11px] font-black uppercase tracking-[0.5em]">AWAITING_DUAL_INPUT...</p>
                </div>
            );
        }

        switch (comparisonType) {
            case 'player-vs-player': {
                const p1 = gameData.allPlayers.find(p => p.id === selection1);
                const p2 = gameData.allPlayers.find(p => p.id === selection2);
                if (!p1 || !p2) return null;

                const s1 = p1.stats[pvpFormat];
                const s2 = p2.stats[pvpFormat];

                const headToHead = gameData.records?.batterVsBowler.find(r => (r.batterId === p1.id && r.bowlerId === p2.id) || (r.batterId === p2.id && r.bowlerId === p1.id));

                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12 pb-24"
                    >
                        <div className="flex justify-between items-center px-4">
                           <div className="w-2/5 text-left">
                               <p className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{p1.name}</p>
                               <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">ASSET_ALPHA</p>
                           </div>
                           <div className="w-1/5 flex flex-col items-center">
                               <div className="h-12 w-[1px] bg-gradient-to-b from-white/10 to-transparent"></div>
                           </div>
                           <div className="w-2/5 text-right">
                               <p className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{p2.name}</p>
                               <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">ASSET_BETA</p>
                           </div>
                        </div>

                        <div className="bg-white/[0.01] border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-xl">
                            <div className="bg-white/[0.03] p-6 border-b border-white/10 text-center">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">BATTING_CAREER_DNA</h4>
                            </div>
                            <div className="p-4">
                                <StatRow label="Matches" value1={s1.matches} value2={s2.matches} />
                                <StatRow label="Runs" value1={s1.runs} value2={s2.runs} />
                                <StatRow label="Avg" value1={s1.average} value2={s2.average} />
                                <StatRow label="SR" value1={s1.strikeRate} value2={s2.strikeRate} />
                                <StatRow label="HS" value1={s1.highestScore} value2={s2.highestScore} />
                                <StatRow label="100s" value1={s1.hundreds} value2={s2.hundreds} />
                                <StatRow label="50s" value1={s1.fifties} value2={s2.fifties} />
                            </div>
                        </div>

                        <div className="bg-white/[0.01] border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-xl">
                            <div className="bg-white/[0.03] p-6 border-b border-white/10 text-center">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">BOWLING_CAREER_DNA</h4>
                            </div>
                            <div className="p-4">
                                <StatRow label="Wickets" value1={s1.wickets} value2={s2.wickets} />
                                <StatRow label="Avg" value1={s1.bowlingAverage} value2={s2.bowlingAverage} />
                                <StatRow label="Econ" value1={s1.economy} value2={s2.economy} />
                                <StatRow label="Best" value1={s1.bestBowling} value2={s2.bestBowling} />
                            </div>
                        </div>
                        
                        {headToHead && (
                             <div className="p-10 bg-teal-500/5 border border-teal-500/20 rounded-[48px] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity">
                                    <Icons.Target className="w-32 h-32" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-teal-500 text-center mb-8">HEAD_TO_HEAD_ANALYSIS</h4>
                                <div className="flex flex-col items-center gap-6 relative z-10">
                                    <p className="text-sm font-black uppercase tracking-widest text-white/60">
                                        <span className="text-white">{headToHead.batterName}</span> <span className="text-teal-500 italic mx-2">VS</span> <span className="text-white">{headToHead.bowlerName}</span>
                                    </p>
                                    <div className="flex gap-12">
                                        <div className="text-center">
                                            <p className="text-5xl font-black italic tracking-tighter text-white mb-1">{headToHead.runs}</p>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">RUNS</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-5xl font-black italic tracking-tighter text-white mb-1">{headToHead.balls}</p>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">BALLS</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-5xl font-black italic tracking-tighter text-red-500 mb-1">{headToHead.dismissals}</p>
                                            <p className="text-[9px] font-black text-red-500/40 uppercase tracking-widest">OUTS</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}
                    </motion.div>
                );
            }
            case 'team-vs-team': {
                const t1 = gameData.teams.find(t => t.id === selection1);
                const t2 = gameData.teams.find(t => t.id === selection2);
                if (!t1 || !t2) return null;

                const record = gameData.records?.teamVsTeam.find(r => (r.teamAId === t1.id && r.teamBId === t2.id) || (r.teamAId === t2.id && r.teamBId === t1.id));
                const t1Wins = record ? (record.teamAId === t1.id ? record.teamAWins : record.matches - record.teamAWins) : 0;
                const t2Wins = record ? record.matches - t1Wins : 0;

                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center py-12"
                    >
                        <div className="flex items-center gap-12 mb-16">
                            <div className="text-right">
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{t1.name}</h3>
                                <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">FRANCHISE_ALPHA</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-teal-500 italic">VS</div>
                            <div className="text-left">
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{t2.name}</h3>
                                <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">FRANCHISE_BETA</p>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/10 p-12 rounded-[56px] w-full max-w-2xl backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/[0.02] to-transparent pointer-events-none" />
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.6em] text-center mb-12">HEAD_TO_HEAD_RECORD</p>
                            
                            <div className="flex items-center justify-center gap-16">
                                <div className="text-center">
                                    <p className={`text-8xl font-black italic tracking-tighter transition-all duration-500 ${t1Wins > t2Wins ? 'text-teal-500 drop-shadow-[0_0_30px_rgba(20,184,166,0.4)]' : 'text-white/40'}`}>{t1Wins}</p>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-4">WINS</p>
                                </div>
                                <div className="h-24 w-[1px] bg-white/10"></div>
                                <div className="text-center">
                                    <p className={`text-8xl font-black italic tracking-tighter transition-all duration-500 ${t2Wins > t1Wins ? 'text-teal-500 drop-shadow-[0_0_30px_rgba(20,184,166,0.4)]' : 'text-white/40'}`}>{t2Wins}</p>
                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-4">WINS</p>
                                </div>
                            </div>

                            <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center px-8">
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">TOTAL_MATCHES</p>
                                    <p className="text-2xl font-black italic text-white">{record?.matches || 0}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">WIN_RATIO</p>
                                    <p className="text-2xl font-black italic text-teal-500">
                                        {record?.matches ? ((Math.max(t1Wins, t2Wins) / record.matches) * 100).toFixed(1) : '0.0'}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            }
            case 'player-vs-team': {
                const player = gameData.allPlayers.find(p => p.id === selection1);
                const team = gameData.teams.find(t => t.id === selection2);
                if (!player || !team) return null;

                const record = gameData.records?.playerVsTeam.find(r => r.playerId === player.id && r.vsTeamId === team.id);

                if (!record) {
                    return (
                        <div className="flex flex-col items-center justify-center py-24 opacity-20">
                            <Icons.AlertTriangle className="w-24 h-24 mb-6" />
                            <p className="text-[11px] font-black uppercase tracking-[0.5em]">NO_HISTORICAL_DATA_FOUND</p>
                        </div>
                    );
                }

                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12 pb-24"
                    >
                        <div className="flex items-center justify-center gap-12 mb-16">
                            <div className="text-right">
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{player.name}</h3>
                                <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">ASSET_UNIT</p>
                            </div>
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-teal-500 italic">VS</div>
                            <div className="text-left">
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">{team.name}</h3>
                                <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest">FRANCHISE_UNIT</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Batting vs Team */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-xl">
                                <div className="bg-white/[0.03] p-8 border-b border-white/10 flex items-center gap-4">
                                    <div className="w-2 h-6 bg-teal-500 rounded-full" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-teal-500">BATTING_METRICS</h4>
                                </div>
                                <div className="p-10 grid grid-cols-3 gap-8">
                                    <div className="text-center">
                                        <p className="text-5xl font-black italic tracking-tighter text-white mb-1">{record.runs}</p>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">RUNS</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-5xl font-black italic tracking-tighter text-white mb-1">{record.balls}</p>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">BALLS</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-5xl font-black italic tracking-tighter text-red-500 mb-1">{record.dismissals}</p>
                                        <p className="text-[9px] font-black text-red-500/40 uppercase tracking-widest">OUTS</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bowling vs Team */}
                            <div className="bg-white/[0.02] border border-white/10 rounded-[48px] overflow-hidden backdrop-blur-xl">
                                <div className="bg-white/[0.03] p-8 border-b border-white/10 flex items-center gap-4">
                                    <div className="w-2 h-6 bg-blue-500 rounded-full" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500">BOWLING_METRICS</h4>
                                </div>
                                <div className="p-10 grid grid-cols-3 gap-8">
                                    <div className="text-center">
                                        <p className="text-5xl font-black italic tracking-tighter text-white mb-1">{record.wickets}</p>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">WKTS</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-5xl font-black italic tracking-tighter text-white mb-1">{record.runsConceded}</p>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">RUNS</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-5xl font-black italic tracking-tighter text-teal-500 mb-1">
                                            {record.ballsBowled > 0 ? ((record.runsConceded / record.ballsBowled) * 6).toFixed(2) : '0.00'}
                                        </p>
                                        <p className="text-[9px] font-black text-teal-500/40 uppercase tracking-widest">ECON</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )
            }
            default: return null;
        }
    }

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-10 py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <Icons.Scale className="w-64 h-64" />
                </div>

                <div className="flex justify-between items-start mb-12 relative z-10">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="w-2 h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">COMPARISON_CENTER</h2>
                        </motion.div>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5"
                        >
                            DUAL_ASSET_VALIDATION_v2.6
                        </motion.p>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex bg-white/[0.03] p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl"
                    >
                        <button 
                            onClick={() => handleTypeChange('player-vs-player')} 
                            className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${comparisonType === 'player-vs-player' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            PLAYER_VS_PLAYER
                        </button>
                        <button 
                            onClick={() => handleTypeChange('team-vs-team')} 
                            className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${comparisonType === 'team-vs-team' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            TEAM_VS_TEAM
                        </button>
                        <button 
                            onClick={() => handleTypeChange('player-vs-team')} 
                            className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${comparisonType === 'player-vs-team' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            PLAYER_VS_TEAM
                        </button>
                    </motion.div>
                </div>

                {renderSelectionDropdowns()}

                {comparisonType === 'player-vs-player' && selection1 && selection2 && (
                     <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide relative z-10"
                    >
                        {Object.values(Format).map(f => (
                            <button 
                                key={f} 
                                onClick={() => setPvpFormat(f)} 
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${pvpFormat === f ? 'bg-teal-500 text-black border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </motion.div>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide relative z-10">
                {renderComparisonResult()}
            </div>

            {/* Bottom Info Bar */}
            <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-20 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">ANALYTICS_ENGINE_SYNCHRONIZED</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">SYSTEM_STATUS</p>
                    <p className="text-[11px] font-black text-teal-500 uppercase tracking-widest">DATA_INTEGRITY_VERIFIED</p>
                </div>
            </div>
        </div>
    );
};

export default ComparisonScreen;
