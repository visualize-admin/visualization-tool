export class Timer {
  private _operationName = "";
  private _start = 0;
  private _end = 0;

  constructor() {}

  public start(operationName: string) {
    this._operationName = operationName;
    this._start = Date.now();
  }

  public stop() {
    this._end = Date.now();
    console.log(`${this._operationName}: ${this._end - this._start}ms`);
  }
}
