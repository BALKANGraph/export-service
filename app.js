'use strict';
var port = process.env.PORT || 1337;
var virtualDirPath = process.env.virtualDirPath || "";
const express = require('express');
const app = express();
const puppeteerParams = {args: ['--no-sandbox', '--disable-setuid-sandbox']};
const APP_DATA = "/appdata";
const ERROR = "Aw Snap! Something bad has happened! See the logs!";
const ONE_HOUR =  60 * 60 * 1000; /* ms */
const PADDING = 5;
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const uuid = require('uuid');    
const {transports, createLogger, format} = require('winston');
const cors = require('cors');
const export1 = require('./export1.js');
const export2 = require('./export2.js');
const export3 = require('./export3.js');
const util = require('./util.js');

const l = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.simple()
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: './logs/error.log', level: 'error'}),
        new transports.File({filename: './logs/debug.log', level: 'debug'}),
        new transports.File({filename: './logs/info.log', level: 'info'})
    ]
});



app.use(cors());

app.use(express.json({limit: '10mb'}));

app.use(express.urlencoded({
    limit: '10mb',
    extended: true
}));

app.listen(port, () => console.log(`Go to http://localhost:${port}/index.html`));

  
app.get('*', function(req, res) {
    clear();
    res.sendFile(path.join(__dirname + req.url.replace(virtualDirPath, "")));
});

app.post(virtualDirPath + '/pdf', function(req, res) {
    clear();
    convert(req, res, "pdf");
});

app.post(virtualDirPath + '/png', function(req, res) {
    clear();
    convert(req, res, "png");
});

app.post(virtualDirPath + '/v1', function(req, res) {
    v1(req, res);
});

app.post(virtualDirPath + '/v2', function(req, res) {
    v2(req, res);
});

app.post(virtualDirPath + '/v3', function(req, res) {
    v3(req, res);
});


app.options('*', function(req, res) {
    res.writeHead(200);
    res.end();
});

function clear(res) {  
    var dir = `${__dirname}${APP_DATA}`;
    l.debug("clear");
    if (!fs.existsSync(dir)){
        l.debug(`mkdirSync: ${dir}`);
        fs.mkdirSync(dir);
    }
    
    l.debug(`readdir: ${dir}`);
    fs.readdir(dir, (err, files) => {
        if (err) {
            l.debug(`readdir error: ${JSON.stringify(err)}`);                   
            l.error(JSON.stringify(err));
            return;            
        }
        files.forEach(file => {
            if (file.indexOf('~') == -1){
                return;
            }

            var dtstring = file.split('~')[0];
            var dtarray = dtstring.split("-");
            if (dtarray.length != 6){
                return;   
            }

            var d = new Date(dtarray[0], dtarray[1], dtarray[2], dtarray[3], dtarray[4], dtarray[5]);
            var now = new Date();

            var filename = `${__dirname}${APP_DATA}/${file}`;
            l.debug(`readdir filename: ${filename}`);            

            if (((now - d) < ONE_HOUR)){
                l.debug(`file ${filename} is less then one hour old and will not be deleted!`);
                return;
            }

            fs.unlink(filename, (err) => {
                if (err) {
                    l.debug(`unlink filename: ${filename}; err: ${JSON.stringify(err)}`);
                    l.error(JSON.stringify(err));
                    return;            
                }
                l.info(`file ${filename} has been deleted!`);
            });
        });
    });

    dir = './logs';
    l.debug(`dir existsSync: ${dir}`);

    if (!fs.existsSync(dir)){
        l.debug(`mkdirSync start: ${dir}`);
        fs.mkdirSync(dir);
        l.debug(`mkdirSync end: ${dir}`);
    }
}

function convert(req, res, type) {
    var href = req.protocol + "://"+ req.headers.host + virtualDirPath;
    l.debug(`req.headers.referer: ${req.headers.referer}`);
    

    if (!req.body.size){
        v0(req, res, type);
        // res.writeHead(400);
        // res.end("In your OrgChart JS version there is an issue with the export service, use verion 4.5.2 or above!");
        return;
    }

    var width = parseFloat(req.body.size.w) + PADDING;
    var height = parseFloat(req.body.size.h) + PADDING;
    
    var filename = uuid.v4(); 
    var d = new Date();

    d = d.getFullYear() 
        + "-" + d.getMonth()
        + "-" + d.getDate()
        + "-" + d.getHours()
        + "-" + d.getMinutes()
        + "-" + d.getSeconds()
    
    var filenameSvg = `${__dirname}${APP_DATA}/${d}~${filename}.svg`; 
    var filenameSvgUrl = href + `${APP_DATA}/${d}~${filename}.svg`;
    var filenameConverted = `${__dirname}${APP_DATA}/${d}~${filename}.${type}`; 
    l.debug(`convert writeFile filenameSvg: ${filenameSvg}`);

    fs.writeFile(filenameSvg, req.body.svg, function(err) {
        if(err) {
            l.debug(`convert writeFile err filenameSvg: ${filenameSvg}`);

            l.error(JSON.stringify(err));
            res.writeHead(404);
            res.end(ERROR);
            return;
        }
        l.debug(`convert success filenameSvg: ${filenameSvg}`);
        l.info(`${filenameSvg} file was saved; width: ${width}; height: ${height};`);
        (async () => {
            const browser = await puppeteer.launch(puppeteerParams);
            const page = await browser.newPage();
            l.debug(`goto start filenameSvgUrl: ${filenameSvgUrl}`);
            await page.goto(filenameSvgUrl, { waitUntil: 'networkidle2' });
            l.debug(`goto end filenameSvgUrl: ${filenameSvgUrl}`);

            if (type == "png"){
                l.debug(`goto png page.screenshot start filenameConverted: ${filenameConverted}`);

                await page.screenshot({
                    path: filenameConverted,
                    clip : {
                        x      : 0,
                        y      : 0,
                        width  : width,
                        height : height
                    }
                });
                l.debug(`goto png page.screenshot end filenameConverted: ${filenameConverted}`);

            }
            else if (type == "pdf"){
                l.debug(`goto pdf page.screenshot start filenameConverted: ${filenameConverted}`);

                await page.pdf({
                    path: filenameConverted,
                    width: width,
                    height: height,
                    printBackground: true
                });
                l.debug(`goto pdf page.screenshot end filenameConverted: ${filenameConverted}`);

            }
            l.debug(`browser.close(); start filenameConverted: ${filenameConverted}`);

            await browser.close();
            l.debug(`browser.close(); end filenameConverted: ${filenameConverted}`);

            l.debug(`convert readFile filenameConverted: ${filenameConverted}`);

            fs.readFile(filenameConverted, function (err, filedata) {
                if (err) {
                    l.debug(`convert readFile err filenameConverted: ${filenameConverted}; err ${JSON.stringify(err)}`);
                    l.error(JSON.stringify(err));
                    res.writeHead(404);
                    res.end(ERROR);
                    return;                        
                }
                l.debug(`convert success readFile filenameConverted: ${filenameConverted}`);

                l.info(`${filenameConverted} file was converted;`);
                res.writeHead(200);

                res.end(filedata);
                l.debug(`convert success readFile filenameConverted: ${filenameConverted} end`);

            });
        })();              
    });         
}


function v0(req, res, type) {
    var href = req.protocol + "://"+ req.headers.host + virtualDirPath;
    l.debug(`req.headers.referer: ${req.headers.referer}`);
    if (!req.body.svg){
        l.debug("req.body.svg is empty");
    }

    var matchW = req.body.svg.match(/width="([^"]+)"/)
    var matchH = req.body.svg.match(/height="([^"]+)"/)

    var width = matchW[1];
    var height = matchH[1];
    width = parseFloat(width) + PADDING;
    height = parseFloat(height) + PADDING;
    var filename = uuid.v4(); 
    var d = new Date();

    d = d.getFullYear() 
        + "-" + d.getMonth()
        + "-" + d.getDate()
        + "-" + d.getHours()
        + "-" + d.getMinutes()
        + "-" + d.getSeconds()
    
    var filenameSvg = `${__dirname}${APP_DATA}/${d}~${filename}.svg`; 
    var filenameSvgUrl = href + `${APP_DATA}/${d}~${filename}.svg`;
    var filenameConverted = `${__dirname}${APP_DATA}/${d}~${filename}.${type}`; 
    l.debug(`convert writeFile filenameSvg: ${filenameSvg}`);

    fs.writeFile(filenameSvg, req.body.svg, function(err) {
        if(err) {
            l.debug(`convert writeFile err filenameSvg: ${filenameSvg}`);

            l.error(JSON.stringify(err));
            res.writeHead(404);
            res.end(ERROR);
            return;
        }
        l.debug(`convert success filenameSvg: ${filenameSvg}`);
        l.info(`${filenameSvg} file was saved; width: ${width}; height: ${height};`);
        (async () => {
            const browser = await puppeteer.launch(puppeteerParams);
            const page = await browser.newPage();
            l.debug(`goto start filenameSvgUrl: ${filenameSvgUrl}`);
            await page.goto(filenameSvgUrl, { waitUntil: 'networkidle2' });
            l.debug(`goto end filenameSvgUrl: ${filenameSvgUrl}`);

            if (type == "png"){
                l.debug(`goto png page.screenshot start filenameConverted: ${filenameConverted}`);

                await page.screenshot({
                    path: filenameConverted,
                    clip : {
                        x      : 0,
                        y      : 0,
                        width  : width,
                        height : height
                    }
                });
                l.debug(`goto png page.screenshot end filenameConverted: ${filenameConverted}`);

            }
            else if (type == "pdf"){
                l.debug(`goto pdf page.screenshot start filenameConverted: ${filenameConverted}`);

                await page.pdf({
                    path: filenameConverted,
                    width: width,
                    height: height,
                    printBackground: true
                });
                l.debug(`goto pdf page.screenshot end filenameConverted: ${filenameConverted}`);

            }
            l.debug(`browser.close(); start filenameConverted: ${filenameConverted}`);

            await browser.close();
            l.debug(`browser.close(); end filenameConverted: ${filenameConverted}`);

            l.debug(`convert readFile filenameConverted: ${filenameConverted}`);

            fs.readFile(filenameConverted, function (err, filedata) {
                if (err) {
                    l.debug(`convert readFile err filenameConverted: ${filenameConverted}; err ${JSON.stringify(err)}`);
                    l.error(JSON.stringify(err));
                    res.writeHead(404);
                    res.end(ERROR);
                    return;                        
                }
                l.debug(`convert success readFile filenameConverted: ${filenameConverted}`);

                l.info(`${filenameConverted} file was converted;`);
                res.writeHead(200);

                res.end(filedata);
                l.debug(`convert success readFile filenameConverted: ${filenameConverted} end`);

            });
        })();              
    });         
}


function v1(req, res) {
    var href = req.protocol + "://"+ req.headers.host + virtualDirPath;

    var content =  req.body.content;
    var extsource = 'html';

    var path = util.newPath(__dirname, href, APP_DATA, extsource, req.body.options.ext);
        
    fs.writeFile(path.sourcepath, content, function(err) {
        if(err) {
            error(res, err);
            return;
        }

        export1(path, req.body.options, function(){
            fs.readFile(path.targetpath, function (err, filedata) {
                if (err) {
                    error(res, err);
                    return;                        
                }
                res.writeHead(200);
                res.end(filedata);
            });
        });  
    });   
}

function v2(req, res) {
    var href = req.protocol + "://"+ req.headers.host + virtualDirPath;

    var extsource = 'html';

    var path = util.newPath(__dirname, href, APP_DATA, extsource, req.body.options.ext);
        
    export2(path, req.body, function(){
        fs.readFile(path.targetpath, function (err, filedata) {
            if (err) {
                error(res, err);
                return;                        
            }
            res.writeHead(200);
            res.end(filedata);
        });
    });  
}


function v3(req, res) {    
    var href = req.protocol + "://"+ req.headers.host + virtualDirPath;

    var extsource = 'html';

    var path = util.newPath(__dirname, href, APP_DATA, extsource, req.body.options.ext);
        
    export3(path, req.body, function(){
        fs.readFile(path.targetpath, function (err, filedata) {
            if (err) {
                error(res, err);
                return;                        
            }
            res.writeHead(200);
            res.end(filedata);
        });
    });  
}

function error(res, err){
    l.error(JSON.stringify(err));
    res.writeHead(404);
    res.end(ERROR);
}


process.on('uncaughtException', function(err) {   
    l.debug(`uncaughtException`);
    l.error(err.message);
    l.error(err.stack);
});

