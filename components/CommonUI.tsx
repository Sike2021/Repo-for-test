
import React from 'react';
import * as Icons from './SharedIcons';

export { Icons };

// --- Shared Styled Components ---
// Fix: children is now optional to prevent TypeScript errors when elements are nested.
export const SlantedContainer = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <div className={`relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 skew-x-[-12deg] bg-current opacity-10" />
        <div className="relative z-10">{children}</div>
    </div>
);

// Fix: children is now optional to prevent TypeScript errors when elements are nested.
export const ActionButton = ({ onClick, children, variant = "primary", className = "" }: { onClick: () => void, children?: React.ReactNode, variant?: "primary" | "secondary" | "danger", className?: string }) => {
    const styles = {
        primary: "bg-pink-600 hover:bg-pink-500 text-white",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200",
        danger: "bg-red-600 hover:bg-red-500 text-white"
    };
    return (
        <button onClick={onClick} className={`${styles[variant]} py-3 px-6 rounded-xl font-black italic tracking-tighter uppercase transition-all active:scale-95 shadow-lg ${className}`}>
            {children}
        </button>
    );
};
