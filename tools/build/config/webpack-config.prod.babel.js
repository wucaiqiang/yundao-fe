const PATH = require("path");
const webpack = require("webpack");
const HappyPack = require("happypack");
const autoprefixer = require("autoprefixer");

const ChunkManifestPlugin = require("webpack-manifest-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
// const ParallelUglifyPlugin = require("webpack-parallel-uglify-plugin");

const ROOT = "../../../";

const APP_FOLDER = PATH.resolve(__dirname, ROOT, "app/");
const DIST_FOLDER = PATH.resolve(__dirname, ROOT, "dist/");
const APP_ENTRY_FILE = PATH.resolve(__dirname, ROOT, APP_FOLDER, "client.js");

const BUILD_FOLDER = PATH.resolve(__dirname, ROOT, DIST_FOLDER, "assets/js/");
const PUBLIC_PATH = "/assets/js/";

const BUILD_FILE = "app.[chunkhash:8].min.js";

const ESLINT_CONFIG_FILE = PATH.resolve(
  __dirname,
  ROOT,
  "tools/build/config/eslint-config.json"
);

var webpackDevConfig = {
  context: DIST_FOLDER,
  entry: {
    app: [APP_ENTRY_FILE],
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
  output: {
    path: BUILD_FOLDER,
    publicPath: PUBLIC_PATH,
    filename: BUILD_FILE
  },
  bail: true,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [APP_FOLDER],
        exclude: /node_modules/,
        loaders: ["happypack/loader?id=jsx"]
      },
      {
        test: /\.less$/,
        loaders: ["happypack/loader?id=less"]
      },
      {
        test: /\.scss$/,
        loaders: ["happypack/loader?id=scss"]
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              minimize: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                autoprefixer({
                  browsers: ["> 1% in CN", "ie >=8", "Firefox >= 3"]
                })
              ]
            }
          }
        ]
      }
      // {
      //   test: /\.(png|jpg|gif|svg)$/,
      //   loaders: ["happypack/loader?id=img"]
      // },
      // {
      //   test: /\.hbs$/,
      //   loaders: ["happypack/loader?id=hbs"]
      // }
    ]
  },
  plugins: [
    // new webpack.DllReferencePlugin({
    //   context: __dirname,
    //   manifest: require("./webpack.dll.manifest.json")
    // }),
    new HappyPack({
      id: "jsx",
      threads: 3,
      loaders: [
        {
          loader: "babel-loader",
          exclude: /node_modules/,
          options: {
            cacheDirectory: ".webpack_cache",
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
              "transform-function-bind",
              // [
              //   "import",
              //   {
              //     libraryName: "antd",
              //     style: "css"
              //   }
              // ] // `style: true` for less
            ]
          }
        }
      ]
    }),
    new HappyPack({
      id: "scss",
      threads: 2,
      loaders: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            minimize: true,
            modules: true,
            localIdentName: "[local]___[hash:base64:5]"
          }
        },
        {
          loader: "postcss-loader",
          options: {
            plugins: () => [
              autoprefixer({
                browsers: ["> 1% in CN", "ie >=8", "Firefox >= 3"]
              })
            ]
          }
        },
        "sass-loader"
      ]
    }),
    // new HappyPack({
    //   id: "img",
    //   threads: 1,
    //   loaders: [
    //     {
    //       loader: "url-loader",
    //       options: {
    //         limit: 2000,
    //         name: "images/[name].[hash:6].[ext]"
    //       }
    //     }
    //   ]
    // }),
    // new HappyPack({
    //   id: "hbs",
    //   threads: 1,
    //   loaders: ["handlebars-loader"]
    // }),
    new webpack.NormalModuleReplacementPlugin(
      /Bundles.js/,
      "./AsyncBundles.js"
    ),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack
    .optimize
    .CommonsChunkPlugin({names: ["vendor"], minChunks: 2, filename: "[name].[chunkhash:8].min.js"}),
    new webpack.optimize.UglifyJsPlugin(),
    // new ParallelUglifyPlugin({
    //   cacheDir: ".cache/",
    //   uglifyJS: {
    //     output: {
    //       comments: false
    //     },
    //     compress: {
    //       warnings: false
    //     }
    //   }
    // }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new HtmlWebpackPlugin({
      filename: `../../index.html`,
      template: `${APP_FOLDER}/index.client.html`
      // template: `${DIST_FOLDER}/index.html`
    }),

    new ChunkManifestPlugin({
      filename: "manifest.json",
      manifestVariable: "webpackManifest",
      inlineManifest: false
    }),
    new ExtractTextPlugin({
      filename: "../css/[name].[hash:6].css",
      allChunks: true
    }),
    new BundleAnalyzerPlugin({
      // Can be `server`, `static` or `disabled`.
      // In `server` mode analyzer will start HTTP server to show bundle report.
      // In `static` mode single HTML file with bundle report will be generated.
      // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
      analyzerMode: "server",
      // Host that will be used in `server` mode to start HTTP server.
      analyzerHost: "127.0.0.1",
      // Port that will be used in `server` mode to start HTTP server.
      analyzerPort: 8888,
      // Path to bundle report file that will be generated in `static` mode.
      // Relative to bundles output directory.
      reportFilename: "report.html",
      // Module sizes to show in report by default.
      // Should be one of `stat`, `parsed` or `gzip`.
      // See "Definitions" section for more information.
      defaultSizes: "parsed",
      // Automatically open report in default browser
      openAnalyzer: true,
      // If `true`, Webpack Stats JSON file will be generated in bundles output directory
      generateStatsFile: false,
      // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
      // Relative to bundles output directory.
      statsFilename: "stats.json",
      // Options for `stats.toJson()` method.
      // For example you can exclude sources of your modules from stats file with `source: false` option.
      // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
      statsOptions: null,
      // Log level. Can be 'info', 'warn', 'error' or 'silent'.
      logLevel: "info"
    })
  ],
  resolve: {
    mainFields: ["jsnext:main", "main"],
    // modules: [PATH.resolve(__dirname, ROOT,'node_modules')],

    extensions: [".js", ".json", ".jsx"],
    alias: {
      lib: PATH.resolve(__dirname, ROOT, APP_FOLDER, "lib"),
      utils: PATH.resolve(__dirname, ROOT, APP_FOLDER, "utils"),
      base: PATH.resolve(__dirname, ROOT, APP_FOLDER, "base"),
      components: PATH.resolve(__dirname, ROOT, APP_FOLDER, "components"),
      services: PATH.resolve(__dirname, ROOT, APP_FOLDER, "services"),
      model: PATH.resolve(__dirname, ROOT, APP_FOLDER, "model"),
      const: PATH.resolve(__dirname, ROOT, APP_FOLDER, "const"),
      enum: PATH.resolve(__dirname, ROOT, APP_FOLDER, "enum")
    }
  },
  externals: {
    // "react": "React",
    // "react-dom": "ReactDOM",
    // "antd": "antd"
  },
  profile: true
  // stats: {
  //   // Configure the console output
  //   errorDetails: true, //this does show errors
  //   colors: true
  //   // modules: true,
  //   // reasons: true
  // }
};

module.exports = webpackDevConfig;
