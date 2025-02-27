const carCanvas = document.querySelector("#carCanvas")
carCanvas.width = 200

const networkCanvas = document.querySelector("#networkCanvas")
networkCanvas.width = 300

const carCtx = carCanvas.getContext("2d")
const networkCtx = networkCanvas.getContext("2d")

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3)

/**
 * 训练时，将这里的N改的大一点，只要你的计算机承受得住，一般是1000
 * 当你看到有汽车走的更远时，点击保存记忆，就相当于完成了一次训练，然后刷新浏览器，下次更多的汽车就会记住
 * 当你觉得所有的汽车都卡住不前进时，可以点击清除记忆，消除所有的训练
 * 当存在一个汽车每次都能绕过所有其他红色汽车时，就可以把下边的N改成1
 * **/


// const N = 1  //训练完成时用1
const N = 1  //训练时可以用1000甚至更大，如果电脑承受不住，可以改小一点，比如100，那么就需要你自己多刷新浏览器

const cars = generateCars(N)
let bestCar = cars[0]
if(localStorage.getItem("bestCar")) {
    for(let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestCar"))
        if(i != 0) {
            // 第一辆车完美继承本地训练结果，其他的会在此基础上进行突变，以免永远卡在某个地方
            // 0.1表示很小的突变，如果第二个是1，那就是完全突变
            NeuralNetwork.mutate(cars[i].brain, 0.2)
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