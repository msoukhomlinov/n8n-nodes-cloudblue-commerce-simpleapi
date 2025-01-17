const gulp = require('gulp');
const clean = require('rimraf');

// Clean dist folder
function cleanDist(cb) {
  clean.sync('./dist');
  cb();
}

// Copy credentials to dist
function copyCredentials() {
  return gulp.src('credentials/**/*').pipe(gulp.dest('dist/credentials'));
}

// Copy node files to dist (including icons and supporting folders)
function copyNodeFiles() {
  return gulp
    .src('src/nodes/CloudBlueCommerceSimpleApi/**/*', { base: 'src' })
    .pipe(gulp.dest('dist'));
}

// Move compiled files to correct locations and cleanup
function moveCompiledFiles() {
  return gulp
    .src('dist/src/nodes/CloudBlueCommerceSimpleApi/**/*.{js,js.map,json}', { base: 'dist/src' })
    .pipe(gulp.dest('dist'))
    .on('end', () => {
      clean.sync('dist/src');
    });
}

exports['copy:files'] = gulp.series(copyCredentials, copyNodeFiles);
exports.cleanDist = cleanDist;
exports.move = moveCompiledFiles;
exports.default = gulp.series(cleanDist, copyCredentials, copyNodeFiles, moveCompiledFiles);
