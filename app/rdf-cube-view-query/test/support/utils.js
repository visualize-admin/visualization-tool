const { readFile } = require("fs").promises;
const { Parser } = require("n3");
const rdf = require("rdf-ext");
const clownface = require("clownface");
const { turtle } = require("@tpluscode/rdf-string");

function cleanQuery(query) {
  return query.replace(/\n/g, " ").replace(/ +/g, " ").trim();
}

async function queryFromTxt(name) {
  const filename = `test/support/${name}.query.txt`;
  const content = await readFile(filename);

  return cleanQuery(content.toString());
}

const parser = new Parser();

function parse(strings, ...values) {
  const dataset = rdf
    .dataset()
    .addAll(parser.parse(turtle(strings, ...values).toString()));
  return clownface({ dataset });
}

module.exports = {
  cleanQuery,
  queryFromTxt,
  parse,
};
