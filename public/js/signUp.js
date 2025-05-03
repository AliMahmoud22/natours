/*es-lint disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const signUp = async (data) => {
  try {
    const res = await axios.post(`/api/v1/users/signup`, data);
    if (res.status === 201) {
      showAlert('success', 'registration succeeded');
      window.setTimeout(() => {
        location.assign('/');
      }, 5500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
