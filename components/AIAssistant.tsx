
import React, { useState, useRef, useEffect } from 'react';
import { askStudyQuestion } from '../services/gemini';
import { Send, Bot, User, Loader2, Sparkles, Trash2, BookOpen, Target, Lightbulb, Zap } from 'lucide-react';

const SMART_CHIPS = [
  { icon: <Target size={14}/>, label: 'Exam Strategy', prompt: 'Provide a 7-day intensive study strategy for my HSC subjects.' },
  { icon: <BookOpen size={14}/>, label: 'Summarize Progress', prompt: 'Summarize my study achievements based on my chapters and subjects.' },
  { icon: <Lightbulb size={14}/>, label: 'Difficult Topic', prompt: 'Choose a difficult topic from HSC Physics or Chemistry and explain it simply.' },
  { icon: <Zap size={14}/>, label: 'Daily Quiz', prompt: 'Ask me 3 challenging MCQs from ICT or Biology.' }
];

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>(() => {
    const stored = localStorage.getItem('eb_chat_history');
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem('eb_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    const aiResponse = await askStudyQuestion(textToSend);
    setMessages(prev => [...prev, { role: 'ai' as const, text: aiResponse }]);
    setLoading(false);
  };

  const clearHistory = () => {
    if (window.confirm('Clear your conversation with the AI?')) {
      setMessages([]);
      localStorage.removeItem('eb_chat_history');
    }
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-all relative">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2.5 rounded-2xl text-white shadow-xl shadow-indigo-500/30">
              <Bot size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white tracking-tight">AI Study Companion</h3>
            <div className="flex items-center gap-1.5">
              <Sparkles size={10} className="text-indigo-600 animate-pulse" />
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">High Performance Mode</p>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button 
            onClick={clearHistory}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth bg-slate-50/30 dark:bg-slate-950/30">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-in fade-in duration-1000">
            <div className="relative">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full flex items-center justify-center">
                <Bot size={48} className="text-indigo-600" />
              </div>
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
            </div>
            <div className="max-w-xs">
              <h4 className="text-xl font-black mb-2 tracking-tight">How can I help you today?</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Ask about specific HSC/SSC topics, exam strategies, or for a motivational boost.</p>
            </div>
          </div>
        )}

        {/* Smart Chips - Proactive Tutoring */}
        {messages.length === 0 && (
          <div className="grid grid-cols-2 gap-3 px-4">
            {SMART_CHIPS.map((chip, i) => (
              <button 
                key={i}
                onClick={() => handleSend(chip.prompt)}
                className="flex items-center gap-2 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group hover:shadow-lg"
              >
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                  {chip.icon}
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{chip.label}</span>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 animate-in slide-in-from-bottom-4 duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
              msg.role === 'user' 
                ? 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400' 
                : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
            }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            <div className={`max-w-[85%] rounded-[2rem] p-5 text-sm leading-relaxed shadow-sm transition-all relative ${
              msg.role === 'user' 
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-none border border-slate-100 dark:border-slate-700' 
                : 'bg-indigo-600 text-white rounded-tl-none font-medium'
            }`}>
              {formatMessage(msg.text)}
              {msg.role === 'ai' && (
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Sparkles size={16} />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg">
              <Bot size={20} />
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] p-6 flex items-center gap-4 border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
              </div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Tutor is generating...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-4 max-w-4xl mx-auto"
        >
          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message your Study Companion..."
              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-3xl px-8 py-5 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner"
            />
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-gradient-to-tr from-indigo-600 to-violet-600 hover:shadow-indigo-500/40 disabled:opacity-30 disabled:grayscale text-white px-8 rounded-3xl transition-all shadow-xl active:scale-95 flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
           <span>Smart Tutoring Active</span>
           <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
           <span>Powered by Google Gemini 3 Pro</span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
