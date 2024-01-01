import Phaser from "phaser";

// function collectStar(player, star) {
//     star.disableBody(true, true);
//     score += 10;
//     scoreText.setText("Score: " + score);
// }

class MainScene extends Phaser.Scene {
    platforms: Phaser.Physics.Arcade.StaticGroup | undefined;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | undefined;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    stars: Phaser.Physics.Arcade.Group | undefined;
    bombs: Phaser.Physics.Arcade.Group | undefined;
    scoreText: Phaser.GameObjects.Text | undefined;
    score: number | undefined;
    gameOver: boolean | undefined;
    constructor() {
        super({
            key: "Main",
        });
    }

    collectStar(player: any, star: any) {
        star.disableBody(true, true);
        if (this.score === undefined) throw new Error("scoreText is undefined");
        this.score += 10;
        if (this.scoreText === undefined)
            throw new Error("scoreText is undefined");
        this.scoreText.setText(`Score: ${this.score}`);

        if (this.stars === undefined) throw new Error("stars is undefined");

        if (this.stars.countActive(true) === 0) {
            this.stars.children.iterate((child) => {
                if (child instanceof Phaser.Physics.Arcade.Sprite) {
                    child.enableBody(true, child.x, 0, true, true);
                    child.setVelocityX(Phaser.Math.FloatBetween(-120, 120));
                }
                return true;
            });

            const x =
                player.x < 400
                    ? Phaser.Math.Between(400, 800)
                    : Phaser.Math.Between(0, 400);

            if (this.bombs === undefined) throw new Error("bombs is undefined");
            const bomb = this.bombs.create(x, 16, "bomb");
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        }
    }

    hitBomb(player: any, _bomb: any) {
        this.physics.pause();

        player.setTint(0xff0000);

        player.anims.play("turn");

        this.gameOver = true;
    }

    /**
     * 初期処理
     */
    init(): void {
        console.log("init");
    }

    /**
     * アセットデータ読込などを行う処理
     */
    preload(): void {
        this.load.image("sky", "/sky.png");
        this.load.image("ground", "platform.png");
        this.load.image("star", "star.png");
        this.load.image("bomb", "bomb.png");
        this.load.spritesheet("dude", "dude.png", {
            frameWidth: 32,
            frameHeight: 48,
        });
    }

    /**
     * ゲーム画面の作成処理やイベントアクションを記述する処理
     *
     */

    create(): void {
        this.add.image(0, 0, "sky").setOrigin(0, 0);

        this.platforms = this.physics.add.staticGroup();

        this.platforms.create(400, 568, "ground").setScale(2).refreshBody();
        this.platforms.create(600, 400, "ground");
        this.platforms.create(50, 250, "ground");
        this.platforms.create(750, 220, "ground");

        this.player = this.physics.add.sprite(100, 450, "dude");

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.stars = this.physics.add.group({
            key: "star",
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 },
            collideWorldBounds: true,
        });

        this.stars.children.iterate((child) => {
            if (child instanceof Phaser.Physics.Arcade.Sprite) {
                child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                child.setBounceX(1);
                child.setVelocityX(Phaser.Math.FloatBetween(-120, 120));
            }
            return true;
        });

        this.bombs = this.physics.add.group();

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 0,
                end: 3,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "turn",
            frames: [{ key: "dude", frame: 4 }],
            frameRate: 20,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers("dude", {
                start: 5,
                end: 8,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.score = 0;
        this.gameOver = false;

        this.scoreText = this.add.text(16, 16, "score: 0", {
            fontSize: "32px",
            color: "#000",
        });

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);

        this.physics.add.overlap(
            this.player,
            this.stars,
            this.collectStar,
            undefined,
            this,
        );

        this.physics.add.collider(
            this.player,
            this.bombs,
            this.hitBomb,
            undefined,
            this,
        );

        this.cursors = this.input.keyboard?.createCursorKeys();
    }

    /**
     * メインループ
     */
    update(): void {
        if (this.player === undefined) throw new Error("player is undefined");
        if (this.cursors === undefined) throw new Error("cursors is undefined");
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play("left", true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play("right", true);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play("turn");
        }
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "app",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
        },
    },
    scene: MainScene,
};

new Phaser.Game(config);
