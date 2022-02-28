import { wrap } from "./search";

describe("wrap ", () => {
  it("should be able to highlight given part of a string, given indices and open/close tags", () => {
    const example =
      "The science of operations, as derived from mathematics more especially, is a science of itself, and has its own abstract truth and value.";
    const indices = [
      [4, 10],
      [30, 36],
    ] as readonly [number, number][];
    const wrapped = wrap(example, indices, {
      tagOpen: "<b>",
      tagClose: "</b>",
    });
    expect(wrapped).toEqual(
      "The <b>science</b> of operations, as <b>derived</b> from mathematics more especially, is a science of itself, and has its own abstract truth and value."
    );
  });
});
