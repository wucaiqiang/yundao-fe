const PATH = require("path");

const webpack = require("webpack");

const nodeExternals = require("webpack-node-externals");

const ChunkManifestPlugin = require("webpack-manifest-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const ROOT = "../../../";

const APP_FOLDER = PATH.resolve(__dirname, ROOT, "app/");
const APP_ENTRY_FILE = PATH.resolve(__dirname, ROOT, APP_FOLDER, "client.js");
const APP_SERVER_FILE = PATH.resolve(__dirname, ROOT, APP_FOLDER, "server.js");

const BUILD_FOLDER = PATH.resolve(__dirname, ROOT, "app/public/js/");
const PUBLIC_PATH = "/assets/js/";

const BUILD_FILE = "app.[chunkhash:8].min.js";

const ESLINT_CONFIG_FILE = PATH.resolve(
  __dirname,
  ROOT,
  "tools/build/config/eslint-config.json"
);

var webpackClientConfig = {
  entry: {
    vendor: [
      "react",
      "react-dom",
      "react-router",
      "react-router-dom",
      "history"
    ],
    app: APP_ENTRY_FILE
  },
  output: {
    path: BUILD_FOLDER,
    publicPath: PUBLIC_PATH,
    filename: BUILD_FILE
  },
  devtool: "inline-source-map",
  bail: true,
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [APP_FOLDER],
        loader: "babel-loader",
        options: {
          presets: [
            "es2015",
            [
              "env",
              {
                modules: false
              }
            ],
            "stage-2",
            "react"
          ],
          plugins: [
            ["import", { libraryName: "antd", style: "css" }] // `style: true` for less
          ]
        }
      },
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                modules: true,
                localIdentName: "[local]___[hash:base64:5]"
              }
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: () => [require("autoprefixer")]
              }
            },
            "less-loader"
          ]
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader",
              options: {
                modules: true,
                localIdentName: "[local]___[hash:base64:5]"
              }
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: () => [require("autoprefixer")]
              }
            },
            "sass-loader"
          ]
        })
      },
      {
        test: /\.css$/,
        exclude: [PATH.resolve(__dirname, "node_modules/antd")],
        use: [
          "style-loader",
          {
            loader: "css-loader"
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [require("autoprefixer")]
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: "url-loader",
        options: {
          limit: 2000,
          name: "images/[name].[hash:6].[ext]"
        }
      },
      {
        test: /\.hbs$/,
        loader: "handlebars-loader"
      }
    ]
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      /Bundles.js/,
      "./AsyncBundles.js"
    ),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",

      filename: "vendor.[chunkhash:8].min.js",
      // (Give the chunk a different name)

      minChunks: 2
      // (use all children of the chunk)
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false
      }
    }),
    new HtmlWebpackPlugin({
      filename: `${APP_FOLDER}/templates/index.hbs`,
      template: `app/index.html`
    }),
    new ChunkManifestPlugin({
      filename: "manifest.json",
      manifestVariable: "webpackManifest",
      inlineManifest: false
    }),
    new ExtractTextPlugin({
      filename: "css/[name].[hash:6].css",
      allChunks: true
    })
  ]
};

module.exports = [webpackClientConfig];
