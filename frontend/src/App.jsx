import { useState, useEffect, useCallback } from 'react';
import Welcome       from './components/Welcome';
import Login         from './components/Login';
import Register      from './components/Register';
import PetSelect     from './components/PetSelect';
import Home          from './components/Home';
import Missions      from './components/Missions';
import Shop          from './components/Shop';
import PetScreen     from './components/PetScreen';
import Profile       from './components/Profile';
import Notifications from './components/Notifications';
import Friends       from './components/Friends';
import * as authApi  from './api/auth.js';
import * as usersApi from './api/users.js';
import * as petApi   from './api/pet.js';

export default function App() {
  const [screen, setScreen]         = useState('welcome');
  const [user, setUser]             = useState(null);
  const [pet, setPet]               = useState(null);
  const [coins, setCoins]           = useState(0);
  const [pendingReg, setPendingReg] = useState(null);

  const loadProfile = useCallback(async () => {
    const profile = await usersApi.getMe();
    setUser(profile);
    setCoins(profile.coins ?? 0);
    try {
      const petData = await petApi.getPet();
      setPet(petData);
    } catch {
      setPet(null);
    }
  }, []);

  // Try to restore session from the httpOnly refresh-token cookie on app load
  useEffect(() => {
    authApi.tryRestoreSession().then(ok => {
      if (ok) {
        loadProfile()
          .then(() => setScreen('home'))
          .catch(() => {});
      }
    });
  }, [loadProfile]);

  async function handleLogin(email, password) {
    await authApi.login(email, password);
    await loadProfile();
    setScreen('home');
  }

  function handleRegister({ email, username, password, birthday }) {
    setPendingReg({ email, username, password, birthday });
    setScreen('petselect');
  }

  async function handlePetStart({ petId, petName, goals }) {
    const { email, username, password } = pendingReg;
    await authApi.register(email, username, password);
    // Save chosen pet animal + user's real goals (no more hardcoded 'be_active')
    await usersApi.completeOnboarding(petId, goals);
    // Save the pet name the user typed in PetSelect
    if (petName) await petApi.updatePetName({ name: petName });
    await loadProfile();
    setPendingReg(null);
    setScreen('home');
  }

  async function handleSaveProfile({ username }) {
    const profile = await usersApi.updateMe({ username });
    setUser(profile);
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      /* ignore — always clear locally */
    }
    setUser(null);
    setPet(null);
    setCoins(0);
    setScreen('welcome');
  }

  const navProps = { onNavigate: setScreen };

  return (
    <>
      {screen === 'welcome' && (
        <Welcome
          onNavigateRegister={() => setScreen('register')}
          onNavigateLogin={() => setScreen('login')}
        />
      )}

      {screen === 'login' && (
        <Login
          onLogin={handleLogin}
          onNavigateRegister={() => setScreen('register')}
        />
      )}

      {screen === 'register' && (
        <Register
          onRegister={handleRegister}
          onNavigateLogin={() => setScreen('login')}
        />
      )}

      {screen === 'petselect' && (
        <PetSelect
          onStart={handlePetStart}
          onBack={() => setScreen('register')}
        />
      )}

      {screen === 'home' && user && (
        <Home
          user={user}
          pet={pet}
          onPetUpdate={setPet}
          {...navProps}
        />
      )}

      {screen === 'missions' && user && (
        <Missions
          user={user}
          pet={pet}
          onPetUpdate={setPet}
          onCoinsUpdate={(updater) => setCoins(c => (typeof updater === 'function' ? updater(c) : updater))}
          {...navProps}
        />
      )}

      {screen === 'pet' && user && (
        <PetScreen
          pet={pet}
          onPetUpdate={setPet}
          {...navProps}
        />
      )}

      {screen === 'shop' && user && (
        <Shop
          coins={coins}
          pet={pet}
          onCoinsUpdate={(updater) => setCoins(c => (typeof updater === 'function' ? updater(c) : updater))}
          {...navProps}
        />
      )}

      {screen === 'profile' && user && (
        <Profile
          user={user}
          pet={pet}
          onSave={handleSaveProfile}
          onLogout={handleLogout}
          {...navProps}
        />
      )}

      {screen === 'notifications' && user && (
        <Notifications onNavigate={setScreen} />
      )}

      {screen === 'friends' && user && (
        <Friends user={user} onNavigate={setScreen} />
      )}
    </>
  );
}
