const { strictEqual } = require("assert");
const { describe, it } = require("mocha");
const cubesQuery = require("../lib/query/cubes");
const cubesFilterQuery = require("../lib/query/cubesFilter");
const { compareQuery } = require("./support/compareQuery");
const ns = require("./support/namespaces");

describe("query/cubesFilter", () => {
  it("should be an object", () => {
    strictEqual(typeof cubesFilterQuery, "object");
  });

  describe("in", () => {
    it("should be a function", () => {
      strictEqual(typeof cubesFilterQuery.in, "function");
    });

    it("should create a triple pattern an in filter", async () => {
      const predicate = ns.ex.property;
      const values = [ns.ex.value1, ns.ex.value2];

      const query = cubesQuery({
        filters: [cubesFilterQuery.in(predicate, values)],
      });

      await compareQuery({ name: "cubesFilterIn", query });
    });
  });

  describe("notExists", () => {
    it("should be a function", () => {
      strictEqual(typeof cubesFilterQuery.notExists, "function");
    });

    it("should create not exists filter", async () => {
      const predicate = ns.ex.property;
      const value = ns.ex.value;

      const query = cubesQuery({
        filters: [cubesFilterQuery.notExists(predicate, value)],
      });

      await compareQuery({ name: "cubesFilterNotExists", query });
    });

    it("should create not exists filter with object variable if not value is given", async () => {
      const predicate = ns.ex.property;

      const query = cubesQuery({
        filters: [cubesFilterQuery.notExists(predicate)],
      });

      await compareQuery({ name: "cubesFilterNotExistsNoValue", query });
    });
  });

  describe("patternIn", () => {
    it("should be a function", () => {
      strictEqual(typeof cubesFilterQuery.patternIn, "function");
    });

    it("should add a triple pattern with the cube as object and the given predicate", async () => {
      const predicate = ns.ex.property;

      const query = cubesQuery({
        filters: [cubesFilterQuery.patternIn(predicate)],
      });

      await compareQuery({ name: "cubesFilterPatternIn", query });
    });

    it("should add a triple pattern with the cube as object and the give subject", async () => {
      const predicate = ns.ex.property;
      const subject = ns.ex.subject;

      const query = cubesQuery({
        filters: [cubesFilterQuery.patternIn(predicate, subject)],
      });

      await compareQuery({ name: "cubesFilterPatternInSubject", query });
    });
  });
});
