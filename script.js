// import secret key
import { accessToken, apiKey } from "./config.js";

// define main html elements
const form = document.querySelector("form");
const containerMovieDB = document.querySelector(".containerMovieDB");
const loadingDiv = document.querySelector(".loader");
const chartBtn = document.querySelector("#chartbutton");
const colourArray = ["FF0000","00FF00","0000FF","FFFF00","00FFFF","FF00FF","FF8000","008080","800080","FF7F50","DC143C","000080","00CED1","FFD700","FF1493","7FFF00","9932CC","FF4500","20B2AA","800000"]
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

// Event listener when form is submitted
form.addEventListener("submit", (event) => {
  // moved bulk of this to a function (fetchpopularmovies) so I can use async await
  event.preventDefault();
  resultsObject = {}
  // Get radio value
  loadingPage(loadingDiv, 1950);

  setTimeout(() => {
    fetchPopularMovies();
  }, 2000);
});

async function fetchPopularMovies() {
  const radioValue = document.querySelector(
    'input[name="option"]:checked'
  ).value;

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
      resultArray.forEach((element,i) => {
        // Create button that display name/title
        const divElement = document.createElement("div");
        divElement.classList.add = "divElement";
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

        // DEBUG/REFACTOR DONE AND WORKING TILL HERE

        // for each button create relative container and content
        const paragraph = document.createElement("p");
        const posterImg = document.createElement("img");
        let isParagraphVisible = false;

        button.addEventListener("click", () => {
          if (element.overview) {
            posterImg.src = `https://image.tmdb.org/t/p/original${element.poster_path}`;
            paragraph.textContent = element.overview;
          } else {
            fetch(
              `https://api.themoviedb.org/3/person/${element.id}/combined_credits`,
              queryOptions
            )
              .then((res) => res.json())
              .then((data) => {
                // const castArray = data.cast;
                // let lengthArray = 10;
                // if (castArray.length < lengthArray) {
                //   lengthArray = castArray.length;
                // }

                // let movieList = ""; // Initialize an empty string to store the list

                // for (let i = 0; i < lengthArray; i++) {
                //   const movie = `${castArray[i].title} (${
                //     castArray[i].character
                //   }) (${castArray[i].release_date.slice(0, 4)}) `;
                //   movieList += `<li>${movie}</li>`; // Append each movie as an <li> element to the list
                // }
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
                posterImg.src = `https://image.tmdb.org/t/p/original${element.profile_path}`;
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
  function revenueChart() {
    // gets revenue and budget of each film in result object
    let movieTitleArr = Object.keys(resultsObject); // make array from movietitles so we can use foreach to fetch further details on each film
    console.log(movieTitleArr)
    let mutableRadioValue = radioValue
    if (radioValue == 'people') {
      mutableRadioValue = 'person'
    }
    movieTitleArr.forEach((name) => {
      // NAME IS UNDEFINED
      fetch(
        `https://api.themoviedb.org/3/${mutableRadioValue}/${resultsObject[name].id}?language=en-US`,
        queryOptions
      )
        .then((response) => response.json())
        .then((response) => {
          if (radioValue == 'movie') {
            resultsObject[name].data = (Math.round((response.revenue-response.budget)/100000)/10)
          }
          else if (radioValue == 'tv') {
            resultsObject[name].data = response.number_of_episodes;
            // console.log(resultsObject[name].revenueRatio)
          }
          else {
            resultsObject[name].data = getAge(response.birthday,response.deathday);            
            // console.log(resultsObject[name].revenueRatio)
          }
        })
        .catch((err) => console.error(err));
    });
  }
  const chartImage = document.getElementById("chartimage");
  chartBtn.addEventListener("click", fetchChart);
  function fetchChart() {
    // creates chart image based on revenue
    let movieTitleArr = Object.keys(resultsObject); //
    // await revenueChart(movieTitleArr)
    let dataLabel = "";
    let dataString = "a:";
    let chartTitle = "";
    let chartType = "bvs";
    let colourString = colourArray.join("|");
    // chartType = "bhg"
    console.log(window.innerWidth)
    if (radioValue == 'movie') {
      chartTitle = "Net revenue (millions)";
      movieTitleArr.forEach((name) => {
        // if (resultsObject[name].revenue > 0) {
          // nameArr += `${name}|`;
          dataString += `${resultsObject[name].data},`;
          dataLabel += `${resultsObject[name].data}|`
          // revenueLabel+= `$${resultObject[name].revenue}|`;
        // }
      });
    }
    else if (radioValue == 'tv') {
      chartTitle = "Number of episodes";
      movieTitleArr.forEach((name) => {
        if (resultsObject[name].data > 0) {
          dataString += `${resultsObject[name].data},`;
          dataLabel += `${resultsObject[name].data}|`
        }
      });
    }
    else {
      // chartType = 'p';
      chartTitle = "Age";
      movieTitleArr.forEach((name) => {
        if (resultsObject[name].data > 0) {
          dataString += `${resultsObject[name].data},`;
          dataLabel += `${resultsObject[name].data}|`
        }
      });
    }
    if (window.innerWidth < 500){
      chartType = "p";
      dataLabel += `&chdl=${dataLabel}`;
     }
    // console.log(radioValue)
    const chartURL = `https:/image-charts.com/chart?chco=${colourString}&chtt=${chartTitle}&chd=${dataString}&chl=${dataLabel}&chs=999x999&cht=${chartType}&chxt=y`;
    chartImage.src = chartURL;
  }
}

function getAge(birthDateString,deathDateString) {
  let today = 0;
  if (deathDateString) {
      today = new Date(deathDateString);
  }
  else {
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

// YOUTUBE PERMISSION ISSUE
// fetch(
//   `https://api.themoviedb.org/3/movie/${element.id}/videos`,
//   queryOptions
// )
//   .then((res) => res.json())
//   .then((res) => res.results)
//   .then((res) => {
//     const arrayVideos = res;
//     let officialTrailer = arrayVideos.find(
//       (element) => element.type === "Trailer"
//     );
//     officialTrailer = `https://www.youtube.com/watch?v=${officialTrailer.key}`;
//     console.log(officialTrailer);
//     const iframeYoutube = document.createElement("iframe");
//     iframeYoutube.src = officialTrailer;
//     paragraph.appendChild(iframeYoutube);
//   });
