import { useState } from 'react';
import { useLang } from '../i18n/TranslationContext';

const STATUS_OPTIONS = ['bilinmiyor', 'basarili', 'basarisiz'];
const PRIORITY_OPTIONS = ['yuksek', 'orta', 'dusuk'];
const RECURRING_OPTIONS = ['none', 'daily', 'weekdays', 'weekly', 'monthly'];

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export default function TaskForm({ onAdd }) {
  const { t } = useLang();
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [tarih, setTarih] = useState(formatDate(new Date()));
  const [durum, setDurum] = useState('bilinmiyor');
  const [priority, setPriority] = useState('orta');
  const [recurring, setRecurring] = useState('none');
  const [reminder, setReminder] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!baslik.trim()) return;
    onAdd({
      id: crypto.randomUUID(), type: 'task',
      baslik: baslik.trim(), aciklama: aciklama.trim(),
      tarih, durum, sure: 0,
      priority,
      recurring: recurring === 'none' ? null : recurring,
      reminder: reminder || null,
      subtasks: [],
      createdAt: new Date().toISOString(),
    });
    setBaslik(''); setAciklama(''); setReminder('');
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label>{t('task.title')}</label>
          <input type="text" placeholder={t('task.titlePlaceholder')} value={baslik}
            onChange={(e) => setBaslik(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>{t('task.date')}</label>
          <input type="date" value={tarih} onChange={(e) => setTarih(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group" style={{ flex: 2 }}>
          <label>{t('task.desc')}</label>
          <textarea placeholder={t('task.descPlaceholder')} value={aciklama}
            onChange={(e) => setAciklama(e.target.value)} rows={2} />
        </div>
        <div className="form-group">
          <label>{t('task.status')}</label>
          <div className="status-select">
            {STATUS_OPTIONS.map((v) => (
              <button key={v} type="button"
                className={`status-option ${v === 'basarili' ? 'green' : v === 'basarisiz' ? 'red' : 'yellow'} ${durum === v ? 'selected' : ''}`}
                style={{ background: `var(--${v === 'basarili' ? 'green' : v === 'basarisiz' ? 'red' : 'yellow'})` }}
                onClick={() => setDurum(v)} title={t(`status.${v}`)} />
            ))}
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>{t('task.priority')}</label>
          <div className="priority-select">
            {PRIORITY_OPTIONS.map((v) => (
              <button key={v} type="button"
                className={`priority-btn ${priority === v ? 'active' : ''}`}
                onClick={() => setPriority(v)}>
                {t(`priority.${v}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>{t('task.recurring')}</label>
          <select value={recurring} onChange={(e) => setRecurring(e.target.value)}>
            {RECURRING_OPTIONS.map((v) => (
              <option key={v} value={v}>{t(`recurring.${v}`)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>{t('task.reminder')}</label>
          <input type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{t('task.add')}</button>
      </div>
    </form>
  );
}
