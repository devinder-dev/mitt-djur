import { useState } from 'react';
import BottomNav from './BottomNav.jsx';
import './App.css';
import * as petApi from '../api/pet.js';
import { petBaseImage } from '../lib/petImage.js';
import { useEquippedPreview } from '../lib/useEquippedPreview.js';

const PET_LABELS = { katt: 'Katt', tvattbjorn: 'Tvättbjörn', igelkott: 'Igelkott' };

/**
 * PetScreen — center tab, shows the user's pet, level/XP bar and rename.
 *
 * Props:
 *   pet: { name, petAnimal, level, xp, health, stage, ... } | null
 *   onNavigate(screen)
 *   onPetUpdate(updatedPet)
 */
export default function PetScreen({ pet, onNavigate, onPetUpdate }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(pet?.name ?? '');
  const [saving, setSaving] = useState(false);
  const equippedPreview = useEquippedPreview();   // show the worn accessory, matching the shop

  const xpInLevel = (pet?.xp ?? 0) % 100;
  const health = pet?.health ?? 100;
  const petLabel = PET_LABELS[pet?.petAnimal] ?? pet?.petAnimal ?? 'Djur';

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const updated = await petApi.updatePetName(name.trim());
      onPetUpdate?.(updated);
      setEditing(false);
    } catch {
      /* ignored */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-screen">
      <header className="app-topbar">
        <div>
          <h1 className="app-topbar-title">Mitt djur</h1>
          <div className="app-topbar-sub">Hälsa på din lilla kompis!</div>
        </div>
      </header>

      <main className="app-content">
        <section className="pet-screen-card">
          <img className="pet-screen-img" src={equippedPreview ?? petBaseImage(pet?.petAnimal)} alt={pet?.name ?? 'Mitt djur'} />
          {editing ? (
            <input
              className="pp-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              autoFocus
            />
          ) : (
            <div className="pet-screen-name">{pet?.name ?? 'Kompis'}</div>
          )}
          <div className="pet-screen-meta">{petLabel} Level {pet?.level ?? 0} {pet?.stage ?? 'egg'}</div>

          <div className="pet-bar-row">
            <span className="pet-bar-label">⭐ XP</span>
            <div className="pet-bar-track">
              <div className="pet-bar-fill pet-bar-fill--xp" style={{ width: `${xpInLevel}%` }} />
            </div>
            <span className="pet-bar-val">{xpInLevel}/100</span>
          </div>

          <div className="pet-bar-row">
            <span className="pet-bar-label">❤️ Hälsa</span>
            <div className="pet-bar-track">
              <div className="pet-bar-fill pet-bar-fill--health" style={{ width: `${health}%` }} />
            </div>
            <span className="pet-bar-val">{health}/100</span>
          </div>

          <div className="pp-actions">
            {editing ? (
              <>
                <button className="pp-cancel-btn" onClick={() => { setEditing(false); setName(pet?.name ?? ''); }}>
                  Avbryt
                </button>
                <button className="pp-save-btn" disabled={saving} onClick={save}>
                  {saving ? '...' : 'Spara'}
                </button>
              </>
            ) : (
              <button className="pp-save-btn" onClick={() => setEditing(true)}>
                ✏️ Byt namn
              </button>
            )}
          </div>
        </section>

        <div style={{ height: 16 }} />
      </main>

      <BottomNav active="pet" onNavigate={onNavigate} pet={pet} />
    </div>
  );
}
