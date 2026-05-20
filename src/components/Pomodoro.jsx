import { useState, useEffect, useRef } from 'react';
import { useLang } from '../i18n/TranslationContext';

export default function Pomodoro({ isOpen, onClose }) {
  const { t } = useLang();
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current); }; }, []);

  function start() {
    if (intervalRef.current) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current); intervalRef.current = null;
          setRunning(false);
          if (mode === 'focus') {
            setCount((c) => c + 1); setMode('break'); setTimeLeft(5 * 60);
            if (Notification.permission === 'granted') new Notification(t('pomodoro.notifBreak'));
          } else {
            setMode('focus'); setTimeLeft(25 * 60);
            if (Notification.permission === 'granted') new Notification(t('pomodoro.notifFocus'));
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function pause() {
    clearInterval(intervalRef.current); intervalRef.current = null;
    setRunning(false);
  }

  function reset() {
    clearInterval(intervalRef.current); intervalRef.current = null;
    setRunning(false); setMode('focus'); setTimeLeft(25 * 60);
  }

  function fmt(s) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }

  if (!isOpen) return null;

  const progress = mode === 'focus' ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="pomodoro-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="pomodoro-title">{t('pomodoro.title')}</h2>
        <div className="pomodoro-mode">
          <span className={mode === 'focus' ? 'active' : ''}>{t('pomodoro.focus')}</span>
          <span className="mode-divider">|</span>
          <span className={mode === 'break' ? 'active' : ''}>{t('pomodoro.break')}</span>
        </div>
        <div className="pomodoro-ring-wrapper">
          <svg className="pomodoro-ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="100" cy="100" r="85" fill="none"
              stroke={mode === 'focus' ? 'var(--green)' : 'var(--yellow)'} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 85}`}
              strokeDashoffset={`${2 * Math.PI * 85 * (1 - progress / 100)}`}
              transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
          </svg>
          <div className="pomodoro-time">{fmt(timeLeft)}</div>
        </div>
        <div className="pomodoro-controls">
          {!running
            ? <button className="btn btn-primary" onClick={start}>{t('pomodoro.start')}</button>
            : <button className="btn btn-secondary" onClick={pause}>{t('pomodoro.stop')}</button>}
          <button className="btn btn-secondary" onClick={reset}>{t('pomodoro.reset')}</button>
        </div>
        <div className="pomodoro-count">{t('pomodoro.count', { count })}</div>
      </div>
    </div>
  );
}
