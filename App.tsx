import React, { useState, useEffect } from 'react';
import { Subject, AppState, ViewMode, StudentProfile } from './types';
import { SubjectModule } from './components/SubjectModule';
import { FlashcardTool, PlannerTool } from './components/Tools';
import { ChatBot } from './components/ChatBot';
import { ExamPrep } from './components/ExamPrep';
import { GradeTracker } from './components/GradeTracker';
import { 
  Home, Brain, ClipboardList, MessageCircle, BarChart3, 
  Sparkles, Settings, LogIn, Layout, BookOpen, Clock, 
  Star, ChevronRight, Calculator, PenTool, Globe, Code, Menu, X
} from 'lucide-react';
import { ThemeProvider, useTheme, ThemeSettings } from './components/ThemeContext';
import { TiltCard } from './components/TiltCard';

const INITIAL_STATE: AppState = {
  currentView: 'dashboard',
  activeSubject: null,
  savedLessons: [],
  flashcards: [],
  tasks: [],
  reminders: [],
  chatSessions: [],
  activeChatSessionId: null,
  studentProfile: { 
      name: '',
      targetUniversity: '',
      targetMajor: '',
      targetScore: '',
      strengths: '',
      weaknesses: '',
      learningStyle: ''
  },
  gradeRecord: {},
  studyStats: {
      streakDays: 0,
      lastLoginDate: '',
      totalStudyMinutes: 0
  }
};

const AppContent: React.FC = () => {
  const { theme, mode, toggleMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  // Robust LocalStorage Hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem('glassy_v3_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setState(prev => ({ 
            ...prev, 
            ...parsed,
            // Đảm bảo các trường quan trọng không bị null/undefined
            studentProfile: { ...INITIAL_STATE.studentProfile, ...parsed.studentProfile },
            studyStats: { ...INITIAL_STATE.studyStats, ...parsed.studyStats }
          }));
        }
      }
    } catch (e) {
      console.error("LocalStorage Parse Error:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('glassy_v3_data', JSON.stringify(state));
    } catch (e) {
      console.warn("Storage Full", e);
    }
  }, [state]);

  const navigateTo = (view: ViewMode, subject: Subject | null = null) => {
    setState(prev => ({ ...prev, currentView: view, activeSubject: subject }));
    setIsSidebarOpen(false);
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'dashboard': return <DashboardView state={state} onNavigate={navigateTo} />;
      case 'subject': return (
        <SubjectModule 
          subject={state.activeSubject!} 
          profile={state.studentProfile} 
          onBack={() => navigateTo('dashboard')}
          onSaveLesson={(lesson) => setState(prev => ({ ...prev, savedLessons: [lesson, ...prev.savedLessons] }))}
          savedLessons={state.savedLessons}
        />
      );
      case 'flashcards': return (
        <FlashcardTool 
          cards={state.flashcards} 
          setCards={(val) => setState(prev => ({...prev, flashcards: typeof val === 'function' ? val(prev.flashcards) : val}))}
        />
      );
      case 'planner': return (
        <PlannerTool 
          tasks={state.tasks} 
          setTasks={(val) => setState(prev => ({...prev, tasks: typeof val === 'function' ? val(prev.tasks) : val}))}
          reminders={state.reminders}
          setReminders={(val) => setState(prev => ({...prev, reminders: typeof val === 'function' ? val(prev.reminders) : val}))}
        />
      );
      case 'chatbot': return (
        <ChatBot 
          sessions={state.chatSessions}
          activeSessionId={state.activeChatSessionId}
          profile={state.studentProfile}
          onSessionChange={(id) => setState(prev => ({ ...prev, activeChatSessionId: id }))}
          onNewSession={() => {
            const newId = Date.now().toString();
            setState(prev => ({
              ...prev,
              chatSessions: [{ id: newId, title: 'Chat mới', messages: [], date: new Date().toLocaleDateString() }, ...prev.chatSessions],
              activeChatSessionId: newId
            }));
          }}
          onDeleteSession={(id) => setState(prev => ({ ...prev, chatSessions: prev.chatSessions.filter(s => s.id !== id) }))}
          onUpdateSession={(id, msgs) => setState(prev => ({ ...prev, chatSessions: prev.chatSessions.map(s => s.id === id ? { ...s, messages: msgs } : s) }))}
        />
      );
      case 'exam_prep': return <ExamPrep profile={state.studentProfile} />;
      case 'grade_tracker': return (
        <GradeTracker 
          grades={state.gradeRecord} 
          profile={state.studentProfile} 
          onUpdateGrades={(g) => setState(prev => ({ ...prev, gradeRecord: g }))} 
        />
      );
      default: return <DashboardView state={state} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className={`min-h-screen flex transition-all duration-700 ${theme.isDark ? 'bg-slate-950 text-slate-100' : 'bg-blue-50 text-slate-800'}`}>
      {/* Background Blobs */}
      <div className="liquid-blob top-[-10%] left-[-10%] bg-blue-600/30"></div>
      <div className="liquid-blob bottom-[-10%] right-[-10%] bg-pink-600/20" style={{ animationDelay: '-5s' }}></div>
      <div className="liquid-blob top-[40%] left-[20%] bg-cyan-600/10 w-[400px] h-[400px]" style={{ animationDelay: '-2s' }}></div>

      {/* Sidebar - Liquid Glass Style */}
      <aside className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-500 ease-spring liquid-glass m-4 rounded-[2.5rem] flex flex-col p-6 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-10">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${theme.primary} flex items-center justify-center text-white shadow-xl`}>
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">AI Study</h1>
            <p className="text-[10px] uppercase font-bold text-pink-500 tracking-widest">Personalized</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<Home size={20}/>} label="Trang chủ" active={state.currentView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
          <SidebarLink icon={<Layout size={20}/>} label="Lộ trình" active={state.currentView === 'planner'} onClick={() => navigateTo('planner')} />
          <SidebarLink icon={<ClipboardList size={20}/>} label="Luyện thi" active={state.currentView === 'exam_prep'} onClick={() => navigateTo('exam_prep')} />
          <SidebarLink icon={<Brain size={20}/>} label="Ghi nhớ" active={state.currentView === 'flashcards'} onClick={() => navigateTo('flashcards')} />
          <SidebarLink icon={<MessageCircle size={20}/>} label="Hỏi đáp AI" active={state.currentView === 'chatbot'} onClick={() => navigateTo('chatbot')} />
          <SidebarLink icon={<BarChart3 size={20}/>} label="Điểm số" active={state.currentView === 'grade_tracker'} onClick={() => navigateTo('grade_tracker')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <button onClick={toggleMode} className="w-full btn-glass p-3 rounded-2xl flex items-center gap-3 font-bold text-sm">
            {mode === 'dark' ? '☀️ Sáng' : '🌙 Tối'}
          </button>
          <ThemeSettings />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-6 md:p-10 relative overflow-x-hidden no-scrollbar">
        <header className="flex justify-between items-center mb-8 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="btn-glass p-2 rounded-xl">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
             <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${theme.primary}`}></div>
             <span className="font-bold">AI Assistant</span>
          </div>
        </header>

        <div className="page-transition">
          {renderView()}
        </div>
      </main>

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"></div>}
    </div>
  );
};

const SidebarLink: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 ${active ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg shadow-pink-500/20 font-bold` : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
    >
      <span className={active ? 'scale-110' : ''}>{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
};

const DashboardView: React.FC<{ state: AppState, onNavigate: (v: ViewMode, s?: Subject) => void }> = ({ state, onNavigate }) => {
  const { theme } = useTheme();
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-3">Chào buổi sáng, {state.studentProfile.name || 'Bạn'} 👋</h2>
          <p className="text-slate-400 font-medium">Bạn đã học được {state.studyStats.totalStudyMinutes} phút trong tuần này.</p>
        </div>
        <button className="btn-glass px-6 py-3 rounded-2xl font-bold flex items-center gap-2 text-pink-500">
          <Star size={18} fill="currentColor"/> Điểm cao: {state.studentProfile.targetScore || 'Chưa đặt'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SubjectCard sub={Subject.MATH} icon={<Calculator size={32}/>} color="from-blue-500 to-indigo-600" onClick={() => onNavigate('subject', Subject.MATH)} />
        <SubjectCard sub={Subject.LITERATURE} icon={<PenTool size={32}/>} color="from-pink-500 to-rose-600" onClick={() => onNavigate('subject', Subject.LITERATURE)} />
        <SubjectCard sub={Subject.ENGLISH} icon={<Globe size={32}/>} color="from-cyan-500 to-teal-600" onClick={() => onNavigate('subject', Subject.ENGLISH)} />
        <SubjectCard sub={Subject.INFORMATICS} icon={<Code size={32}/>} color="from-violet-500 to-purple-600" onClick={() => onNavigate('subject', Subject.INFORMATICS)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <TiltCard className="xl:col-span-2 liquid-glass p-8 rounded-[3rem]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3"><Clock className="text-pink-500"/> Hoạt động học tập</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="w-full bg-white/5 rounded-t-2xl relative overflow-hidden h-full">
                  <div className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${theme.primary} rounded-t-2xl transition-all duration-1000 group-hover:brightness-125`} style={{ height: `${h}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-slate-500">T{i+2}</span>
              </div>
            ))}
          </div>
        </TiltCard>

        <div className="space-y-6">
          <TiltCard className="liquid-glass p-6 rounded-[2.5rem] border-pink-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-500 flex items-center justify-center"><BookOpen size={20}/></div>
              <h4 className="font-bold">Bài học đã lưu</h4>
            </div>
            <div className="space-y-3">
              {state.savedLessons.slice(0, 3).map(l => (
                <div key={l.id} className="p-3 bg-white/5 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                  <span className="text-sm font-medium truncate">{l.topic}</span>
                  <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-transform group-hover:translate-x-1" />
                </div>
              ))}
              {state.savedLessons.length === 0 && <p className="text-xs text-slate-500 italic">Chưa có bài học nào được lưu.</p>}
            </div>
          </TiltCard>

          <TiltCard className="liquid-glass p-6 rounded-[2.5rem] border-indigo-500/30">
            <h4 className="font-bold mb-4 flex items-center gap-3"><Layout className="text-indigo-400" size={20}/> Kế hoạch hôm nay</h4>
            <div className="space-y-3">
              {state.tasks.slice(0, 2).map(t => (
                <div key={t.id} className="flex items-center gap-3 text-sm">
                  <div className={`w-4 h-4 rounded border ${t.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'}`}></div>
                  <span className={t.completed ? 'line-through text-slate-500' : ''}>{t.text}</span>
                </div>
              ))}
              <button onClick={() => onNavigate('planner')} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest hover:underline">Xem tất cả</button>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
};

const SubjectCard: React.FC<{ sub: Subject, icon: React.ReactNode, color: string, onClick: () => void }> = ({ sub, icon, color, onClick }) => {
  return (
    <TiltCard onClick={onClick} className="liquid-glass p-6 rounded-[2.5rem] flex flex-col items-center gap-4 group cursor-pointer border-transparent hover:border-white/30 transition-all duration-500">
      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-2xl shadow-black/40 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <div className="text-center">
        <h3 className="font-black text-lg">{sub}</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Khám phá</p>
      </div>
    </TiltCard>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;