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
    this.direction = this.directions.right;
    this.body = [];
    this.frameInterval = 100;
    this.score = 0;
  }

  addScoreCard() {
    this.scoreCard = document.createElement("div");
    this.scoreCard.classList.add("score-card");
    this.canvas.appendChild(this.scoreCard);
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

  drawScore() {
    this.scoreCard.innerHTML = this.score;
  }

  drawSnake() {
    this.getPixel(this.addedPixel).classList.add("on");
    if (this.removedPixel) {
      this.getPixel(this.removedPixel).classList.remove("on");
    }
    this.drawScore();
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
    this.score = Math.floor(this.score * 1.25);
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
        this.drawGrid();
        this.addScoreCard();
        this.spawnSnake();
        this.drawFruit();
        this.runSnake();
        this.watchInput();
      }
    });
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

    // Add new head
    this.addedPixel = newHead;
    this.body.unshift(newHead);
    this.score++;

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

  runSnake() {
    setInterval(this.moveSnake.bind(this), this.frameInterval);
  }

  spawnSnake() {
    this.body.push(this.getRandomCoordinates());
  }

  watchInput() {
    document.onkeydown = this.handleUserInput.bind(this);
  }
}

new Snake().init();
