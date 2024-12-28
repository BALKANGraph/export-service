
const puppeteer = require('puppeteer');
const util = require('./util.js');
const fs = require('fs');
const dir = './appdata';
const merge = require('easy-pdf-merge');




const puppeteerParams = {
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
};

function export4(path, bodies, callback){  
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
 
    util.delFiles(dir);



    (async () => {
        const browser = await puppeteer.launch(puppeteerParams);
        const page = await browser.newPage();

        
        var pagesForMerge = [];
        var currentPageIndex = 0;

        var totalPagesCount = 0;
        for(var body of bodies){
            totalPagesCount += body.pages.length;
        }

        for(var body of bodies){
            for(var i = 0; i < body.pages.length; i++){
                currentPageIndex++;
                var currentPage = body.pages[i];
                var vb = currentPage.vb;
                var header = body.options.header;
                var footer = body.options.footer;
                if (currentPage.header){
                    header = currentPage.header;
                }
                if (header){
                    header = header.replace('{current-page}', currentPageIndex).replace('{total-pages}', totalPagesCount);
                }
                if (currentPage.footer){
                    footer = currentPage.footer;
                }
                if (footer){
                    footer = footer.replace('{current-page}', currentPageIndex).replace('{total-pages}', totalPagesCount);
                } 
                var marginTop = body.options.margin[0];
                var marginBottom = body.options.margin[2];
                var backgroundColor = currentPage.backgroundColor;
                if (backgroundColor == undefined){
                    backgroundColor = '';
                }
        
                var content =  currentPage.html ? currentPage.html : body.content;
        
                var styles = body.styles ? body.styles : '';
                var html = exportHtml(content + styles, body.options, currentPage.innerSize.w, currentPage.innerSize.h, header, footer);
    
                var htmlPath = util.pageHtmlPath(__dirname, dir, path.href);
        
                fs.writeFileSync(htmlPath.path, html);
    
                await page.goto(htmlPath.url, { waitUntil: 'networkidle2' });
    
    
                await page.evaluate((data) => {
                    var svg = document.querySelector('svg');
                    if (svg && data.vb){
                        svg.setAttribute("viewBox", data.vb);    
                    }
    
                    if (svg && svg.style.backgroundColor){                                      
                        document.documentElement.style.backgroundColor = svg.style.backgroundColor;
                    }
    
                    if (data.backgroundColor){
                        document.documentElement.style.backgroundColor = data.backgroundColor;           
                    }
    
                    var bgheader = document.getElementById('bg-header');
                    var bgfooter = document.getElementById('bg-footer'); 
                    
                    if (bgheader){
                        var top = data.marginTop - bgheader.offsetHeight - 7;
                        bgheader.style.top = top + 'px';
                    }          
    
                    if (bgfooter){
                        var bottom = data.marginBottom - bgfooter.offsetHeight - 7;
                        bgfooter.style.bottom = bottom + 'px';
                    }                
                }, {vb, header, footer, marginTop, marginBottom, backgroundColor});          
    
    
                if (body.options.ext == "pdf"){                
                    var pagepath = util.pagePdfPath(__dirname, dir);
                    pagesForMerge.push(pagepath);
                    await page.pdf({
                        printBackground: true,
                        path: pagepath,
                        pageRanges: '1',
                        timeout: 180000, //3 minutes timeout
                        margin: {
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0
                        },
                        width  : currentPage.size.w + 'px',
                        height :  currentPage.size.h + 'px'
                    });  
                }
                else if (body.options.ext == "png") {
                    await page.screenshot({
                        path: path.targetpath,
                        printBackground: true,
                        timeout: 180000,
                        //fullPage: true
                        clip : {
                            x      : 0,
                            y      : 0,
                            width  : parseFloat(currentPage.size.w),
                            height :  parseFloat(currentPage.size.h)
                        }
                    });  
                }
            };
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


function exportHtml(html, options, w, h, header, footer){    
    var smargin = '';
    for(var j = 0; j < options.margin.length; j++){
        smargin += (options.margin[j] + 'px ');
    }
    var mode = '';
    if (options.mode){
        mode = options.mode;
    }
    var result = '<!DOCTYPE html><html style="margin:0;padding:0;"><head></head><body class="export-service ' + mode + '" style="margin:0; padding:0;">'
        + '<div style="margin: ' + smargin  + ';overflow:hidden;width:' + w + 'px;height:' + (h) + 'px">';

        if (header){
            result += '<div id="bg-header" style="width:' + w + 'px;color:#757575;position:absolute;left:' + options.margin[3] + 'px;top:0;">' +  header + '</div>';
        }

        result += html;

        if (footer){
            result += '<div id="bg-footer" style="width:' + w + 'px;color:#757575;position:absolute;left:' + options.margin[3] + 'px;bottom:0;">' +  footer + '</div>';
        }

    result +=  '</div>';     
    result += '</body></html>';

    return result;
}



module.exports = export4;