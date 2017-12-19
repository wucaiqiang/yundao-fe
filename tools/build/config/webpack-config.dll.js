const PATH = require("path");
const webpack = require("webpack");
const ROOT = "../../../";

const APP_FOLDER = PATH.resolve(__dirname, ROOT, "app/");

const HtmlWebpackPlugin = require("html-webpack-plugin");

// const BUILD_FOLDER = PATH.resolve(__dirname, ROOT, 'app/public/js/');
// const PUBLIC_PATH = '/assets/js/';

const DIST_FOLDER = PATH.resolve(__dirname, ROOT, "dist/");

const BUILD_FOLDER = PATH.resolve(__dirname, ROOT, DIST_FOLDER, "assets/js/");

const PUBLIC_PATH = "/assets/js/";

const BUILD_FILE = "[name].[chunkhash:8].min.js";

const webpackDLLConfig = {
  output: {
    path: BUILD_FOLDER,
    publicPath: PUBLIC_PATH,
    filename: BUILD_FILE,
    library: "[name]_[chunkhash:8]_dll"
  },
  entry: {
    vendor: [
      "react",
      "react-dom",
      "react-router",
      "react-router-dom",
      "history",
      "axios",
      "babel-polyfill",
      "antd",
      "moment",
    ]
  },
  plugins: [
    new webpack.DllPlugin({
      path: `${APP_FOLDER}/../tools/build/config/webpack.dll.manifest.json`,
      name: "[name]_[chunkhash:8]_dll",
      context: __dirname
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false
      }
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new HtmlWebpackPlugin({
      filename: `../../index.html`,
      template: `${APP_FOLDER}/index.client.html`
    })
  ]
};

module.exports = webpackDLLConfig;
