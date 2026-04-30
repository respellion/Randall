import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import type { AuthResponse } from './api/types';
import { AuthPage } from './pages/AuthPage';
import { AdminPage } from './pages/AdminPage';
import { PlannerPage } from './pages/PlannerPage';

function getStoredAuth(): AuthResponse | null {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('userName');
  const email = localStorage.getItem('userEmail');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  if (token && name && email) return { token, name, email, isAdmin };
  return null;
}

export default function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(getStoredAuth);

  function handleAuth(authData: AuthResponse) {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('userName', authData.name);
    localStorage.setItem('userEmail', authData.email);
    localStorage.setItem('isAdmin', String(authData.isAdmin));
    setAuth(authData);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAdmin');
    setAuth(null);
  }

  if (!auth) return <AuthPage onAuth={handleAuth} />;

  return (
    <Routes>
      <Route path="/" element={<PlannerPage auth={auth} onLogout={handleLogout} />} />
      <Route
        path="/admin"
        element={auth.isAdmin ? <AdminPage auth={auth} onLogout={handleLogout} /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
