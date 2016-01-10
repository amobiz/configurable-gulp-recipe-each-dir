'use strict';

var helper = require('gulp-ccr-stream-helper')('each-dir');

/**
 * Recipe:
 *
 * Ingredients:
 *
 * References:
 * 	Generating a file per folder
 * 	https://github.com/gulpjs/gulp/blob/master/docs/recipes/running-task-steps-per-folder.md
 *
 */
function eachdir() {
	// lazy loading required modules.
	var fs = require('fs');
	var Path = require('path');
	var log = require('gulplog');
	var each = require('gulp-ccr-each');
	var verify = require('gulp-ccr-config-helper');

	var gulp = gulp;
	var config = this.config;
	var tasks = this.tasks;

	var context, cwd, folders, values, dir;

	helper.prerequisite(this, false, 1);
	verify(eachdir.schema, config);

	dir = config.dir;
	cwd = process.cwd();
	folders = getFolders(dir);
	if (folders.length === 0) {
		log.warn('each-dir', 'no sub folders found in ' + dir);
	}

	values = folders.map(function (folder) {
		return {
			dir: folder,
			path: Path.join(cwd, dir, folder)
		};
	});

	context = {
		gulp: gulp,
		config: {
			values: values
		},
		tasks: tasks
	};
	return each.call(context);

	function getFolders(path) {
		try {
			return fs.readdirSync(path).filter(function (file) {
				return fs.statSync(Path.join(path, file)).isDirectory();
			});
		} catch (ex) {
			return [];
		}
	}
}

eachdir.expose = ['dir', 'path'];

eachdir.schema = {
	title: 'eachdir',
	description: 'Iterates each sub-folders and pass as `dir` property to child tasks.',
	properties: {
		dir: {
			description: '',
			type: 'path'
		}
	},
	required: ['dir']
};

eachdir.type = 'stream';

module.exports = eachdir;
