import { useState, useMemo } from 'react';
import { useLang } from '../i18n/TranslationContext';

function formatSure(s) {
  const saat = Math.floor(s / 3600), dak = Math.floor((s % 3600) / 60);
  if (saat > 0) return `${saat}s ${dak}dk`;
  return `${dak}dk`;
}

function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function StatsPage({ tasks, onImport }) {
  const { t } = useLang();
  const [importText, setImportText] = useState('');

  const stats = useMemo(() => {
    const weekDates = getWeekDates();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.durum === 'basarili');
    const failed = tasks.filter((t) => t.durum === 'basarisiz');
    const pending = tasks.filter((t) => t.durum === 'bilinmiyor');
    const totalTime = tasks.reduce((acc, t) => acc + (t.sure || 0), 0);
    const weekData = weekDates.map((date) => {
      const dayTasks = tasks.filter((t) => t.tarih === date);
      return { date, total: dayTasks.length, completed: dayTasks.filter((t) => t.durum === 'basarili').length };
    });
    const dayProductivity = {};
    tasks.forEach((t) => {
      if (t.durum === 'basarili' && t.tarih) {
        const d = new Date(t.tarih + 'T00:00:00');
        const dayName = d.toLocaleDateString('tr-TR', { weekday: 'long' });
        dayProductivity[dayName] = (dayProductivity[dayName] || 0) + 1;
      }
    });
    const bestDay = Object.entries(dayProductivity).sort((a, b) => b[1] - a[1])[0];
    const statusData = [
      { label: t('stats.completed'), count: completed.length, cls: 'green', pct: total ? Math.round((completed.length / total) * 100) : 0 },
      { label: t('stats.pending'), count: pending.length, cls: 'yellow', pct: total ? Math.round((pending.length / total) * 100) : 0 },
      { label: t('stats.failed'), count: failed.length, cls: 'red', pct: total ? Math.round((failed.length / total) * 100) : 0 },
    ];
    return { total, completed: completed.length, failed: failed.length, pending: pending.length, totalTime, weekData, bestDay, statusData };
  }, [tasks, t]);

  function handleExport() {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `nottutucu_${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  function handleImport() {
    try {
      const data = JSON.parse(importText);
      if (!Array.isArray(data)) throw Error('');
      onImport(data); setImportText('');
    } catch { alert(t('stats.importError')); }
  }

  const DAY_LABELS = t('weekday.short');

  return (
    <div className="stats-page">
      <div className="page-header">
        <h2 className="page-title">{t('stats.title')}</h2>
      </div>
      <div className="stats-grid">
        {[
          { value: stats.total, label: t('stats.total') },
          { value: stats.completed, label: t('stats.completed'), cls: 'green' },
          { value: stats.pending, label: t('stats.pending'), cls: 'yellow' },
          { value: stats.failed, label: t('stats.failed'), cls: 'red' },
          { value: formatSure(stats.totalTime), label: t('stats.totalTime') },
          { value: stats.bestDay ? stats.bestDay[0] : '-', label: t('stats.bestDay') },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <span className={`stat-value ${s.cls || ''}`}>{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <h3 className="stats-section-title">{t('stats.weeklyChart')}</h3>
      <div className="week-chart">
        {stats.weekData.map((d, i) => {
          const maxVal = Math.max(...stats.weekData.map((w) => w.total), 1);
          return (
            <div key={d.date} className="week-bar-col">
              <div className="week-bar-wrapper">
                <div className="week-bar completed" style={{ height: `${(d.completed / maxVal) * 100}%` }} />
                <div className="week-bar total" style={{ height: `${(d.total / maxVal) * 100}%` }} />
              </div>
              <span className="week-bar-label">{DAY_LABELS[i] || ''}</span>
              <span className="week-bar-count">{d.completed}/{d.total}</span>
            </div>
          );
        })}
      </div>

      <h3 className="stats-section-title">{t('stats.distribution')}</h3>
      <div className="status-distribution">
        {stats.statusData.map((s) => (
          <div key={s.cls} className="status-row">
            <div className="status-row-label">
              <span className={`status-dot ${s.cls}`} /> <span>{s.label}</span>
            </div>
            <div className="status-row-bar-wrapper">
              <div className="status-row-bar" style={{ width: `${s.pct}%`, background: `var(--${s.cls})` }} />
            </div>
            <span className="status-row-count">{s.count} (%{s.pct})</span>
          </div>
        ))}
      </div>

      <h3 className="stats-section-title">{t('stats.dataManagement')}</h3>
      <div className="data-management">
        <button className="btn btn-primary" onClick={handleExport}>{t('stats.export')}</button>
        <div className="import-section">
          <textarea placeholder={t('stats.importPlaceholder')} value={importText}
            onChange={(e) => setImportText(e.target.value)} rows={4} />
          <button className="btn btn-primary" onClick={handleImport} disabled={!importText.trim()}>
            {t('stats.import')}
          </button>
        </div>
      </div>
    </div>
  );
}
