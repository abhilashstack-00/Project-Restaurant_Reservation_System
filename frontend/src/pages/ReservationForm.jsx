import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createReservation, TIME_SLOTS } from '../services/reservationService';

const ReservationForm = () => {
  const [form, setForm] = useState({ date: '', timeSlot: TIME_SLOTS[0], guests: 2 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const reservation = await createReservation({
        ...form,
        guests: Number(form.guests),
      });
      setResult(reservation);
    } catch (err) {
      setError(err.response?.data?.message || 'No tables available for the selected date and time.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container" style={{ maxWidth: 480, marginTop: '3rem' }}>
      <h2 className="mb-4">Make a Reservation</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {result && (
        <div className="alert alert-success">
          Booked! Table #{result.table.tableNumber} ({result.table.capacity} seats) on {result.date} at{' '}
          {result.timeSlot}.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            className="form-control"
            min={today}
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Time Slot</label>
          <select name="timeSlot" className="form-select" value={form.timeSlot} onChange={handleChange}>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Number of Guests</label>
          <input
            type="number"
            name="guests"
            className="form-control"
            min={1}
            max={20}
            value={form.guests}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-dark w-100" disabled={loading}>
          {loading ? 'Checking availability...' : 'Reserve Table'}
        </button>
      </form>

      <p className="mt-3">
        <Link to="/my-reservations">View my reservations →</Link>
      </p>
    </div>
  );
};

export default ReservationForm;
