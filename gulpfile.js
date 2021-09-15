'use strict';

const { src, dest, task } = pkg;
import pkg from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import cssbeautify from 'gulp-cssbeautify';
import removeCSSComments from 'gulp-strip-css-comments';
import rename from 'gulp-rename';
import sass from 'gulp-dart-sass';
import cleancss from 'gulp-clean-css';
import rigger from 'gulp-rigger';
import uglify from 'gulp-uglify';
import plumber from 'gulp-plumber';
import imagemin from 'gulp-imagemin';
import del from 'del';
import panini from 'panini';
import browsersync from 'browser-sync';

/* Paths */
var path = {
  build: {
    html: 'build/',
    js: 'build/assets/js',
    css: 'build/assets/css',
    img: 'build/assets/img',
  },
  src: {
    html: 'src/*.html',
    js: 'src/assets/js/*.js',
    css: 'src/assets/sass/*.{scss,sass}',
    img: 'src/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico}',
  },
  watch: {
    html: 'src/**/*.{html,json}',
    js: 'src/assets/js/**/*.js',
    css: 'src/assets/sass/**/*.{scss,sass}',
    img: 'src/assets/img/**/*.{jpg,jpeg,png,svg,gif,ico}'
  },
  clean: './build'
};

/* Vendor paths */
var vendor = {
  build: {
    bootstrap_css: 'build/assets/vendor/bootstrap/css',
    bootstrap_js: 'build/assets/vendor/bootstrap/js',
    jquery: 'build/assets/vendor/jquery/'
  },
  src: {
    bootstrap_css: 'node_modules/bootstrap/dist/css/*.css',
    bootstrap_js: 'node_modules/bootstrap/dist/js/*.js',
    jquery: 'node_modules/jquery/dist/*.js'
  }
};

/* Options */
var options = {
  server: {
    server: { baseDir: './build/' },
    port: 3000
  },
  panini: {
    root: 'src/',
    layouts: 'src/templates/layouts/',
    partials: 'src/templates/partials/',
    helpers: 'src/templates/helpers/',
    data: 'src/templates/data/'
  },
  autoprefixer: {
    Browserslist: ['last 8 versions'],
    cascade: true
  },
  cssbeautify: {
    indent: "  ",
  },
  rename: {
    suffix: '.min'
  }
};

/* Tasks */
const browserSync = (done) => {
  browsersync.init(options.server);
  done();
}

const browserSyncReload = (done) => {
  browsersync.reload();
  done();
}

const bootstrap_css = () => {
  return src(vendor.src.bootstrap_css)
    .pipe(plumber())
    .pipe(dest(vendor.build.bootstrap_css));
}

const bootstrap_js = () => {
  return src(vendor.src.bootstrap_js)
    .pipe(plumber())
    .pipe(dest(vendor.build.bootstrap_js));
}

const jquery = () => {
  return src(vendor.src.jquery)
    .pipe(plumber())
    .pipe(dest(vendor.build.jquery));
}

const html = () => {
  panini.refresh();
  return src(path.src.html, { base: 'src/' })
    .pipe(plumber())
    .pipe(panini(options.panini))
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

const styles = () => {
  return src(path.src.css, { base: 'src/assets/sass' })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer(options.autoprefixer))
    .pipe(cssbeautify(options.cssbeautify))
    .pipe(dest(path.build.css))
    .pipe(cleancss())
    .pipe(removeCSSComments())
    .pipe(rename(options.rename))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

const scripts = () => {
  return src(path.src.js, { base: 'src/assets/js' })
    .pipe(plumber())
    .pipe(rigger())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(rename(options.rename))
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
}

const images = () => {
  return src(path.src.img, { base: 'src/assets/img' })
    .pipe(imagemin())
    .pipe(dest(path.build.img));
}

const clean = () => {
  return del(path.clean);
}

const watchFiles = () => {
  pkg.watch([path.watch.html], html);
  pkg.watch([path.watch.css], styles);
  pkg.watch([path.watch.js], scripts);
  pkg.watch([path.watch.img], images);
}

const vendors = pkg.parallel(bootstrap_css, bootstrap_js, jquery);
const build = pkg.series(clean, pkg.parallel(html, scripts, styles, images, vendors));
const watch = pkg.parallel(build, watchFiles, browserSync);

export default watch;
task('clean', clean);
task('build', build);
