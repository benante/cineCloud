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
        const paragraph = document.createElement("p");
        if (option == "movie") {
          paragraph.textContent = element.title;
        } else {
          paragraph.textContent = element.name;
        }
        container.appendChild(paragraph);
      });
    })

    .catch((err) => console.error(err));
});
