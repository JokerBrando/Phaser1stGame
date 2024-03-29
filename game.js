var config = { // туто ми налаштовуємо сценку
    type: Phaser.AUTO,



    width: 1920,


    height: 1080,
    scene: {
        parent: game,
        physics: {  //задаємо стиль фізики гри
            default: 'arcade',
            arcade: {
                gravity: { y: 200 },  //додаємо гравітацію
                debug: true
            }
        },
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);  //тут ми дещо теж додаємо :)
var worldWidth = 9600
var console = console;
var plants;
var platform;
var worldWight = config.width = 10;
var life = 5;
var resetButton
var playerDirection = 'right';
var numSkySprites = Math.ceil(config.width / 1920); // 1920 - ширина зображення 'sky'
var bullet;
var skeleton;
var skeletons; // Змінна для зберігання групи скелетів
var player;




function preload()// тут ми завантажуємо потрібні матеріали для гри
{


    this.load.image('sky', 'assets/1.jpg');


    this.load.image('ground', 'assets/tile.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('spike', 'assets/spike1.png');
    this.load.image('skeleton', 'assets/skeleton1.png');
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );

}

function create() {




    var score = 0;
    var scoreText;
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });  //це поки що не надо
    function collectStar(player, star) {
        star.disableBody(true, true);

        score += 10;
        scoreText.setText('Score: ' + score);
    }

    cursors = this.input.keyboard.createCursorKeys();
    this.add.image(960, 540, 'sky');   //тут ми можна сказати доаємо на сцену наш фон



    platforms = this.physics.add.staticGroup();



    // platforms.create(400, 568, 'ground').setScale(2).refreshBody();    //це не нада взагалі
    // platforms.create(1750, 568, 'ground').setScale(2).refreshBody();
    // platforms.create(1750, 400, 'ground');
    // platforms.create(1400, 250, 'ground').setScale(0.5).refreshBody();
    // platforms.create(1750, 200, 'ground').setScale(0.2).refreshBody();
    // platforms.create(960, 1070, 'ground').setScale(5).refreshBody();

    // platforms.create(400, 380, 'ground');
    // platforms.create(130, 150, 'ground');
    // platforms.create(600, 350, 'ground'); 

    for (var x = 0; x < worldWidth; x = x + 400) {
        //console.log(x)
        platforms.create(x, 700, 'ground').setOrigin(0, 0).refreshBody().setScale(1);  //тут ми додаємо платформи які спауняться випадковим образом
    }

    player = this.physics.add.sprite(500, 450, 'dude');  //додаємо персонажа і задаємо його розміри і ось 
    player.setScale(0.8)
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);



    spike = this.physics.add.staticGroup();
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(200, 500)) {
        spike
            .create(x, 800 - 120, 'spike')
            .setOrigin(0.5, 0.5)
            .setScale(Phaser.Math.FloatBetween(1, 2))
            .setDepth(Phaser.Math.Between(2, 10));
    }


    for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(600, 700)) {
        var y = Phaser.Math.FloatBetween(700, 10 * 10)
        platforms.create(x, y, 'ground');
        var i;
        for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
            platforms.create(x + 700 * i, y, 'ground');
        } platforms.create(x + 700 * i, y, 'ground');
    }




    // this.anims.create({   //створюємо анімації для персонажа
    //     key: 'left',
    //     frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    //     frameRate: 10,
    //     repeat: -1
    // });

    // this.anims.create({
    //     key: 'turn',
    //     frames: this.anims.generateFrameNumbers("dude", {
    //         frames: [4],
    //       }),
    //     frameRate: 10,
    //     repeat: -1
    // });

    // this.anims.create({
    //     key: 'right',
    //     frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    //     frameRate: 10,
    //     repeat: -1
    // });
    // player.body.setGravityY(10)   //задаємо персонажу гравітацію
    // this.physics.add.collider(player, platforms);  //створюємо йому колізію

    stars = this.physics.add.group({   //додаємо зірочки
        key: 'star',
        repeat: 15,
        setXY: { x: 0, y: 0, stepX: 120 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    this.physics.add.collider(stars, platforms); // задаємо колізію
    this.physics.add.overlap(player, stars, collectStar, null, this);
    function collectStar(player, star) {
        star.disableBody(true, true);
    }
    if (stars.countActive(true) === 0) // якщо немає більше зірок
    {
        // перезавантажити усі зірки
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        // обрати x в протилежній частині екрану від гравця, випадково
        var x = (player.x < 16) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        // створити одну бомбу
        var bomb = bombs.create(x, 800, 'bomb');
        bomb.setBounce(0.999); // майже максимальна стрибучість
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20); // з випадковою швидкістю

        // коли усі зірки знову зібрані, додає ще 1 бомбу, і т.д, даючи можливість зібрати ще більше очок
    }

    scoreText = this.add.text(100, 100, 'Score: 0', { fontSize: '20px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0)



    var resetButton = this.add.text(400, 100, 'reset', { fontSize: '40px', fill: '#ccc' })
        .setInteractive()
        .setScrollFactor(0)


    resetButton.on('pointerdown', function () {
        console.log('restart')
        refreshBody()
    });




    function moveSkeletons(player, skeleton) {
        if (Math.abs(player.x - skeleton.x) <= 600) {
            this.physics.moveToObject(skeleton, player, 100);
        }
    }



    this.input.on('pointerdown', shootBullet, this);






    this.anims.create({   //створюємо анімації для персонажа
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: this.anims.generateFrameNumbers("dude", {
            frames: [4],
        }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });
    player.body.setGravityY(10)   //задаємо персонажу гравітацію
    this.physics.add.collider(player, platforms);  //створюємо йому колізію
    this.physics.add.collider(player, spike, hitspike, null, this);


    lifeText = this.add.text(1400, 100, showLife(), { fontSize: '40px', fill: '#FFF' })
        .setInteractive()
        .setScrollFactor(0);

    

    function createSkeletons() {
        // Створення групи скелетів і додавання фізики
        skeletons = this.physics.add.group({
            key: 'skeleton',
            repeat: 10, // Кількість скелетів
            setXY: { x: 100, y: 400, stepX: 200 } // Початкові координати і відступ між скелетами
        });

        // Додавання колізії між скелетами та платформами
        this.physics.add.collider(skeletons, platforms);

        // Додавання анімації для скелетів (якщо необхідно)

        // Налаштування руху скелетів за гравцем
        this.physics.add.overlap(player, skeletons, moveSkeletons, null, this);
    }
    function moveSkeletons(player, skeleton) {
        // Перевірка, чи скелет в межах 2000 пікселів
        if (Math.abs(player.x - skeleton.x) <= 20000) {
            // Рухаємо скелета в напрямку гравця
            this.physics.moveToObject(skeleton, player, 100);
        }
    }


    createSkeletons.call(this);


    bullet = this.physics.add.group();
    this.physics.add.collider(bullet, skeletons, hitSkeleton, null, this);
}

function showLife() {
    var lifeLine = 'Життя: '

    for (var i = 0; i < life; i++) {
        lifeLine += '🏓'
    }
    return lifeLine
}


function update() {

    // function updatePlantPositions() {
    //     plants.children.iterate(function (child));
    //     {
    //         // Перевірка колізій рослини з платформами
    //         var overlaps = false;
    //         platforms.children.iterate(function (platform) {
    //             if (Phaser.Geom.Intersects.RectangleToRectangle(child.getBounds(), platform.getBounds())) {
    //                 overlaps = true;
    //             }
    //         });


    this.cameras.main.setBounds(0, 0, worldWidth, window.innerHeight);  //робимо камеру щоб вона стежила за гравцем
    this.physics.world.setBounds(0, 0, worldWidth, window.innerHeight);
    this.cameras.main.startFollow(player);

    if (cursors.left.isDown)  //робимо керуваня гравцем
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', false);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }





    if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
}



function shootBullet(pointer) {
    // Створюємо пулю з використанням створеного зображення
    let bullet = this.physics.add.sprite(player.x, player.y, 'bullet');

    // Визначаємо напрямок руху пулі до місця курсору миші
    let angle = Phaser.Math.Angle.Between(player.x, player.y, pointer.x, pointer.y);
    let velocityX = Math.cos(angle) * 500; // швидкість по горизонталі
    let velocityY = Math.sin(angle) * 500; // швидкість по вертикалі

    // Встановлюємо швидкість руху пулі
    bullet.setVelocity(velocityX, velocityY);
    skeletons.children.iterate((child)=>{
        this.physics.add.collider(child, bullet, () => {
            child.disableBody(true, true); // Знищуємо скелет
            bullet.disableBody(true, true); // Знищуємо фаєрбол
        }, null, true);
    })

}


function restartGame() {
    // Перезавантаження гри
    window.location.reload();
}

function createSkeletons() {
    skeletons = this.physics.add.group({
        key: 'skeleton',
        repeat: 5,
        setXY: { x: 100, y: 0, stepX: 200 }
    });

    this.physics.add.collider(skeletons, platforms);
    this.physics.add.overlap(player, skeletons, moveSkeletons, null, this);
}
function hitSkeleton(bullet, skeleton) {
    skeleton.disableBody(true, true); // Знищуємо скелет
    bullet.disableBody(true, true); // Знищуємо фаєрбол
}

function hitspike(player, spike) {
    life--; // Зменшуємо життя гравця
    lifeText.setText(showLife()); // Оновлюємо текст життя
    spike.disableBody(true, true); // Вимикаємо спрайт spike

    if (life <= 0) {
        restartGame();
    }
}

