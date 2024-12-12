import webpack from "webpack";
const { DefinePlugin } = webpack;

import { src, dist } from "./paths.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import RemoveEmptyScriptsPlugin from "webpack-remove-empty-scripts";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJSONPath = path.resolve(__dirname, "..", "package.json");
const { version } = JSON.parse(readFileSync(packageJSONPath, "utf8"));

export default {
  entry: {
    main: path.resolve(src, "scripts", "main.js"),
    styles: path.resolve(src, "styles", "main.css"),
  },
  output: {
    path: dist,
    filename: "[contenthash].js",
    publicPath: "",
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.pug$/,
        loader: "@webdiscus/pug-loader",
      },
    ],
  },
  optimization: {
    minimizer: ["...", new CssMinimizerPlugin()],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({ filename: "[contenthash].css" }),
    new HtmlWebpackPlugin({
      template: path.resolve(src, "html.pug"),
      filename: "index.html",
      scriptLoading: "defer",
      inject: false,
    }),
    new DefinePlugin({
      __VERSION__: JSON.stringify(version),
    }),
  ],
};
