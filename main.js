const nav = document.querySelector(".nav");
const btnMenu = document.querySelector(".btn-menu");
const menu = document.querySelector(".menu");

function handleButtonClick(event) {
  if (event.type === "touchstart") event.preventDefault();
  event.stopPropagation();
  nav.classList.toggle("active");
  handleClickOutside(menu, () => {
    nav.classList.remove("active");
    setAria();
  });
  setAria();
}

function handleClickOutside(targetElement, callback) {
  const html = document.documentElement;
  function handleHTMLClick(event) {
    if (!targetElement.contains(event.target)) {
      targetElement.removeAttribute("data-target");
      html.removeEventListener("click", handleHTMLClick);
      html.removeEventListener("touchstart", handleHTMLClick);
      callback();
    }
  }
  if (!targetElement.hasAttribute("data-target")) {
    html.addEventListener("click", handleHTMLClick);
    html.addEventListener("touchstart", handleHTMLClick);
    targetElement.setAttribute("data-target", "");
  }
}

function setAria() {
  const isActive = nav.classList.contains("active");
  btnMenu.setAttribute("aria-expanded", isActive);
  if (isActive) {
    btnMenu.setAttribute("aria-label", "Fechar Menu");
  } else {
    btnMenu.setAttribute("aria-label", "Abrir Menu");
  }
}

btnMenu.addEventListener("click", handleButtonClick);
btnMenu.addEventListener("touchstart", handleButtonClick);

const cells = document.querySelectorAll("[data-cell]");
const result = document.querySelector(".result-message");
const restartButton = document.querySelector("button#btn-reset");
let currentPlayer = "x";
let gameFinished = false;
const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // linhas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colunas
  [0, 4, 8], [2, 4, 6] // diagonais
];

cells.forEach(cell => {
  cell.addEventListener("click", handlePlayerMove);
});

function handlePlayerMove(event) {
  const cell = event.target;

  if (!gameFinished && !cell.classList.contains("x") && !cell.classList.contains("circle")) {
    cell.classList.add("x");
    checkWinConditions("x");

    if (!gameFinished) {
      currentPlayer = "circle";

      if (getEmptyCells().length === 8) {
        makeFirstAIMove();
      } else {
        makeAIMove();
      }
    }
  }
}

function checkWinConditions(player) {
  const playerCells = Array.from(cells).filter(cell => cell.classList.contains(player));
  const playerCellIndexes = playerCells.map(cell => Array.from(cells).indexOf(cell));

  for (const combination of winningCombinations) {
    if (combination.every(index => playerCellIndexes.includes(index))) {
      endGame(player);
      break;
    }
  }

  if (!gameFinished && Array.from(cells).every(cell => cell.classList.contains("x") || cell.classList.contains("circle"))) {
    endGame("draw");
  }
}

function endGame(result) {
  gameFinished = true;

  if (result === "draw") {
    displayWinningMessage("Empate!");
  } else {
    displayWinningMessage(`Jogador ${result} Venceu!`);
  }
}

function displayWinningMessage(message) {
  result.querySelector("p").textContent = message;
  result.style.display = "block";
}

restartButton.addEventListener("click", restartGame);

function restartGame() {
  currentPlayer = "x";
  gameFinished = false;
  result.style.display = "none";

  cells.forEach(cell => {
    cell.classList.remove("x", "circle");
  });
}

function makeFirstAIMove() {
  const emptyCells = getEmptyCells();
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const randomCell = emptyCells[randomIndex];

  randomCell.classList.add("circle");
  checkWinConditions("circle");
  currentPlayer = "x";
}

function makeAIMove() {
  const emptyCells = getEmptyCells();
  let bestScore = -Infinity;
  let bestMove;

  for (let i = 0; i < emptyCells.length; i++) {
    const cell = emptyCells[i];
    cell.classList.add("circle");
    const score = minimax(cells, 0, false);
    cell.classList.remove("circle");

    if (score > bestScore) {
      bestScore = score;
      bestMove = cell;
    }
  }

  bestMove.classList.add("circle");
  checkWinConditions("circle");
  currentPlayer = "x";
}

function minimax(cells, depth, isMaximizingPlayer) {
  const gameResult = checkGameResult(cells);
  if (gameResult !== null || depth === 5) {
    return evaluateScore(gameResult, depth);
  }

  if (isMaximizingPlayer) {
    let bestScore = -Infinity;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      if (!cell.classList.contains("x") && !cell.classList.contains("circle")) {
        cell.classList.add("circle");
        const score = minimax(cells, depth + 1, false);
        cell.classList.remove("circle");
        bestScore = Math.max(score, bestScore);
      }
    }

    return bestScore;
  } else {
    let bestScore = Infinity;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      if (!cell.classList.contains("x") && !cell.classList.contains("circle")) {
        cell.classList.add("x");
        const score = minimax(cells, depth + 1, true);
        cell.classList.remove("x");
        bestScore = Math.min(score, bestScore);
      }
    }

    return bestScore;
  }
}

function evaluateScore(result, depth) {
  if (result === "draw") {
    return 0;
  } else if (result === "circle") {
    return 10 - depth;
  } else if (result === "x") {
    return depth - 10;
  }
}

function checkGameResult(cells) {
  const playerCells = Array.from(cells).filter(cell => cell.classList.contains("x"));
  const playerCellIndexes = playerCells.map(cell => Array.from(cells).indexOf(cell));

  for (const combination of winningCombinations) {
    if (combination.every(index => playerCellIndexes.includes(index))) {
      return "x";
    }
  }

  const aiCells = Array.from(cells).filter(cell => cell.classList.contains("circle"));
  const aiCellIndexes = aiCells.map(cell => Array.from(cells).indexOf(cell));

  for (const combination of winningCombinations) {
    if (combination.every(index => aiCellIndexes.includes(index))) {
      return "circle";
    }
  }

  if (Array.from(cells).every(cell => cell.classList.contains("x") || cell.classList.contains("circle"))) {
    return "draw";
  }

  return null;
}

function getEmptyCells() {
  return Array.from(cells).filter(cell => !cell.classList.contains("x") && !cell.classList.contains("circle"));
}
