/* maybe rewrite this */

// declare constants
const key1 = config.key1;
const key2 = config.key2;
const temp = document.getElementById("dv0");
const feelsLike = document.getElementById("dv1");
const wind_speed = document.getElementById("dv2");
const wind_gust = document.getElementById("dv3");
const wind_dir = document.getElementById("dv4");
const sunrise = document.getElementById("dv5");
const sunset = document.getElementById("dv6");
const city_obj = document.getElementById("city");
const desc_obj = document.getElementById("desc");
const desc_img = document.getElementById("desc-img");
//const city = document.getElementById("city");
const input_city = document.getElementById("input-city");

// change location by clicking
city_obj.addEventListener("click", () => {
  city.classList.add("inactive");
  input_city.classList.remove("inactive");
  input_city.value = city_obj.textContent;
  input_city.focus();
  input_city.select();
});

// update location
input_city.addEventListener("focusout", () => {
  updateCity();
});

// focus out of text input when enter is pressed
document.addEventListener("keydown", event => {
  if (event.keyCode === 13) {
    if (!input_city.classList.contains("inactive")) {
      document.body.focus();
      input_city.blur();
    }
  }
});

function updateCity() {
  if (input_city.value) {
    city.classList.remove("inactive");
    input_city.classList.add("inactive");
    if (input_city.value != city_obj.textContent) {
      loadAPI(true);
    }
  }

}

var localStorage = window.localStorage;

loadAPI();

function updateUI(data) {
  // City name
  let city = data.name;
  if (!city) return; // invalid city

  // Timezone, Status
  city_obj.textContent = city;
  desc_obj.textContent = data.weather[0].description;
  desc_img.src = "images/" + data.weather[0].icon + "@2x.png";

  // Temperature, Feels Like
  temp.textContent = Math.round(data.main.temp) + "°C";
  feelsLike.textContent = Math.round(data.main.feels_like) + "°C";

  // Wind Speed
  wind_speed.textContent = Math.round((data.wind.speed * 18) / 5) + " km/h";
  if (!isNaN(data.wind.gust)) {
    wind_gust.textContent = Math.round((data.wind.gust * 18) / 5) + " km/h";
  } else {
    var objs = document.querySelectorAll(".wind-gust");
    objs.forEach(obj => obj.style.display = "none");
  }

  // Wind Direction
  let deg = data.wind.deg;
  let dir = deg ? getDirection(deg) : "N/A";
  wind_dir.textContent = dir; //Math.round(data.current.wind_deg)

  // Sunrise, Sunset
  let sr, ss;

  sr = epochToLocalTime(data.sys.sunrise);
  ss = epochToLocalTime(data.sys.sunset);

  sunrise.textContent = sr;
  sunset.textContent = ss;
}

function sendRequestAndUpdate(url) {
  makeAJAXRequest("GET", url).then(data => {
    updateUI(data);
  }).catch(err => {
    console.log(err);
  });
}

function getWeatherData(city, coords) {
  let city_type = typeof city;
  if (coords && city_type != "string") { // lat and lon specified
    let url = "https://us1.locationiq.com/v1/reverse.php?key=1ace468b6ab00c&lat=" + city.lat + "&lon=" + city.lon + "&format=json";
    makeAJAXRequest("GET", url).then(data => {
      city = data.address.city;
      url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + key1;
      localStorage.setItem("city", city);
      sendRequestAndUpdate(url);
    }).catch(err => {
      console.log(err);
    });
  } else { // city name specified
    let url = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=metric&appid=" + key1;
    sendRequestAndUpdate(url);
  }
}

function loadAPI(opt) {
  if (opt == true) // update only
  {
    let city = input_city.value;
    getWeatherData(city);
    return;
  } else {
    getLocation().then(data => { // first time load
      getWeatherData(data.city, data.coords);
    }).catch(err => {
      console.log(err);
    });
  }
}

function getDirection(deg) {
  if ((deg >= 340 && deg <= 360) || (deg >= 0 && deg < 20)) {
    return "North";
  } else if (deg >= 20 && deg < 70) {
    return "North East";
  } else if (deg >= 70 && deg < 110) {
    return "East";
  } else if (deg >= 110 && deg < 160) {
    return "South East";
  } else if (deg >= 160 && deg < 200) {
    return "South";
  } else if (deg >= 200 && deg < 240) {
    return "South West";
  } else if (deg >= 240 && deg < 290) {
    return "West";
  } else if (deg >= 290 && deg < 340) {
    return "North West";
  }
}

function epochToLocalTime(epoch) {
  let dt, hrs, mins, isPM = false;
  dt = new Date(epoch * 1000);
  hrs = dt.getHours();
  mins = dt.getMinutes();

  if (hrs >= 12 && hrs < 24) {
    isPM = true;
  }
  hrs = (hrs % 12) || 12;
  mins = "0" + mins;

  return hrs + ":" + mins.substr(-2) + (isPM ? " PM" : " AM");
}

function getLocation() {
  return new Promise((resolve, reject) => {
    // Get location based off external IP address
    let url = "https://api.ipgeolocation.io/ipgeo?apiKey=" + key2;
    makeAJAXRequest("GET", url).then(data => {
      resolve({
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city
      });
    }).catch(() => {
      // Prompt user for permission to retrieve location through browser instead if API is down or blocked
      if (navigator.geolocation) {
        let timestamp = localStorage.getItem("timestamp");
        if (timestamp && (Date.now() - timestamp) < 6000000) { // 6000 seconds = 100 minutes
          let latitude = localStorage.getItem("latitude");
          let longitude = localStorage.getItem("longitude");
          let city = localStorage.getItem("city");
          resolve({
            latitude: latitude,
            longitude: longitude,
            city: city,
            coords: true
          });
        } else {
          navigator.geolocation.getCurrentPosition(pos => {
            let latitude = pos.coords.latitude.toFixed(2);
            let longitude = pos.coords.longitude.toFixed(2);
            let city = {
              lat: latitude,
              lon: longitude
            };
            localStorage.setItem("timestamp", Date.now());
            localStorage.setItem("latitude", latitude);
            localStorage.setItem("longitude", longitude);
            resolve({
              latitude: latitude,
              longitude: longitude,
              city: city,
              coords: true
            });
          }, (err) => {
            reject("ERROR NO. " + err.code + ": " + err.message);
          });
        }
      } else {
        reject("Geolocation is not supported by this browser.");
      }
    });
  });
}

function makeAJAXRequest(method, url, data) {
  return new Promise((resolve, reject) => {
    if (data) { // Make an AJAX call using the provided data & method
      fetch(url, {
          method: method,
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(json => resolve(json))
        .catch(err => reject(err));
    } else { // Make an AJAX call without providing data using the method
      fetch(url, {
          method: method
        })
        .then(response => response.json())
        .then(json => resolve(json))
        .catch(err => reject(err));
    }
  });
}