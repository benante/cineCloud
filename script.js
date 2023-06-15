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

// Event listener when form is submitted
form.addEventListener("submit", (event) => {
  event.preventDefault();
  // Get radio value
  const option = document.querySelector('input[name="option"]:checked').value;

  // Get dropdown value
  const time = document.querySelector("#dropdown").value;

  //
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  fetch(`${rootUrl}${queries[option]}${time}`, options)
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
        if (option == "movie") {
          button.textContent = element.title;
        } else {
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
                // console.log(castArray);
                let movieList = ""; // Initialize an empty string to store the list

                for (let i = 0; i < 10; i++) {
                  const movie = `${castArray[i].title} (${
                    castArray[i].character
                  }) (${castArray[i].release_date.slice(0, 4)}) `;
                  console.log(movie);
                  movieList += `<li>${movie}</li>`; // Append each movie as an <li> element to the list
                }

                // Update content for buttons without element.overview
                paragraph.innerHTML = `<ul>${movieList}</ul>`; // Wrap the movieList in a <ul> element
              })
              .catch((err) => console.error(err));
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
    })

    .catch((err) => console.error(err));
});
