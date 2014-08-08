'use strict';

var gulp            = require('gulp'),
    connect         = require('gulp-connect'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    browserSync     = require('browser-sync'),
    plugins         = gulpLoadPlugins(),
    webpack         = require('webpack'),
    ngminPlugin     = require("ngmin-webpack-plugin"),
    ComponentPlugin = require("component-webpack-plugin"),
    info            = require('./package.json'),
    webpackCompiler;

var config = {

  JS: {
    src: ["src/js/**/*.js"],
    build: "app/js/",
    buildFiles: "app/js/*.js"
  },

  HTML:{
    // src: ['pages/**/*.hbs']
    build: "./app/**/*.html"
  },

  SASS: {
    src: "src/sass/**/*.scss",
    build: "app/css/"
  }

}

// SERVER ---------------------------------------------------------------------
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: "./app/"
    },
    // proxy: "192.168.1.3:8000",
    browser: "google chrome canary",
    online: true
  });
});


// SASS -----------------------------------------------------------------------
gulp.task('sass', function() {
  gulp.src( config.SASS.src )
    .pipe(plugins.plumber())
    .pipe(plugins.sass({
      outputStyle: 'compressed'
      }))
    .on("error", plugins.notify.onError())
    .on("error", function (err) {
      console.log("Error:", err);
    })
    .pipe( plugins.autoprefixer (
        "last 1 versions", "> 10%", "ie 9"
        ))
    .pipe( gulp.dest( config.SASS.build ) )
    .pipe( browserSync.reload({ stream: true }) );
});


// WEBPACK --------------------------------------------------------------------
gulp.task('webpack', function(callback) {
  webpackCompiler.run(function(err, stats) {
    if (err) {
      throw new plugins.util.PluginError('webpack', err);
    }
    plugins.util.log('webpack', stats.toString({
      colors: true,
    }));
    callback();
  });
});

var webpackConfig = {
  cache: true,
  debug: true,
  progress: true,
  colors: true,
  devtool: 'source-map',
  entry: {
    main: './src/js/app.js',
    vendor: ['angular', 'angular-resource', 'angular-route', 'angular-sanitize',  'locale']
  },
  output: {
    path: config.JS.build ,
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
    publicPath: '/app/js/',
  },
  module:{
    loaders: [
      { test: /\.html$/, loader: "html" },
      { test: /\.css$/, loader: "css" }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    alias: {
      'firebase'     : 'firebase/firebase.js',
      'angular-fire' : 'angularfire/angularfire.js',
      'locale'       : 'ngLocale/angular-locale_pt-pt.js'
    }
  },
  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
    // "angular": "angular",
    // "jquery": "jQuery"
  }

};

gulp.task('set-env-dev', function() {
  webpackConfig.plugins = [
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js"),
    new webpack.BannerPlugin(info.name + '\n' + info.version + ':' + Date.now() + ' [development build]'),
    new ComponentPlugin(),
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    )
  ];
  webpackCompiler = webpack( webpackConfig );
});

gulp.task('set-env-prod', function() {
  webpackConfig.debug = false;
  webpackConfig.devtool = "";
  webpackConfig.plugins = [
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js"),
    new ngminPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false
    }),
    new ComponentPlugin(),
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    )
  ];
  webpackCompiler = webpack( webpackConfig );
});


// JAVASCRIPT RELOADING -------------------------------------------------------
gulp.task('js', function () {
  gulp.src( config.JS.buildFiles )
    .pipe( plugins.changed ( config.JS.buildFiles ))
    .pipe( plugins.filter('**/*.js'))
    .pipe( browserSync.reload({ stream: true }) );
    // .pipe( plugins.livereload() );
});




// HTML TEMPORARIO --------------------------------------------------------------
gulp.task('html', function () {
  gulp.src( config.HTML.build )
    .pipe( browserSync.reload({ stream: true }) );
    // .pipe( plugins.livereload() );
});



// GLOBAL TASKS ---------------------------------------------------------------

gulp.task('watch', function () {
  gulp.watch( config.HTML.build , ['html', browserSync.reload] );
  gulp.watch( config.JS.src , ["webpack"]);
  gulp.watch( config.JS.buildFiles , ["js"] );
  gulp.watch( config.SASS.src , ['sass']  );
});

gulp.task('default', ['prod'] );
gulp.task('dev', ['set-env-dev', 'browser-sync', 'watch'] );
gulp.task('prod', ['set-env-prod', 'browser-sync', 'watch'] );

gulp.task('shipit', ['set-env-prod', 'webpack'] );
gulp.task('server', ['browser-sync'] );
