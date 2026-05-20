import { useState, useMemo } from 'react';
import { useLang } from '../i18n/TranslationContext';

function formatSure(s) {
  const saat = Math.floor(s / 3600), dak = Math.floor((s % 3600) / 60);
  if (saat > 0) return `${saat}s ${dak}dk`;
  return `${dak}dk`;
}

export default function TodayPage({ tasks, onAddTask, onUpdateTask }) {
  const { t, locale } = useLang();
  const [showAdd, setShowAdd] = useState(false);
  const [newBaslik, setNewBaslik] = useState('');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString(locale, { weekday: 'long' });
  const dateStr = today.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => t.tarih === todayStr)
      .sort((a, b) => {
        const order = { yuksek: 0, orta: 1, dusuk: 2 };
        return (order[a.priority || 'orta'] || 1) - (order[b.priority || 'orta'] || 1);
      });
  }, [tasks, todayStr]);

  const completed = todayTasks.filter((t) => t.durum === 'basarili');
  const pending = todayTasks.filter((t) => t.durum !== 'basarili');

  function handleQuickAdd() {
    if (!newBaslik.trim()) return;
    onAddTask({
      id: crypto.randomUUID(), type: 'task', baslik: newBaslik.trim(), aciklama: '',
      tarih: todayStr, durum: 'bilinmiyor', sure: 0, priority: 'orta',
      recurring: null, reminder: null, subtasks: [], createdAt: new Date().toISOString(),
    });
    setNewBaslik(''); setShowAdd(false);
  }

  const totalTime = useMemo(() =>
    tasks.filter((t) => t.tarih === todayStr && t.durum === 'basarili')
      .reduce((acc, t) => acc + (t.sure || 0), 0), [tasks, todayStr]);

  const progress = todayTasks.length > 0 ? Math.round((completed.length / todayTasks.length) * 100) : 0;

  return (
    <div className="today-page">
      <div className="today-hero">
        <div className="today-date">
          <span className="today-dayname">{dayName}</span>
          <span className="today-fulldate">{dateStr}</span>
        </div>
        <div className="today-stats-mini">
          <span>{t('common.taskCount', { count: todayTasks.length })}</span>
          <span>{completed.length} {t('common.completed')}</span>
          <span>{formatSure(totalTime)}</span>
        </div>
      </div>
      {todayTasks.length > 0 && (
        <div className="today-progress">
          <div className="today-progress-bar">
            <div className="today-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="today-progress-text">%{progress}</span>
        </div>
      )}
      <div className="today-section-header">
        <h3>{t('today.pending')} ({pending.length})</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          {t('today.quickAdd')}
        </button>
      </div>
      {showAdd && (
        <div className="today-quick-add">
          <input type="text" placeholder={t('today.taskPlaceholder')} value={newBaslik}
            onChange={(e) => setNewBaslik(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()} autoFocus />
          <button className="btn btn-primary btn-sm" onClick={handleQuickAdd}>{t('btn.add')}</button>
        </div>
      )}
      {pending.length === 0 && completed.length === 0 ? (
        <div className="empty-state">
          <p>{t('today.noTasks')}</p>
          <div className="sub">{t('today.noTasksSub')}</div>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="today-timeline">
              {pending.map((task) => {
                const icon = task.priority === 'yuksek' ? '⚡' : task.priority === 'dusuk' ? '○' : '•';
                const cls = task.durum === 'basarili' ? 'green' : task.durum === 'basarisiz' ? 'red' : 'yellow';
                return (
                  <div key={task.id} className="today-task-row">
                    <div className="timeline-dot-wrapper"><span className={`timeline-dot ${cls}`} /></div>
                    <div className="today-task-card" onClick={() => onUpdateTask({ ...task, durum: 'basarili' })}>
                      <div className="today-task-left">
                        <span className="priority-badge">{icon}</span>
                        <span className="today-task-title">{task.baslik}</span>
                      </div>
                      <div className="today-task-right">
                        {task.reminder && <span className="reminder-icon">🔔</span>}
                        {(task.subtasks || []).length > 0 && (
                          <span className="subtask-count">{task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}</span>
                        )}
                        {task.sure > 0 && <span className="time-badge">{formatSure(task.sure)}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {completed.length > 0 && (
            <>
              <h3 className="today-section-header" style={{ marginTop: 28 }}>{t('today.completed')} ({completed.length})</h3>
              <div className="today-timeline">
                {completed.map((task) => (
                  <div key={task.id} className="today-task-row">
                    <div className="timeline-dot-wrapper"><span className="timeline-dot green" /></div>
                    <div className="today-task-card completed">
                      <span className="today-task-title strikethrough">{task.baslik}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
