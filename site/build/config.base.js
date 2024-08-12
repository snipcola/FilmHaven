const { DefinePlugin } = require("webpack");
const { src, dist } = require("./paths.js");

const path = require("path");
const childProcess = require("child_process");

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

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");

module.exports = {
  entry: {
    main: path.resolve(src, "scripts", "main.js"),
    styles: path.resolve(src, "styles", "main.css"),
    manifest: path.resolve(src, "manifest.json"),
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
      {
        test: /\.(woff|woff2|eot|ttf|otf|png|jpg|jpeg|gif|svg|json)$/i,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    minimizer: ["...", new CssMinimizerPlugin(), new JsonMinimizerPlugin()],
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
      __GIT_COMMIT_HASH__: JSON.stringify(gitCommitHash),
    }),
  ],
};
