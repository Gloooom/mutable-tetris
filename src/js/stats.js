import {timezoneOffset} from './utils';

export class Stats {
  constructor() {
    this.score = document.getElementById('score');
    this.timer = document.getElementById('timer');
    
    this.setScore(0);
    this.startTimer();
  }

  timeInterval = null;
  time = 0;
  startTime = Date.now();
  
  setScore(val) {
    this.score.innerHTML = `score - ${val}`;
  }
  
  setTime(val) {
    let date = new Date(val);
    this.timer.innerHTML = `time - ${date.getMinutes() + date.getHours()*60 + timezoneOffset}:${date.getSeconds()}`;
  }
  
  stopTimer() {
    clearInterval(this.timeInterval);
  }

  startTimer() {
    this.startTime = Date.now();
    this.setTime(0);

    this.timeInterval = setInterval(() => {
      this.time = Date.now() - this.startTime;
      this.setTime(this.time);
    }, 500);
  }

  reset() {
    this.startTime = Date.now();
    this.time = 0;
    this.setTime(this.time);
  }
}
