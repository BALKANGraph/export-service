'use strict';
var port = process.env.PORT || 1337;
const APP_DATA = "appdata";
const ERROR = "Aw Snap! Something bad has happened! See the logs!";
const ONE_HOUR = 60 * 60 * 1000; /* ms */
const PADDING = 5;

const http = require('http');
const puppeteer = require('puppeteer');
const fs = require('fs');
const fileUrl = require('file-url');
const uuid = require('uuid');                              
const xml = require("xml-parse");
const {transports, createLogger, format} = require('winston');

const l = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: 'logs\\error.log', level: 'error'}),
        new transports.File({filename: 'logs\\debug.log', level: 'debug'}),
        new transports.File({filename: 'logs\\info.log', level: 'info'})
    ]
});

http.createServer(function (req, res) {
    clear(res);
    if(isGet(req, "/index.html")) {
        servre(req, res);
    }
    else if(isPost(req, "/pdf")) {
        convert(req, res, "pdf");        
    }
    else if(isPost(req, "/png")) {
        convert(req, res, "png");        
    }
    else {
        res.writeHead(404);
        res.end();
    }
}).listen(port);

function clear(res) {  
    fs.readdir(APP_DATA, (err, files) => {
        if (err) {
            l.error(JSON.stringify(err));
            res.writeHead(404);
            res.end(ERROR);
            return;            
        }
        files.forEach(file => {
            if (file.indexOf('+') == -1){
                return;
            }

            var dtstring = file.split('+')[0];
            var dtarray = dtstring.split("-");
            if (dtarray.length != 6){
                return;   
            }

            var d = new Date(dtarray[0], dtarray[1], dtarray[2], dtarray[3], dtarray[4], dtarray[5]);
            var now = new Date();

            var filename = `${APP_DATA}\\${file}`;

            if (((now - d) < ONE_HOUR)){
                l.debug(`file ${filename} is less then one hour old and will not be deleted!`);
                return;
            }

            fs.unlink(filename, (err) => {
                if (err) {
                    l.error(JSON.stringify(err));
                    res.writeHead(404);
                    res.end(ERROR);
                    return;            
                }
                l.info(`file ${filename} has been deleted!`);
            });
        });
    });
}

function servre(req, res) {   
    fs.readFile(__dirname + req.url, function (err, data) {
        if (err) {
            l.error(JSON.stringify(err));
            res.writeHead(404);
            res.end(ERROR);
            return;            
        }
        res.writeHead(200);
        res.end(data);
    });
}

function convert(req, res, type) {
    var body = "";
    req.on('data', function(chunk) {
        body += chunk;
    });
    req.on('end', function() {
        l.debug(body);
        var data = JSON.parse(body); 
        var parsedXML = xml.parse(data.svg);  
        var width = parsedXML[0].attributes.width;
        var height = parsedXML[0].attributes.height;  
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
        
        var filenameSvg = `${APP_DATA}\\${d}+${filename}.svg`; 
        var filenameConverted = `${APP_DATA}\\${d}+${filename}.${type}`; 

        fs.writeFile(filenameSvg, data.svg, function(err) {
            if(err) {
                l.error(JSON.stringify(err));
                res.writeHead(404);
                res.end(ERROR);
                return;
            }
            l.info(`${filenameSvg} file was saved; width: ${width}; height: ${height};`);
            var fileurl = fileUrl(filenameSvg);
            (async () => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();
                await page.goto(fileurl, { waitUntil: 'networkidle2' });
                if (type == "png"){
                    await page.screenshot({
                        path: filenameConverted,
                        clip : {
                            x      : 0,
                            y      : 0,
                            width  : width,
                            height : height
                        }
                    });
                }
                else if (type == "pdf"){
                    await page.pdf({
                        path: filenameConverted,
                        width: width,
                        height: height,
                        printBackground: true
                    });
                }

                await browser.close();

                fs.readFile(filenameConverted, function (err, filedata) {
                    if (err) {
                        l.error(JSON.stringify(err));
                        res.writeHead(404);
                        res.end(ERROR);
                        return;                        
                    }
                    l.info(`${filenameConverted} file was converted;`);
                    res.writeHead(200);
                    res.end(filedata);
                });
            })();              
        });         
    });
}

function isGet(req, path){
    return (req.url == path && req.method.toLowerCase() == "get"); 
}

function isPost(req, path){
    return (req.url == path && req.method.toLowerCase() == "post"); 
}

process.on('uncaughtException', function(err) {    
    l.error(err.message);
    l.error(err.stack);
});

