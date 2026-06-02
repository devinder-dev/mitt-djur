import { useState } from 'react';
import './PetSelect.css';

const PETS = [
  { id: 'tvattbjorn', label: 'Tvättbjörn', img: '/Racoon.png'                          },
  { id: 'katt',       label: 'Katt',       img: '/items/cat/kitty_cat_base.png'        },
  { id: 'igelkott',   label: 'Igelkott',   img: '/items/hedgehog/hedgehog_base.png'    },
];

const GOALS = [
  { id: 'be_active',     label: 'Var aktiv',         emoji: '🏃' },
  { id: 'drink_water',   label: 'Drick mer vatten',  emoji: '💧' },
  { id: 'sleep_better',  label: 'Sov bättre',        emoji: '🌙' },
  { id: 'meditate',      label: 'Meditera',           emoji: '🌿' },
  { id: 'read_more',     label: 'Läs mer',            emoji: '📖' },
  { id: 'workout',       label: 'Träna',              emoji: '💪' },
  { id: 'eat_healthy',   label: 'Ät hälsosamt',      emoji: '🥗' },
  { id: 'be_productive', label: 'Var produktiv',      emoji: '✅' },
  { id: 'quit_smoking',  label: 'Sluta röka',         emoji: '🚭' },
  { id: 'quit_snus',     label: 'Sluta snusa',        emoji: '🚫' },
];

/**
 * PetSelect — Choose your pet + name it + pick goals
 *
 * Props:
 *   onStart({ petId, petName, goals }) — called when user taps Starta
 *   onBack()                           — go back to Register
 */
export default function PetSelect({ onStart, onBack }) {
  const [step, setStep]         = useState('pet');   // 'pet' | 'goals'
  const [selected, setSelected] = useState('tvattbjorn');
  const [name, setName]         = useState('');
  const [goals, setGoals]       = useState([]);
  const [error, setError]       = useState('');

  // ── Step 1: Pick pet + name ────────────────────────────────────────────────

  function handleNextToGoals() {
    const trimmed = name.trim();
    if (trimmed.length < 3) {
      setError('Namnet måste vara minst 3 bokstäver.');
      return;
    }
    setError('');
    setStep('goals');
  }

  // ── Step 2: Pick goals ─────────────────────────────────────────────────────

  function toggleGoal(id) {
    setGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
    setError('');
  }

  function handleStart() {
    if (goals.length === 0) {
      setError('Välj minst ett mål.');
      return;
    }
    const pet = PETS.find(p => p.id === selected);
    onStart?.({ petId: selected, petLabel: pet.label, petName: name.trim(), goals });
  }

  // ── Render: pet selection step ─────────────────────────────────────────────

  if (step === 'pet') {
    return (
      <div className="petselect-screen">

        {/* Top bar */}
        <div className="petselect-topbar">
          <button className="petselect-back" onClick={onBack} aria-label="Tillbaka">
            ←
          </button>
        </div>

        {/* Title */}
        <h1 className="petselect-title">Välj ditt husdjur</h1>

        {/* Hero — three pets side by side */}
        <div className="petselect-hero">
          {PETS.map((pet, i) => (
            <img
              key={pet.id}
              src={pet.img}
              alt={pet.label}
              className={`petselect-hero-img ${i === 1 ? 'petselect-hero-img--center' : ''}`}
            />
          ))}
        </div>

        {/* Name input */}
        <div className="petselect-input-wrap">
          <span className="petselect-input-icon">🐾</span>
          <input
            className="petselect-input"
            type="text"
            placeholder="Ge ditt djur ett namn (minst 3 bokstäver)"
            value={name}
            onChange={e => { setName(e.target.value.replace(/[^\p{L} ]/gu, '')); setError(''); }}
            maxLength={20}
          />
        </div>

        {error && <p className="petselect-error" role="alert">{error}</p>}

        {/* Pet cards */}
        <div className="petselect-grid">
          {PETS.map(pet => (
            <button
              key={pet.id}
              className={`petselect-card ${selected === pet.id ? 'petselect-card--selected' : ''}`}
              onClick={() => setSelected(pet.id)}
              type="button"
            >
              {selected === pet.id && <span className="petselect-check">✓</span>}
              <img src={pet.img} alt={pet.label} className="petselect-card-img" />
              <span className="petselect-card-label">{pet.label}</span>
            </button>
          ))}
        </div>

        {/* Next button */}
        <button className="petselect-btn" onClick={handleNextToGoals}>
          Nästa →
        </button>

      </div>
    );
  }

  // ── Render: goals selection step ───────────────────────────────────────────

  return (
    <div className="petselect-screen">

      {/* Top bar */}
      <div className="petselect-topbar">
        <button className="petselect-back" onClick={() => setStep('pet')} aria-label="Tillbaka">
          ←
        </button>
      </div>

      {/* Title */}
      <h1 className="petselect-title">Välj dina mål</h1>
      <p className="petselect-subtitle">Välj minst ett mål — uppdragen anpassas efter det!</p>

      {error && <p className="petselect-error" role="alert">{error}</p>}

      {/* Goals grid */}
      <div className="petselect-goals-grid">
        {GOALS.map(g => (
          <button
            key={g.id}
            className={`petselect-goal-btn ${goals.includes(g.id) ? 'petselect-goal-btn--selected' : ''}`}
            onClick={() => toggleGoal(g.id)}
            type="button"
          >
            <span className="petselect-goal-emoji">{g.emoji}</span>
            <span className="petselect-goal-label">{g.label}</span>
            {goals.includes(g.id) && <span className="petselect-check petselect-check--goal">✓</span>}
          </button>
        ))}
      </div>

      {/* Start button */}
      <button className="petselect-btn" onClick={handleStart}>
        Starta 🐾
      </button>

    </div>
  );
}
