import { api } from "@/server/nextkit";
import UserController from "@/server/user-controller";

const route = api({
  POST: UserController.createPalette,
});

export default route;
