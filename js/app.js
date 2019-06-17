var basemap = new L.TileLayer(baseUrl, {maxZoom: 20, attribution: baseAttribution, subdomains: subdomains, opacity: opacity});

var center = new L.LatLng(0, 0);

var map = new L.Map('map', {center: center, zoom: 2, maxZoom: maxZoom, layers: [basemap]});


//=============================== Parish Boundaries ==========================================//

//json from http://eric.clst.org/tech/usgeojson/
jQuery.getJSON(parishesUrl, function(data){
  let parishStyle = function (feature) {
    return {
      fillColor: '#15560d',
      color: '#15560d'
    }
  }

  let geoJSONOptions = {
    onEachFeature: onEachFeature,
    style: parishStyle,
    filter: function(feature, parishLayer) {
      return feature.properties.STATE == 22;
    }
  }

  geojson = L.geoJson(data, geoJSONOptions).addTo(map);
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
  geojson.resetStyle(e.target);
  //info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function displayProdDataByParish(e) {
  var parishLayer = e.target;

  var parishCode = translateToParishCode(parishLayer.feature.properties.COUNTY);
  if(parishCode > 0 && parishCode < 69){
    info.update(parishLayer.feature.properties);
  }
  else{  }
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
  '<b> Parish: </b><br />' + props.NAME : 'Click a parish for production information.');
};

info.addTo(map);

//=============================== Well Mapping ==========================================//

var popupOpts = {
    autoPanPadding: new L.Point(5, 50),
    autoPan: true
};

var wellPoints = L.geoCsv (null, {
    firstLineTitles: true,
    fieldSeparator: fieldSeparator,
    onEachFeature: function (feature, layer) {
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
});

var wellMarkers = new L.MarkerClusterGroup();
var wellCsv;

var addCsvMarkers = function() {
    map.removeLayer(wellMarkers);
    wellPoints.clearLayers();

    wellMarkers = new L.MarkerClusterGroup(clusterOptions);
    wellPoints.addData(wellCsv);
    wellMarkers.addLayer(wellPoints);

    map.addLayer(wellMarkers);
    try {
        var bounds = wellMarkers.getBounds();
        if (bounds) {
            map.fitBounds(bounds);
        }
    } catch(err) {
        // pass
    }
    return false;
};

if(typeof(String.prototype.strip) === "undefined") {
    String.prototype.strip = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

map.addLayer(wellMarkers);

//=============================================== FILE LOADING =============================================================//
$(document).ready( function() {
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: wellCoordsUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + wellCoordsUrl);
        },
        success: function(csv) {
            wellCsv = csv;
            addCsvMarkers();
        }
    });
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: prodDetailsUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + prodDetailsUrl);
        },
        success: function(csv) {
            console.log('parse time');
        }
    });

    $("#clear").click(function(evt){
        evt.preventDefault();
        addCsvMarkers();
    });
});
