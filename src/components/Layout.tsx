import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="header-title">家事分担</span>
        <div className="header-user">
          <span>{currentUser?.name}</span>
          <button onClick={logout} className="logout-btn">ログアウト</button>
        </div>
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
