# HTTPS Project

## Table of Contents

1. [User Stories](#user-stories--acceptance-criteria)
2. [APIs](#apis-used)
3. [Installation](#installation)
4. [Planning](#planning)
5. [Debugging](#debugging)
6. [Future Improvements](#future-improvements)
7. [Learning Outcomes](#learning-outcomes)

## User stories & Acceptance Criteria

This project is designed to give users an overview of popular films, tv shows and actors.

### Core Stories

- See an interesting mashup of different data
- Input information to change the displayed result
- View the app on all of my devices

### Stretch Stories

- As an impatient user, I want to see some indication that data is loading
- As a confused user, I want to be told when something goes wrong

### Acceptance Criteria

- [x] Query at least two APIs using fetch
- [x] Dynamic content generated with JS
- [x] A clearly defined user journey, documented in your readme
- [x] A responsive, mobile-first design
- [x] Ensure your app is accessible to as many different users as possible

## APIs Used

For this project we made use of [The Movie Database API (TMDB)](https://developer.themoviedb.org/docs) and [Image-Charts](https://documentation.image-charts.com/). We use TMDB to find out whats popular at the moment and Image-Charts to make graphs with some of the data available to us.

## Installation

Clone this repo using

```
git clone (repo link)
cd (repo link)
etc etc
```

You will need to create an account with [TMDB](https://www.themoviedb.org/signup) to get your own Access Token.
Once obtained create a config.js file with the following code:

```
export const accessToken = "yourAccessToken"
```

and a package.json file:

```
{
    "type": "module"
        }
```

## Future improvements

One potential improvement would be to enhance the security and ease of configuration for accessing the API. Currently, the project relies on an access token stored in a configuration file, which is ignored by version control for security reasons. However, this approach requires each user to obtain their own access token and configure the file manually. To address this, a future improvement could be implementing a more streamlined method, such as using environment variables. This would allow users to set their access token as an environment variable, eliminating the need for manual configuration and enhancing the project's portability and security.

## Learning outcomes

### JavaScript

- Write code that executes asynchronously
- Use callbacks to access values that aren’t available synchronously
- Use promises to access values that aren’t available synchronously
- Use the fetch method to make HTTP requests and receive responses
- Configure the options argument of the fetch method to make GET and POST requests
- Use the map array method to create a new array containing new values
- Use the filter array method to create a new array with certain values removed

### DOM

- Access DOM nodes using a variety of selectors
- Add and remove DOM nodes to change the content on the page
- Toggle the classes applied to DOM nodes to change their CSS properties

### Design

- Use consistent layout and spacing
- Follow a spacing guideline to give our app a consistent feel

### Developer Toolkit

- Debug client side JS in our web browser
- Use console.log() to help us debug our code
