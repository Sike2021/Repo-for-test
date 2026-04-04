
import React from 'react';
import { motion } from 'motion/react';
import { MatchResult } from '../types';
import { Icons } from './Icons';

interface ForwardResultsScreenProps {
    results: MatchResult[];
    onBack: () => void;
    userTeamId: string;
    onViewResult: (result: MatchResult) => void;
}

const ForwardResultsScreen: React.FC<ForwardResultsScreenProps> = ({ results, onBack, onViewResult }) => {
    return (
        <div className="p-4 h-[calc(100vh-90px)] flex flex-col bg-[#050808]">
            <div className="mb-6">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">SIMULATED</h2>
                <p className="text-[10px] font-mono font-black text-teal-500 uppercase tracking-[0.4em] mt-2">MATCH_RESULTS_BATCH</p>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                {results.map((result, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white/[0.03] p-5 rounded-[24px] border border-white/5 shadow-2xl backdrop-blur-xl group hover:bg-white/[0.06] transition-all"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex flex-col">
                                <p className="text-xs font-black text-white italic uppercase tracking-tight group-hover:text-teal-500 transition-colors">
                                    {result.firstInning.teamName} <span className="text-white/20 font-normal italic lowercase mx-1">vs</span> {result.secondInning.teamName}
                                </p>
                                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1">MATCH_ID: {result.matchNumber}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                                <Icons.Activity className="w-3.5 h-3.5" />
                            </div>
                        </div>
                        
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 mb-4">
                            <p className="text-[10px] font-bold text-teal-500 italic leading-relaxed">{result.summary}</p>
                        </div>

                        <button 
                            onClick={() => onViewResult(result)}
                            className="w-full bg-white text-black hover:bg-teal-500 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            VIEW SCORECARD
                            <Icons.ChevronRight className="w-3 h-3" />
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
                <button 
                    onClick={onBack} 
                    className="w-full bg-teal-500 text-black hover:bg-teal-600 font-black uppercase italic tracking-widest py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(20,184,166,0.3)] flex items-center justify-center gap-3"
                >
                    CONTINUE TO DASHBOARD
                    <Icons.ArrowRight className="w-[18px] h-[18px]" />
                </button>
            </div>
        </div>
    );
};

export default ForwardResultsScreen;
