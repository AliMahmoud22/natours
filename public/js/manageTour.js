/*es-lint disable*/

import axios from 'axios';
import { showAlert } from './alerts';

export const addTour = async (data) => {
  const res = await axios.post('/api/v1/tours', data);
  if (res.status === 201) {
    showAlert('success', 'Tour Created successfully ✌️');
    window.setTimeout(() => {
      location.reload();
    }, 3);
  }
};
export const updateTour = async (tourName, data) => {
  const res = await axios.patch(`/api/v1/tours/${tourName}`, data);
  if (res.status === 200) {
    showAlert('success', 'Tour Updated successfully 👍');
    // window.setTimeout(() => {
    //   location.reload();
    // }, 3);
  }
};

export const deleteTour = async (name) => {
  const res = await axios.delete(`/api/v1/tours/${name}`);
  if (res.status === 204) {
    showAlert('success', 'tour Deleted 🥲');
    window.location('/manage-tours');
  }
};
