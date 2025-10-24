const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const LIMIT = 40;
const OFFSET = 0;
const container = document.getElementById('pokemon-container');
const img_front_default = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
const front_default = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
let allPokemons = [];
const loader = document.getElementById('loader');

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
    <h2>${pokemonIndex} ${pokemon.name.toUpperCase()}</h2>
    <img class="img-pokemon" src="${imageUrl}" alt="image: ${pokemon.name}" />
    <p>Types: ${types}</p>
  `;
  return liElement;
}


async function aboutPokemon(pokemon, index) {
  const aboutContainer = document.getElementById('about-container');
  aboutContainer.style.display = 'flex';

  const response = await fetch(`${BASE_URL}/${index}`);
  const details = await response.json();
  const types = details.types.map(t => t.type.name).join(", ");
  const imageUrl = details.sprites.other["official-artwork"].front_default;

  aboutContainer.innerHTML = getinfo(pokemon, types, imageUrl);

  document.body.style.overflow = "hidden";

  document.getElementById("pokemon-hp").textContent = "HP: " + details.stats[0].base_stat;
  document.getElementById("pokemon-attack").textContent = "Attack: " + details.stats[1].base_stat;
  document.getElementById("pokemon-defense").textContent = "Defense: " + details.stats[2].base_stat;
  document.getElementById("pokemon-special-attack").textContent = "Special Attack: " + details.stats[3].base_stat;
  document.getElementById("pokemon-special-defense").textContent = "Special Defense: " + details.stats[4].base_stat;
  document.getElementById("pokemon-speed").textContent = "Speed: " + details.stats[5].base_stat;

  

}


function getinfo(pokemon, types, imageUrl) {
  return `
    <div class="overlay" onclick="event.stopPropagation()">
      <span class="material-symbols-outlined" onclick="closeOverlay()">close</span>
      <h2>${pokemon.toUpperCase()}</h2>
      <img class="img-pokemon" src="${imageUrl}" alt="image: ${pokemon}" />

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn active" onclick="openTab(event, 'about-tab')">About</button>
        <button class="tab-btn" onclick="openTab(event, 'stats-tab')">Stats</button>
        <button class="tab-btn" onclick="openTab(event, 'evolution-tab')">Evolution</button>        
        <button class="tab-btn" onclick="openTab(event, 'moves-tab')">Moves</button>
      </div>

      <!-- Tab Content -->
      <div id="about-tab" class="tab-content active">
        <p><strong>Types:</strong>${types}</p>
        <p><strong>Height:</strong>${pokemon.height / 10} m</p>
        <p><strong>Weight:</strong>${pokemon.weight / 10} kg</p>
      </div>

      <div id="stats-tab" class="tab-content">
        <p id="pokemon-hp"><strong> </strong></p>
        <p id="pokemon-attack"></p>
        <p id="pokemon-defense"></p>
        <p id="pokemon-special-attack"></p>
        <p id="pokemon-special-defense"></p>
        <p id="pokemon-speed"></p>
      </div>

      <div id="evolution-tab" class="tab-content">
        <p>Evolution will load here …</p>
      </div>      

      <div id="moves-tab" class="tab-content">
        <p>Moves werden später hier geladen …</p>
      </div>

    </div>
  `;
}

function openTab(evt, tabId) {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach(c => c.classList.remove("active"));

  const buttons = document.querySelectorAll(".tab-btn");
  buttons.forEach(b => b.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
}





function closeOverlay() {
  document.getElementById("about-container").style.display = 'none';
  document.body.style.overflow = "";

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
