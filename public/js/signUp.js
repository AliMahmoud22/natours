/*es-lint disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const signUp = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios.post(`/api/v1/users/signup`, {
      name,
      email,
      password,
      passwordConfirm,
    });
    console.log(res.status);
    if (res.status === 201) {
      showAlert('success', 'registration succeeded');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message);
  }
};
