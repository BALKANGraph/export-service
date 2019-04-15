
const puppeteer = require('puppeteer');
const util = require('./util.js');
const dir = './appdata';


const puppeteerParams = {
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

function export1(path, options, callback){    
    util.delFiles(dir);
    
    (async () => {
        const browser = await puppeteer.launch(puppeteerParams);
        const page = await browser.newPage();
    
        await page.goto(path.sourceurl, { waitUntil: 'networkidle2' });       

        if (options.ext == "pdf" && options.format){
            await page.pdf({
                printBackground: true,
                path: path.targetpath,
                landscape: options.landscape,
                format: options.format,
                margin: {top: options.margin.top, right: options.margin.right, bottom: options.margin.bottom, left: options.margin.left },
            });  
        }
        else if (options.ext == "pdf"){
            await page.pdf({
                printBackground: true,
                path: path.targetpath,
                width  : options.width,
                height : options.height,
                margin: {top: options.margin.top, right: options.margin.right, bottom: options.margin.bottom, left: options.margin.left },
            });  
        }
        else if (options.ext == "png") {
            await page.screenshot({
                path: path.targetpath,
                printBackground: true,
                clip : {
                    x      : 0,
                    y      : 0,
                    width  : parseFloat(options.width),
                    height :  parseFloat(options.height)
                },
                margin: {top: options.margin.top, right: options.margin.right, bottom: options.margin.bottom, left: options.margin.left },
            });  
        }

        callback();
    
        browser.close();
    })(); 
}


module.exports = export1;