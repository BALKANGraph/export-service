
const puppeteer = require('puppeteer');
const util = require('./util.js');
const fs = require('fs');
const dir = './appdata';
const merge = require('easy-pdf-merge');




const puppeteerParams = {
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

function export2(path, req, callback){  
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
 
    util.delFiles(dir);

    var html = exportHtml(req.content, req.options, req.format);
    fs.writeFileSync(path.sourcepath, html);  
    

    
    (async () => {
        const browser = await puppeteer.launch(puppeteerParams);
        const page = await browser.newPage();
    
        await page.goto(path.sourceurl, { waitUntil: 'networkidle2' });
        
        var pagesForMerge = [];

        for(var i = 0; i < req.format.pages.length; i++){
            var currentPage = req.format.pages[i];

            var vb = currentPage.vb;
            var header = req.options.header.replace('{current-page}', i + 1).replace('{total-pages}', req.format.pages.length);
            var footer = req.options.footer.replace('{current-page}', i + 1).replace('{total-pages}', req.format.pages.length);
            var marginTop = req.options.margin[0];
            var marginBottom = req.options.margin[2];
            await page.evaluate((data) => {
                var svg = document.querySelector('svg');
                svg.setAttribute("viewBox", data.vb);    
                document.documentElement.style.backgroundColor = svg.style.backgroundColor;
                var bgheader = document.getElementById('bg-header');
                var bgfooter = document.getElementById('bg-footer');                
                bgheader.innerHTML = data.header;
                bgfooter.innerHTML = data.footer;
                bgheader.style.top = (data.marginTop - bgheader.offsetHeight - 7) + 'px';
                bgfooter.style.bottom = (data.marginBottom - bgfooter.offsetHeight - 7) + 'px';
                
            }, {vb, header, footer, marginTop, marginBottom});          
        

            if (req.options.ext == "pdf" && req.options.format){                
                var pagepath = util.pagePdfPath(__dirname, dir);
                pagesForMerge.push(pagepath);
                await page.pdf({
                    printBackground: true,
                    path: pagepath,
                    pageRanges: '1',
                    margin: {
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    },
                    width  : req.format.size.w + 'px',
                    height :  req.format.size.h + 'px'
                });  
            }
            else if (req.options.ext == "png") {
                await page.screenshot({
                    path: path.targetpath,
                    printBackground: true,
                    clip : {
                        x      : 0,
                        y      : 0,
                        width  : parseFloat(req.format.size.w),
                        height :  parseFloat(req.format.size.h)
                    },
                });  
            }
        }

        if (pagesForMerge.length > 1){
            merge(pagesForMerge, path.targetpath, function(err){
                if(err)
                    return console.log(err);
                        
                callback(); 
            });
        }
        else if (pagesForMerge.length == 1){
            fs.copyFile(pagesForMerge[0], path.targetpath, (err) => {
                if (err) throw err;
                callback(); 
            });
        }
        else{
            callback();
        }       
        browser.close();
    })(); 
}


function exportHtml(svg, options, format){    
    var smargin = '';
    for(var j = 0; j < options.margin.length; j++){
        smargin += (options.margin[j] + 'px ');
    }
    return '<!DOCTYPE html><html style="margin:0;padding:0;"><head></head><body style="margin:0; padding:0;">'
        + '<div style="margin: ' + smargin  + ';overflow:hidden;width:' + format.innerSize.w + 'px;height:' + (format.innerSize.h) + 'px">'
        + '<div id="bg-header" style="position:absolute;left:' + options.margin[3] + 'px;"></div>'
        + svg
        + '<div id="bg-footer" style="position:absolute;left:' + options.margin[3] + 'px;"></div>'
        +  '</div></body></html>';
}


module.exports = export2;