import api from './api';

export const getTables = async () => {
  const { data } = await api.get('/tables');
  return data.data;
};

export const createReservation = async (payload) => {
  const { data } = await api.post('/reservations', payload);
  return data.data;
};

export const getMyReservations = async () => {
  const { data } = await api.get('/reservations/my-reservations');
  return data.data;
};

export const cancelReservation = async (id) => {
  const { data } = await api.delete(`/reservations/${id}`);
  return data.data;
};

export const getAllReservations = async (date) => {
  const { data } = await api.get('/reservations', { params: date ? { date } : {} });
  return data.data;
};

export const updateReservation = async (id, payload) => {
  const { data } = await api.put(`/reservations/${id}`, payload);
  return data.data;
};

// Fixed time slots must match backend/models/Reservation.js TIME_SLOTS enum
export const TIME_SLOTS = [
  '12:00-13:00',
  '13:00-14:00',
  '14:00-15:00',
  '18:00-19:00',
  '19:00-20:00',
  '20:00-21:00',
  '21:00-22:00',
];
