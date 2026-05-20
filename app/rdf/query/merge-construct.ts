import { Generator } from '@traqula/generator-sparql-1-1';
import { Parser } from '@traqula/parser-sparql-1-1';
import {
    AstFactory,
    AstTransformer,
    BasicGraphPattern,
    ContextDefinition,
    PatternGroup,
    QueryConstruct,
    SparqlQuery
} from '@traqula/rules-sparql-1-1';

const parser = new Parser();
const generator = new Generator();
const F = new AstFactory();
const transformer = new AstTransformer();

/**
 * Merges multiple SPARQL CONSTRUCT queries into a single unified query.
 * 
 * **Features:**
 * - Translates and isolates variables across queries to prevent unintended cross-query variable bindings.
 * - Pools and safely maps matching `PREFIX` references into a uniform collection.
 * - Extracts `CONSTRUCT` triples and concatenates them within a single master dataset.
 * - Gathers unlinked `WHERE` logic graphs into a generalized combined graphical pattern.
 * 
 * **Throws:**
 * - `Error` if any query is invalid SPARQL syntax and fails to parse.
 * - `Error` if a query is not a \`CONSTRUCT\` query (e.g., \`SELECT\` or \`ASK\`).
 * - `Error` if prefix keys collide with different underlying URIs.
 * 
 * @param queries An array of SPARQL CONSTRUCT query strings.
 * @returns A synthesized single SPARQL CONSTRUCT query string.
 */
export function mergeConstructQueries(queries: string[]): string {
    const mergedAsts = queries.map((query, index) => {
        let ast: SparqlQuery;
        try {
            ast = parser.parse(query);
        } catch (error: any) {
            console.log(query);
            throw new Error(`Failed to parse query at index ${index}: ${error.message} Query: ${query}`);
        }

        if (ast.type !== 'query' || ast.subType !== 'construct') {
            throw new Error(`Query at index ${index} is not a SPARQL CONSTRUCT query. Type provided: ${ast.type}/${ast.subType}`);
        }

        // Rename variables
        const transformedAst = transformer.transformNodeSpecific<'unsafe', SparqlQuery>(ast, {}, {
            term: {
                variable: {
                    transform: (variable) => {
                        return F.termVariable(`${index}_${variable.value}`, F.gen());
                    }
                }
            },
            pattern: {
                values: {
                    transform: (copy) => {
                        copy.values = copy.values.map((row) => {
                            const newRow: typeof row = {};
                            for (const [k, v] of Object.entries(row)) {
                                newRow[`${index}_${k}`] = v;
                            }
                            return newRow;
                        });
                        return copy;
                    }
                }
            }
        });

        return transformedAst as QueryConstruct;
    });

    const prefixMap = new Map<string, string>();
    const contextDefs: ContextDefinition[] = [];
    const templateTriples: BasicGraphPattern = [];
    const wherePatterns: PatternGroup[] = [];

    for (let i = 0; i < mergedAsts.length; i++) {
        const ast = mergedAsts[i];

        // 1. Merge contexts (prefixes)
        if (ast.context) {
            for (const ctx of ast.context) {
                if (ctx.subType === 'prefix') {
                    // Check for conflicts
                    const existingUri = prefixMap.get(ctx.key);
                    if (existingUri && existingUri !== ctx.value.value) {
                        throw new Error(`Prefix mismatch detected: prefix '${ctx.key}' is mapped to '${existingUri}' but query ${i} attempts to map it to '${ctx.value.value}'`);
                    }
                    if (!existingUri) {
                        prefixMap.set(ctx.key, ctx.value.value);
                        contextDefs.push(ctx);
                    }
                } else {
                    // Other context defs like 'base'
                    contextDefs.push(ctx);
                }
            }
        }

        // 2. Merge template triples
        if (ast.template?.subType === 'bgp') {
            templateTriples.push(...ast.template.triples);
        }

        // 3. Merge where patterns
        if (ast.where) {
            wherePatterns.push(ast.where);
        }
    }

    const mergedQueryAst: QueryConstruct = {
        type: "query",
        subType: "construct",
        context: contextDefs,
        template: {
            type: "pattern",
            subType: "bgp",
            triples: templateTriples,
            loc: F.gen()
        },
        // Combine all WHERE group graph patterns into one main group using UNION
        where: {
            type: "pattern",
            subType: "group",
            patterns: wherePatterns.length > 1 ? [
                {
                    type: "pattern",
                    subType: "union",
                    patterns: wherePatterns,
                    loc: F.gen()
                }
            ] : wherePatterns,
            loc: F.gen()
        },
        solutionModifiers: {},
        datasets: {
            type: "datasetClauses",
            clauses: [],
            loc: F.gen()
        },
        loc: F.gen()
    };

    return generator.generate(mergedQueryAst);
}
