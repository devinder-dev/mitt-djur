import { useState } from 'react';
import BottomNav from './BottomNav.jsx';
import './App.css';
import { petBaseImage } from '../lib/petImage.js';
import { useEquippedPreview } from '../lib/useEquippedPreview.js';

const PET_LABELS = { katt: 'Katt', tvattbjorn: 'Tvättbjörn', igelkott: 'Igelkott' };

/**
 * Profile — matches the "Profil" mockup.
 *
 * Props:
 *   user: { username, email, avatarUrl, streak, ... }
 *   pet:  { name, level, xp, petAnimal, ... } | null
 *   onSave({ username, avatarUrl })
 *   onLogout()
 *   onNavigate(screen)
 */
export default function Profile({ user, pet, onSave, onLogout, onNavigate }) {
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? null);
  const [saving, setSaving] = useState(false);
  const equippedPreview = useEquippedPreview();   // worn accessory, used when no custom avatar is set

  const streak = user?.streak ?? 0;
  const xp = pet?.xp ?? 0;
  const level = pet?.level ?? 0;
  const petLabel = PET_LABELS[pet?.petAnimal] ?? pet?.petAnimal ?? 'Djur';

  async function handleSave() {
    setSaving(true);
    try {
      await onSave?.({ username, avatarUrl: avatarPreview });
      setEditing(false);
    } catch {
      /* ignored */
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setUsername(user?.username ?? '');
    setAvatarPreview(user?.avatarUrl ?? null);
    setEditing(false);
  }

  return (
    <div className="pp-screen">
      <header className="pp-topbar">
        <h1 className="pp-title">Profil</h1>
      </header>

      <div className="pp-avatar-wrap">
        <div className="pp-avatar">
          {avatarPreview
            ? <img src={avatarPreview} alt={username} />
            : <img src={equippedPreview ?? petBaseImage(pet?.petAnimal)} alt={username} />
          }
        </div>
        {editing ? (
          <input
            className="pp-name-input"
            value={username}
            onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
            maxLength={20}
            autoFocus
          />
        ) : (
          <div className="pp-name">{username}</div>
        )}
        <div className="pp-tagline">Du gör fantastiska framsteg! 🌟</div>
      </div>

      {editing && (
        <div className="pp-actions">
          <button className="pp-cancel-btn" onClick={handleCancel}>Avbryt</button>
          <button className="pp-save-btn" disabled={saving} onClick={handleSave}>
            {saving ? '...' : 'Spara'}
          </button>
        </div>
      )}

      <div className="pp-stats">
        <div className="pp-stat">
          <div className="pp-stat-emoji">🔥</div>
          <div className="pp-stat-label">Streak</div>
          <div className="pp-stat-value">{streak}</div>
          <div className="pp-stat-label">dagar</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-emoji">⭐</div>
          <div className="pp-stat-label">XP</div>
          <div className="pp-stat-value">{xp.toLocaleString()}</div>
          <div className="pp-stat-label">poäng</div>
        </div>
        <div className="pp-stat">
          <div className="pp-stat-emoji">🐾</div>
          <div className="pp-stat-label">Pet Nivå</div>
          <div className="pp-stat-value">{level}</div>
          <div className="pp-stat-label">{petLabel}</div>
        </div>
      </div>

      <div className="pp-list">
        {!editing && (
          <button className="pp-list-row" onClick={() => setEditing(true)}>
            <span className="pp-list-icon">✏️</span>
            <span className="pp-list-label">Redigera profil</span>
            <span className="pp-list-arrow">›</span>
          </button>
        )}
        <button className="pp-list-row" onClick={() => onNavigate('friends')}>
          <span className="pp-list-icon">👥</span>
          <span className="pp-list-label">Vänner & Topplista</span>
          <span className="pp-list-arrow">›</span>
        </button>
        <button className="pp-list-row pp-list-row--danger" onClick={onLogout}>
          <span className="pp-list-icon">🚪</span>
          <span className="pp-list-label">Logga ut</span>
          <span className="pp-list-arrow">›</span>
        </button>
      </div>

      <BottomNav active="profile" onNavigate={onNavigate} pet={pet} />
    </div>
  );
}
