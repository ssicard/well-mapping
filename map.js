let map = L.map('map').setView([31.1, -91.8], 8);
let grayBasemap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}').addTo(map);

//json from http://eric.clst.org/tech/usgeojson/
jQuery.getJSON("data/counties.json", function(data){
  let parishStyle = function (feature) {
    return {
      fillColor: '#15560d'
    }
  }

  let geoJSONOptions = {
    onEachFeature: createPopup,
    style: parishStyle,
    filter: function(feature, layer) {
      return feature.properties.STATE == 22;
    }
  }

  L.geoJson(data, geoJSONOptions).addTo(map);
});

//map.fitBounds(datalayer.getBounds());


let createPopup = function (feature, layer) {

  let string = '<b>State: </b>' + feature.properties.STATE + '</br>';
  string += '<b>Parish: </b>' + feature.properties.COUNTY + '</br>';
  string += '<b>Name: </b>' + feature.properties.NAME + '</br>';

  layer.bindPopup(string);

}
