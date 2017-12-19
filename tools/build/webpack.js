const PATH = require("path");

const gulp = require("gulp");
const gutil = require("gulp-util");

const webpack = require("webpack");

const ROOT = "../../";



const printReport = function(stats) {
  gutil.log(
    "[webpack]",
    stats.toString({
      modules: false,
      errorDetails: false,
      timings: false,
      cached: false,
      colors: true
    })
  );
};

gulp.task("build:dll", function(callback) {
  const DLL_CONFIG = PATH.resolve(
    __dirname,
    ROOT,
    "tools/build/config/webpack-config.dll.js"
  );
  const compiler = webpack(require(DLL_CONFIG));
  compiler.run(function(err, stats) {
    if (err) {
      gutil.log("error", new gutil.PluginError("[webpack]", err));
    }

    // printReport(stats);
    callback();
  });
});

gulp.task("build:app",["build:dll"], function(callback) {
  const WEBPACK_CONFIG = PATH.resolve(
    __dirname,
    ROOT,
    "tools/build/config/webpack-config.prod.babel.js"
  );
  
  const compiler = webpack(require(WEBPACK_CONFIG));
  compiler.run(function(err, stats) {
    if (err) {
      gutil.log("error", new gutil.PluginError("[webpack]", err));
    }

    printReport(stats);
    callback();
  });
});

gulp.task("build:watch:app",["build:dll"], function(callback) {
  const WEBPACK_CONFIG = PATH.resolve(
    __dirname,
    ROOT,
    "tools/build/config/webpack-config.prod.babel.js"
  );
  
  const compiler = webpack(require(WEBPACK_CONFIG));
  compiler.watch(
    {
      aggregateTimeout: 300
    },
    function(err, stats) {
      if (err) {
        gutil.log("error", new gutil.PluginError("[webpack]", err));
      }

      printReport(stats);
    }
  );

  callback();
});
