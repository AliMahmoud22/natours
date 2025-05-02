/*es-lint disable*/
import axios from 'axios';
import { showAlert } from './alerts';

// export const signUp = async (name, email, photo, password, passwordConfirm) => {
export const signUp = async (data) => {
  try {
    const res = await axios.post(`/api/v1/users/signup`, data);
    // const res = await axios.post(`/api/v1/users/signup`, {
    //   name,
    //   email,
    //   photo,
    //   password,
    //   passwordConfirm,
    // });
    if (res.status === 201) {
      showAlert('success', 'registration succeeded');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
