/*es-lint disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const getUserInfo = async (email) => {
  try {
    return await axios.get(`/api/v1/users/${email}`);
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
export const updateUser = async (email, data) => {
  try {
    const res = await axios.patch(`/api/v1/users/${email}`, data);
    if (res.status === 200) {
      showAlert('success', 'User Updated successfully 👍', 10);
      window.setTimeout(() => {
        location.reload();
      }, 10000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
export const deleteUser = async (email) => {
  try {
    const res = await axios.delete(`/api/v1/users/${email}`);
    if (res.status === 204) {
      showAlert('success', 'User Deleted 🥲', 10);
      window.setTimeout(() => {
        location.reload();
      }, 10000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
