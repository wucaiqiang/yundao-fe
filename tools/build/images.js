const PATH = require('path');

const gulp = require('gulp');
var $ = require('gulp-load-plugins')();

const dist ='dist/assets'
const src ='app/public'

gulp.task('build:images', function () {
    return gulp
        .src(src+'/images/**/*')
        .pipe($.if('*.{png,jpg,svg}', $.cache($.imagemin({
            progressive: true,
            interlaced: true
        })))).pipe(gulp.dest(dist + '/images'))
});



gulp.task('build:js', function () {
    return gulp.src([src + '/js/**/*.js'])
        .pipe(gulp.dest(dist + '/js/'))
});