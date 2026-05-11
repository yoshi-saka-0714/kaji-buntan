import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';

export default function LoginPage() {
  const { allUsers, login } = useAuth();
  const [selected, setSelected] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  function handleSelect(user: User) {
    setSelected(user);
    setPin('');
    setError('');
  }

  function handleLogin() {
    if (!selected) return;
    if (pin === selected.pin) {
      login(selected);
    } else {
      setError('PINが違います');
      setPin('');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>家事分担</h1>
        <p className="login-sub">あなたはどちら？</p>

        <div className="user-select">
          {allUsers.map((user) => (
            <button
              key={user.id}
              className={`user-btn${selected?.id === user.id ? ' selected' : ''}`}
              onClick={() => handleSelect(user)}
            >
              {user.name}
            </button>
          ))}
        </div>

        {selected && (
          <div className="pin-section">
            <p>{selected.name}のPIN</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="●●●●"
              className="pin-input"
              autoFocus
            />
            {error && <p className="error-msg">{error}</p>}
            <button
              onClick={handleLogin}
              className="btn-primary full-width"
              disabled={pin.length === 0}
            >
              ログイン
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
