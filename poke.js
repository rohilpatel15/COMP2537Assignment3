let currentPage = 1;
let pokemons = [];
let types = {};
let selectTypes = {};
const PAGE_SIZE = 10;


// This is the function for handling the page numbers
const updatePagDiv = (currentPage, numPages) => {
  $("#pag").empty();

  // This will only show the user 3 pages at a time
  let startPage = Math.max(currentPage - 1, 1);

  let endPage = Math.min(startPage + 2, numPages);


  // If there are less than 3 pages, re adjust the pages shown
  if (endPage - startPage < 2) {
    endPage = Math.min(startPage + 2, numPages);
    startPage = Math.max(endPage - 2, 1);
  }

  // This adds a previous button if necessary
  if (currentPage > 1) {
    $("#pag").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${
        currentPage - 1
      }">&lt;</button>
    `);
  }

  // This adds page buttons
  for (let i = startPage; i <= endPage; i++) {
    $("#pag").append(`
      <button class="btn btn-primary page ml-1 numberedButtons ${
        i === currentPage ? "active" : ""
      }" value="${i}">${i}</button>
    `);
  }

  // This adds a next button if necessary
  if (currentPage < numPages) {
    $("#pag").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${
        currentPage + 1
      }">&gt;</button>
    `);
  }
};

const pag = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Iterates over each Pokémon and fetches their details
  pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);

    res.data.types.forEach((type) => {
      if (types[type.type.name]) {
        types[type.type.name]++;
        
      } else {
        types[type.type.name] = 1;
        $("#checkbox").append(`
        <div class="form-check">
        <input class="form-check-input typeCheckbox" type="checkbox" value="${
          type.type.name
        }
        " id="${type.type.name}">
        <label class="form-check-label" for="${type.type.name}">
          ${type.type.name} (${types[type.type.name]})
        </label>
      </div>`);
      }
    });
  });

  // This clears the Pokémon cards before iterating over them using their url
  $("#Cards").empty();
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);

    res.data.types.forEach((type) => {
      if (types[type.type.name]) {
        types[type.type.name]++;
      } else {
        types[type.type.name] = 1;
      }
    });

    // Creates each Pokemon card
    $("#Cards").append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h4>${res.data.name.toUpperCase()}</h4> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `);
  });

  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePagDiv(currentPage, numPages);

  $("#totalResults").text(pokemons.length);
  $("#currentResults").text(selected_pokemons.length);
};

const setup = async () => {
  $("#Cards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );

  pokemons = response.data.results;

  pag(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePagDiv(currentPage, numPages);

  // add event listener to each pokemon card
  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );

    const types = res.data.types.map((type) => type.type.name);
    console.log("types: ", types);

    $(".modal-body").html(`
        <div style="width:200px">
        <img src="${
          res.data.sprites.other["official-artwork"].front_default
        }" alt="${res.data.name}"/>

        <div>
        <h3>Possible Abilities</h3>
        <ul>
        ${res.data.abilities
          .map((ability) => `<li>${ability.ability.name}</li>`)
          .join("")}
        </ul>
        </div>

        <div>
        <h3>Base Stats</h3>
        <ul>
        ${res.data.stats
          .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
          .join("")}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join("")}
          </ul>
      
        `);

    $(".modal-title").html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `);
  });

  // This adds event listeners to page buttons
  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    pag(currentPage, PAGE_SIZE, pokemons);
    updatePagDiv(currentPage, numPages);
  });

  $(".checkboxes").on("click", async function () {
    selectTypes = $(".typeCheckbox:checked")
      .map(function () {
        return $(this).val();
      })
      .get();

    console.log(selectTypes);

    if(selectTypes.length >= 3){
    }

    if (selectTypes.length === 2) {
      let response1 = await axios.get(
        `https://pokeapi.co/api/v2/type/${selectTypes[0]}`
      );
      let response2 = await axios.get(
        `https://pokeapi.co/api/v2/type/${selectTypes[1]}`
      );

      let pokemon1 = response1.data.pokemon.map((p) => p.pokemon);
      let pokemon2 = response2.data.pokemon.map((p) => p.pokemon);

      pokemons = pokemon1.filter((p) =>
        pokemon2.some((e) => e.name === p.name)
      );
    } else if (selectTypes.length === 1) {
      let response = await axios.get(
        `https://pokeapi.co/api/v2/type/${selectTypes[0]}`
      );

      pokemons = response.data.pokemon.map((p) => p.pokemon);
    } else {
      pokemons = response.data.results;
    }

    pag(currentPage, PAGE_SIZE, pokemons);

    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    console.log(numPages);
    updatePagDiv(currentPage, numPages);
  });

};

$(document).ready(setup);