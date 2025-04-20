/*eslint-disable*/
//this file more likely used to get the data then do actions
import { displayMap } from './mapbox';
import { login } from './login';
import { logout } from './logout';
import { updateUserSettings } from './updateUserData';
import { createSession } from './checkout';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutLink = document.querySelector('.nav__el--logout');
const updateUserData = document.querySelector('.form-user-data');
const updateUserPassword = document.querySelector('.form-user-settings');
const checkoutBtn = document.getElementById('bookTour');
// VALUES

// DELEGATIONS
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const passward = document.getElementById('password').value;
    login(email, passward);
  });
}
if (logoutLink) {
  logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}
if (updateUserData) {
  updateUserData.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    document.querySelector('.btn--save--settings').textContent = 'updating...';
    await updateUserSettings(form, 'data');
    document.querySelector('.btn--save--settings').textContent =
      'SAVE SETTINGS';
  });
}

if (updateUserPassword) {
  updateUserPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const newPasswordConfirm =
      document.getElementById('password-confirm').value;

    document.querySelector('.btn--save--password').textContent = 'updating...';
    await updateUserSettings(
      { password, newPassword, newPasswordConfirm },
      'password',
    );
    document.querySelector('.btn--save--password').textContent =
      'SAVE PASSWORD';
  });
  document.getElementById('password-current').textContent = '';
  document.getElementById('password').textContent = '';
  document.getElementById('password-confirm').textContent = '';
}
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    checkoutBtn.textContent = 'processing...';
    createSession(checkoutBtn.dataset.tourId);
  });
}
