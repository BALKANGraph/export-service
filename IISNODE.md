## How to host nodejs app in IIS 7.x/8.x

1. Install [URL rewrite module for IIS](https://www.iis.net/downloads/microsoft/url-rewrite)

2. Install iisnode for IIS 7.x/8.x: [x86](https://github.com/azure/iisnode/releases/download/v0.2.21/iisnode-full-v0.2.21-x86.msi) or [x64](https://github.com/azure/iisnode/releases/download/v0.2.21/iisnode-full-v0.2.21-x64.msi) - choose bitness matching your system

3. Make sure that your root folder for the nodejs apps (wwwnodes from the video tutorial) has read and write permissions for the IISUSER

4. Create *web.config* file in *export-service* folder

```
<configuration>
  <appSettings>
    <add key="virtualDirPath" value="" />
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

5. Create new Website or Application or Virtual Directory in IIS with physical path pointing to *export-service* folder. If you've created Application or Virtual Directory instead of Website add the name to the appSettings section in the web.config. For example if your Application name is *export* add:


```
<add key="virtualDirPath" value="/export" />
```

