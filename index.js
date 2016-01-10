'use strict';

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
function eachdir(done) {
	// lazy loading required modules.
	var fs = require('fs');
	var Path = require('path');
	var each = require('gulp-ccr-each');

	var verify = require('gulp-ccr-helper').verifyConfiguration;
	var PluginError = require('gulp-util').PluginError;

	var gulp = gulp;
	var config = this.config;

	var context, cwd, folders, values, dir;

	if (this.upstream) {
		throw new PluginError('each-dir', 'each-dir stream-processor do not accept up-stream');
	}
	verify(eachdir.schema, config);

	dir = config.dir;
	cwd = process.cwd();
	folders = getFolders(dir);
	if (folders.length === 0) {
		throw new PluginError('eachdir', 'no sub folders found in ' + dir);
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
		}
	};
	return each.call(context, done);

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
