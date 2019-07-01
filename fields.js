var basemap = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 20, opacity: 1.0});
var center = new L.LatLng(0, 0);
var m = new L.Map('map', {center: center, zoom: 2, maxZoom: 10, layers: [basemap]});

var shpfile = new L.Shapefile(fieldShapefileUrl, {
  onEachFeature: function(feature, layer) {
    if (feature.properties) {
      layer.bindPopup(Object.keys(feature.properties).map(function(k) {
        return k + ": " + feature.properties[k];
      }).join("<br />"), {
        maxHeight: 200
      });
    }
    layer.on({
      click: function(e){
        console.log(e.target.feature.properties.Field_Name);
      }
    })
  }
});
shpfile.addTo(m);
shpfile.once("data:loaded", function() {
  console.log("finished loaded shapefile");
});
