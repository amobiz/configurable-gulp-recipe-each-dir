'use strict';

var helper = require('gulp-ccr-stream-helper')('each-dir');

var schema = {
	title: 'eachdir',
	description: "Iterates each sub directories and pass as 'config.dir' context to sub tasks.",
	properties: {
		src: {
			description: 'The directory path to iterate its sub directories.',
			type: 'glob',
			properties: {
				join: {
					type: ['string', 'boolean'],
					default: 'src'
				}
			}
		}
	},
	required: ['src']
};

var expose = ['dir', 'path'];

function eachdir() {
	// lazy loading required modules.
	var fs = require('fs');
	var Path = require('path');
	var globby = require('globby');
	var log = require('gulplog');
	var each = require('gulp-ccr-each');
	var verify = require('gulp-ccr-config-helper');

	var gulp = gulp;
	var config = this.config;
	var tasks = this.tasks;

	var context, cwd, folders, values, dirs;

	helper.prerequisite(this, false, 1);
	verify(eachdir.schema, config);

	dirs = config.src.globs[0];
	cwd = process.cwd();
	folders = getFolders(dirs, config.src.options);
	if (folders.length === 0) {
		log.warn('each-dir', 'no sub directories found in ' + dirs);
	}

	values = folders.map(function (folder) {
		return {
			parent: dirs,
			dir: folder,
			path: Path.join(cwd, dirs, folder)
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

	function getFolders(globs, options) {
		return globby.sync(globs, options || {})
			.filter(isDirectory)
			.reduce(function (ret, path) {
				try {
					return ret.concat(fs.readdirSync(path).filter(function (file) {
						return isDirectory(Path.join(path, file));
					}));
				} catch (ex) {
					return ret;
				}
			}, []);

		function isDirectory(path) {
			try {
				return fs.statSync(path).isDirectory();
			} catch (ex) {
				return false;
			}
		}

	}
}

module.exports = eachdir;
module.exports.expose = expose;
module.exports.schema = schema;
module.exports.type = 'stream';
