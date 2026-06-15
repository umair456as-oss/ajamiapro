/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthSystem from './components/AuthSystem';
import Dashboard from './components/Dashboard';
import PublicAdmissionForm from './components/PublicAdmissionForm';

function ProtectedRoute({ children, isLoggedIn }: { children: React.ReactNode, isLoggedIn: boolean }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  useEffect(() => {
    // Preserve the old logic for ?form=admission for backward compatibility
    const params = new URLSearchParams(window.location.search);
    if (params.get('form') === 'admission') {
      window.history.replaceState({}, '', '/admission-form');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthSystem onLogin={handleLogin} />} />
        <Route path="/admission-form" element={<PublicAdmissionForm />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Dashboard onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        {/* Redirect base / or /dashboard without trailing slash to dashboard */}
        <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

