/*es-lint disable*/

import axios from 'axios';
import { showAlert } from './alerts';

export const addTour = async (data) => {
  try {
    const res = await axios.post('/api/v1/tours', data);
    if (res.status === 201) {
      showAlert('success', 'Tour Created successfully ✌️');
      window.setTimeout(() => {
        location.reload();
      }, 3);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
export const updateTour = async (tourName, data) => {
  try {
    const res = await axios.patch(`/api/v1/tours/${tourName}`, data);
    if (res.status === 200) {
      showAlert('success', 'Tour Updated successfully 👍');
      window.setTimeout(() => {
        location.reload();
      }, 4000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};

export const deleteTour = async (name) => {
  try {
    const res = await axios.delete(`/api/v1/tours/${name}`);
    if (res.status === 204) {
      showAlert('success', 'tour Deleted 🥲');
      window.setTimeout(() => {
        location.reload();
      }, 3000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
