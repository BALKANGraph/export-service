## Installation Instructions Export Service - OrgChart JS | BALKANGraph


#### Installation


Install [nodejs](https://nodejs.org/en/download/)

Execute the folloing command in the terminal (cmd):
```
npm i @balkangraph/export-service
node node_modules/@balkangraph/export-service/app.js
```

#### Test the Isntallation 

Open the following url in a browser:

```
http://127.0.0.1:1337/index.html
```

You should see:

![OrgChart](https://balkangraph.com/content/img/test-export.png)

If the installation is successful the test file should be exported

#### Usage

Change exportUrl option to point to your export service server url
```
var chart = new OrgChart(document.getElementById("tree"), {
    exportUrl: [Your URL]
    ... 
});
```

Example:
```
var chart = new OrgChart(document.getElementById("tree"), {
    exportUrl: 'http://127.0.0.1:1337'
    ... 
});
```

[VIDEO TUTORIAL](https://www.youtube.com/watch?v=0aoycuMtqNc&feature=youtu.be)

If you are installing on Windows and want to host in IIS see [How to host nodejs app in IIS 7.x/8.x](https://github.com/BALKANGraph/export-service/blob/master/IISNODE.md)




#### OS Specific

For CentOS 7 execute:

```
yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 -y

yum install ipa-gothic-fonts xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-utils xorg-x11-fonts-cyrillic xorg-x11-fonts-Type1 xorg-x11-fonts-misc -y
```
