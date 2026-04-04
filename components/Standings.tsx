
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameData, Format, Standing, Match } from '../types';
import { Category, getFormatsForCategory, resolveMatch } from '../utils';
import { CategoryTabs, FormatDropdown } from './SharedUI';
import { Icons } from './Icons';

interface StandingsProps {
    gameData: GameData;
}

const StandingRow: React.FC<{ standing: Standing; index: number; isFirstClass: boolean }> = ({ standing, index, isFirstClass }) => (
    <motion.tr 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`border-b border-white/5 transition-all duration-500 hover:bg-teal-500/10 group ${index < 4 ? 'bg-teal-500/[0.03]' : ''}`}
    >
        <td className="p-1.5 md:p-6">
            <div className="flex items-center gap-1.5 md:gap-6">
                <span className={`text-[6px] md:text-[10px] font-black w-4 h-4 md:w-8 md:h-8 flex items-center justify-center rounded-sm md:rounded-xl transition-all duration-500 ${index < 4 ? 'bg-teal-500 text-black shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
                    {(index + 1).toString().padStart(2, '0')}
                </span>
                <span className="font-black text-[10px] md:text-xl uppercase italic tracking-tighter group-hover:text-teal-500 transition-colors text-white truncate max-w-[60px] md:max-w-none">
                    {standing.teamName}
                </span>
            </div>
        </td>
        <td className="p-1.5 md:p-6 text-center font-mono text-[7px] md:text-sm font-black text-white/20 group-hover:text-white/40 transition-colors">{standing.played}</td>
        <td className="p-1.5 md:p-6 text-center font-mono text-[7px] md:text-sm font-black text-teal-500">{standing.won}</td>
        <td className="p-1.5 md:p-6 text-center font-mono text-[7px] md:text-sm font-black text-red-500">{standing.lost}</td>
        {isFirstClass && <td className="p-1.5 md:p-6 text-center font-mono text-[7px] md:text-sm font-black text-white/20">{standing.drawn}</td>}
        <td className="p-1.5 md:p-6 text-center">
            <span className="font-black text-xs md:text-3xl italic tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                {standing.points}
            </span>
        </td>
        <td className="p-1.5 md:p-6 text-center font-mono text-[6px] md:text-xs font-black text-white/20">
            {standing.netRunRate > 0 ? `+${standing.netRunRate.toFixed(2)}` : standing.netRunRate.toFixed(2)}
        </td>
    </motion.tr>
);

const FixtureItem: React.FC<{ match: Match; resolved: Match; result?: any; index: number }> = ({ match, resolved, result, index }) => (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        className={`p-3 md:p-8 rounded-[16px] md:rounded-[48px] border transition-all duration-500 relative overflow-hidden group ${result ? 'bg-white/[0.04] border-teal-500/30 shadow-2xl' : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.06] hover:border-teal-500/40 shadow-xl'}`}
    >
        {result && (
            <div className="absolute top-0 right-0 bg-teal-500 text-black px-2 md:px-6 py-0.5 md:py-1 text-[5px] md:text-[9px] font-black uppercase tracking-widest rounded-bl-md md:rounded-bl-[24px] shadow-lg">
                FINAL_RESULT
            </div>
        )}
        
        <div className="absolute top-0 left-0 p-3 md:p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
            <Icons.Calendar className="w-10 h-10 md:w-24 md:h-24" />
        </div>

        <div className="flex justify-between items-center text-[6px] md:text-[10px] mb-3 md:mb-8 text-white/20 uppercase tracking-[0.4em] font-black relative z-10">
            <span className="bg-white/5 px-1.5 md:px-4 py-0.5 md:py-1 rounded-full border border-white/10 text-white/40">MATCH_0{match.matchNumber}</span>
            <span className="group-hover:text-teal-500 transition-colors">{match.date}</span>
        </div>

        <div className="flex items-center justify-between gap-1.5 md:gap-10 relative z-10">
            <div className="flex-1 text-right overflow-hidden">
                <p className="text-xs md:text-2xl font-black italic tracking-tighter uppercase text-white group-hover:text-teal-500 transition-colors leading-none mb-0.5 md:mb-2 truncate">{resolved.teamA}</p>
                <p className="text-[5px] md:text-[9px] font-black text-white/10 uppercase tracking-widest">HOME_ASSET</p>
            </div>
            
            <div className="flex flex-col items-center gap-0.5 md:gap-3">
                <div className="w-5 h-5 md:w-12 md:h-12 rounded-md md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[6px] md:text-[11px] font-black text-teal-500 italic shadow-inner group-hover:border-teal-500/30 transition-colors">VS</div>
                <div className="h-3 md:h-10 w-[1px] bg-gradient-to-b from-white/10 to-transparent"></div>
            </div>

            <div className="flex-1 text-left overflow-hidden">
                <p className="text-xs md:text-2xl font-black italic tracking-tighter uppercase text-white group-hover:text-teal-500 transition-colors leading-none mb-0.5 md:mb-2 truncate">{resolved.teamB}</p>
                <p className="text-[5px] md:text-[9px] font-black text-white/10 uppercase tracking-widest">AWAY_ASSET</p>
            </div>
        </div>

        {result && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 md:mt-8 pt-3 md:pt-8 border-t border-white/5 text-center"
            >
                <p className="text-[8px] md:text-sm text-teal-500 font-black italic uppercase tracking-tight drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                    {result.summary}
                </p>
            </motion.div>
        )}
    </motion.div>
);

const Standings: React.FC<StandingsProps> = ({ gameData }) => {
    const [category, setCategory] = useState<Category>('T20');
    const [selectedFormat, setSelectedFormat] = useState<Format>(gameData.currentFormat);
    const [view, setView] = useState<'standings' | 'fixtures'>('standings');

    const formats = useMemo(() => getFormatsForCategory(category), [category]);

    useEffect(() => {
        if (!formats.includes(selectedFormat)) {
            setTimeout(() => setSelectedFormat(formats[0]), 0);
        }
    }, [formats, selectedFormat]);

    const standings = gameData.standings[selectedFormat] || [];
    const schedule = gameData.schedule[selectedFormat] || [];
    const isFirstClass = selectedFormat === Format.SHIELD;

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-500/5 blur-[100px] md:blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/5 blur-[100px] md:blur-[160px] rounded-full" />
            </div>

            <header className="px-3 py-4 md:px-10 md:py-12 border-b border-white/5 relative overflow-hidden bg-[#050808]/40 backdrop-blur-3xl z-10">
                <div className="absolute top-0 right-0 p-4 md:p-12 opacity-[0.02] pointer-events-none">
                    <Icons.Trophy className="w-16 h-16 md:w-64 md:h-64" />
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-3 md:gap-12 mb-3 md:mb-12 relative z-10">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-2"
                        >
                            <div className="w-1 md:w-2 h-4 md:h-8 bg-teal-500 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.5)]" />
                            <h2 className="text-lg md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">LEAGUE_STANDINGS</h2>
                        </motion.div>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-[6px] md:text-[11px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] ml-3 md:ml-5"
                        >
                            SEASON_0{gameData.currentSeason}_DATABASE
                        </motion.p>
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex bg-white/[0.03] p-0.5 md:p-1 rounded-lg md:rounded-[24px] border border-white/10 backdrop-blur-xl w-full md:w-auto"
                    >
                        <button 
                            onClick={() => setView('standings')} 
                            className={`flex-1 md:px-10 py-1.5 md:py-4 rounded-md md:rounded-[18px] text-[6px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${view === 'standings' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            TABLE_DNA
                        </button>
                        <button 
                            onClick={() => setView('fixtures')} 
                            className={`flex-1 md:px-10 py-1.5 md:py-4 rounded-md md:rounded-[18px] text-[6px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${view === 'fixtures' ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                        >
                            FIXTURE_FEED
                        </button>
                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 md:gap-8 relative z-10">
                    <div className="flex-1">
                        <CategoryTabs category={category} setCategory={setCategory} />
                    </div>
                    <div className="w-full md:w-64">
                        <FormatDropdown category={category} selectedFormat={selectedFormat} setSelectedFormat={setSelectedFormat} />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-3 md:p-10 scrollbar-hide relative z-10">
                <AnimatePresence mode="wait">
                    {view === 'standings' ? (
                        <motion.div 
                            key="standings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white/[0.01] border border-white/10 rounded-[16px] md:rounded-[48px] overflow-hidden shadow-2xl backdrop-blur-xl overflow-x-auto"
                        >
                            <table className="w-full text-left min-w-[320px] md:min-w-full">
                                <thead className="bg-white/[0.03] border-b border-white/10">
                                    <tr>
                                        <th className="p-1.5 md:p-8 font-black text-[6px] md:text-[10px] uppercase tracking-[0.4em] text-teal-500">FRANCHISE_IDENTITY</th>
                                        <th className="p-1.5 md:p-8 text-center font-black text-[6px] md:text-[10px] uppercase tracking-[0.4em] text-white/20">P</th>
                                        <th className="p-1.5 md:p-8 text-center font-black text-[6px] md:text-[10px] uppercase tracking-[0.4em] text-teal-500">W</th>
                                        <th className="p-1.5 md:p-8 text-center font-black text-[6px] md:text-[10px] uppercase tracking-[0.4em] text-red-500">L</th>
                                        {isFirstClass && <th className="p-1.5 md:p-8 text-center font-black text-[6px] md:text-[10px] uppercase tracking-[0.4em] text-white/20">D</th>}
                                        <th className="p-1.5 md:p-8 text-center font-black text-[6px] md:text-[10px] uppercase tracking-[0.4em] text-white">POINTS</th>
                                        <th className="p-1.5 md:p-8 text-center font-black text-[6px] md:text-[10px] uppercase tracking-[0.4em] text-white/20">NRR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((s, index) => (
                                        <StandingRow key={s.teamId} standing={s} index={index} isFirstClass={isFirstClass} />
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="fixtures"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 pb-12"
                        >
                            {schedule.map((match, index) => (
                                <FixtureItem 
                                    key={`${selectedFormat}-fixture-${index}`}
                                    match={match}
                                    resolved={resolveMatch(match, gameData, selectedFormat)}
                                    result={gameData.matchResults[selectedFormat]?.find(r => r.matchNumber === match.matchNumber)}
                                    index={index}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Info Bar */}
            <div className="px-4 py-3 md:px-10 md:py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center relative z-20 backdrop-blur-3xl">
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-1.5 h-1.5 md:w-3 md:h-3 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                    <p className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-white/40">LIVE_DATA_STREAM</p>
                </div>
                <div className="text-right">
                    <p className="text-[6px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-0 md:mb-1">SYSTEM_STATUS</p>
                    <p className="text-[8px] md:text-[11px] font-black text-teal-500 uppercase tracking-widest">VERIFIED</p>
                </div>
            </div>
        </div>
    );
};

export default Standings;
