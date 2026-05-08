import { CubeDimension } from "rdf-cube-view-query";

import { FilterValueMultiValues } from "@/config-types";

export enum CubeDimensionFilterType {
    single = "single",
    multi = "multi"
}

export abstract class CubeFilter {
    public dimension: CubeDimension;

    constructor(dimension: CubeDimension) {
        this.dimension = dimension;
    }

    abstract filterType: CubeDimensionFilterType;

    abstract toSparqlFilter(sparqlValibaleName: string): string;

    isLiteralFilter(): boolean {
        return this.dimension.datatype !== undefined;
    }

}

export class CubeSingleFilter extends CubeFilter {
    private _value: string | number;
    public filterType = CubeDimensionFilterType.single;

    constructor(dimension: CubeDimension, singleFilterValue: string | number) {
        super(dimension);
        this._value = singleFilterValue;
    }

    toSparqlFilter(sparqlValibaleName: string): string {
        if (this.isLiteralFilter()) {
            return `?observation <${this.dimension.path?.value}> ?${sparqlValibaleName} .
            FILTER( STR(?${sparqlValibaleName} ) = "${this._value}" )`;
        }
        return `?observation <${this.dimension.path?.value}> <${this._value}> .`
    }

    get value() {
        return this._value;
    }

    get type() {
        return "single" as const;
    }

}

export class CubeMultiFilter extends CubeFilter {
    private _multiFilter: FilterValueMultiValues;
    public filterType = CubeDimensionFilterType.multi;

    constructor(dimension: CubeDimension, multFilter: FilterValueMultiValues) {
        super(dimension);
        this._multiFilter = multFilter;
    }

    toSparqlFilter(sparqlValibaleName: string): string {
        if (this.isLiteralFilter()) {
            const somethning = this._multiFilter.values;

            return 'adfad';
        }
        const valuesString = Object.keys(this._multiFilter).map(x => `<${x}>`).join("\n");
        return `VALUES ?${sparqlValibaleName} {
            ${valuesString}
        } 
            ?observation <${this.dimension.path?.value}> ?${sparqlValibaleName} .`;
    }

}
