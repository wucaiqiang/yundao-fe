const PATH = require('path');

const gulp = require('gulp');
const browserSync = require('browser-sync');

const ROOT = '../../';

const PUBLIC_FOLDER = PATH.resolve(__dirname, ROOT, 'app/public/');

const defaultConfig = PATH.resolve(__dirname, ROOT, 'config/default.json');

console.log(defaultConfig)

gulp.task('server', function() {
    browserSync.init({
        browser: [],
        notify: false,
        online: false,
        logConnections: true,
        files: [
           PUBLIC_FOLDER
        ]
        
    });

    browserSync.reload();
});