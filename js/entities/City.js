import { box } from "../core/MeshFactory.js";

class Building {
    constructor(x, z, width, height, depth, color) {
        this.mesh = box(width, height, depth, color);
        this.mesh.position.set(x, height / 2, z);
        this.x = x;
        this.z = z;
        this.hw = width / 2;
        this.hd = depth / 2;
    }
}

export class City {
    constructor(scene,nRoads,roadWidth,blockSize) {
        this.scene = scene;
        this.nRoads = nRoads;
        this.roadWidth = roadWidth;
        this.blockSize = blockSize;
        this.size = this.nRoads * this.roadWidth + (this.nRoads - 1) * this.blockSize;
        this.lines = Array.from({ length: this.nRoads }, (_, i) => (this.roadWidth / 2) - this.size/2 + i * (this.roadWidth + this.blockSize));
        this.blocks = Array.from({ length: this.nRoads - 1 }, (_, i) => this.roadWidth + this.blockSize/2 - this.size/2 + i * (this.roadWidth + this.blockSize));
        this.buildings = [];
        this.palette = [0x8d8d99, 0x736b60, 0x9a6155, 0x5a8089, 0x80806b, 0x666b80];
        this.build();
    }

    randomColour() {
        return this.palette[Math.floor(Math.random() * this.palette.length)];
    }

    createRoadX(x) {
        const road = box(this.roadWidth, 0.14, this.size, 0x38383d);
        road.position.set(x, 0.06, 0);
        this.scene.add(road);
    }
    createRoadZ(z) {
        const road = box(this.size, 0.14, this.roadWidth, 0x38383d);
        road.position.set(0, 0.06, z);
        this.scene.add(road);
    }

    createBuildingWithin(block, minSize=.5, maxSize=.7) {
        const width = (minSize + Math.random() * (maxSize - minSize)) * block.size;
        const depth = (minSize + Math.random() * (maxSize - minSize)) * block.size;
        const x = block.x + (block.size - width) * (Math.random() - 0.5);
        const z = block.z + (block.size - depth) * (Math.random() - 0.5);
        const height = 0.1 + Math.random() * 0.4 * this.size;
        return new Building(x, z, width, height, depth, this.randomColour());
        // return building;
        // // return {mesh:building, x, z,hw:width/2, hd:depth/2};
    }

    build() {
        this.ground = box(this.size * 10, 1, this.size * 10, 0x527342);
        this.ground.position.y = -.5;
        this.scene.add(this.ground);
        for (const x of this.lines) this.createRoadX(x);
        for (const z of this.lines) this.createRoadZ(z);

        for (const blockX of this.blocks) {
            for (const blockZ of this.blocks) {
                const building = this.createBuildingWithin({x: blockX, z: blockZ, size: this.blockSize});
                // this.scene.add(building.mesh);
                this.scene.add(building.mesh);
                this.buildings.push(building);
            }
        }

    }
    randomLine() {
        return this.lines[Math.floor(Math.random() * this.lines.length)];
    }
    randomPosition() {
        return [
            this.randomLine(),
            this.randomLine()
        ];
    }
    playerSpawnPosition() {
        return [
            this.lines[Math.floor(this.lines.length / 2)],
            this.lines[Math.floor(this.lines.length / 2)]
        ];
    }
}