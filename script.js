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
const cancelRoundButton = document.getElementById("cancelRoundButton");
const startModeToggle = document.getElementById("startModeToggle");
const startModeOptions = document.getElementById("startModeOptions");
const finishModeToggle = document.getElementById("finishModeToggle");
const finishModeOptions = document.getElementById("finishModeOptions");

const multiplierModes = [
  { name: "Single", marker: "●○○", factor: 1, prefix: "" },
  { name: "Double", marker: "○●○", factor: 2, prefix: "D" },
  { name: "Triple", marker: "○○●", factor: 3, prefix: "T" },
];

const startModes = [
  { value: "straight", label: "Straight In" },
  { value: "double", label: "Double In" },
  { value: "master", label: "Master In" },
];

const finishModes = [
  { value: "straight", label: "Straight Out" },
  { value: "double", label: "Double Out" },
  { value: "master", label: "Master Out" },
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
let gameStartProfileState = getProfileState();

let nextDart = 1;
let gameFinished = false;
let inputLocked = false;
let currentDarts = [];
let redoDarts = [];
let multiplierModeIndex = 0;
let selectedStartMode = localStorage.getItem("startMode") || "straight";
let selectedFinishMode = localStorage.getItem("finishMode") || "straight";
let hasStartedScoring = selectedStartMode === "straight";
let bustTimeoutId = null;
let roundClearTimeoutId = null;

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

function getProfileState() {
  return {
    totalPoints: savedTotalPoints,
    totalDarts: savedTotalDarts,
    bestFinish: savedBestFinish,
    topScore: savedTopScore,
    hasConfirmedThrow,
  };
}

function restoreProfileState(profileState) {
  savedTotalPoints = profileState.totalPoints;
  savedTotalDarts = profileState.totalDarts;
  savedBestFinish = profileState.bestFinish;
  savedTopScore = profileState.topScore;
  hasConfirmedThrow = profileState.hasConfirmedThrow;
  saveRankAverage();
  saveProfileRecords();
}

function rememberGameStartProfileState() {
  gameStartProfileState = getProfileState();
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
  rankImage.hidden = false;
  rankPlaceholder.hidden = true;
  rankName.hidden = false;
  rankImage.src = "images/rank_placeholder.png";
  rankImage.alt = "Noch kein Rang";
  rankName.innerText = "Noch kein Rang";
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

function isDoubleDart(dart) {
  return dart.multiplier === "Double";
}

function isMasterDart(dart) {
  return dart.multiplier === "Double" || dart.multiplier === "Triple";
}

function dartMatchesMode(dart, mode) {
  if (mode === "double") {
    return isDoubleDart(dart);
  }

  if (mode === "master") {
    return isMasterDart(dart);
  }

  return true;
}

function getModeLabel(modes, value) {
  return (modes.find((mode) => mode.value === value) || modes[0]).label;
}

function updateModeToggle(toggle, modes, value) {
  toggle.innerText = getModeLabel(modes, value);
}

function renderModeOptions(container, modes, selectedValue, onSelect) {
  container.innerHTML = "";

  modes.forEach((mode) => {
    let button = createKeyboardButton(mode.label, () => onSelect(mode.value), "settingsChoiceButton");
    button.classList.toggle("isSelected", mode.value === selectedValue);
    button.setAttribute("aria-pressed", mode.value === selectedValue);
    container.appendChild(button);
  });
}

function setChoiceOptionsOpen(toggle, container, open) {
  toggle.setAttribute("aria-expanded", open);
  container.hidden = !open;
}

function refreshModeSettings() {
  updateModeToggle(startModeToggle, startModes, selectedStartMode);
  updateModeToggle(finishModeToggle, finishModes, selectedFinishMode);
  renderModeOptions(startModeOptions, startModes, selectedStartMode, selectStartMode);
  renderModeOptions(finishModeOptions, finishModes, selectedFinishMode, selectFinishMode);
}

function selectStartMode(value) {
  selectedStartMode = value;
  localStorage.setItem("startMode", selectedStartMode);
  refreshModeSettings();
  resetGame();
}

function selectFinishMode(value) {
  selectedFinishMode = value;
  localStorage.setItem("finishMode", selectedFinishMode);
  refreshModeSettings();
  resetGame();
}

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
  let throwHasStartedScoring = hasStartedScoring;

  return currentDarts.reduce((sum, dart) => {
    if (!throwHasStartedScoring) {
      if (!dartMatchesMode(dart, selectedStartMode)) {
        return sum;
      }

      throwHasStartedScoring = true;
    }

    return sum + dart.score;
  }, 0);
}

function updatePreview() {
  let previewRemaining = remainingPoints - getCurrentThrowScore();

  remaining.classList.toggle("isBust", previewRemaining < 0);
  remaining.innerText = previewRemaining < 0 ? "Bust" : previewRemaining;
}

function getStartModeDisplayStates() {
  let throwHasStartedScoring = hasStartedScoring;

  return currentDarts.map((dart) => {
    if (throwHasStartedScoring || dartMatchesMode(dart, selectedStartMode)) {
      throwHasStartedScoring = true;
      return true;
    }

    return false;
  });
}

function updateDartDisplays() {
  let scoringStates = getStartModeDisplayStates();

  dartDisplays.forEach((display, index) => {
    let dart = currentDarts[index];

    display.innerText = dart?.label ?? `Wurf ${nextDart + index}`;
    display.setAttribute("aria-label", `Wurf ${nextDart + index}`);
    display.classList.toggle("isFilled", dart !== undefined);
    display.classList.toggle("isInvalidStart", dart !== undefined && !scoringStates[index]);
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

function isBullseyeMode(mode) {
  return mode.name === "Double" || mode.name === "Triple";
}

function getKeyboardLabel(score) {
  let mode = multiplierModes[multiplierModeIndex];

  if (score === 25) {
    return isBullseyeMode(mode) ? "50" : "25";
  }

  return `${mode.prefix}${score}`;
}

function getKeyboardValue(score) {
  let mode = multiplierModes[multiplierModeIndex];

  if (score === 25) {
    return isBullseyeMode(mode) ? 50 : 25;
  }

  return score * mode.factor;
}

function renderKeyboard() {
  scoreKeyboard.innerHTML = "";

  for (let score = 1; score <= 20; score++) {
    scoreKeyboard.appendChild(createKeyboardButton(getKeyboardLabel(score), () => addDart(getKeyboardValue(score), getKeyboardLabel(score))));
  }

  scoreKeyboard.appendChild(createKeyboardButton("←", undoDart, "keyboardUtility"));
  scoreKeyboard.appendChild(createMultiplierCycleButton());
  scoreKeyboard.appendChild(createKeyboardButton("0", () => addDart(0, "0")));
  scoreKeyboard.appendChild(createKeyboardButton(getKeyboardLabel(25), () => addDart(getKeyboardValue(25), getKeyboardLabel(25))));
  scoreKeyboard.appendChild(createKeyboardButton("→", redoDart, "keyboardUtility"));
}

function getMultiplierText(index) {
  let mode = multiplierModes[index];
  return `${mode.name} ${mode.marker}`;
}

function createMultiplierCycleButton() {
  let button = createKeyboardButton(getMultiplierText(multiplierModeIndex), cycleMultiplierMode, "keyboardUtility multiplierButton isSelected");
  button.setAttribute("aria-label", "Multiplikator wechseln");
  button.setAttribute("aria-pressed", "true");
  return button;
}

function cycleMultiplierMode() {
  multiplierModeIndex = (multiplierModeIndex + 1) % multiplierModes.length;
  renderKeyboard();
}

function resetMultiplierMode() {
  if (multiplierModeIndex !== 0) {
    multiplierModeIndex = 0;
    renderKeyboard();
  }
}

function addDart(score, label = String(score)) {
  if (gameFinished || inputLocked || currentDarts.length >= 3) {
    return;
  }

  currentDarts.push({
    score,
    label,
    multiplier: multiplierModes[multiplierModeIndex].name,
  });
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
    let dart = darts[i];

    if (!hasStartedScoring) {
      if (!dartMatchesMode(dart, selectedStartMode)) {
        continue;
      }

      hasStartedScoring = true;
    }

    tempRemaining -= dart.score;

    if (tempRemaining < 0 || (tempRemaining === 0 && !dartMatchesMode(dart, selectedFinishMode))) {
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

function lockInputUntilNextThrow(timeoutCallback, delay) {
  inputLocked = true;
  setKeyboardDisabled(true);

  return window.setTimeout(() => {
    timeoutCallback();
    inputLocked = false;
    setKeyboardDisabled(false);
  }, delay);
}

function showBust(result) {
  remaining.classList.add("isBust");
  remaining.innerText = "Bust";

  let bustDisplay = dartDisplays[result.usedDarts - 1];
  bustDisplay.innerText = "Bust";
  bustDisplay.classList.add("isBust");

  bustTimeoutId = lockInputUntilNextThrow(() => {
    nextDart += result.usedDarts;
    dartDisplays.forEach((display) => display.classList.remove("isBust"));
    clearCurrentThrow();
    bustTimeoutId = null;
  }, 2000);
}

function showCompletedRound(result) {
  roundClearTimeoutId = lockInputUntilNextThrow(() => {
    nextDart += result.usedDarts;
    clearCurrentThrow();
    roundClearTimeoutId = null;
  }, 1000);
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

  showCompletedRound(result);
}

function resetProfileStats() {
  savedTotalPoints = 0;
  savedTotalDarts = 0;
  savedBestFinish = 0;
  savedTopScore = 0;
  hasConfirmedThrow = false;
  localStorage.removeItem("rankTotalPoints");
  localStorage.removeItem("rankTotalDarts");
  localStorage.removeItem("bestFinish");
  localStorage.removeItem("topScore");
  rememberGameStartProfileState();
}

function resetSettingsToDefaults() {
  selectedGamePoints = 501;
  selectedStartMode = "straight";
  selectedFinishMode = "straight";
  gameSelect.value = selectedGamePoints;
  localStorage.setItem("gamePoints", selectedGamePoints);
  localStorage.setItem("startMode", selectedStartMode);
  localStorage.setItem("finishMode", selectedFinishMode);
  refreshModeSettings();
  applyTheme("dark");
  resetProfileStats();
  resetGame({ rememberProfileState: false });
  closeSettings();
}

function cancelRound() {
  restoreProfileState(gameStartProfileState);
  resetGame({ rememberProfileState: false });
  closeSettings();
}

function resetGame({ rememberProfileState = true } = {}) {
  remainingPoints = selectedGamePoints;
  gamePoints.innerText = selectedGamePoints;
  remaining.innerText = selectedGamePoints;

  roundTotalPoints = 0;
  roundTotalDarts = 0;
  nextDart = 1;
  gameFinished = false;
  inputLocked = false;
  hasStartedScoring = selectedStartMode === "straight";

  if (bustTimeoutId !== null) {
    window.clearTimeout(bustTimeoutId);
    bustTimeoutId = null;
  }

  if (roundClearTimeoutId !== null) {
    window.clearTimeout(roundClearTimeoutId);
    roundClearTimeoutId = null;
  }

  setKeyboardDisabled(false);
  remaining.classList.remove("isBust");
  winScreen.style.display = "none";
  clearCurrentThrow();

  if (rememberProfileState) {
    rememberGameStartProfileState();
  }

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

refreshModeSettings();
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
cancelRoundButton.addEventListener("click", cancelRound);

startModeToggle.addEventListener("click", function () {
  setChoiceOptionsOpen(startModeToggle, startModeOptions, startModeOptions.hidden);
});

finishModeToggle.addEventListener("click", function () {
  setChoiceOptionsOpen(finishModeToggle, finishModeOptions, finishModeOptions.hidden);
});
