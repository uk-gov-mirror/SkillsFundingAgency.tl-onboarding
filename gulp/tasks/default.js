const { src } = require('gulp');

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    minify = require('gulp-minify'),
    sass = require('gulp-sass'),
    wait = require('gulp-wait'),
    watch = require('gulp-watch');

const paths = require('../paths.json');
const sassOptions = require('../sassOptions.js');

gulp.task('assets', () => {
    return src([
        'node_modules/govuk-frontend/govuk/assets/**/*',
        (paths.src.Assets)
    ])
        .pipe(gulp.dest(paths.dist.Assets));
});

gulp.task('js', () => {
    return src([
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/govuk-frontend/govuk/all.js',
        (paths.src.JS)
    ])
        .pipe(concat('script.js'))
        .pipe(gulp.dest(paths.dist.JS));
});

gulp.task('sass', () => {
        return src(paths.src.SCSS)
            .pipe(wait(200))
            .pipe(sass(sassOptions))
            .pipe(gulp.dest(paths.dist.CSS));
});

gulp.task('templates', () => {
    return src([
        (paths.src.Templates)
    ])
        .pipe(gulp.dest(paths.dist.Templates));
});