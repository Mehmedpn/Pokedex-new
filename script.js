const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 40;
const OFFSET = 0;
const container = document.getElementById('pokemon-container');
const img_front_default = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
const front_default = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
let allPokemons = [];
const loader = document.getElementById('loader');

async function init() {
  document.getElementById("loader-wrapper").style.display = "flex";
  const pokemons = await fetchPokemons();
  allPokemons = pokemons;
  for (let i = 0; i < pokemons.length; i++) {
    await renderPokemon(pokemons[i], i);
  }
  document.getElementById("loader-wrapper").style.display = "none";
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
  const detailsResponse = await fetch(pokemon.url);
  const details = await detailsResponse.json();
  const imageUrl = details.sprites.other["official-artwork"].front_default;
  const types = details.types.map(t => t.type.name).join(", ");
  const pokemonIndex = index + 1;

  const liElement = createHTML(pokemon, pokemonIndex, types, imageUrl);
  container.appendChild(liElement);
}


function createHTML(pokemon, pokemonIndex, types, imageUrl) {
  const liElement = document.createElement("li");
  liElement.classList.add("pokemon-item");

  const firstType = types.split(',')[0].trim();
  const bgColor = typeColors[firstType] || '#F5F5F5'; // fallback

  liElement.style.backgroundColor = bgColor;

  liElement.setAttribute("onclick", `aboutPokemon('${pokemon.name}', ${pokemonIndex})`);
  liElement.innerHTML = `
    <h2>${pokemonIndex} ${pokemon.name}</h2>
    <img class="img-pokemon" src="${imageUrl}" alt="image: ${pokemon.name}" />
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
  const imageUrl = details.sprites.other["official-artwork"].front_default;

  aboutContainer.innerHTML = getinfo(pokemon, types, imageUrl);
}


function getinfo(pokemon, types, imageUrl) {
  return `
    <div class="overlay">
      <span class="material-symbols-outlined" onclick="closeOverlay()">close</span>
      <h2>About ${pokemon}</h2>
      <img class="img-pokemon" src="${imageUrl}" alt="image: ${pokemon}" />
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
  document.getElementById("loader-wrapper").style.display = "flex";
  document.getElementById("search-input").value = "";
  const currentCount = container.children.length;
  const nextOffset = OFFSET + currentCount;
  const pokemons = await fetchPokemons(nextOffset);
  allPokemons.push(...pokemons);
  for (let i = 0; i < pokemons.length; i++) {
    await renderPokemon(pokemons[i], nextOffset + i);
  }
  document.getElementById("loader-wrapper").style.display = "none";
}


async function loadAllPokemons() {
  document.getElementById("loader-wrapper").style.display = "flex";
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
  document.getElementById("loader-wrapper").style.display = "none";
}

const typeColors = {
  grass: '#78C850',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  bug: '#A8B820',
  normal: '#A8A878',
  poison: '#A040A0',
  ground: '#E0C068',
  fairy: '#EE99AC',
  fighting: '#C03028',
  psychic: '#F85888',
  rock: '#B8A038',
  ghost: '#705898',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  flying: '#A890F0'
};
