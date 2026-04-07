
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GALLERY_PLAYERS } from '../data';
import { AVATAR_SEEDS } from '../src/constants';
import { PlayerAvatar } from './PlayerAvatar';
import { Player } from '../types';
import { Check, Image as ImageIcon, User, Palette, Globe } from 'lucide-react';

interface AvatarSelectorProps {
    selectedSeed?: string;
    selectedUrl?: string;
    onSelect: (seed: string, isGallery: boolean, isUrl: boolean, galleryPlayer?: Player) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ selectedSeed, selectedUrl, onSelect }) => {
    const [tab, setTab] = useState<'gallery' | 'dicebear' | 'url'>('gallery');
    const [urlInput, setUrlInput] = useState('');

    return (
        <div className="space-y-6">
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                {[
                    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                    { id: 'dicebear', label: 'System', icon: User },
                    { id: 'url', label: 'URL', icon: Globe }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === t.id ? 'bg-emerald-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <t.icon size={12} />
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tab === 'gallery' && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                        {GALLERY_PLAYERS.map((gp) => (
                            <button
                                key={gp.id}
                                onClick={() => onSelect(gp.avatarSeed || gp.name, true, false, gp)}
                                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${selectedSeed === (gp.avatarSeed || gp.name) ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <PlayerAvatar player={gp} size="xl" className="border-none shadow-none" />
                                {selectedSeed === (gp.avatarSeed || gp.name) && (
                                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                        <div className="bg-emerald-500 text-black p-1 rounded-full">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 py-1 text-[8px] font-black uppercase text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {gp.name}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {tab === 'dicebear' && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                        {AVATAR_SEEDS.map((seed) => (
                            <button
                                key={seed}
                                onClick={() => onSelect(seed, false, false)}
                                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all group ${selectedSeed === seed ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-slate-800 hover:border-slate-600'}`}
                            >
                                <img 
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                                    alt={seed}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                                {selectedSeed === seed && (
                                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                                        <div className="bg-emerald-500 text-black p-1 rounded-full">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {tab === 'url' && (
                    <div className="space-y-6 p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Image URL</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://example.com/image.png"
                                    className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                                />
                                <button 
                                    onClick={() => onSelect(urlInput, false, true)}
                                    className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/5"></span>
                            </div>
                            <div className="relative flex justify-center text-[8px] uppercase font-black">
                                <span className="bg-slate-900 px-2 text-slate-600 tracking-widest italic">Or Upload Local Image</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local File</label>
                            <input 
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            const base64 = reader.result as string;
                                            setUrlInput(base64);
                                            onSelect(base64, false, true);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white outline-none focus:border-emerald-500 file:bg-emerald-500 file:border-none file:rounded file:px-2 file:py-1 file:mr-2 file:text-[10px] file:font-black file:uppercase file:cursor-pointer"
                            />
                        </div>

                        {selectedUrl && (
                            <div className="flex flex-col items-center gap-2 pt-2 border-t border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest italic">Current Custom Avatar</p>
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                    <img src={selectedUrl} alt="Custom URL" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarSelector;
