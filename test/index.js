/*global describe, it, before, after, beforeEach, afterEach, process */
/*jshint expr: true*/
'use strict';

var Sinon = require('sinon'),
	Chai = require('chai'),
	Promised = require("chai-as-promised"),
	expect = Chai.expect;

Chai.use(Promised);

var Stream = require('stream'),
	Readable = require('stream').Readable,
	Transform = require('stream').Transform,
	through = require('through2'),
	fs = require('fs'),
	_ = require('lodash'),
	PluginError = require('gulp-util').PluginError;

var base = process.cwd(),
	fixtures = base + '/test/_fixtures';
var eachdir = require('../');

var dirs = {
	'app': {
		'modules': {
			'directives': {
				'ngfor': {
					'ngfor.js': ''
				},
				'ngif': {
					'ngif.js': ''
				},
				'index.js': ''
			},
			'services': {
				'http': {
					'http.js': ''
				},
				'sqlite': {
					'sqlite.js': ''
				},
				'index.js': ''
			}
		},
		'views': {
			'about': {
				'about.css': '',
				'about.html': '',
				'about.js': ''
			},
			'auth': {
				'auth.css': '',
				'auth.html': '',
				'auth.js': ''
			},
			'main': {
				'main.css': '',
				'main.html': '',
				'main.js': ''
			},
			'index.html': '',
			'index.js': ''
		},
		'index.html': '<html></html>'
	},
	'README.md': 'bla bla...',
	'package.json': '{}'
};

var testCases = {
	'modules': {
		path: 'app/modules',
		result: Object.keys(dirs.app.modules)
	},
	'views': {
		path: 'app/views',
		result: Object.keys(dirs.app.views)
	},
	'file': {
		path: 'app/index.html',
		result: []
	},
	'non-existent': {
		path: 'non-existent',
		result: []
	}
};

function prepareTask(fn) {
	fn = Sinon.spy(fn || function (done) {});
	var run = function (done) {
		var context = this,
			config = context.config;
		return fn.call(this, done);
	};
	var task = function (done) { return run.call(this, done); };
	task.run = run;
	return task;
}

function done() {
}

describe('eachdir()', function () {
	var tasks;

	before(function () {
		process.chdir(fixtures);
	});

	after(function () {
		process.chdir(base);
	});

	beforeEach(function () {
		tasks = [prepareTask(), prepareTask()];
	});

	afterEach(function () {});

	it('should throw if config.dir is not a valid string', function () {
		var configs = {
			empty: {},
			emptyString: {
				dir: ''
			},
			number: {
				dir: 1024
			},
			array: {
				dir: ['app/views']
			},
			arrayEmptyString: {
				dir: ['']
			},
			emptyArray: {
				dir: []
			},
		};
		_.forOwn(configs, function (config) {
			var ctx = {
				config: config,
				tasks: tasks
			}
			expect(function () {
				eachdir.call(ctx, done);
			}).to.throw;
		});
	});

	it('should throw if no sub folder found', function () {
		var configs = {
			notExist: {
				dir: testCases['non-existent'].path
			},
			file: {
				dir: testCases.file.path
			}
		};
		_.forOwn(configs, function (config) {
			var ctx = {
				config: config,
				tasks: tasks
			}
			expect(function () {
				eachdir.call(ctx, done);
			}).to.throw;
		});
	});

	it('should invoke the given task for each folder', function () {
		var testCase = testCases.modules,
			config = {
				dir: testCase.path
			},
			visits = [],
			task = prepareTask(function (done) {
				var context = this,
					config = context.config;
				visits.push(config.dir);
				return through.obj();
			}),
			ctx = {
				config: config,
				tasks: [task]
			};
		eachdir.call(ctx, done);
		expect(visits).to.deep.equal(testCase.result);
	});

	it('should throw if the given task does not return a stream', function () {
		var testCase = testCases.modules,
			config = {
				dir: testCase.path
			},
			task = prepareTask(function (done) {
				return true;
			}),
			ctx = {
				config: config,
				tasks: [task]
			};
		expect(function () {
			eachdir.call(ctx, done);
		}).to.throw;
	});

	it('should return a stream', function () {
		var config = {
				dir: testCases.views.path
			},
			task = prepareTask(function (done) {
				return through.obj();
			}),
			ctx = {
				config: config,
				tasks: [task]
			};
		expect(eachdir.call(ctx, done)).to.be.an.instanceof(Stream);
	});
});