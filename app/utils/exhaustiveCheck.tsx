export function exhaustiveCheck(_check: never, message: string): any {
  throw new Error(message);
}
