class Snake {
  constructor() {
    this.canvasWidth = 50;
    this.canvasHeight = 50;
    this.directions = {
      up: 1,
      right: 2,
      down: 3,
      left: 4,
    };
    this.localStorage = window.localStorage;
  }

  addFinishScreen() {
    this.finishScreen = document.createElement("div");
    this.finishScreen.classList.add("finish-screen");

    this.finishScreenMessage = document.createElement("div");
    this.finishScreenMessage.classList.add("message");
    this.finishScreenMessage.innerHTML = "You have scored a lot!";
    this.finishScreen.appendChild(this.finishScreenMessage);

    const button = document.createElement("a");
    button.onclick = this.restart.bind(this);
    button.innerHTML = "Restart";
    this.finishScreen.appendChild(button);

    this.canvas.appendChild(this.finishScreen);
  }

  addScoreCard() {
    this.scoreCard = document.createElement("div");
    this.scoreCard.classList.add("score-card");

    this.currentScore = document.createElement("div");
    this.currentScore.classList.add("current-score");
    this.scoreCard.appendChild(this.currentScore);

    this.highScore = document.createElement("div");
    this.highScore.classList.add("high-score");
    this.scoreCard.appendChild(this.highScore);

    this.canvas.appendChild(this.scoreCard);
  }

  didHitSelf(head) {
    const hitPoint = this.body.find((pixel) => {
      return pixel.x == head.x && pixel.y == head.y;
    });

    return !!hitPoint;
  }

  drawFrame() {
    if (!this.gameInProgress) return;

    if (this.frameInterval <= 0 || new Date().getTime() > this.nextFrameTime) {
      this.moveSnake();

      this.nextFrameTime = new Date().getTime() + this.frameInterval;
    }

    window.requestAnimationFrame(this.drawFrame.bind(this));
  }

  drawFruit() {
    if (this.fruitCoordinates) {
      this.getPixel(this.fruitCoordinates).classList.remove("fruit");
    }
    this.fruitCoordinates = this.getRandomCoordinates();
    while (this.body.includes(this.fruitCoordinates)) {
      this.fruitCoordinates = this.getRandomCoordinates();
    }

    this.getPixel(this.fruitCoordinates).classList.add("fruit");
  }

  drawGrid() {
    for (let i = 0; i < this.canvasWidth; i++) {
      for (let j = 0; j < this.canvasWidth; j++) {
        const pixel = document.createElement("div");
        pixel.classList.add("pixel");
        pixel.dataset.x = j;
        pixel.dataset.y = i;
        this.canvas.appendChild(pixel);
      }
    }
  }

  drawHighScore() {
    const highScore = localStorage.getItem("highScore") || "N/A";
    this.highScore.innerHTML = highScore;
  }

  drawScore() {
    this.currentScore.innerHTML = this.score;
  }

  drawSnake() {
    this.getPixel(this.addedPixel).classList.add("on");
    if (this.removedPixel) {
      this.getPixel(this.removedPixel).classList.remove("on");
    }
    this.drawScore();
  }

  endGame() {
    this.gameInProgress = false;

    let message;
    let highScore = localStorage.getItem("highScore") || 0;
    highScore = parseInt(highScore, 10);

    if (this.score > highScore) {
      this.localStorage.setItem("highScore", this.score);
      message = "You have a new high score!!";
    } else {
      message = "Game Over.";
    }

    this.finishScreenMessage.innerHTML = message;
    this.finishScreen.style.display = "block";
  }

  getRandomCoordinates() {
    return {
      x: Math.floor(Math.random() * this.canvasWidth),
      y: Math.floor(Math.random() * this.canvasHeight),
    };
  }

  getPixel(coordinates) {
    return document.querySelector(
      `[data-x='${coordinates.x}'][data-y='${coordinates.y}']`
    );
  }

  handleFruitEat() {
    this.drawFruit();
    this.lastFruitEatenAt = new Date().getTime();
    this.score = Math.floor(this.score * 1.25);
    if (this.frameInterval > 0) {
      this.frameInterval -= 20;
    }
  }

  handleUserInput(key) {
    switch (key.code) {
      case "ArrowUp":
        this.direction = this.directions.up;
        break;
      case "ArrowRight":
        this.direction = this.directions.right;
        break;
      case "ArrowDown":
        this.direction = this.directions.down;
        break;
      case "ArrowLeft":
        this.direction = this.directions.left;
        break;
    }
  }

  head() {
    return this.body[0] || { x: 0, y: 0 };
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.canvas = document.getElementById("snake");
      if (this.canvas) {
        this.initData();
        this.drawGrid();
        this.watchInput();
        this.addScoreCard();
        this.addFinishScreen();
        this.startGame();
      }
    });
  }

  initData() {
    this.direction = this.directions.right;
    this.body = [];
    this.frameInterval = 300;
    this.score = 0;
    this.gameInProgress = false;
  }

  moveSnake() {
    this.prevBody = this.body;
    const prevHeadX = this.head().x;
    const prevHeadY = this.head().y;

    const newHead = { ...this.head() };
    switch (this.direction) {
      case this.directions.up:
        newHead.y = (prevHeadY - 1 + this.canvasHeight) % this.canvasHeight;
        break;
      case this.directions.right:
        newHead.x = (prevHeadX + 1) % this.canvasHeight;
        break;
      case this.directions.down:
        newHead.y = (prevHeadY + 1) % this.canvasHeight;
        break;
      case this.directions.left:
        newHead.x = (prevHeadX - 1 + this.canvasWidth) % this.canvasWidth;
        break;
    }

    if (this.didHitSelf(newHead)) {
      return this.endGame();
    }

    // Add new head
    this.addedPixel = newHead;
    this.body.unshift(newHead);
    if (new Date().getTime() <= this.lastFruitEatenAt + 10000) {
      this.score++;
    }

    // Remove the tail
    if (
      newHead.x === this.fruitCoordinates.x &&
      newHead.y === this.fruitCoordinates.y
    ) {
      this.handleFruitEat();
    } else {
      this.removedPixel = this.body.pop();
    }

    this.drawSnake();
  }

  restart() {
    document.querySelectorAll(".pixel.on").forEach((ele) => {
      ele.classList.remove("on");
    });

    document.querySelectorAll(".pixel.fruit").forEach((ele) => {
      ele.classList.remove("fruit");
    });

    this.initData();
    this.startGame();
  }

  startGame() {
    this.gameInProgress = true;
    this.nextFrameTime = new Date().getTime();
    this.lastFruitEatenAt = new Date().getTime();
    this.finishScreen.style.display = "none";

    this.spawnSnake();
    this.drawFruit();
    this.drawHighScore();

    window.requestAnimationFrame(this.drawFrame.bind(this));
  }

  spawnSnake() {
    this.body.push(this.getRandomCoordinates());
  }

  watchInput() {
    document.onkeydown = this.handleUserInput.bind(this);
  }
}

new Snake().init();
