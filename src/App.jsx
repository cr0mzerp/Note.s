import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLang } from './i18n/TranslationContext';
import Header from './components/Header';
import TodayPage from './components/TodayPage';
import TaskPage from './components/TaskPage';
import CalendarPage from './components/CalendarPage';
import IdeaPage from './components/IdeaPage';
import StatsPage from './components/StatsPage';
import Pomodoro from './components/Pomodoro';
import Background from './components/Background';
import './App.css';

function getNextRecurringDate(recurring, fromDate) {
  const d = new Date(fromDate + 'T00:00:00');
  if (recurring === 'daily') d.setDate(d.getDate() + 1);
  else if (recurring === 'weekdays') {
    do { d.setDate(d.getDate() + 1); } while (d.getDay() === 0 || d.getDay() === 6);
  } else if (recurring === 'weekly') d.setDate(d.getDate() + 7);
  else if (recurring === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
}

export default function App() {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('today');
  const [tasks, setTasks] = useLocalStorage('nottutucu_tasks', []);
  const [ideas, setIdeas] = useLocalStorage('nottutucu_ideas', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPomodoro, setShowPomodoro] = useState(false);

  useEffect(() => { Notification.requestPermission(); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];
      tasks.forEach((t) => {
        if (t.reminder && t.tarih === today && t.reminder === curTime && t.durum === 'bilinmiyor' && Notification.permission === 'granted') {
          new Notification(t('notif.reminder'), { body: t.baslik });
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [tasks, t]);

  useEffect(() => {
    let changed = false;
    const updated = tasks.map((t) => {
      if (t.recurring && t.durum === 'basarili') {
        const next = getNextRecurringDate(t.recurring, t.tarih);
        if (next !== t.tarih) { changed = true; return { ...t, tarih: next, durum: 'bilinmiyor', sure: 0 }; }
      }
      return t;
    });
    if (changed) setTasks(updated);
  }, [tasks, setTasks]);

  const handleAddTask = useCallback((task) => setTasks((prev) => [task, ...prev]), [setTasks]);
  const handleUpdateTask = useCallback((updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t))), [setTasks]);
  const handleDeleteTask = useCallback((id) => setTasks((prev) => prev.filter((t) => t.id !== id)), [setTasks]);
  const handleAddIdea = useCallback((idea) => setIdeas((prev) => [idea, ...prev]), [setIdeas]);
  const handleUpdateIdea = useCallback((updated) => setIdeas((prev) => prev.map((t) => (t.id === updated.id ? updated : t))), [setIdeas]);
  const handleDeleteIdea = useCallback((id) => setIdeas((prev) => prev.filter((t) => t.id !== id)), [setIdeas]);
  const handleImport = useCallback((data) => setTasks(data), [setTasks]);

  const searchedTasks = searchQuery
    ? tasks.filter((t) =>
        t.baslik.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.aciklama || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  const searchedIdeas = searchQuery
    ? ideas.filter((t) =>
        t.baslik.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.aciklama || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : ideas;

  return (
    <>
      <Background />
      <Header activeTab={activeTab} onTabChange={setActiveTab}
        searchQuery={searchQuery} onSearchChange={setSearchQuery}
        onPomodoroOpen={() => setShowPomodoro(true)} />
      <main className="main-content">
        {activeTab === 'today' && <div key="today" className="page-wrapper">
          <TodayPage tasks={tasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} />
        </div>}
        {activeTab === 'tasks' && <div key="tasks" className="page-wrapper">
          <TaskPage tasks={searchedTasks} onAddTask={handleAddTask} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
        </div>}
        {activeTab === 'calendar' && <div key="calendar" className="page-wrapper">
          <CalendarPage tasks={tasks} onAddTask={handleAddTask} />
        </div>}
        {activeTab === 'ideas' && <div key="ideas" className="page-wrapper">
          <IdeaPage ideas={searchedIdeas} onAddIdea={handleAddIdea} onUpdateIdea={handleUpdateIdea} onDeleteIdea={handleDeleteIdea} />
        </div>}
        {activeTab === 'stats' && <div key="stats" className="page-wrapper">
          <StatsPage tasks={tasks} onImport={handleImport} />
        </div>}
      </main>
      <Pomodoro isOpen={showPomodoro} onClose={() => setShowPomodoro(false)} />
    </>
  );
}
