import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyReservations, cancelReservation } from '../services/reservationService';
import ReservationTable from '../components/ReservationTable';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await getMyReservations();
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

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    await cancelReservation(id);
    loadReservations();
  };

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Reservations</h2>
        <Link to="/reserve" className="btn btn-dark btn-sm">
          + New Reservation
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ReservationTable reservations={reservations} isAdmin={false} onCancel={handleCancel} />
      )}
    </div>
  );
};

export default MyReservations;
