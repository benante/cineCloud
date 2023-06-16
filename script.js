// import secret key
import { accessToken, apiKey } from "./config.js";

// define main html elements
const form = document.querySelector("form");
const container = document.querySelector(".container");

// define root and different queries
const rootUrl = "https://api.themoviedb.org/3/trending/";
const queries = {
  movie: "movie/",
  people: "person/",
  tv: "tv/",
};

// temp
const result = [];

const resultObject ={};  // used to save relevant info about films from multiple endpoints

// Event listener when form is submitted
form.addEventListener("submit", (event) => { // moved bulk of this to a function (fetchpopularmovies) so I can use async await
  event.preventDefault();
  // Get radio value
  fetchPopularMovies();
  
})

const options = { // moved out of popular movies func so any query can use it
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

async function fetchPopularMovies() { 
    const option = document.querySelector('input[name="option"]:checked').value;

  // Get dropdown value
  const time = document.querySelector("#dropdown").value;

  //
  
 await fetch(`${rootUrl}${queries[option]}${time}`, options)
    // get body in json format
    .then((response) => response.json())
    .then((data) => {
      // create an array from the data
      const resultArray = data.results;
      console.log(option);
      //    reset the div container everytime the form is submitted
      container.innerHTML = "";
      //   iterate through the elements and display them
      resultArray.forEach((element) => {
        // console.log(element);
        // Create button that display name/title
        const item = document.createElement("div");
        const button = document.createElement("button");
        let title = ""
        if (option == "movie") {
          title = element.title;
            let movieObj = {  // create an object with saving film id will be added to the overall object
                id: element.id
            }
          button.textContent = element.title;
          resultObject[title] = movieObj  // nest movie object in the result object with movie title as key have done like this to avoid for loop
          
        } else {
          title = element.name;
          let movieObj = {  // exact same as in the if above
              id: element.id
          }
          resultObject[title] = movieObj; // exact same as in the if above
          button.textContent = element.name;
        }
        container.appendChild(item);
        item.appendChild(button);

        // for each button create relative container and content
        const paragraph = document.createElement("p");
        let isParagraphVisible = false;
        button.addEventListener("click", () => {
          if (element.overview) {
            paragraph.textContent = element.overview;
            console.log(element.overview);
            // hello
          } else {
            fetch(
              `https://api.themoviedb.org/3/person/${element.id}/combined_credits`,
              options
            )
              .then((res) => res.json())
              .then((data) => {
                const castArray = data.cast;
                let lengthArray = 10;
                if (castArray.length < lengthArray) {
                  lengthArray = castArray.length;
                }

                // console.log(castArray);
                let movieList = ""; // Initialize an empty string to store the list

                for (let i = 0; i < lengthArray; i++) {
                  const movie = `${castArray[i].title} (${
                    castArray[i].character
                  }) (${castArray[i].release_date.slice(0, 4)}) `;
                  console.log(movie);
                  movieList += `<li>${movie}</li>`; // Append each movie as an <li> element to the list
                }

                // Update content for buttons without element.overview
                paragraph.innerHTML = `<ul>${movieList}</ul>`; // Wrap the movieList in a <ul> element
              })
              .catch((error) => {
                // Display an error message for the catch error
                paragraph.textContent = `Error: ${error.message}`;
              });
          }

          if (isParagraphVisible) {
            // Hide the paragraph by removing it
            item.removeChild(paragraph);
            isParagraphVisible = false;
          } else {
            // Show the paragraph by appending it
            item.appendChild(paragraph);
            isParagraphVisible = true;
          }
        });
      });
      revenueChart()
    })

    .catch((error) => {
      // Display a general error message for the fetch error
      container.innerHTML = `<p>Error: ${error.message}</p>`;
    });
    function revenueChart() {  // gets revenue and budget of each film in result object
      // console.log(movieTitleArr);
      let movieTitleArr = Object.keys(resultObject) // make array from movietitles so we can use foreach to fetch further details on each film
       movieTitleArr.forEach(name => {
        fetch(`https://api.themoviedb.org/3/movie/${resultObject[name].id}?language=en-US`, options)
        .then(response => response.json())
        .then(response => {
          resultObject[name].revenue = response.revenue
          resultObject[name].budget = response.budget
          console.log(resultObject[name].revenue)
        })
        .catch(err => console.error(err));
      })
    }
    const chartButton = document.getElementById("chartbutton")
    const chartImage = document.getElementById("chartimage")
    chartButton.addEventListener("click",fetchChart)
    function fetchChart() {  // creates chart image based on revenue
      
      let movieTitleArr = Object.keys(resultObject) // 
      // await revenueChart(movieTitleArr)
      let nameArr = ""
      let revenueArr = "a:"
      // let revenueLabel = ""
      movieTitleArr.forEach(name => {
        if (resultObject[name].revenue > 0) {
          nameArr+= `${name}|`
          revenueArr+= `${resultObject[name].revenue},`
          // revenueLabel+= `$${resultObject[name].revenue}|`
        }
      })
      console.log(revenueArr)
      const chartURL = `https:/image-charts.com/chart?chan=1100%2CeaseInCirc&chd=${revenueArr}&chl=${nameArr}&chs=999x200&cht=bvs&chxt=y`
      chartImage.src = chartURL
    }
  }
    // `https:/image-charts.com/chart?chan=1100%2CeaseInCirc&chd=a%${revenueArr}2C&chl=${nameArr}&chs=999x200&cht=bvs&chxt=y`
    
    // https://image-charts.com/chart?chan=1100%2CeaseInCirc&chd=a%0%652000000%396839759%5769331%431769198%171045464%0%2320250281%1308766975%3000000%0%208177026%0%0%417000000%805801000%0%475766228%0%375464627%2C&chl=The%20Flash|Fast%20X|Spider-Man:%20Across%20the%20Spider-Verse|Beau%20Is%20Afraid|John%20Wick:%20Chapter%204|Transformers:%20Rise%20of%20the%20Beasts|My%20Fault|Avatar:%20The%20Way%20of%20Water|The%20Super%20Mario%20Bros.%20Movie|Kandahar|Elemental|Dungeons%20&%20Dragons:%20Honor%20Among%20Thieves|Flamin%27%20Hot|Mission:%20Impossible%20-%20Dead%20Reckoning%20Part%20One|The%20Little%20Mermaid|Guardians%20of%20the%20Galaxy%20Vol.%203|Extraction%202|Ant-Man%20and%20the%20Wasp:%20Quantumania|Fear%20the%20Invisible%20Man|Spider-Man:%20Into%20the%20Spider-Verse|&chs=999x200&cht=bvs&chxt=y
    
    // https://image-charts.com/chart?chan=1100,easeInCirc&chd=a:0,652000000,396839759,5769331,431769198,171045464,0,2320250281,1308766975,3000000,0,208177026,0,0,417000000,805801000,0,475766228,0,375464627,&chl=The Flash|Fast X|Spider-Man: Across the Spider-Verse|Beau Is Afraid|John Wick: Chapter 4|Transformers: Rise of the Beasts|My Fault|Avatar: The Way of Water|The Super Mario Bros. Movie|Kandahar|Elemental|Dungeons & Dragons: Honor Among Thieves|Flamin' Hot|Mission: Impossible - Dead Reckoning Part One|The Little Mermaid|Guardians of the Galaxy Vol. 3|Extraction 2|Ant-Man and the Wasp: Quantumania|Fear the Invisible Man|Spider-Man: Into the Spider-Verse|&chs=999x200&cht=bvs&chxt=y
