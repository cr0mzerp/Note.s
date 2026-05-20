import { useState, useMemo } from 'react';
import { useLang } from '../i18n/TranslationContext';

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let startDay = firstDay.getDay() - 1;
  if (startDay < 0) startDay = 6;
  const days = [];
  for (let i = 0; i < startDay; i++) {
    const d = new Date(year, month, -startDay + i + 1);
    days.push({ day: d.getDate(), month: 'prev', date: d });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month: 'current', date: new Date(year, month, i) });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, month: 'next', date: new Date(year, month + 1, i) });
  }
  return days;
}

function toDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CalendarPage({ tasks, onAddTask }) {
  const { t, locale } = useLang();
  const WEEKDAYS = t('weekday.short');
  const MONTHS = t('month.name');

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskBaslik, setNewTaskBaslik] = useState('');

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const taskMap = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!map[t.tarih]) map[t.tarih] = [];
      map[t.tarih].push(t);
    });
    return map;
  }, [tasks]);

  const selectedTasks = selectedDate ? (taskMap[selectedDate] || []) : [];
  const todayStr = toDateStr(new Date());

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  function handleDayClick(dateObj, monthType) {
    if (monthType === 'prev') { prevMonth(); setSelectedDate(toDateStr(dateObj)); }
    else if (monthType === 'next') { nextMonth(); setSelectedDate(toDateStr(dateObj)); }
    else setSelectedDate(toDateStr(dateObj));
  }

  function handleQuickAdd() {
    if (!newTaskBaslik.trim() || !selectedDate) return;
    onAddTask({
      id: crypto.randomUUID(), type: 'task', baslik: newTaskBaslik.trim(), aciklama: '',
      tarih: selectedDate, durum: 'bilinmiyor', sure: 0, priority: 'orta',
      recurring: null, reminder: null, subtasks: [], createdAt: new Date().toISOString(),
    });
    setNewTaskBaslik(''); setShowAddForm(false);
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">{t('calendar.title')}</h2>
      </div>
      <div className="calendar">
        <div className="calendar-header">
          <h2>{MONTHS[month]} {year}</h2>
          <div className="calendar-nav">
            <button onClick={prevMonth}>◀</button>
            <button onClick={nextMonth}>▶</button>
            <button onClick={() => { const d = new Date(); setYear(d.getFullYear()); setMonth(d.getMonth()); }}
              title={t('calendar.today')} style={{ fontSize: '0.75rem', padding: '0 8px' }}>📌</button>
          </div>
        </div>
        <div className="weekday-header">
          {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className="calendar-grid">
          {days.map((d, idx) => {
            const dateStr = toDateStr(d.date);
            const dayTasks = taskMap[dateStr] || [];
            const cls = ['calendar-day', d.month !== 'current' ? 'other-month' : '', dateStr === todayStr ? 'today' : ''].filter(Boolean).join(' ');
            return (
              <div key={idx} className={cls} onClick={() => handleDayClick(d.date, d.month)}>
                <div className="day-number">{d.day}</div>
                {dayTasks.length > 0 && (
                  <div className="day-dots">
                    {dayTasks.map((t) => (
                      <span key={t.id}
                        className={`day-dot ${t.durum === 'basarili' ? 'green' : t.durum === 'basarisiz' ? 'red' : 'yellow'}`} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {selectedDate && (
        <div className="day-tasks-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>
              📅 {selectedDate === todayStr
                ? t('calendar.today')
                : new Date(selectedDate + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
            </h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? t('task.cancel') : t('calendar.quickAdd')}
            </button>
          </div>
          {showAddForm && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input type="text" placeholder={t('calendar.quickAddPlaceholder')} value={newTaskBaslik}
                onChange={(e) => setNewTaskBaslik(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-alt)', color: 'var(--text)' }} />
              <button className="btn btn-primary" onClick={handleQuickAdd}>{t('btn.add')}</button>
            </div>
          )}
          {selectedTasks.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('calendar.noTasks')}</p>
          ) : (
            selectedTasks.map((t) => (
              <div key={t.id} className="day-task-item">
                <span className={`status-dot ${t.durum === 'basarili' ? 'green' : t.durum === 'basarisiz' ? 'red' : 'yellow'}`} />
                <span style={{ fontWeight: 500 }}>{t.baslik}</span>
                {t.aciklama && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>— {t.aciklama}</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
