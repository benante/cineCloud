// import secret key
import { accessToken, apiKey } from "./config.js";

// define main html elements
const form = document.querySelector("form");
const containerMovieDB = document.querySelector(".containerMovieDB");
const loadingDiv = document.querySelector(".loader");
const chartBtn = document.querySelector("#chartbutton");

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

const resultsObject = {}; // used to save relevant info about films from multiple endpoints

// Event listener when form is submitted
form.addEventListener("submit", (event) => {
  // moved bulk of this to a function (fetchpopularmovies) so I can use async await
  event.preventDefault();
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
      resultArray.forEach((element) => {
        // Create button that display name/title
        const item = document.createElement("div");
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
        console.log(movieObj);
        containerMovieDB.appendChild(item);
        item.appendChild(button);

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
                paragraph.innerHTML = `<p>Known for:</p><ul>${movieList}</ul>`; // Wrap the movieList in a <ul> element
                posterImg.src = `https://image.tmdb.org/t/p/original${element.profile_path}`;
              })
              .catch((error) => {
                // Display an error message for the catch error
                paragraph.textContent = `Error: ${error.message}`;
              });
          }

          if (isParagraphVisible) {
            // Hide the paragraph by removing it
            item.removeChild(paragraph);
            item.removeChild(posterImg);
            isParagraphVisible = false;
          } else {
            // Show the paragraph by appending it
            item.appendChild(paragraph);
            item.appendChild(posterImg);
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
    movieTitleArr.forEach((name) => {
      // NAME IS UNDEFINED
      fetch(
        `https://api.themoviedb.org/3/movie/${resultsObject[name].id}?language=en-US`,
        queryOptions
      )
        .then((response) => response.json())
        .then((response) => {
          resultsObject[name].revenue = response.revenue;
          resultsObject[name].budget = response.budget;
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
    let nameArr = "";
    let revenueArr = "a:";
    // let revenueLabel = ""
    movieTitleArr.forEach((name) => {
      if (resultsObject[name].revenue > 0) {
        nameArr += `${name}|`;
        revenueArr += `${resultsObject[name].revenue},`;
        // revenueLabel+= `$${resultObject[name].revenue}|`
      }
    });
    const chartURL = `https:/image-charts.com/chart?chan=1100%2CeaseInCirc&chd=${revenueArr}&chl=${nameArr}&chs=999x200&cht=bvs&chxt=y`;
    chartImage.src = chartURL;
  }
}
// `https:/image-charts.com/chart?chan=1100%2CeaseInCirc&chd=a%${revenueArr}2C&chl=${nameArr}&chs=999x200&cht=bvs&chxt=y`

// https://image-charts.com/chart?chan=1100%2CeaseInCirc&chd=a%0%652000000%396839759%5769331%431769198%171045464%0%2320250281%1308766975%3000000%0%208177026%0%0%417000000%805801000%0%475766228%0%375464627%2C&chl=The%20Flash|Fast%20X|Spider-Man:%20Across%20the%20Spider-Verse|Beau%20Is%20Afraid|John%20Wick:%20Chapter%204|Transformers:%20Rise%20of%20the%20Beasts|My%20Fault|Avatar:%20The%20Way%20of%20Water|The%20Super%20Mario%20Bros.%20Movie|Kandahar|Elemental|Dungeons%20&%20Dragons:%20Honor%20Among%20Thieves|Flamin%27%20Hot|Mission:%20Impossible%20-%20Dead%20Reckoning%20Part%20One|The%20Little%20Mermaid|Guardians%20of%20the%20Galaxy%20Vol.%203|Extraction%202|Ant-Man%20and%20the%20Wasp:%20Quantumania|Fear%20the%20Invisible%20Man|Spider-Man:%20Into%20the%20Spider-Verse|&chs=999x200&cht=bvs&chxt=y

// https://image-charts.com/chart?chan=1100,easeInCirc&chd=a:0,652000000,396839759,5769331,431769198,171045464,0,2320250281,1308766975,3000000,0,208177026,0,0,417000000,805801000,0,475766228,0,375464627,&chl=The Flash|Fast X|Spider-Man: Across the Spider-Verse|Beau Is Afraid|John Wick: Chapter 4|Transformers: Rise of the Beasts|My Fault|Avatar: The Way of Water|The Super Mario Bros. Movie|Kandahar|Elemental|Dungeons & Dragons: Honor Among Thieves|Flamin' Hot|Mission: Impossible - Dead Reckoning Part One|The Little Mermaid|Guardians of the Galaxy Vol. 3|Extraction 2|Ant-Man and the Wasp: Quantumania|Fear the Invisible Man|Spider-Man: Into the Spider-Verse|&chs=999x200&cht=bvs&chxt=y

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
