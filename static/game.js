const cells = Array.from(document.querySelectorAll(".cell"));
const statusMessage = document.getElementById("statusMessage");
const errorMessage = document.getElementById("errorMessage");
const resetButton = document.getElementById("resetButton");
const startButton = document.getElementById("startButton");
const symbolSelect = document.getElementById("symbolSelect");
const playerDisplay = document.getElementById("playerDisplay");
const computerDisplay = document.getElementById("computerDisplay");
const effectsContainer = document.getElementById("effectsContainer");
const playerWinAudio = document.getElementById("playerWinAudio");
const computerWinAudio = document.getElementById("computerWinAudio");
const happyKidsAudio = document.getElementById("happyKidsAudio");
const tieAudio = document.getElementById("tieAudio");
const diceModal = document.getElementById("diceModal");
const playerDice = document.getElementById("playerDice");
const computerDice = document.getElementById("computerDice");
const diceResult = document.getElementById("diceResult");
const rollDiceButton = document.getElementById("rollDiceButton");

let boardState = Array(9).fill(0);
let winner = null;
let isWaiting = false;
let lastEffectWinner = null;
let effectTimeoutId = null;
let playerSymbol = "X";
let computerSymbol = "O";
const playWinSound = () => {
    if (!playerWinAudio) {
        return;
    }
    playerWinAudio.currentTime = 0;
    playerWinAudio.volume = 0.85;
    const playPromise = playerWinAudio.play();
    if (playPromise?.catch) {
        playPromise.catch(() => {});
    }
};

const updateSymbolDisplays = () => {
    playerDisplay.textContent = playerSymbol;
    computerDisplay.textContent = computerSymbol;
    
    // Add classes for styling based on symbol value
    playerDisplay.classList.remove("symbol-x", "symbol-o");
    computerDisplay.classList.remove("symbol-x", "symbol-o");
    
    if (playerSymbol === "X") {
        playerDisplay.classList.add("symbol-x");
    } else if (playerSymbol === "O") {
        playerDisplay.classList.add("symbol-o");
    }
    
    if (computerSymbol === "X") {
        computerDisplay.classList.add("symbol-x");
    } else if (computerSymbol === "O") {
        computerDisplay.classList.add("symbol-o");
    }
};

const clearEffects = () => {
    if (effectTimeoutId) {
        clearTimeout(effectTimeoutId);
        effectTimeoutId = null;
    }
    effectsContainer.innerHTML = "";
    if (computerWinAudio) {
        computerWinAudio.pause();
        computerWinAudio.currentTime = 0;
    }
    if (playerWinAudio) {
        playerWinAudio.pause();
        playerWinAudio.currentTime = 0;
    }
    if (happyKidsAudio) {
        happyKidsAudio.pause();
        happyKidsAudio.currentTime = 0;
    }
    if (tieAudio) {
        tieAudio.pause();
        tieAudio.currentTime = 0;
    }
};

const launchConfetti = () => {
    const colors = ["#ff9f1c", "#ffbf69", "#fb5607", "#8338ec", "#3a86ff", "#ff006e"];
    const pieces = 60;
    for (let i = 0; i < pieces; i += 1) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        const color = colors[Math.floor(Math.random() * colors.length)];
        piece.style.background = color;
        piece.style.width = `${10 + Math.random() * 10}px`;
        piece.style.height = `${18 + Math.random() * 16}px`;
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.setProperty("--confetti-x", `${(Math.random() - 0.5) * 40}px`);
        piece.style.setProperty("--confetti-drift", `${(Math.random() - 0.5) * 120}px`);
        piece.style.setProperty("--confetti-rotation", `${360 + Math.random() * 720}deg`);
        piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
        piece.style.animationDelay = `${Math.random() * 0.3}s`;
        effectsContainer.appendChild(piece);
    }
    effectTimeoutId = setTimeout(clearEffects, 3200);
};

const playComputerWinSound = () => {
    if (!computerWinAudio) {
        return;
    }
    computerWinAudio.currentTime = 0;
    computerWinAudio.volume = 0.85;
    const playPromise = computerWinAudio.play();
    if (playPromise?.catch) {
        playPromise.catch(() => {});
    }
};

const playHappyKidsSound = () => {
    if (!happyKidsAudio) {
        return;
    }
    happyKidsAudio.currentTime = 0;
    happyKidsAudio.volume = 0.85;
    const playPromise = happyKidsAudio.play();
    if (playPromise?.catch) {
        playPromise.catch(() => {});
    }
};

const showDancingDancer = () => {
    const dancer = document.createElement("img");
    dancer.className = "dancer";
    dancer.src = "/static/images/200.gif";
    dancer.alt = "Dancing animation";
    effectsContainer.appendChild(dancer);
    playHappyKidsSound();
};

const showPlayerWinGif = () => {
    const gif = document.createElement("img");
    gif.className = "player-win-gif";
    gif.src = "/static/images/200.gif";
    gif.alt = "Victory animation";
    effectsContainer.appendChild(gif);
};

const playTieSound = () => {
    if (!tieAudio) {
        return;
    }
    tieAudio.currentTime = 0;
    tieAudio.volume = 0.85;
    const playPromise = tieAudio.play();
    if (playPromise?.catch) {
        playPromise.catch(() => {});
    }
};

const showHandshake = () => {
    const handshake = document.createElement("img");
    handshake.className = "handshake";
    handshake.src = "/static/images/shakehand.gif";
    handshake.alt = "Handshake";
    effectsContainer.appendChild(handshake);
    playTieSound();
};

const showDancingRobot = () => {
    const robot = document.createElement("img");
    robot.className = "robot";
    robot.src = "/static/images/robot.gif";
    robot.alt = "Robot animation";
    effectsContainer.appendChild(robot);
    playComputerWinSound();
};

const updateEffects = () => {
    if (winner === lastEffectWinner) {
        return;
    }
    clearEffects();
    if (winner === "player") {
        launchConfetti();
        showDancingDancer();
    } else if (winner === "computer") {
        launchConfetti();
        showDancingRobot();
    } else if (winner === "tie") {
        launchConfetti();
        showHandshake();
    }
    lastEffectWinner = winner;
};

const renderBoard = () => {
    cells.forEach((cell, index) => {
        const value = boardState[index];
        cell.textContent = value === 0 ? "" : value;
        const cellFilled = value !== 0;
        cell.disabled = cellFilled || Boolean(winner) || isWaiting;
        
        // Add classes for styling X and O
        cell.classList.remove("cell-x", "cell-o");
        if (value === "X") {
            cell.classList.add("cell-x");
        } else if (value === "O") {
            cell.classList.add("cell-o");
        }
    });
};

const updateStatus = () => {
    statusMessage.classList.remove("player-win");
    if (winner === "player") {
        statusMessage.textContent = "🎊 You won 🎊";
        statusMessage.classList.add("player-win");
    } else if (winner === "computer") {
        statusMessage.textContent = "Computer won!";
    } else if (winner === "tie") {
        statusMessage.textContent = "It's a tie. 😐";
    } else {
        statusMessage.textContent = "Your turn!";
    }
    if (winner) {
        updateEffects();
    } else {
        clearEffects();
        lastEffectWinner = null;
    }
};

const handleError = async (response) => {
    let message = "Something went wrong. Please try again.";
    try {
        const data = await response.json();
        if (data?.error) {
            message = data.error;
        }
    } catch {
        // ignore json parse issues
    }
    errorMessage.textContent = message;
};

const request = async (url, options = {}) => {
    errorMessage.textContent = "";
    const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!response.ok) {
        await handleError(response);
        throw new Error("Request failed");
    }
    return response.json();
};

const loadState = async () => {
    try {
        const data = await request("/api/state", { method: "GET" });
        boardState = data.board;
        winner = data.winner;
        playerSymbol = data.playerSymbol || playerSymbol;
        computerSymbol = data.computerSymbol || computerSymbol;
        updateSymbolDisplays();
        if (data.playerSymbol) {
            symbolSelect.value = data.playerSymbol;
        }
        renderBoard();
        updateStatus();
    } catch {
        // handled in request
    }
};

const makeMove = async (position) => {
    if (winner || isWaiting) return;
    isWaiting = true;
    renderBoard();
    try {
        const data = await request("/api/move", {
            method: "POST",
            body: JSON.stringify({ position }),
        });
        boardState = data.board;
        winner = data.winner;
        if (data.playerSymbol) {
            playerSymbol = data.playerSymbol;
            computerSymbol = data.computerSymbol;
            updateSymbolDisplays();
        }
        renderBoard();
        updateStatus();
    } catch {
        // error message already shown
    } finally {
        isWaiting = false;
        renderBoard();
    }
};

const resetBoard = async () => {
    try {
        const data = await request("/api/reset", { method: "POST" });
        boardState = data.board;
        winner = null;
        lastEffectWinner = null;
        clearEffects();
        renderBoard();
        updateStatus();
    } catch {
        // handled in request
    }
};

const rollDice = () => {
    diceModal.style.display = "flex";

    // Replace textContent with GIF
    playerDice.innerHTML = `<img src="/static/images/dice_roll.gif" class="dice-image" alt="Rolling Dice">`;
    computerDice.innerHTML = `<img src="/static/images/dice_roll.gif" class="dice-image" alt="Rolling Dice">`;

    diceResult.textContent = "";
    rollDiceButton.disabled = false;
    rollDiceButton.textContent = "Roll";
};

const performDiceRoll = async () => {
    // Disable button during roll
    rollDiceButton.disabled = true;
    rollDiceButton.textContent = "Rolling...";
    diceResult.textContent = "";
    
    // Add rolling animation class
    playerDice.classList.add("rolling");
    computerDice.classList.add("rolling");
    
    // Animate dice
    let rollCount = 0;
    const animateDice = setInterval(() => {
        playerDice.textContent = Math.floor(Math.random() * 6) + 1;
        computerDice.textContent = Math.floor(Math.random() * 6) + 1;
        rollCount++;
        if (rollCount > 15) {
            clearInterval(animateDice);
        }
    }, 80);
    
    try {
        const data = await request("/api/dice-roll", { method: "POST" });
        
        // Stop animation and show final results
        clearInterval(animateDice);
        playerDice.classList.remove("rolling");
        computerDice.classList.remove("rolling");
        playerDice.textContent = data.playerRoll;
        computerDice.textContent = data.computerRoll;
        
        if (data.playerGoesFirst) {
            diceResult.textContent = "You go first!";
        } else {
            diceResult.textContent = "Computer goes first!";
        }
        
        // Wait a bit then hide modal and start game
        setTimeout(() => {
            diceModal.style.display = "none";
            startGameAfterDice(data.playerGoesFirst);
        }, 3000);
    } catch {
        diceModal.style.display = "none";
        playerDice.classList.remove("rolling");
        computerDice.classList.remove("rolling");
    }
};

const startGameAfterDice = async (playerGoesFirst) => {
    const symbol = symbolSelect.value;
    try {
        const data = await request("/api/start", {
            method: "POST",
            body: JSON.stringify({ symbol }),
        });
        boardState = data.board;
        winner = data.winner;
        playerSymbol = data.playerSymbol;
        computerSymbol = data.computerSymbol;
        symbolSelect.value = data.playerSymbol;
        updateSymbolDisplays();
        lastEffectWinner = null;
        clearEffects();
        renderBoard();
        updateStatus();
        
        // If computer moved first, update board
        if (data.computerMove) {
            renderBoard();
            updateStatus();
        }
    } catch {
        // handled in request
    }
};

const startGame = async () => {
    await rollDice();
};

cells.forEach((cell) =>
    cell.addEventListener("click", () => {
        const position = Number(cell.dataset.position);
        makeMove(position);
    })
);

resetButton.addEventListener("click", resetBoard);
startButton.addEventListener("click", startGame);
if (rollDiceButton) {
    rollDiceButton.addEventListener("click", performDiceRoll);
}

loadState();
