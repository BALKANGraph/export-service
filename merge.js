var merge = require('easy-pdf-merge');

merge(['./appdata/test0.pdf', './appdata/test1.pdf'],'./appdata/m.pdf',function(err){

    if(err)
        return console.log(err);

    console.log('Success');
});
