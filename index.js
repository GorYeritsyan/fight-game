const CONFIG = {
    sizeOptions: [5, 7, 10],
    enemiesCountOptions: [3, 5, 7]
};

class Game {
    constructor(config) {
        this.gameWrapper = document.getElementById("game-wrapper");
        this.selectForm = document.getElementById("select-form");
        this.resultWrapper = document.getElementById("result-wrapper");
        this.modal = document.getElementById("modal");
        this.closeBtn = document.getElementById("close-btn");
        this.playBtn = document.getElementById("play-btn");
        this.defeatedEnemies = document.getElementById("defeated-enemies");

        // Game Size Options
        this.sizeOptions = config.sizeOptions;

        // Enemies count
        this.enemiesCountOptions = config.enemiesCountOptions;
        this.enemiesCount = 0;
        this.defeatedEnemiesCount = 0;

        this.time = 0;
        this.timerInterval = null;

        this.gameSize = null;

        // Player location state
        this.playerRow = null;
        this.playerColumn = null;

        // Init Game
        this.init();
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init() {
        this.initSelectOptions();

        this.initEventListeners();
    }

    initSelectOptions() {
        const selectSize = document.getElementById("select-size");
        const selectCount = document.getElementById("select-count");

        this.enemiesCountOptions.forEach((count) => {
            const option = document.createElement("option");
            option.value = `${count}`;
            option.textContent = `${count}`;
            selectCount.appendChild(option);
        });

        this.sizeOptions.forEach((size) => {
            const option = document.createElement("option");
            option.value = `${size}`;
            option.textContent = `${size}x${size}`;
            selectSize.appendChild(option);
        });
    }

    initEventListeners() {
        this.selectForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            this.gameSize = formData.get("size");
            this.enemiesCount = +formData.get("count");

            this.startGame();
        });

        // Close modal by clicking close button
        this.closeBtn.addEventListener("click", (e) => {
            this.closeModal();
        });

        this.playBtn.addEventListener("click", (e) => {
            this.closeModal();
            this.resetGame();
        });

        // Close modal by clicking outside
        this.modal.addEventListener("click", (e) => {
            if (e.target.id === "modal") {
                this.closeModal();
            }
        });

        const resetButton = document.getElementById("reset-btn");
        resetButton.addEventListener("click", (e) => {
            this.resetGame();
        });
    }

    closeModal() {
        this.modal.classList.add("hidden");
    }

    showModal() {
        this.modal.classList.remove("hidden");
    }

    resetGame() {
        // Remove game wrapper content
        this.gameWrapper.innerHTML = "";

        // Hide timer and reset button and show select form
        this.hideElement(this.resultWrapper);
        this.showElement(this.selectForm);

        clearInterval(this.timerInterval);

        this.defeatedEnemiesCount = 0;
        this.time = 0;

        this.defeatedEnemies.textContent = this.defeatedEnemiesCount;

        const timer = document.getElementById("time");
        timer.textContent = this.time;
    }

    showElement(element) {
        element.classList.replace("hidden", "flex");
    }

    hideElement(element) {
        element.classList.replace("flex", "hidden");
    }

    startGame() {
        // Hide select form
        this.hideElement(this.selectForm);
        // Show timer and reset button
        this.showElement(this.resultWrapper);

        // Modify grid layout
        this.gameWrapper.style.gridTemplateColumns = `repeat(${this.gameSize}, 1fr)`;
        this.gameWrapper.style.gridTemplateRows = `repeat(${this.gameSize}, 1fr)`;

        // Create matrix from selected game size
        this.createGameCells();

        // Init Player Location
        this.initPlayer();

        // Init Enemies Location
        for (let i = 0; i < this.enemiesCount; i++) {
            this.initEnemy();
        }

        // Init Timer
        this.initTimer();

        window.addEventListener("keydown", this.handleKeyDown);
    }

    createGameCells() {
        this.cells = Array.from(
            { length: this.gameSize },
            () => Array.from({ length: this.gameSize }, () => {
                const cell = document.createElement("div");
                cell.className = "size-20 p-5 bg-zinc-50 flex justify-center items-center border border-zinc-200";

                this.gameWrapper.appendChild(cell);
                return cell;
            })
        );
    }

    initTimer() {
        this.timerInterval = setInterval(() => {
            this.time++;

            const time = document.getElementById("time");
            time.textContent = `${this.time}s`;
        }, 1000);
    }

    handleKeyDown(e) {
        // Change Player location in the cells array
        this.changePlayerLocation(e.key);
    }

    initPlayer() {
        const { row, column } = this.generateRandomLocation();
        this.playerRow = row;
        this.playerColumn = column;

        const characterCell = this.createCharacterCell("text-3xl text-blue-500 animate-pulse", "fa-solid fa-person-rifle");

        const cell = this.cells[this.playerRow][this.playerColumn];
        cell.dataset.character = "player";
        cell.appendChild(characterCell);
    }

    changePlayerLocation(key) {
        // Remove player prev location
        const playerPrevLocation = this.cells[this.playerRow][this.playerColumn];
        playerPrevLocation.dataset.character = "";
        playerPrevLocation.innerHTML = "";

        // Modify player location
        switch (key) {
            case "ArrowUp":
                if (this.playerRow === 0) {
                    this.playerRow = this.gameSize - 1;
                    break;
                }
                this.playerRow--;
                break;

            case "ArrowDown":
                if (this.playerRow === this.gameSize - 1) {
                    this.playerRow = 0;
                    break;
                }
                this.playerRow++;
                break;

            case "ArrowLeft":
                if (this.playerColumn === 0) {
                    this.playerColumn = this.gameSize - 1;
                    break;
                }
                this.playerColumn--;
                break;

            case "ArrowRight":
                if (this.playerColumn === this.gameSize - 1) {
                    this.playerColumn = 0;
                    break;
                }
                this.playerColumn++;
                break;
        }

        // If enemy in the cell than defeat enemy and show
        if (this.cells[this.playerRow][this.playerColumn].dataset.character === "enemy") {
            this.defeatedEnemiesCount++;

            this.defeatedEnemies.textContent = `${this.defeatedEnemiesCount}`;
            this.cells[this.playerRow][this.playerColumn].innerHTML = "";
        }

        const characterCell = this.createCharacterCell("text-3xl text-blue-500 animate-pulse", "fa-solid fa-person-rifle");

        const cell = this.cells[this.playerRow][this.playerColumn];
        cell.dataset.character = "player";
        cell.appendChild(characterCell);

        // If defeated enemies equal selected enemies count then finish game
        if (this.defeatedEnemiesCount === this.enemiesCount) {
            this.finishGame();
        }
    }

    initEnemy() {
        const { row, column } = this.generateRandomLocation();

        // If cell is not empty then redirect enemy
        if (this.cells[row][column].dataset.character === "player" || this.cells[row][column].dataset.character === "enemy") {
            this.initEnemy();
            return;
        }

        const characterCell = this.createCharacterCell("text-3xl", "fa-solid fa-dragon");

        const cell = this.cells[row][column];
        cell.dataset.character = "enemy";
        cell.appendChild(characterCell);
    }

    createCharacterCell(characterClassname, iconClassname) {
        const characterCell = document.createElement("span");
        characterCell.className = characterClassname;

        const icon = document.createElement("i");
        icon.className = iconClassname;

        characterCell.appendChild(icon);

        return characterCell;
    }

    generateRandomLocation() {
        const row = Math.round(Math.random() * (this.gameSize - 1));
        const column = Math.round(Math.random() * (this.gameSize - 1));

        return { row, column };
    }

    finishGame() {
        clearInterval(this.timerInterval);
        window.removeEventListener("keydown", this.handleKeyDown);

        const completionTime = document.getElementById("completion-time");
        completionTime.textContent = `${this.time}s`;

        this.showModal();
    }
}

new Game(CONFIG);