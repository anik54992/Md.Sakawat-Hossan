
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Subject, StudySession } from '../types';
import { Play, Pause, Square, Clock, Zap, Target, AlertCircle, ChevronDown, Coffee, Brain, Timer, Settings2, Sliders } from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../constants';

interface StudyTimerProps {
  subjects: Subject[];
  onSessionComplete: (session: Partial<StudySession>) => void;
  todayTotalSeconds: number;
}

type TimerMode = 'stopwatch' | 'pomodoro';
type PomoPhase = 'focus' | 'shortBreak' | 'longBreak';

const StudyTimer: React.FC<StudyTimerProps> = ({ subjects, onSessionComplete, todayTotalSeconds }) => {
  const [timerMode, setTimerMode] = useState<TimerMode>('stopwatch');
  const [pomoPhase, setPomoPhase] = useState<PomoPhase>('focus');
  const [isActive, setIsActive] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0); 
  const [pomoCount, setPomoCount] = useState(0);
  
  // Custom Pomodoro Settings
  const [pomoFocusMinutes, setPomoFocusMinutes] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const POMO_TIMES = useMemo(() => ({
    focus: pomoFocusMinutes * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  }), [pomoFocusMinutes]);

  const selectedSubject = useMemo(() => 
    subjects.find(s => s.id === selectedSubjectId), 
  [subjects, selectedSubjectId]);

  useEffect(() => {
    if (selectedSubject?.chapters && selectedSubject.chapters.length > 0) {
      setSelectedChapterId(selectedSubject.chapters[0].id);
    } else {
      setSelectedChapterId('');
    }
  }, [selectedSubjectId]);

  const MIN_GOAL_SECONDS = 6 * 3600;
  const MAX_LIMIT_SECONDS = 16 * 3600;

  // Handle Mode Switch
  const switchMode = (mode: TimerMode) => {
    if (isActive && !window.confirm('Switching modes will stop your current session. Continue?')) return;
    handleStop();
    setTimerMode(mode);
    if (mode === 'pomodoro') {
      setSessionSeconds(POMO_TIMES.focus);
      setPomoPhase('focus');
    } else {
      setSessionSeconds(0);
    }
  };

  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setSessionSeconds(s => {
          if (timerMode === 'stopwatch') return s + 1;
          
          if (s <= 1) {
            handlePhaseComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timerMode, POMO_TIMES]);

  const handlePhaseComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (pomoPhase === 'focus') {
      onSessionComplete({
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId || undefined,
        startTime: startTimeRef.current || Date.now() - (POMO_TIMES.focus * 1000),
        duration: POMO_TIMES.focus,
        date: new Date().toISOString().split('T')[0]
      });
      
      const nextCount = pomoCount + 1;
      setPomoCount(nextCount);
      
      if (nextCount % 4 === 0) {
        setPomoPhase('longBreak');
        setSessionSeconds(POMO_TIMES.longBreak);
      } else {
        setPomoPhase('shortBreak');
        setSessionSeconds(POMO_TIMES.shortBreak);
      }
      alert('Focus session complete! Time for a break.');
    } else {
      setPomoPhase('focus');
      setSessionSeconds(POMO_TIMES.focus);
      alert('Break over! Ready to focus again?');
    }
  };

  const handleToggle = () => {
    if (!isActive) {
      const now = Date.now();
      if (timerMode === 'stopwatch') {
        startTimeRef.current = now;
      } else {
        if (pomoPhase === 'focus') startTimeRef.current = now;
      }
      setIsActive(true);
      setShowSettings(false);
    } else {
      setIsActive(false);
    }
  };

  const handleStop = () => {
    if (timerMode === 'stopwatch' && sessionSeconds > 0) {
      onSessionComplete({
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId || undefined,
        startTime: startTimeRef.current || Date.now() - (sessionSeconds * 1000),
        duration: sessionSeconds,
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsActive(false);
    setSessionSeconds(timerMode === 'pomodoro' ? POMO_TIMES.focus : 0);
    setPomoPhase('focus');
    startTimeRef.current = null;
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTotalToday = todayTotalSeconds + (timerMode === 'stopwatch' ? sessionSeconds : (pomoPhase === 'focus' && isActive ? (POMO_TIMES.focus - sessionSeconds) : 0));
  const isOverLimit = currentTotalToday > MAX_LIMIT_SECONDS;
  const isGoalMet = currentTotalToday >= MIN_GOAL_SECONDS;

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  
  const ringProgress = useMemo(() => {
    if (timerMode === 'stopwatch') {
      return Math.min((currentTotalToday / MIN_GOAL_SECONDS) * 100, 100);
    } else {
      const totalBlockTime = POMO_TIMES[pomoPhase];
      return ((totalBlockTime - sessionSeconds) / totalBlockTime) * 100;
    }
  }, [sessionSeconds, timerMode, pomoPhase, currentTotalToday, POMO_TIMES]);

  const strokeDashoffset = circumference - (ringProgress / 100) * circumference;

  const quote = useMemo(() => 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)],
    [isActive]
  );

  const handlePomoMinutesChange = (newMins: number) => {
    setPomoFocusMinutes(newMins);
    if (!isActive && timerMode === 'pomodoro' && pomoPhase === 'focus') {
      setSessionSeconds(newMins * 60);
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in duration-700">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[2rem] mb-8 gap-1 border border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => switchMode('stopwatch')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            timerMode === 'stopwatch' 
            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg dark:text-indigo-400' 
            : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Timer size={14} />
          Free Flow
        </button>
        <button 
          onClick={() => switchMode('pomodoro')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
            timerMode === 'pomodoro' 
            ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg dark:text-indigo-400' 
            : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Brain size={14} />
          Pomodoro
        </button>
      </div>

      <div className="glass p-10 rounded-[3.5rem] w-full max-w-2xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-2xl relative overflow-hidden transition-all duration-500">
        <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${isActive ? 'bg-indigo-600' : 'bg-slate-500'}`} />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
             <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-5 py-2 rounded-full shadow-sm text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
              {timerMode === 'pomodoro' ? (
                <span className="flex items-center gap-2">
                  {pomoPhase === 'focus' ? <Zap size={14} className="text-amber-500" /> : <Coffee size={14} className="text-green-500" />}
                  {pomoPhase === 'focus' ? 'Focus Block' : pomoPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Clock size={14} className={isActive ? 'animate-pulse' : ''} />
                  {isActive ? 'Session Active' : 'Ready to Start'}
                </span>
              )}
            </div>
            
            {timerMode === 'pomodoro' && !isActive && (
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-xl transition-all ${showSettings ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-600'}`}
              >
                <Sliders size={18} />
              </button>
            )}
          </div>

          {showSettings && timerMode === 'pomodoro' && (
            <div className="w-full bg-white dark:bg-slate-800 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/30 mb-8 animate-in slide-in-from-top-4 duration-300">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Set Focus Duration</p>
                  <span className="text-indigo-600 font-black text-sm">{pomoFocusMinutes} min</span>
               </div>
               <input 
                  type="range"
                  min="25"
                  max="180"
                  step="5"
                  value={pomoFocusMinutes}
                  onChange={(e) => handlePomoMinutesChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full appearance-none cursor-pointer accent-indigo-600"
               />
               <div className="flex justify-between mt-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  <span>25 min</span>
                  <span>3 hours</span>
               </div>
            </div>
          )}

          <div className="relative mb-10 group">
            <svg className="w-72 h-72 transform -rotate-90 filter drop-shadow-xl">
              <circle
                cx="144"
                cy="144"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="transparent"
                className="text-slate-100 dark:text-slate-800"
              />
              <circle
                cx="144"
                cy="144"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                strokeLinecap="round"
                className={`${
                  timerMode === 'pomodoro' 
                    ? (pomoPhase === 'focus' ? 'text-indigo-600' : 'text-green-500') 
                    : (isGoalMet ? 'text-green-500' : 'text-indigo-600')
                }`}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black tracking-tighter text-slate-800 dark:text-white tabular-nums drop-shadow-sm">
                {formatTime(sessionSeconds)}
              </span>
              <span className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">
                {timerMode === 'pomodoro' ? 'Remaining' : 'Elapsed'}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Focus Subject</label>
                <div className="relative">
                  <select
                    disabled={isActive}
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 appearance-none cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-700 shadow-sm"
                  >
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {selectedSubject && selectedSubject.chapters.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Specific Chapter</label>
                  <div className="relative">
                    <select
                      disabled={isActive}
                      value={selectedChapterId}
                      onChange={(e) => setSelectedChapterId(e.target.value)}
                      className="w-full bg-indigo-50/50 dark:bg-indigo-900/10 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/20 appearance-none cursor-pointer transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-sm"
                    >
                      <option value="">General Study</option>
                      {selectedSubject.chapters.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" size={16} />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-6 pt-4">
              <button
                onClick={handleToggle}
                className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all transform hover:scale-105 active:scale-90 ${
                  isActive 
                  ? 'bg-white text-indigo-600 shadow-2xl dark:bg-slate-800 dark:text-indigo-400' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-500/40'
                }`}
              >
                {isActive ? <Pause size={40} /> : <Play size={40} fill="currentColor" />}
              </button>

              <button
                onClick={handleStop}
                className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all transform hover:scale-105 active:scale-90 shadow-sm border border-slate-200 dark:border-slate-700"
              >
                <Square size={24} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass p-6 rounded-[2rem] flex items-center gap-4 border border-white/50 dark:border-slate-800/50">
          <div className={`p-3 rounded-2xl ${isGoalMet ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20'}`}>
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Today's Total</p>
            <p className="text-xl font-bold">{formatTime(currentTotalToday)}</p>
          </div>
        </div>

        <div className="glass p-6 rounded-[2rem] flex items-center gap-4 border border-white/50 dark:border-slate-800/50">
          <div className={`p-3 rounded-2xl ${isOverLimit ? 'bg-red-100 text-red-600 dark:bg-red-900/20' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'}`}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Daily Status</p>
            <p className="text-xl font-bold">
              {isOverLimit ? 'Limit Reached' : isGoalMet ? 'Goal Met!' : 'Focusing...'}
            </p>
          </div>
        </div>
      </div>

      {timerMode === 'pomodoro' && (
        <div className="mt-6 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                i < (pomoCount % 4) ? 'bg-indigo-600 scale-110' : 'bg-slate-200 dark:bg-slate-800'
              }`} 
            />
          ))}
          <span className="text-[9px] font-black uppercase text-slate-400 ml-2 tracking-widest">Cycle Progress</span>
        </div>
      )}

      <div className="mt-10 max-w-md text-center">
        <p className="text-indigo-600 dark:text-indigo-400 font-bold italic text-lg leading-relaxed animate-pulse">
          "{quote}"
        </p>
      </div>
    </div>
  );
};

export default StudyTimer;
