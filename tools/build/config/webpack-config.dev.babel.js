const PATH = require("path");

const webpack = require("webpack");
const HappyPack = require("happypack");
const nodeExternals = require("webpack-node-externals");

const ChunkManifestPlugin = require("webpack-manifest-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const autoprefixer = require("autoprefixer");

const es3ifyPlugin = require("es3ify-webpack-plugin");

const ROOT = "../../../";

const APP_FOLDER = PATH.resolve(__dirname, ROOT, "app/");
const DEV_FOLDER = PATH.resolve(__dirname, ROOT, "dev/");
const APP_ENTRY_FILE = PATH.resolve(__dirname, ROOT, APP_FOLDER, "client.js");
const APP_SERVER_FILE = PATH.resolve(__dirname, ROOT, APP_FOLDER, "server.js");
const NODE_MODULES = PATH.resolve(__dirname, ROOT, "node_modules/");
const BUILD_FOLDER = PATH.resolve(__dirname, ROOT, "app/public/js/");
const PUBLIC_PATH = "/assets/js/";

const BUILD_FILE = "app.[chunkhash:8].min.js";

const ESLINT_CONFIG_FILE = PATH.resolve(
  __dirname,
  ROOT,
  "tools/build/config/eslint-config.json"
);

var webpackDevConfig = {
  context: DEV_FOLDER,
  entry: {
    app: [
      "webpack-dev-server/client?http://localhost:3000",
      "webpack/hot/dev-server",
      APP_ENTRY_FILE
    ],
    vendor: [
      "react",
      "react-dom",
      "react-router",
      "react-router-dom",
      "history",
      "axios",
      "babel-polyfill"
    ]
  },
  output: {
    path: DEV_FOLDER,
    filename: "bundle.js",
    publicPath: "/static/"
  },
  devtool: "#eval-source-map",
  bail: true,
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: [APP_FOLDER],
        exclude: "/node_modules/",
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
              importLoaders: 3
              // modules: true,
              // localIdentName: "[local]___[hash:base64:5]",
            }
          },
          {
            loader: "postcss-loader"
            // options: {
            //   ident:'postcss-ident',
            //   plugins: () => [
            //     require('postcss-flexibility')(),
            //     require('postcss-cssnext')({
            //       browsers: ["> 1% in CN", "ie >=8", "Firefox >= 3"]
            //     }),
            //     require('cssnano')()
            //   ]
            // }
          }
        ]
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        loaders: ["happypack/loader?id=img"]
      },
      {
        test: /\.hbs$/,
        loaders: ["happypack/loader?id=hbs"]
      }
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    // new es3ifyPlugin(),
    new HappyPack({
      id: "jsx",
      threads: 4,
      loaders: [
        "react-hot-loader",
        {
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
              "transform-function-bind",
              [
                "import",
                {
                  libraryName: "antd",
                  style: "css"
                }
              ] // `style: true` for less
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
            importLoaders: 2,
            modules: true,
            autoprefixer: true,
            localIdentName: "[local]___[hash:base64:5]"
          }
        },
        {
          loader: "postcss-loader"
          // options: {
          //   ident:'postcss-ident',
          //   plugins: (loader) => [
          //     require('postcss-import')({ root: loader.resourcePath }),
          //     require('postcss-flexibility')(),
          //     require('postcss-cssnext')({
          //         browsers: ["> 1% in CN", "ie >=8", "Firefox >= 3"]
          //       }),

          //     require('cssnano')()
          //   ]
          // }
        },
        "sass-loader"
      ]
    }),
    new HappyPack({
      id: "less",
      threads: 2,
      loaders: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            importLoaders: 3,
            modules: true,
            localIdentName: "[local]___[hash:base64:5]"
          }
        },
        {
          loader: "postcss-loader"
          // options: {
          //   ident:'postcss-ident',
          //   plugins: () => [
          //     // autoprefixer({
          //     //   browsers: ["> 1% in CN", "ie >=8", "Firefox >= 3"]
          //     // }),
          //     require('postcss-flexibility')(),
          //     require('postcss-cssnext')({
          //       browsers: ["> 1% in CN", "ie >=8", "Firefox >= 3"]
          //     }),
          //     require('cssnano')()
          //   ]
          // }
        },
        "less-loader"
      ]
    }),
    new HappyPack({
      id: "img",
      threads: 2,
      loaders: [
        {
          loader: "url-loader",
          options: {
            limit: 2000,
            name: "images/[name].[hash:6].[ext]"
          }
        }
      ]
    }),
    new HappyPack({ id: "hbs", threads: 2, loaders: ["handlebars-loader"] }),
    new webpack.NormalModuleReplacementPlugin(
      /Bundles.js/,
      "./AsyncBundles.js"
    ),
    new webpack.optimize.CommonsChunkPlugin({
      names: ["vendor"],
      minChunks: 2,
      filename: "[name].js"
    }),

    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [autoprefixer()]
      }
    }),

    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //     drop_console: false
    //   }
    // }),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: `index.html`,
      template: `${APP_FOLDER}/index.html`
    }),
    new webpack.HotModuleReplacementPlugin(),
    new ChunkManifestPlugin({
      filename: "manifest.json",
      manifestVariable: "webpackManifest",
      inlineManifest: false
    }),
    new ExtractTextPlugin({
      filename: "css/[name].[hash:6].css",
      allChunks: true
    })
  ],
  resolve: {
    // root: PATH.resolve(__dirname, ROOT, APP_FOLDER),
    // modulesDirectories: ["node_modules"],
    extensions: [".js", ".json", ".jsx", "scss"],
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
    // "react": "React", "react-dom": "ReactDOM", "antd": "antd"
  },
  stats: {
    // Configure the console output
    errorDetails: true, //this does show errors
    colors: true
    // modules: true, reasons: true
  }
};

module.exports = webpackDevConfig;
