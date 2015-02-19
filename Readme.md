# GRP Map

## Development environment
To set up the development environment for this website, you'll need to install the following on your system:

- [Node and npm](http://nodejs.org/)
- Ruby and [Bundler](http://bundler.io/), preferably through something like [rvm](https://rvm.io/)
- Grunt ( $ npm install -g grunt-cli )
- Bower ( $ npm install -g bower )

After these basic requirements are met, run the following commands in the website's folder:
```
$ npm install
$ bundle install
$ bower install
```

### Getting started

```
$ grunt
```
Compiles the compass files, javascripts, and launches the server making the site available at `http://localhost:3000/`
The system will watch files and execute tasks whenever one of them changes.
The site will automatically refresh since it is bundled with livereload.

### Other commands
Clean the compiled sass and javascript libraries
```
$ grunt clean
```

Compile the compass files and javascripts. Use this instead of ```grunt``` if you just want to render it once:
```
$ grunt build
```

Compile the compass files and javascripts prepared for production (minified, uglyfied).
```
$ grunt prod
```

Spins up a webserver to serve the website.
```
$ grunt serve
```

## Structure
All the third party libraries go to `source_assets/bower_components`. Grunt will minify then copy them to `app/assets/scripts`. Any new lib added to `bower_components` must be added to `Gruntfile` as well.

The app uses `Backbone`.

Styles are preprocessed using sass. The source files are in `source_assets/styles`.