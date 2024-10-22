const { merge } = require("webpack-merge");

module.exports = merge(require("./config.base.js"), {
  mode: "production",
});
