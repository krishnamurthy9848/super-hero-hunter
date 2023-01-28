// Get the marvel variable from the localStorage
const marvel = JSON.parse(localStorage.getItem('marvel'));
let characterData = null;

const backBtn = document.getElementById('back-btn');
const appLogo = document.getElementById('app-name');
const footer = document.getElementById('footer');
const searchBar = document.getElementById('search-bar');
const superheroContainer = document.getElementById(
  'single-character-container'
);

// Clicking on back button goes to the home page
backBtn.addEventListener('click', () => {
  location.assign('./index.html');
});

// Clicking the app logo goes to the home page
appLogo.addEventListener('click', () => {
  location.assign('./index.html');
});

// update footer
footer.innerHTML = marvel.attributionHTML;

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

// Function to create new superhero info
const newSuperheroDOM = (superhero) => {
  return `<div id="superhero-img">
              <img
                src="${superhero.thumbnail.path}/detail.${superhero.thumbnail.extension}"
                alt="superhero-image"
              />
            </div>
            <div id="superhero-name">${superhero.name}</div>
            <div id="superhero-id">ID: ${superhero.id}</div>
            <div id="superhero-description">
              <h2>Description:</h2>
              <div>
                ${superhero.description}  
              </div>
            </div>
            <div id="superhero-stats">
              <div id="comics">
                <h3>Comics:</h3>
                Available comics: ${superhero.comics.available}
                <ul id="comics-list">
                  
                </ul>
              </div>
              <div id="stories">
                <h3>Stories:</h3>
                Available stories: ${superhero.stories.available}
                <ul id="stories-list">
                  
                </ul>
              </div>
              <div id="series">
                <h3>Series:</h3>
                Available series: ${superhero.series.available}
                <ul id="series-list">
                  
                </ul>
              </div>
              <div id="events">
                <h3>Events:</h3>
                Available events: ${superhero.events.available}
                <ul id="events-list">
                  
                </ul>
              </div>
            </div>`;
};

// Function to display superhero information

const renderCharacter = () => {
  let infoContainer = document.getElementById('info');
  if (infoContainer) {
    infoContainer.remove();
  }

  infoContainer = document.createElement('div');
  infoContainer.id = 'info';

  infoContainer.innerHTML = newSuperheroDOM(characterData);

  superheroContainer.appendChild(infoContainer);

  if (characterData.description == '') {
    document.querySelector('#superhero-description div').innerHTML =
      'Description not available!';
  }

  const comicsList = document.getElementById('comics-list');
  const eventsList = document.getElementById('events-list');
  const seriesList = document.getElementById('series-list');
  const storiesList = document.getElementById('stories-list');

  if (characterData.comics.available == 0) {
    comicsList.remove();
  } else {
    characterData.comics.items.forEach((comic) => {
      const li = document.createElement('li');
      li.innerHTML = comic.name;
      comicsList.appendChild(li);
    });
  }

  if (characterData.series.available == 0) {
    seriesList.remove();
  } else {
    characterData.series.items.forEach((value) => {
      const li = document.createElement('li');
      li.innerHTML = value.name;
      seriesList.appendChild(li);
    });
  }

  if (characterData.stories.available == 0) {
    storiesList.remove();
  } else {
    characterData.stories.items.forEach((story) => {
      const li = document.createElement('li');
      li.innerHTML = story.name;
      storiesList.appendChild(li);
    });
  }

  if (characterData.events.available == 0) {
    eventsList.remove();
  } else {
    characterData.events.items.forEach((event) => {
      const li = document.createElement('li');
      li.innerHTML = event.name;
      eventsList.appendChild(li);
    });
  }
};

// Fetch details of a single character from the Marvel API

const fetchCharacter = () => {
  const id = marvel.id;
  if (id != null) {
    const API_ROOT = 'https://gateway.marvel.com';
    const ts = 2;
    const publicKey = '917ee510cf42654a13644448b8470ad3';
    const hash = '967615c8277734f7fc55f9ba050024f3';
    let url = `${API_ROOT}/v1/public/characters/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`;

    fetch(url, {
      method: 'GET',
      headers: {
        Accept: '*/*'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        characterData = data.data.results[0];

        document.title = `Superhero Hunter | ${characterData.name}`;
        renderCharacter();
      });
  }
};

enableAutocomplete();
fetchCharacter();
