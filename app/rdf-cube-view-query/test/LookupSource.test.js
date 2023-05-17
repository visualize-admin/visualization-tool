const { strictEqual } = require("assert");
const { describe, it } = require("mocha");
const LookupSource = require("../lib/LookupSource");
const ns = require("./support/namespaces");
const Source = require("../lib/Source.js");

describe("LookupSource", () => {
  it("should be a constructor", () => {
    strictEqual(typeof LookupSource, "function");
  });

  describe(".fromSource", () => {
    it("should be a method", () => {
      strictEqual(typeof LookupSource.fromSource, "function");
    });

    it("should maintain queryPrefix", async () => {
      const source = new Source({
        endpointUrl: ns.ex.endpointUrl,
        queryPrefix: "Some prefix",
      });

      const lookupSource = LookupSource.fromSource(source);

      strictEqual(lookupSource.queryPrefix, "Some prefix");
    });
  });
});
