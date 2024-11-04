import { merge } from "webpack-merge";
import config from "./config.base.js";

export default merge(config, {
  mode: "production",
});
