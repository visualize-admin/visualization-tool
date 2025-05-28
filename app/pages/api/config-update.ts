import { ConfigController } from "@/server/config-controller";
import { api } from "@/server/nextkit";

const route = api({
  POST: ConfigController.update,
});

export default route;
