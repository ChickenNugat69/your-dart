const remaining = document.getElementById("remaining");
const gamePoints = document.getElementById("gamePoints");
const average = document.getElementById("average");

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

let remainingPoints = 501;
let totalPoints = 0;
let totalDarts = 0;

let nextDart = 1;
let gameFinished = false;

const savedTheme = localStorage.getItem("theme") || "dark";

function applyTheme(theme){

    let lightModeActive = theme === "light";

    document.body.classList.toggle("lightMode", lightModeActive);
    themeToggle.setAttribute("aria-pressed", lightModeActive);
    themeToggleText.innerText = lightModeActive ? "Light Mode" : "Dark Mode";
    toggleIcon.innerText = lightModeActive ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);

}

function openSettings(){

    settingsScreen.style.display = "flex";
    settingsScreen.setAttribute("aria-hidden", "false");

}

function closeSettings(){

    settingsScreen.style.display = "none";
    settingsScreen.setAttribute("aria-hidden", "true");

}

applyTheme(savedTheme);

function updateButtonText(previewRemaining){

    if(previewRemaining === 0){

        submitButton.innerText = "Spiel beenden";

    }else{

        submitButton.innerText = "Bestätigen";

    }

}

function updatePreview(){

    let score1 = Number(dart1.value);
    let score2 = Number(dart2.value);
    let score3 = Number(dart3.value);

    if(score1 > 60){
    dart1.value = "";
    score1 = 0;
}

    if(score2 > 60){
    dart2.value = "";
    score2 = 0;
}

    if(score3 > 60){
    dart3.value = "";
    score3 = 0;
}

    let previewScore = score1 + score2 + score3;

    let previewRemaining = remainingPoints - previewScore;

    updateButtonText(previewRemaining);

    remaining.innerText = previewRemaining;

}

function processRound(){

    let darts = [
        Number(dart1.value),
        Number(dart2.value),
        Number(dart3.value)
    ];
    let inputs = [
        dart1.value,
        dart2.value,
        dart3.value
];

    let tempRemaining = remainingPoints;
    let startRemaining = remainingPoints;
    let usedDarts = 0;
    let bust = false;

    for(let i = 0; i < darts.length; i++){

        let currentThrow = darts[i];

        if(inputs[i] !== ""){

        usedDarts++;

    }



        tempRemaining -= currentThrow;
        

        if(tempRemaining < 0){

        bust = true;

        console.log("Bust!");

    break;

}

        console.log("Rest:", tempRemaining);
    }

    if(bust){

         totalDarts += usedDarts;
    let currentAverage = (totalPoints / totalDarts) * 3;
    average.innerText = currentAverage.toFixed(2);

}else{

    remainingPoints = tempRemaining;
    remaining.innerText = remainingPoints;

    let roundScore = startRemaining - tempRemaining;

    totalPoints += roundScore;
    totalDarts += 3;

    let currentAverage = (totalPoints / totalDarts) * 3;
    average.innerText = currentAverage.toFixed(2);

}
if(remainingPoints === 0){

    gameFinished = true;
}
    return {
    usedDarts: usedDarts,
    bust: bust
};

}

function resetGame(){

    remainingPoints = 501;
    remaining.innerText = 501;

    totalPoints = 0;
    totalDarts = 0;

    average.innerText = "0.00";
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

submitButton.addEventListener("click", function(){
        
    let result = processRound();

if(remainingPoints === 0){

    winAverage.innerText = average.innerText;
    winDarts.innerText = totalDarts;

    winScreen.style.display = "flex";
    submitButton.disabled = true;
    return;

}
    if(result.bust){

        nextDart += result.usedDarts;

    }else{

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

newGameButton.addEventListener("click", function(){

    winScreen.style.display = "none";

    resetGame();

});

settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);

settingsScreen.addEventListener("click", function(event){

    if(event.target === settingsScreen){

        closeSettings();

    }

});

themeToggle.addEventListener("click", function(){

    let nextTheme = document.body.classList.contains("lightMode") ? "dark" : "light";

    applyTheme(nextTheme);

});
