import { useState } from 'react';
import './Auth.css';

/**
 * PetStep — Register Screen
 * Matches "Skapa konto.svg" design: warm beige bg, 3 pill inputs, orange gradient button
 *
 * Props:
 *   onRegister({ email, password, birthday }) — called on form submit
 *   onNavigateLogin()                         — switch back to Login
 */
// Local "today" as YYYY-MM-DD (sv-SE locale already formats this way) —
// used as the latest selectable birthday so the year field stays 4 digits.
const TODAY = new Date().toLocaleDateString('sv-SE');

export default function Register({ onRegister, onNavigateLogin }) {
  const [email, setEmail]       = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Ange en giltig e-postadress.'); return; }
    if (username.length < 3)         { setError('Användarnamnet måste vara minst 3 tecken.'); return; }
    if (password.length < 8)         { setError('Lösenordet måste vara minst 8 tecken.'); return; }
    if (!birthday)                   { setError('Ange ditt födelsedatum.'); return; }
    if (Number.isNaN(new Date(birthday).getTime()) || birthday < '1900-01-01' || birthday > TODAY) {
      setError('Ange ett giltigt födelsedatum.'); return;
    }

    setLoading(true);
    try {
      await onRegister?.({ email, username, password, birthday });
    } catch (err) {
      setError(err?.message ?? 'Registreringen misslyckades. Försök igen.');
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
        <p className="auth-tagline">Skapa ditt konto</p>
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

        {/* Username */}
        <div className="auth-input-wrap">
          <span className="auth-input-icon">👤</span>
          <input
            className="auth-input"
            type="text"
            placeholder="Användarnamn"
            value={username}
            onChange={e => setUsername(e.target.value.replace(/\s/g, ''))}
            autoComplete="username"
            maxLength={20}
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
            autoComplete="new-password"
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

        {/* Birthday */}
        <div className="auth-input-wrap">
          <span className="auth-input-icon">🎂</span>
          <input
            className="auth-input"
            type="date"
            placeholder="Födelsedag"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            min="1900-01-01"
            max={TODAY}
          />
        </div>

        {/* Submit */}
        <button
          className="auth-btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? <span className="auth-spinner" /> : 'Skapa konto'}
        </button>

      </form>

      {/* ── Footer ── */}
      <div className="auth-footer">
        <p className="auth-footer-text">
          Har du redan ett konto?{' '}
          <button type="button" className="auth-link" onClick={onNavigateLogin}>
            Logga in
          </button>
        </p>
      </div>

    </div>
  );
}
