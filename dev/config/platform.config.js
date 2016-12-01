var path = require('path');
module.exports = {
  paths: {
    // main: `${mainScript}.js`,
    src: path.resolve(__dirname, '../../app'),
    documentation: path.resolve(__dirname, '../../documentation'),
    ngdocs: path.resolve(__dirname, '../../dist/ngdocs'),
    dist: path.resolve(__dirname, '../../dist'),
    styleguideSrc: path.resolve(__dirname, '../sc5'),
    documentationSrc: path.resolve(__dirname, '../documentation-src'),
    publicPath: '../../dist/',
    vendor: path.resolve(__dirname, '../../bower_components'),
    baseDir: 'dist',
    reports: path.resolve(__dirname, '../../reports'),
    mocks: path.resolve(__dirname, '../../mocks'),
    tests: path.resolve(__dirname, '../../test'),
    tmp: path.resolve(__dirname, '../../.tmp'),
    server: path.resolve(__dirname, '../server'),
    root: path.resolve(__dirname, '../../'),
    dev: path.resolve(__dirname, '../'),
    esIndexDir: path.resolve(`${__dirname}/../elasticsearch/index`),
  }
};