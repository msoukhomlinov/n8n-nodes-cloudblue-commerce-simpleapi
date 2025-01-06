const { src, dest } = require('gulp');

function copyIcons() {
  return src('src/nodes/CloudBlueConnectSimpleApi/*.png')
    .pipe(dest('dist/nodes/CloudBlueConnectSimpleApi/'));
}

function moveFiles() {
  // Move node files
  src('dist/src/nodes/**/*')
    .pipe(dest('dist/nodes/'))
    .on('end', () => {
      // Clean up src directory after moving
      require('rimraf').sync('dist/src');
    });
  return Promise.resolve();
}

exports.default = copyIcons;
exports['build:icons'] = copyIcons;
exports['move-files'] = moveFiles; 