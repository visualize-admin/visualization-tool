import  "d3-selection"

declare module "d3-selection" {
  export function pointer(event: { clientX:number, clientY:number }, target?: Element): [number, number] {}
}
