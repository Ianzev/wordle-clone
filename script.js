import dictionary from "./dictionary.js";
import targetWords from "./targetWords.js";

const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
let keyboard = document.querySelector("[data-keyboard]");
let alertContainer = document.querySelector("[data-alert-container]");
let guessGrid = document.querySelector("[data-guess-grid]");
let randomIndex = Math.floor(Math.random() * targetWords.length);
let targetWord = targetWords[randomIndex];
const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", () => {
  resetGame();
});

console.log(targetWord);

let usedWords = [];
let wins = 0;
let losses = 0;

startInteraction();

function startInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
  updateScoreDisplay();
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

function resetGame() {
  usedWords = [];
  const randomIndex = Math.floor(Math.random() * targetWords.length);
  targetWord = targetWords[randomIndex];
  console.log(targetWord);

  const activeTiles = guessGrid.querySelectorAll(".tile");
  activeTiles.forEach((tile) => {
    tile.textContent = "";
    delete tile.dataset.state;
    delete tile.dataset.letter;
  });

  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => alert.remove());

  startInteraction();
  resetButton.disabled = true;
  resetButton.disabled = false;
}

function updateScoreDisplay() {
  const scoreDisplay = document.getElementById("score-display");
  scoreDisplay.textContent = `W - ${wins}  L - ${losses}`;
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key);
    return;
  }

  if (e.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (e.target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess();
    return;
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey();
    return;
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key);
    return;
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;
  const nextTile = guessGrid.querySelector(":not([data-letter])");
  nextTile.dataset.letter = key.toLowerCase();
  nextTile.textContent = key;
  nextTile.dataset.state = "active";
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null) return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters");
    shakeTiles(activeTiles);
    return;
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");

  if (usedWords.includes(guess)) {
    showAlert("Word already used");
    shakeTiles(activeTiles);
    return;
  }

  if (!dictionary.includes(guess)) {
    showAlert("Not in word list");
    shakeTiles(activeTiles);
    return;
  }

  usedWords.push(guess);

  stopInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip");
      if (targetWord[index] === letter) {
        tile.dataset.state = "correct";
        key.classList.add("correct");
      } else if (targetWord.includes(letter)) {
        tile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
      } else {
        tile.dataset.state = "wrong";
        key.classList.add("wrong");
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
}

function shakeTiles(tiles) {
  tiles.forEach((tile) => {
    tile.classList.add("shake");
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake");
      },
      { once: true }
    );
  });
}

function checkWinLose(guess, tiles) {
  if (guess === targetWord) {
    showAlert("You Win", 5000);
    danceTiles(tiles);
    stopInteraction();
    wins++;
    updateScoreDisplay();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0) {
    showAlert(`Your word was: ${targetWord.toUpperCase()}`, 5000);
    stopInteraction();
    losses++;
    updateScoreDisplay();
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance");
        },
        { once: true }
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}
