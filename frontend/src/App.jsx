import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ReservationForm from './pages/ReservationForm';
import MyReservations from './pages/MyReservations';
import AdminDashboard from './pages/AdminDashboard';

// Sends a logged-in user to the right home page for their role, and an
// anonymous visitor to login.
const Home = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/reserve'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/reserve"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ReservationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reservations"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <MyReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
