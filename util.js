
const fs = require('fs');
const path = require('path');
const ONE_HOUR = 3600000;
const { v4: uuidv4 } = require('uuid');


module.exports = {
    newPath: function (dir, href, appdata, extsorce, exttarget) {        
        var s = 1;
        while (fs.existsSync(path.join(dir, appdata, `${s}.${extsorce}`))){
            s++;
        }

        var t = 1;
        while (fs.existsSync(path.join(dir, appdata, `${t}.${exttarget}`))){
            t++;
        }

        return { 
            sourcepath: path.join(dir, appdata, `${s}.${extsorce}`),
            targetpath: path.join(dir, appdata, `${t}.${exttarget}`),
            sourceurl: href + `${appdata}/${s}.${extsorce}`,
            targeturl: href + `${appdata}/${t}.${exttarget}`,
            href: href
        };
    },

    pagePdfPath: function (dir, appdata) {        
        var guid = uuidv4();
        
        return path.join(dir, appdata, `${guid}.pdf`);
    },

    pageHtmlPath: function (dir, appdata, href) {        
        var guid = uuidv4();

        return { 
            path: path.join(dir, appdata, `${guid}.html`),
            url: href + `/appdata/${guid}.html`
        };
    },


    delFiles: function (dir) {
        fs.readdirSync(dir).forEach(file => {
            var filePath = path.join(dir, file);

            var stat = fs.statSync(filePath);

            var now = new Date().getTime();
            var ctime = Date.parse(stat.ctime);

            if ((now - ctime > ONE_HOUR)){
                fs.unlink(filePath, function () { });
            }
        });
    }
};

