var gulp        = require('gulp');
var ejs         = require("gulp-ejs");
var gdata       = require("gulp-data");
var rename      = require("gulp-rename");
var fs          = require("fs");
var path        = require("path");

// Use NODE_ENV=production in production # process.env.NODE_ENV = 'production'

// compile ejs templates
gulp.task('compileEjs', function () {
  gulp.src("./views/*.ejs")
    .pipe(gdata(function(file) {
        // load the data file
        return JSON.parse(fs.readFileSync('./data/' + path.basename(file.path,'.ejs') + '.json'));
    }))
  	.pipe(ejs({}))
  	.pipe(rename({extname:".html"}))
  	.pipe(gulp.dest("./dest/"));
});

gulp.task('merge', function() {
    var data = require('./data/themes.json');
    for (var t in data) {
        var template = data[t];
        var foldername = template.name.toLowerCase().replace(" ","_");
        gulp.src("./*.ejs")
          .pipe(ejs(template))
        	.pipe(rename({extname:".html"}))
        	.pipe(gulp.dest("../"+foldername+"/"));
        gulp.src("./*.css").pipe(gulp.dest("../"+foldername+"/"));
    }
});


gulp.task('default',['merge']);