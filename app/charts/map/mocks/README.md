1. Get bio-discomap.xml

```
curl
'https://bio.discomap.eea.europa.eu/arcgis/services/Ecosystem/Ecosystems/MapServer/WMSServer?SERVICE=WMS&REQUEST=GetCapabilities&VERSION=1.3.0&FORMAT=text%2Fxml&lang=en'
--compressed -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15;
rv:137.0) Gecko/20100101 Firefox/137.0' -H 'Accept: application/json,
text/plain, _/_' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip,
deflate, br, zstd' -H 'Origin: https://map.geo.admin.ch' -H 'Connection:
keep-alive' -H 'Referer: https://map.geo.admin.ch/' -H 'Sec-Fetch-Dest: empty'
-H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: cross-site' -H 'Priority: u=0' -H
'Pragma: no-cache' -H 'Cache-Control: no-cache'
```

2. Get geo-admin.wmts.xml

```
curl 'https://wmts.geo.admin.ch/EPSG/3857/1.0.0/WMTSCapabilities.xml?SERVICE=WMTS&REQUEST=GetCapabilities&lang=en' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0' -H 'Accept: application/json, text/plain, */*' -H 'Accept-Language: en-US,en;q=0.5' -H 'Accept-Encoding: gzip, deflate, br, zstd' -H 'Origin: https://map.geo.admin.ch' -H 'Connection: keep-alive' -H 'Referer: https://map.geo.admin.ch/' -H 'Sec-Fetch-Dest: empty' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Site: same-site' -H 'Priority: u=0' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'TE: trailers'
```
