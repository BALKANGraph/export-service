
// const puppeteer = require('puppeteer');
// const util = require('./util.js');

// // const A4w = 794;  
// // const A4h = 1123;  
// // const MARGIN  = "30px";
// const dir = './appdata';

// const puppeteerParams = {
//     headless: true, 
//     args: ['--no-sandbox', '--disable-setuid-sandbox']
// };


// function pdf(p, op, callback){
//     util.delFiles(dir);
//     print(p, op, callback);    
// }

// function print(path, op, callback){    
//     (async () => {
//         const browser = await puppeteer.launch(puppeteerParams);
//         const page = await browser.newPage();
    
//         await page.goto(path.sourceurl, { waitUntil: 'networkidle2' });       

//         await page.pdf({
//             printBackground: true,
//             path: path.targetpath,
//             landscape: op.landscape,
//             format: op.format,
//             margin: {top: op.margin.top, right: op.margin.right, bottom: op.margin.bottom, left: op.margin.left },
//         });  

//         callback();
    
//         browser.close();
//     })(); 
// }

// // function printA4html(path, landscape, callback){  
// //     (async () => {
// //         const browser = await puppeteer.launch(puppeteerParams);
// //         const page = await browser.newPage();
// //         await page.setJavaScriptEnabled(false)
// //         await page.goto(path.sourceurl, { waitUntil: 'networkidle2' });
// //         await page.setViewport({width:A4h, height:A4w});

// //         let res = await page.evaluate(() => {
// //             var w = document.body.clientWidth;        
// //             var h = document.body.clientHeight;

// //             return {
// //                 w: w,
// //                 h: h
// //             };
// //         });


// //         console.log(res.w)
// //         console.log(res.h)

        
// //         await page.pdf({
// //             printBackground: true,
// //             path: path.targetpath,
// //             width: A4h + "px",
// //             height: A4w + "px",       
// //         });  


// //         browser.close();
// //     })(); 
// // };

// // function printsvg(url){  
// //     (async () => {
// //         const browser = await puppeteer.launch(puppeteerParams);
// //         const page = await browser.newPage();
// //         await page.goto(url, { waitUntil: 'networkidle2' });

// //         let res = await page.evaluate(() => {
// //             var svg = document.querySelector('svg');
// //             var w = parseFloat(svg.getAttribute("width"));        
// //             var h = parseFloat(svg.getAttribute("height"));

// //             return {
// //                 w: parseFloat(w),
// //                 h: parseFloat(h)
// //             };
// //         });

        
// //         var ext = 'pdf';
// //         var path = util.newPath(dir, ext); 
// //         await page.pdf({
// //             printBackground: true,
// //             path: path,
// //             landscape: false,
// //             width: res.w + "px",
// //             height: res.h + 5 + "px"
// //         });  

// //         browser.close();
// //     })(); 
// // };

// // function printA4svg(url, landscape){    
// //     (async () => {
// //         const browser = await puppeteer.launch(puppeteerParams);
// //         const page = await browser.newPage();
// //         const size = landscape ? A4h : A4w;
    
// //         await page.goto(url, { waitUntil: 'networkidle2' });
    
// //         let res = await page.evaluate(() => {
// //             var svg = document.querySelector('svg');
// //             svg.setAttribute("preserveAspectRatio", 'xMinYMin slice');
// //             var w = parseFloat(svg.getAttribute("width"));        
// //             var h = parseFloat(svg.getAttribute("height"));
// //             var vb = svg.getAttribute("viewBox");
    
// //             vb = vb.split(',');
    
// //             for(var i = 0; i < vb.length; i++){
// //                 vb[i] = parseFloat(vb[i]);
// //             }
    
// //             return {
// //                 w: w,
// //                 h: h,
// //                 vb: vb
// //             };
// //         });
        
// //         var vx = res.vb[0];
// //         var vy = res.vb[1];
// //         var vw = res.vb[2];
// //         var vh = res.vb[3];
// //         var w = size;
    
// //         var pages = [];
// //         while(vx < vw){
// //             var vb = [vx, vy, vw, vh];
// //             vb = vb.join(); 

// //             pages.push({vb: vb, w: w})
    
// //             vx += size;
// //             w += size;     
// //             if (w > res.w){
// //                 w =  res.w;
// //             }
// //         }    
    
// //         async function setViewBoxAndWidth(width, viewBox) {
// //             page.evaluate((data) => {
// //                 var svg = document.querySelector('svg');
// //                 svg.setAttribute("width", data.width);
// //                 svg.setAttribute("viewBox", data.viewBox);
// //             }, {width, viewBox})
// //         }
    
// //         for (var i = 0; i < pages.length; i++){
// //             var p = pages[i];       
// //             console.log(JSON.stringify(p.vb));
// //             console.log(p.w);
// //             await setViewBoxAndWidth(p.w, p.vb);
                
// //             var ext = 'pdf';
// //             var path = util.newPath(dir, ext); 
// //             await page.pdf({
// //                 printBackground: true,
// //                 path: path,
// //                 landscape: landscape,
// //                 margin: {top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
// //                 format: 'A4'
// //             });  
// //         }  
    
// //         browser.close();
// //     })(); 
// // }


// module.exports = pdf;