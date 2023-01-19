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
