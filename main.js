import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import { Vector as VectorSource } from 'ol/source.js';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';
import { fromLonLat } from 'ol/proj.js';
import { Icon, Style } from 'ol/style.js'
import Overlay from 'ol/Overlay';

//unuk menampilkan polygon riau
const riau = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'data/polygon_riau.json'
  })
});//end

const kabRiau = new VectorLayer({
  background: '#1a2b39',
  source: new VectorSource({
    url: 'data/kab_riau.json',
    format: new GeoJSON(),
  }),
  style: {
    'fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'FID'],
      1,
      '#ffff33',
      13,
      '#3358ff',
    ],
  },
});


//untuk menampilkan titik banjir
const banjir = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: 'data/banjir.json'
  }),
  style: new Style({
    image: new Icon({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'icon/flood2.png',
      width: 32,
      height: 32
    })
  })
}); //end

const container = document.getElementById('popup');
const content_element = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

//create overlay popup
const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    riau,
    kabRiau,
    banjir,

  ],
  overlays: [overlay],
  view: new View({
    center: fromLonLat([101.438309, 0.510440]),
    zoom: 8,
  }),
})

let highlight;
const highlightFeature = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });
  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feat) {
    return feat;
  });
  const info = document.getElementById('info');
  if (feature) {
    info.innerHTML = feature.get('Kabupaten') || '&nbsp;';
  } else {
    info.innerHTML = '&nbsp;';
  }
};

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: {
    'stroke-color': 'rgba(255, 255, 255, 0.7)',
    'stroke-width': 2,
  },
});

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    popup.setPosition(undefined);
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  highlightFeature(pixel);
  displayFeatureInfo(pixel);
});

const polygonLayerCheckbox = document.getElementById('polygon');
const pointLayerCheckbox = document.getElementById('point');
polygonLayerCheckbox.addEventListener('change', function () {
  kabRiau.setVisible(polygonLayerCheckbox.checked);
});
pointLayerCheckbox.addEventListener('change', function () {
  banjir.setVisible(pointLayerCheckbox.checked);
});

map.addOverlay(overlay); //untuk menambah overlay
// JS for click popup

map.on('singleclick', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  if (!feature) {
    return;
  }
  const coordinate = evt.coordinate;
  const content = '<h3>Nama Daerah: ' + feature.get('Nama_Pemetaan') +
    '</h3>' + '<p>Jumlah Korban: ' + feature.get('Jumlah_Korban') + '</p>';
  content_element.innerHTML = content;
  overlay.setPosition(coordinate);
});

//Click handler to hide popup
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

const popup = new Overlay({
  element: document.getElementById('popup'),
  positioning: 'top-center',
  stopEvent: false,
  offset: [0, -15]
});
map.addOverlay(popup);
map.on('singleclick', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feat) { return feat; });
  if (feature) {
    const coordinates = feature.getGeometry().getCoordinates();
    let content = '<h3>Informasi Fitur</h3>';
    content += '<p>Nama Daerah: <strong>' + feature.get('Nama_Pemetaan') +
      '</strong></p>' + '<p>Jumlah Korban: ' + feature.get('Jumlah_Korban') + '</p>';
    document.getElementById('popup-content').innerHTML = content;

    popup.setPosition(coordinates);
  } else {
    popup.setPosition(undefined);
  }
});
