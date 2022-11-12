'use strict';
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const cadence = document.querySelector(`.cadence`);
const cycle = document.querySelector(`.cycle`);
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###// ###
class MainWorkout {
  constructor(type, distance, duration) {
    this.type = type;
    this.distance = distance;
    this.duration = duration;
    this._addDesc();
    this._getDate();
    this._getID();
  }
  _addDesc() {
    this.description = this.type.replace(
      this.type[0],
      this.type[0].toUpperCase()
    );
  }
  _getDate() {
    const dateNum = new Date().getMonth();
    const dayNum = new Date().getDate();
    this.date = `${months[dateNum]} ${dayNum}`;
  }
  _getPos() {
    this.pos = pos;
  }
  _getID() {
    this.id = Date.now();
  }
}
class Running extends MainWorkout {
  constructor(type, distance, duration, cadence, pos) {
    super(type, distance, duration);
    this.cadence = cadence;
    this.pos = pos;
    this._calcPace();
  }
  _calcPace() {
    this.pace = +(this.duration / this.distance).toFixed(1);
    return this.pace;
  }
}
class Cycling extends MainWorkout {
  constructor(type, distance, duration, elevation, pos) {
    super(type, distance, duration);
    this.elevation = elevation;
    this.pos = pos;
    this._calcSpeed();
  }
  _calcSpeed() {
    this.speed = +(this.distance / (this.duration / 60)).toFixed(1);
    return this.speed;
  }
}
class Map {
  #map;
  #workouts = [];
  #workout;
  #pos;
  constructor() {
    this._getPosition();
    form.addEventListener(`submit`, this._formListener.bind(this));
    inputType.addEventListener(`change`, this._changeType);
    containerWorkouts.addEventListener(`click`, this._scrollToPos.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._mainMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
  }
  _mainMap(position) {
    const { latitude: lat, longitude: lon } = position.coords;
    this.#map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on(`click`, this._showForm.bind(this));
  }
  _addPopUpMarker(pos) {
    const { lat, lng } = pos.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${this.#workout.type}-popup`,
        })
      )
      // prettier-ignore
      .setPopupContent(
        `${this.#workout.type === `running` ? `🏃‍♂️` : `🚲`} 
         ${this.#workout.description} on ${this.#workout.date}`
      )
      .openPopup();
  }
  _showForm(pos) {
    form.classList.remove(`hidden`);
    this.#pos = pos;
  }
  _hideForm() {
    form.classList.add(`hidden`);
  }
  _checkNaN(...values) {
    console.log(values);
    console.log(values.every(el => Number.isNaN(Number(el))));
    return values.every(el => Number.isNaN(Number(el)));
  }
  _checkZero(...values) {
    return values.every(el => el < 0);
  }
  _formListener(e) {
    e.preventDefault();
    if (inputType.value === `running`) {
      if (
        this._checkNaN(inputDistance.value) ||
        this._checkNaN(inputDuration.value) ||
        this._checkNaN(inputCadence.value) ||
        this._checkZero(inputCadence.value) ||
        this._checkZero(inputDistance.value) ||
        this._checkZero(inputDuration.value)
      ) {
        alert(`Please input proper numbers!!`);
        this._clearForms();
      } else {
        this.#workout = new Running(
          inputType.value,
          +inputDistance.value,
          +inputDuration.value,
          +inputCadence.value,
          this.#pos.latlng
        );
        this._callAllFunc();
      }
    }
    if (inputType.value === `cycling`) {
      if (
        this._checkNaN(inputDistance.value) ||
        this._checkNaN(inputDuration.value) ||
        this._checkNaN(inputElevation.value) ||
        this._checkZero(inputDistance.value) ||
        this._checkZero(inputDuration.value)
      ) {
        alert(`Please input proper numbers!!`);
        this._clearForms();
      } else {
        this.#workout = new Cycling(
          inputType.value,
          +inputDistance.value,
          +inputDuration.value,
          +inputElevation.value,
          this.#pos.latlng
        );
        this._callAllFunc();
      }
    }
  }
  _changeType() {
    if (inputType.value === `cycling`) {
      cadence.classList.toggle(`form__row--hidden`);
      cycle.classList.toggle(`form__row--hidden`);
    } else {
      cadence.classList.toggle(`form__row--hidden`);
      cycle.classList.toggle(`form__row--hidden`);
    }
  }
  _clearForms() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ` `;
    inputDistance.focus();
  }
  _addWorkout() {
    // prettier-ignore
    const html = `
        <li class="workout workout--${this.#workout.type}" data-id="${this.#workout.id}">
          <h2 class="workout__title">${this.#workout.description} on ${this.#workout.date}</h2>
          <div class="workout__details">
            <span class="workout__icon">${this.#workout.type === `running` ? `🏃‍♂️`: `🚲`}</span>
            <span class="workout__value">${this.#workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${this.#workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${this.#workout.type === `running` ? this.#workout.pace: this.#workout.speed}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${this.#workout.type === `running` ? `🦶`: `🏔️`}</span>
            <span class="workout__value">${this.#workout.type === `running` ? this.#workout.cadence: this.#workout.elevation}</span>
            <span class="workout__unit">${this.#workout.type === `running` ? `spm`: `m`}</span>
          </div>
        </li>
    `;
    containerWorkouts.insertAdjacentHTML(`beforeend`, html);
  }
  _scrollToPos(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const locWorkout = this.#workouts.find(
      el => el.id === +workoutEl.dataset.id
    );
    const { lat, lng } = locWorkout.pos;
    this.#map.setView([lat, lng], 13);
  }
  _callAllFunc() {
    this.#workouts.push(this.#workout);
    this._clearForms();
    this._addPopUpMarker(this.#pos);
    this._addWorkout();
    this._hideForm();
  }
}
const app = new Map();
