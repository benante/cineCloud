// import secret key
import { accessToken, apiKey } from "./config.js";

// define main html elements
const form = document.querySelector("form");
const containerMovieDB = document.querySelector(".containerMovieDB");
const loadingDiv = document.querySelector(".loader");
const chartBtn = document.querySelector("#chartbutton");
const colourArray = [
  "FF0000",
  "00FF00",
  "0000FF",
  "FFFF00",
  "00FFFF",
  "FF00FF",
  "FF8000",
  "008080",
  "800080",
  "FF7F50",
  "DC143C",
  "000080",
  "00CED1",
  "FFD700",
  "FF1493",
  "7FFF00",
  "9932CC",
  "FF4500",
  "20B2AA",
  "800000",
];
// define root and different queries
const rootUrl = "https://api.themoviedb.org/3/trending/";
const queries = {
  movie: "movie/",
  people: "person/",
  tv: "tv/",
};

const queryOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
};

let resultsObject = {}; // used to save relevant info about films from multiple endpoints
let radioValue
const chartImage = document.getElementById("chartimage");
// Event listener when form is submitted
form.addEventListener("submit", (event) => {
  // moved bulk of this to a function (fetchpopularmovies) so I can use async await
  event.preventDefault();
  resultsObject = {};
  chartImage.style.display = "none"; // hides chart when new data requested
  // Get radio value
  loadingPage(loadingDiv, 1950);

  setTimeout(() => {
    fetchPopularMovies();
  }, 2000);
});

async function fetchPopularMovies() {
  radioValue = document.querySelector(
    'input[name="option"]:checked'
  ).value;
    console.log(radioValue)
  // Get dropdown value
  const dropdownValue = document.querySelector("#dropdown").value;

  await fetch(`${rootUrl}${queries[radioValue]}${dropdownValue}`, queryOptions)
    // get body in json format
    .then((response) => response.json())
    .then((data) => {
      // create an array from the data
      const resultArray = data.results;
      //    reset the div container everytime the form is submitted
      containerMovieDB.innerHTML = "";
      //   iterate through the elements and display them
      resultArray.forEach((element, i) => {
        // Create button that display name/title
        const divElement = document.createElement("div");
        divElement.classList.add = "divElement";

        const chartKeyColour = document.createElement("div");
        const button = document.createElement("button");

        let title = "";

        // create an object with saving film id will be added to the overall object
        let movieObj = {
          id: element.id,
        };

        // retrieve data according to radioValue
        if (radioValue == "movie") {
          title = element.title;
          button.textContent = element.title;
        } else {
          // in this case Tv shows or people
          title = element.name;
          button.textContent = element.name;
        }

        resultsObject[title] = movieObj; // insert object with relative id into resultObjects
        resultsObject[title].colour = colourArray[i];
        // console.log(movieObj);
        containerMovieDB.appendChild(divElement);
        divElement.appendChild(button);
        button.appendChild(chartKeyColour);

        chartKeyColour.classList.add("chartKeyColour");
        chartKeyColour.style.backgroundColor = `#${resultsObject[title].colour}`;
        // add colour key to each movie this is placeholder should do with a small circle next to button
        //

        // DEBUG/REFACTOR DONE AND WORKING TILL HERE

        // for each button create relative container and content
        const paragraph = document.createElement("p");
        const posterImg = document.createElement("img");
        let isParagraphVisible = false;

        button.addEventListener("click", () => {
          if (element.overview) {
            // If movie or tv
            posterImg.src = `https://image.tmdb.org/t/p/original${element.poster_path}?language=en-US`;
            paragraph.textContent = element.overview;
            //  YOUTUBE
            const mediaType = element.media_type;
            fetch(
              `https://api.themoviedb.org/3/${mediaType}/${element.id}/videos`,
              queryOptions
            )
              .then((res) => res.json())
              .then((res) => res.results)
              .then((res) => {
                const arrayVideos = res;
                let officialTrailer = arrayVideos.find(
                  (element) => element.type === "Trailer"
                );
                officialTrailer = `https://www.youtube.com/watch?v=${officialTrailer.key}`;
                const linkYoutube = document.createElement("a");
                linkYoutube.textContent = "Click here for the trailer";
                linkYoutube.href = officialTrailer;
                paragraph.appendChild(linkYoutube);
              })
              .catch((err) => console.error(err));
          } else {
            fetch(
              `https://api.themoviedb.org/3/person/${element.id}/combined_credits`,
              queryOptions
            )
              .then((res) => res.json())
              .then((data) => {
                let castArray = data.cast;

                if (!castArray.length) {
                  castArray = data.crew;
                }
                const lengthArray = Math.min(10, castArray.length);

                const movieList = castArray
                  .slice(0, lengthArray)
                  .map(({ title, release_date }) => {
                    return `<li>${title} (${release_date.slice(0, 4)})</li>`;
                  })
                  .join("");
                // Update content for buttons without element.overview
                paragraph.innerHTML = `<p>Mainly known for:</p><ul>${movieList}</ul>`; // Wrap the movieList in a <ul> element
                posterImg.src = `https://image.tmdb.org/t/p/original${element.profile_path}?language=en-US`;
              })
              .catch((error) => {
                // Display an error message for the catch error
                paragraph.textContent = `Error: ${error.message}`;
              });
          }

          if (isParagraphVisible) {
            // Hide the paragraph by removing it
            divElement.removeChild(paragraph);
            divElement.removeChild(posterImg);
            isParagraphVisible = false;
          } else {
            // Show the paragraph by appending it
            divElement.appendChild(paragraph);
            divElement.appendChild(posterImg);
            isParagraphVisible = true;
          }
        });
      });
      chartBtn.style.display = "block";
      revenueChart();
    })
    .catch((error) => {
      // Display a general error message for the fetch error
      containerMovieDB.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

async function revenueChart() {
  let movieTitleArr = Object.keys(resultsObject);
  console.log(movieTitleArr);
  let mutableRadioValue = radioValue;
  if (radioValue == "people") {
    mutableRadioValue = "person";
  }
  for (let name of movieTitleArr) {
    let response = await movieAPIFetch(
      mutableRadioValue,
      resultsObject[name].id,
    );
      console.log(response)
    if (radioValue == "movie") {
      resultsObject[name].data =
        Math.round((response.revenue - response.budget) / 100000) / 10;
    } else if (radioValue == "tv") {
      resultsObject[name].data = response.number_of_episodes;
    } else {
      resultsObject[name].data = getAge(response.birthday, response.deathday);
    }
  }
}

chartBtn.addEventListener("click", fetchChart);
function fetchChart() {
  const chartKeyColours = document.getElementsByClassName("chartKeyColour");
  let movieTitleArr = Object.keys(resultsObject); // split title of each movie/tv/person so we can get data for each one
  let chartType = "bvs"; // vertical bar chart
  let colourString = colourArray.join("|"); // turn colour array into pipe seperated string for use with api
  let dataString = "a:" + objectToString(",",movieTitleArr,"data",resultsObject); // get comma seperated string from object
  let dataLabel = objectToString("|",movieTitleArr,"data",resultsObject);   // get pipe seperated string from object
  let chartTitle = "";
  if (radioValue == "movie") {
    chartTitle = "Net revenue (millions)";
  } else if (radioValue == "tv") {
    chartTitle = "Number of episodes";
  } else {
    chartTitle = "Age";
  }
  if (window.innerWidth < 500) {
    chartType = "p";
    dataLabel += `&chdl=${dataLabel}`;
  }
  chartImage.src = `https:/image-charts.com/chart?chco=${colourString}&chtt=${chartTitle}&chd=${dataString}&chl=${dataLabel}&chs=999x999&cht=${chartType}&chxt=y`;
  chartImage.style.display = "inline-block";
  [...chartKeyColours].forEach(e => e.style.display = "inline-block") // iterate through chart key colour elements and set display property
}

/**
 * 
 * @param {string} endpoint endpoint we want to query
 * @param {string} id query
 * @returns object from endpoint
 */
function movieAPIFetch(endpoint, id) {
  return fetch(
    `https://api.themoviedb.org/3/${endpoint}/${id}?language=en-US`,
    queryOptions
  ).then((response) => response.json())
  .catch((err) => console.error(err));
}

/**
 * 
 * @param {string} seperator string of the character(s) used to seperate elements. e.g. comma "," or pipe "|"
 * @param {Array} objectKeys object keys
 * @param {*} objectData object endpoint we want data from
 * @param {*} object object we want to extract data from
 * @returns string
 */
function objectToString(seperator,objectKeys,objectData,object) {
  return objectKeys.reduce((acc,curr) => {
      acc += `${object[curr][objectData]}${seperator}`;
      return acc
  },"")
}

function getAge(birthDateString, deathDateString) {
  let today = 0;
  if (deathDateString) {
    today = new Date(deathDateString);
  } else {
    today = new Date();
  }
  let birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function loadingPage(element, time) {
  element.style.display = "block";

  setTimeout(() => {
    element.style.display = "none";
  }, time);
}