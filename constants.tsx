
import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  LayoutDashboard, 
  MessageSquare, 
  PlayCircle, 
  BarChart2,
  PenTool,
  Globe,
  Calculator,
  Leaf,
  FlaskConical,
  Atom,
  Monitor,
  Microscope,
  Dna,
  Languages
} from 'lucide-react';
import { AppMode } from './types';

export const DEFAULT_SUBJECTS = [
  "Bangla 1st paper", "Bangla 2nd paper", "English 1st paper", 
  "English 2nd paper", "Math 1st paper", "Math 2nd paper", 
  "Botany", "Zoology", "Chemistry 1st paper", "Chemistry 2nd paper", 
  "Physics 1st paper", "Physics 2nd paper", "ICT", "Science"
];

export const getSubjectIcon = (name: string, size: number = 20) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('bangla')) return <PenTool size={size} />;
  if (lowerName.includes('english')) return <Languages size={size} />;
  if (lowerName.includes('math')) return <Calculator size={size} />;
  if (lowerName.includes('physics')) return <Atom size={size} />;
  if (lowerName.includes('chemistry')) return <FlaskConical size={size} />;
  if (lowerName.includes('botany')) return <Leaf size={size} />;
  if (lowerName.includes('zoology')) return <Dna size={size} />;
  if (lowerName.includes('ict')) return <Monitor size={size} />;
  if (lowerName.includes('science')) return <Microscope size={size} />;
  return <BookOpen size={size} />;
};

export const EDUCATIONAL_CHANNELS = [
  { name: 'Physics Hunters', id: 'physics-hunters' },
  { name: 'ACS', id: 'acs' },
  { name: 'Brothers Suggestions', id: 'brothers' },
  { name: 'Bondi Pathshala', id: 'bondi' },
  { name: 'Meson', id: 'meson' },
  { name: '10 Minute School', id: '10ms' }
];

export const NAV_ITEMS = [
  { id: 'dashboard' as AppMode, label: 'Home', icon: <LayoutDashboard size={20} /> },
  { id: 'subjects' as AppMode, label: 'Study', icon: <BookOpen size={20} /> },
  { id: 'planner' as AppMode, label: 'Plan', icon: <Calendar size={20} /> },
  { id: 'ai' as AppMode, label: 'AI', icon: <MessageSquare size={20} /> },
  { id: 'videos' as AppMode, label: 'Videos', icon: <PlayCircle size={20} /> },
  { id: 'analytics' as AppMode, label: 'Stats', icon: <BarChart2 size={20} /> },
];

export const MOTIVATIONAL_QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your only limit is your mind.",
  "Don't stop until you're proud.",
  "Study now, be proud later.",
  "The expert in anything was once a beginner.",
  "Believe in yourself and all that you are."
];
