import axios from 'axios';
import { showAlert } from './alerts';

export const getBookingsInfo = async (bookingId) => {
  try {
    return await axios.get(`/api/v1/bookings/${bookingId}`);
  } catch (error) {
    showAlert('error', `No Booking found with this ID`);
  }
};
export const updateBookings = async (bookingId, { price, statu }) => {
  try {
    const res = await axios.patch(`/api/v1/bookings/${bookingId}`, {
      price,
      paid: statu,
    });

    if (res.status === 200) {
      showAlert('success', 'Booking Updated successfully 👍');
      window.setTimeout(() => {
        location.reload();
      }, 5000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
export const deleteBookings = async (bookingId) => {
  try {
    const res = await axios.delete(`/api/v1/bookings/${bookingId}`);

    if (res.status === 204) {
      showAlert('success', 'Booking Deleted 🥲');
      window.setTimeout(() => {
        location.reload();
      }, 5000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
