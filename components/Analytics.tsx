
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import { Subject, StudySession, StudyInsights, PlannerTask, StudyGoals } from '../types';
import { getStudyInsights } from '../services/gemini';
import { Brain, Trophy, AlertTriangle, Lightbulb, Download, Share2, FileText, Star, Award, Target, CheckCircle2, Flame, CalendarDays, TrendingUp, Settings2, Save } from 'lucide-react';

interface AnalyticsProps {
  subjects: Subject[];
  sessions: StudySession[];
  tasks: PlannerTask[];
  goals: StudyGoals;
  setGoals: (goals: StudyGoals) => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ subjects, sessions, tasks, goals, setGoals }) => {
  const [insights, setInsights] = useState<StudyInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  
  // Local state for editing goals before saving
  const [tempGoals, setTempGoals] = useState<StudyGoals>(goals);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setTempGoals(goals);
  }, [goals]);

  // Calculate stats for different periods
  const stats = useMemo(() => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    const todaySessions = sessions.filter(s => s.date === today);
    const todayHrs = todaySessions.reduce((acc, s) => acc + s.duration, 0) / 3600;

    const sevenDaysAgo = new Date(now.getTime() - 7 * oneDay).toISOString().split('T')[0];
    const weeklySessions = sessions.filter(s => s.date >= sevenDaysAgo);
    const weeklyHrs = weeklySessions.reduce((acc, s) => acc + s.duration, 0) / 3600;

    const thirtyDaysAgo = new Date(now.getTime() - 30 * oneDay).toISOString().split('T')[0];
    const monthlySessions = sessions.filter(s => s.date >= thirtyDaysAgo);
    const monthlyHrs = monthlySessions.reduce((acc, s) => acc + s.duration, 0) / 3600;

    return { todayHrs, weeklyHrs, monthlyHrs };
  }, [sessions, today]);

  // Daily Stats for Grade Calculation
  const todayStats = useMemo(() => {
    const hours = stats.todayHrs;
    const todayTasks = tasks.filter(t => t.date === today);
    const completedTasks = todayTasks.filter(t => t.completed).length;
    const taskRate = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0;

    let grade = 'F';
    if (hours >= 12 && taskRate >= 90) grade = 'A+';
    else if (hours >= 8 && taskRate >= 70) grade = 'A';
    else if (hours >= 6 && taskRate >= 50) grade = 'B';
    else if (hours >= 4) grade = 'C';
    else if (hours > 0) grade = 'D';

    return { hours, taskRate, completedTasks, totalTasks: todayTasks.length, grade };
  }, [stats.todayHrs, tasks, today]);

  // Group study time by subject
  const subjectTimeData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    sessions.forEach(s => {
      const sub = subjects.find(sub => sub.id === s.subjectId);
      if (sub) {
        dataMap[sub.name] = (dataMap[sub.name] || 0) + (s.duration / 3600);
      }
    });
    return Object.entries(dataMap).map(([name, hours]) => ({ name, hours: parseFloat(hours.toFixed(1)) }));
  }, [sessions, subjects]);

  // Daily totals for last 7 days
  const dailyStudyData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    last7Days.forEach(date => {
      dataMap[date] = 0;
    });

    sessions.forEach(s => {
      if (dataMap[s.date] !== undefined) {
        dataMap[s.date] += (s.duration / 3600);
      }
    });

    return Object.entries(dataMap).map(([date, hours]) => ({
      date: date.split('-').slice(1).join('/'),
      hours: parseFloat(hours.toFixed(1))
    }));
  }, [sessions]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (sessions.length > 0) {
        setLoading(true);
        const data = await getStudyInsights(subjectTimeData);
        if (data) setInsights(data);
        setLoading(false);
      }
    };
    fetchInsights();
  }, [subjectTimeData]);

  const handleSaveGoals = () => {
    setGoals(tempGoals);
    setShowGoalSettings(false);
  };

  const downloadReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportContent = `
      <html>
        <head>
          <title>Edu Booster BD - Academic Report Card</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .date { font-size: 14px; color: #64748b; margin-top: 5px; }
            .stats-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
            .stat-card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
            .stat-value { font-size: 20px; font-weight: bold; margin-top: 5px; }
            .grade-box { text-align: center; background: #4f46e5; color: white; padding: 30px; border-radius: 20px; margin-bottom: 40px; }
            .grade-value { font-size: 64px; font-weight: 900; }
            .subjects-list { border-collapse: collapse; width: 100%; margin-bottom: 40px; }
            .subjects-list th, .subjects-list td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 60px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Edu Booster BD - Daily Achievement Report</div>
            <div class="date">Report Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div class="grade-box">
            <div class="grade-value">${todayStats.grade}</div>
            <div style="text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Overall Academic Grade</div>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Study Time</div>
              <div class="stat-value">${todayStats.hours.toFixed(1)} Hours</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Task Completion Rate</div>
              <div class="stat-value">${todayStats.taskRate.toFixed(0)}% (${todayStats.completedTasks}/${todayStats.totalTasks})</div>
            </div>
          </div>
          <h3>Subject Breakdown (Cumulative)</h3>
          <table class="subjects-list">
            <thead>
              <tr><th>Subject Name</th><th>Total Hours Studied</th></tr>
            </thead>
            <tbody>
              ${subjectTimeData.map(d => `<tr><td>${d.name}</td><td>${d.hours}h</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="footer">
            Generated by Edu Booster BD AI Companion • Keep Learning, Keep Achieving.
          </div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
  };

  const getStatus = (current: number, goal: number) => {
    const percent = (current / goal) * 100;
    if (percent >= 100) return { label: 'Goal Met', color: 'text-green-500 bg-green-500/10' };
    if (percent >= 70) return { label: 'On Track', color: 'text-indigo-500 bg-indigo-500/10' };
    if (percent >= 30) return { label: 'Grinding', color: 'text-amber-500 bg-amber-500/10' };
    return { label: 'Starting', color: 'text-slate-400 bg-slate-400/10' };
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-1">Study Analytics</h2>
          <p className="text-slate-500 font-medium">Your personalized academic growth dashboard.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadReport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Download size={18} />
            Download Report
          </button>
          <button 
            onClick={() => setShowGoalSettings(!showGoalSettings)}
            className={`p-3 rounded-2xl font-bold transition-all ${showGoalSettings ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <Settings2 size={20} />
          </button>
        </div>
      </header>

      {/* Goal Settings Modal-ish Inline */}
      {showGoalSettings && (
        <div className="glass p-8 rounded-[2rem] border-2 border-indigo-500/20 animate-in slide-in-from-top-4 duration-300 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Target size={24} className="text-indigo-600" />
              Adjust Personal Study Goals
            </h3>
            <button 
              onClick={handleSaveGoals}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Save size={18} />
              Save Goals
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Daily Focus Target (Hours)</label>
              <input 
                type="number" 
                value={tempGoals.daily} 
                onChange={(e) => setTempGoals({...tempGoals, daily: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 italic">Recommended: 6-12 hours per day</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Weekly Focus Target (Hours)</label>
              <input 
                type="number" 
                value={tempGoals.weekly} 
                onChange={(e) => setTempGoals({...tempGoals, weekly: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 italic">Recommended: 40-70 hours per week</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Monthly Focus Target (Hours)</label>
              <input 
                type="number" 
                value={tempGoals.monthly} 
                onChange={(e) => setTempGoals({...tempGoals, monthly: Number(e.target.value)})}
                className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400 italic">Recommended: 150-300 hours per month</p>
            </div>
          </div>
        </div>
      )}

      {/* Goal Achievement Center - Requested Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[
          { label: 'Daily Goal', current: stats.todayHrs, goal: goals.daily, icon: <Flame size={20}/>, period: 'Today' },
          { label: 'Weekly Goal', current: stats.weeklyHrs, goal: goals.weekly, icon: <CalendarDays size={20}/>, period: '7 Days' },
          { label: 'Monthly Goal', current: stats.monthlyHrs, goal: goals.monthly, icon: <TrendingUp size={20}/>, period: '30 Days' }
        ].map((g, i) => {
          const status = getStatus(g.current, g.goal);
          const percent = Math.min((g.current / g.goal) * 100, 100);
          return (
            <div key={i} className="glass p-6 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${status.color.replace('text-', 'bg-').split(' ')[0]} text-white shadow-lg`}>
                  {g.icon}
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                  {status.label}
                </div>
              </div>
              
              <div className="space-y-1 mb-6">
                <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{g.label}</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black">{g.current.toFixed(1)}</span>
                  <span className="text-slate-400 font-bold text-sm">/ {g.goal}h</span>
                </div>
              </div>

              <div className="relative h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                  style={{ width: `${percent}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[shimmer_2s_infinite_linear]" />
                </div>
              </div>
              <div className="mt-3 flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                <span>{percent.toFixed(0)}% Achieved</span>
                <span>{g.period}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Daily Report Card - High End UI */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div className="relative glass p-8 rounded-[2.5rem] border border-white/50 dark:border-slate-800/50 shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Grade Section */}
            <div className="flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-10 rounded-[2rem] min-w-[200px] shadow-xl relative overflow-hidden">
              <Star className="absolute -top-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-indigo-100">Daily Grade</p>
              <h1 className="text-7xl font-black mb-2">{todayStats.grade}</h1>
              <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {todayStats.grade === 'A+' ? 'Excellent' : todayStats.grade === 'A' ? 'Great Work' : 'Keep Growing'}
              </div>
            </div>

            {/* Metrics Section */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-indigo-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today's Focus</span>
                  </div>
                  <h4 className="text-2xl font-black">{todayStats.hours.toFixed(1)}h</h4>
                  <p className="text-xs text-slate-500 mt-1">Study time today</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Completion</span>
                  </div>
                  <h4 className="text-2xl font-black">{todayStats.taskRate.toFixed(0)}%</h4>
                  <p className="text-xs text-slate-500 mt-1">{todayStats.completedTasks}/{todayStats.totalTasks} tasks finished</p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Distribution</span>
                  <Award size={16} className="text-amber-500" />
                </div>
                <div className="space-y-3">
                  {subjectTimeData.filter(s => sessions.some(sess => sess.date === today && subjects.find(sub => sub.id === sess.subjectId)?.name === s.name)).slice(0, 3).map((sub, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span>{sub.name}</span>
                        <span>{sub.hours}h</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${Math.min((sub.hours / 6) * 100, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                  {subjectTimeData.length === 0 && <p className="text-slate-400 italic text-sm py-4">No subjects logged today yet.</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Report ID: EB-${Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Generated by Edu Booster AI Companion</p>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="glass p-8 rounded-3xl border-l-4 border-indigo-600 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-3 rounded-2xl">
            <Brain size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl">Teacher's AI Remarks</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Personalized learning insights</p>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                    <Lightbulb size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Recommended Focus</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{insights?.recommendation || "Maintain a consistent study schedule of at least 6 hours daily to ensure your current streak builds strong long-term memory pathways."}"
                  </p>
               </div>
               
               <div className="flex flex-wrap gap-3">
                  {insights?.strongSubjects.map((s, i) => (
                    <div key={i} className="bg-green-50 dark:bg-green-900/20 text-green-600 px-4 py-2 rounded-xl text-xs font-bold border border-green-100 dark:border-green-900/30 flex items-center gap-2">
                      <Star size={12} fill="currentColor" /> {s}
                    </div>
                  ))}
                  {insights?.weakSubjects.map((s, i) => (
                    <div key={i} className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 px-4 py-2 rounded-xl text-xs font-bold border border-amber-100 dark:border-amber-900/30 flex items-center gap-2">
                      <AlertTriangle size={12} /> {s}
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="bg-indigo-600 text-white p-8 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group">
               <FileText className="text-white/20 absolute top-2 right-2 rotate-12 group-hover:scale-110 transition-transform" size={64} />
               <h4 className="font-black mb-2">Export Data</h4>
               <p className="text-xs text-indigo-100 mb-6">Need your monthly progress for parents or teachers?</p>
               <button 
                onClick={downloadReport}
                className="w-full bg-white text-indigo-600 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
               >
                 Detailed PDF
               </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Breakdown Chart */}
        <div className="glass p-8 rounded-3xl h-[450px] shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Subject Weightage</h3>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumulative Hours</div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={subjectTimeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 700 }} 
                cursor={{ fill: 'rgba(79, 70, 229, 0.05)' }}
              />
              <Bar dataKey="hours" fill="#4f46e5" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Progress Chart */}
        <div className="glass p-8 rounded-3xl h-[450px] shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Weekly Consistency</h3>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hours per Day</div>
          </div>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={dailyStudyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)', fontWeight: 700 }} />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="#8b5cf6" 
                strokeWidth={6} 
                dot={{ r: 8, fill: '#8b5cf6', strokeWidth: 0 }}
                activeDot={{ r: 10, strokeWidth: 0, fill: '#4f46e5' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Analytics;
