/*eslint-disable*/
import axios from 'axios';
import Stripe from 'stripe';
const stripe = new Stripe(
  'pk_test_51RDlLM4JEYuvsGHlLmvrz50tzhdCcxc18yfoj8SNvdFF4dq1eYvDW6HmoPeBXMkanpljDZ8sbLtZxjBx0qjQI0fd00DGLAjlba',
);
export const createSession = async (tourId) => {
  const session = await axios(
    `http://127.0.0.1:3000/api/v1/bookings/checkout/${tourId}`,
  );
  window.location.assign(session.data.session.url);
};
