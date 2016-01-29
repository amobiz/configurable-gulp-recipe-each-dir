# gulp-ccr-each-dir

Iterates each sub directories and pass to sub tasks. A cascading configurable gulp recipe for [gulp-chef](https://github.com/gulp-cookery/gulp-chef).

## Install

``` bash
$ npm install --save-dev gulp-chef gulp-ccr-each-dir
```

## Recipe

Stream Array (from [gulp-cheatsheet](https://github.com/osscafe/gulp-cheatsheet) p.2)

## Ingredients

* [merge-stream](https://github.com/grncdr/merge-stream)

* [each](https://github.com/gulp-cookery/gulp-ccr-each)

## Type

[Stream Processor](https://github.com/gulp-cookery/gulp-chef#writing-stream-processor)

## API

### config.dir

The directory path to iterate its sub directories. Inject "`config.dir`" and "`config.path`" context to sub tasks.

#### config.dir

The name of the sub directory.

#### config.path

The canonical path of the sub directory.

## Usage

``` javascript
var gulp = require('gulp');
var chef = require('gulp-chef');

var meals = chef({
    src: 'src/',
    dest: 'dist/',
    'each-dir': {
        dir: 'modules/',
        browserify: {
            bundle: {
                entry: 'index.js',
                file: '{{dir}}.js'
            }
         }
    }
});

gulp.registry(meals);
```

## References

* [Generating a file per folder](https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md)
