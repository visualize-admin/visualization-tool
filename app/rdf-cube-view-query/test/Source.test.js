const { strictEqual } = require("assert");
const rdfHandler = require("@rdfjs/express-handler");
const withServer = require("express-as-promise/withServer");
const { describe, it } = require("mocha");
const rdf = require("rdf-ext");
const Cube = require("../lib/Cube");
const View = require("../lib/View");
const Source = require("../lib/Source");
const ns = require("./support/namespaces");

describe("Source", () => {
  it("should be a constructor", () => {
    strictEqual(typeof Source, "function");
  });

  describe(".cube", () => {
    it("should be a method", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });

      strictEqual(typeof source.cube, "function");
    });

    it("should return an initialized cube", async () => {
      await withServer(async (server) => {
        let called = 0;

        server.app.get("/", rdfHandler(), (req, res) => {
          called++;

          res.dataset(
            rdf.dataset([rdf.quad(ns.ex.cube, ns.ex.predicate, ns.ex.object)])
          );
        });

        const source = new Source({ endpointUrl: await server.listen() });

        const result = await source.cube(ns.ex.cube);

        strictEqual(result instanceof Cube, true);
        strictEqual(called, 2);
      });
    });
  });

  describe(".cubes", () => {
    it("should be a method", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });

      strictEqual(typeof source.cubes, "function");
    });

    it("should return a list of initialized cubes", async () => {
      await withServer(async (server) => {
        let called = 0;

        server.app.get("/", rdfHandler(), (req, res) => {
          called++;

          const query = req.query.query;

          if (query.includes("SELECT")) {
            res.set("content-type", "application/sparql-results+json").json({
              results: {
                bindings: [
                  {
                    cube: { type: "uri", value: ns.ex.cube1.value },
                  },
                  {
                    cube: { type: "uri", value: ns.ex.cube2.value },
                  },
                ],
              },
            });
          } else {
            res.dataset(
              rdf.dataset([rdf.quad(ns.ex.cube, ns.ex.predicate, ns.ex.object)])
            );
          }
        });

        const source = new Source({ endpointUrl: await server.listen() });

        const result = await source.cubes();

        strictEqual(Array.isArray(result), true);
        strictEqual(result.length, 2);
        strictEqual(result[0] instanceof Cube, true);
        strictEqual(result[1] instanceof Cube, true);
        strictEqual(called, 5);
      });
    });

    it("should skip fetching the shape if noShape is true", async () => {
      await withServer(async (server) => {
        let called = 0;

        server.app.get("/", rdfHandler(), (req, res) => {
          called++;

          const query = req.query.query;

          if (query.includes("SELECT")) {
            res.set("content-type", "application/sparql-results+json").json({
              results: {
                bindings: [
                  {
                    cube: { type: "uri", value: ns.ex.cube1.value },
                  },
                  {
                    cube: { type: "uri", value: ns.ex.cube2.value },
                  },
                ],
              },
            });
          } else {
            res.dataset(
              rdf.dataset([rdf.quad(ns.ex.cube, ns.ex.predicate, ns.ex.object)])
            );
          }
        });

        const source = new Source({ endpointUrl: await server.listen() });

        await source.cubes({ noShape: true });

        strictEqual(called, 3);
      });
    });
  });

  describe(".cubesQuery", () => {
    it("should be a method", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });

      strictEqual(typeof source.cubesQuery, "function");
    });

    it("should return a select query", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });

      const result = source.cubesQuery();

      strictEqual(result.toString().includes("SELECT"), true);
    });
  });

  describe(".views", () => {
    it("should be a method", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });

      strictEqual(typeof source.views, "function");
    });

    it("should return a list of initialized views", async () => {
      await withServer(async (server) => {
        let called = 0;

        server.app.get("/", rdfHandler(), (req, res) => {
          called++;

          const query = req.query.query;

          if (query.includes("SELECT")) {
            res.set("content-type", "application/sparql-results+json").json({
              results: {
                bindings: [
                  {
                    cube: { type: "uri", value: ns.ex.view1.value },
                  },
                  {
                    cube: { type: "uri", value: ns.ex.view2.value },
                  },
                ],
              },
            });
          } else {
            res.dataset(
              rdf.dataset([rdf.quad(ns.ex.cube, ns.ex.predicate, ns.ex.object)])
            );
          }
        });

        const source = new Source({ endpointUrl: await server.listen() });

        const result = await source.views();

        strictEqual(Array.isArray(result), true);
        strictEqual(result.length, 2);
        strictEqual(result[0] instanceof View, true);
        strictEqual(result[1] instanceof View, true);
        strictEqual(called, 3);
      });
    });

    it("should skip fetching the shape if noShape is true", async () => {
      await withServer(async (server) => {
        let called = 0;

        server.app.get("/", rdfHandler(), (req, res) => {
          called++;

          const query = req.query.query;

          if (query.includes("SELECT")) {
            res.set("content-type", "application/sparql-results+json").json({
              results: {
                bindings: [
                  {
                    cube: { type: "uri", value: ns.ex.view1.value },
                  },
                  {
                    cube: { type: "uri", value: ns.ex.view2.value },
                  },
                ],
              },
            });
          } else {
            res.dataset(
              rdf.dataset([rdf.quad(ns.ex.cube, ns.ex.predicate, ns.ex.object)])
            );
          }
        });

        const source = new Source({ endpointUrl: await server.listen() });

        await source.views({ noShape: true });

        strictEqual(called, 3);
      });
    });
  });

  describe(".viewListQuery", () => {
    it("should be a method", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });

      strictEqual(typeof source.viewListQuery, "function");
    });

    it("should return a select query", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });

      const result = source.viewListQuery();

      strictEqual(result.toString().includes("SELECT"), true);
    });
  });
});
