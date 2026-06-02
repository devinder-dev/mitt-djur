import { useState } from 'react';
import './Auth.css';

/**
 * PetStep — Login Screen
 * Matches "Logga in.svg" design: warm beige bg, pill inputs, orange gradient button
 *
 * Props:
 *   onLogin(email, password)   — called on form submit
 *   onNavigateRegister()       — switch to Register screen
 */
export default function Login({ onLogin, onNavigateRegister }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Fyll i alla fält.'); return; }
    if (!email.includes('@'))  { setError('Ange en giltig e-postadress.'); return; }

    setLoading(true);
    try {
      await onLogin?.(email, password);
    } catch (err) {
      setError(err?.message ?? 'Inloggning misslyckades. Försök igen.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">

      {/* ── Branding ── */}
      <div className="auth-logo-wrap">
        <img src="/Racoon.png" alt="Rokkie" className="auth-rokkie" />
        <h1 className="auth-logo">Stompie</h1>
        <p className="auth-tagline">Välkommen tillbaka!</p>
      </div>

      {/* ── Form ── */}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>

        {error && (
          <div className="auth-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Email */}
        <div className="auth-input-wrap">
          <span className="auth-input-icon">✉️</span>
          <input
            className="auth-input"
            type="email"
            placeholder="E-postadress"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="auth-input-wrap">
          <span className="auth-input-icon">🔒</span>
          <input
            className="auth-input"
            type={showPass ? 'text' : 'password'}
            placeholder="Lösenord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-eye-btn"
            onClick={() => setShowPass(p => !p)}
            aria-label={showPass ? 'Dölj lösenord' : 'Visa lösenord'}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Submit */}
        <button
          className="auth-btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? <span className="auth-spinner" /> : 'Logga in'}
        </button>

      </form>

      {/* ── Footer ── */}
      <div className="auth-footer">
        <p className="auth-footer-text">
          Har du inget konto?{' '}
          <button type="button" className="auth-link" onClick={onNavigateRegister}>
            Skapa konto
          </button>
        </p>
      </div>

    </div>
  );
}
