import { useState, useRef, useEffect, useCallback } from 'react';
import { useLang } from '../i18n/TranslationContext';

function formatSure(saniye) {
  const saat = Math.floor(saniye / 3600);
  const dak = Math.floor((saniye % 3600) / 60);
  const sn = saniye % 60;
  if (saat > 0) return `${saat}:${String(dak).padStart(2, '0')}:${String(sn).padStart(2, '0')}`;
  return `${String(dak).padStart(2, '0')}:${String(sn).padStart(2, '0')}`;
}

const DURUM_MAP = {
  basarisiz: { cls: 'red' },
  bilinmiyor: { cls: 'yellow' },
  basarili: { cls: 'green' },
};

const STATUS_OPTIONS = ['bilinmiyor', 'basarili', 'basarisiz'];

const PRIORITY_MAP = { yuksek: { icon: '⚡' }, orta: { icon: '•' }, dusuk: { icon: '○' } };
const RECURRING_LABELS = { daily: 'recurring.dailyBadge', weekdays: 'recurring.weekdaysBadge', weekly: 'recurring.weeklyBadge', monthly: 'recurring.monthlyBadge' };

export default function TaskItem({ task, onUpdate, onDelete }) {
  const { t, locale } = useLang();
  const [editing, setEditing] = useState(false);
  const [editBaslik, setEditBaslik] = useState(task.baslik);
  const [editAciklama, setEditAciklama] = useState(task.aciklama);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [newSubtask, setNewSubtask] = useState('');
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    startTimeRef.current = Date.now(); setTimerRunning(true);
    intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current); intervalRef.current = null;
    setTimerRunning(false);
    const added = Math.floor((Date.now() - startTimeRef.current) / 1000);
    if (added > 0) onUpdate({ ...task, sure: task.sure + added });
    setElapsed(0);
  }, [task, onUpdate]);

  function handleSaveEdit() {
    if (!editBaslik.trim()) return;
    onUpdate({ ...task, baslik: editBaslik.trim(), aciklama: editAciklama.trim() });
    setEditing(false);
  }

  function handleCancelEdit() {
    setEditBaslik(task.baslik); setEditAciklama(task.aciklama); setEditing(false);
  }

  function handleStatusChange(newStatus) {
    onUpdate({ ...task, durum: newStatus });
    if (newStatus === 'basarili' || newStatus === 'basarisiz') stopTimer();
  }

  function handleToggleSubtask(subId) {
    const updated = (task.subtasks || []).map((s) =>
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    onUpdate({ ...task, subtasks: updated });
  }

  function handleAddSubtask() {
    if (!newSubtask.trim()) return;
    onUpdate({ ...task, subtasks: [...(task.subtasks || []), { id: crypto.randomUUID(), text: newSubtask.trim(), completed: false }] });
    setNewSubtask('');
  }

  function handleDeleteSubtask(subId) {
    onUpdate({ ...task, subtasks: (task.subtasks || []).filter((s) => s.id !== subId) });
  }

  const status = DURUM_MAP[task.durum] || DURUM_MAP.bilinmiyor;
  const toplamSure = task.sure + elapsed;
  const priority = PRIORITY_MAP[task.priority || 'orta'];
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  function formatDate(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  return (
    <div className={`task-card status-${status.cls}`}>
      <div className="task-content">
        {editing ? (
          <>
            <input type="text" value={editBaslik} onChange={(e) => setEditBaslik(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', marginBottom: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-alt)', color: 'var(--text)' }} />
            <textarea value={editAciklama} onChange={(e) => setEditAciklama(e.target.value)} rows={2}
              style={{ width: '100%', padding: '6px 10px', marginBottom: 8, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', resize: 'vertical', background: 'var(--surface-alt)', color: 'var(--text)' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>{t('btn.save')}</button>
              <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>{t('btn.cancel')}</button>
            </div>
          </>
        ) : (
          <>
            <div className="task-title-row">
              <span className="priority-badge" title={t(`priority.${task.priority || 'orta'}`)}>{priority.icon}</span>
              {task.recurring && <span className="recurring-badge">{t(RECURRING_LABELS[task.recurring])}</span>}
              <span className="task-title">{task.baslik}</span>
            </div>
            {task.aciklama && <div className="task-desc">{task.aciklama}</div>}
            {subtasks.length > 0 && (
              <div className="subtask-list">
                {subtasks.map((s) => (
                  <label key={s.id} className="subtask-item">
                    <input type="checkbox" checked={s.completed} onChange={() => handleToggleSubtask(s.id)} />
                    <span className={s.completed ? 'strikethrough' : ''}>{s.text}</span>
                    <button className="subtask-del" onClick={() => handleDeleteSubtask(s.id)}>✕</button>
                  </label>
                ))}
              </div>
            )}
            <div className="subtask-add">
              <input type="text" placeholder={t('common.subtaskAdd')} value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()} />
            </div>
            <div className="task-meta">
              <span>📅 {formatDate(task.tarih)}</span>
              {task.reminder && <span className="reminder-badge">{t('common.reminder', { time: task.reminder })}</span>}
              {subtasks.length > 0 && <span className="subtask-summary">✅ {completedSubtasks}/{subtasks.length}</span>}
              <span className="timer">
                ⏱ {formatSure(toplamSure)}
                {timerRunning
                  ? <button className="timer-btn stop" onClick={stopTimer} title={t('btn.stop')}>⏹</button>
                  : <button className="timer-btn start" onClick={startTimer} title={t('btn.start')}>▶</button>}
              </span>
              <div className="status-select" style={{ gap: 4, marginLeft: 4 }}>
                {STATUS_OPTIONS.map((v) => (
                  <button key={v} type="button"
                    className={`status-option ${v === 'basarili' ? 'green' : v === 'basarisiz' ? 'red' : 'yellow'} ${task.durum === v ? 'selected' : ''}`}
                    style={{ width: 20, height: 20, background: `var(--${v === 'basarili' ? 'green' : v === 'basarisiz' ? 'red' : 'yellow'})` }}
                    onClick={() => handleStatusChange(v)} title={t(`status.${v}`)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {!editing && (
        <div className="task-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} title={t('btn.edit')}>✏️</button>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)} title={t('btn.delete')}>🗑</button>
        </div>
      )}
    </div>
  );
}
