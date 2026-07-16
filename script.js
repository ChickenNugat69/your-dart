const remaining = document.getElementById("remaining");
const gamePoints = document.getElementById("gamePoints");
const average = document.getElementById("average");
const rankImage = document.getElementById("rankImage");
const rankName = document.getElementById("rankName");

const dart1 = document.getElementById("dart1");
const dart2 = document.getElementById("dart2");
const dart3 = document.getElementById("dart3");

const submitButton = document.getElementById("submitThrow");

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

let selectedGamePoints = 501;
let remainingPoints = selectedGamePoints;
let totalPoints = 0;
let totalDarts = 0;

let nextDart = 1;
let gameFinished = false;

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
  return (
    ranks.find(function (rank) {
      return currentAverage >= rank.min && currentAverage <= rank.max;
    }) || ranks[0]
  );
}

function updateRank(currentAverage) {
  let currentRank = getRank(currentAverage);

  rankName.innerText = currentRank.name;
  rankImage.src = currentRank.image;
  rankImage.alt = currentRank.name + " Rang";
}

function updateAverageDisplay(currentAverage) {
  average.innerText = currentAverage.toFixed(2);
  updateRank(currentAverage);
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

applyTheme(savedTheme);

if (
  savedGamePoints >= 101 &&
  savedGamePoints <= 901 &&
  savedGamePoints % 100 === 1
) {
  selectedGamePoints = savedGamePoints;
  gameSelect.value = savedGamePoints;
  gamePoints.innerText = selectedGamePoints;
  remainingPoints = selectedGamePoints;
  remaining.innerText = selectedGamePoints;
}

function updateButtonText(previewRemaining) {
  if (previewRemaining === 0) {
    submitButton.innerText = "Spiel beenden";
  } else {
    submitButton.innerText = "Bestätigen";
  }
}

function updatePreview() {
  let score1 = Number(dart1.value);
  let score2 = Number(dart2.value);
  let score3 = Number(dart3.value);

  if (score1 > 60) {
    dart1.value = "";
    score1 = 0;
  }

  if (score2 > 60) {
    dart2.value = "";
    score2 = 0;
  }

  if (score3 > 60) {
    dart3.value = "";
    score3 = 0;
  }

  let previewScore = score1 + score2 + score3;

  let previewRemaining = remainingPoints - previewScore;

  updateButtonText(previewRemaining);

  remaining.innerText = previewRemaining;
}

function processRound() {
  let darts = [Number(dart1.value), Number(dart2.value), Number(dart3.value)];
  let inputs = [dart1.value, dart2.value, dart3.value];

  let tempRemaining = remainingPoints;
  let startRemaining = remainingPoints;
  let usedDarts = 0;
  let bust = false;

  for (let i = 0; i < darts.length; i++) {
    let currentThrow = darts[i];

    if (inputs[i] !== "") {
      usedDarts++;
    }

    tempRemaining -= currentThrow;

    if (tempRemaining < 0) {
      bust = true;

      console.log("Bust!");

      break;
    }

    console.log("Rest:", tempRemaining);
  }

  if (bust) {
    totalDarts += usedDarts;
    let currentAverage = (totalPoints / totalDarts) * 3;
    updateAverageDisplay(currentAverage);
  } else {
    remainingPoints = tempRemaining;
    remaining.innerText = remainingPoints;

    let roundScore = startRemaining - tempRemaining;

    totalPoints += roundScore;
    totalDarts += 3;

    let currentAverage = (totalPoints / totalDarts) * 3;
    updateAverageDisplay(currentAverage);
  }
  if (remainingPoints === 0) {
    gameFinished = true;
  }
  return {
    usedDarts: usedDarts,
    bust: bust,
  };
}

function resetGame() {
  remainingPoints = selectedGamePoints;
  gamePoints.innerText = selectedGamePoints;
  remaining.innerText = selectedGamePoints;

  totalPoints = 0;
  totalDarts = 0;

  updateAverageDisplay(0);
  nextDart = 1;

  dart1.placeholder = 1;
  dart2.placeholder = 2;
  dart3.placeholder = 3;

  dart1.value = "";
  dart2.value = "";
  dart3.value = "";

  updateButtonText(remainingPoints);
  gameFinished = false;
  winScreen.style.display = "none";

  submitButton.disabled = false;

  updatePreview();
}

submitButton.addEventListener("click", function () {
  let result = processRound();

  if (remainingPoints === 0) {
    winAverage.innerText = average.innerText;
    winDarts.innerText = totalDarts;

    winScreen.style.display = "flex";
    submitButton.disabled = true;
    return;
  }
  if (result.bust) {
    nextDart += result.usedDarts;
  } else {
    nextDart += 3;
  }
  dart1.placeholder = nextDart;
  dart2.placeholder = nextDart + 1;
  dart3.placeholder = nextDart + 2;

  dart1.value = "";
  dart2.value = "";
  dart3.value = "";

  updatePreview();
});

dart1.addEventListener("input", updatePreview);
dart2.addEventListener("input", updatePreview);
dart3.addEventListener("input", updatePreview);

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
  let nextTheme = document.body.classList.contains("lightMode")
    ? "dark"
    : "light";

  applyTheme(nextTheme);
});

gameSelect.addEventListener("change", function () {
  selectedGamePoints = Number(gameSelect.value);
  localStorage.setItem("gamePoints", selectedGamePoints);
  resetGame();
});
