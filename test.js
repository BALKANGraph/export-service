
var export1 = require('./export1.js');
var util = require('./util.js');


var path = { sourcepath: 'C:\\GitHub\\export-service\\tests\\oc.html',
    targetpath: 'C:\\GitHub\\export-service\\appdata\\1.pdf',
    sourceurl: 'file://C:/GitHub/export-service/tests/oc.html',
    targeturl: 'file://C:/GitHub/export-service/appdata/1.pdf' 
};

var options = {
    margin:"30px",
    landscape: true,
    format: "A4"
};

export1(path, options);    


