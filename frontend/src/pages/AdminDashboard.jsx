import React, { useEffect, useState } from 'react';
import {
  getAllReservations,
  cancelReservation,
  updateReservation,
} from '../services/reservationService';
import ReservationTable from '../components/ReservationTable';

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReservations = async (date) => {
    setLoading(true);
    try {
      const data = await getAllReservations(date);
      setReservations(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    loadReservations(dateFilter || undefined);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    await cancelReservation(id);
    loadReservations(dateFilter || undefined);
  };

  const handleUpdateStatus = async (id, status) => {
    await updateReservation(id, { status });
    loadReservations(dateFilter || undefined);
  };

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <h2 className="mb-4">Admin Dashboard — All Reservations</h2>

      <form className="d-flex gap-2 mb-4" onSubmit={handleFilter} style={{ maxWidth: 360 }}>
        <input
          type="date"
          className="form-control"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
        <button type="submit" className="btn btn-dark">
          Filter
        </button>
        {dateFilter && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setDateFilter('');
              loadReservations();
            }}
          >
            Clear
          </button>
        )}
      </form>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ReservationTable
          reservations={reservations}
          isAdmin
          onCancel={handleCancel}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
