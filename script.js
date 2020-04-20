//var targetDiv = document.getElementById("targetDiv");

var localStorage = window.localStorage;

loadAPI();

function loadAPI() {
    getLocation().then(data => {
        let longitude = data.longitude;
        let latitude = data.latitude;
        let key = "b3cc305bb205466c20e6b12d5aef231f";
        let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&units=metric&appid=" + key;
        makeAJAXRequest("GET", url).then(data => {
            console.log(data);

            let temp = document.getElementById("dv0");
            let feelsLike = document.getElementById("dv1");
            let wind_speed = document.getElementById("dv2");
            let wind_gust = document.getElementById("dv3");
            let wind_dir = document.getElementById("dv4");
            let sunrise = document.getElementById("dv5");
            let sunset = document.getElementById("dv6");

            temp.textContent = Math.round(data.current.temp) + "°C";
            feelsLike.textContent = Math.round(data.current.feels_like) + "°C";
            wind_speed.textContent = Math.round((data.current.wind_speed * 18) / 5) + "km/h";
            wind_gust.textContent = Math.round((data.current.wind_gust * 18) / 5) + "km/h";
            let dir;
            let deg = data.current.wind_deg;
            if (deg >= 90 && deg < 180) {
                dir = "East";
            }
            else if (deg >= 180 && deg < 270) {
                dir = "South";
            }
            else if (deg >= 270 && deg < 360) {
                dir = "West";
            }
            else {
                dir = "North";
            }
            wind_dir.textContent = dir; //Math.round(data.current.wind_deg)

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

function epochToLocalTime(epoch)
{
    let dt, hrs, mins;
    dt = new Date(epoch * 1000);
    hrs = "0" + dt.getHours();
    mins = "0" + dt.getMinutes();

    lt = hrs.substr(-2) + ":" + mins.substr(-2);
    return lt;
}

function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            let timestamp = localStorage.getItem("timestamp");
    
            if (timestamp && (Date.now() - timestamp) < 600000000) { // 600000 seconds
                let latitude = localStorage.getItem("latitude");
                let longitude = localStorage.getItem("longitude");
                resolve({latitude: latitude, longitude: longitude});
            }
            else
            {
                navigator.geolocation.getCurrentPosition(pos => {
                    let latitude = pos.coords.latitude;
                    let longitude = pos.coords.longitude;
                    localStorage.setItem("timestamp", Date.now());
                    localStorage.setItem("latitude", latitude);
                    localStorage.setItem("longitude", longitude);
                    resolve({latitude: latitude, longitude: longitude});
                }, (err) => {
                    reject("ERROR NO. " + err.code + ": " + err.message);
                });
            }
        } else {
            reject("Geolocation is not supported by this browser.");
        }
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