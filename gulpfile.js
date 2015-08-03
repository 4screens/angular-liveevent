var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var pkg = require('./package.json');
var fs = require('fs');
var path = require('path');
var semver = require('semver');
var sh = require('shelljs');

var PATH = {
  bower_components: 'bower_components',
  source: 'src',
  test: 'test',
  define: 'typings'
};

var FILES = [
  path.join('.', PATH.source, 'header.ts'),

  path.join('.', PATH.source, 'app.ts'),
  path.join('.', PATH.source, 'bootstrap.ts'),
  path.join('.', PATH.source, 'extend.ts'),

  path.join('.', PATH.source, 'liveevent', 'liveevent.ts'),

  path.join('.', PATH.source, 'page', 'type', 'buzzer.ts'),
  path.join('.', PATH.source, 'page', 'type', 'poster.ts'),
];

var BANNER = path.join('.', PATH.source, 'header.txt');
var MAIN = path.join('.', 'liveevent.js');


gulp.task('bump', function() {
  var bump = plugins.util.env.bump || false;

  if (bump) {
    pkg.version = semver.inc(pkg.version, 'patch');
  }

  return gulp.src(['./bower.json', './package.json'])
    .pipe(plugins.if(bump, plugins.bump({
      version: pkg.version
    })))
    .pipe(gulp.dest('.'));
});

gulp.task('header', ['bump'], function() {
  return gulp.src(BANNER)
    .pipe(plugins.rename({extname: '.ts'}))
    .pipe(plugins.replace(/<%= pkg\.(\w+)\.?(\w+)? %>/g, function(chars, major, minor) {
      return minor?pkg[major][minor]:pkg[major];
    }))
    .pipe(gulp.dest(PATH.source));
});

gulp.task('build', ['header'], function() {
  var ts = gulp.src(FILES)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.typescript({
      target: 'ES5',
      declarationFiles: false
    }));

  return ts.js
    .pipe(plugins.concat(MAIN))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});

gulp.task('minify', ['build'], function() {
  return gulp.src(MAIN)
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.uglify({
      preserveComments: 'some'
    }))
    .pipe(plugins.rename({extname: '.min.js'}))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});

gulp.task('develop', ['minify'], function() {
  gulp.watch(FILES, ['minify']);
});

gulp.task('tslint', ['minify'], function () {
  return gulp.src(FILES)
    .pipe(plugins.tslint())
    .pipe(plugins.tslint.report('verbose'));
});
