import { useEffect, useState } from 'react';
import './App.css';
import * as friendsApi from '../api/friends.js';
import { petBaseImage } from '../lib/petImage.js';

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

/**
 * Friends + Leaderboard screen — two tabs in one.
 *
 * Props:
 *   user: { username, ... }
 *   onNavigate(screen)
 */
export default function Friends({ user, onNavigate }) {
  const [tab, setTab] = useState('friends');   // 'friends' | 'leaderboard'

  // ── Friends tab state ────────────────────────────────────────────────────
  const [friends, setFriends]     = useState([]);
  const [requests, setRequests]   = useState([]);
  const [addInput, setAddInput]   = useState('');
  const [addStatus, setAddStatus] = useState(null);  // { ok: bool, msg: string }
  const [busyId, setBusyId]       = useState(null);
  const [loadingF, setLoadingF]   = useState(true);

  // ── Leaderboard tab state ────────────────────────────────────────────────
  const [board, setBoard]   = useState([]);
  const [loadingL, setLoadingL] = useState(false);

  // ── Load friends data on mount ───────────────────────────────────────────
  useEffect(() => {
    loadFriends();
  }, []);

  async function loadFriends() {
    setLoadingF(true);
    try {
      const [f, r] = await Promise.all([
        friendsApi.getFriends(),
        friendsApi.getFriendRequests(),
      ]);
      setFriends(f);
      setRequests(r);
    } catch {
      /* ignored */
    } finally {
      setLoadingF(false);
    }
  }

  async function loadLeaderboard() {
    setLoadingL(true);
    try {
      const data = await friendsApi.getLeaderboard();
      setBoard(data);
    } catch {
      setBoard([]);
    } finally {
      setLoadingL(false);
    }
  }

  function handleTabSwitch(t) {
    setTab(t);
    if (t === 'leaderboard' && board.length === 0) loadLeaderboard();
  }

  // ── Add friend ────────────────────────────────────────────────────────────
  async function handleAdd() {
    const username = addInput.trim();
    if (!username) return;
    setBusyId('add');
    setAddStatus(null);
    try {
      await friendsApi.addFriend(username);
      setAddInput('');
      setAddStatus({ ok: true, msg: `Vänskapsförfrågan skickad till ${username}!` });
    } catch (e) {
      setAddStatus({ ok: false, msg: e.message ?? 'Kunde inte skicka förfrågan' });
    } finally {
      setBusyId(null);
    }
  }

  // ── Accept request ────────────────────────────────────────────────────────
  async function handleAccept(id) {
    setBusyId(id);
    try {
      await friendsApi.acceptRequest(id);
      await loadFriends();
    } catch {
      /* ignored */
    } finally {
      setBusyId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app-screen">

      {/* Header */}
      <header className="app-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="app-icon-btn"
            onClick={() => onNavigate('profile')}
            aria-label="Tillbaka"
            style={{ fontSize: 20, fontWeight: 700 }}
          >
            ←
          </button>
          <h1 className="app-topbar-title">Vänner</h1>
        </div>
      </header>

      {/* Tab bar */}
      <div className="friends-tabs">
        <button
          className={`friends-tab ${tab === 'friends' ? 'friends-tab--active' : ''}`}
          onClick={() => handleTabSwitch('friends')}
        >
          👥 Vänner
        </button>
        <button
          className={`friends-tab ${tab === 'leaderboard' ? 'friends-tab--active' : ''}`}
          onClick={() => handleTabSwitch('leaderboard')}
        >
          🏆 Topplista
        </button>
      </div>

      <main className="app-content">

        {/* ── Friends tab ─────────────────────────────────────────────── */}
        {tab === 'friends' && (
          <>
            {/* Add friend */}
            <div className="friends-add-row">
              <input
                className="friends-add-input"
                type="text"
                placeholder="Sök efter användarnamn..."
                value={addInput}
                onChange={e => { setAddInput(e.target.value); setAddStatus(null); }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <button
                className="friends-add-btn"
                onClick={handleAdd}
                disabled={busyId === 'add' || !addInput.trim()}
              >
                {busyId === 'add' ? '...' : 'Lägg till'}
              </button>
            </div>
            {addStatus && (
              <div className={`friends-status ${addStatus.ok ? 'friends-status--ok' : 'friends-status--err'}`}>
                {addStatus.msg}
              </div>
            )}

            {loadingF && (
              <div style={{ textAlign: 'center', padding: 32, color: '#A06B4A' }}>Laddar...</div>
            )}

            {/* Pending requests */}
            {requests.length > 0 && (
              <>
                <div className="friends-section-title">
                  Förfrågningar <span className="friends-badge">{requests.length}</span>
                </div>
                {requests.map(r => (
                  <div key={r.id} className="friends-request-row">
                    <div className="friends-avatar">
                      {r.from?.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="friends-request-name">{r.from?.username ?? 'Okänd'}</div>
                    <button
                      className="friends-accept-btn"
                      disabled={busyId === r.id}
                      onClick={() => handleAccept(r.id)}
                    >
                      {busyId === r.id ? '...' : '✓ Acceptera'}
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* Friends list */}
            {!loadingF && friends.length === 0 && requests.length === 0 && (
              <div className="friends-empty">
                <div style={{ fontSize: 44, marginBottom: 8 }}>👋</div>
                <div style={{ fontWeight: 700, color: '#7A4A31' }}>Inga vänner ännu</div>
                <div style={{ fontSize: 13, color: '#A06B4A', marginTop: 4 }}>
                  Sök efter ett användarnamn för att skicka en förfrågan!
                </div>
              </div>
            )}

            {friends.length > 0 && (
              <>
                <div className="friends-section-title">Dina vänner</div>
                {friends.map(f => (
                  <div key={f.userId} className="friends-friend-row">
                    <img
                      src={petBaseImage(f.pet?.petAnimal)}
                      alt={f.pet?.name ?? 'Djur'}
                      className="friends-pet-img"
                    />
                    <div className="friends-friend-info">
                      <div className="friends-friend-name">{f.username}</div>
                      <div className="friends-friend-sub">
                        {f.pet?.name ?? 'Djur'} • Niv. {f.pet?.level ?? 0}
                      </div>
                    </div>
                    <div className="friends-friend-health">
                      💚 {f.pet?.health ?? 0}
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* ── Leaderboard tab ─────────────────────────────────────────── */}
        {tab === 'leaderboard' && (
          <>
            {loadingL && (
              <div style={{ textAlign: 'center', padding: 32, color: '#A06B4A' }}>Laddar...</div>
            )}
            {!loadingL && board.length === 0 && (
              <div className="friends-empty">
                <div style={{ fontSize: 44, marginBottom: 8 }}>🏆</div>
                <div style={{ fontWeight: 700, color: '#7A4A31' }}>Inga spelare ännu</div>
                <div style={{ fontSize: 13, color: '#A06B4A', marginTop: 4 }}>
                  Lägg till vänner för att se topplistan!
                </div>
              </div>
            )}
            {board.map((entry, i) => (
              <div
                key={entry.userId}
                className={`friends-board-row ${entry.isMe ? 'friends-board-row--me' : ''}`}
              >
                <div className="friends-board-rank">
                  {i < 3 ? RANK_MEDAL[i] : `#${i + 1}`}
                </div>
                <img
                  src={petBaseImage(entry.pet?.petAnimal)}
                  alt={entry.username}
                  className="friends-board-pet"
                />
                <div className="friends-board-info">
                  <div className="friends-board-name">
                    {entry.username} {entry.isMe && <span className="friends-board-you">(du)</span>}
                  </div>
                  <div className="friends-board-sub">Niv. {entry.pet?.level ?? 0}</div>
                </div>
                <div className="friends-board-xp">{entry.pet?.xp ?? 0} XP</div>
              </div>
            ))}
          </>
        )}

        <div style={{ height: 24 }} />
      </main>
    </div>
  );
}
