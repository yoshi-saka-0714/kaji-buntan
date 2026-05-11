import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserName } from '../lib/api';

function HeaderUser() {
  const { currentUser, login, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!currentUser || !name.trim() || saving) return;
    setSaving(true);
    try {
      const updated = await updateUserName(currentUser.id, name.trim());
      login(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="header-edit">
        <input
          className="header-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setEditing(false);
          }}
          autoFocus
        />
        <button onClick={handleSave} className="header-save-btn" disabled={saving}>保存</button>
        <button onClick={() => setEditing(false)} className="header-cancel-btn">✕</button>
      </div>
    );
  }

  return (
    <div className="header-user">
      <span className="header-name">{currentUser?.name}</span>
      <button onClick={() => { setName(currentUser?.name || ''); setEditing(true); }} className="edit-name-btn" title="名前を変更">✏️</button>
      <button onClick={logout} className="logout-btn">ログアウト</button>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="header-title">🌌 家事分担</span>
        <HeaderUser />
      </header>

      <main className="app-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">📊</span>
          <span>ホーム</span>
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">✅</span>
          <span>タスク</span>
        </NavLink>
        <NavLink to="/manage" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <span className="nav-icon">⚙️</span>
          <span>管理</span>
        </NavLink>
      </nav>
    </div>
  );
}
