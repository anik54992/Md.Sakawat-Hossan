
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Subject, 
  StudySession, 
  PlannerTask, 
  AppMode,
  Chapter,
  StudyGoals
} from './types';
import { DEFAULT_SUBJECTS, getSubjectIcon } from './constants';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import StudyTimer from './components/StudyTimer';
import AIAssistant from './components/AIAssistant';
import Analytics from './components/Analytics';
import VideoLibrary from './components/VideoLibrary';
import SubjectDetail from './components/SubjectDetail';
import { Plus, Trash2, Edit3, CheckCircle2, Circle, Clock, Target, ChevronRight, BookOpen, Check, X } from 'lucide-react';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [currentMode, setCurrentMode] = useState<AppMode>('dashboard');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  
  // Data State
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const stored = localStorage.getItem('eb_subjects');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        chapters: s.chapters.map((ch: any) => 
          typeof ch === 'string' ? { id: Math.random().toString(36).substr(2, 9), name: ch, progress: 0 } : ch
        )
      }));
    }
    return DEFAULT_SUBJECTS.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name,
      chapters: Array.from({ length: 15 }, (_, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: `Chapter ${i + 1}`,
        progress: 0
      }))
    }));
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const stored = localStorage.getItem('eb_sessions');
    return stored ? JSON.parse(stored) : [];
  });

  const [tasks, setTasks] = useState<PlannerTask[]>(() => {
    const stored = localStorage.getItem('eb_tasks');
    return stored ? JSON.parse(stored) : [];
  });

  const [goals, setGoals] = useState<StudyGoals>(() => {
    const stored = localStorage.getItem('eb_goals');
    return stored ? JSON.parse(stored) : { daily: 10, weekly: 70, monthly: 300 };
  });

  // Derived State
  const todayDate = new Date().toISOString().split('T')[0];
  const todayTotalSeconds = useMemo(() => {
    return sessions
      .filter(s => s.date === todayDate)
      .reduce((acc, s) => acc + s.duration, 0);
  }, [sessions, todayDate]);

  // Persist State
  useEffect(() => {
    localStorage.setItem('eb_subjects', JSON.stringify(subjects));
    localStorage.setItem('eb_sessions', JSON.stringify(sessions));
    localStorage.setItem('eb_tasks', JSON.stringify(tasks));
    localStorage.setItem('eb_goals', JSON.stringify(goals));
  }, [subjects, sessions, tasks, goals]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Actions
  const addSubject = (name: string) => {
    setSubjects(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name,
      chapters: []
    }]);
  };

  const deleteSubject = (id: string) => {
    if (window.confirm('Are you sure you want to remove this subject?')) {
      setSubjects(prev => prev.filter(s => s.id !== id));
      if (selectedSubjectId === id) setSelectedSubjectId(null);
    }
  };

  const renameSubject = (id: string, newName: string) => {
    if (newName.trim()) {
      setSubjects(prev => prev.map(s => s.id === id ? { ...s, name: newName } : s));
    }
    setEditingSubjectId(null);
  };

  const addChapter = (subjectId: string, chapterName: string) => {
    const newChapter: Chapter = {
      id: Math.random().toString(36).substr(2, 9),
      name: chapterName,
      progress: 0
    };
    setSubjects(prev => prev.map(s => 
      s.id === subjectId ? { ...s, chapters: [...s.chapters, newChapter] } : s
    ));
  };

  const removeChapter = (subjectId: string, chapterId: string) => {
    if (window.confirm('Delete this chapter?')) {
      setSubjects(prev => prev.map(s => 
        s.id === subjectId ? { ...s, chapters: s.chapters.filter(ch => ch.id !== chapterId) } : s
      ));
    }
  };

  const renameChapter = (subjectId: string, chapterId: string, newName: string) => {
    setSubjects(prev => prev.map(s => 
      s.id === subjectId ? { 
        ...s, 
        chapters: s.chapters.map(ch => ch.id === chapterId ? { ...ch, name: newName } : ch) 
      } : s
    ));
  };

  const updateChapterProgress = (subjectId: string, chapterId: string, progress: number) => {
    setSubjects(prev => prev.map(s => 
      s.id === subjectId ? { 
        ...s, 
        chapters: s.chapters.map(ch => ch.id === chapterId ? { ...ch, progress } : ch) 
      } : s
    ));
  };

  const addSession = (sessionData: Partial<StudySession>) => {
    const newSession: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      subjectId: sessionData.subjectId!,
      chapterId: sessionData.chapterId,
      startTime: sessionData.startTime!,
      duration: sessionData.duration!,
      date: sessionData.date!,
    };
    setSessions(prev => [...prev, newSession]);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const addTask = (title: string, time: string) => {
    const newTask: PlannerTask = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      time,
      date: new Date().toISOString().split('T')[0],
      completed: false,
      score: 10
    };
    setTasks(prev => [...prev, newTask]);
  };

  const calculateSubjectHours = (subjectId: string) => {
    const seconds = sessions
      .filter(s => s.subjectId === subjectId)
      .reduce((acc, s) => acc + s.duration, 0);
    return parseFloat((seconds / 3600).toFixed(1));
  };

  const calculateSubjectProgress = (subject: Subject) => {
    if (subject.chapters.length === 0) return 0;
    const totalProgress = subject.chapters.reduce((acc, ch) => acc + ch.progress, 0);
    return totalProgress / subject.chapters.length;
  };

  const handleStartEditingSubject = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation();
    setEditingSubjectId(subject.id);
    setEditSubjectName(subject.name);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar 
        currentMode={currentMode} 
        setMode={(mode) => {
          setCurrentMode(mode);
          setSelectedSubjectId(null);
          setEditingSubjectId(null);
        }} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
        {currentMode === 'dashboard' && (
          <Dashboard subjects={subjects} sessions={sessions} tasks={tasks} />
        )}

        {currentMode === 'subjects' && !selectedSubjectId && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Focus Zone</h2>
                <p className="text-slate-400 text-sm font-medium">Manage your subjects and start focusing.</p>
              </div>
              <button 
                onClick={() => {
                  const name = prompt('Subject name?');
                  if (name) addSubject(name);
                }}
                className="bg-indigo-600 text-white px-6 py-2 rounded-2xl flex items-center gap-2 font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
              >
                <Plus size={20} /> Add Subject
              </button>
            </header>

            <div className="mt-4">
              <StudyTimer 
                subjects={subjects} 
                onSessionComplete={addSession} 
                todayTotalSeconds={todayTotalSeconds} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-10 border-t border-slate-200 dark:border-slate-800">
              <div className="col-span-full">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Target size={20} className="text-indigo-600" />
                  Your Study Curriculum
                </h3>
              </div>
              {subjects.map(subject => {
                const hours = calculateSubjectHours(subject.id);
                const progress = calculateSubjectProgress(subject);
                const isEditing = editingSubjectId === subject.id;
                
                return (
                  <div key={subject.id} className="glass p-6 rounded-3xl group relative overflow-hidden transition-all hover:shadow-xl hover:translate-y-[-4px]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl">
                        {getSubjectIcon(subject.name, 20)}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => handleStartEditingSubject(e, subject)}
                          className="text-slate-300 hover:text-indigo-600 transition-colors"
                          title="Rename Subject"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSubject(subject.id);
                          }}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                          title="Remove Subject"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mb-2 animate-in slide-in-from-left-2 duration-200">
                        <input
                          autoFocus
                          type="text"
                          value={editSubjectName}
                          onChange={(e) => setEditSubjectName(e.target.value)}
                          className="flex-1 bg-white dark:bg-slate-800 border-2 border-indigo-500 rounded-xl px-3 py-1 text-sm font-bold focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') renameSubject(subject.id, editSubjectName);
                            if (e.key === 'Escape') setEditingSubjectId(null);
                          }}
                        />
                        <button 
                          onClick={() => renameSubject(subject.id, editSubjectName)}
                          className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => setEditingSubjectId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-xl font-bold mb-1 truncate">{subject.name}</h4>
                    )}

                    <p className="text-xs text-slate-500 mb-4">{subject.chapters.length} Chapters • {hours}h Logged</p>
                    
                    <div className="mb-6">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1.5">
                        <span>Curriculum Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => setSelectedSubjectId(subject.id)}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      View Details
                      <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {currentMode === 'subjects' && selectedSubjectId && (
          <SubjectDetail 
            subject={subjects.find(s => s.id === selectedSubjectId)!}
            sessions={sessions.filter(s => s.subjectId === selectedSubjectId)}
            onBack={() => setSelectedSubjectId(null)}
            onAddChapter={addChapter}
            onRemoveChapter={removeChapter}
            onRenameChapter={renameChapter}
            onUpdateChapterProgress={updateChapterProgress}
          />
        )}

        {currentMode === 'planner' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Daily Planner</h2>
                <p className="text-slate-500">Plan your day and earn scores for consistency.</p>
              </div>
              <button 
                onClick={() => {
                  const title = prompt('Task title?');
                  const time = prompt('Time? (e.g. 10:00 AM)');
                  if (title && time) addTask(title, time);
                }}
                className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all"
              >
                <Plus size={24} />
              </button>
            </header>

            <div className="glass rounded-[2.5rem] p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                  <Clock size={20} />
                </div>
                <h3 className="text-xl font-bold">Schedule for Today</h3>
              </div>

              <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 italic">No tasks planned yet. Add one to start tracking!</div>
                ) : (
                  tasks.filter(t => t.date === new Date().toISOString().split('T')[0]).map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                        task.completed 
                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30 shadow-inner' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {task.completed ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-slate-300" size={24} />}
                        <div>
                          <p className={`font-bold ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{task.time}</p>
                        </div>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full">
                        +{task.score} Score
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {currentMode === 'ai' && <AIAssistant />}
        
        {currentMode === 'videos' && <VideoLibrary />}

        {currentMode === 'analytics' && (
          <Analytics 
            subjects={subjects} 
            sessions={sessions} 
            tasks={tasks} 
            goals={goals}
            setGoals={setGoals}
          />
        )}
      </main>

      <BottomNav currentMode={currentMode} setMode={setCurrentMode} />
    </div>
  );
};

export default App;
