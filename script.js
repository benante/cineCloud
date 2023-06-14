import { accessToken, apiKey } from "./config.js";

const form = document.querySelector("form");
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
    .then((data) => data.results)
    .then((res) => console.log(res))
    //   .then((data) => {
    //     for(let i = 0; i < data.lenght; i++) {
    //         console.log()
    //     }
    //   })

    .catch((err) => console.error(err));
});
