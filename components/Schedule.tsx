
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameData, Team, MatchResult, Format, Match } from '../types';
import { Category, getFormatsForCategory, resolveMatch } from '../utils';
import { CategoryTabs, FormatDropdown } from './SharedUI';
import { Icons } from './Icons';

interface ScheduleProps {
    gameData: GameData;
    userTeam: Team | null;
    viewMatchResult: (result: MatchResult) => void;
}

const MatchItem: React.FC<{
    match: Match;
    resolved: Match;
    result?: MatchResult;
    isUserMatch: boolean;
    isNextMatch: boolean;
    userTeamName?: string;
    onViewResult: (result: MatchResult) => void;
    index: number;
}> = ({ match, resolved, result, isUserMatch, isNextMatch, userTeamName, onViewResult, index }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.04)' }}
        className={`relative p-8 rounded-[40px] border transition-all duration-500 group overflow-hidden backdrop-blur-xl ${
            result 
                ? 'bg-white/[0.02] border-white/10' 
                : isNextMatch 
                    ? 'bg-teal-500/5 border-teal-500/30 shadow-[0_0_40px_rgba(20,184,166,0.1)]' 
                    : 'bg-white/[0.01] border-white/5 opacity-60'
        }`}
    >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
            <Icons.Activity className="w-32 h-32" />
        </div>

        <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${isNextMatch ? 'bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-white/20'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">MATCH_{match.matchNumber}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                <Icons.Calendar size={12} className="text-teal-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{match.date}</span>
            </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-8 relative z-10">
            <div className="flex-1 text-right">
                <h4 className={`text-2xl md:text-3xl font-black italic uppercase tracking-tighter transition-colors ${isUserMatch && resolved.teamA === userTeamName ? 'text-teal-500' : 'text-white'}`}>
                    {resolved.teamA}
                </h4>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">HOME_SIDE</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-[10px] font-black text-white/20 italic">VS</span>
                </div>
                <div className="w-[1px] h-8 bg-gradient-to-b from-white/10 to-transparent" />
            </div>

            <div className="flex-1 text-left">
                <h4 className={`text-2xl md:text-3xl font-black italic uppercase tracking-tighter transition-colors ${isUserMatch && resolved.teamB === userTeamName ? 'text-teal-500' : 'text-white'}`}>
                    {resolved.teamB}
                </h4>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">AWAY_SIDE</p>
            </div>
        </div>

        <AnimatePresence>
            {result && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-8 border-t border-white/5 relative z-10"
                >
                    <div className="bg-teal-500/5 border border-teal-500/10 rounded-[24px] p-6 mb-6">
                        <p className="text-sm font-black italic uppercase tracking-tight text-teal-400 text-center leading-relaxed">
                            {result.summary}
                        </p>
                    </div>
                    <button 
                        onClick={() => onViewResult(result)}
                        className="w-full py-5 bg-white text-black rounded-[24px] font-black uppercase italic tracking-[0.2em] text-[11px] hover:bg-teal-500 hover:text-white transition-all duration-500 shadow-xl flex items-center justify-center gap-4 group/btn"
                    >
                        <Icons.Trophy size={16} className="group-hover/btn:scale-110 transition-transform" />
                        VIEW_FULL_SCORECARD
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        {isNextMatch && !result && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 px-8 py-2 bg-teal-500 rounded-t-[16px] shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                <span className="text-[9px] font-black text-black uppercase tracking-[0.3em]">UPCOMING_ENGAGEMENT</span>
            </div>
        )}
    </motion.div>
);

const Schedule: React.FC<ScheduleProps> = ({ gameData, userTeam, viewMatchResult }) => {
    const [category, setCategory] = useState<Category>('T20');
    const [selectedFormatState, setSelectedFormatState] = useState<Format>(gameData.currentFormat);
    
    const formats = useMemo(() => getFormatsForCategory(category), [category]);
    const selectedFormat = useMemo(() => {
        if (formats.includes(selectedFormatState)) return selectedFormatState;
        return formats[0];
    }, [formats, selectedFormatState]);

    const schedule = gameData.schedule[selectedFormat] || [];
    const nextMatchIndex = gameData.currentMatchIndex[selectedFormat];

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-10 py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none">
                    <Icons.Calendar className="w-64 h-64" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="w-2 h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                            <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white">SEASON_SCHEDULE</h2>
                        </motion.div>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-5"
                        >
                            TOURNAMENT_TIMELINE_v2.6
                        </motion.p>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <CategoryTabs category={category} setCategory={setCategory} />
                        <FormatDropdown category={category} selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormatState} />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide relative z-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    {nextMatchIndex < schedule.length && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-teal-500 text-black p-10 rounded-[48px] shadow-[0_40px_80px_rgba(20,184,166,0.2)] relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Icons.Activity size={120} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-black animate-ping" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-60">IMMEDIATE_ENGAGEMENT</span>
                                </div>
                                
                                <div className="flex items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                            {resolveMatch(schedule[nextMatchIndex], gameData, selectedFormat).teamA}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">HOME_SIDE</p>
                                    </div>
                                    <div className="text-2xl font-black italic opacity-20">VS</div>
                                    <div className="flex-1 text-right">
                                        <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                            {resolveMatch(schedule[nextMatchIndex], gameData, selectedFormat).teamB}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">AWAY_SIDE</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-6">
                        {schedule.map((match, index) => {
                            const resolved = resolveMatch(match, gameData, selectedFormat);
                            const result = gameData.matchResults[selectedFormat]?.find(r => r && String(r.matchNumber) === String(match.matchNumber));
                            const isUserMatch = !!userTeam && (resolved.teamA === userTeam.name || resolved.teamB === userTeam.name);
                            const isNextMatch = selectedFormat === gameData.currentFormat && index === nextMatchIndex;
                            
                            return (
                                <MatchItem 
                                    key={`${selectedFormat}-${match.matchNumber}-${index}`}
                                    match={match}
                                    resolved={resolved}
                                    result={result}
                                    isUserMatch={isUserMatch}
                                    isNextMatch={isNextMatch}
                                    userTeamName={userTeam?.name}
                                    onViewResult={viewMatchResult}
                                    index={index}
                                />
                            );
                        })}
                        
                        {schedule.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-32 text-white/20">
                                <div className="w-24 h-24 bg-white/[0.02] rounded-[40px] flex items-center justify-center mb-8 border border-white/10">
                                    <Icons.Calendar size={48} className="text-white/10" />
                                </div>
                                <p className="font-black text-[11px] uppercase tracking-[0.5em]">NO_MATCHES_SCHEDULED</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-20 backdrop-blur-3xl">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">CALENDAR_SYNC_STABLE // REAL_TIME_UPDATES_ACTIVE</p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">DATA_INTEGRITY</p>
                    <p className="text-[11px] font-black text-teal-500 uppercase tracking-widest">VERIFIED_v2.6</p>
                </div>
            </div>
        </div>
    );
};

export default Schedule;
