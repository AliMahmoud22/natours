/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const logout = async () => {
  try {
    const res = await axios.get('/api/v1/users/logout');
    showAlert('success', 'logged out successfully');
    // if (res.data.status == 'success') location.reload(true);
    if (res.data.status == 'success') {
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', 'error happened while loggin out');
  }
};
