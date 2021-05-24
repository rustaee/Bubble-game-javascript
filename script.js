//Canvas Setup
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;


if(windowHeight > windowWidth) {
    windowHeight = windowWidth;
}
const canvasSize = windowWidth > 800 ? 0.7 : 0.95;
    canvas.width = windowWidth * canvasSize;
    canvas.height= windowHeight * canvasSize;
    console.log(canvasSize);

let score = 0;
let gameFrame = 0;
ctx.font = '50px Georgia';
let gameSpeed = 1;
let gameOver = false;

//Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    clicke: false
}

canvas.addEventListener('mousedown', (event) => {
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});

canvas.addEventListener('mouseup', () => {
    mouse.click = false;
})
 
//Player
const playerLeft = new Image();
playerLeft.src = 'assets/lfish.png';
const playerRight = new Image();
playerRight.src = 'assets/rfish.png';
class Player {
    constructor(){
        this.x = canvas.width; //player starts at this point and goes toward the mouse position(in the center)
        this.y = canvas.height /2;
        this.radius = 50; //to make a circle for player character
        this.angle = 0;  // to rotate the fish toward the mouse position 
        this.frameX = 0; //coordinates of currently displayed frame in fish spritesheet
        this.frameY = 0;
        //this.frame = 0; //keep track of overall number of frames on the sheet and the current position we are animating
        this.spriteWidth = 1992 / 4;
        this.sprithHeight= 981 / 3;
    }

    update(){
        const dx = this.x - mouse.x; //fish distance from mouse position on the horisontal x
        const dy = this.y - mouse.y;
        if(gameFrame % 5 == 0){
            this.frameX ++;
            if(this.frameX % 4 == 0 ){ //the fish sprite has 4x3=12 frames
                this.frameX = 0;
                this.frameY ++;
                if(this.frameY % 3 == 0){
                    this.frameY = 0;
                }

            }
        }
        //calculate the angle of fish image
        let theta = Math.atan2(dy, dx);
        this.angle = theta;
        if(mouse.x != this.x) {
            this.x -= dx / 20; // divide 20 to displaye the movement on a reasonable speed
        }
        if(mouse.y != this.y) {
            this.y -= dy/20
        }

    }

     draw(){
            ctx.save(); //To rotate just the fish not the bubbles
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            if(this.x >= mouse.x) {
                ctx.drawImage(playerLeft, this.frameX * this.spriteWidth, this.frameY * this.sprithHeight, this.spriteWidth,this.sprithHeight, 0 - 60 , 0 - 50 , this.spriteWidth / 3.5, this.sprithHeight / 3.5);
            }else{
                ctx.drawImage(playerRight, this.frameX * this.spriteWidth, this.frameY * this.sprithHeight, this.spriteWidth,this.sprithHeight, 0  - 60 , 0 - 50 , this.spriteWidth / 3.5, this.sprithHeight / 3.5);
            }
            ctx.restore();
        
    }
}
const player = new Player;

//Bubbles
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = 'assets/bubble.png';
class Bubble {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 100;
        this.radius = 50;
        this.speed = Math.random() * 5 + 1; //between 1 to 6 (can't be 0)
        this.distance; //keep track of each bubble and player
        this.counted = false; 
        this.sound = Math.random() <= 0.5 ? 'sound1' : 'sound2';
    }

    update(){
        this.y -= this.speed;
        //To detect the collision
        //https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
        const dx= this.x - player.x;
        const dy= this.y - player.y;
        this.distance = Math.sqrt(dx*dx + dy*dy);
    }

    draw(){
        ctx.drawImage(bubbleImage,this.x-75, this.y-75, this.radius*3, this.radius*3);
    }
}

const bubblepop1 = document.createElement('audio');
bubblepop1.src = 'assets/pop1.ogg';
const bubblepop2 = document.createElement('audio');
bubblepop2.src = 'assets/pop1.ogg';

function handleBubbles(){
    if(gameFrame % 50 == 0){
        bubblesArray.push(new Bubble());
    }
    
    for(let i =0; i< bubblesArray.length; i ++){
        bubblesArray[i].update();
        bubblesArray[i].draw();
        //delete the bubbles out of screen
        if(bubblesArray[i].y < 0 - bubblesArray[i].radius){ 
            bubblesArray.splice(i, 1);
            i--; //To fix the problem with blinking bubbles.when remove one element, all following values in the array move back one position. and what was i++ now is i. update() and draw() won't be called for new item (i) and we see a blink.
        }           
        else if(bubblesArray[i].distance < bubblesArray[i].radius + player.radius){ //Collision detection
            if(!bubblesArray[i].counted){
                if(bubblesArray[i].sound == 'sound1'){
                    bubblepop1.play();
                }else{
                    bubblepop2.play();
                }
                score++;
                bubblesArray[i].counted= true;
                bubblesArray.splice(i, 1);
                i--; //To fix the problem with blinking bubbles.
            }
        }
        
    }
}

//Enemies
const enemyImage = new Image();
enemyImage.src = 'assets/enemy1.png';

class Enemy {
    constructor(){
        this.x = canvas.width + 200;
        this.y = Math.random() * (canvas.height - 150 ) + 90;
        this.radius = 60;
        this.speed = Math.random() * 2 + 2;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 418;
        this.sprithHeight = 397;
    }

    draw(){
        ctx.drawImage(enemyImage,this.frameX * this.spriteWidth, this.frameY * this.sprithHeight,this.spriteWidth, this.sprithHeight,this.x - 60, this.y - 70, this.spriteWidth / 3, this.sprithHeight / 3);
    }

    update(){
        this.x -= this.speed;
        if(this.x < 0 - this.radius){ //enemy is out of the left side of screen
            this.x = canvas.width + 200;
            this.y = Math.random() * (canvas.height - 150) + 90;
            this.speed = Math.random () * 2 + 2;
        }

        if(gameFrame % 5 == 0) {
            this.frame ++;

             if (this.frame >= 12) this.frame = 0; //enemy spritesheet has 12 frame
             if(this.frame == 3 || this.frame == 7 || this.frame == 11){ //enemy sprite has 4x3=12 frames
                 this.frameX = 0;
             }else{
                 this.frameX ++;
             }

            if (this.frame < 3 ) this.frameY = 0;
            else if (this.frame < 7 ) this.frameY = 1;
            else if (this.frame < 11) this.frameY = 2;
            else this.frameY = 0;
        }

        //collision with fish player (collision between two circle)
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        if(distance < this.radius + player.radius){
            handleGameOver();
        }

    }
}

const enemy1 = new Enemy();
function handleEnemies(){
    enemy1.draw();
    enemy1.update();
}

function handleGameOver(){
    ctx.fillStyle= 'red';
    ctx.fillText('GAME OVER !', canvas.width / 2 -150, canvas.height / 2 - 50);
    ctx.strokeText('GAME OVER !', canvas.width / 2 - 150, canvas.height / 2 - 50);
    gameOver = true;
}

//Repeating background
const background = new Image();
background.src = 'assets/bg.png';
const BG = {
    x1: 0,
    x2: canvas.width,
    y: 0,
    width: canvas.width,
    height: canvas.height,
}

function handleBackground(){
     BG.x1 -= gameSpeed;
     if(BG.x1 <= - BG.width) BG.x1 = BG.width;
    BG.x2 -=gameSpeed;
    if(BG.x2 <= - BG.width)  BG.x2 = BG.width;
    ctx.drawImage(background, BG.x1, BG.y, BG.width, BG.height);
    ctx.drawImage(background, BG.x2, BG.y, BG.width, BG.height);
}

//Animation Loop
function animate(){
    ctx.clearRect(0, 0 , canvas.width, canvas.height);
    handleBackground();
    handleBubbles();
    player.update();
    player.draw();
    handleEnemies();
    ctx.fillStyle = '#000';
    ctx.fillText('Score: '+ score, 10, 50);
    gameFrame++;
    if(!gameOver) requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize' , () => {
    canvasPosition = canvas.getBoundingClientRect();
})