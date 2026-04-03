import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchResult, Inning } from '../types';
import { Icons } from './Icons';

interface ScorecardDisplayProps {
    inning: Inning;
    inningNumber: number;
}

const ScorecardDisplay: React.FC<ScorecardDisplayProps> = ({ inning, inningNumber }) => {
    const getBallsFromOvers = (overs: string) => {
        const parts = overs.split('.');
        return (parseInt(parts[0], 10) * 6) + (parseInt(parts[1] || '0', 10));
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-white/[0.02] border border-white/10 rounded-[48px] overflow-hidden shadow-2xl backdrop-blur-3xl"
        >
            <div className="flex justify-between items-center bg-white/[0.03] p-8 border-b border-white/10">
                <div>
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        {inning.teamName}
                    </h3>
                    <p className="text-[10px] font-mono font-black text-teal-500 uppercase tracking-[0.3em] mt-1">
                        {inningNumber <= 2 ? `${inningNumber === 1 ? 'FIRST' : 'SECOND'}` : `${inningNumber === 3 ? 'THIRD' : 'FOURTH'}`}_INNINGS_DATA
                    </p>
                </div>
                <div className="text-right">
                    <p className="font-black text-5xl italic tracking-tighter text-teal-500 drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]">
                        {inning.score}/{inning.wickets}
                    </p>
                    <p className="text-[11px] font-mono font-black text-white/20 uppercase tracking-widest mt-1">({inning.overs} OVERS_COMPLETED)</p>
                </div>
            </div>

            <div className="p-8 space-y-12">
                {/* Batting Table */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30">BATTING_PERFORMANCE_MATRIX</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left font-black uppercase tracking-widest text-[9px] py-4 text-white/20">BATTER_ID</th>
                                    <th className="text-left font-black uppercase tracking-widest text-[9px] py-4 text-white/20">STATUS_LOG</th>
                                    <th className="text-right font-black uppercase tracking-widest text-[9px] py-4 text-white/20">RUNS</th>
                                    <th className="text-right font-black uppercase tracking-widest text-[9px] py-4 text-white/20">BALLS</th>
                                    <th className="text-right font-black uppercase tracking-widest text-[9px] py-4 text-teal-500">SR_INDEX</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {inning.batting.map((p, idx) => {
                                    const hasBatted = p.isOut || p.runs > 0 || p.balls > 0;
                                    if (!hasBatted) return null;

                                    return (
                                        <tr key={p.playerId} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-5">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-mono text-white/10 w-6">{(idx + 1).toString().padStart(2, '0')}</span>
                                                    <span className="font-black italic uppercase tracking-tighter text-lg text-white group-hover:text-teal-500 transition-colors">{p.playerName}</span>
                                                </div>
                                            </td>
                                            <td className="text-white/40 italic text-[11px] font-medium uppercase tracking-tight">{p.dismissalText}</td>
                                            <td className="text-right font-black text-xl italic text-white">{p.runs}</td>
                                            <td className="text-right text-white/20 font-mono text-sm">{p.balls}</td>
                                            <td className="text-right text-teal-500 font-mono font-black text-sm">{p.balls > 0 ? ((p.runs / p.balls) * 100).toFixed(1) : '0.0'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bowling Table */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30">BOWLING_EFFICIENCY_INDEX</h4>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="text-left font-black uppercase tracking-widest text-[9px] py-4 text-white/20">BOWLER_ID</th>
                                    <th className="text-right font-black uppercase tracking-widest text-[9px] py-4 text-white/20">OVERS</th>
                                    <th className="text-right font-black uppercase tracking-widest text-[9px] py-4 text-white/20">MAIDENS</th>
                                    <th className="text-right font-black uppercase tracking-widest text-[9px] py-4 text-white/20">RUNS</th>
                                    <th className="text-right font-black uppercase tracking-widest text-[9px] py-4 text-red-500">WKTS</th>
                                    <th className="text-right font-black uppercase tracking-widest text-[9px] py-4 text-blue-500">ECON</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {inning.bowling.filter(p => p.ballsBowled > 0).map(p => (
                                    <tr key={p.playerId} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-5 font-black italic uppercase tracking-tighter text-lg text-white group-hover:text-blue-500 transition-colors">{p.playerName}</td>
                                        <td className="text-right font-mono text-sm text-white">{p.overs}</td>
                                        <td className="text-right text-white/20 font-mono text-sm">{p.maidens}</td>
                                        <td className="text-right text-white/20 font-mono text-sm">{p.runsConceded}</td>
                                        <td className="text-right font-black text-xl italic text-red-500">{p.wickets}</td>
                                        <td className="text-right text-blue-500 font-mono font-black text-sm">{getBallsFromOvers(p.overs) > 0 ? ((p.runsConceded / getBallsFromOvers(p.overs)) * 6).toFixed(2) : "0.00"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fall of Wickets */}
                {inning.fallOfWickets && inning.fallOfWickets.length > 0 && (
                    <div className="pt-8 border-t border-white/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/30">FALL_OF_WICKETS_TIMELINE</h4>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {inning.fallOfWickets.map((fow, i) => (
                                <div key={i} className="bg-white/[0.03] px-4 py-2 rounded-[16px] border border-white/10 text-[10px] group hover:border-red-500/30 transition-all">
                                    <span className="font-black text-white group-hover:text-red-500 transition-colors">{fow.score}-{fow.wicket}</span>
                                    <span className="text-white/20 ml-2 font-mono uppercase tracking-widest">({fow.player} @ {fow.over} OV)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

interface MatchResultScreenProps {
    result: MatchResult | null;
    onBack: () => void;
    userTeamId: string;
}

const MatchResultScreen: React.FC<MatchResultScreenProps> = ({ result, onBack, userTeamId }) => {
    const [view, setView] = useState<'summary' | 'scorecard'>('summary');
    
    if (!result) return (
        <div className="h-full flex flex-col items-center justify-center bg-[#050808] text-white/20 p-10">
            <Icons.Activity size={64} className="mb-8 opacity-10" />
            <p className="font-black text-[11px] uppercase tracking-[0.5em]">NO_RESULT_DATA_FOUND</p>
            <button onClick={onBack} className="mt-10 px-10 py-4 bg-white/5 border border-white/10 rounded-full text-white/40 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all">RETURN_TO_HUB</button>
        </div>
    );

    const { firstInning, secondInning, thirdInning, fourthInning, summary, manOfTheMatch } = result;

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-10 py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <Icons.Trophy className="w-64 h-64" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="w-2 h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">MATCH_REPORT</h2>
                        </motion.div>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5"
                        >
                            POST_MATCH_ANALYTICS_STABLE
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex bg-white/[0.03] p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl"
                    >
                        <button 
                            onClick={() => setView('summary')} 
                            className={`px-10 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${view === 'summary' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            SUMMARY_DNA
                        </button>
                        <button 
                            onClick={() => setView('scorecard')} 
                            className={`px-10 py-4 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${view === 'scorecard' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            FULL_SCORECARD
                        </button>
                    </motion.div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 p-8 bg-teal-500 text-black rounded-[32px] shadow-[0_20px_40px_rgba(20,184,166,0.2)] relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Icons.Activity size={80} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-2">{summary}</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center">
                                <Icons.Trophy size={20} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest">
                                MVP: <span className="underline decoration-2 underline-offset-4">{manOfTheMatch.playerName}</span> // {manOfTheMatch.summary}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 scrollbar-hide relative z-10">
                <AnimatePresence mode="wait">
                    {view === 'summary' ? (
                        <motion.div 
                            key="summary"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {[firstInning, secondInning, thirdInning, fourthInning].filter(Boolean).map((inning, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white/[0.02] border border-white/10 rounded-[48px] p-10 shadow-2xl backdrop-blur-3xl group hover:bg-white/[0.04] transition-all duration-500"
                                >
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h3 className={`text-3xl font-black italic uppercase tracking-tighter ${inning!.teamId === userTeamId ? 'text-teal-500' : 'text-white'} group-hover:scale-105 transition-transform origin-left`}>
                                                {inning!.teamName}
                                            </h3>
                                            <p className="text-[10px] font-mono font-black text-white/20 uppercase tracking-[0.4em] mt-2">INNINGS_0{idx + 1}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl font-black italic tracking-tighter text-white">
                                                {inning!.score}<span className="text-white/20 mx-1">/</span>{inning!.wickets}
                                            </p>
                                            <p className="text-[11px] font-mono font-black text-teal-500/40 uppercase tracking-widest mt-1">({inning!.overs} OV)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-2">TOP_BATTERS</p>
                                            {inning!.batting.sort((a,b) => b.runs - a.runs).slice(0,2).map(b => (
                                                <div key={b.playerId} className="flex justify-between items-center group/item">
                                                    <span className="text-sm font-black italic uppercase tracking-tight text-white/60 group-hover/item:text-white transition-colors">{b.playerName}</span>
                                                    <span className="text-lg font-black italic text-teal-500">{b.runs}<span className="text-[10px] text-white/20 ml-1">({b.balls})</span></span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] border-b border-white/5 pb-2">TOP_BOWLER</p>
                                            {inning!.bowling.sort((a,b) => b.wickets - a.wickets).slice(0,1).map(b => (
                                                <div key={b.playerId} className="flex justify-between items-center group/item">
                                                    <span className="text-sm font-black italic uppercase tracking-tight text-white/60 group-hover/item:text-white transition-colors">{b.playerName}</span>
                                                    <span className="text-lg font-black italic text-blue-500">{b.wickets}<span className="text-[10px] text-white/20 ml-1">/ {b.runsConceded}</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="scorecard"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-12 pb-12"
                        >
                            <ScorecardDisplay inning={firstInning} inningNumber={1} />
                            {secondInning && <ScorecardDisplay inning={secondInning} inningNumber={2} />}
                            {thirdInning && <ScorecardDisplay inning={thirdInning} inningNumber={3} />}
                            {fourthInning && <ScorecardDisplay inning={fourthInning} inningNumber={4} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Action Bar */}
            <div className="px-10 py-8 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-20 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">REPORT_GENERATION_COMPLETE // READY_FOR_ARCHIVE</p>
                </div>
                <button 
                    onClick={onBack} 
                    className="px-12 py-4 bg-white text-black rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-teal-500 hover:text-white transition-all duration-500 shadow-2xl flex items-center gap-4 group"
                >
                    CONTINUE_TO_HUB
                    <Icons.ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default MatchResultScreen;
