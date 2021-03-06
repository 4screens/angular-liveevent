'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var pkg = require('./package.json');
var path = require('path');
var semver = require('semver');
var sh = require('shelljs');

plugins.minimist = require('minimist')(process.argv.slice(2));

var PATH = {
  bower_components: 'bower_components',
  build: '.',
  define: 'typings',
  dist: 'release',
  source: 'src'
};
var FILES = PATH.source + '/**/*.ts';
var BANNER = path.join('.', PATH.source, 'header.txt');
var MAIN = 'liveevent.js';

gulp.task('bump', function() {
  var bump = plugins.util.env.bump || false;
  var incrementType = plugins.util.env.increment || 'patch';

  // Read about bitwise operators.
  if (!~['major', 'minor', 'patch'].indexOf(incrementType)) {
    throw new Error('You must provide a versioning type: major, minor or patch. We love you anyway! <3');
  }

  if (bump) {
    pkg.version = semver.inc(pkg.version, incrementType);
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
      return minor ? pkg[major][minor] : pkg[major];
    }))
    .pipe(gulp.dest(PATH.source));
});

gulp.task('build', ['header'], function() {
  var ts = gulp.src(FILES)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.typescript({
      target: 'ES5',

      // Combine all modules.
      out: 'output.js'
    }));

  return ts.js
    .pipe(plugins.concat(MAIN))
    .pipe(plugins.wrapper({
      header: '(function(angular) {\n',
      footer: '})(angular);'
    }))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(PATH.build));
});

gulp.task('minify', ['build'], function() {
  return gulp.src(path.join('.', PATH.build, MAIN))
    .pipe(plugins.sourcemaps.init({loadMaps: true}))
    .pipe(plugins.uglify({
      preserveComments: 'some'
    }))
    .pipe(plugins.rename({extname: '.min.js'}))
    .pipe(plugins.sourcemaps.write('.'))
    .pipe(gulp.dest(PATH.build));
});

gulp.task('publish', ['minify'], function() {
  gulp.watch(FILES, ['publish::copy']);
});

gulp.task('publish::copy', ['tslint'], function() {
  return gulp.src([MAIN, MAIN + '.map'])
    .pipe(gulp.dest(plugins.minimist.path || '../4screens-suros/app/bower_components/4screens-liveevent/'));
});

gulp.task('develop', ['tslint'], function() {
  gulp.watch(FILES, ['tslint']);
});

gulp.task('tslint', ['minify'], function () {
  return gulp.src(FILES)
    .pipe(plugins.tslint())
    .pipe(plugins.tslint.report('verbose'));
});

gulp.task('release::bump::commit', ['tslint'], function() {
  if (plugins.util.env.bump) {
    return gulp.src(['./bower.json', './package.json'])
      .pipe(plugins.git.add())
      .pipe(plugins.git.commit('chore(release): Bump version.'));
  }
});

gulp.task('release::bump::push', ['release::bump::commit'], function(done) {
  if (plugins.util.env.bump) {
    return plugins.git.push('origin', 'master', done);
  }
});

gulp.task('release::dist::cleanup', function() {
  sh.rm('-rf', path.join('.', PATH.dist));
});

gulp.task('release::dist::clone', ['release::dist::cleanup'], function(done) {
  return plugins.git.clone(pkg.repository.url, {args: PATH.dist}, function () {
    plugins.git.checkout('release', {cwd: PATH.dist}, done);
  });
});

gulp.task('release::dist::commit', ['release::dist::clone', 'tslint'], function() {
  var diff = MAIN.split('.')[0] + '*';
  sh.cp('-rf', diff, path.join('.', PATH.dist));

  return gulp.src(path.join('.', PATH.dist, diff))
    .pipe(plugins.git.add({cwd: PATH.dist}))
    .pipe(plugins.git.commit('feat(release): New build files.', {cwd: PATH.dist}));
});

gulp.task('release::dist::push', ['release::dist::commit'], function(done) {
  return plugins.git.push('origin', 'release', {cwd: PATH.dist}, done);
});

gulp.task('release::dist::tag', ['release::dist::push'], function(done) {
  return plugins.git.tag('v' + pkg.version, 'v' + pkg.version, {cwd: PATH.dist}, function(err) {
    if (err) {
      throw err;
    }

    plugins.git.push('origin', 'refs/tags/v' + pkg.version, {cwd: PATH.dist}, done);
  });
});

gulp.task('release', ['release::bump::push', 'release::dist::tag']);
