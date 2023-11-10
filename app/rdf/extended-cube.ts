import clownface, { AnyPointer } from "clownface";
import { Cube, CubeOptions } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import DatasetExt from "rdf-ext/lib/Dataset";

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
      this.shapeQuery()
    );
    this.dataset.addAll(shapeData);
    this.shapeDataset.addAll(shapeData);
    this.quads = [...this.quads, ...shapeData];
  }
}
