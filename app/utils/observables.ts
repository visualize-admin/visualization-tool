class Observable {
  private observers: Function[];

  constructor() {
    this.observers = [];
  }

  public subscribe(fn: Function) {
    this.observers.push(fn);
  }

  public unsubscribe(fn: Function) {
    this.observers = this.observers.filter((d) => d !== fn);
  }

  protected notify() {
    this.observers.forEach((d) => d());
  }
}

/** Observable timeline which encloses animation state and logic. */
export class Timeline extends Observable {
  public playing = false;
  public progress = 0;
  private requestId: number | undefined;
  // TODO: make this adjustable.
  private duration = 10000;
  private t: number | undefined;

  constructor() {
    super();
  }

  public start() {
    if (!this.playing) {
      if (this.progress === 1) {
        this.setProgress(0);
      }

      this.playing = true;
      this.requestId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  private animate(t: number) {
    if (this.t === undefined) {
      this.t = t - this.progress * this.duration;
    }

    if (t - this.t > this.duration) {
      this.stop(false);
      this.setProgress(1);
    } else {
      const progress = (t - this.t) / this.duration;
      this.setProgress(progress);
      this.requestId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  public stop(notify = true) {
    if (this.playing) {
      this.playing = false;
      this.t = undefined;

      if (this.requestId) {
        cancelAnimationFrame(this.requestId);
        this.requestId = undefined;
      }

      if (notify) this.notify();
    }
  }

  public setProgress(progress: number) {
    this.progress = progress;
    this.notify();
  }
}
