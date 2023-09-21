'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const endpoint = 'https://restcountries.com/v3.1/';

const title = str =>
  str
    .split(' ')
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

const geocodeEndpoint = (lat = 0, lng = 0) =>
  `https://geocode.xyz/${lat},${lng}?geoit=json`;

const getPosition = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const getJSON = async function (url, errorMsg = 'Something went wrong') {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
  return response.json();
};

const renderCountry = function (country, isNeighbor) {
  const html = `
  <article class="country${isNeighbor ? ' neighbour' : ''}">
      <img class="country__img" src="${country.flags.png}" />
      <div class="country__data">
          <h3 class="country__name">${country.name.common}</h3>
          <h4 class="country__region">${country.region}</h4>
          <p class="country__row"><span>👫</span>${(
            country.population / 1_000_000
          ).toFixed(1)} people</p>
          <p class="country__row"><span>🗣️</span>${
            Object.values(country.languages)[0]
          }</p>
          <p class="country__row"><span>💰</span>${
            Object.values(country.currencies)[0].name
          }</p>
      </div>
  </article>
`;
  countriesContainer.insertAdjacentHTML('beforeend', html);
};

const renderError = function (msg) {
  countriesContainer.insertAdjacentHTML(
    'beforeend',
    `<div style="text-align: center"><h3>😣 Something went wrong! 😣</h3><p>${msg}<p/></div>`
  );
};

const countryErrorMessage = c => `Country ${c} not found.`;

/*
// AJAX
const getCountryRequest = function (url, callback = null) {
  const request = new XMLHttpRequest();
  request.open('GET', url);
  request.send();
  request.addEventListener('load', function () {
    const [data] = JSON.parse(this.responseText);
    console.log(data);
    if (callback) return callback(data);
    return data;
  });
};

const getCountryAndNeighborData = function (country) {
  getCountryRequest(`${endpoint}name/${country}`, function (data) {
    renderCountry(data);
    const [neighbor] = data.borders;
    if (!neighbor) return;
    return getCountryRequest(
      `${endpoint}alpha/${neighbor.toLowerCase()}`,
      function (data2) {
        renderCountry(data2, true);
      }
    );
  });
};
*/
/*
// Fetch API
const getCountryAndNeighborData = () => {
  getPosition()
    .then(pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      return getJSON(geocodeEndpoint(lat, lng), 'Problem with geocoding');
    })
    .then(pos => pos.country)
    .then(c => getJSON(`${endpoint}name/${c}`, countryErrorMessage(c)))
    .then(data => {
      renderCountry(data[0]);
      const neighbors = data[0].borders;
      if (!neighbors) throw new Error('No neighbor found!');
      return getJSON(
        `${endpoint}alpha/${neighbors[0]}`,
        countryErrorMessage(neighbors[0])
      );
    })
    .then(data2 => renderCountry(data2[0], true))
    .catch(err => (console.error(err), renderError(err.message)))
    .finally(() => (countriesContainer.style.opacity = 1));
};
*/

// async/await
const getCountryAndNeighborData = async () => {
  try {
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;
    const { country } = await getJSON(
      geocodeEndpoint(lat, lng),
      'Problem with geocoding'
    );
    const data = await getJSON(
      `${endpoint}name/${country}`,
      countryErrorMessage(country)
    );
    renderCountry(data[0]);
    const neighbors = data[0].borders;
    if (!neighbors) throw new Error('No neighbor found!');
    const [neighbor] = await getJSON(
      `${endpoint}alpha/${neighbors[0]}`,
      countryErrorMessage(neighbors[0])
    );
    renderCountry(neighbor, true);
  } catch (err) {
    console.error(err);
    renderError(err.message);
    return err;
  }
  countriesContainer.style.opacity = 1;
};

btn.addEventListener('click', function () {
  countriesContainer.innerHTML = '';
  countriesContainer.style.opacity = 0;
  (async function () {
    await getCountryAndNeighborData();
  })();
});
