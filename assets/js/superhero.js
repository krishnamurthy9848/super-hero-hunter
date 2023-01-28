// initial state of marvel variable
let marvel = {
  copyright: '',
  attributionHTML: '',
  attributionText: '',
  home: [],
  characters: [],
  favourites: [],
  expiry: Date.now(),
  id: null
};

let showFavourites = false;

const appLogo = document.getElementById('app-name');
const characterTab = document.getElementById('character-tab');
const favouriteTab = document.getElementById('favourite-tab');
const searchBar = document.getElementById('search-bar');
const list = document.getElementById('characters-list');
const footer = document.getElementById('footer');

// Navigate to home page upon clicking of app name
const navigateToHome = () => {
  window.location.assign('./index.html');
};

appLogo.addEventListener('click', navigateToHome);

// Function to create new DOM element for each character
const newListDom = (character, btnClass, btn) => {
  return `<div class="image-container">
              <img
                src="${character.thumbnail.path}/portrait_uncanny.${character.thumbnail.extension}"
              />
            </div>
            <div class="character-name">${character.name}</div>
            <div class="character-desc">${character.description}</div>
            <div class="character-stats">
              <div>Comics: ${character.comics}, 
                Stories: ${character.stories},
                Events: ${character.events}, 
                Series: ${character.series}
              </div>
              <div class="${btnClass} prevent-select" data-id="${character.id}">${btn}</div>
            </div>
            <div class="attribution">
              <a href="https://marvel.com" target="_blank">${marvel.attributionText}</a>
            </div>`;
};

// Function to favourite/unfavourite a character (toggle favourite)
const toggleFavourite = (e) => {
  let btn = e.target;
  let id = parseInt(btn.getAttribute('data-id'));

  let index = marvel.favourites.indexOf(id);

  if (index == -1) {
    marvel.favourites.push(id);
  } else {
    marvel.favourites.splice(index, 1);
  }

  // update localStorage
  localStorage.setItem('marvel', JSON.stringify(marvel));
  renderCharacters();
};

// Function for switching tabs between display all characters and display favourites
const toggleTab = (e) => {
  const tab = e.target;
  const id = tab.id;
  if (showFavourites && id == 'character-tab') {
    showFavourites = false;
    tab.classList.add('active-tab');
    favouriteTab.classList.remove('active-tab');
  } else if (!showFavourites && id == 'favourite-tab') {
    showFavourites = true;
    tab.classList.add('active-tab');
    characterTab.classList.remove('active-tab');
  }

  renderCharacters();
};

// Function for rendering superheroes
const renderCharacters = () => {
  footer.innerHTML = marvel.copyright;

  // clear list
  list.innerHTML = '';

  // Select superheroes to display based on tab status
  let characters;
  if (showFavourites) {
    characters = marvel.characters.filter((character) => {
      const id = character.id;
      const index = marvel.favourites.indexOf(id);
      if (index != -1) {
        return true;
      } else {
        return false;
      }
    });
  } else {
    characters = marvel.home;
  }

  // If there are no characters to display, show a message
  if (characters.length == 0) {
    const empty = document.createElement('h1');
    empty.id = 'empty-list';
    empty.innerHTML = 'Nothing here to display!';
    list.appendChild(empty);
  }

  // For each superhero, create a superhero card with its information and append to superheroes list
  characters.forEach((character) => {
    const card = document.createElement('div');
    card.className = 'character-item';
    card.id = character.id;

    // Display appropriate favourite button
    let btn;
    let btnClass;

    if (showFavourites) {
      btn = 'Remove from favourites';
      btnClass = 'unfavourite-btn';
    } else {
      const index = marvel.favourites.indexOf(character.id);
      if (index == -1) {
        btnClass = 'favourite-btn';
        btn = 'Add to favourites';
      } else {
        btnClass = 'unfavourite-btn';
        btn = 'Remove from favourites';
      }
    }

    card.innerHTML = newListDom(character, btnClass, btn);
    list.appendChild(card);

    // If a character has no description, display a message
    if (character.description == '') {
      card.querySelector('.character-desc').innerHTML =
        'Description not available!';
    }

    // Attach event listeners to card
    card
      .querySelector(`.${btnClass}`)
      .addEventListener('click', toggleFavourite);

    card
      .querySelector('.image-container')
      .addEventListener('click', function (event) {
        marvel.id = character.id;
        localStorage.setItem('marvel', JSON.stringify(marvel));
        location.assign('./singleCharacter.html');
      });
  });
};

// Function to hit the Marvel API to fetch superheroes information
const fetchCharacters = async () => {
  const API_ROOT = 'https://gateway.marvel.com';
  const ts = 2;
  const publicKey = '917ee510cf42654a13644448b8470ad3';
  const hash = '967615c8277734f7fc55f9ba050024f3';
  const limit = 100;
  const orderBy = 'name';
  let offset = 0;
  let url = `${API_ROOT}/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${limit}&offset=${offset}&orderBy=${orderBy}`;

  let response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: '*/*'
    }
  });
  let data = await response.json();

  // total = total number of characters in the marvel database
  const total = data.data.total;

  // Setting an expiry date for the localStorage variable, upon expiry the data is fetched once again from the API.
  const ms = Date.now();
  marvel.expiry = ms + 1000 * 60 * 60 * 24;

  // Store information from the API
  marvel.copyright = data.copyright;
  marvel.attributionHTML = data.attributionHTML;
  marvel.attributionText = data.attributionText;
  data.data.results.forEach((item) => {
    const character = {
      name: item.name,
      description: item.description,
      id: item.id,
      events: item.events.available,
      stories: item.stories.available,
      series: item.series.available,
      comics: item.comics.available,
      thumbnail: item.thumbnail
    };
    marvel.home.push(character);
    marvel.characters.push(character);
  });

  searchBar.style.fontSize = '0.7rem';
  searchBar.placeholder = 'please wait while we fetch data from server';

  localStorage.setItem('marvel', JSON.stringify(marvel));

  // Render superheroes after the first API call to prevent delay
  // If all characters are fetched from API, then loading time increases

  renderCharacters();

  // Fetching the rest of the superheroes from the API for autocomplete search to work.
  offset += 100;
  while (offset < total) {
    url = `${API_ROOT}/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}&limit=${limit}&offset=${offset}&orderBy=${orderBy}`;
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: '*/*'
      }
    });
    data = await response.json();

    data.data.results.forEach((item) => {
      const character = {
        name: item.name,
        description: item.description,
        id: item.id,
        events: item.events.available,
        stories: item.stories.available,
        series: item.series.available,
        comics: item.comics.available,
        thumbnail: item.thumbnail
      };
      marvel.characters.push(character);
    });

    offset += 100;
  }

  searchBar.placeholder = 'Eg: Spider-man, Avengers ...';

  // Store the information fetched from the API in localStorage
  localStorage.setItem('marvel', JSON.stringify(marvel));
};

// Autocomplete search function
const enableAutocomplete = function () {
  // Variable to track the position of search item when user presses up or down arrow to navigate search results
  let selected = -1;

  // Function to remove search results list
  const destroyLists = () => {
    selected = -1;
    document
      .querySelectorAll('.autocomplete-list')
      .forEach((list) => list.remove());
  };

  const newAutocompleteItemDOM = (character, btn, btnClass, inputValue) => {
    return `<div class="autocomplete-item-name">
              <strong>${character.name.slice(
                0,
                inputValue.length
              )}</strong>${character.name.slice(inputValue.length)}
              </div>
            <div class="${btnClass}">${btn}</div>`;
  };

  // Function to handle search input
  const handleTextInput = (e) => {
    const inputBox = e.target;
    const inputValue = inputBox.value;
    destroyLists();
    if (!inputValue) {
      return;
    }

    const newList = document.createElement('div');
    newList.classList.add('autocomplete-list');
    newList.classList.add('prevent-select');

    const parent = document.querySelector('.autocomplete');
    parent.appendChild(newList);

    marvel.characters.forEach((character) => {
      // Check if the search bar input matches the first few characters of a superhero
      if (
        inputValue.toUpperCase() ==
        character.name.slice(0, inputValue.length).toUpperCase()
      ) {
        const div = document.createElement('div');
        div.classList.add('autocomplete-item');

        // Decide the type of button based on whether the superhero is favourite or not
        let btn;
        let btnClass;
        if (marvel.favourites.indexOf(character.id) == -1) {
          btn = '<i class="fa-regular fa-star"></i>';
          btnClass = 'autocomplete-item-favourite-btn';
        } else {
          btn = '<i class="fa-solid fa-star"></i>';
          btnClass = 'autocomplete-item-unfavourite-btn';
        }

        div.innerHTML = newAutocompleteItemDOM(
          character,
          btn,
          btnClass,
          inputValue
        );
        newList.appendChild(div);

        // Attach event listeners to a search result
        div
          .querySelector('.autocomplete-item-name')
          .addEventListener('click', (e) => {
            marvel.id = character.id;
            localStorage.setItem('marvel', JSON.stringify(marvel));
            location.assign('./singleCharacter.html');
          });

        div.querySelector(`.${btnClass}`).addEventListener('click', (e) => {
          const btn = e.target.parentNode;
          const btnClass = btn.className;
          if (btnClass == 'autocomplete-item-favourite-btn') {
            marvel.favourites.push(character.id);

            btn.classList.remove('autocomplete-item-favourite-btn');
            btn.classList.add('autocomplete-item-unfavourite-btn');
            btn.innerHTML = '<i class="fa-solid fa-star"></i>';
          } else {
            const index = marvel.favourites.indexOf(character.id);
            marvel.favourites.splice(index, 1);

            btn.classList.remove('autocomplete-item-unfavourite-btn');
            btn.classList.add('autocomplete-item-favourite-btn');
            btn.innerHTML = '<i class="fa-regular fa-star"></i>';
          }
          localStorage.setItem('marvel', JSON.stringify(marvel));
          if (showFavourites) {
            renderCharacters();
          }
        });
      }
    });
  };

  // Function to remove active class from a search result
  const removeActive = (divs) => {
    divs.forEach((div) => {
      div.classList.remove('autocomplete-active');
    });
  };

  // Function to make a search result active, highlight the search result
  const addActive = (divs) => {
    removeActive(divs);
    if (selected >= divs.length) {
      selected = 0;
    }
    if (selected < 0) {
      selected = divs.length - 1;
    }
    divs[selected].classList.add('autocomplete-active');
    divs[selected].scrollIntoView();
  };

  // function to handle key down by the user on the search results
  const handleKeydown = (e) => {
    const autocompleteList = document.querySelector('.autocomplete-list');
    if (!autocompleteList) {
      return;
    }
    const items = autocompleteList.querySelectorAll('.autocomplete-item');
    if (items.length == 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        selected++;
        addActive(items);
        break;
      case 'ArrowUp':
        selected--;
        addActive(items);
        break;
      case 'Enter':
        e.preventDefault();
        if (selected > -1) {
          items[selected].querySelector('.autocomplete-item-name').click();
        }
    }
  };

  // Attach event listeners to search bar and document
  // Hide the search result when user clicks anywhere in the document except the search bar
  searchBar.addEventListener('input', handleTextInput);
  searchBar.addEventListener('keydown', handleKeydown);
  document.addEventListener('click', (e) => {
    let clicked = e.target;
    if (clicked == searchBar) {
      return;
    }
    if (clicked.nodeName == 'I') {
      return;
    }
    destroyLists();
  });
};

// Attach event listeners for switching tabs
characterTab.addEventListener('click', toggleTab);
favouriteTab.addEventListener('click', toggleTab);

// Update the marvel variable upon page load / reload
const marvelLS = JSON.parse(localStorage.getItem('marvel'));
let fetchRequired = false;
if (marvelLS) {
  // To preserve previous favourites
  marvel.favourites = marvelLS.favourites;

  // If localStorage variable has expired (crossed the expiry date), re-fetch the information
  let ms = Date.now();
  if (ms >= marvelLS.expiry) {
    fetchRequired = true;
  }
} else {
  fetchRequired = true;
}

if (fetchRequired) {
  fetchCharacters();
  console.log('fetch');
} else {
  marvel = marvelLS;
  renderCharacters();
}

enableAutocomplete();
