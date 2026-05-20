import { useState } from 'react';
import { useLang } from '../i18n/TranslationContext';

const DURUM_MAP = { basarisiz: { cls: 'red' }, bilinmiyor: { cls: 'yellow' }, basarili: { cls: 'green' } };
const STATUS_OPTIONS = ['bilinmiyor', 'basarili', 'basarisiz'];

export default function IdeaItem({ idea, onUpdate, onDelete }) {
  const { t } = useLang();
  const [editing, setEditing] = useState(false);
  const [editBaslik, setEditBaslik] = useState(idea.baslik);
  const [editAciklama, setEditAciklama] = useState(idea.aciklama);

  const status = DURUM_MAP[idea.durum];

  function handleSaveEdit() {
    if (!editBaslik.trim()) return;
    onUpdate({ ...idea, baslik: editBaslik.trim(), aciklama: editAciklama.trim() });
    setEditing(false);
  }

  function handleCancelEdit() {
    setEditBaslik(idea.baslik); setEditAciklama(idea.aciklama); setEditing(false);
  }

  return (
    <div className={`idea-card idea-${status.cls}`}>
      <div className="idea-header">
        {editing ? (
          <input type="text" value={editBaslik} onChange={(e) => setEditBaslik(e.target.value)}
            style={{ flex: 1, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-alt)', color: 'var(--text)' }} />
        ) : (
          <span className="idea-title">{idea.baslik}</span>
        )}
        {!editing && (
          <div className="status-select" style={{ gap: 4 }}>
            {STATUS_OPTIONS.map((v) => (
              <button key={v} type="button"
                className={`status-option ${v === 'basarili' ? 'green' : v === 'basarisiz' ? 'red' : 'yellow'} ${idea.durum === v ? 'selected' : ''}`}
                style={{ width: 20, height: 20, background: `var(--${v === 'basarili' ? 'green' : v === 'basarisiz' ? 'red' : 'yellow'})` }}
                onClick={() => onUpdate({ ...idea, durum: v })} title={t(`status.${v}`)} />
            ))}
          </div>
        )}
      </div>
      {editing ? (
        <textarea value={editAciklama} onChange={(e) => setEditAciklama(e.target.value)} rows={2}
          style={{ width: '100%', padding: '4px 8px', marginTop: 6, border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', resize: 'vertical', background: 'var(--surface-alt)', color: 'var(--text)' }} />
      ) : (
        idea.aciklama && <div className="idea-desc">{idea.aciklama}</div>
      )}
      <div className="idea-footer">
        {editing ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>{t('btn.save')}</button>
            <button className="btn btn-secondary btn-sm" onClick={handleCancelEdit}>{t('btn.cancel')}</button>
          </>
        ) : (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)} title={t('btn.edit')}>✏️</button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(idea.id)} title={t('btn.delete')}>🗑</button>
          </>
        )}
      </div>
    </div>
  );
}
