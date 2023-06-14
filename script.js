import { accessToken, apiKey } from "./config.js";

const form = document.querySelector("form");
const container = document.querySelector(".container");
console.log(container);

const rootUrl = "https://api.themoviedb.org/3/trending/";
const queries = {
  movie: "movie/",
  people: "person/",
  tv: "tv/",
};

const result = [];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  // Get radio value
  const option = document.querySelector('input[name="option"]:checked').value;

  // Get dropdown value
  const time = document.querySelector("#dropdown").value;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  fetch(`${rootUrl}${queries[option]}${time}`, options)
    .then((response) => response.json())
    .then((data) => {
      const resultArray = data.results;
      console.log(option);
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
