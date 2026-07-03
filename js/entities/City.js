import { box } from "../core/MeshFactory.js";

export class City {
    constructor(scene,lines,size,roadWidth,blockSize) {
        this.scene = scene;
        this.lines = lines;
        this.size = size;
        this.roadWidth = roadWidth;
        this.blockSize = blockSize;
        this.buildings = [];

        this.build();
    }
    build() {

        const ground = box(2000, 1, 2000, 0x527342);
        ground.position.y = -0.5;
        this.scene.add(ground);

        const roadW = this.roadWidth;
        for (const x of this.lines) {
            const road = box(roadW, 0.14, this.size, 0x38383d);
            road.position.set(x, 0.06, 0);
            this.scene.add(road);
        }
        for (const z of this.lines) {
            const road = box(this.size, 0.14, roadW, 0x38383d);
            road.position.set(0, 0.06, z);
            this.scene.add(road);
        }

        /**buildings */
        const palette = [0x8d8d99, 0x736b60, 0x9a6155, 0x5a8089, 0x80806b, 0x666b80];
        const mids = this.lines.slice(1, -1).map((v) => v + this.blockSize / 2);
        const half = (this.blockSize - roadW) / 2;

        for (const x of mids) {
            for (const z of mids) {
                const w = 4 + Math.random() * 2;
                const d = 4 + Math.random() * 2;
                const h = 4 + Math.random() * 4;
               const building = box(w, h, d, palette[Math.floor(Math.random() * palette.length)]);
                const jx = (Math.random() * 2 - 1) * (half - w / 2);
                const jz = (Math.random() * 2 - 1) * (half - d / 2);
               building.position.set(x + jx, h / 2, z + jz);
                this.buildings.push({ x: x + jx, z: z + jz, hw: w / 2, hd: d / 2 });
                this.scene.add(building);
            }
        }
    }
}