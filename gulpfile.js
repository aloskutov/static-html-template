"use strict";

const { src, dest } = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeCSSComments = require("gulp-strip-css-comments");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const cleancss = require("gulp-clean-css");
const rigger = require("gulp-rigger");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const del = require("del");
const panini = require("panini");
const browsersync = require("browser-sync").create();

/* Paths */
var path = {
  build: {
    html: "dist/",
    js: "dist/assets/js",
    css: "dist/assets/css",
    img: "dist/assets/img",
  },
  src: {
    html: "src/*.html",
    js: "src/assets/js/*.js",
    css: "src/assets/sass/*.{scss,sass}",
    img: "src/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico}",
  },
  watch: {
    html: "src/**/*.{html,json}",
    js: "src/assets/js/**/*.js",
    css: "src/assets/sass/**/*.{scss,sass}",
    img: "src/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico}"
  },
  clean: "./dist"
};
/* Vendor paths */
var vendor = {
  build: {
    bootstrap_css: "dist/assets/vendor/bootstrap/css",
    bootstrap_js: "dist/assets/vendor/bootstrap/js",
    jquery: "dist/assets/vendor/jquery/"
  },
  src: {
    bootstrap_css: "node_modules/bootstrap/dist/css/*.css",
    bootstrap_js: "node_modules/bootstrap/dist/js/*.js",
    jquery: "node_modules/jquery/dist/*.js"
  }
};

/* Tasks */
function browserSync(done) {
  browsersync.init({
    server: { baseDir: "./dist/" },
    port: 3000
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function bootstrap_css() {
  return src(vendor.src.bootstrap_css)
  .pipe(plumber())
  .pipe(dest(vendor.build.bootstrap_css));
}

function bootstrap_js() {
  return src(vendor.src.bootstrap_js)
  .pipe(plumber())
  .pipe(dest(vendor.build.bootstrap_js));
}

function jquery() {
  return src(vendor.src.jquery)
  .pipe(plumber())
  .pipe(dest(vendor.build.jquery));
}

function html() {
  panini.refresh();
  return src(path.src.html, { base: "src/" })
    .pipe(plumber())
    .pipe(panini({
      root: 'src/',
      layouts: 'src/templates/layouts/',
      partials: 'src/templates/partials/',
      helpers: 'src/templates/helpers/',
      data: 'src/templates/data/'
    }))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function styles() {
  return src(path.src.css, { base: "src/assets/sass" })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      Browserslist: ['last 8 versions'],
      cascade: true
    }))
    .pipe(cssbeautify())
    .pipe(dest(path.build.css))
    .pipe(cleancss())
    .pipe(removeCSSComments())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function scripts() {
  return src(path.src.js, { base: "src/assets/js" })
    .pipe(plumber())
    .pipe(rigger())
    .pipe(gulp.dest(path.build.js))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img, { base: "src/assets/img" })
    .pipe(imagemin())
    .pipe(dest(path.build.img));
}

function clean() {
  return del(path.clean);
}

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], styles);
  gulp.watch([path.watch.js], scripts);
  gulp.watch([path.watch.img], images);
}

const vendors = gulp.parallel(bootstrap_css, bootstrap_js, jquery);
const build = gulp.series(clean, gulp.parallel(html, scripts, styles, images, vendors));
const watch = gulp.parallel(build, watchFiles, browserSync);

/* Exports */
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;

exports.bootstrap_css = bootstrap_css;
exports.bootstrap_css = bootstrap_js;
exports.jquery = jquery;
exports.vendors = vendors;

exports.watchFiles = watchFiles;
exports.browserSync = browserSync;
exports.browserSyncReload = browserSyncReload;