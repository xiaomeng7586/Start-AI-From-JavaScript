class Sensor {
    constructor(car) {
        this.car = car
        this.rayCount = 5
        this.rayLength = 150
        this.raySpread = Math.PI / 2

        this.rays = []
        this.readings = []
    }

    update(roadBorders, traffic) {
        this.#castRays()
        this.readings = []
        for(let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(this.rays[i], roadBorders, traffic)
            )
        }
    }

    #getReading(ray, roadBorders) {
        let touches = []

        for(let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            )

            if(touch) {
                touches.push(touch)
            }
        }

        for(let i = 0; i < traffic.length; i++) {
            const polygons = traffic[i].polygons
            for(let j = 0; j < polygons.length; j++) {
                const touch = getIntersection(
                    ray[0],
                    ray[1],
                    polygons[j],
                    polygons[(j + 1) % polygons.length]
                )
    
                if(touch) {
                    touches.push(touch)
                }
            }
        }

        if(touches.length == 0) {
            return null
        } else {
            const offsets = touches.map(e => e.offset)
            const minOffset = Math.min(...offsets)
            return touches.find(e => e.offset == minOffset)
        }
    }

    #castRays() {
        this.rays = []

        for(let i = 0; i < this.rayCount; i++) {
            const x = this.car.x
            const y = this.car.y
            const angle = lerp(
                this.raySpread / 2,
                - this.raySpread  / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle

            const start = {
                x: x,
                y: y
            }
            const end = {
                x: x - Math.sin(angle) * this.rayLength,
                y: y - Math.cos(angle) * this.rayLength
            }

            this.rays.push([start, end])
        }
    }

    draw(ctx) {
        for(let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1]
            if(this.readings[i]) {
                end = this.readings[i]
            }
            ctx.lineWidth = 2
            ctx.strokeStyle = "yellow"
            ctx.beginPath()
            ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()

            ctx.strokeStyle = "black"
            ctx.beginPath()
            ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()
        }
    }
}