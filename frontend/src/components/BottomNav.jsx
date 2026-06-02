import { petBaseImage } from '../lib/petImage.js';
import { useEquippedPreview } from '../lib/useEquippedPreview.js';

/**
 * BottomNav — fixed bottom tab bar across in-app screens.
 *
 * Props:
 *   active: 'home' | 'missions' | 'pet' | 'shop' | 'profile'
 *   onNavigate(screen)
 *   pet: the user's pet (used to show the right animal in the center button)
 */
export default function BottomNav({ active, onNavigate, pet }) {
  const equippedPreview = useEquippedPreview();   // show the worn accessory on the center pet button
  const tabs = [
    { id: 'home',     icon: '🏠', label: 'Hem' },
    { id: 'missions', icon: '🚩', label: 'Uppdrag' },
  ];
  const tabsRight = [
    { id: 'shop',    icon: '🛒', label: 'Butik' },
    { id: 'profile', icon: '👤', label: 'Profil' },
  ];

  return (
    <nav className="app-bottomnav">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`app-nav-btn ${active === t.id ? 'app-nav-btn-active' : ''}`}
          onClick={() => onNavigate(t.id)}
        >
          <span className="app-nav-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}

      <button
        className={`app-nav-btn ${active === 'pet' ? 'app-nav-btn-active' : ''}`}
        onClick={() => onNavigate('pet')}
        aria-label="Mitt djur"
      >
        <span className="app-nav-center">
          <img src={equippedPreview ?? petBaseImage(pet?.petAnimal)} alt="Mitt djur" />
        </span>
      </button>

      {tabsRight.map(t => (
        <button
          key={t.id}
          className={`app-nav-btn ${active === t.id ? 'app-nav-btn-active' : ''}`}
          onClick={() => onNavigate(t.id)}
        >
          <span className="app-nav-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
