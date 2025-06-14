const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 151;
const OFFSET = 0;
const container = document.getElementById('pokemon-container');
const img_front_default = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
const front_default = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
let allPokemons = []; // globale Liste für Suche

async function init() {
  const pokemons = await fetchPokemons();
  allPokemons = pokemons;
  for (let i = 0; i < pokemons.length; i++) {
    await renderPokemon(pokemons[i], i);
  }
}


async function fetchPokemons(offset = 0) {
  const response = await fetch(`${BASE_URL}?limit=${LIMIT}&offset=${offset}`);
  if (!response.ok) {
    console.error("Error fetching data:", response.statusText);
    return [];
  }
  const json = await response.json();
  return json.results;
}


async function renderPokemon(pokemon, index) {
  const pokemonIndex = index + OFFSET + 1;

  // ➕ Lade Details von der API
  const detailsResponse = await fetch(pokemon.url);
  const details = await detailsResponse.json();

  // ➕ Extrahiere die Typen
  const types = details.types.map(t => t.type.name).join(", ");

  // ➕ Erstelle das HTML
  const liElement = createHTML(pokemon, pokemonIndex, types);

  container.appendChild(liElement);
}

function createHTML(pokemon, pokemonIndex, types) {
  const liElement = document.createElement("li");
  liElement.classList.add("pokemon-item");
  liElement.setAttribute("onclick", `aboutPokemon('${pokemon.name}', ${pokemonIndex})`);
  liElement.innerHTML = `
    <h2>${pokemonIndex} ${pokemon.name}</h2>
    <img class="img-pokemon" src="${img_front_default + pokemonIndex}.png" alt="image: ${pokemon.name}" />
    <p>Types: ${types}</p>
  `;
  return liElement;
}

async function aboutPokemon(pokemon, index) {
  const aboutContainer = document.getElementById('about-container');
  document.getElementById("about-container").style.display = 'flex';
  const response = await fetch(`${BASE_URL}/${index}`);
  const details = await response.json();
  const types = details.types.map(t => t.type.name).join(", ");
  aboutContainer.innerHTML = getinfo(pokemon, index, types);
}

function getinfo(pokemon, index, types) {
  return `
  <div class="overlay">
    <button class="close-btn" onclick="closeOverlay()">Close</button>
    <h2>About ${pokemon}</h2>
    <img class="img-pokemon" src="${img_front_default + index}.png" alt="image: ${pokemon}" />
    <p><strong>Types:</strong> ${types}</p>
    <p>More details about the Pokémon will be displayed here.</p>
    </div>
  `;
}

function closeOverlay() {
  document.getElementById("about-container").style.display = 'none';
}

function searchPokemon() {
  const searchValue = document.getElementById("search-input").value.toLowerCase();
  container.innerHTML = "";

  allPokemons.forEach((pokemon, index) => {
    const name = pokemon.name.toLowerCase();
    const id = index + 1;
    if (name.includes(searchValue) || id.toString() === searchValue) {
      renderPokemon(pokemon, index);
    }
  });
}

async function loadMorePokemons() {
  document.getElementById("search-input").value = "";

  const currentCount = container.children.length;
  const nextOffset = OFFSET + currentCount;

  const pokemons = await fetchPokemons(nextOffset);
  allPokemons.push(...pokemons); // wichtig für Suchfunktion

  for (let i = 0; i < pokemons.length; i++) {
    await renderPokemon(pokemons[i], nextOffset + i); // Korrektes Index
  }
}


async function loadAllPokemons() {

  document.getElementById("search-input").value = "";
  const totalCount = 1302;
  container.innerHTML = "";
  const allData = [];

  for (let offset = 0; offset < totalCount; offset += LIMIT) {
    const pokemons = await fetchPokemons(offset);
    allData.push(...pokemons);
  }

  allPokemons = allData;

  for (let i = 0; i < allData.length; i++) {
    await renderPokemon(allData[i], i);
  }

  document.getElementById("loadMore_btn").style.display = "none";
  document.getElementById("loadAllPokemons_btn").style.display = "none";
}

