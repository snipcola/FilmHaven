import webpack from "webpack";
const { DefinePlugin } = webpack;

import { src, dist } from "./paths.js";

import path from "path";
import childProcess from "child_process";

let gitCommitHash;
const vercelGitCommitHash = process?.env?.VERCEL_GIT_COMMIT_SHA;

if (typeof vercelGitCommitHash === "string" && vercelGitCommitHash !== "") {
  gitCommitHash = vercelGitCommitHash.trim().substring(0, 7);
} else {
  try {
    gitCommitHash = childProcess
      .execSync("git rev-parse --short HEAD")
      .toString()
      .trim();
  } catch {}
}

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import RemoveEmptyScriptsPlugin from "webpack-remove-empty-scripts";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";

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
        loader: "pug-loader",
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
    ...(gitCommitHash
      ? [
          new DefinePlugin({
            __GIT_COMMIT_HASH__: JSON.stringify(gitCommitHash),
          }),
        ]
      : []),
  ],
};
