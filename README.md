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

[VIDEO TUTORIAL](https://www.youtube.com/watch?v=0aoycuMtqNc&feature=youtu.be)



## IIS 7.x/8.x

1. Install [URL rewrite module for IIS](https://www.iis.net/downloads/microsoft/url-rewrite)

2. Install iisnode for IIS 7.x/8.x: [x86](https://github.com/azure/iisnode/releases/download/v0.2.21/iisnode-full-v0.2.21-x86.msi) or [x64](https://github.com/azure/iisnode/releases/download/v0.2.21/iisnode-full-v0.2.21-x64.msi) - choose bitness matching your system

3. Make sure that your root folder for the nodejs apps (wwwnodes from the video tutorial) has read and write permissions for the IISUSER

4. Add the following web config in *export-service* folder

```
<configuration>
  <appSettings>
    <add key="virtualDirPath" value="/export" />
  </appSettings>
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="Access-Control-Allow-Origin" value="*" />
        <add name="Access-Control-Allow-Methods" value="*" />
        <add name="Access-Control-Allow-Headers" value="*" />
      </customHeaders>
    </httpProtocol>
    <security>
      <requestFiltering>
        <requestLimits maxAllowedContentLength="30000000" />
      </requestFiltering>
    </security>
    <handlers>
      <add name="iisnode" path="app.js" verb="*" modules="iisnode" />
    </handlers>
    <rewrite>
      <rules>
        <rule name="default">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false" />
          <action type="Rewrite" url="app.js" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

=======================

## OS Specific

For CentOS 7 execute:

```
yum install pango.x86_64 libXcomposite.x86_64 libXcursor.x86_64 libXdamage.x86_64 libXext.x86_64 libXi.x86_64 libXtst.x86_64 cups-libs.x86_64 libXScrnSaver.x86_64 libXrandr.x86_64 GConf2.x86_64 alsa-lib.x86_64 atk.x86_64 gtk3.x86_64 -y

yum install ipa-gothic-fonts xorg-x11-fonts-100dpi xorg-x11-fonts-75dpi xorg-x11-utils xorg-x11-fonts-cyrillic xorg-x11-fonts-Type1 xorg-x11-fonts-misc -y
```
