Kompailer
=====================

This is my Compilers project written TypeScript with frontend HTML.
See http://www.labouseur.com/courses/compilers/ for details.

Setup TypeScript/Gulp
=====================

1. Install [npm](https://www.npmjs.org/), if you don't already have it
1. `npm install -g typescript` to get the TypeScript Compiler
1. `npm install -g gulp` to get the Gulp Task Runner
1. `npm install --save-dev -g gulp-tsc` to get the Gulp TypeScript plugin

Compiling
=====================

1. Follow the commands in the c file (Mac) or the compile.bat (Windows) file
or
1. Run gulp (see workflow below)

Running the Compiler
=====================

1. Open the index.html in the browser.

Your Workflow
=============

Just run `gulp` at the command line in the root directory of this project! Edit your TypeScript files in the source/scripts directory in your favorite editor. Visual Studio has some additional tools that make debugging, syntax highlighting, and more very easy. WebStorm looks like a nice option as well.

Gulp will automatically:

* Watch for changes in your source/scripts/ directory for changes to .ts files and run the TypeScript Compiler on it
* Watch for changes to your source/styles/ directory for changes to .css files and copy them to the dist/ folder
