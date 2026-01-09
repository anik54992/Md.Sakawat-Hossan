
import React, { useMemo } from 'react';
import { Subject, StudySession, PlannerTask } from '../types';
import { Clock, CheckCircle2, TrendingUp, Zap } from 'lucide-react';
import { MOTIVATIONAL_QUOTES, getSubjectIcon } from '../constants';

interface DashboardProps {
  subjects: Subject[];
  sessions: StudySession[];
  tasks: PlannerTask[];
}

const Dashboard: React.FC<DashboardProps> = ({ subjects, sessions, tasks }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todaySessions = useMemo(() => 
    sessions.filter(s => s.date === today), 
    [sessions, today]
  );

  const totalTodayMinutes = useMemo(() => 
    todaySessions.reduce((acc, s) => acc + (s.duration / 60), 0),
    [todaySessions]
  );

  const completedTasksCount = useMemo(() => 
    tasks.filter(t => t.date === today && t.completed).length,
    [tasks, today]
  );

  const quote = useMemo(() => 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
    []
  );

  const calculateProgress = (subject: Subject) => {
    if (subject.chapters.length === 0) return 0;
    const total = subject.chapters.reduce((acc, ch) => acc + ch.progress, 0);
    return Math.round(total / subject.chapters.length);
  };

  // Dynamic Streak Calculation
  const currentStreak = useMemo(() => {
    if (sessions.length === 0) return 0;

    // Group total duration by date
    const dailyTotals: Record<string, number> = {};
    sessions.forEach(s => {
      dailyTotals[s.date] = (dailyTotals[s.date] || 0) + s.duration;
    });

    const SIX_HOURS_SECONDS = 6 * 3600;
    let streak = 0;
    let checkDate = new Date();
    
    // Check today first
    const todayStr = checkDate.toISOString().split('T')[0];
    const studiedToday = dailyTotals[todayStr] || 0;

    if (studiedToday >= SIX_HOURS_SECONDS) {
      streak++;
    } else {
      // If today isn't met, the streak is what was achieved up to yesterday
    }

    // Go backwards from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const total = dailyTotals[dateStr] || 0;
      
      if (total >= SIX_HOURS_SECONDS) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // Streak broken
        break;
      }

      // Safety break to prevent infinite loops in edge cases
      if (streak > 3650) break; 
    }

    return streak;
  }, [sessions]);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome Back! 👋</h2>
        <p className="text-slate-500 dark:text-slate-400">Track, Learn, and Achieve your academic goals.</p>
      </header>

      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20">
        <div className="relative z-10 max-w-md">
          <p className="text-indigo-100 text-sm font-medium mb-3 uppercase tracking-wider">Thought of the day</p>
          <h3 className="text-2xl font-semibold leading-tight mb-4">"{quote}"</h3>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium transition-all">
            Share Quote
          </button>
        </div>
        <Zap className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl">
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-3 rounded-2xl w-fit mb-4">
            <Clock size={24} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Study Today</p>
          <h4 className="text-2xl font-bold">{Math.floor(totalTodayMinutes / 60)}h {Math.floor(totalTodayMinutes % 60)}m</h4>
          <div className="mt-4 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${totalTodayMinutes >= 360 ? 'bg-green-500' : 'bg-amber-500'}`} 
              style={{ width: `${Math.min((totalTodayMinutes / (16 * 60)) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Goal: 6h min • 16h max</p>
        </div>

        <div className="glass p-6 rounded-3xl">
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-2xl w-fit mb-4">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Tasks Completed</p>
          <h4 className="text-2xl font-bold">{completedTasksCount} / {tasks.filter(t => t.date === today).length}</h4>
          <p className="text-xs text-slate-400 mt-2">Finish your tasks to earn scores!</p>
        </div>

        <div className="glass p-6 rounded-3xl">
          <div className={`p-3 rounded-2xl w-fit mb-4 ${currentStreak > 0 ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            <TrendingUp size={24} />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Current Streak</p>
          <h4 className="text-2xl font-bold">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</h4>
          <p className="text-xs text-slate-400 mt-2">
            {currentStreak === 0 ? 'Reach 6h today to start!' : 'Consistent study boosts memory.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">Subject Breakdown</h3>
          <div className="space-y-4">
            {subjects.slice(0, 5).map((subject, idx) => {
               const progress = calculateProgress(subject);
               return (
                  <div key={subject.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-indigo-600 opacity-${90 - idx * 10}`}>
                        {getSubjectIcon(subject.name, 20)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{subject.name}</span>
                          <span className="text-xs text-slate-400">{progress}% Progress</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                  </div>
               );
            })}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full mb-6">
            <Zap className="text-indigo-600 dark:text-indigo-400" size={48} />
          </div>
          <h3 className="text-xl font-bold mb-2">Need a study break?</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">AI suggests a 10-minute meditation session based on your current focus levels.</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all">
            Take a Break
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
