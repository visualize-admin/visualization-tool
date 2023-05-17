const { strictEqual } = require("assert");
const { cleanQuery, queryFromTxt } = require("./utils");

async function compareQuery({ name, query }) {
  strictEqual(cleanQuery(query), await queryFromTxt(name));
}

module.exports = {
  compareQuery,
};
