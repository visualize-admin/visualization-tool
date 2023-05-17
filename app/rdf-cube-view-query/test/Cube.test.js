const { strictEqual } = require("assert");
const rdfHandler = require("@rdfjs/express-handler");
const withServer = require("express-as-promise/withServer");
const upperFirst = require("lodash/upperFirst");
const { describe, it } = require("mocha");
const rdf = require("rdf-ext");
const cubesQuery = require("../lib/query/cubes");
const Cube = require("../lib/Cube");
const Source = require("../lib/Source");
const buildCube = require("./support/buildCube");
const { compareQuery } = require("./support/compareQuery");
const ns = require("./support/namespaces");

describe("Cube", () => {
  it("should be a constructor", () => {
    strictEqual(typeof Cube, "function");
  });

  describe("dimensions", () => {
    it("should be an array property", () => {
      const cube = buildCube();

      strictEqual(Array.isArray(cube.dimensions), true);
    });

    it("should contain all dimensions of the cube without rdf:type", () => {
      const cube = buildCube({
        dimensions: [
          {
            path: ns.ex.propertyA,
          },
          {
            path: ns.ex.propertyB,
          },
        ],
      });

      const dimensions = cube.dimensions;

      strictEqual(dimensions.length, 2);
      strictEqual(dimensions[0].path.equals(ns.ex.propertyA), true);
      strictEqual(dimensions[1].path.equals(ns.ex.propertyB), true);
    });
  });

  describe("fetchCube", () => {
    it("should be a method", () => {
      const cube = buildCube();

      strictEqual(typeof cube.fetchCube, "function");
    });

    it("should use a DESCRIBE query to fetch the cube data", async () => {
      await withServer(async (server) => {
        let query = null;

        server.app.get("/", rdfHandler(), (req, res) => {
          query = req.query.query;

          res.dataset(rdf.dataset());
        });

        const cube = buildCube({ endpointUrl: await server.listen() });

        await cube.fetchCube();

        strictEqual(typeof query, "string");
        strictEqual(query.includes("DESCRIBE"), true);
      });
    });

    it("should add the data from the endpoint to the dataset", async () => {
      await withServer(async (server) => {
        const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object);

        server.app.get("/", rdfHandler(), (req, res) => {
          res.dataset(rdf.dataset([quad]));
        });

        const cube = buildCube({ endpointUrl: await server.listen() });

        await cube.fetchCube();

        strictEqual(cube.ptr.dataset.size, 9);
        strictEqual(cube.ptr.dataset.has(quad), true);
      });
    });

    it("should add the data from the endpoint to the cleanup list", async () => {
      await withServer(async (server) => {
        const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object);

        server.app.get("/", rdfHandler(), (req, res) => {
          res.dataset(rdf.dataset([quad]));
        });

        const cube = buildCube({ endpointUrl: await server.listen() });

        await cube.fetchCube();

        strictEqual(cube.quads.length, 1);
        strictEqual(
          cube.quads.some((q) => quad.equals(q)),
          true
        );
      });
    });
  });

  describe("fetchShape", () => {
    it("should be a method", () => {
      const cube = buildCube();

      strictEqual(typeof cube.fetchShape, "function");
    });

    it("should use a DESCRIBE query to fetch the shape data", async () => {
      await withServer(async (server) => {
        let query = null;

        server.app.get("/", rdfHandler(), (req, res) => {
          query = req.query.query;

          res.dataset(rdf.dataset());
        });

        const cube = buildCube({ endpointUrl: await server.listen() });

        await cube.fetchShape();

        strictEqual(typeof query, "string");
        strictEqual(query.includes("DESCRIBE"), true);
      });
    });

    it("should add the data from the endpoint to the dataset", async () => {
      await withServer(async (server) => {
        const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object);

        server.app.get("/", rdfHandler(), (req, res) => {
          res.dataset(rdf.dataset([quad]));
        });

        const cube = buildCube({ endpointUrl: await server.listen() });

        await cube.fetchShape();

        strictEqual(cube.ptr.dataset.size, 9);
        strictEqual(cube.ptr.dataset.has(quad), true);
      });
    });

    it("should add the data from the endpoint to the cleanup list", async () => {
      await withServer(async (server) => {
        const quad = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object);

        server.app.get("/", rdfHandler(), (req, res) => {
          res.dataset(rdf.dataset([quad]));
        });

        const cube = buildCube({ endpointUrl: await server.listen() });

        await cube.fetchShape();

        strictEqual(cube.quads.length, 1);
        strictEqual(
          cube.quads.some((q) => quad.equals(q)),
          true
        );
      });
    });
  });

  describe("filter", () => {
    describe("isPartOf", () => {
      it("should be a function", () => {
        strictEqual(typeof Cube.filter.isPartOf, "function");
      });

      it("should create a patter in filter for schema:hasPart", async () => {
        const versionHistory = ns.ex.versionHistory;
        const query = cubesQuery({
          filters: [Cube.filter.isPartOf(versionHistory)],
        });

        await compareQuery({ name: "CubeFilterIsPartOf", query });
      });
    });

    describe("noExpires", () => {
      it("should be a function", () => {
        strictEqual(typeof Cube.filter.noExpires, "function");
      });

      it("should create a not exists filter for schema:expires", async () => {
        const query = cubesQuery({
          filters: [Cube.filter.noExpires()],
        });

        await compareQuery({ name: "CubeFilterNoExpires", query });
      });
    });

    describe("noValidThrough", () => {
      it("should be a function", () => {
        strictEqual(typeof Cube.filter.noValidThrough, "function");
      });

      it("should create a not exists filter for schema:validThrough", async () => {
        const query = cubesQuery({
          filters: [Cube.filter.noValidThrough()],
        });

        await compareQuery({ name: "CubeFilterNoValidThrough", query });
      });
    });

    describe("status", () => {
      it("should be a function", () => {
        strictEqual(typeof Cube.filter.status, "function");
      });

      it("should create an in filter for the given status value", async () => {
        const query = cubesQuery({
          filters: [Cube.filter.status(ns.ex.status)],
        });

        await compareQuery({ name: "CubeFilterStatusValue", query });
      });

      it("should create an in filter for the given status values", async () => {
        const query = cubesQuery({
          filters: [Cube.filter.status([ns.ex.status1, ns.ex.status2])],
        });

        await compareQuery({ name: "CubeFilterStatusValues", query });
      });
    });

    describe("version", () => {
      it("should be a function", () => {
        strictEqual(typeof Cube.filter.version, "function");
      });

      it("should create an eq filter for the given version", async () => {
        const query = cubesQuery({
          filters: [Cube.filter.version("2")],
        });

        await compareQuery({ name: "CubeFilterVersionEq", query });
      });

      const operations = ["eq", "ne", "lt", "gt", "lte", "gte"];

      for (const operation of operations) {
        describe(operation, () => {
          it("should be a function", () => {
            strictEqual(typeof Cube.filter.version[operation], "function");
          });

          it(`should create an ${operation} filter for the given version`, async () => {
            const query = cubesQuery({
              filters: [Cube.filter.version[operation]("2")],
            });

            await compareQuery({
              name: `CubeFilterVersion${upperFirst(operation)}`,
              query,
            });
          });
        });
      }
    });
  });

  describe("in", () => {
    it("should be a method", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });
      const cube = new Cube({ parent: source });

      strictEqual(typeof cube.in, "function");
    });

    it("should use clownface to search for triples pointing to the cube", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });
      const cube = new Cube({ parent: source });

      cube.ptr
        .addIn(ns.ex.predicate, ns.ex.up)
        .addOut(ns.ex.predicate, ns.ex.down);

      strictEqual(ns.ex.up.equals(cube.in(ns.ex.predicate).term), true);
    });
  });

  describe("out", () => {
    it("should be a method", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });
      const cube = new Cube({ parent: source });

      strictEqual(typeof cube.out, "function");
    });

    it("should use clownface to search for triples starting at the cube", () => {
      const source = new Source({ endpointUrl: ns.ex.endpoint });
      const cube = new Cube({ parent: source });

      cube.ptr
        .addIn(ns.ex.predicate, ns.ex.up)
        .addOut(ns.ex.predicate, ns.ex.down);

      strictEqual(ns.ex.down.equals(cube.out(ns.ex.predicate).term), true);
    });
  });
});
