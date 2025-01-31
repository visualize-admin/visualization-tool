import { api } from "@/server/nextkit";
import UserController from "@/server/user-controller";

const route = api({
  POST: UserController.createPalette,
  GET: UserController.getPalettes,
  DELETE: UserController.deletePalette,
  PUT: UserController.updatePalette,
});

export default route;
