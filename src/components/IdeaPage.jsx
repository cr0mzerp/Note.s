import { useState } from 'react';
import { useLang } from '../i18n/TranslationContext';
import IdeaItem from './IdeaItem';

const STATUS_OPTIONS = ['bilinmiyor', 'basarili', 'basarisiz'];

export default function IdeaPage({ ideas, onAddIdea, onUpdateIdea, onDeleteIdea }) {
  const { t } = useLang();
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [durum, setDurum] = useState('bilinmiyor');

  function handleSubmit(e) {
    e.preventDefault();
    if (!baslik.trim()) return;
    onAddIdea({ id: crypto.randomUUID(), type: 'idea', baslik: baslik.trim(), aciklama: aciklama.trim(), durum, createdAt: new Date().toISOString() });
    setBaslik(''); setAciklama(''); setDurum('bilinmiyor');
  }

  const sorted = [...ideas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">{t('ideas.title')}</h2>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label>{t('task.title')}</label>
            <input type="text" placeholder={t('ideas.titlePlaceholder')} value={baslik} onChange={(e) => setBaslik(e.target.value)} required />
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
            <label>{t('task.desc')}</label>
            <textarea placeholder={t('ideas.descPlaceholder')} value={aciklama} onChange={(e) => setAciklama(e.target.value)} rows={2} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">{t('ideas.add')}</button>
        </div>
      </form>
      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>{t('ideas.noIdeas')}</p>
          <div className="sub">{t('ideas.noIdeasSub')}</div>
        </div>
      ) : (
        <div className="idea-list">
          {sorted.map((idea) => (
            <IdeaItem key={idea.id} idea={idea} onUpdate={onUpdateIdea} onDelete={onDeleteIdea} />
          ))}
        </div>
      )}
    </div>
  );
}
