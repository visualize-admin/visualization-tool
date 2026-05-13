import { CubeDimension } from "rdf-cube-view-query";

import { FilterValueMultiValues } from "@/config-types";
import { parseDimensionDatatype } from "@/rdf/parse";
import { dimensionIsVersioned } from "@/rdf/queries";

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

    /**
     * Converts the filter to a SPARQL filter string. Provide variable names without ? or $ for the variables in the filter.
     * 
     * @param observationVar The SPARQL Variable name for the observation
     * @param valueVar The SPARQL Variable name for the value of the filter
     */
    abstract toSparqlFilter(observationVar: string, valueVar: string): string;

    isLiteralFilter(): boolean {
        const dataType = parseDimensionDatatype(this.dimension);
        return dataType.dataType !== undefined;
    }

    protected isVersionedDimension(): boolean {
        return this.dimension ? dimensionIsVersioned(this.dimension) : false;
    }


}

/**
 * Represents a single value filter on a cube dimension.
 * 
 */
export class CubeSingleFilter extends CubeFilter {
    private _value: string | number;
    public filterType = CubeDimensionFilterType.single;

    constructor(dimension: CubeDimension, singleFilterValue: string | number) {
        super(dimension);
        this._value = singleFilterValue;
    }

    /**
     * Converts the filter to a SPARQL filter string. Provide variable names without ? or $ for the variables in the filter.
     * 
     * @param observationVar The SPARQL Variable name for the observation
     * @param valueVar The SPARQL Variable name for the value of the filter
     * @returns The SPARQL filter string
     */
    toSparqlFilter(observationVar: string, valueVar: string): string {
        const isLiteral = this.isLiteralFilter();
        const isVersioned = this.isVersionedDimension();


        if (isLiteral && isVersioned) {
            return `
            ?${valueVar} schema:sameAs ?${valueVar}_unversioned  .
            ?${observationVar} <${this.dimension.path?.value}> ?${valueVar} .
            FILTER( STR(?${valueVar}_unversioned ) = "${this._value}" )`;
        }
        if (isLiteral && !isVersioned) {
            return `
            ?${observationVar} <${this.dimension.path?.value}> ?${valueVar} .
            FILTER( STR(?${valueVar} ) = "${this._value}" )`;
        }
        if (!isLiteral && isVersioned) {
            return `
            ?${valueVar} schema:sameAs <${this._value}>  .
            ?${observationVar} <${this.dimension.path?.value}> ?${valueVar} .
            `;
        }
        if (!isLiteral && !isVersioned) {
            return `
            ?${observationVar} <${this.dimension.path?.value}> <${this._value}> .
            `
        }
        // fallback, should never happen
        return '';
    }

    get value() {
        return this._value;
    }

    get type() {
        return "single" as const;
    }
}

/**
 * Represents a multi-value filter on a cube dimension.
 * 
 */
export class CubeMultiFilter extends CubeFilter {
    private _multiFilter: FilterValueMultiValues;
    public filterType = CubeDimensionFilterType.multi;

    constructor(dimension: CubeDimension, multFilter: FilterValueMultiValues) {
        super(dimension);
        this._multiFilter = multFilter;
    }

    /**
    * Converts the filter to a SPARQL filter string. Provide variable names without ? or $ for the variables in the filter.
    * 
    * @param observationVar The SPARQL Variable name for the observation
    * @param valueVar The SPARQL Variable name for the value of the filter
    * @returns The SPARQL filter string
    */
    toSparqlFilter(observationVar: string, valueVar: string): string {
        const isLiteral = this.isLiteralFilter();
        const isVersioned = this.isVersionedDimension();

        if (isLiteral && isVersioned) {
            // dont think this case is actually possible, 
            console.warn('Tell me if you see this: dimension:', this.dimension.ptr.value, 'filter:', this._multiFilter);
            return `
            ?${valueVar} schema:sameAs ?${valueVar}_unversioned  .
            ?${observationVar} <${this.dimension.path?.value}> ?${valueVar} .
            FILTER( STR(?${valueVar}_unversioned) IN (${Object.keys(this._multiFilter).map(value => `"${value}"`).join(", ")} ) )`;
        }
        if (isLiteral && !isVersioned) {
            return `
            ?${observationVar} <${this.dimension.path?.value}> ?${valueVar} .
            FILTER( STR(?${valueVar}) IN (${Object.keys(this._multiFilter).map(value => `"${value}"`).join(", ")} ) )`;
        }
        if (!isLiteral && isVersioned) {
            const valuesString = Object.keys(this._multiFilter).map(x => `<${x}>`).join("\n");

            return `
            VALUES ?${valueVar}_unversioned {
                ${valuesString}
            } 
            ?${valueVar} schema:sameAs ?${valueVar}_unversioned  .
            ?${observationVar} <${this.dimension.path?.value}> ?${valueVar} .
            `;
        }
        if (!isLiteral && !isVersioned) {
            const valuesString = Object.keys(this._multiFilter).map(x => `<${x}>`).join("\n");

            return `
            VALUES ?${valueVar} {
                ${valuesString}
            }
            ?${observationVar} <${this.dimension.path?.value}> ?${valueVar} .
            `;
        }
        console.warn('Tell me if you see this: dimension:', this.dimension.ptr.value);
        return '';
    }

}
