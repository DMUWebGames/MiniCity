export class Minimap {
  constructor(worldSize) {
    this.worldSize = worldSize;
    this.canvas = document.createElement('canvas');
    this.canvas.width = 160;
    this.canvas.height = 160;
    this.canvas.style.cssText =
      'position:fixed;bottom:16px;left:16px;z-index:10;' +
      'border:2px solid #fff;border-radius:8px;background:#0008';
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  }

  toMap(x, z) {
    const S = 160;
    return {
      px: (x / this.worldSize + 0.5) * S,
      py: (z / this.worldSize + 0.5) * S,
    };
  }

  draw(playerPos, playerRotation, markerPos) {
    const ctx = this.ctx;
    const S = this.canvas.width;
    ctx.clearRect(0, 0, S, S);

    const marker = this.toMap(markerPos.x, markerPos.z);
    ctx.fillStyle = '#ffd433';
    ctx.beginPath();
    ctx.arc(marker.px, marker.py, 5, 0, Math.PI * 2);
    ctx.fill();

    const player = this.toMap(playerPos.x, playerPos.z);
    ctx.fillStyle = '#3aa0ff';
    ctx.strokeStyle = '#3aa0ff';
    ctx.save();
    ctx.translate(player.px, player.py);
    ctx.rotate(-playerRotation);
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -10);
    ctx.stroke();
    ctx.restore();
  }
}
