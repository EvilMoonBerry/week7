import Phaser from "phaser";
import "./styles.css";
//Credits: week 7 source code was used as the base of the game. Pellet, cloud, 1,2,3 and anotherground was drawn by me
let game;

const gameOptions = {
  dudeGravity: 800,
  dudeSpeed: 325
};

window.onload = function () {
  let gameConfig = {
    type: Phaser.AUTO,
    backgroundColor: "#87CEFA",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 1000
    },
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          y: 0
        }
      }
    },
    scene: PlayGame
  };

  game = new Phaser.Game(gameConfig);
  window.focus();
};

class PlayGame extends Phaser.Scene {
  constructor() {
    super("PlayGame");
    this.score = 0;
    this.HP = 150;
  }

  preload() {
    this.load.image("ground", "assets/anotherground.png");
    this.load.image("star", "assets/star.png");
    this.load.image("cloud", "assets/cloud.png");
    this.load.image("1", "assets/1.png");
    this.load.image("2", "assets/2.png");
    this.load.image("3", "assets/3.png");
    this.load.image("pellet", "assets/pellet.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48
    });
  }

  create() {
    this.groundGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    for (let i = 0; i < 20; i++) {
      this.groundGroup.create(
        Phaser.Math.Between(0, game.config.width),
        Phaser.Math.Between(0, game.config.height),
        "ground"
      );
    }

    this.dude = this.physics.add.sprite(
      game.config.width / 2,
      game.config.height / 2,
      "dude"
    );
    this.dude.body.gravity.y = gameOptions.dudeGravity;
    this.physics.add.collider(this.dude, this.groundGroup);

    this.pelletGroup = this.physics.add.group({});
    this.physics.add.collider(this.pelletGroup, this.groundGroup);

    this.starsGroup = this.physics.add.group({});
    this.physics.add.collider(this.starsGroup, this.groundGroup);

    this.cloudsGroup = this.physics.add.group({});
    this.physics.add.collider(this.cloudsGroup, this.groundGroup);

    this.physics.add.overlap(
      this.dude,
      this.starsGroup,
      this.collectStar,
      null,
      this
    );

    this.physics.add.overlap(
      this.dude,
      this.cloudsGroup,
      this.collectCloud,
      null,
      this
    );
    this.physics.add.overlap(
      this.dude,
      this.pelletGroup,
      this.collectPellet,
      null,
      this
    );

    this.add.image(16, 16, "star");
    this.scoreText = this.add.text(32, 3, "0", {
      fontSize: "30px",
      fill: "#ffffff"
    });
    if (this.HP === 150) {
      this.add.image(100, 50, "3");
    }

    this.cursors = this.input.keyboard.createCursorKeys();

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", {
        start: 0,
        end: 3,
        suffix: "dude.png"
      }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4, suffix: "dude.png" }],
      frameRate: 10
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", {
        start: 5,
        end: 9,
        suffix: "dude.png"
      }),
      frameRate: 10,
      repeat: -1
    });

    this.triggerTimer = this.time.addEvent({
      callback: this.addGround,
      callbackScope: this,
      delay: 700,
      loop: true
    });
  }

  addGround() {
    console.log("Adding new stuff!");
    this.groundGroup.create(
      Phaser.Math.Between(0, game.config.width),
      0,
      "ground"
    );
    this.groundGroup.setVelocityY(gameOptions.dudeSpeed / 6);

    if (Phaser.Math.Between(0, 1)) {
      this.starsGroup.create(
        Phaser.Math.Between(0, game.config.width),
        0,
        "star"
      );
      this.starsGroup.setVelocityY(gameOptions.dudeSpeed);

      this.cloudsGroup.create(
        Phaser.Math.Between(0, game.config.width),
        0,
        "cloud"
      );
      this.cloudsGroup.setVelocityY(gameOptions.dudeSpeed);
    }

    if (Phaser.Math.Between(0, 2) === 2) {
      this.pelletGroup.create(Phaser.Math.Between(0, 16), 0, "pellet");
      this.pelletGroup.setVelocityX(gameOptions.dudeSpeed / 5);
      this.pelletGroup.setVelocityY(gameOptions.dudeSpeed * 2);
    }
  }

  collectStar(dude, star) {
    star.disableBody(true, true);
    this.score += 1;
    this.scoreText.setText(this.score);
  }

  collectCloud(dude, cloud) {
    cloud.disableBody(true, true);
    this.score -= 1;
    this.HP -= 50;
    this.scoreText.setText(this.score);
  }
  collectPellet(dude, pellet) {
    pellet.disableBody(true, true);
    this.score += 100;
    this.scoreText.setText(this.score);
  }

  update() {
    if (this.cursors.left.isDown) {
      this.dude.body.velocity.x = -gameOptions.dudeSpeed;
      this.dude.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.dude.body.velocity.x = gameOptions.dudeSpeed;
      this.dude.anims.play("right", true);
    } else {
      this.dude.body.velocity.x = 0;
      this.dude.anims.play("turn", true);
    }

    if (this.cursors.up.isDown && this.dude.body.touching.down) {
      this.dude.body.velocity.y = -gameOptions.dudeGravity / 1.6;
    }

    if (this.dude.y > game.config.height || this.dude.y < 0 || this.HP === 0) {
      this.scene.start("PlayGame");
      this.HP = 150;
      this.score = 0;
    }

    if (this.HP === 100) {
      this.add.image(100, 50, "2");
    } else if (this.HP === 50) {
      this.add.image(100, 50, "1");
    }
  }
}
