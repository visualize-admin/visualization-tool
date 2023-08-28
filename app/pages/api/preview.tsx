import ReactDOMServer from "react-dom/server";

import { api } from "../../server/nextkit";
import Preview from "../preview";

const route = api({
  POST: async ({ req }) => {
    const state = JSON.parse(req.body);

    try {
      return ReactDOMServer.renderToString(<Preview state={state} />);
    } catch (e) {
      console.error(e);
    }
  },
});

export default route;
