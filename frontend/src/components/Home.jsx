import { useEffect, useState } from 'react';
import BottomNav from './BottomNav.jsx';
import './App.css';
import * as activityApi      from '../api/activity.js';
import * as notificationsApi from '../api/notifications.js';
import { petBaseImage } from '../lib/petImage.js';
import { useEquippedPreview } from '../lib/useEquippedPreview.js';

const MOODS = [
  { id: 'great', emoji: '😊', label: 'Super bra!' },
  { id: 'good',  emoji: '🙂', label: 'Bra' },
  { id: 'okay',  emoji: '😐', label: 'Okej' },
  { id: 'bad',   emoji: '😔', label: 'Dåligt' },
  { id: 'awful', emoji: '😣', label: 'Väldigt dåligt' },
];

const HABITS = [
  { id: 'walk',  icon: '👟', label: 'Ta en promenad', xp: 20 },
  { id: 'water', icon: '💧', label: 'Drick vatten',   xp: 10 },
  { id: 'read',  icon: '📖', label: 'Läs 10 min',     xp: 15 },
];

/**
 * Home — main dashboard ("Hej {name}") matching the mockup.
 *
 * Props:
 *   user: { username, ... }
 *   pet:  { name, level, xp, health, ... } | null
 *   onNavigate(screen)
 *   onPetUpdate(updatedPet)
 */
export default function Home({ user, pet, onNavigate, onPetUpdate }) {
  const [today, setToday] = useState(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [loading, setLoading] = useState({});
  const [savingMood, setSavingMood] = useState(false);
  const [xpPop, setXpPop] = useState(null);   // { id, amount } — floating "+X XP" animation
  const [unreadCount, setUnreadCount] = useState(0);
  const equippedPreview = useEquippedPreview();   // mirror the shop's hero — show the worn accessory

  useEffect(() => {
    activityApi.getToday()
      .then(setToday)
      .catch(() => setToday(null));
    // Load unread notification count for the bell badge
    notificationsApi.getNotifications()
      .then(list => setUnreadCount(list.filter(n => !n.read).length))
      .catch(() => setUnreadCount(0));
  }, []);

  const done = new Set(today?.activitiesDone ?? []);
  const habitsDoneCount = HABITS.filter(h => done.has(h.id)).length;
  const energy = Math.min(100, (pet?.xp ?? 0) % 100);

  // Today's mood comes from the server — once set, the check-in is locked for the day
  const todayMood = today?.mood ?? null;
  const moodLocked = todayMood != null;
  const selectedMood = MOODS.find(m => m.id === todayMood) ?? null;

  async function selectMood(id) {
    if (moodLocked || savingMood) return;
    setSavingMood(true);
    try {
      const result = await activityApi.setMood(id);
      const fresh = await activityApi.getToday();
      setToday(fresh);
      if (result?.pet && onPetUpdate) {
        onPetUpdate({
          ...pet,
          xp: result.pet.xp,
          level: result.pet.level,
          stage: result.pet.stage,
        });
      }
      setCheckingIn(false);
      setXpPop({ id: Date.now(), amount: result?.xpEarned ?? 0 });
    } catch {
      /* ignored — surface later if needed */
    } finally {
      setSavingMood(false);
    }
  }

  async function toggleHabit(id) {
    if (done.has(id) || loading[id]) return;
    setLoading(l => ({ ...l, [id]: true }));
    try {
      const result = await activityApi.logActivity(id);
      const fresh = await activityApi.getToday();
      setToday(fresh);
      if (result?.pet && onPetUpdate) {
        onPetUpdate({
          ...pet,
          xp: result.pet.xp,
          level: result.pet.level,
          stage: result.pet.stage,
        });
      }
    } catch {
      /* ignored — surface later if needed */
    } finally {
      setLoading(l => ({ ...l, [id]: false }));
    }
  }

  return (
    <div className="app-screen">
      <header className="app-topbar">
        <div>
          <h1 className="app-topbar-title">Hej {user?.username ?? 'där'} 👋</h1>
          <div className="app-topbar-sub">Här är din kompis som hejar på dig!</div>
        </div>
        <button
          className="app-icon-btn"
          aria-label="Notiser"
          onClick={() => onNavigate('notifications')}
          style={{ position: 'relative' }}
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              background: '#E53935', color: '#fff',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </header>

      <main className="app-content">
        <section className="home-hero">
          <img src={equippedPreview ?? petBaseImage(pet?.petAnimal)} alt={pet?.name ?? 'Mitt djur'} />
        </section>

        <button
          className="home-checkin"
          onClick={() => { if (!moodLocked) setCheckingIn(v => !v); }}
          disabled={moodLocked}
          data-locked={moodLocked}
          type="button"
        >
          <div className="home-checkin-text">
            <span className="home-checkin-title">
              {moodLocked ? 'Daglig incheckning ✓' : 'Hur mår du idag?'}
            </span>
            <span className="home-checkin-sub">
              {moodLocked ? `Humör: ${selectedMood?.label ?? ''}` : 'Gör en snabb check-in'}
            </span>
          </div>
          <span className="home-checkin-btn">{selectedMood ? selectedMood.emoji : '😊'}</span>
          {xpPop && (
            <span
              key={xpPop.id}
              className="xp-pop"
              onAnimationEnd={() => setXpPop(null)}
            >
              +{xpPop.amount} XP ⭐
            </span>
          )}
        </button>

        {checkingIn && !moodLocked && (
          <div className="mood-row">
            {MOODS.map(m => (
              <button
                key={m.id}
                className="mood-btn"
                onClick={() => selectMood(m.id)}
                disabled={savingMood}
                type="button"
              >
                <span className="mood-emoji">{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        )}

        <div className="home-section-title">
          Dagens vanor
          <span className="home-section-count">{habitsDoneCount}/{HABITS.length}</span>
        </div>

        <div className="home-habit-list">
          {HABITS.map(h => (
            <button
              key={h.id}
              className="home-habit-row"
              data-done={done.has(h.id)}
              onClick={() => toggleHabit(h.id)}
              disabled={loading[h.id]}
              type="button"
            >
              <span className="home-habit-icon">{h.icon}</span>
              <span className="home-habit-info">
                <span className="home-habit-text">{h.label}</span>
                <span className="home-habit-xp">+{h.xp} XP</span>
              </span>
              <span className="home-habit-check">✓</span>
            </button>
          ))}
        </div>

        <div className="home-energy-card">
          <div className="home-energy-header">
            <span>⭐ XP</span>
            <span>{energy} / 100</span>
          </div>
          <div className="home-energy-bar">
            <div className="home-energy-fill" style={{ width: `${energy}%` }} />
          </div>
        </div>

        <div style={{ height: 16 }} />
      </main>

      <BottomNav active="home" onNavigate={onNavigate} pet={pet} />
    </div>
  );
}
