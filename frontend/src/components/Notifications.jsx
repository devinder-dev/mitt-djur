import { useEffect, useState } from 'react';
import './App.css';
import * as notificationsApi from '../api/notifications.js';

// Icon per notification type
const TYPE_ICON = {
  friend_request:   '🤝',
  friend_accepted:  '✅',
  level_up:         '🏆',
  pet_warning:      '⚠️',
  pet_died:         '💀',
  streak_milestone: '🔥',
  achievement:      '🎖️',
  weekly_summary:   '📊',
};

// Human-readable time ago (Swedish)
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return 'Just nu';
  if (diff < 3600) return `${Math.floor(diff / 60)} min sedan`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} tim sedan`;
  return `${Math.floor(diff / 86400)} dagar sedan`;
}

/**
 * Notifications screen
 *
 * Props:
 *   onNavigate(screen)
 */
export default function Notifications({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  async function load() {
    try {
      const data = await notificationsApi.getNotifications();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleMarkOne(id) {
    // Optimistically mark as read in local state
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await notificationsApi.markRead(id);
    } catch {
      // Roll back on failure
      load();
    }
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      /* ignored */
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <div className="app-screen">

      {/* ── Header ── */}
      <header className="app-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="app-icon-btn"
            onClick={() => onNavigate('home')}
            aria-label="Tillbaka"
            style={{ fontSize: 20, fontWeight: 700 }}
          >
            ←
          </button>
          <div>
            <h1 className="app-topbar-title">Notiser</h1>
            {unreadCount > 0 && (
              <div className="app-topbar-sub">{unreadCount} olästa</div>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            className="app-icon-btn"
            onClick={handleMarkAll}
            disabled={markingAll}
            style={{ fontSize: 13, fontWeight: 700, color: '#FFA11F' }}
          >
            {markingAll ? '...' : 'Markera alla ✓'}
          </button>
        )}
      </header>

      {/* ── List ── */}
      <main className="app-content">
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#A06B4A' }}>Laddar...</div>
        )}

        {!loading && items.length === 0 && (
          <div className="notif-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div style={{ fontWeight: 700, color: '#7A4A31' }}>Inga notiser ännu</div>
            <div style={{ fontSize: 13, color: '#A06B4A', marginTop: 4 }}>
              Notiser dyker upp när du klara uppdrag, skaffa vänner och mer!
            </div>
          </div>
        )}

        {items.map(n => (
          <button
            key={n.id}
            className={`notif-row ${!n.read ? 'notif-row--unread' : ''}`}
            onClick={() => !n.read && handleMarkOne(n.id)}
            type="button"
          >
            <div className="notif-icon">
              {TYPE_ICON[n.type] ?? '🔔'}
            </div>
            <div className="notif-body">
              <div className="notif-message">{n.message}</div>
              <div className="notif-time">{timeAgo(n.createdAt)}</div>
            </div>
            {!n.read && <div className="notif-dot" aria-label="Oläst" />}
          </button>
        ))}

        <div style={{ height: 24 }} />
      </main>
    </div>
  );
}
