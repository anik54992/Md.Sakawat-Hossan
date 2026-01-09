
import React, { useState } from 'react';
import { Subject, StudySession, Chapter } from '../types';
import { ArrowLeft, BookOpen, Clock, Trash2, Plus, Calendar, CheckCircle2, Zap, Edit3, Check, X, Circle, Timer } from 'lucide-react';

interface SubjectDetailProps {
  subject: Subject;
  sessions: StudySession[];
  onBack: () => void;
  onAddChapter: (subjectId: string, chapterName: string) => void;
  onRemoveChapter: (subjectId: string, chapterId: string) => void;
  onRenameChapter: (subjectId: string, chapterId: string, newName: string) => void;
  onUpdateChapterProgress: (subjectId: string, chapterId: string, progress: number) => void;
}

// Mini Circular Progress Component for Chapter List
const MiniProgressRing: React.FC<{ progress: number; size?: number; stroke?: number }> = ({ progress, size = 40, stroke = 4 }) => {
  const radius = (size / 2) - (stroke / 2);
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          className="text-slate-100 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          strokeLinecap="round"
          className={progress === 100 ? 'text-green-500' : 'text-indigo-600'}
        />
      </svg>
      <span className={`absolute text-[9px] font-black ${progress === 100 ? 'text-green-600' : 'text-slate-600 dark:text-slate-300'}`}>
        {progress}%
      </span>
    </div>
  );
};

const SubjectDetail: React.FC<SubjectDetailProps> = ({ 
  subject, 
  sessions, 
  onBack, 
  onAddChapter, 
  onRemoveChapter,
  onRenameChapter,
  onUpdateChapterProgress
}) => {
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const totalSeconds = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const overallProgress = React.useMemo(() => {
    if (subject.chapters.length === 0) return 0;
    const sum = subject.chapters.reduce((acc, ch) => acc + ch.progress, 0);
    return Math.round(sum / subject.chapters.length);
  }, [subject.chapters]);

  const handleStartEdit = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditName(chapter.name);
  };

  const handleSaveEdit = (chapterId: string) => {
    if (editName.trim()) {
      onRenameChapter(subject.id, chapterId, editName);
    }
    setEditingChapterId(null);
  };

  const getStatusLabel = (progress: number) => {
    if (progress === 100) return 'Mastered';
    if (progress > 50) return 'In Progress';
    if (progress > 0) return 'Just Started';
    return 'Pending';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Subjects
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
              <BookOpen size={28} />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              {subject.name}
            </h2>
          </div>
          <div className="max-w-md">
            <div className="flex justify-between items-center mb-2">
              <p className="text-slate-500 font-medium text-sm">Overall Curriculum Completion</p>
              <span className="text-indigo-600 font-black">{overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="glass px-6 py-4 rounded-3xl flex items-center gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-2 rounded-xl">
              <Timer size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Total Subject Log</p>
              <p className="text-xl font-bold">{totalHours}h</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-2 rounded-xl">
                <BookOpen size={20} />
              </div>
              <h3 className="text-xl font-bold">Curriculum Chapters</h3>
            </div>
            <button 
              onClick={() => {
                const name = prompt('Chapter Name?');
                if (name) onAddChapter(subject.id, name);
              }}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative mb-8 p-6 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl overflow-hidden shadow-xl shadow-indigo-500/20">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em]">Total Study Duration</p>
                  <p className="text-2xl font-black text-white">{formatTime(totalSeconds)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em]">Chapters</p>
                <p className="text-2xl font-black text-white">{subject.chapters.length}</p>
              </div>
            </div>
            <Zap className="absolute -right-8 -bottom-8 w-32 h-32 text-white/5 rotate-12" />
          </div>

          <div className="space-y-6 flex-1">
            {subject.chapters.length === 0 ? (
              <p className="text-slate-400 italic text-center py-10">No chapters added yet.</p>
            ) : (
              subject.chapters.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className={`p-6 rounded-[2.5rem] group transition-all duration-300 border shadow-sm animate-in fade-in slide-in-from-left-2 ${
                    chapter.progress === 100 
                      ? 'bg-green-50/30 dark:bg-green-900/5 border-green-100/50 dark:border-green-900/20' 
                      : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-5 flex-1">
                      {/* Engaging Circular Progress Indicator next to Name */}
                      <div className="relative group/ring cursor-pointer" onClick={() => onUpdateChapterProgress(subject.id, chapter.id, chapter.progress === 100 ? 0 : 100)}>
                         <MiniProgressRing progress={chapter.progress} size={48} stroke={4} />
                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/ring:opacity-100 bg-white/10 backdrop-blur-sm rounded-full transition-opacity">
                            {chapter.progress === 100 ? <Check size={16} className="text-green-600" /> : <Plus size={16} className="text-indigo-600" />}
                         </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {editingChapterId === chapter.id ? (
                          <div className="flex items-center gap-2 animate-in slide-in-from-left-1 duration-200">
                            <input
                              autoFocus
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-white dark:bg-slate-800 border-indigo-500 border-2 rounded-xl px-3 py-1.5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEdit(chapter.id);
                                if (e.key === 'Escape') setEditingChapterId(null);
                              }}
                            />
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleSaveEdit(chapter.id)} className="text-green-500 p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors">
                                <Check size={18}/>
                              </button>
                              <button onClick={() => setEditingChapterId(null)} className="text-slate-400 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X size={18}/>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/title">
                            <span className={`text-lg font-black transition-all duration-300 truncate ${
                              chapter.progress === 100 
                                ? 'text-slate-400 dark:text-slate-500' 
                                : 'text-slate-700 dark:text-slate-100'
                            }`}>
                              {chapter.name}
                            </span>
                            <button 
                              onClick={() => handleStartEdit(chapter)}
                              className="text-slate-300 hover:text-indigo-500 transition-all p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 md:opacity-0 md:group-hover/title:opacity-100"
                              title="Rename Chapter"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors px-2 py-0.5 rounded-full ${
                            chapter.progress === 100 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30' 
                              : chapter.progress > 0 
                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                          }`}>
                            {getStatusLabel(chapter.progress)}
                          </span>
                          {chapter.progress === 100 && (
                            <span className="flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-widest">
                               <CheckCircle2 size={12} /> Mastered
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => onRemoveChapter(subject.id, chapter.id)}
                      className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  {/* Interactive Slider Section */}
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 relative h-4">
                        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                          <div 
                            className={`h-full transition-all duration-1000 ease-out relative ${
                              chapter.progress === 100 
                                ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_12px_rgba(34,197,94,0.4)]' 
                                : 'bg-gradient-to-r from-indigo-500 to-violet-600 shadow-[0_0_12px_rgba(79,70,229,0.3)]'
                            }`}
                            style={{ width: `${chapter.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_infinite_linear]" />
                          </div>
                        </div>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={chapter.progress}
                          onChange={(e) => onUpdateChapterProgress(subject.id, chapter.id, parseInt(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                      </div>
                      <div className="min-w-[40px] text-right">
                        <span className={`text-xs font-black tracking-tighter transition-colors ${
                          chapter.progress === 100 ? 'text-green-600' : 'text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {chapter.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 p-2 rounded-xl">
              <Calendar size={20} />
            </div>
            <h3 className="text-xl font-bold">Recent Activity</h3>
          </div>

          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 italic">No study history yet.</p>
                <p className="text-xs text-slate-400 mt-2">Start the timer to begin logging sessions!</p>
              </div>
            ) : (
              [...sessions].reverse().slice(0, 10).map((session) => {
                const chapter = subject.chapters.find(ch => ch.id === session.chapterId);
                return (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-all hover:translate-x-1 border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {chapter ? `Focused on: ${chapter.name}` : 'General Study'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-indigo-600 dark:text-indigo-400 font-black text-sm">{formatTime(session.duration)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0 0; }
          100% { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
};

export default SubjectDetail;
