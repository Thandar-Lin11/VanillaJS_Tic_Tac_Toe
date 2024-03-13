const App = {
  // Selecting HTML elements and storing them in the '$' object for easy access
  $: {
    menu: document.querySelector('[data-id="menu"]'),
    menuItems: document.querySelector('[data-id="menu-items"]'),
    resetBtn: document.querySelector('[data-id="reset-btn"]'),
    newRoundBtn: document.querySelector('[data-id="new-round-btn"]'),
    squares: document.querySelectorAll('[data-id="square"]'),
    modal: document.querySelector('[data-id="modal"]'),
    modalText: document.querySelector('[data-id="modal-text"]'),
    modalBtn: document.querySelector('[data-id="modal-btn"]'),
    turn: document.querySelector('[data-id="turn"]'),
    p1Status: document.querySelector('[data-id="player1-status"]'),
    p2Status: document.querySelector('[data-id="player2-status"]'),
    ties: document.querySelector('[data-id="ties"]'),
  },

  // Game state, including the list of moves
  state: {
    moves: [],
  },

  // New state to keep track of game outcomes
  outcomes: {
    player1Wins: 0,
    player2Wins: 0,
    ties: 0,
  },

  // Function to check the status of the game (in-progress, complete, and winner)
  getGameStatus(moves) {
    const p1Moves = moves
      .filter((move) => move.playerId === 1)
      .map((move) => +move.squareId);
    const p2Moves = moves
      .filter((move) => move.playerId === 2)
      .map((move) => +move.squareId);

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    winningPatterns.forEach((pattern) => {
      const p1Wins = pattern.every((v) => p1Moves.includes(v));
      const p2Wins = pattern.every((v) => p2Moves.includes(v));

      if (p1Wins) winner = 1;
      if (p2Wins) winner = 2;
    });

    return {
      status: moves.length === 9 || winner != null ? "complete" : "in-progress",
      winner, // 1 | 2 | null
    };
  },

  // Function to update the outcomes when a game is completed
  updateOutcomes(winner) {
    if (winner === 1) {
      this.outcomes.player1Wins++;
    } else if (winner === 2) {
      this.outcomes.player2Wins++;
    } else {
      this.outcomes.ties++;
    }
  },

  // Initialization function
  init() {
    App.registerEventListeners();
  },

  // Function to register event listeners
  registerEventListeners() {
    App.$.menu.addEventListener("click", (event) => {
      App.$.menuItems.classList.toggle("hidden");
    });

    App.$.resetBtn.addEventListener("click", (event) => {
      App.state.moves = [];
      App.$.squares.forEach((square) => square.replaceChildren());
      if (!App.$.modal.classList.contains("hidden")) {
        App.$.modal.classList.add("hidden");
      }
      App.$.turn.replaceChildren();
    });

    App.$.newRoundBtn.addEventListener("click", (event) => {
      // Clear the moves array
      App.state.moves = [];

      // Clear the squares on the board
      App.$.squares.forEach((square) => square.replaceChildren());

      // Hide the modal if it's visible
      if (!App.$.modal.classList.contains("hidden")) {
        App.$.modal.classList.add("hidden");
      }

      // Clear the turn element
      App.$.turn.replaceChildren();
    });

    App.$.modalBtn.addEventListener("click", (event) => {
      App.state.moves = [];
      App.$.squares.forEach((square) => square.replaceChildren());
      App.$.modal.classList.add("hidden");
    });

    // Adding click event listeners to the squares
    App.$.squares.forEach((square) => {
      square.addEventListener("click", (event) => {
        // Check if there is already a play, if so, return early
        const hasMove = (squareId) => {
          const existingMove = App.state.moves.find(
            (move) => move.squareId === squareId
          );
          return existingMove !== undefined;
        };

        if (hasMove(+square.id)) {
          return;
        }

        //Determine which player icon to add to the square

        const lastMove = App.state.moves.at(-1);
        const getOppositePlayer = (playerId) => (playerId === 1 ? 2 : 1);
        const currentPlayer =
          App.state.moves.length === 0
            ? 1
            : getOppositePlayer(lastMove.playerId);

        const nextPlayer = getOppositePlayer(currentPlayer);

        const squareIcon = document.createElement("i");
        const turnIcon = document.createElement("i");
        const turnLabel = document.createElement("p");
        turnLabel.innerText = `Player ${nextPlayer}, your are up!`;

        if (currentPlayer === 1) {
          squareIcon.classList.add("fa-solid", "fa-x", "yellow");
          turnIcon.classList.add("fa-solid", "fa-o", "turquoise");
          turnLabel.classList = "turquoise";
        } else {
          squareIcon.classList.add("fa-solid", "fa-o", "turquoise");
          turnIcon.classList.add("fa-solid", "fa-x", "yellow");
          turnLabel.classList = "yellow";
        }

        App.$.turn.replaceChildren(turnIcon, turnLabel);

        App.state.moves.push({
          squareId: +square.id,
          playerId: currentPlayer,
        });

        square.replaceChildren(squareIcon);

        //Check if there is a winner or tie game
        const game = App.getGameStatus(App.state.moves);

        if (game.status === "complete") {
          App.$.modal.classList.remove("hidden");

          // Update the outcomes based on the winner
          this.updateOutcomes(game.winner);

          let message = "";
          if (game.winner) {
            message = `Player ${game.winner} wins!`;
          } else {
            message = "Tie!";
          }

          App.$.modalText.textContent = message;
        }
      });
    });
  },
};

// Initializing the App when the window loads
window.addEventListener("load", App.init);
