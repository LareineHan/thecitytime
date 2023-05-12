const appid = 'de2f49dcb4c630d2c19d2c0d62057aef';
const timeZoneKey = '84b918fd78e643359550f8977f88290c';
let weatherDataArray = [];
let timeZoneArray = [];
let theCity = '';
let combinedArray = [];
let userLocationObj = {};
var a = moment().format('LLLL');
var b = a.replace('2023', '');
document.getElementById('todaysdate').innerHTML = `${b}`;

document
  .getElementById('search-button')
  .addEventListener('click', async function () {
    const myFunction = () => {
      document.getElementById('spinner').style.display = 'block';
    };
    myFunction();
    const userSearch = document.getElementById('search-input').value;
    const searchUrl = `https://api.ipgeolocation.io/astronomy?apiKey=${timeZoneKey}&location=${userSearch}`;
    let searchHTML = '';
    try {
      const data = await searchCity(searchUrl);
      let date = data.date.replace(data.current_time, '');
      let updatedDate = (date += ` ${data.current_time}`);
      let referenceTime = updatedDate;
      let state = data.location.state;
      let country = data.location.country;
      const showCity = () => {
        let text = '';
        if (state === '') {
          text = `${country}`;
        } else {
          text = `${state}`;
        }
        return text;
      };
      console.log('SEARCH RESULT =>', data);
      let searchLocalTime = moment(`${referenceTime}`).calendar();
      searchHTML += `${userSearch} (${showCity()}) is currently ${searchLocalTime}`;
    } catch (error) {
      console.log('search error', error);
    }
    document.getElementById('searched').innerHTML = searchHTML;
  });

async function searchCity(searchUrl) {
  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Failed to search city');
  }
}

// let today = moment().format('MMM Do YY');
// document.getElementById('today').innerText = today;
const cityArray = [
  {
    city: 'New York, NY',
    lat: 40.7128,
    lon: -74.006,
    timezone: 'America/New_York',
  },
  {
    city: 'Chicago, IL',
    lat: 41.8781,
    lon: -87.6298,
    timezone: 'America/Chicago',
  },
  {
    city: 'Denver, CO',
    lat: 39.7392,
    lon: -104.9903,
    timezone: 'America/Denver',
  },
  {
    city: 'Los Angeles, CA',
    lat: 34.0522,
    lon: -118.2437,
    timezone: 'America/Los_Angeles',
  },
  {
    city: 'Anchorage, AK',
    lat: 61.2181,
    lon: -149.9003,
    timezone: 'America/Anchorage',
  },
];
const refreshButton = document.querySelector('.refresh-icon');
refreshButton.addEventListener('click', refreshPage);
function refreshPage() {
  location.reload();
}

const userLocation = new Promise((resolve, reject) => {
  fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${timeZoneKey}`)
    .then((response) => {
      response
        .json()
        .then((data) => {
          resolve(data);
          console.log(`user is from ${data.state_prov}`);
          console.log(data); // well done!
          return data;
        })
        .catch((error) => {
          console.log('userLocation 에러!!', error);
          reject(error);
        });
    })
    .catch((error) => {
      console.log('error in userLocation outer catch block', error);
      reject(error);
    });
});

userLocation
  .then((data) => {
    // access the data object here
    const userState = data.state_prov;
    const userCity = data.city;
    const userLat = parseFloat(data.latitude).toFixed(4);
    const userLon = parseFloat(data.longitude).toFixed(4);
    document.getElementById(
      'userLocation'
    ).innerHTML = `In ${userCity} ${userState}`;
    console.log(data);
    userLocationObj.city = data.city;
    userLocationObj.lat = userLat;
    userLocationObj.lon = userLon;
    userLocationObj.timezone = data.time_zone.name;
    userLocationObj.dateTime = data.time_zone.current_time;
    cityArray.push(userLocationObj);
    // userLocationObj.lat = userLat.toFixed(2);
    // userLocationObj.lon = userLon.toFixed(2);
    console.log(
      'userLocationObj',
      userLocationObj,
      'cityArray updated',
      cityArray
    );
    getCityWeather(userLocationObj);
  })
  .catch((error) => {
    console.log('userLocation not detected');
  });
console.log('cityArray', cityArray);

async function getCityWeather(where) {
  const urlWeather = `https://api.openweathermap.org/data/2.5/forecast?lat=${where.lat}&lon=${where.lon}&appid=${appid}&units=imperial`;
  await userLocation;
  await fetchTimeZone(where);
  try {
    const response = await fetch(urlWeather);
    const weatherData = await response.json();
    if (weatherData.list.length === 0) {
      throw new Error(`데이타가 없네? ${where.city}`);
    }
    const cityName = weatherData.city.name;
    //   console.log(cityName);

    const country = weatherData.city.country;
    const weatherIs = weatherData.list[0].weather[0].main;
    const weatherInfo = weatherData.list[0].weather[0];
    const weatherId = weatherData.list[0].weather[0].id;
    const temperature = weatherData.list[0].main.temp;
    const weatherDes = weatherData.list[0].weather[0].description;
    weatherDataArray.push({
      cityName: cityName,
      country: country,
      weatherInfo: weatherInfo,
      temperature: temperature,
      weatherIs: weatherIs,
      weatherDes: weatherDes,
      weatherId: weatherId,
    });

    //console.log(`${cityName} Weather Data 잘 받았다!`, weatherData);
    document.getElementById('dataArea').innerHTML =
      'Weather API Fetching Success!';

    // console.log(
    //   'newArray에 잘 들어갔다!',
    //   combinedArray,
    //   'This is weatherDataArray',
    //   weatherDataArray
    // );
  } catch (error) {
    document.getElementById('dataArea').innerHTML = '아. 펑션 뭔가 이상';
    throw error;
    //       console.error(`Error fetching weather data for ${where.city}: 안나온다..후..`);
  }
}

async function fetchTimeZone(where) {
  const urlTime = `https://api.ipgeolocation.io/timezone?apiKey=${timeZoneKey}&tz=${where.timezone}`;
  await userLocation;
  try {
    const timeResponse = await fetch(urlTime);
    const timeZoneData = await timeResponse.json();
    if (!timeZoneData) {
      throw new Error(`No data received ${where.city}`);
    }
    const timeZone = timeZoneData.timezone;
    const cityTitle = timeZone.slice(8);
    theCity = cityTitle.replace('_', ' ');
    //console.log(cityTitle, theCity);
    timeZoneArray.push({
      theCity: theCity,
      timeZone: timeZone,
      dateTime: timeZoneData.date_time,
    });

    console.log(theCity, '타임존 데이터 여깄다:', timeZoneData);
    document.getElementById('dataTimeZone').innerHTML = 'Fetched Time Zone! ';
    return timeZoneData;
  } catch (error) {
    console.log('타임존이 펑션 뭔가 잘못됐다..');
    document.getElementById('dataTimeZone').innerHTML =
      'Failed to fetch Time Zone';
  }
}

const promises = cityArray.map(getCityWeather);
Promise.all(promises)
  .then(() => {
    for (let i = 0; i < cityArray.length; i++) {
      if (weatherDataArray[i]) {
        combinedArray.push({
          theCity: timeZoneArray[i].theCity,
          timeZone: timeZoneArray[i].timeZone,
          dateTime: timeZoneArray[i].dateTime,
          weatherInfo: weatherDataArray[i].weatherInfo,
          temperature: weatherDataArray[i].temperature,
          weatherIs: weatherDataArray[i].weatherIs,
          weatherDes: weatherDataArray[i].weatherDes,
          weatherId: weatherDataArray[i].weatherId,
        });
      }
    }
    console.log('combinedArray:', combinedArray);
  })
  .then(() => {
    // let today = moment(combinedArray[2].dateTime).startOf('hour').fromNow();
    // (document.getElementById('today').innerText =
    //   'Current time in ' +
    //   combinedArray[2].theCity +
    //   ' is ' +
    //   today +
    //   ' from your local time!'),
    //   today;
    render(combinedArray);
  });
console.log(
  '도시별 ARRAY 를 다 받았다!',
  'Weather',
  weatherDataArray,
  'Timezone',
  timeZoneArray
);

setTimeout(function () {
  userLocation.then((data) => {
    return promises;
  });
}, 1000);

function render(combinedArray) {
  let weatherHTML = '';
  //let midHTML = '';

  // const user = document.querySelector('.user-button');
  const newYork = document.querySelector('.nyc-button');
  const denver = document.querySelector('.den-button');
  const chicago = document.querySelector('.chi-button');
  const losAngeles = document.querySelector('.la-button');
  const anchorage = document.querySelector('.anc-button');
  //const userCity = document.querySelector('.user-button');
  // user.addEventListener('click', () => {
  //   getCityInfo({ theCity: userLocationObj.theCity });
  // });
  newYork.addEventListener('click', () => {
    getCityInfo({ theCity: 'New York' });
  });
  denver.addEventListener('click', () => {
    getCityInfo({ theCity: 'Denver' });
  });
  chicago.addEventListener('click', () => {
    getCityInfo({ theCity: 'Chicago' });
  });
  losAngeles.addEventListener('click', () => {
    getCityInfo({ theCity: 'Los Angeles' });
  });
  anchorage.addEventListener('click', () => {
    getCityInfo({ theCity: 'Anchorage' });
  });

  function getCityInfo({ theCity }) {
    let cityHTML = '';
    for (let i = 0; i < combinedArray.length; i++) {
      if (combinedArray[i].theCity === theCity) {
        const myCity = combinedArray[i].theCity;
        const nowT = moment(combinedArray[i].dateTime).format('LT');
        const nowDt = moment(combinedArray[i].dateTime).format('ll');
        const weatherDes = combinedArray[i].weatherDes;
        const temperature = combinedArray[i].temperature;
        cityHTML += `${myCity} local time is ${nowT} on ${nowDt}.
          Current weather is ${weatherDes} 
          and degree is ${temperature}°F.
          Difference from your local time : ${moment(combinedArray[i].dateTime)
            .startOf('hour')
            .fromNow()}`;
      }
    }
    document.getElementById('city_Info').textContent = cityHTML;
  }

  combinedArray.forEach((city) => {
    let myCity = city.theCity;
    let timeZone = city.timeZone;
    let dT = moment(city.dateTime).format('ll');
    let day = moment(city.dateTime).format('dddd');
    let time = moment(city.dateTime).format('LT');
    let weatherIs = city.weatherIs;
    let weatherDes = city.weatherDes;
    let weatherId = city.weatherId;
    let temperature = city.temperature;
    console.log(
      myCity,
      timeZone,
      weatherIs,
      weatherDes,
      weatherId,
      temperature,
      dT
    );

    // const temperatureInput = document.getElementById('temperature-input');
    // const toggleBtn = document.getElementById('toggle-btn');
    // const convertedOutput = document.getElementById('converted-output');
    // function celsiusToFahrenheit(celsius) {
    //   return (celsius * 9) / 5 + 32;
    // }
    // function fahrenheitToCelsius(fahrenheit) {
    //   return ((fahrenheit - 32) * 5) / 9;
    // }

    // // function to update the temperature value on input change
    // function updateTemperature() {
    //   const temperature = parseFloat(temperatureInput.value);
    //   if (toggleBtn.innerText === 'Convert to Celsius') {
    //     const celsius = fahrenheitToCelsius(temperature);
    //     convertedOutput.innerText = `${celsius.toFixed(2)} °C`;
    //   } else {
    //     const fahrenheit = celsiusToFahrenheit(temperature);
    //     convertedOutput.innerText = `${fahrenheit.toFixed(2)} °F`;
    //   }
    // }

    // // toggle between Celsius and Fahrenheit on button click
    // toggleBtn.addEventListener('click', function () {
    //   if (toggleBtn.innerText === 'Convert to Celsius') {
    //     toggleBtn.innerText = 'Convert to Fahrenheit';
    //   } else {
    //     toggleBtn.innerText = 'Convert to Celsius';
    //   }
    //   updateTemperature();
    // });

    // update the temperature value on input change
    // temperatureInput.addEventListener('input', function () {
    //   updateTemperature();
    // });

    function getTimeZoneString(timeZone) {
      let text = 'Unknown Time Zone';
      if (timeZone && timeZone.toLowerCase().includes('new_york')) {
        text = 'Eastern Time Zone (ET)';
      } else if (timeZone && timeZone.toLowerCase().includes('chicago')) {
        text = 'Central Time Zone (CT)';
      } else if (timeZone && timeZone.toLowerCase().includes('denver')) {
        text = 'Mountain Time Zone (MT)';
      } else if (timeZone && timeZone.toLowerCase().includes('los_angeles')) {
        text = 'Pacific Time Zone (PT)';
      } else if (timeZone && timeZone.toLowerCase().includes('anchorage')) {
        text = 'Atlantic Time Zone (AT)';
      }
      return text;
    }

    const timeZoneString = getTimeZoneString(timeZone);

    function getWeatherIcon(weatherId) {
      let currentWeatherIcon;
      if (weatherId >= 200 && weatherId < 300) {
        currentWeatherIcon = 'thunderstorm';
      } else if (weatherId >= 300 && weatherId < 400) {
        currentWeatherIcon = 'cloud-drizzle';
      } else if (weatherId >= 500 && weatherId < 600) {
        currentWeatherIcon = 'umbrella';
      } else if (weatherId >= 600 && weatherId < 700) {
        currentWeatherIcon = 'cloud-snow';
      } else if (weatherId >= 700 && weatherId < 800) {
        currentWeatherIcon = 'align-center';
      } else if (weatherId == 800) {
        currentWeatherIcon = 'sun';
      } else {
        currentWeatherIcon = 'cloud';
      }
      return currentWeatherIcon;
    }

    const currentWeatherIcon = getWeatherIcon(weatherId);

    weatherHTML += `
              <tr class="justify-content-center p-4 all-tr">
                <td>
                  <div>
                    <p class="fw-bold mb-1 active text-capitalized">${myCity}</p>
                    <small class="sm-text">${timeZoneString}</small>
                  </div>
                </td>
                <td>
                  <div><i class="feather-32 ${currentWeatherIcon}" data-feather="${currentWeatherIcon}"></i>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                  <p class="fw-normal mb-1 ">${weatherIs}</p>
                  <small class="sm-text">${weatherDes}</small>
                  </div>
                </td>
                <td>
                <span class="temp change-color">${temperature}°F</span>
                </td>
                <td>
                  <div class="d-flex flex-column">
                  <p class="fw-normal mb-1 ">${day}</p>
                  <small class="sm-text">${dT}</small>
                  </div>
                </td>
                <td>
                  <span class="change-color">${time}</span></td>
                </td>
                
              </tr>
          `;

    //   midHTML += `<div class="col">
    //   <div class="card h-100">
    //     <img src="..." class="card-img-top" alt="...">
    //     <div class="card-body">
    //       <h5 class="card-title">${myCity}</h5><i class="${currentWeatherIcon}" data-feather="${currentWeatherIcon}"></i>
    //       <p class="card-text">${myCity} / ${timeZoneString} / ${weatherIs} (${weatherDes})</p>
    //     </div>
    //   </div>
    // </div>`;
  });

  document.getElementById('innerWeather').innerHTML = weatherHTML;
  feather.replace();

  let updateButton = document.getElementById('update-button');
  updateButton.addEventListener('click', updateTemperatures);

  function celsiusToFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32;
  }

  function fahrenheitToCelsius(fahrenheit) {
    return ((fahrenheit - 32) * 5) / 9;
  }

  function updateTemperatures() {
    console.log('updateTemperatures called');
    let tempElements = document.querySelectorAll('.temp');
    tempElements.forEach((element) => {
      let temperature = parseFloat(element.textContent.slice(0, -2));
      if (element.textContent.includes('°F')) {
        const celsius = fahrenheitToCelsius(temperature);
        element.textContent = `${celsius.toFixed(2)} °C`;
      } else {
        const fahrenheit = celsiusToFahrenheit(temperature);
        element.textContent = `${fahrenheit.toFixed(2)} °F`;
      }
    });
  }

  //  document.getElementById('inner_mid').innerHTML = midHTML;
}
