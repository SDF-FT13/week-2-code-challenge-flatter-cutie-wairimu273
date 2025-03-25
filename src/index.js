// Base URL for the API
const BASE_URL = "http://localhost:3000/characters";

// DOM Elements
const characterBar = document.getElementById("character-bar");
const detailedInfo = document.getElementById("detailed-info");
const characterForm = document.getElementById("character-form");

// Track the currently selected character
let currentCharacter = null;

// Fetch all characters and populate the character bar
function fetchCharacters() {
  fetch(BASE_URL)
    .then((response) => response.json())
    .then((characters) => {
      characterBar.innerHTML = ""; // Clear previous content
      characters.forEach((character) => {
        const span = document.createElement("span");
        span.textContent = character.name;
        span.addEventListener("click", () =>
          displayCharacterDetails(character)
        );
        characterBar.appendChild(span);
      });
      // Display the first character’s details by default
      if (characters.length > 0) {
        displayCharacterDetails(characters[0]);
      }
    })
    .catch((error) => console.error("Error fetching characters:", error));
}

// Display character details in the detailed-info div
function displayCharacterDetails(character) {
  currentCharacter = character;
  detailedInfo.innerHTML = `
    <h2>${character.name}</h2>
    <img src="${character.image}" alt="${character.name}">
    <p>Votes: <span id="vote-count">${character.votes}</span></p>
    <form id="votes-form">
      <input type="number" id="votes" placeholder="Enter votes">
      <button type="submit">Add Votes</button>
    </form>
    <button id="reset-btn">Reset Votes</button>
  `;

  // Attach event listeners for vote addition and reset
  const votesForm = document.getElementById("votes-form");
  votesForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAddVotes(character);
  });

  const resetBtn = document.getElementById("reset-btn");
  resetBtn.addEventListener("click", () => handleResetVotes(character));
}

// Handle adding votes
function handleAddVotes(character) {
  const votesInput = document.getElementById("votes"); // Updated ID
  const additionalVotes = parseInt(votesInput.value || "0");
  if (isNaN(additionalVotes) || additionalVotes < 0) {
    alert("Please enter a valid number of votes.");
    return;
  }

  const voteCountElement = document.getElementById("vote-count");
  const newVotes = character.votes + additionalVotes;

  // Update UI and server
  voteCountElement.textContent = newVotes;
  character.votes = newVotes;

  fetch(`${BASE_URL}/${character.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ votes: newVotes }),
  }).catch((error) => console.error("Error updating votes:", error));

  votesInput.value = ""; // Clear input
}

// Handle resetting votes
function handleResetVotes(character) {
  const voteCountElement = document.getElementById("vote-count");
  voteCountElement.textContent = "0";
  character.votes = 0;

  // Update server
  fetch(`${BASE_URL}/${character.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ votes: 0 }),
  }).catch((error) => console.error("Error resetting votes:", error));
}

// Handle new character form submission (uncommented in HTML)
if (characterForm) {
  characterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = event.target.name.value;
    const image = event.target["image-url"].value;

    const newCharacter = {
      name,
      image,
      votes: 0,
    };

    // Add character to the server
    fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCharacter),
    })
      .then((response) => response.json())
      .then((character) => {
        const span = document.createElement("span");
        span.textContent = character.name;
        span.addEventListener("click", () =>
          displayCharacterDetails(character)
        );
        characterBar.appendChild(span);
        displayCharacterDetails(character);
      })
      .catch((error) => console.error("Error adding character:", error));

    event.target.reset();
  });
}

// Initialize the app
fetchCharacters();
