import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Free map (OpenStreetMap tiles + Leaflet) — no API key, no billing account.
// Props: latitude/longitude (center), zoom, markers=[{latitude,longitude,title}],
//        selected={latitude,longitude} (extra marker), onPress({latitude,longitude}), style.
const buildHtml = ({ latitude, longitude, zoom, markers, selected, interactive }) => `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>html,body,#m{height:100%;margin:0;padding:0}</style></head><body><div id="m"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map=L.map('m',{zoomControl:false,attributionControl:true}).setView([${latitude},${longitude}],${zoom});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
var pin=L.divIcon({className:'',html:'<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#f97316;border:2px solid #fff;transform:rotate(-45deg);box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',iconSize:[22,22],iconAnchor:[11,22]});
var ms=${JSON.stringify(markers)};
ms.forEach(function(m){var k=L.marker([m.latitude,m.longitude],{icon:pin}).addTo(map);if(m.title)k.bindPopup(m.title);});
var sel=null;
function setSelected(lat,lng){if(sel)map.removeLayer(sel);sel=L.marker([lat,lng],{icon:pin}).addTo(map);}
${selected ? `setSelected(${selected.latitude},${selected.longitude});` : ''}
${interactive ? `map.on('click',function(e){setSelected(e.latlng.lat,e.latlng.lng);window.ReactNativeWebView.postMessage(JSON.stringify({latitude:e.latlng.lat,longitude:e.latlng.lng}));});` : ''}
</script></body></html>`;

export default function OSMap({ latitude, longitude, zoom = 16, markers, selected, onPress, style }) {
  const ref = useRef(null);
  const lat = Number(latitude);
  const lng = Number(longitude);
  const valid = Number.isFinite(lat) && Number.isFinite(lng);
  const markerKey = JSON.stringify(markers || []);

  // The page is rebuilt only when the center/markers change, so taps don't reload tiles.
  const html = useMemo(
    () => buildHtml({ latitude: lat, longitude: lng, zoom, markers: markers || [], selected: null, interactive: !!onPress }),
    [lat, lng, zoom, markerKey, !!onPress] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (selected && ref.current) ref.current.injectJavaScript(`setSelected(${selected.latitude},${selected.longitude});true;`);
  }, [selected?.latitude, selected?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!valid) return <View style={[styles.fill, style]} />;
  return (
    <View style={[styles.fill, style]}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.fill}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
        onMessage={(e) => {
          try {
            onPress && onPress(JSON.parse(e.nativeEvent.data));
          } catch (_) {}
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1, overflow: 'hidden' } });
