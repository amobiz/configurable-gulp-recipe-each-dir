'use strict';

var helper = require('gulp-ccr-stream-helper')('each-dir');

var schema = {
	title: 'eachdir',
	description: "Iterates each sub directories and pass as 'config.dir' context to sub tasks.",
	properties: {
		dir: {
			description: 'The directory path to iterate its sub directories.',
			type: 'path',
			properties: {
				join: {
					type: ['string', 'boolean'],
					default: 'src'
				}
			}
		}
	},
	required: ['dir']
};

var expose = ['dir', 'path'];

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
		log.warn('each-dir', 'no sub directories found in ' + dir);
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

module.exports = eachdir;
module.exports.expose = expose;
module.exports.schema = schema;
module.exports.type = 'stream';
