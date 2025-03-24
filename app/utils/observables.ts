import { ascending, bisect } from "d3-array";
import { scaleLinear } from "d3-scale";

import { AnimationType } from "@/config-types";

export abstract class Observable {
  private observers: Function[];

  constructor() {
    this.observers = [];
  }

  /** Used to keeping track of when to update the components using this. */
  abstract getUpdateKey: () => string;

  public subscribe = (fn: Function) => {
    this.observers.push(fn);

    return () => this.unsubscribe(fn);
  };

  public unsubscribe = (fn: Function) => {
    this.observers = this.observers.filter((d) => d !== fn);
  };

  protected notify = () => {
    this.observers.forEach((d) => d());
  };
}

export type TimelineProps =
  | {
      // Usual timeline based on the time dimension.
      type: "interval";
      animationType: AnimationType;
      msDuration: number;
      msValues: number[];
      formatValue: (d: number) => string;
    }
  | {
      // Special timeline for ordinal temporal dimensions,
      // where the values are not continuous.
      type: "ordinal";
      animationType: AnimationType;
      msDuration: number;
      sortedData: string[];
    };

/** Observable timeline which encloses animation state and logic. */
export class Timeline extends Observable {
  public type: "interval" | "ordinal";
  private animationType: AnimationType;

  // Animation state.
  public playing = false;
  /** Animation progress (0-1). */
  private animationProgress = 1;
  /** Duration of the animation in milliseconds. */
  private animationDuration: number;
  private requestAnimationFrameId: number | undefined;
  /** Timestamp set when animation beings. */
  private t: number | undefined;

  // Timeline state.
  private values: (number | string)[];
  /** Milliseconds mapped to a timeline. */
  private msValues: number[];
  /** Based on current progress. */
  private msValue: number;
  /** Min and max values of msValues. */
  private minMsValue: number;
  private maxMsValue: number;
  /** msValueScale(min value) = 0, msValueScale(max value) = 1 */
  private msValueScale = scaleLinear();
  /** msValues converted to relative values (0-1). */
  private msRelativeValues: number[];
  // Formatting utils (msValue => Date). Useful for rendering.
  private formatValue: (d: number) => string;
  private formattedMsExtent: [string, string];

  constructor(props: TimelineProps) {
    super();

    const { type, animationType, msDuration } = props;
    this.type = type;

    let formatValue: (d: number) => string;

    switch (props.type) {
      case "interval":
        formatValue = props.formatValue;
        this.msValues = props.msValues.sort(ascending);
        this.values = this.msValues;
        break;
      case "ordinal":
        formatValue = (d: number) => {
          return props.sortedData[Math.round(d / 1000)];
        };
        this.msValues = props.sortedData.map((_, i) => i * 1000);
        this.values = props.sortedData;
        break;
    }

    this.animationType = animationType;
    this.animationDuration = msDuration;
    const [min, max] = [
      this.msValues[0],
      this.msValues[this.msValues.length - 1],
    ];
    this.msValue = max;
    this.minMsValue = min;
    this.maxMsValue = max;
    this.msValueScale = this.msValueScale.range([min, max]);
    this.msRelativeValues = this.msValues.map(this.msValueScale.invert);
    this.formatValue = formatValue;
    this.formattedMsExtent = [min, max].map(formatValue) as [string, string];
  }

  public getUpdateKey = () => {
    return `${this.playing}_${this.progress}`;
  };

  public start = () => {
    if (!this.playing) {
      if (this.animationProgress === 1) {
        this.setProgress(0, true);
      }

      this.playing = true;
      this.requestAnimationFrameId = requestAnimationFrame(
        this.animate.bind(this)
      );
    }
  };

  private animate = (t: number) => {
    if (this.t === undefined) {
      this.t = t - this.animationProgress * this.animationDuration;
    }

    if (t - this.t > this.animationDuration) {
      this.stop(false);
      this.setProgress(1);
    } else {
      const progress = (t - this.t) / this.animationDuration;
      this.setProgress(progress, true);

      this.requestAnimationFrameId = requestAnimationFrame(
        this.animate.bind(this)
      );
    }
  };

  public stop = (notify = true) => {
    if (this.playing) {
      this.playing = false;
      this.t = undefined;

      if (this.requestAnimationFrameId) {
        cancelAnimationFrame(this.requestAnimationFrameId);
        this.requestAnimationFrameId = undefined;
      }

      if (notify) {
        this.notify();
      }
    }
  };

  /** Sets the animation progress and timeline value.
   *
   * For stepped type during the animation, the progress is calculated based on the
   * artificial division (equal time segments to jump between values) and does not
   * correspond to the actual progress of the slider.
   */
  public setProgress = (progress: number, triggeredByAnimation = false) => {
    let value: number;

    switch (this.animationType) {
      case "continuous":
        this.animationProgress = progress;
        value = progress;

        break;
      case "stepped":
        let i: number;

        if (triggeredByAnimation) {
          i = Math.floor(progress * this.msValues.length);
        } else {
          const msValue = Math.round(this.msValueScale(progress));
          i = bisect(this.msValues, msValue) - 1;
        }

        const msRelativeValue = this.msRelativeValues[i];
        this.animationProgress = i / (this.msValues.length - 1);
        value = msRelativeValue;

        break;
    }

    this.setValue(value);
    this.notify();
  };

  private setValue = (progress: number) => {
    const ms = Math.round(this.msValueScale(progress));
    const i = bisect(this.msValues, ms) - 1;
    this.msValue = this.msValues[i];
  };

  get domain() {
    return this.msRelativeValues;
  }

  get value() {
    return this.type === "interval"
      ? this.msValue
      : this.values[Math.round(this.msValue / 1000)];
  }

  get formattedValue() {
    return this.formatValue(this.msValue);
  }

  get formattedExtent() {
    return this.formattedMsExtent;
  }

  /** Timeline progress (0-1) (mapped to track background color of Slider). */
  get progress() {
    switch (this.animationType) {
      case "continuous":
        return this.animationProgress;
      case "stepped":
        return (
          (this.msValue - this.minMsValue) / (this.maxMsValue - this.minMsValue)
        );
    }
  }
}
