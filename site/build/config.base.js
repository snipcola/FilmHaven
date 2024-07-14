const path = require("path");
const { src, dist } = require("./paths.js");

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
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
    new WebpackManifestPlugin({ fileName: "_manifest.json" }),
    new MiniCssExtractPlugin({ filename: "[contenthash].css" }),
    new HtmlWebpackPlugin({
      template: path.resolve(src, "html.pug"),
      filename: "index.html",
      scriptLoading: "defer",
      inject: false,
    }),
  ],
};
