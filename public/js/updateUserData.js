import axios from 'axios';
import { showAlert } from './alerts';

export const updateUserSettings = async (data, type) => {
  const url =
    type == 'data'
      ? 'http://127.0.0.1:3000/api/v1/users/me'
      : 'http://127.0.0.1:3000/api/v1/users/updatePassword';
  try {
    console.log(data, url);
    const res = await axios.patch(url, data);
    console.log(res);
    if (res.status == 200) {
      showAlert('success', 'settings updated successfully');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
