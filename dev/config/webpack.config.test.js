/* eslint-disable strict */

// Karma runs with node, which needs the use strict flag
// to use const, let, etc. Therefore disabling it here

'use strict';

/* eslint-enable strict */

const webpackConfig = require('./webpack.config.js');
const platformConfig = require('./platform.config.js');

const developmentSettings = {
  defines: {
    'process.env': {
      NODE_ENV: JSON.stringify('testing'),
    },
  },
  isparta: {
    embedSource: true,
    noAutoWrap: true,
    babel: {
      presets: ['es2015'],
    },
  },
  reporters: ['mocha', 'coverage'],
  coverageReporter: {
    reporters: [
      {
        type: 'lcov',
        dir: `${platformConfig.paths.reports}/coverage/`,
        subdir: '.',
      }, {
        type: 'json',
        dir: `${platformConfig.paths.reports}/coverage/`,
        subdir: '.',
      }, {
        type: 'text-summary',
      },
    ],
  },
  devtool: 'inline-source-map',
  testing: true,
};

module.exports = webpackConfig(developmentSettings);