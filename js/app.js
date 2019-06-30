var basemap = new L.TileLayer(baseUrl, {maxZoom: 20, attribution: baseAttribution, subdomains: subdomains, opacity: opacity});
var center = new L.LatLng(0, 0);
var map = new L.Map('map', {center: center, zoom: 2, maxZoom: maxZoom, layers: [basemap]});


//=============================== Parish Boundaries ==========================================//
var prevClickedParish;

//json adapted from http://eric.clst.org/tech/usgeojson/
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
        click: displayProdDataByParish
    });
}

function highlightFeature(parishLayer) {
  parishLayer.setStyle({
    weight: 5,
    dashArray: '',
    fillOpacity: 0.7
  });

  prevClickedParish = parishLayer;
}

function resetHighlight() {
  geojson.resetStyle(prevClickedParish);
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function displayProdDataByParish(e) {
  var parishLayer = e.target;
  // console.log("displayProdDataByParish");
  // console.log(e.target);
  if(prevClickedParish!=null){
    resetHighlight();
  }

  var parishCode = translateToParishCode(parishLayer.feature.properties.COUNTY);
  if(parishCode > 0 && parishCode < 69){
    highlightFeature(parishLayer);
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
  this._div.innerHTML = '<h4> Parish Production Information </h4>';
  if(props){
    var details = findParishProdDetails(translateToParishCode(props.COUNTY));
    this._div.innerHTML += '<b> Parish: </b>' + props.NAME;

    if(details==null){
      this._div.innerHTML += '</br> <b> Parish Code: </b>' + translateToParishCode(props.COUNTY);
    }
    else{
      var information = findParishProdInfo(details.OGP_SEQ_NUM);
      if(information != null){
        var propValue;
        for(var propName in information){
          console.log("prodInfo");
          propValue = information[propName];
          this._div.innerHTML += '</br> <b>' + propName + ':</b> ' + propValue;
        }
        this._div.innerHTML +='</br> <b> field: </b> ' + information.FIELD_ID;
      }

      //DISPLAY ALL PROD DETAILS
        // var propValue;
        // for(var propName in details){
        //   console.log(propName);
        //   propValue = details[propName];
        //   this._div.innerHTML += '</br> <b>' + propName + ':</b> ' + propValue;
        // }

        this._div.innerHTML +=
           '</br> <b> Number of Producers:</b>'
          +'</br> <b> Number of Injectors:</b>'
          +'</br> <b> List of All Fields in Parish: </b>'
          +'</br> <b> Date Created:</b>' + details.CREATE_DATE
          +'</br> <b> Date Updated:</b>' + details.UPDATE_DATE
    }
  }
  else{
    this._div.innerHTML += 'Click for parish production information.'
  }

};

info.addTo(map);

//=============================== Well Mapping ==========================================//
var wellMarkers = new L.MarkerClusterGroup();
var wellCoordsCsv;

var wellPoints = L.geoCsv (null, {
    firstLineTitles: true,
    fieldSeparator: fieldSeparator,
    onEachFeature: createWellPopup
});

var popupOpts = {
    autoPanPadding: new L.Point(5, 50),
    autoPan: true
};

function createWellPopup(feature, layer){
  //TODO MAKE SURE THAT IT IS A PRODUCER OR INJECTOR
  var popup = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
  var well = findWellInfo(feature.properties.well_serial_num);

  if(well == null){
    popup += 'Something went wrong';
  }
  else{
    popup += '<tr><th> Well Serial Number </th><td>'+ feature.properties.well_serial_num +'</td></tr>';
    popup += '<tr><th> Well Name </th><td>' + well.WELL_NAME + '</td></tr>';
    popup += '<tr><th> Spud Date </th><td>' + well.SPUD_DATE + '</td></tr>';

    var status = well.WELL_STATUS_CODE;
    if(status == 9){
      popup += '<tr><th> Producer/Injector </th><td> Injector /td></tr>';
    }
    else if(status == 10){
      popup += '<tr><th> Producer/Injector </th><td> Producer </td></tr>';
    }

    popup += '<tr><th> Status Date </th><td>'+ well.UPDATE_DATE + '</td></tr>';
    popup += '<tr><th> Date Last Updated </th><td>'+ feature.properties.update_date +'</td></tr>';

    popup += '<tr><th> Field Id </th><td>'+ well.FIELD_ID+'</td></tr>';
    var fieldName = findFieldName(well.FIELD_ID);
    if(fieldName != null){
      popup += '<tr><th> Field Name </th><td>'+ fieldName +'</td></tr>';
    }
  }

  popup += "</table></popup-content>";
  layer.bindPopup(popup, popupOpts);
}

var addCsvMarkers = function() {
    map.removeLayer(wellMarkers);
    wellPoints.clearLayers();

    wellMarkers = new L.MarkerClusterGroup(clusterOptions);
    wellPoints.addData(wellCoordsCsv);
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

// =========================================== Populate CSV Arrays ========================================================//
var prodDetailsCsv;
var prodCsv;
var wellInfoCsv;
var fieldNamesCsv;

function populateProd(){
  Papa.parse(prodCsv, {
    header: true,
    dynamicTyping: true,
    delimiter: "^",
    complete: function(results) {
      prodInfo = results.data;
    }
  });
}

function populateProdDetails(){
    Papa.parse(prodDetailsCsv, {
      header: true,
      dynamicTyping: true,
      delimiter: "^",
      complete: function(results) {
        prodDetails = results.data;
      }
    });
}

function populateWellInfo(){
  Papa.parse(wellInfoCsv, {
    header:true,
    dynamicTyping: true,
    delimiter: "^",
    complete: function(results) {
      wellInfo = results.data;
    }
  })
}

function populateFieldNames(){
  Papa.parse(fieldNamesCsv, {
    header:true,
    dynamicTyping: true,
    delimiter: "^",
    complete: function(results) {
      fieldNames = results.data;
    }
  })
}

// =========================================== Helper Methods for CSVs ========================================================//

function findParishProdDetails(parishCode){
  for(i = 0; i < prodDetails.length; i++){
    if(parishCode == prodDetails[i].PARISH_CODE){
      return prodDetails[i];
    }
  }
  return null;
}

function findParishProdInfo(ogpSeqNum){
  for(i = 0; i < prodInfo.length; i++){
    if(ogpSeqNum == prodInfo[i].OGP_SEQ_NUM){
      return prodInfo[i];
    }
  }
  return null;
}

function findWellInfo(wellSerialNum){
  for(i = 0; i < wellInfo.length-1; i++){
    if(wellSerialNum == wellInfo[i].WELL_SERIAL_NUM){
      return wellInfo[i];
    }
  }
  return null;
}

function findFieldName(fieldId){
  console.log(fieldId);
  for(i = 0; i < fieldNames.length-1; i++){
    if(fieldId == fieldNames[i].FIELD_ID){
      return fieldNames[i].FIELD_NAME;
    }
  }
  return null;
}

//=============================================== File Loading =============================================================//
$(document).init( function() {
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: wellUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + wellUrl);
        },
        success: function(csv) {
            wellInfoCsv = csv;
            populateWellInfo();
        }
    });
});

$(document).ready( function() {
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: fieldNamesUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + fieldNamesUrl);
        },
        success: function(csv) {
            fieldNamesCsv = csv;
            populateFieldNames();
        }
    });
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: wellCoordsUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + wellCoordsUrl);
        },
        success: function(csv) {
            wellCoordsCsv = csv;
            addCsvMarkers();
        }
    });
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: wellUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + wellUrl);
        },
        success: function(csv) {
            wellInfoCsv = csv;
            populateWellInfo();
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
            prodDetailsCsv = csv;
            populateProdDetails();
        }
    });
    $.ajax ({
        type:'GET',
        dataType:'text',
        url: prodUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + prodUrl);
        },
        success: function(csv) {
            prodCsv = csv;
            populateProd();
        }
    });

    $("#clear").click(function(evt){
        evt.preventDefault();
        addCsvMarkers();
    });
});
