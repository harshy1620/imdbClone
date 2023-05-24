"use strict";
(function(){
  const searchKeyword = document.getElementById("search");
  const suggestionsContainer = document.getElementById("card-container");
  const favMoviesContainer = document.getElementById("fav-movies-container");
  const emptyText = document.getElementById("empty-search-text");
  const showFavourites = document.getElementById("favorites-section");
  const emptyFavText = document.getElementById("empty-fav-text");

  // calling addToFavDOM() function to add the movies to favourite secrtions list
  addToFavDOM();
  // calling showEmptyText() function to handle the text inside the suggestionsContainer
  showEmptyText();
  // creating suggestionList array to store the movies suggestion after search
  let suggestionList = [];
  // creating favMovieArray to store the list of favourites movie
  let favMovieArray = [];

  // adding event listener on the search input field
  searchKeyword.addEventListener("keydown", (event) => {
    if (event.key == "Enter") {
      event.preventDefault();
    }
  });

  // this function will handle how the text inside the suggestionsContainer changes
  function showEmptyText() {
    // if there is no suggestion display the text inside the emptyFavText
    if (favMoviesContainer.innerHTML == "") {
      emptyFavText.style.display = "block";
      // else hide the text
    } else {
      emptyFavText.style.display = "none";
    }
  }

  // Event listner on search
  searchKeyword.addEventListener("keyup", function () {
    let search = searchKeyword.value;
    // if there is nothing written for search do this
    if (search === "") {
      emptyText.style.display = "block";
      suggestionsContainer.innerHTML = "";
      // clears the previous movies from array
      // suggestionList = [];
    } 
    // but if there is something wirtten to search then
    else {
      emptyText.style.display = "none";
      // call the api to get the data using function "fecthMovies()" -> defined later in the code
      (async () => {
        let data = await fetchMovies(search);
        // after getting the data, call the function "addToSuggestionConatinerDOM()" to further handle this data
        addToSuggestionContainerDOM(data);
      })();
      // setting the suggestionContiner's display as grid
      suggestionsContainer.style.display = "grid";
    }
  });

  // defining the fectMovies() function to fetch the data from the api
  async function fetchMovies(search) {
    const url = `https://www.omdbapi.com/?t=${search}&apikey=aa5bfd93`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      // this fucntion returns the data as an array
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  // defining the addToSuggestionContainerDOM() function to add the data to the suggestionarray and to show the search result
  function addToSuggestionContainerDOM(data) {
    document.getElementById("empty-fav-text").style.display = "none";
    let isPresent = false;

    // to check if the movie is already present in the suggestionList array
    suggestionList.forEach((movie) => {
      if (movie.Title == data.Title) {
        isPresent = true;
      }
    });
    // if the movie is not already present and the title of the data is not defined the do this
    if (!isPresent && data.Title != undefined) {
      // here we first check if the poster of the data is having something or not
      if (data.Poster == "N/A") {
        data.Poster = "./images/not-found.png";
      }
      // the we add this data into the suggestionList array
      suggestionList.push(data);
      // after getting the data we start working on creating the movie card container
      const movieCard = document.createElement("div");
      // here we are writting the html and css of the movie card
      movieCard.setAttribute("class", "card");

      movieCard.innerHTML = `<a href="movie.html">
          <img
            src="${data.Poster} "
            alt="..."
            data-id = "${data.Title} "
          />
          </a>
          <h2 class="card-title">${data.Title}</h2>
          <div class="details">
            <div class="rating">
                <span style="font-size:17px;">⭐ ${data.imdbRating}</span>
                <span></span>
            </div>
            <span class="favorite-icon"><i class="fa-solid fa-heart add-fav" data-id="${data.Title}"></i></span>
          </div>
    `;
    // after creating the conatiner we add this container to the suggestionsContainer (just like append we have prepend to add the new element to the starting)
      suggestionsContainer.prepend(movieCard);
    }
  }

  // handling the favourites section
  // Add to favourite of localStorage
  async function handleFavBtn(e) {
    const target = e.target;

    // getting the data about the movie to be added in the favorites section
    let data = await fetchMovies(target.dataset.id);

    let favMoviesLocal = localStorage.getItem("favMoviesList");

    if (favMoviesLocal) {
      favMovieArray = Array.from(JSON.parse(favMoviesLocal));
    } else {
      localStorage.setItem("favMoviesList", JSON.stringify(data));
    }

    // to check if movie is already present in the fav list
    let isPresent = false;
    favMovieArray.forEach((movie) => {
      if (data.Title == movie.Title) {
        notify("already added to fav list");
        isPresent = true;
      }
    });

    if (!isPresent) {
      favMovieArray.push(data);
    }

    localStorage.setItem("favMoviesList", JSON.stringify(favMovieArray));
    isPresent = !isPresent;
    addToFavDOM();
  }

  // Add to favourite list DOM
  function addToFavDOM() {
    favMoviesContainer.innerHTML = "";
    let favList = JSON.parse(localStorage.getItem("favMoviesList"));
    if (favList) {
      favList.forEach((movie) => {
        const div = document.createElement("div");
        div.classList.add("fav-card");
        div.innerHTML = `
        <div class="fav-img">
        <img src="${movie.Poster}" alt="">
    </div>
        <div class="detail-movie">
            <div>
            <a href = "movie.html" data-id="${movie.Title}">
            <h4>${movie.Title}</h4>
            <a> 
                <p>${movie.Year}</p>
            </div>
            <i class="fas fa-trash" style="color: #ffea00;" data-id="${movie.Title}"></i>
        </div>
    `;
        favMoviesContainer.prepend(div);
      });
    }
  }

  // To notify
  function notify(text) {
    window.alert(text);
  }

  // Delete from favourite list
  function deleteMovie(name) {
    let favList = JSON.parse(localStorage.getItem("favMoviesList"));
    let updatedList = Array.from(favList).filter((movie) => {
      return movie.Title != name;
    });

    localStorage.setItem("favMoviesList", JSON.stringify(updatedList));

    addToFavDOM();
    showEmptyText();
  }

  // Handles click events
  async function handleClickListner(e) {
    const target = e.target;
    if (target.classList.contains("add-fav")) {
      e.preventDefault();
      handleFavBtn(e);
    } else if (target.classList.contains("fa-trash")) {
      deleteMovie(target.dataset.id);
    } else if (target.classList.contains("fa-bars")) {
      if (showFavourites.style.display == "flex") {
        console.log("clicked 1");
        document.getElementById("show-favourites").style.color = "#8b9595";
        showFavourites.style.display = "none";
      } else {
        console.log("clicked 2");
        showFavourites.classList.add("animate__backInRight");
        document.getElementById("show-favourites").style.color =
          "var(--logo-color)";
        showFavourites.style.display = "flex";
      }
    }

    localStorage.setItem("movieName", target.dataset.id);
  }

  // Event listner on whole document
  document.addEventListener("click", handleClickListner);
})();











