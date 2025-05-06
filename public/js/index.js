/*eslint-disable*/
//this file more likely used to get the data then do actions
import { displayMap } from './mapbox';
import { login } from './login';
import { signUp } from './signUp';
import { logout } from './logout';
import { updateUserSettings } from './updateUserData';
import { createSession } from './checkout';
import { showAlert } from './alerts';
import { addTour, updateTour, deleteTour } from './manageTour';
import { getUserInfo, deleteUser, updateUser } from './manageUser';
import { getReviewInfo, updateReview, deleteReview } from './manageReview';
import {
  getBookingsInfo,
  updateBookings,
  deleteBookings,
} from './manageBooking';
//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutLink = document.querySelector('.nav__el--logout');
const updateUserData = document.querySelector('.form-user-data');
const updateUserPassword = document.querySelector('.form-user-settings');
const checkoutBtn = document.getElementById('bookTour');
const signupForm = document.querySelector('.form--signUp');
const manageTourForm = document.querySelector('.form_admin_input');
const addLocations = document.getElementById('add-location');
const manageUserForm = document.getElementById('manageUserForm');
const manageReviewForm = document.getElementById('manageReviewForm');
const manageBookingForm = document.getElementById('manageBookingForm');

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
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    form.append('password', document.getElementById('password').value);
    form.append(
      'passwordConfirm',
      document.getElementById('passwordConfirm').value,
    );
    await signUp(form);
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
const alertMesg = document.querySelector('body').dataset.alert;
if (alertMesg) {
  showAlert('success', alertMesg, 7);
  document.querySelector('body').dataset.alert = '';
}

const formMode = (modeSelect, formFields, actions) => {
  modeSelect.addEventListener('change', function () {
    const selected = this.value;
    // Show/hide rest of the form fields
    if (selected === 'delete') {
      //to disable required fields that are hidden

      formFields.querySelectorAll('input, textarea, select').forEach((el) => {
        if (el.hasAttribute('data-required')) {
          el.removeAttribute('required');
          el.disabled = true;
        }
      });
      //hide unnecessary fields
      formFields.style.display = 'none';
      // Show only delete buttons
      actions.querySelectorAll('button').forEach((btn) => {
        btn.style.display = btn.value === selected ? 'inline-block' : 'none';
      });
      //hide get User in manage user form
      const getUserInfoBtn = document.getElementById('getuserinfo');
      if (getUserInfoBtn) getUserInfoBtn.style.display = 'none';
      //hide get Review in manage Review form
      const getReviewInfoBtn = document.getElementById('getReviewinfo');
      if (getReviewInfoBtn) getReviewInfoBtn.style.display = 'none';
      const getBookinginfo = document.getElementById('getBookinginfo');
      if (getBookinginfo) getBookinginfo.style.display = 'none';
    }
    //show the whole form in add / edit tour
    else {
      formFields.style.display = 'contents';
      formFields.querySelectorAll('input, textarea, select').forEach((el) => {
        if (el.hasAttribute('data-required')) {
          if (selected === 'add') {
            if (!el.hasAttribute('updatename')) {
              el.setAttribute('required', '');
              el.disabled = false;
            } else {
              el.removeAttribute('required');
              el.disabled = true;
              el.parentElement.style.display = 'none';
            }
          }
          //selected = update
          else if (selected === 'update') {
            if (el.hasAttribute('updatename'))
              el.parentElement.style.display = 'inline-block';
            el.disabled = false;
            el.removeAttribute('required'); // admin can edit any field not all of them
            // el.setAttribute('required', '');
          }
        }
      });

      // Show only add or update buttons
      actions.querySelectorAll('button').forEach((btn) => {
        btn.style.display = btn.value === selected ? 'inline-block' : 'none';
        if (btn.value === 'addlocation') btn.style.display = 'inline-block';
      });
      //show get User in manage User form
      const getUserInfoBtn = document.getElementById('getuserinfo');
      if (getUserInfoBtn) getUserInfoBtn.style.display = 'inline-block';
      //show get Review in manage Review form
      const getReviewInfoBtn = document.getElementById('getReviewinfo');
      if (getReviewInfoBtn) getReviewInfoBtn.style.display = 'inline-block';
      const getBookinginfo = document.getElementById('getBookinginfo');
      if (getBookinginfo) getBookinginfo.style.display = 'inline-block';
    }
  });
  modeSelect.dispatchEvent(new Event('change'));
};

if (manageTourForm) {
  //to show up delete form or add / edit form
  const modeSelect = document.getElementById('formMode');
  const formFields = document.querySelector('.form-fields');
  const actions = document.querySelector('.actions');
  formMode(modeSelect, formFields, actions);
  //listen to add location button if admin wants to add more locations
  addLocations.addEventListener('click', () => {
    const container = document.getElementById('locations-container');
    const locationCount = container.children.length;

    const newLocation = document.createElement('div');
    newLocation.classList.add('location-item');
    newLocation.innerHTML = `
    <label class="form__label" class="form__label" for="coordinates">Coordinates</label>
    <input type="text" name="locations[${locationCount}][coordinates]" placeholder="Latitude, Longitude" data-required='' required />

    <label class="form__label" for="address">Address</label>
    <input type="text" name="locations[${locationCount}][address]" placeholder="Address" data-required='' required />

    <label class="form__label" for="description">Description</label>
    <input type="text" name="locations[${locationCount}][description]" placeholder="Description" data-required='' required />

    <label class="form__label" for="day">Day</label>
    <input type="date" name="locations[${locationCount}][day]" placeholder="Day" data-required='' required />
  `;
    container.appendChild(newLocation);
  });
  // listen to form event
  manageTourForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const clickedButton = document.activeElement; // The button that triggered the form submission
    const action = clickedButton.value; // Get the value of the clicked button
    let tourname;
    //delete Tour
    if (action === 'delete') {
      tourname = document.getElementById('name').value;
      await deleteTour(tourname);
    } else {
      // Use FormData directly from the form
      const formData = new FormData(manageTourForm);
      const finalForm = new FormData();
      // Append additional fields for locations and startLocation
      let locations = [];
      let startLocation = {};
      let startDates = [];
      let guides = [];
      // Process location fields
      formData.forEach((value, key) => {
        const match = key.match(/^locations\[(\d+)]\[(.+)]$/); // Match keys like "locations[0][coordinates]"
        if (value) {
          if (match) {
            const index = match[1]; // Extract the index (e.g., "0")
            const field = match[2]; // Extract the field name (e.g., "coordinates")
            // Ensure the locations array has an object for this index
            if (!locations[index]) locations[index] = {};
            // Check if the field is coordinates, then split and reverse it
            if (field === 'coordinates') {
              value = value
                .split(',')
                .reverse()
                .map((coord) => parseFloat(coord)); // MongoDB accepts [lng, lat]
            }

            if (field === 'day') {
              value = new Date(value).toISOString();
              startDates.push(value);
            }
            // Add the first location as startLocation
            if (index === '0') {
              startLocation[field] = value;
            }

            // Assign the value to the corresponding field in the object
            locations[index][field] = value;
          } else {
            if (key === 'guides') {
              guides = value.split(',');
            } else {
              //update tour slag with the new name
              if (key === 'updatedName') {
                finalForm.set('name', value);
                finalForm.append('slug', value.replaceAll(' ', '-'));
              } // only in update method
              else {
                finalForm.append(key, value);
              }
            }
          }
        }
      });
      // Append locations and startLocation to FormData
      if (locations.length > 0) {
        finalForm.append('locations', JSON.stringify(locations)); // parse json in backend
      }
      if (Object.keys(startLocation).length > 0) {
        finalForm.append('startLocation', JSON.stringify(startLocation));
      }
      if (guides.length > 0) {
        finalForm.append('guides', JSON.stringify(guides));
      }
      if (startDates.length > 0) {
        startDates.forEach((date) => finalForm.append('startDates', date)); // Append each date individually
      }
      // Add Tour
      if (action === 'add') {
        await addTour(finalForm);
      }
      // Update Tour
      else if (action === 'update') {
        tourname = document.getElementById('name').value;
        await updateTour(tourname, finalForm);
      }
    }
  });
}
if (manageUserForm) {
  //to show formFields related to admin selection
  const modeSelect = document.getElementById('formMode');
  const formFields = document.querySelector('.form-fields');
  const actions = document.querySelector('.actions');
  const emailElement = document.getElementById('email');

  formMode(modeSelect, formFields, actions);
  //fetch user info when admin click get user
  const fetchUserForm = document.getElementById('fetchUserForm');

  fetchUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailElement.value;
    const res = await getUserInfo(email);

    if (res.status === 200) {
      const user = res.data.doc;
      // Populate the form with user data
      document.getElementById('name').value = user.name;
      document.getElementById('role').value = user.role;
      const img = document.querySelector('.form__user-photo');
      img.removeAttribute('src');
      img.setAttribute('src', `img/users/${user.photo}`);

      // Show the user management form
      manageUserForm.style.display = 'block';
    } else {
      showAlert('error', 'User not found!');
    }
  });

  manageUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clickedButton = document.activeElement; // The button that triggered the form submission
    const action = clickedButton.value;
    let email = emailElement.value;
    if (action == 'update') {
      const newform = new FormData();
      const email = document.getElementById('email').value;
      const name = document.getElementById('name').value;
      const role = document.getElementById('role').value;
      const photo = document.getElementById('photo').files[0];
      newform.append('email', email);
      if (name) newform.append('name', name);
      if (role) newform.append('role', role);
      if (photo) newform.append('photo', photo);

      await updateUser(email, newform);
    } else await deleteUser(email);
  });
}
if (manageReviewForm) {
  //to show up form-fields and hide it if admin wants to delete
  const formFields = document.querySelector('.form-fields');
  const mode_select = document.getElementById('formMode');
  const actions = document.querySelector('.actions');
  formMode(mode_select, formFields, actions);
  const getReviewInfoForm = document.getElementById('fetchReviewForm');
  let userName;
  let tourName;
  //listen to get review data
  getReviewInfoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    userName = document.getElementById('username').value;
    tourName = document.getElementById('tourname').value;
    const res = await getReviewInfo(userName, tourName);
    if (res.status === 200) {
      // Populate the review text
      document.getElementById('reviewText').value = res.data.doc.review;

      // Populate the rating in the rateContainer
      const rateContainer = document.getElementById('rating_section');
      rateContainer.innerHTML = ''; // Clear any existing stars
      let stars = 1;
      while (stars <= 5) {
        const starClass = stars > res.data.doc.rating ? 'inactive' : 'active';
        const starHTML = `
          <svg class="reviews__star reviews__star--${starClass}">
            <use xlink:href="/img/icons.svg#icon-star"></use>
          </svg>`;
        rateContainer.innerHTML += starHTML;
        stars++;
      }
    } else {
      showAlert('error', 'Review not found!', 20);
    }
  });
  //admin can only change review text not rate
  manageReviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clickedButton = document.activeElement; // The button that triggered the form submission
    const action = clickedButton.value;
    if (action == 'update') {
      const reviewNewText = document.getElementById('reviewText').value;
      await updateReview(userName, tourName, reviewNewText);
    } else await deleteReview(userName, tourName);
  });
}

if (manageBookingForm) {
  //to show up form-fields and hide it if admin wants to delete
  const formFields = document.querySelector('.form-fields');
  const mode_select = document.getElementById('formMode');
  const actions = document.querySelector('.actions');
  formMode(mode_select, formFields, actions);

  const getBookingInfoForm = document.getElementById('fetchBookingForm');
  let userName;
  let tourName;
  let bookingId;
  //listen to get review data
  getBookingInfoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // userName = document.getElementById('username').value;
    // tourName = document.getElementById('tourname').value;
    bookingId = document.getElementById('bookingId').value;
    const res = await getBookingsInfo(bookingId);
    if (res.status === 200) {
      // Populate the booking price
      document.getElementById('BookingPrice').value = res.data.doc.price;

      // Populate the rating in the rateContainer
      document.getElementById('statu').value = res.data.doc.paid;
    } else {
      showAlert('error', 'Booking not found!');
    }
  });

  //admin can  change Booking statu or price
  manageBookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const clickedButton = document.activeElement; // The button that triggered the form submission
    const action = clickedButton.value;
    if (action == 'update') {
      const price = document.getElementById('BookingPrice').value;
      // const statu = document.getElementById('statu').value ? 'true' : 'false';
      const statu = document.getElementById('statu').value;
      console.log(price, statu);
      await updateBookings(bookingId, { price, statu });
    } else await deleteBookings(bookingId);
  });
}
