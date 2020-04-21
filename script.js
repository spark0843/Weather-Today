const key = "b3cc305bb205466c20e6b12d5aef231f";

var localStorage = window.localStorage;

loadAPI();

function loadAPI() {
    getLocation().then(data => {
        let latitude = data.latitude;
        let longitude = data.longitude;
        let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=metric&appid=" + key;
        let city = data.city;

        makeAJAXRequest("GET", url).then(data => {
            let temp = document.getElementById("dv0");
            let feelsLike = document.getElementById("dv1");
            let wind_speed = document.getElementById("dv2");
            let wind_gust = document.getElementById("dv3");
            let wind_dir = document.getElementById("dv4");
            let sunrise = document.getElementById("dv5");
            let sunset = document.getElementById("dv6");
            let city_obj = document.getElementById("city");
            let status_obj = document.getElementById("status");

            // Timezone, Status
            city_obj.textContent = city;
            status_obj.textContent = data.current.weather[0].description;

            // Temperature, Feels Like
            temp.textContent = Math.round(data.current.temp) + "°C";
            feelsLike.textContent = Math.round(data.current.feels_like) + "°C";

            // Wind Speed
            wind_speed.textContent = Math.round((data.current.wind_speed * 18) / 5) + " km/h";
            if (!isNaN(data.current.wind_gust)) {
                wind_gust.textContent = Math.round((data.current.wind_gust * 18) / 5) + " km/h";
            }
            else {
                document.getElementById("wind-gust").style.display = "none";
            }
            
            // Wind Direction
            let deg = data.current.wind_deg;
            let dir = getDirection(deg);
            wind_dir.textContent = dir; //Math.round(data.current.wind_deg)

            // Sunrise, Sunset
            let sr, ss;

            sr = epochToLocalTime(data.current.sunrise);
            ss = epochToLocalTime(data.current.sunset);

            sunrise.textContent = sr;
            sunset.textContent = ss;

        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });
}

function getDirection(deg) {
    if (deg >= 340 && deg < 20) {
        return "North";
    }
    else if (deg >= 20 && deg < 70) {
        return "North East";
    }
    else if (deg >= 70 && deg < 110) {
        return "East";
    }
    else if (deg >= 110 && deg < 160) {
        return "South East";
    }
    else if (deg >= 160 && deg < 200) {
        return "South";
    }
    else if (deg >= 200 && deg < 240) {
        return "South West";
    }
    else if (deg >= 240 && deg < 290) {
        return "West";
    }
    else if (deg >= 290 && deg < 340) {
        return "North West";
    }
}

function epochToLocalTime(epoch) {
    let dt, hrs, mins, isPM;
    dt = new Date(epoch * 1000);
    hrs = dt.getHours();
    mins = dt.getMinutes();

    if (hrs >= 12 && hrs < 24) {
        isPM = true;
    }
    hrs = (hrs % 12) || 12;
    // if (hrs >= 13) {
    //     hrs -= 12;
    // }
    // if (!hrs) {
    //     hrs = 12;
    // }
    mins = "0" + mins;

    lt = hrs + ":" + mins.substr(-2) + (isPM ? " PM" : " AM");
    return lt;
}

function getLocation() {
    return new Promise((resolve, reject) => {
        // Get location based off external IP address
        let url = "https://api.ipgeolocation.io/ipgeo?apiKey=1531619570aa43a49de0298f9156153c"
        makeAJAXRequest("GET", url).then(data => {
            resolve({latitude: data.latitude, longitude: data.longitude, city: data.city});
        }).catch(err => {
            reject(err);
        });

        // Get location based off user permission
        // if (navigator.geolocation) {
        //     let timestamp = localStorage.getItem("timestamp");
        //     if (timestamp && (Date.now() - timestamp) < 600000000) { // 600000 seconds
        //         let latitude = localStorage.getItem("latitude");
        //         let longitude = localStorage.getItem("longitude");
        //         resolve({latitude: latitude, longitude: longitude});
        //     }
        //     else
        //     {
        //         navigator.geolocation.getCurrentPosition(pos => {
        //             let latitude = pos.coords.latitude;
        //             let longitude = pos.coords.longitude;
        //             localStorage.setItem("timestamp", Date.now());
        //             localStorage.setItem("latitude", latitude);
        //             localStorage.setItem("longitude", longitude);
        //             resolve({latitude: latitude, longitude: longitude});
        //         }, (err) => {
        //             reject("ERROR NO. " + err.code + ": " + err.message);
        //         });
        //     }
        // } else {
        //     reject("Geolocation is not supported by this browser.");
        // }
    });
}

function makeAJAXRequest(method, url, data){
    return new Promise((resolve, reject) => {
        if (data) { // Make an AJAX call using the provided data & method
            fetch(url, { 
                method: method,
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" } 
            })
            .then(response => response.json())
            .then(json => resolve(json))
            .catch(err => reject(err));
        } else {  // Make an AJAX call without providing data using the method
            fetch(url, { method: method })
            .then(response => response.json())
            .then(json => resolve(json))
            .catch(err => reject(err));
        }
    });
}

// function kelvinToCelsius(kv) {
//     return kv - 273.15;
// }