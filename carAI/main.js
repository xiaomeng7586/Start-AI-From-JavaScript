const carCanvas = document.querySelector("#carCanvas")
carCanvas.width = 200

const networkCanvas = document.querySelector("#networkCanvas")
networkCanvas.width = 300

const carCtx = carCanvas.getContext("2d")
const networkCtx = networkCanvas.getContext("2d")

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3)

const N = 1
const cars = generateCars(N)
let bestCar = cars[0]
if(localStorage.getItem("bestCar")) {
    for(let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestCar"))
        if(i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.1)
        }
    }
}

const traffic = [
    new Car(road.getLaneCenter(1), -100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -700, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -900, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -900, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(1), -1100, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -1100, 30, 50, "DUMMY", 2),

    new Car(road.getLaneCenter(1), -1300, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -1500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(0), -1500, 30, 50, "DUMMY", 2),
    new Car(road.getLaneCenter(2), -1700, 30, 50, "DUMMY", 2),
]

function save() {
    localStorage.setItem("bestCar", JSON.stringify(bestCar.brain))
}

function discard() {
    localStorage.removeItem("bestCar")
}

function generateCars(N) {
    const cars = []
    for(let i = 0; i < N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"))
    }
    return cars
}

let startTime = 0
animate()

function animate(time) {
    if(time - startTime >= 10) {
        startTime = time

        for(let i = 0; i < traffic.length; i++) {
            traffic[i].update(road.borders, [])
        }

        for(let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders, traffic)
        }

        bestCar = cars.find(i =>
            i.y === Math.min(...cars.map(e => e.y))
        )

        carCanvas.height = window.innerHeight
        networkCanvas.height = window.innerHeight

        carCtx.save()
        carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7)

        road.draw(carCtx)

        for(let i = 0; i < traffic.length; i++) {
            traffic[i].draw(carCtx, "red")
        }

        carCtx.globalAlpha = 0.2
        for(let i = 0; i < cars.length; i++) {
            cars[i].draw(carCtx, "blue")
        }
        carCtx.globalAlpha = 1
        bestCar.draw(carCtx, "blue", true)

        carCtx.restore()

        networkCtx.lineDashOffset = -time * 0.02
        Visualizer.drawNetwork(networkCtx, bestCar.brain)
    }
    requestAnimationFrame(animate)
}