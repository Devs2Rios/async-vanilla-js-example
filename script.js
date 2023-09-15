'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const endpoint = 'https://restcountries.com/v3.1/';

///////////////////////////////////////
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
  countriesContainer.style.opacity = 1;
};

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

getCountryAndNeighborData('usa');
