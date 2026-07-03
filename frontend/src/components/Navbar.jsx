import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">
        🍽️ Reservations
      </Link>
      <div className="d-flex ms-auto align-items-center gap-3">
        {!user && (
          <>
            <Link className="nav-link text-white" to="/login">
              Login
            </Link>
            <Link className="nav-link text-white" to="/register">
              Register
            </Link>
          </>
        )}

        {user && user.role === 'customer' && (
          <>
            <Link className="nav-link text-white" to="/reserve">
              New Reservation
            </Link>
            <Link className="nav-link text-white" to="/my-reservations">
              My Reservations
            </Link>
          </>
        )}

        {user && user.role === 'admin' && (
          <Link className="nav-link text-white" to="/admin">
            Admin Dashboard
          </Link>
        )}

        {user && (
          <>
            <span className="text-white-50 small">
              {user.name} ({user.role})
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
