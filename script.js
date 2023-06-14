import { accessToken, apiKey } from "./config.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
  },
};

fetch("https://api.themoviedb.org/3/trending/all/week", options)
  .then((response) => response.json())
  .then((response) => console.log(response))
  .catch((err) => console.error(err));
