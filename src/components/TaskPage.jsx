import { useState, useMemo } from 'react';
import { useLang } from '../i18n/TranslationContext';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

const FILTERS = ['all', 'bilinmiyor', 'basarili', 'basarisiz'];

export default function TaskPage({ tasks, onAddTask, onUpdateTask, onDeleteTask }) {
  const { t } = useLang();
  const [filter, setFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (filter !== 'all') list = list.filter((t) => t.durum === filter);
    list.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
    return list;
  }, [tasks, filter]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">{t('tab.tasks')}</h2>
      </div>
      <TaskForm onAdd={onAddTask} />
      <div className="filters">
        {FILTERS.map((v) => (
          <button key={v} className={`filter-btn ${filter === v ? 'active' : ''}`}
            onClick={() => setFilter(v)}>
            {v === 'all' ? t('filter.all') : t(`filter.${v}`)}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
          {t('common.taskCount', { count: filteredTasks.length })}
        </span>
      </div>
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>{t('empty.tasks')}</p>
          <div className="sub">{t('empty.tasksSub')}</div>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map((t) => (
            <TaskItem key={t.id} task={t} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
          ))}
        </div>
      )}
    </div>
  );
}
