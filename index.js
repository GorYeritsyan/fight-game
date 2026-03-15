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

        // Game Size Options
        this.sizeOptions = config.sizeOptions;

        // Enemies count
        this.enemiesCountOptions = config.enemiesCountOptions;
        this.enemiesCount = 0;
        this.defeatedEnemies = 0;

        this.intervalId = null;

        this.time = 0;

        this.gameSize = null;

        // Player location state
        this.playerRow = null;
        this.playerColumn = null;

        // Init Game
        this.init();
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
            option.value = count;
            option.textContent = `${count}`;
            selectCount.appendChild(option);
        })

        this.sizeOptions.forEach((size) => {
            const option = document.createElement("option");
            option.value = `${size}`;
            option.textContent = `${size}x${size}`;
            selectSize.appendChild(option);
        })
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

    resetGame() {
        this.gameWrapper.innerHTML = "";
        this.resultWrapper.classList.replace("flex", "hidden");
        this.selectForm.classList.replace("hidden", "flex");

        clearInterval(this.intervalId);

        const span = document.getElementById("defeated-enemies");
        span.textContent = "0";

        const timeSpan = document.getElementById("time");
        timeSpan.textContent = "0";

        this.defeatedEnemies = 0;
        this.time = 0;
    }

    startGame() {
        // Hide select form
        this.selectForm.classList.replace("flex", "hidden");
        // Show timer and reset button
        this.resultWrapper.classList.replace("hidden", "flex");

        // Modify grid layout
        this.gameWrapper.style.gridTemplateColumns = `repeat(${this.gameSize}, 1fr)`;
        this.gameWrapper.style.gridTemplateRows = `repeat(${this.gameSize}, 1fr)`;

        // Create matrix from selected game size
        this.fields = Array.from(
            { length: this.gameSize },
            () => Array.from({ length: this.gameSize })
        );

        // Init Player Location
        this.initPlayer();

        // Init Enemies Location
        for (let i = 0; i < this.enemiesCount; i++) {
            this.initEnemy();
        }

        // Render all fields
        this.fields.forEach(field => {
            field.forEach(elem => {
                this.renderField(elem);
            });
        });

        // Init Timer
        this.initTimer();
    }

    initTimer() {
        this.intervalId = setInterval(() => {
            this.time++;

            const time = document.getElementById("time");
            time.textContent = `${this.time}s`;
        }, 1000);
    }

    handleKeyDown(e) {
        console.log("init");
        // Change Player location in the fields array
        this.changePlayerLocation(e.key);

        // Render all fields from updated fields array
        this.renderUpdatedFields();
    }

    changePlayerLocation(key) {
        // Remove player prev location
        this.fields[this.playerRow][this.playerColumn] = undefined;

        // Modify player location
        switch (key) {
            case "ArrowUp":
                console.log("ArrowUp");
                if (this.playerRow < 1) {
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
                this.playerRow++
                break;

            case "ArrowLeft":
                if (this.playerColumn < 1) {
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

        // If enemy in the field than defeat enemy and show
        if (this.fields[this.playerRow][this.playerColumn] === "enemy") {
            this.defeatedEnemies++;

            const span = document.getElementById("defeated-enemies");
            span.textContent = `${this.defeatedEnemies}`;
        }

        this.fields[this.playerRow][this.playerColumn] = "player";

        // If defeated enemies equal selected enemies count then finish game
        if (this.defeatedEnemies === this.enemiesCount) {
            this.finishGame();
        }
    }

    finishGame() {
        clearInterval(this.intervalId);
        window.removeEventListener("keydown", this.handleKeyDown);

        const completionTimeSpan = document.getElementById("completion-time");
        completionTimeSpan.textContent = `${this.time}s`;

        this.modal.classList.remove("hidden");
    }

    // This function runs to update player location
    renderUpdatedFields() {
        this.gameWrapper.innerHTML = "";
        // Render all fields
        this.fields.forEach(field => {
            field.forEach(elem => {
                this.renderField(elem);
            });
        });
    }

    initPlayer() {
        const { row, column } = this.generateRandomLocation();
        this.playerRow = row;
        this.playerColumn = column;

        this.fields[this.playerRow][this.playerColumn] = "player";

        // Add Event Listener to handle player moves
        window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    }

    initEnemy() {
        const { row, column } = this.generateRandomLocation();

        // If field is not empty then redirect enemy
        if (this.fields[row][column]) {
            this.initEnemy();
            return;
        }

        this.fields[row][column] = "enemy";
    }

    generateRandomLocation() {
        const row = Math.round(Math.random() * (this.gameSize - 1));
        const column = Math.round(Math.random() * (this.gameSize - 1));

        return { row, column };
    }

    renderField(elem) {
        const field = document.createElement("div");
        field.className = "size-20 p-5 bg-zinc-50 flex justify-center items-center border border-zinc-200";

        if (elem) {
            const span = document.createElement("span");
            span.className = "text-3xl";

            const icon = document.createElement("i");
            icon.className = "fa-solid fa-dragon";

            if (elem === "player") {
                span.classList.add("text-blue-500");
                icon.className = "fa-solid fa-person-rifle";
            }

            span.appendChild(icon);

            field.appendChild(span);
        }

        this.gameWrapper.appendChild(field);
    }
}

new Game(CONFIG);