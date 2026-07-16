const remaining = document.getElementById("remaining");
const gamePoints = document.getElementById("gamePoints");
const average = document.getElementById("average");
const roundAverage = document.getElementById("roundAverage");
const bestFinishDisplay = document.getElementById("bestFinish");
const topScoreDisplay = document.getElementById("topScore");
const rankImage = document.getElementById("rankImage");
const rankPlaceholder = document.getElementById("rankPlaceholder");
const rankName = document.getElementById("rankName");
const averageStats = document.getElementById("averageStats");
const profileCard = document.querySelector(".profileCard");

const dart1 = document.getElementById("dart1");
const dart2 = document.getElementById("dart2");
const dart3 = document.getElementById("dart3");
const dartDisplays = [dart1, dart2, dart3];
const scoreKeyboard = document.getElementById("scoreKeyboard");

const winScreen = document.getElementById("winScreen");
const winAverage = document.getElementById("winAverage");
const winDarts = document.getElementById("winDarts");
const newGameButton = document.getElementById("newGameButton");
const settingsButton = document.getElementById("settingsButton");
const settingsScreen = document.getElementById("settingsScreen");
const closeSettingsButton = document.getElementById("closeSettingsButton");
const themeToggle = document.getElementById("themeToggle");
const themeToggleText = document.getElementById("themeToggleText");
const toggleIcon = document.querySelector(".toggleIcon");
const gameSelect = document.getElementById("gameSelect");
const resetSettingsButton = document.getElementById("resetSettingsButton");

const multiplierModes = [
  { name: "Single", marker: "●○○", factor: 1, prefix: "" },
  { name: "Double", marker: "○●○", factor: 2, prefix: "D" },
  { name: "Triple", marker: "○○●", factor: 3, prefix: "T" },
];

let selectedGamePoints = 501;
let remainingPoints = selectedGamePoints;
let roundTotalPoints = 0;
let roundTotalDarts = 0;
let savedTotalPoints = Number(localStorage.getItem("rankTotalPoints")) || 0;
let savedTotalDarts = Number(localStorage.getItem("rankTotalDarts")) || 0;
let savedBestFinish = Number(localStorage.getItem("bestFinish")) || 0;
let savedTopScore = Number(localStorage.getItem("topScore")) || 0;
let hasConfirmedThrow = savedTotalDarts > 0;

let nextDart = 1;
let gameFinished = false;
let inputLocked = false;
let currentDarts = [];
let redoDarts = [];
let multiplierModeIndex = 0;

const ranks = [
  { min: 0, max: 9, name: "🪤 Sklave", image: "images/sklave.png" },
  { min: 10, max: 19, name: "🤡 Hofnar", image: "images/hofnar.png" },
  { min: 20, max: 29, name: "🌾 Bauer", image: "images/bauer.png" },
  { min: 30, max: 39, name: "💰 Händler", image: "images/haendler.png" },
  { min: 40, max: 59, name: "🏰 Adel", image: "images/adel.png" },
  { min: 60, max: 69, name: "👑 Königlich", image: "images/königlich.png" },
  { min: 70, max: 89, name: "⚔️ Kaiser", image: "images/kaiser.png" },
  { min: 90, max: Infinity, name: "🌟 Göttlich", image: "images/gott.png" },
];

function getRank(currentAverage) {
  return ranks.find((rank) => currentAverage >= rank.min && currentAverage <= rank.max) || ranks[0];
}

function updateRank(currentAverage) {
  let currentRank = getRank(currentAverage);

  rankName.innerText = currentRank.name;
  rankImage.src = currentRank.image;
  rankImage.alt = currentRank.name + " Rang";
}

function calculateAverage(points, darts) {
  if (darts === 0) {
    return 0;
  }

  return (points / darts) * 3;
}

function saveRankAverage() {
  localStorage.setItem("rankTotalPoints", savedTotalPoints);
  localStorage.setItem("rankTotalDarts", savedTotalDarts);
}

function saveProfileRecords() {
  localStorage.setItem("bestFinish", savedBestFinish);
  localStorage.setItem("topScore", savedTopScore);
}

function showRankStats() {
  profileCard.hidden = false;
  rankImage.hidden = false;
  rankPlaceholder.hidden = true;
  rankName.hidden = false;
  averageStats.hidden = false;
}

function showRankPlaceholder() {
  profileCard.hidden = false;
  rankImage.hidden = true;
  rankPlaceholder.hidden = false;
  rankName.hidden = false;
  rankName.innerText = "–";
  averageStats.hidden = true;
}

function updateAverageDisplay() {
  if (!hasConfirmedThrow) {
    showRankPlaceholder();
    return;
  }

  let rankAverage = calculateAverage(savedTotalPoints, savedTotalDarts);
  let currentRoundAverage = calculateAverage(roundTotalPoints, roundTotalDarts);

  showRankStats();
  average.innerText = rankAverage.toFixed(2);
  roundAverage.innerText = currentRoundAverage.toFixed(2);
  bestFinishDisplay.innerText = savedBestFinish;
  topScoreDisplay.innerText = savedTopScore;
  updateRank(rankAverage);
}

const savedTheme = localStorage.getItem("theme") || "dark";
const savedGamePoints = Number(localStorage.getItem("gamePoints"));

function applyTheme(theme) {
  let lightModeActive = theme === "light";

  document.body.classList.toggle("lightMode", lightModeActive);
  themeToggle.setAttribute("aria-pressed", lightModeActive);
  themeToggleText.innerText = lightModeActive ? "Light Mode" : "Dark Mode";
  toggleIcon.innerText = lightModeActive ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}

function openSettings() {
  settingsScreen.style.display = "flex";
  settingsScreen.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  settingsScreen.style.display = "none";
  settingsScreen.setAttribute("aria-hidden", "true");
}

function getCurrentThrowScore() {
  return currentDarts.reduce((sum, score) => sum + score, 0);
}

function updatePreview() {
  let previewRemaining = remainingPoints - getCurrentThrowScore();

  remaining.classList.toggle("isBust", previewRemaining < 0);
  remaining.innerText = previewRemaining < 0 ? "Bust" : previewRemaining;
}

function updateDartDisplays() {
  dartDisplays.forEach((display, index) => {
    display.innerText = currentDarts[index] ?? `Wurf ${nextDart + index}`;
    display.setAttribute("aria-label", `Wurf ${nextDart + index}`);
    display.classList.toggle("isFilled", currentDarts[index] !== undefined);
  });
  updatePreview();
}

function createKeyboardButton(label, onClick, className = "") {
  let button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.innerText = label;
  button.addEventListener("click", onClick);
  return button;
}

function getKeyboardLabel(score) {
  let mode = multiplierModes[multiplierModeIndex];

  if (score === 25) {
    return mode.name === "Triple" ? "Bull" : "25";
  }

  return `${mode.prefix}${score}`;
}

function getKeyboardValue(score) {
  if (score === 25) {
    return multiplierModes[multiplierModeIndex].name === "Triple" ? 50 : 25;
  }

  return score * multiplierModes[multiplierModeIndex].factor;
}

function renderKeyboard() {
  scoreKeyboard.innerHTML = "";

  for (let score = 1; score <= 20; score++) {
    scoreKeyboard.appendChild(createKeyboardButton(getKeyboardLabel(score), () => addDart(getKeyboardValue(score))));
  }

  scoreKeyboard.appendChild(createKeyboardButton("←", undoDart, "keyboardUtility"));
  scoreKeyboard.appendChild(createMultiplierButton(1));
  scoreKeyboard.appendChild(createMultiplierButton(2));
  scoreKeyboard.appendChild(createKeyboardButton("0", () => addDart(0)));
  scoreKeyboard.appendChild(createKeyboardButton(getKeyboardLabel(25), () => addDart(getKeyboardValue(25))));
  scoreKeyboard.appendChild(createKeyboardButton("→", redoDart, "keyboardUtility"));
}

function getMultiplierText(index) {
  let mode = multiplierModes[index];
  return `${mode.name} ${mode.marker}`;
}

function createMultiplierButton(index) {
  let isSelected = multiplierModeIndex === index;
  let button = createKeyboardButton(getMultiplierText(index), () => setMultiplierMode(index), "keyboardUtility multiplierButton");
  button.classList.toggle("isSelected", isSelected);
  button.setAttribute("aria-pressed", isSelected);
  return button;
}

function setMultiplierMode(index) {
  multiplierModeIndex = index;
  renderKeyboard();
}

function resetMultiplierMode() {
  if (multiplierModeIndex !== 0) {
    multiplierModeIndex = 0;
    renderKeyboard();
  }
}

function addDart(score) {
  if (gameFinished || inputLocked || currentDarts.length >= 3) {
    return;
  }

  currentDarts.push(score);
  redoDarts = [];
  resetMultiplierMode();
  updateDartDisplays();

  if (remainingPoints - getCurrentThrowScore() <= 0 || currentDarts.length === 3) {
    confirmCurrentRound();
  }
}

function undoDart() {
  if (gameFinished || inputLocked || currentDarts.length === 0) {
    return;
  }

  redoDarts.push(currentDarts.pop());
  updateDartDisplays();
}

function redoDart() {
  if (gameFinished || inputLocked || redoDarts.length === 0 || currentDarts.length >= 3) {
    return;
  }

  currentDarts.push(redoDarts.pop());
  updateDartDisplays();

  if (currentDarts.length === 3) {
    confirmCurrentRound();
  }
}

function processRound() {
  let darts = [...currentDarts];
  let tempRemaining = remainingPoints;
  let startRemaining = remainingPoints;
  let usedDarts = darts.length;
  let bust = false;

  for (let i = 0; i < darts.length; i++) {
    tempRemaining -= darts[i];

    if (tempRemaining < 0) {
      bust = true;
      usedDarts = i + 1;
      break;
    }
  }

  hasConfirmedThrow = true;

  if (bust) {
    roundTotalDarts += usedDarts;
    savedTotalDarts += usedDarts;
    saveRankAverage();
    updateAverageDisplay();
  } else {
    remainingPoints = tempRemaining;
    remaining.innerText = remainingPoints;

    let roundScore = startRemaining - tempRemaining;

    roundTotalPoints += roundScore;
    roundTotalDarts += usedDarts;
    savedTotalPoints += roundScore;
    savedTotalDarts += usedDarts;

    if (roundScore > savedTopScore) {
      savedTopScore = roundScore;
      saveProfileRecords();
    }

    saveRankAverage();
    updateAverageDisplay();
  }

  if (remainingPoints === 0) {
    gameFinished = true;
    let finishScore = startRemaining;

    if (finishScore > savedBestFinish) {
      savedBestFinish = finishScore;
      saveProfileRecords();
      updateAverageDisplay();
    }
  }

  return { usedDarts, bust };
}

function clearCurrentThrow() {
  currentDarts = [];
  redoDarts = [];
  updateDartDisplays();
}

function setKeyboardDisabled(disabled) {
  scoreKeyboard.querySelectorAll("button").forEach((button) => {
    button.disabled = disabled;
  });
}

function showBust(result) {
  inputLocked = true;
  setKeyboardDisabled(true);
  remaining.classList.add("isBust");
  remaining.innerText = "Bust";

  let bustDisplay = dartDisplays[result.usedDarts - 1];
  bustDisplay.innerText = "Bust";
  bustDisplay.classList.add("isBust");

  window.setTimeout(() => {
    nextDart += result.usedDarts;
    inputLocked = false;
    setKeyboardDisabled(false);
    dartDisplays.forEach((display) => display.classList.remove("isBust"));
    clearCurrentThrow();
  }, 2000);
}

function confirmCurrentRound() {
  let result = processRound();

  if (result.bust) {
    showBust(result);
    return;
  }

  if (remainingPoints === 0) {
    winAverage.innerText = average.innerText;
    winDarts.innerText = roundTotalDarts;
    winScreen.style.display = "flex";
    return;
  }

  nextDart += result.bust ? result.usedDarts : 3;
  clearCurrentThrow();
}

function resetSettingsToDefaults() {
  selectedGamePoints = 501;
  gameSelect.value = selectedGamePoints;
  localStorage.setItem("gamePoints", selectedGamePoints);
  applyTheme("dark");
  resetGame();
}

function resetGame() {
  remainingPoints = selectedGamePoints;
  gamePoints.innerText = selectedGamePoints;
  remaining.innerText = selectedGamePoints;

  roundTotalPoints = 0;
  roundTotalDarts = 0;
  nextDart = 1;
  gameFinished = false;
  inputLocked = false;
  setKeyboardDisabled(false);
  remaining.classList.remove("isBust");
  winScreen.style.display = "none";
  clearCurrentThrow();
  updateAverageDisplay();
}

applyTheme(savedTheme);

if (savedGamePoints >= 101 && savedGamePoints <= 901 && savedGamePoints % 100 === 1) {
  selectedGamePoints = savedGamePoints;
  gameSelect.value = savedGamePoints;
  gamePoints.innerText = selectedGamePoints;
  remainingPoints = selectedGamePoints;
  remaining.innerText = selectedGamePoints;
}

renderKeyboard();
updateAverageDisplay();
updateDartDisplays();

newGameButton.addEventListener("click", function () {
  winScreen.style.display = "none";
  resetGame();
});

settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);

settingsScreen.addEventListener("click", function (event) {
  if (event.target === settingsScreen) {
    closeSettings();
  }
});

themeToggle.addEventListener("click", function () {
  let nextTheme = document.body.classList.contains("lightMode") ? "dark" : "light";
  applyTheme(nextTheme);
});

gameSelect.addEventListener("change", function () {
  selectedGamePoints = Number(gameSelect.value);
  localStorage.setItem("gamePoints", selectedGamePoints);
  resetGame();
});

resetSettingsButton.addEventListener("click", resetSettingsToDefaults);
