process.env.NODE_ENV = 'production';

var gulp    = require("gulp");
var ejs     = require("gulp-ejs");
var sass    = require("gulp-sass");
var rename  = require("gulp-rename");
var fs      = require("fs");
var cleanCSS = require('gulp-clean-css');
var concat  = require('gulp-concat');
var mergeStream = require('merge-stream');

var bootstrapVersion = "4.3.1";
//var output = "../dist";
var output = "../";

/* helper functions for ejs */
var helpers = {
  brightness: function(rgbArr) {
      var br = ((299*rgbArr[0]) + (587*rgbArr[1]) + (114*rgbArr[2])) / 1000;
      return br;
  },
  hexToRGB: function(hex) {
    return [this.hexToR(hex),this.hexToG(hex),this.hexToB(hex)];
  },
  hexToR: function (h) {return parseInt((this.cutHex(h)).substring(0,2),16)},
  hexToG: function (h) {return parseInt((this.cutHex(h)).substring(2,4),16)},
  hexToB: function(h) {return parseInt((this.cutHex(h)).substring(4,6),16)},
  cutHex: function (h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
};

/* read theme json to create theme.scss */
gulp.task('themes', function(cb) {
    var data = require('./data/themes.json');
    var output = "../src";
    for (var t in data.themes) {
        var theme = data.themes[t];
        var foldername = theme.name.toLowerCase().replace(" ","_");
        var sassString = '/*! Themestr.app `'+ theme.name+'` Bootstrap '+bootstrapVersion+' theme */\n';
        
        var colors = theme.colors;
        var variables = theme.vars;
        var custom = theme.custom;
        
        var fontHeadings = theme.fonts.headings;
        var fontBase = theme.fonts.base;
        var ignoreFonts = ["Roboto","Arial","Verdana"];
        
        // custom fonts
        if (fontBase && fontBase.length>1 && ignoreFonts.indexOf(fontBase)<0) {
            sassString += '@import url(https://fonts.googleapis.com/css?family='+fontBase.split(" ").join("+")+':200,300,400,700);\n';
            sassString += '$font-family-base:'+fontBase+';\n';
        }
        if (fontHeadings && fontHeadings.length>1 && ignoreFonts.indexOf(fontHeadings)<0) {
            sassString += '@import url(https://fonts.googleapis.com/css?family='+fontHeadings.split(" ").join("+")+':200,300,400,700);\n';
            sassString += '$headings-font-family:'+fontHeadings+';\n';
        }
        
        // styles only so turn off grid generation
        sassString += '\n$enable-grid-classes:false;';
        
        for (var c in colors) {
            sassString += '\n$'+c+':'+colors[c]+';';
        }

        var colorsys = "\n\n/*! Import Bootstrap 4 variables */";
        colorsys += '\n@import "functions";';
        colorsys += '\n@import "variables";';
        colorsys += '\n';
        
        //console.log("applying variables...");
        var varString = "";
        for (var v in variables) {
          varString += '\n$'+v+':'+variables[v]+';';
        }
        
        if (varString.length>1){
            sassString += colorsys;
            sassString += varString;
        }
    
        sassString += '\n@import "bootstrap";';
        sassString += '\n\n// Add SASS theme customizations here..';
        
        if (custom) {
            sassString += '\n' + custom;
        }
        
        console.log(sassString);
        fs.writeFileSync(output+"/"+foldername+"/theme.scss",sassString);
    }
    
    cb();
});


/* compile sass to create css files */
gulp.task('sass', ['themes'], function() {
    var themes = fs.readdirSync('../src/').filter(f => fs.statSync("../src/"+f).isDirectory());
    console.log('Found folder...');
    var tasks = [];
    for (var t in themes) {
        var theme = themes[t];
        console.log('Theme:' + theme);
        tasks.push(
            gulp.src('../src/'+theme+'/theme.scss')
                .pipe(sass({
                    includePaths: ['../node_modules/bootstrap/scss/','../node_modules/bootstrap/']
                }).on('error', function(e){console.log("sass error:"+e)}))
                .pipe(concat('theme.css'))
                .pipe(gulp.dest(output+'/'+theme+'/'))
            );
    }
    return mergeStream(tasks);
});

/* compile ejs to create html files */
gulp.task('merge', ['themes','sass'], function() {
    var data = require('./data/themes.json');
    data.bootstrapVersion = bootstrapVersion;
    for (var t in data.themes) {
        var template = data.themes[t];
        template.helpers = helpers;
        template.allThemes = data.themes;
        var foldername = template.name.toLowerCase().replace(" ","_");
        console.log('Folder:' + foldername);
        gulp.src("./*.ejs")
          .pipe(ejs(template))
        	.pipe(rename({extname:".html"}))
        	.pipe(gulp.dest(output+"/"+foldername+"/"));
        gulp.src("./*.css").pipe(gulp.dest(output+"/"+foldername+"/"));
        // minify
        gulp.src(output+"/"+foldername+"/theme.css").pipe(cleanCSS({compatibility:'ie9'})).pipe(rename({extname:".min.css"})).pipe(gulp.dest(output+"/"+foldername+"/"));
        // copy scss
        gulp.src('../src/'+foldername+'/theme.scss').pipe(gulp.dest(output+"/"+foldername+"/"));
        gulp.src("./scripts.js").pipe(gulp.dest(output+"/"+foldername+"/"));
    }
    
    /* project pages */
    gulp.src("../src/*.ejs")
      .pipe(ejs(data))
    	.pipe(rename({extname:".html"}))
    	.pipe(gulp.dest(output+"/"));
});

gulp.task('default',['themes','sass','merge']);