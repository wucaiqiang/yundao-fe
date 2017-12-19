const PATH = require("path");

const gulp = require("gulp");
const requireDir = require("require-dir");

var del = require("del");

requireDir("./tools/build", { recurse: false });

gulp.task("clean", function() {
  console.log("开始清理dist目录...")
  return del.sync("dist");
});

gulp.task("default", [
  "build:watch:scss",
  "build:watch:app",
  "lint:watch:app",
  "server"
]);
gulp.task("build:prod", [
  "clean",
  "build:images",
  "build:scss",
  "build:js",
  "lint:app"
]);
