var basemap = new L.TileLayer(baseUrl, {maxZoom: 20, attribution: baseAttribution, subdomains: subdomains, opacity: opacity});

var center = new L.LatLng(0, 0);

var map = new L.Map('map', {center: center, zoom: 2, maxZoom: maxZoom, layers: [basemap]});


//=============================== Parish Boundaries ==========================================//

//json from http://eric.clst.org/tech/usgeojson/
jQuery.getJSON("data/counties.json", function(data){
  let parishStyle = function (feature) {
    // return {
    //   fillColor: '#15560d'
    // }
  }

  let geoJSONOptions = {
    onEachFeature: onEachFeature,
    style: parishStyle,
    filter: function(feature, layer) {
      return feature.properties.STATE == 22;
    }
  }

  geojson = L.geoJson(data, geoJSONOptions).addTo(map);
});

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: displayProdDataByParish
        // click: zoomToFeature
    });
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function displayProdDataByParish(e) {
  var layer = e.target;

  console.log("counties.csv: " + layer.feature.properties.NAME + ", " + layer.feature.properties.COUNTY);
  var parishCode = translateToParishCode(layer.feature.properties.COUNTY);
  console.log(parishCode);
}

function translateToParishCode(countyCode){
  code = parseInt(countyCode);
  return (code+001)/2;
/*
    case __: //whole state, statewide
      return 65;
    case __: //atchafalaya bay
      return 66;
    case __: //coastwide
      return 67;
    case __: //offshore
      return 68;

    default: //out of state
      return 69;
  }
  */
}

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
}

info.update = function (props) {
  this._div.innerHTML = '<h4> Parish Info </h4>' + (props ?
  '<b> Parish: </b><br />' + props.NAME : 'Hover over a state');
};

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');

  for(var i = 0; i < grades.length; i++){
    div.innerHTML += '<i style="background:' + grades[i] + '"></i> ';
  }
}

info.addTo(map);

// custom zoom bar control that includes a Zoom Home function
L.Control.zoomHome = L.Control.extend({
    options: {
        position: 'topleft',
        zoomInText: '<b>+</b>',
        zoomInTitle: 'Zoom in',
        zoomOutText: '<b>-</b>',
        zoomOutTitle: 'Zoom out',
        zoomHomeText: '<i class="fa fa-home" style="line-height:1.65;"></i>',
        zoomHomeTitle: 'Zoom home'
    },

    onAdd: function (map) {
        var controlName = 'gin-control-zoom',
            container = L.DomUtil.create('div', controlName + ' leaflet-bar'),
            options = this.options;

        this._zoomInButton = this._createButton(options.zoomInText, options.zoomInTitle,
        controlName + '-in', container, this._zoomIn);
        this._zoomHomeButton = this._createButton(options.zoomHomeText, options.zoomHomeTitle,
        controlName + '-home', container, this._zoomHome);
        this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
        controlName + '-out', container, this._zoomOut);

        this._updateDisabled();
        map.on('zoomend zoomlevelschange', this._updateDisabled, this);

        return container;
    },

    onRemove: function (map) {
        map.off('zoomend zoomlevelschange', this._updateDisabled, this);
    },

    _zoomIn: function (e) {
        this._map.zoomIn(e.shiftKey ? 3 : 1);
    },

    _zoomOut: function (e) {
        this._map.zoomOut(e.shiftKey ? 3 : 1);
    },

    _zoomHome: function (e) {
        map.setView([lat, lng], zoom);
    },

    _createButton: function (html, title, className, container, fn) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', fn, this)
            .on(link, 'click', this._refocusOnMap, this);

        return link;
    },

    _updateDisabled: function () {
        var map = this._map,
            className = 'leaflet-disabled';

        L.DomUtil.removeClass(this._zoomInButton, className);
        L.DomUtil.removeClass(this._zoomOutButton, className);

        if (map._zoom === map.getMinZoom()) {
            L.DomUtil.addClass(this._zoomOutButton, className);
        }
        if (map._zoom === map.getMaxZoom()) {
            L.DomUtil.addClass(this._zoomInButton, className);
        }
    }
});
// add the new control to the map
var zoomHome = new L.Control.zoomHome();
zoomHome.addTo(map);




//=============================== Well Mapping ==========================================//

var popupOpts = {
    autoPanPadding: new L.Point(5, 50),
    autoPan: true
};

var points = L.geoCsv (null, {
    firstLineTitles: true,
    fieldSeparator: fieldSeparator,
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
    },
    filter: function(feature, layer) {
        total += 1;
        if (!filterString) {
            hits += 1;
            return true;
        }
        var hit = false;
        var lowerFilterString = filterString.toLowerCase().strip();
        $.each(feature.properties, function(k, v) {
            var value = v.toLowerCase();
            if (value.indexOf(lowerFilterString) !== -1) {
                hit = true;
                hits += 1;
                return false;
            }
        });
        return hit;
    }
});

var hits = 0;
var total = 0;
var filterString;
var markers = new L.MarkerClusterGroup();
var dataCsv;

var addCsvMarkers = function() {
    hits = 0;
    total = 0;
    filterString = document.getElementById('filter-string').value;

    if (filterString) {
        $("#clear").fadeIn();
    } else {
        $("#clear").fadeOut();
    }

    map.removeLayer(markers);
    points.clearLayers();

    markers = new L.MarkerClusterGroup(clusterOptions);
    points.addData(dataCsv);
    markers.addLayer(points);

    map.addLayer(markers);
    try {
        var bounds = markers.getBounds();
        if (bounds) {
            map.fitBounds(bounds);
        }
    } catch(err) {
        // pass
    }
    if (total > 0) {
        $('#search-results').html("Showing " + hits + " of " + total);
    }
    return false;
};

var typeAheadSource = [];

function ArrayToSet(a) {
    var temp = {};
    for (var i = 0; i < a.length; i++)
        temp[a[i]] = true;
    var r = [];
    for (var k in temp)
        r.push(k);
    return r;
}

function populateTypeAhead(csv, delimiter) {
    var lines = csv.split("\n");
    for (var i = lines.length - 1; i >= 1; i--) {
        var items = lines[i].split(delimiter);
        for (var j = items.length - 1; j >= 0; j--) {
            var item = items[j].strip();
            item = item.replace(/"/g,'');
            if (item.indexOf("http") !== 0 && isNaN(parseFloat(item))) {
                typeAheadSource.push(item);
                var words = item.split(/\W+/);
                for (var k = words.length - 1; k >= 0; k--) {
                    typeAheadSource.push(words[k]);
                }
            }
        }
    }
}

if(typeof(String.prototype.strip) === "undefined") {
    String.prototype.strip = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

map.addLayer(markers);

$(document).ready( function() {
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: dataUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error retrieving csv file');
        },
        success: function(csv) {
            dataCsv = csv;
            populateTypeAhead(csv, fieldSeparator);
            typeAheadSource = ArrayToSet(typeAheadSource);
            $('#filter-string').typeahead({source: typeAheadSource});
            addCsvMarkers();
        }
    });

    $("#clear").click(function(evt){
        evt.preventDefault();
        $("#filter-string").val("").focus();
        addCsvMarkers();
    });
});

//=============================== Production Data ==========================================//
