import React from 'react';

const statusBadge = (status) => {
  const map = {
    booked: 'bg-success',
    cancelled: 'bg-secondary',
    completed: 'bg-primary',
  };
  return <span className={`badge ${map[status] || 'bg-light text-dark'}`}>{status}</span>;
};

/**
 * Shared table for rendering a list of reservations. `isAdmin` toggles
 * the extra "Customer" column and edit controls so the same component
 * serves both MyReservations and AdminDashboard.
 */
const ReservationTable = ({ reservations, isAdmin, onCancel, onUpdateStatus }) => {
  if (!reservations || reservations.length === 0) {
    return <p className="text-muted">No reservations found.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover align-middle">
        <thead className="table-light">
          <tr>
            {isAdmin && <th>Customer</th>}
            <th>Table</th>
            <th>Date</th>
            <th>Time Slot</th>
            <th>Guests</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r._id}>
              {isAdmin && <td>{r.user?.name || 'N/A'}</td>}
              <td>
                #{r.table?.tableNumber} ({r.table?.capacity} seats)
              </td>
              <td>{r.date}</td>
              <td>{r.timeSlot}</td>
              <td>{r.guests}</td>
              <td>{statusBadge(r.status)}</td>
              <td className="d-flex gap-2">
                {r.status === 'booked' && (
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onCancel(r._id)}>
                    Cancel
                  </button>
                )}
                {isAdmin && r.status === 'booked' && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onUpdateStatus(r._id, 'completed')}
                  >
                    Mark Completed
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;
