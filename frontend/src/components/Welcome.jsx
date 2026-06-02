import './Auth.css';

/**
 * Stompie — Welcome / Splash Screen
 * Matches "Welcome.svg" design: warm beige bg, large branding, orange gradient button
 *
 * Props:
 *   onNavigateRegister() — go to Register screen
 *   onNavigateLogin()    — go to Login screen
 */
export default function Welcome({ onNavigateRegister, onNavigateLogin }) {
  return (
    <div className="welcome-screen">

      {/* ── Hero / Branding ── */}
      <div className="welcome-hero">
        <img
          src="/Mascot.png"
          alt="Stoopie mascot"
          className="welcome-mascot"
        />
        <h1 className="welcome-title">Stompie</h1>
        <p className="welcome-subtitle">
          Ta hand om ditt virtuella djur genom att röra på dig. Gå steg — håll din kompis glad!
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="welcome-actions">
        <button className="auth-btn-primary" onClick={onNavigateRegister}>
          Skapa konto
        </button>
        <button className="welcome-btn-secondary" onClick={onNavigateLogin}>
          Logga in
        </button>
      </div>

    </div>
  );
}
