import { useEffect, useRef, useState } from 'react';
import BottomNav from './BottomNav.jsx';
import './App.css';
import * as missionsApi from '../api/missions.js';

const CATEGORY_ICONS = {
  be_active:     '🚶',
  quit_smoking:  '🚭',
  quit_snus:     '🚫',
  drink_water:   '💧',
  meditate:      '🌿',
  read_more:     '📖',
  sleep_better:  '🌙',
  workout:       '💪',
  eat_healthy:   '🥗',
  be_productive: '✅',
};

/**
 * Missions / Uppdrag screen.
 *
 * Props:
 *   user, pet, onNavigate, onPetUpdate, onCoinsUpdate
 */
export default function Missions({ pet, onNavigate, onPetUpdate, onCoinsUpdate }) {
  const [active, setActive] = useState([]);
  const [available, setAvailable] = useState([]);
  const [busy, setBusy] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);   // { key, text } — short-lived XP/coins toast
  const noticeTimer = useRef(null);
  const noticeSeq = useRef(0);

  async function refresh() {
    try {
      const [mine, all] = await Promise.all([
        missionsApi.getMyMissions(),
        missionsApi.getAvailableMissions(),
      ]);
      setActive(mine);
      const activeIds = new Set(mine.map(m => m.missionId));
      setAvailable(all.filter(m => !activeIds.has(m.id)));
    } catch (e) {
      setError(e.message ?? 'Kunde inte hämta uppdrag');
    }
  }

  useEffect(() => { refresh(); }, []);

  // Pop up a short-lived XP/coins toast. A new toast replaces the current one and
  // restarts the 3-second timer, so rapid completions don't stack — the latest wins.
  function showNotice(text) {
    noticeSeq.current += 1;
    setNotice({ key: noticeSeq.current, text });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3000);
  }

  // Clear any pending toast timer when leaving the screen
  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);

  async function start(missionTemplateId) {
    setBusy(b => ({ ...b, [missionTemplateId]: true }));
    try {
      await missionsApi.selectMission(missionTemplateId);
      await refresh();
    } catch (e) {
      setError(e.message ?? 'Kunde inte starta uppdrag');
    } finally {
      setBusy(b => ({ ...b, [missionTemplateId]: false }));
    }
  }

  async function complete(userMissionId) {
    setBusy(b => ({ ...b, [userMissionId]: true }));
    try {
      const result = await missionsApi.completeMission(userMissionId);
      if (result?.pet && onPetUpdate) onPetUpdate(p => ({ ...(p ?? {}), ...result.pet }));
      if (result?.coinsEarned && onCoinsUpdate) onCoinsUpdate(c => (c ?? 0) + result.coinsEarned);
      const xp = result?.xpEarned ?? 0;
      const coins = result?.coinsEarned ?? 0;
      if (result?.cycleCompleted) {
        showNotice(`🎉 7 dagar i rad!`);
      } else {
        showNotice(`+${xp} XP & +${coins} mynt`);
      }
      await refresh();
    } catch (e) {
      setError(e.message ?? 'Kunde inte klarmarkera uppdrag');
    } finally {
      setBusy(b => ({ ...b, [userMissionId]: false }));
    }
  }

  return (
    <div className="app-screen">
      <header className="app-topbar">
        <div>
          <h1 className="app-topbar-title">Uppdrag</h1>
          <div className="app-topbar-sub">Små steg gör stor skillnad. Du klarar det! 💪</div>
        </div>
      </header>

      <main className="app-content">
        {error && <div className="auth-error" style={{ maxWidth: 'none' }}>{error}</div>}
        {notice && (
          <div key={notice.key} className="mission-toast">{notice.text}</div>
        )}

        {active.length === 0 && available.length === 0 && (
          <div className="mission-card mission-empty">
            Du har inga uppdrag än. Sätt mål i profilen för att få förslag!
          </div>
        )}

        {active.map(m => {
          const total = m.totalDays ?? 7;
          const days = m.progressDays ?? 0;
          return (
            <div key={m.id} className="mission-card">
              <div className="mission-card-head">
                <div className="mission-icon" data-cat={m.category}>{CATEGORY_ICONS[m.category] ?? '✨'}</div>
                <div className="mission-info">
                  <div className="mission-title">{m.title}</div>
                  <div className="mission-sub">
                    {days} / {total} dagar +{m.xp} XP & +{m.coins} mynt
                    {days === total - 1 && ' × 3 🔥'}
                  </div>
                </div>
              </div>
              <div className="mission-progress-bar">
                <div className="mission-progress-fill" style={{ width: `${(days / total) * 100}%` }} />
              </div>
              <div className="mission-actions">
                <button className="mission-btn-secondary" disabled>Starta</button>
                <button
                  className="mission-btn-primary"
                  disabled={busy[m.id]}
                  onClick={() => complete(m.id)}
                >
                  Klar
                </button>
              </div>
            </div>
          );
        })}

        {active.length < 5 && available.map(m => (
          <div key={m.id} className="mission-card">
            <div className="mission-card-head">
              <div className="mission-icon" data-cat={m.category}>{CATEGORY_ICONS[m.category] ?? '✨'}</div>
              <div className="mission-info">
                <div className="mission-title">{m.title}</div>
                <div className="mission-sub">+{m.xp} XP & +{m.coins} mynt</div>
              </div>
            </div>
            <div className="mission-actions">
              <button
                className="mission-btn-primary"
                disabled={busy[m.id]}
                onClick={() => start(m.id)}
              >
                Starta
              </button>
            </div>
          </div>
        ))}

        <div style={{ height: 16 }} />
      </main>

      <BottomNav active="missions" onNavigate={onNavigate} pet={pet} />
    </div>
  );
}
