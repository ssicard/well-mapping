var basemap = new L.TileLayer(baseUrl, {maxZoom: 20, attribution: baseAttribution, subdomains: subdomains, opacity: opacity});
var center = new L.LatLng(0, 0);
var map = new L.Map('map', {center: center, zoom: 2, maxZoom: maxZoom, layers: [basemap]});


//=============================== Parish Boundaries ==========================================//

//json from http://eric.clst.org/tech/usgeojson/
jQuery.getJSON(parishesUrl, function(data){
  let parishStyle = function (feature) {
    return {
      //change border color
      dashArray: '',
      color: '#15560d',
      fillColor: '#15560d'
    }
  }

  let geoJSONOptions = {
    onEachFeature: onEachFeature,
    style: parishStyle,
    filter: function(feature, layer) {
      return feature.properties.STATE == 22;
    }
  }

  parishes = L.geoJson(data, geoJSONOptions).addTo(map);

  try {
      var bounds = parishes.getBounds();
      if (bounds) {
          map.fitBounds(bounds);
      }
  } catch(err) {
      // pass
  }
});

function onEachFeature(feature, parishLayer) {
    parishLayer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: displayProdDataByParish
    });
}

function highlightFeature(e) {
  var parishLayer = e.target;

  parishLayer.setStyle({
    weight: 5,
    dashArray: '',
    fillOpacity: 0.7
  });
}

function resetHighlight(e) {
  parishes.resetStyle(e.target);
  // info.update();
}

function displayProdDataByParish(e) {
  var parishLayer = e.target;
  var parishCode = translateToParishCode(parishLayer.feature.properties.COUNTY);
  // console.log(parishCode);

  //get data from csv

  //Update Parish Info Bar
  if(parishCode > 0 && parishCode < 69){
    info.update(parishLayer.feature.properties);
  }
  else{
    info.update();
  }

}

function translateToParishCode(countyCode){
  code = parseInt(countyCode);
  return (code+001)/2;
}

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
}

info.update = function (props) {
  this._div.innerHTML = '<h4> Parish Production Information </h4>' + (props ?
  '<b> Parish: </b> ' + props.NAME : 'Click on a state');
};

info.addTo(map);

<<<<<<< Updated upstream
//=============================== Well Mapping ==========================================//
=======

//=============================== Begin Well Mapping ==========================================//
>>>>>>> Stashed changes

var popupOpts = {
    autoPanPadding: new L.Point(5, 50),
    autoPan: true
};

var wellPoints = L.geoCsv (null, {
    firstLineTitles: true,
    fieldSeparator: fieldSeparator,
<<<<<<< Updated upstream
    onEachFeature: function (feature, layer) {
        var popup = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
        for (var clave in feature.properties) {
            var title = points.getPropertyTitle(clave).strip();
            var attr = feature.properties[clave];
            if (title == labelColumn) {
                layer.bindLabel(feature.properties[clave], {className: 'map-label'});
            }
            if (attr.indexOf('http') === 0) {
                attr = '<a target="_blank" href="' + attr + '">'+ attr + '</a>';
            }
            if (attr) {
                popup += '<tr><th>'+title+'</th><td>'+ attr +'</td></tr>';
            }
        }
        popup += "</table></popup-content>";
        layer.bindPopup(popup, popupOpts);
    }
});

var hits = 0;
var total = 0;
=======
    onEachFeature: displayWellPopup
});

function displayWellPopup(feature, layer){
  var popup = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
  for (var clave in feature.properties) {
      var title = wellPoints.getPropertyTitle(clave).strip();
      var attr = feature.properties[clave];
      if (title == labelColumn) {
          layer.bindLabel(feature.properties[clave], {className: 'map-label'});
      }
      if (attr.indexOf('http') === 0) {
          attr = '<a target="_blank" href="' + attr + '">'+ attr + '</a>';
      }
      if (attr) {
          popup += '<tr><th>'+title+'</th><td>'+ attr +'</td></tr>';
      }
  }
  popup += "</table></popup-content>";
  layer.bindPopup(popup, popupOpts);
}

>>>>>>> Stashed changes
var markers = new L.MarkerClusterGroup();
var wellCsv;

var addCsvMarkers = function() {
    map.removeLayer(markers);
    wellPoints.clearLayers();

    markers = new L.MarkerClusterGroup(clusterOptions);
    wellPoints.addData(wellCsv);
    markers.addLayer(wellPoints);

    map.addLayer(markers);
<<<<<<< Updated upstream
    try {
        var bounds = markers.getBounds();
        if (bounds) {
            map.fitBounds(bounds);
        }
    } catch(err) {
        // pass
    }
=======

>>>>>>> Stashed changes
    return false;
};

if(typeof(String.prototype.strip) === "undefined") {
    String.prototype.strip = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

map.addLayer(markers);

//=============================== End Well Mapping ==========================================//
//=============================== Begin Production Data Helpers ==========================================//


function parseProdData(csv){
  console.log('parsing');

  //STEPS:
  //parse data into something i can access
  //access the thing and associate it with parish condensed

  //what is the something i can access
}

//=============================== End Production Data Helpers ==========================================//
//=============================== Begin File Loading ==========================================//

$(document).ready( function() {
    $.ajax (
      {
        type:'GET',
        dataType:'text',
        url: wellCoordsUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error retrieving csv file');
        },
        success: function(csv) {
            wellCsv = csv;
            addCsvMarkers();
        }
    }
  );
  $.ajax (
    {
      type:'GET',
      dataType:'text',
      url: prodDetailsUrl,
      contentType: "text/csv; charset=utf-8",
      error: function() {
          alert('Error retrieving csv file');
      },
      success: function(csv) {
        parseProdData(csv);
      }
   }
  );

  $("#clear").click(function(evt){
        evt.preventDefault();
        addCsvMarkers();
  });
});

//=============================== Production Data ==========================================//

//=============================== Shape Files ==========================================//
// var shpfile = new L.Shapefile('gas_and_oil_fields.zip', {
// 			onEachFeature: function(feature, layer) {
// 				if (feature.properties) {
// 					layer.bindPopup(Object.keys(feature.properties).map(function(k) {
// 						return k + ": " + feature.properties[k];
// 					}).join("<br />"), {
// 						maxHeight: 200
// 					});
// 				}
// 			}
// 		});
// 		shpfile.addTo(map);
//     shpfile.once("data:loaded", function() {
//       console.log("finished loaded shapefile");
//   });
//=============================== End File Loading ==========================================//
