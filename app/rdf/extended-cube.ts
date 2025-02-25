import clownface, { AnyPointer } from "clownface";
import { Cube, CubeOptions } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import DatasetExt from "rdf-ext/lib/Dataset";

/** Extended `rdf-cube-view-query` Cube created to address some of the issues with
 * the original Cube class.
 *
 * The main with the original Cube is that it stores the shape in the same dataset
 * as the cube data. This means we can't distinguish between the two sources,
 * which is a problem when we want to query hierarchies (as they could be duplicated
 * in the shape and the data).
 *
 * ExtendedCube is envisioned to be enhanced with additional methods to support
 * e.g. querying hierarchies and preventing overfetching in the future.
 */
export class ExtendedCube extends Cube {
  private shapeDataset: DatasetExt;
  public shapePtr: AnyPointer;

  constructor(options: CubeOptions) {
    const { term = rdf.blankNode(), graph } = options;
    super(options);
    this.shapeDataset = rdf.dataset();
    this.shapePtr = clownface({
      term,
      dataset: this.shapeDataset,
      graph,
    });
  }

  async fetchShape() {
    const shapeData = await this.source.client.query.construct(
      this.shapeQuery(),
      { operation: "postUrlencoded" }
    );
    this.dataset.addAll(shapeData);
    this.shapeDataset.addAll(shapeData);
    this.quads = [...this.quads, ...shapeData];
  }
}
