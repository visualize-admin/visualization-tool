const Source = require("./Source.js");
const View = require("./View.js");

class ViewBuilder {
  static fromDataset({ term, dataset, graph, source }) {
    const view = new View({ term, dataset, graph, source });
    view.updateEntities(new Source({ endpointUrl: "" })); // @TODO I send this to access the Source constructor. It's like this in the meantime because of circular dependency
    return { view };
  }
}

module.exports = {
  ViewBuilder,
};
