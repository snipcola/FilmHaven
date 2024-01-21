const path = require("path");
const { src } = require("./paths.js");

const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(require("./config.production.js"), {
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(src, "portable.pug"),
            filename: "FilmHaven.html",
            scriptLoading: "defer",
            inject: false
        })
    ],
    module: {
        rules: [
            {
                test: /\.pug$/,
                loader: "pug-loader"
            }
        ]
    }
});