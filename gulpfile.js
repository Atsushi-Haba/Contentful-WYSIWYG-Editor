var gulp = require("gulp");
var merge = require("merge-stream");
var del = require("del");
var serve = require("gulp-serve");
var rename = require("gulp-rename");
var inlinesource = require("gulp-inline-source");
var stylus = require("gulp-stylus");

const webpackStream = require("webpack-stream");
const webpack = require("webpack");

// webpackの設定ファイルの読み込み
const webpackConfig = require("./webpack.config");

var src = "src/**/";
var dependencies = [
  // '//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min.js',
  // 'node_modules/contentful-ui-extensions-sdk/dist/cf-extension.css',
  // 'node_modules/contentful-ui-extensions-sdk/dist/cf-extension-api.js',
];

gulp.task("stylus", function () {
  return gulp
    .src(src + "*.styl")
    .pipe(stylus())
    .pipe(gulp.dest("./dist"));
});

// Copy required dependencies into dist folder.
gulp.task(
  "build",
  gulp.series("stylus", function () {
    var filesStream = gulp.src(src + "!(*.styl)").pipe(gulp.dest("./dist"));

    var wpStream = webpackStream(webpackConfig, webpack).pipe(gulp.dest("./dist"));

    // var depsStream = gulp
    //   .src(dependencies, { allowEmpty: true })
    //   .pipe(gulp.dest("./dist/lib"));

    return merge(filesStream, wpStream);
    // return filesStream;
  })
);

// Serve dist folder on port 3000 for local development.
gulp.task(
  "serve",
  serve({
    root: "dist",
  })
);

// Serve and watch for changes so we don't have to run `gulp` after each change.
gulp.task(
  "watch",
  gulp.series("build", function () {
    gulp.start("serve");
    gulp.watch([src + "*", dependencies], function () {
      gulp.start(["build"]);
    });
  })
);

// Bundles the whole widget into one file which can be uploaded to Contentful.
gulp.task(
  "bundle",
  gulp.series("build", function () {
    return gulp
      .src("./dist/index.html")
      .pipe(rename("index.min.html"))
      .pipe(inlinesource())
      .pipe(gulp.dest("./dist"));
  })
);

gulp.task("clean", function () {
  return del(["./dist"]);
});

gulp.task(
  "default",
  gulp.series("build", function () {
    gulp.task("serve");
  })
);
