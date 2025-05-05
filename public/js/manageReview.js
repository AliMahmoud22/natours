import axios from 'axios';
import { showAlert } from './alerts';

export const getReviewInfo = async (username, tourName) => {
  try {
    return await axios.get(`/api/v1/reviews/${username}/${tourName}`);
  } catch (error) {
    showAlert('error', `no Review found with this username and tour name`);
  }
};
export const updateReview = async (username, tourName, data) => {
  try {
    const res = await axios.patch(`/api/v1/reviews/${username}/${tourName}`, {
      review: data,
    });

    if (res.status === 200) {
      showAlert('success', 'Review Updated successfully 👍');
      window.setTimeout(() => {
        location.reload();
      }, 5000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
export const deleteReview = async (username, tourName) => {
  try {
    const res = await axios.delete(`/api/v1/reviews/${username}/${tourName}`);

    if (res.status === 204) {
      showAlert('success', 'Review Deleted 🥲');
      window.setTimeout(() => {
        location.reload();
      }, 5000);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
