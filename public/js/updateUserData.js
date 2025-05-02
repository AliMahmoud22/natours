import axios from 'axios';
import { showAlert } from './alerts';

export const updateUserSettings = async (data, type) => {
  const url =
    type == 'data' ? '/api/v1/users/me' : '/api/v1/users/updatePassword';
  try {
    const res = await axios.patch(url, data);
    if (res.status == 200) {
      showAlert('success', 'settings updated successfully');
      window.setTimeout(() => {
        location.reload();
      }, 2);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
