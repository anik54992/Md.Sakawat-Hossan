
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { AppMode } from '../types';

interface BottomNavProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentMode, setMode }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-slate-200 dark:border-slate-800 px-2 py-3 z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              currentMode === item.id
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
