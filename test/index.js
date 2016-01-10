/*global describe, it, before, after, beforeEach, afterEach, process */
/*jshint expr: true*/
'use strict';

var Sinon = require('sinon');
var Chai = require('chai');
var Promised = require('chai-as-promised');
var expect = Chai.expect;

var Stream = require('stream');
var through = require('through2');
var _ = require('lodash');

var base = process.cwd();
var fixtures = base + '/test/_fixtures';

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

Chai.use(Promised);

function prepareTask(f) {
	var fn;

	fn = Sinon.spy(f || function () {});
	task.run = run;
	return task;

	function run(done) {
		return fn.call(this, done);
	}
	function task(done) {
		return run.call(this, done);
	}
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
			}
		};

		_.forOwn(configs, function (config) {
			var ctx = {
				config: config,
				tasks: tasks
			};

			expect(expr).to.throw;

			function expr() {
				eachdir.call(ctx, done);
			}
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
			};

			expect(expr).to.throw;

			function expr() {
				eachdir.call(ctx, done);
			}
		});
	});

	it('should invoke the given task for each folder', function () {
		var testCase = testCases.modules;
		var config = {
			dir: testCase.path
		};
		var visits = [];
		var task = prepareTask(function (done) {
			visits.push(this.config.dir);
			return through.obj();
		});
		var ctx = {
			config: config,
			tasks: [task]
		};

		eachdir.call(ctx, done);
		expect(visits).to.deep.equal(testCase.result);
	});

	it('should throw if the given task does not return a stream', function () {
		var testCase = testCases.modules;
		var config = {
			dir: testCase.path
		};
		var task = prepareTask(function (done) {
			return true;
		});
		var ctx = {
			config: config,
			tasks: [task]
		};

		expect(expr).to.throw;

		function expr() {
			eachdir.call(ctx, done);
		}
	});

	it('should return a stream', function () {
		var config = {
			dir: testCases.views.path
		};
		var task = prepareTask(function (done) {
			return through.obj();
		});
		var ctx = {
			config: config,
			tasks: [task]
		};

		expect(eachdir.call(ctx, done)).to.be.an.instanceof(Stream);
	});
});
