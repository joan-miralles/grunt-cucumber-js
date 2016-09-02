var _ = require('lodash');

module.exports = function (grunt) {

  // The Cucumber Task
  grunt.registerMultiTask('cucumberjs', 'Runs cucumber.js', function () {
    // Make this task async
    var done = this.async();

    // Load all the options
    var options = this.options();

    var steps = options.steps;
    var tags = options.tags;
    var formats = options.format;
    var support = options.support;
    var modulePath = options.modulePath;
    var coffee = options.coffee;

    grunt.verbose.writeflags(options, 'Options');

    var callback = function(succeeded) {
      var exitFunction = function() {
        done(succeeded);
      };

      // --- exit after waiting for all pending output ---
      var waitingIO = false;
      process.stdout.on('drain', function() {
        if (waitingIO) {
          // the kernel buffer is now empty
          exitFunction();
        }
      });
      if (process.stdout.write("")) {
        // no buffer left, exit now:
        exitFunction();
      } else {
        // write() returned false, kernel buffer is not empty yet...
        waitingIO = true;
      }
    };

    var files = this.filesSrc;


    var execOptions = ['node', 'node_modules/.bin/cucumber-js'];

    if (! _.isEmpty(files)) {
      execOptions = execOptions.concat(files);
    }

    function addStep(step) {
      execOptions.push('-r');
      execOptions.push(step);
    }

    var i;
    if (! _.isEmpty(steps)) {
      if (_.isArray(steps)) {
        for (i=0; i < steps.length; i++) {
          addStep(steps[i]);
        }
      } else {
        addStep(steps);
      }
    }

    if (! _.isEmpty(support)) {
      execOptions.push('-r');
      execOptions.push(support);
    }

    if (! _.isEmpty(tags)) {
      if (typeof tags === "string") {
       tags = [tags];
      }
      for (i=0; i < tags.length; i++) {
       execOptions.push('-t');
       execOptions.push(tags[i]);
      }
    }

    if (! _.isEmpty(formats)) {
      (_.isArray(formats) ? formats : [formats]).forEach(function(format) {
        execOptions.push('-f');
        execOptions.push(format);
      });
    }

    if (coffee) {
      execOptions.push('--coffee');
    }

    var cucumberPath = 'cucumber';
    if (! _.isEmpty(modulePath)) {
      cucumberPath = modulePath;
    }

    grunt.verbose.writeln('Exec Options: ' + execOptions.join(' '));
    var cucumber = require(cucumberPath);
    cucumber.Cli(execOptions).run(callback);

  });
};
