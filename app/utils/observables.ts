import { ascending, bisect, scaleLinear } from "d3";

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
  /** Relative timeline progress (0-1). */
  public progress = 0;

  // Animation state.
  public playing = false;
  private duration = 10000;
  private requestAnimationFrameId: number | undefined;
  /** Timestamp set when animation beings. */
  private t: number | undefined;

  // Timeline state.
  /** Miliseconds mapped to a timeline. */
  private msValues: number[];
  /** Based on current progress. */
  private msValue: number;
  /** msValueScale(min value) = 0, msValueScale(max value) = 1 */
  private msValueScale = scaleLinear();
  /** msValues converted to relative values (0-1). */
  private msRelativeValues: number[];
  // Formatting utils (msValue => Date). Useful for rendering.
  private formatMsValue: (d: number) => string;
  private formattedMsExtent: [min: string, max: string];

  constructor(msValues: number[], formatMsValue: (d: number) => string) {
    super();

    this.msValues = msValues.sort(ascending);
    const [min, max] = [
      this.msValues[0],
      this.msValues[this.msValues.length - 1],
    ];
    this.msValue = min;
    this.msValueScale = this.msValueScale.range([min, max]);
    this.msRelativeValues = this.msValues.map(this.msValueScale.invert);
    this.formatMsValue = formatMsValue;
    this.formattedMsExtent = [min, max].map(formatMsValue) as [string, string];
  }

  public start() {
    if (!this.playing) {
      if (this.progress === 1) {
        this.setProgress(0);
      }

      this.playing = true;
      this.requestAnimationFrameId = requestAnimationFrame(
        this.animate.bind(this)
      );
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
      this.requestAnimationFrameId = requestAnimationFrame(
        this.animate.bind(this)
      );
    }
  }

  public stop(notify = true) {
    if (this.playing) {
      this.playing = false;
      this.t = undefined;

      if (this.requestAnimationFrameId) {
        cancelAnimationFrame(this.requestAnimationFrameId);
        this.requestAnimationFrameId = undefined;
      }

      if (notify) this.notify();
    }
  }

  public setProgress(progress: number) {
    this.progress = progress;
    this.setValue(progress);
    this.notify();
  }

  private setValue(progress: number) {
    const ms = Math.round(this.msValueScale(progress));
    const i = bisect(this.msValues, ms);

    this.msValue = this.msValues[i - 1];
  }

  get domain() {
    return this.msRelativeValues;
  }

  get value() {
    return this.msValue;
  }

  get formattedValue() {
    return this.formatMsValue(this.msValue);
  }

  get formattedExtent() {
    return this.formattedMsExtent;
  }
}
