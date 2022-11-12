const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.querySelector('#scoreEl')
console.log(scoreEl)

canvas.width = innerWidth;
canvas.height = innerHeight;

class Boundary {
    //para crear un limite estatico
    static width = 40;
    static height = 40;

    constructor({position, image}){
        this.position = position;
        this.width = 40;
        this.height = 40;
        this.image = image;
    }

    draw(){
        // ctx.fillStyle = 'blue';
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Hackman{
    constructor({position, velocity}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.radians = 0.75
        this.openRate = 0.12
        this.rotation = 0
    }

    draw(){
        ctx.save()
        ctx.translate(this.position.x, this.position.y)
        ctx.rotate(this.rotation)
        ctx.translate(-this.position.x, -this.position.y)
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius,this.radians, Math.PI * 2 - this.radians )
        ctx.lineTo(this.position.x, this.position.y)
        ctx.fillStyle = 'yellow'
        ctx.fill()
        ctx.closePath()
        ctx.restore()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if(this.radians < 0 || this.radians > .75) this.openRate = -this.openRate

        this.radians += this.openRate

    }
}

class Ghost{
    static speed = 2;
    constructor({position, velocity, color = 'red'}) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 15;
        this.color = color;
        this.prevCollisions = [];
        this.speed = 2;
        this.scared = false;
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.scared ? 'blue' : this.color;
        ctx.fill()
        ctx.closePath()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

    }
}

class PowerUp{
    constructor({position}) {
        this.position = position;
        this.radius = 8;
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()
        ctx.closePath()
    }
}

class Pellet{
    constructor({position}) {
        this.position = position;
        this.radius = 3;
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'white'
        ctx.fill()
        ctx.closePath()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

    }
}

const pellets = [];
const boundaries = [];
const powerUps = [];

const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        }
    }),
    new Ghost({
        position: {
            x: Boundary.width * 6 + Boundary.width / 2,
            y: Boundary.height * 3 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'pink'
    })
]

const hackman = new Hackman({
    position: {
        x: Boundary.width + Boundary.width / 2,
        y: Boundary.height + Boundary.height / 2
    },
    velocity:{
        x: 0,
        y: 0
    }
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

let lastKey = '';
let score = 0;


// para dibujar el mapa
const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']
]

function createImage(src){
    const image = new Image()
    image.src = src;
    return image;
}

// para poblar el array "boundaries" basado en la posicion de los simbolos.
map.forEach((row, index) => {
row.forEach((symbol, index2) =>{
        switch (symbol){
            case '-':
                boundaries.push(new Boundary({
                    position:{
                    x: Boundary.width * index2, 
                    y: Boundary.height * index
                    },
                    image: createImage('images/pipeHorizontal.png')
                })
                )
                break;
                case '|':
                boundaries.push(new Boundary({
                    position:{
                    x: Boundary.width * index2, 
                    y: Boundary.height * index
                    },
                    image: createImage('images/pipeVertical.png')
                })
                )
                break;
                case '1':
                boundaries.push(new Boundary({
                    position:{
                    x: Boundary.width * index2, 
                    y: Boundary.height * index
                    },
                    image: createImage('images/pipeCorner1.png')
                })
                )
                break;
                case '2':
                boundaries.push(new Boundary({
                    position:{
                    x: Boundary.width * index2, 
                    y: Boundary.height * index
                    },
                    image: createImage('images/pipeCorner2.png')
                })
                )
                break;
                case '3':
                boundaries.push(new Boundary({
                    position:{
                    x: Boundary.width * index2, 
                    y: Boundary.height * index
                    },
                    image: createImage('images/pipeCorner3.png')
                })
                )
                break;
                case '4':
                boundaries.push(new Boundary({
                    position:{
                    x: Boundary.width * index2, 
                    y: Boundary.height * index
                    },
                    image: createImage('images/pipeCorner4.png')
                })
                )
                break;
                case 'b':
                boundaries.push(
                new Boundary({
                    position: {
                    x: Boundary.width * index2,
                    y: Boundary.height * index
                    },
                    image: createImage('images/block.png')
                })
                )
                break
                case '[':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    image: createImage('images/capLeft.png')
                })
                )
                break
                case ']':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    image: createImage('images/capRight.png')
                })
                )
                break
                case '_':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    image: createImage('images/capBottom.png')
                })
                )
                break
                case '^':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    image: createImage('images/capTop.png')
                })
                )
                break
                case '+':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    image: createImage('images/pipeCross.png')
                })
                )
                break
                case '5':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    color: 'blue',
                    image: createImage('images/pipeConnectorTop.png')
                })
                )
                break
                case '6':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    color: 'blue',
                    image: createImage('images/pipeConnectorRight.png')
                })
                )
                break
                case '7':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    color: 'blue',
                    image: createImage('images/pipeConnectorBottom.png')
                })
                )
                break
                case '8':
                boundaries.push(
                new Boundary({
                    position: {
                    x: index2 * Boundary.width,
                    y: index * Boundary.height
                },
                    image: createImage('images/pipeConnectorLeft.png')
                })
                )       
                break
                case '.':
                pellets.push(
                new Pellet({
                    position: {
                    x: index2 * Boundary.width + Boundary.width / 2,
                    y: index * Boundary.height + Boundary.height / 2
                }
                })
                )
                break
                case 'p':
                powerUps.push(
                new PowerUp({
                    position: {
                    x: index2 * Boundary.width + Boundary.width / 2,
                    y: index * Boundary.height + Boundary.height / 2
                }
                })
                )
                break
        }
    })
})

function circleCollidesWithRectangle({
    circle,
    rectangle
}){
    const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <= 
        rectangle.position.y + rectangle.height + padding && 
        circle.position.x + circle.radius + circle.velocity.x >= 
        rectangle.position.x - padding && circle.position.y + circle.radius + circle.velocity.y >= 
        rectangle.position.y - padding && circle.position.x - circle.radius + circle.velocity.x <= 
        rectangle.position.x + rectangle.width + padding)
}

let animationId 
function animate(){
    animationId = requestAnimationFrame(animate)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // "lastKey" nos sirve para darle prioridad a la siguiente tecla que toquemos
    if(keys.w.pressed && lastKey === 'w'){
        for(let i = 0; i < boundaries.length; i++){
        const boundary = boundaries[i]
        if(
                circleCollidesWithRectangle({
                    circle: {...hackman, velocity: {
                        x: 0,
                        y: -5
                    }},
                    rectangle: boundary 
                    })
                ) {
                    hackman.velocity.y = 0;
                    break;
                }else {
                    hackman.velocity.y = -5
                }
            }
    } else if (keys.a.pressed && lastKey === 'a'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(
                    circleCollidesWithRectangle({
                        circle: {...hackman, velocity: {
                            x: -5,
                            y: 0
                        }},
                        rectangle: boundary 
                        })
                    ) {
                        hackman.velocity.x = 0;
                        break;
                    }else {
                        hackman.velocity.x = -5
                    }
                }
    } else if (keys.s.pressed && lastKey === 's'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(
                    circleCollidesWithRectangle({
                        circle: {...hackman, velocity: {
                            x: 0,
                            y: 5
                        }},
                        rectangle: boundary 
                        })
                    ) {
                        hackman.velocity.y = 0;
                        break;
                    }else {
                        hackman.velocity.y = 5
                    }
                }    
    } else if (keys.d.pressed && lastKey === 'd'){
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if(
                    circleCollidesWithRectangle({
                        circle: {...hackman, velocity: {
                            x: 5,
                            y: 0
                        }},
                        rectangle: boundary 
                        })
                    ) {
                        hackman.velocity.x = 0;
                        break;
                    }else {
                        hackman.velocity.x = 5
                    }
                }
            }

    for(let i = ghosts.length - 1; 0 <= i; i--){
        const ghost = ghosts[i]

    if(Math.hypot(
        ghost.position.x - hackman.position.x, 
        ghost.position.y - hackman.position.y
        ) < 
        ghost.radius + hackman.radius){
            if(ghost.scared){
                ghosts.splice(i, 1)
            }else {
            cancelAnimationFrame(animationId)
            alert('You Lose')
        }
    }}

if(pellets.length === 0){
    alert("You Win")
    cancelAnimationFrame(animationId)
}

    for(let i = powerUps.length - 1; 0 <= i; i--){
    const powerUp = powerUps[i]
    powerUp.draw()

    if(Math.hypot(
        powerUp.position.x - hackman.position.x, 
        powerUp.position.y - hackman.position.y
        ) < 
        powerUp.radius + hackman.radius
        ){
        powerUps.splice(i, 1)

        ghosts.forEach(ghost => {
            ghost.scared = true;

            setTimeout(()=> {
                ghost.scared = false;
                console.log(ghost.scared)
            }, 5000)
        })
        }
    }


    for(let i = pellets.length - 1; 0 <= i; i--){
        const pellet = pellets[i]
        pellet.draw()

        if(Math.hypot(
            pellet.position.x - hackman.position.x, 
            pellet.position.y - hackman.position.y
            ) < 
            pellet.radius + hackman.radius){
            console.log('touching')
            pellets.splice(i, 1)
            score += 10;
            scoreEl.innerHTML = score;
        }

    }
    
    boundaries.forEach((boundary)=>{
        boundary.draw()

        //para que no pueda tocar los bordes
        if(
            circleCollidesWithRectangle({
            circle: hackman,
            rectangle: boundary 
            })
        ) {
            hackman.velocity.x = 0;
            hackman.velocity.y = 0;
        }
    })

    hackman.update();

    ghosts.forEach((ghost) => {
        ghost.update()


        const collisions = [];
        boundaries.forEach((boundary) => {
            if(
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: ghost.speed,
                        y: 0
                    }},
                    rectangle: boundary 
                    })
                ) {
                    collisions.push('right')
                }
                if(
                    !collisions.includes('left') &&
                    circleCollidesWithRectangle({
                        circle: {...ghost, velocity: {
                            x: -ghost.speed,
                            y: 0
                        }},
                        rectangle: boundary 
                        })
                    ) {
                        collisions.push('left')
                    }
                if(
                    !collisions.includes('up') &&
                    circleCollidesWithRectangle({
                        circle: {...ghost, velocity: {
                            x: 0,
                            y: -ghost.speed
                        }},
                        rectangle: boundary 
                        })
                    ) {
                        collisions.push('up')
                    }
                if(
                    !collisions.includes('down') &&
                    circleCollidesWithRectangle({
                        circle: {...ghost, velocity: {
                            x: 0,
                            y: ghost.speed
                        }},
                        rectangle: boundary 
                        })
                    ) {
                        collisions.push('down')
                    }
                    
        })
        if(collisions.length > ghost.prevCollisions.length)
        ghost.prevCollisions = collisions;
    

        if(JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)){

            if(ghost.velocity.x > 0) ghost.prevCollisions.push('right')
            else if(ghost.velocity.x < 0) ghost.prevCollisions.push('left')
            else if(ghost.velocity.y < 0) ghost.prevCollisions.push('up')
            else if(ghost.velocity.y > 0) ghost.prevCollisions.push('down')



            const pathways = ghost.prevCollisions.filter((collision
                ) => {
                return !collisions.includes(collision)
            })

            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            console.log({direction})
            switch(direction){
                case 'down':
                    ghost.velocity.y = ghost.speed;
                    ghost.velocity.x = 0;
                    break;

                    case 'up':
                    ghost.velocity.y = -ghost.speed;
                    ghost.velocity.x = 0;
                    break;

                    case 'right':
                    ghost.velocity.y = 0;
                    ghost.velocity.x = ghost.speed;
                    break;
                    case 'left':
                    ghost.velocity.y = 0;
                    ghost.velocity.x = -ghost.speed;
                    break;
            }

            ghost.prevCollisions = [];
        }
        // console.log(collisions)

 
    })

    if(hackman.velocity.x > 0) hackman.rotation = 0;
    else if (hackman.velocity.x < 0) hackman.rotation = Math.PI;
    else if(hackman.velocity.y > 0) hackman.rotation = Math.PI / 2;
    else if (hackman.velocity.y < 0) hackman.rotation = Math.PI * 1.5;
}
animate()


//para mover a nuestro Hackman.
window.addEventListener('keydown', ({key}) => {
    switch (key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';
            break;
        case 'a':
            keys.a.pressed = true;
            lastKey = 'a';
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';
            break;    
    }
})

window.addEventListener('keyup', ({key}) => {
    console.log(key)
    switch (key) {
        case 'w':
            keys.w.pressed = false
            break;
        case 'a':
            keys.a.pressed = false
            break;
        case 's':
            keys.s.pressed = false
            break;
        case 'd':
            keys.d.pressed = false
            break;    
    }
})