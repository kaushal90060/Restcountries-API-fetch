/////////////////////////////////////////////
// HTML selectors
///////////////////////////////////////
const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const inputval1 = document.querySelector(".inputVal1");
const inputval2 = document.querySelector(".inputVal2");
const submit1 = document.querySelector(".submit1");
const submit2 = document.querySelector(".submit2");
const neighbour = document.querySelector(".neighbour");

///////////////////////////////////////////////
// Rendererror function
const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
  // countriesContainer.style.opacity = 1;
};

// Render Country
const renderCountry = function (data, lat = "NA", lng = "NA", className = "") {
  let lang = Object.keys(data.languages).map((key) => {
    return data.languages[key];
  });
  let currency = Object.keys(data.currencies).map((key) => {
    return data.currencies[key];
  });
  let cur = JSON.stringify(currency[0].name);

  const html = `
  <article class="country ${className}" >
  <img src="${data.flags.png}" class="country_img" />
  <div class="country_data">
    <h3 class="country_name">${data.name.common}</h3>
    <h4 class="country_region">${data.region}</h4>
    <p class="country_row"><span>🧑‍🤝‍🧑</span>${(
      +data.population / 1000000
    ).toFixed(1)} Million</p>
    <p class="country_row"><span>🗣️</span>${lang}</p>
    <p class="country_row"><span>💰</span>${cur}</p>
    <p class="country_row"><span>🏙️</span>${data.capital}</p>
    <p class="country_row" style = "font-size:10px;">Present coords : ${lat}, ${lng}</p>
  </div>
</article>
  `;
  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = 1;
};
/////////////////////////////////////////////////////
// Showing country and its all the neighbour countries
const getCountryAndNeighbour = function (country) {
  // AJAX call country 1
  const request = new XMLHttpRequest();
  request.open("GET", `https://restcountries.com/v3.1/name/${country}`);
  request.send();
  request.addEventListener("load", function () {
    const [data] = JSON.parse(this.responseText);
    console.log(data);
    // Render country 1
    renderCountry(data);
    console.log(`Searched country is : `, data);

    // Get all neighbour countries (2)
    for (let i = 0; i < data.borders.length; i++) {
      const request2 = new XMLHttpRequest();
      // AJAX call country 2 or more
      request2.open(
        "GET",
        `https://restcountries.com/v3.1/alpha/${data.borders[i]}`
      );
      request2.send();
      request2.addEventListener("load", function () {
        const [data2] = JSON.parse(this.responseText);
        renderCountry(data2, "NA", "NA", "neighbour");
      });
    }
  });
};

////////////////////////////////////////////////////////

// Above code can be reduced using helper function
const getJSON = function (url, errMsg = "Something went wrong") {
  return fetch(url).then((response) => {
    if (!response.ok) throw new Error(`${errMsg} ${response.status}`);
    return response.json();
  });
};
// This function works only for one country and one of its 1st neighbour returned from api

/*const getCountryData = function (country) {
  //Country 1
  getJSON(`https://restcountries.com/v3.1/name/${country}`, `Country not found`)
    .then((data) => {
      renderCountry(data[0]);
      console.log(data[0]);
      console.log(data[0].borders);

      const neighbour = data[0].borders[0];
      // If there is not any neighbour
      if (!neighbour) throw new Error("No neighbours found");
      //country 2
      return getJSON(
        `https://restcountries.com/v3.1/alpha/${neighbour}`,
        "Neighbour country not found"
      );
    })
    .then((data) => {
      renderCountry(data[0], "NA", "NA", "neighbour");
    })
    .catch((err) => {
      console.error(`${err.message} 💥💥💥`);
      renderError(`Something went wrong 💥💥💥 ${err.message}. Try Again`);
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};
*/
// This code returns only searched country from inputval1
const getOneCountry = function (country) {
  getJSON(`https://restcountries.com/v3.1/name/${country}`, `Country not found`)
    .then((data) => {
      renderCountry(data[0]);
    })
    .catch((err) => {
      countriesContainer.innerHTML = `Something went wrong ${err.message}`;
      countriesContainer.style.opacity = 1;
    });
};
//
submit1.addEventListener("click", function () {
  countriesContainer.replaceChildren();
  if (inputval1.value.length == "") {
    countriesContainer.style.opacity = 1;
    countriesContainer.innerHTML = `No input`;
  } else getOneCountry(inputval1.value);
});

submit2.addEventListener("click", function () {
  countriesContainer.replaceChildren();
  if (inputval2.value.length == "") {
    countriesContainer.style.opacity = 1;
    countriesContainer.innerHTML = `No input`;
  } else getCountryAndNeighbour(inputval2.value);
});
//////////////////////////////////////////////////////
// Function to find current location
const whereAmI = function (lat, lng) {
  fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`)
    .then((response) => {
      if (!response.ok) throw new Error(`Problem with the geocoding`);
      return response.json();
    })
    .then((data) => {
      console.log(data);
      console.log(`You are in ${data.country}`);
      return fetch(`https://restcountries.com/v3.1/name/${data.country}`);
    })
    .then((res) => {
      if (!res.ok) throw new Error(`Country not found (${res.status})`);
      return res.json();
    })
    .then((data) => {
      renderCountry(data[0], lat, lng);
    })
    .catch((err) => {
      console.log(`${err.message} 💥💥💥💥`);
      countriesContainer.innerHTML = `Please try again, ${err.message}`;
    })
    .finally(() => {
      countriesContainer.style.opacity = 1;
    });
};
// Clicking this will show current location
btn.addEventListener("click", function () {
  countriesContainer.replaceChildren();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;

        whereAmI(latitude, longitude);
      },
      function () {
        alert(`Turn On your location first`);
      }
    );
  }
});
