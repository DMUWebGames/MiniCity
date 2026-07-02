export class HUD {
  constructor() {
    this.createSpeedDisplay();
    this.createTimerDisplay();
    this.createGoalDisplay();
    this.createOverlays();
  }

  createSpeedDisplay() {
    this.speedEl = document.createElement('div');
    this.speedEl.style.cssText =
      'position:fixed;bottom:16px;right:20px;z-index:10;color:#fff;' +
      'font-family:sans-serif;font-weight:900;font-size:34px;text-align:right;text-shadow:0 2px 8px #000';
    document.body.appendChild(this.speedEl);
  }

  createTimerDisplay() {
    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText =
      'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:10;color:#fff;' +
      'font-family:sans-serif;font-weight:900;font-size:32px;text-shadow:0 2px 8px #000';
    document.body.appendChild(this.timerEl);
  }

  createGoalDisplay() {
    this.goalEl = document.createElement('div');
    this.goalEl.style.cssText =
      'position:fixed;top:12px;right:12px;z-index:10;color:#fff;' +
      'font-family:sans-serif;font-weight:900;font-size:32px;text-shadow:0 2px 8px #000';
    document.body.appendChild(this.goalEl);
  }

  createOverlays() {
    this.lostEl = document.createElement('div');
    this.lostEl.textContent = 'LOST';
    this.lostEl.style.cssText =
      'position:fixed;inset:0;z-index:20;display:none;place-items:center;' +
      'background:#000a;color:#ff5555;font-family:sans-serif;font-weight:900;font-size:80px';

    this.startEl = document.createElement('button');
    this.startEl.textContent = 'Start';
    this.startEl.style.cssText =
      'font-size:24px;font-weight:bold;padding:10px 28px;border:0;border-radius:10px;' +
      'background:#fff;color:#000;cursor:pointer';

    this.winEl = document.createElement('div');
    this.winEl.style.cssText =
      'position:fixed;inset:0;z-index:20;display:none;flex-direction:column;gap:20px;' +
      'align-items:center;justify-content:center;background:#000a;' +
      'color:#5dff8f;font-family:sans-serif;font-weight:900;text-align:center';

    const wtxt = document.createElement('div');
    wtxt.textContent = 'Congratulations! You have reached the next level';
    wtxt.style.cssText = 'font-size:48px;max-width:80%';

    this.wbtn = document.createElement('button');
    this.wbtn.textContent = 'Continue';
    this.wbtn.style.cssText =
      'font-size:24px;font-weight:bold;padding:10px 28px;border:0;border-radius:10px;' +
      'background:#fff;color:#000;cursor:pointer';

    this.winEl.append(wtxt, this.wbtn);
    this.lostEl.append(this.startEl);
    document.body.append(this.lostEl, this.winEl);
  }

  updateSpeed(kmh) {
    this.speedEl.textContent = `${kmh} KM/H`;
  }

  updateTime(seconds) {
    this.timerEl.textContent = `${Math.max(0, seconds).toFixed(1)} s`;
  }

  updateGoal(left) {
    this.goalEl.textContent = `Deliveries left : ${left}`;
  }

  showWin(onContinue) {
    this.winEl.style.display = 'flex';
    this.wbtn.onclick = onContinue;
  }

  showLose(onRestart) {
    this.lostEl.style.display = 'grid';
    this.startEl.onclick = onRestart;
  }

  hideWin() {
    this.winEl.style.display = 'none';
  }

  hideLose() {
    this.lostEl.style.display = 'none';
  }
}
