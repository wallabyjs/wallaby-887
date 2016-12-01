/* eslint-disable strict */

// Karma runs with node, which needs the use strict flag
// to use const, let, etc. Therefore disabling it here

'use strict';

/* eslint-enable strict */

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const path = require('path');
const ModernizrWebpackPlugin = require('modernizr-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const saveLicense = require('uglify-save-license');
// const modernizr = require('./modernizr.config.js');
const platformConfig = require('./platform.config.js');

const paths = platformConfig.paths;

/* ==========================================================================
 General configs
 ========================================================================== */

const output = {
  path: paths.dist,
  publicPath: '/',
  filename: '[name].js',
  chunkFilename: '[name].chunk.js',
};

const nodeModules = path.resolve(__dirname, '../../node_modules');

const modulesDirectories = [
  paths.vendor,
  paths.src,
  nodeModules,
  path.resolve(__dirname, './'),
];

const dependenciesDirectories = [
  paths.vendor,
];

const alias = {
  angular: `${paths.vendor}/angular`,
  lazysizes: `${paths.vendor}/lazysizes`,
  picturefill: `${paths.vendor}/picturefill`,
  raf: `${paths.vendor}/raf.js`,
  svgxuse: `${paths.vendor}/svgxuse`,
  molecules: path.resolve(__dirname, `${paths.src}/components/molecules`),
  atoms: path.resolve(__dirname, `${paths.src}/components/atoms`),
};

const compression = {
  asset: '[path].gz[query]',
  algorithm: 'gzip',
  test: /\.js$/,
  threshold: 10240,
  minRatio: 0.8,
};

/* ==========================================================================
 Module loaders definition
 ========================================================================== */

function definePreLoaders(isTesting) {
  const preLoaders = [];
  if (isTesting) {
    // Loads js files with isparta (files will be automatically transpiled)
    preLoaders.push({
      test: /\.js$/,
      loader: 'isparta',
      exclude: /(test|node_modules|bower_components|config|\.spec\.js)/,
      include: platformConfig.paths.src,
    });
  }

  return preLoaders;
}

const loaders = [{
  test: /\.js$/,
  exclude: /(node_modules|bower_components)/,
  include: paths.src,
  loaders: ['ng-annotate', 'babel-loader'],
}, {
  test: /\.html$/,
  loader: 'raw!html-minify',
}, {
  test: /\.scss$/,
  loader: 'style!css?postcss-loader!sass?sourceMap!',
}, {
  test: /\.jpg/,
  loader: 'url-loader?limit=10000&mimetype=image/jpg',
}, {
  test: /\.gif/,
  loader: 'url-loader?limit=10000&mimetype=image/gif',
}, {
  test: /\.png/,
  loader: 'url-loader?limit=10000&mimetype=image/png',
}, {
  test: /\.svg/,
  loader: 'url-loader?limit=10000&mimetype=image/svg',
}, {
  test: /\.(woff|woff2|eot|ttf|svg)$/,
  loader: 'file-loader?limit=100000&name=fonts/[name].[ext]',
}, {
  test: /\.json$/,
  loader: 'json-loader',
},
];

function postcss() {
  const postCssPlugins = [];
  postCssPlugins.push(autoprefixer({
    browsers: platformConfig.browsers,
  }));

  return postCssPlugins;
}

/* ==========================================================================
 Entry points definition
 ========================================================================== */

function defineEntry(isDevelopment, isStyleguide) {
  const entryPlugins = [];
  const webpackPlugins = [];

  // When we use webpack, and we import a library in the code
  // webpack will automatically add it to the bundle.
  // However, we want to deliver two bundles, vendor and main.
  // In order to do so, we need to clearly tell webpack, what is
  // vendor and what is main. For that, we declare them here.
  const angularLibs = [
    `${paths.vendor}/angular/angular.js`,
    `${paths.vendor}/angularjs-slider/dist/rzslider.min.js`,
    `${paths.vendor}/angular-animate/angular-animate.js`,
    `${paths.vendor}/angular-cookies/angular-cookies.js`,
    `${paths.vendor}/angular-touch/angular-touch.js`,
    `${paths.vendor}/angular-sanitize/angular-sanitize.js`,
    `${paths.vendor}/angular-messages/angular-messages.js`,
    `${paths.vendor}/angular-elastic/elastic.js`,
    'ng-dialog',
  ];

  // These libraries are not related to angular, these are polyfill that,
  // when loaded in the page, they will be automatically executed
  // generating the polyfill for whatever feature they are targeting to.
  // We split them in a separate array, so we have the posibility to
  // add them to the styleguide, and also load them quicker if it is
  // required.
  const vendor = [
    `${paths.vendor}/picturefill/dist/picturefill.min.js`,
    `${paths.vendor}/lazysizes/lazysizes.min.js`,
    `${paths.vendor}/raf.js/raf.js`,
    `${paths.vendor}/svgxuse/svgxuse.js`,
  ];

  entryPlugins.push(`${paths.src}/core/scripts/${paths.main}`);

  if (isDevelopment) {
    // This will emulate a full ES2015 environment
    entryPlugins.push('babel-polyfill');

    // Necessary for hot reloading with IE
    webpackPlugins.push('eventsource-polyfill');
  }

  let entry;
  if (!isStyleguide) {
    entry = {
      'scripts/main': entryPlugins.concat(webpackPlugins),
      'scripts/vendor': vendor.concat(angularLibs).concat(webpackPlugins),
    };
  } else {
    entry = {
      'styleguide/scripts/main': entryPlugins.concat(webpackPlugins),
      'styleguide/scripts/vendor': vendor.concat(webpackPlugins),
    };
  }

  return entry;
}

/* ==========================================================================
 Plugins definition
 ========================================================================== */
function definePlugins(options) {
  // More info about the webpack plugins here:
  // https://github.com/webpack/docs/wiki/optimization

  const plugins = [

    // Avoid publishing files when compilation failed
    new webpack.NoErrorsPlugin(),
    // new ModernizrWebpackPlugin(modernizr),
    new webpack.optimize.OccurrenceOrderPlugin(true),
  ];

  // Split the vendor dependencies into a separate file
  if (!options.styleguide) {
    plugins.push(new webpack.optimize.CommonsChunkPlugin('scripts/vendor', 'scripts/vendor.js'));
  }

  if (options.development) {
    // Tell webpack we want hot reloading
    plugins.push(new webpack.HotModuleReplacementPlugin());
  } else {
    // Aggressively remove duplicate modules.
    // More info: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
    plugins.push(new webpack.optimize.DedupePlugin());
  }

  if (options.environment) {
    plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(options.environment),
      },
    }));
  }

  if (!(options.development || options.testing)) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: saveLicense,
      },
      compress: {
        warnings: false,
      },

      // skip pre-minified libs
      exclude: [/\.min\.js$/gi],
      mangle: {

        // You can specify all variables that should not be mangled.
        // For example if your vendor dependency doesn't use modules
        // and relies on global variables. Most of angular modules relies on
        // angular global variable, so we should keep it unchanged
        except: ['$super', '$', 'exports', 'require', 'angular'],
      },
    }));
  }

  // Add Compression Plugin
  plugins.push(new CompressionPlugin(compression));

  return plugins;
}

/**
 * Creates the default configuration of webpack.
 * It receives an object with parameters changing depending
 * on the environment webpack needs to run.
 * @param  {object}   options                  Object of parameters
 * @param  {boolean}  options.development      true if you want to have a development build
 * @param  {object}   options.defines          Object setting the environment
 * @param  {boolean}  options.testing          True if you are running the tests
 * @param  {string}   options.environment      The environment (for bundling defines)
 * @return {object}                            Object of config settings
 */
function webpackConfig(options) {
  // karma watches the test entry points
  // (you don't need to specify the entry option)
  // webpack watches dependencies
  const plugins = (!options.testing) ? definePlugins(options) : [];
  const entry = (!options.testing) ? defineEntry(options.development, options.styleguide) : {};
  const preLoaders = definePreLoaders(options.testing);

  const config = {

    // For more info about this:
    // http://webpack.github.io/docs/configuration.html
    entry,
    output,

    watch: (options.development || options.testing),

    // Cache generated modules and chunks to
    // improve performance for multiple incremental builds.
    cache: options.development || options.testing,

    // Switch loaders to debug mode.
    debug: options.development,

    compress: true,

    // http://webpack.github.io/docs/configuration.html#devtool
    devtool: (options.development || options.testing) ? '#inline-source-map' : false,
    module: {
      loaders,
      postcss,
      preLoaders,
      noParse: [
        /(node_modules|bower_components|~)\/(min\.|jquery)\//gi,
      ],
    },
    resolve: {
      modulesDirectories,
      alias,
    },
    resolveLoader: {
      dependenciesDirectories,
    },
    'html-minify-loader': {
      // See possible options here:
      // https://github.com/kangax/html-minifier#options-quick-reference
      // And a recommendation for angular templates here:
      // https://www.npmjs.com/package/grunt-angular-templates#htmlmin
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
    },
    plugins,
  };
  return config;
}

module.exports = webpackConfig;