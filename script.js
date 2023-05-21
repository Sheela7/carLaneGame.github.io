class Game {
  constructor() {
    this.SCORE = document.querySelector(".score");
    this.START_SCREEN = document.querySelector(".startScreen");
    this.GAME_AREA = document.querySelector(".gameArea");
    this.totalLane = 3;
    this.player = {
      speed: 5,
      score: 0,
      maxSpeed: 25,
      speedIncreaseInterval: 4000,
      x: 0,
      y: 0,
      start: false,
      superpower: 0,
    };
    this.keys = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };
    this.passedCars = [];
    this.balls = [];
  }

  init() {
    const easyBtn = document.getElementById("easyBtn");
    const mediumBtn = document.getElementById("mediumBtn");
    const hardBtn = document.getElementById("hardBtn");

    easyBtn.addEventListener("click", () => this.startGame("easy"));
    mediumBtn.addEventListener("click", () => this.startGame("medium"));
    hardBtn.addEventListener("click", () => this.startGame("hard"));

    document.addEventListener("keydown", (e) => this.keyDown(e));
    document.addEventListener("keyup", (e) => this.keyUp(e));
  }

  showScore(hightestScore) {
    this.SCORE.innerHTML = `
    <div class="currentScore">Score: ${this.player.score}</div>
    <div class="highestScore">Highest Score: ${hightestScore}</div>
   <div class="superpower">Fireballs: ${this.player.superpower}</div>
  `;
  }

  startGame(difficulty) {
    this.player.start = true;
    this.player.score = 0;
    this.player.superpower = 0;
    this.player.speed = this.getDifficultySpeed(difficulty);
    const hightestScore = localStorage.getItem("highestScore") || 0;
    this.showScore(hightestScore);
    this.START_SCREEN.classList.add("hide");
    this.GAME_AREA.classList.remove("hide");
    this.GAME_AREA.innerHTML = "";
    const road = this.GAME_AREA.getBoundingClientRect();
    const singleLaneWidth = road.width / this.totalLane;

    setInterval(this.increaseSpeed.bind(this), this.player.speedIncreaseInterval);
    //Listener for fireball
    document.addEventListener("keyup", (e) => {
      if (e.key === " ") {
        // Check for spacebar key
        if (this.player.superpower > 0) {
          this.fireBall();
          this.player.superpower--;
          this.showScore(localStorage.getItem("highestScore") || 0);
        }
      }
    });
    if (this.player.start) {
      window.requestAnimationFrame(this.gamePlay.bind(this));

      for (let x = 0; x < 7; x++) {
        const roadline1 = this.createRoadLine(x, singleLaneWidth);
        const roadline2 = this.createRoadLine(x, 2 * singleLaneWidth);
        this.GAME_AREA.appendChild(roadline1);
        this.GAME_AREA.appendChild(roadline2);
      }

      let car = document.createElement("div");
      car.setAttribute("class", "car");
      this.GAME_AREA.appendChild(car);
      this.player.x = car.offsetLeft;
      this.player.y = car.offsetTop;

      for (let x = 0; x < 3; x++) {
        let enemyCar = document.createElement("div");
        enemyCar.setAttribute("class", "enemy");
        enemyCar.y = (x + 1) * 350 * -1;
        enemyCar.style.top = enemyCar.y + "px";
        enemyCar.style.left = Math.floor(Math.random() * 350) + "px";
        this.GAME_AREA.appendChild(enemyCar);
      }
    }
  }

  getDifficultySpeed(difficulty) {
    switch (difficulty) {
      case "easy":
        this.player.speedIncreaseInterval = 5000;
        this.player.maxSpeed = 25;
        return 5;
      case "medium":
        this.player.speedIncreaseInterval = 4500;
        this.player.maxSpeed = 40;
        return 5;
      case "hard":
        this.player.speedIncreaseInterval = 4000;
        this.player.maxSpeed = 55;
        return 5;
      default:
        return 5;
    }
  }

  keyDown(e) {
    e.preventDefault();
    this.keys[e.key] = true;
  }

  keyUp(e) {
    e.preventDefault();
    this.keys[e.key] = false;
  }

  moveLines() {
    let lines = document.querySelectorAll(".lines");
    lines.forEach((item) => {
      if (item.y >= 1000) {
        item.y -= 1050;
      }
      item.y += this.player.speed;
      item.style.top = item.y + "px";
    });
  }

  resetEnemyCarPoistion(item) {
    item.y -= 1050;
    item.style.left = Math.floor(Math.random() * 350) + "px";
    this.passedCars = this.passedCars.filter((passedCar) => passedCar !== item);
  }

  moveEnemy(car) {
    let enemies = document.querySelectorAll(".enemy");
    enemies.forEach((item) => {
      if (this.isCollide(car, item)) {
        this.endGame();
      }

      //If the enemy car reaches end of screen append it to the top of screen
      if (item.y >= 1000) {
        this.resetEnemyCarPoistion(item);
      }

      // Check if fireball collides with enemy car
      this.balls.forEach((ball, ballIndex) => {
        if (this.isCollide(ball, item)) {
          this.balls.splice(ballIndex, 1);
          ball.remove();
          this.resetEnemyCarPoistion(item);
        }
      });

      item.y += this.player.speed * 0.7;
      item.style.top = item.y + "px";

      if (item.y + item.offsetHeight > car.offsetTop && item.y < car.offsetTop) {
        if (!this.passedCars.includes(item)) {
          this.passedCars.push(item);
          const currentScore = ++this.player.score;
          let highestScore = localStorage.getItem("highestScore") || 0;

          if (currentScore > highestScore) {
            highestScore = currentScore;
            localStorage.setItem("highestScore", currentScore);
          }
          if (this.player.score % 5 === 0) {
            this.addSuperpower();
          }
          this.showScore(highestScore);
        }
      }
    });
  }

  fireBall() {
    const car = document.querySelector(".car");
    const ball = document.createElement("div");
    ball.className = "fireball";
    ball.style.color = "gold";
    ball.style.backgroundColor = "gold";
    ball.style.left = car.offsetLeft + car.offsetWidth / 2 - 5 + "px";
    ball.style.top = car.offsetTop + "px";
    this.GAME_AREA.appendChild(ball);
    this.balls.push(ball);
  }

  moveBalls() {
    this.balls.forEach((ball, index) => {
      const top = parseInt(ball.style.top);
      if (top > 0) {
        ball.style.top = top - 10 + "px";
      } else {
        this.balls.splice(index, 1);
        ball.remove();
      }
    });
  }

  endGame() {
    this.player.start = false;
    this.player.speed = 5;
    const currentScore = this.player.score;
    let highestScore = localStorage.getItem("highestScore") || 0;

    if (currentScore > highestScore) {
      highestScore = currentScore;
      localStorage.setItem("highestScore", currentScore);
    }

    this.showScore(highestScore);

    this.START_SCREEN.classList.remove("hide");
  }

  isCollide(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    return !(
      aRect.bottom < bRect.top ||
      aRect.top > bRect.bottom ||
      aRect.right < bRect.left ||
      aRect.left > bRect.right
    );
  }

  increaseSpeed() {
    if (this.player.speed < this.player.maxSpeed) {
      console.log("Speed increased to", this.player.speed);
      this.player.speed += 0.09;
    }
  }

  addSuperpower() {
    this.player.superpower++;
  }

  gamePlay() {
    let car = document.querySelector(".car");
    let road = this.GAME_AREA.getBoundingClientRect();
    if (this.player.start) {
      this.moveLines();
      this.moveEnemy(car);
      this.moveBalls();

      if (this.keys.ArrowUp && this.player.y > road.top + 70) {
        this.player.y -= this.player.speed;
      }
      if (this.keys.ArrowDown && this.player.y < road.bottom - 70) {
        this.player.y += this.player.speed;
      }
      if (this.keys.ArrowLeft && this.player.x > 0) {
        this.player.x -= this.player.speed;
      }
      if (this.keys.ArrowRight && this.player.x < road.width - 50) {
        this.player.x += this.player.speed;
      }
      car.style.top = this.player.y + "px";
      car.style.left = this.player.x + "px";
      window.requestAnimationFrame(this.gamePlay.bind(this));
    }
  }

  createRoadLine(index, leftPadding) {
    let roadLine = document.createElement("div");
    roadLine.setAttribute("class", "lines");
    roadLine.y = index * 150;
    roadLine.style.top = roadLine.y + "px";
    roadLine.style.left = leftPadding + "px";
    return roadLine;
  }
}

const game = new Game();
game.init();
