// SETTING GLOBAL VARS //
var oilFieldColor = "#f54242";
var gasFieldColor = "#10a14c";
var parishColor = "#15560d";
var lsuPurple = "#461D7C";
var lsuGold = "#FDD023";
var prodDetailsCsv;
var prodCsv;
var wellInfoCsv;
var wellCoordsCsv;
var fieldNamesCsv;
var fieldParishCsv;
var prevClickedParish;
var parishJson;


var basemap = new L.TileLayer(baseUrl, {maxZoom: 20, attribution: baseAttribution, subdomains: subdomains, opacity: opacity});
var center = new L.LatLng(0, 0);
var map = new L.Map('map', {center: center, zoom: 2, maxZoom: maxZoom, layers: [basemap]});


//=============================== Parish Boundaries ==========================================//
var prevClickedParish;
var parishJson;

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

  parishJson = L.geoJson(data, geoJSONOptions).addTo(map);

  try {
      var bounds = parishJson.getBounds();
      if (bounds) {
          map.fitBounds(bounds);
      }
  } catch(err) {
      // pass
  }
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
  parishJson.resetStyle(prevClickedParish);
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function displayProdDataByParish(e) {
  var parishLayer = e.target;
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

//=============================== Parish Info Bar ==========================================//


var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this._div.innerHTML = '<h4> Selection Menu </h4>';
  this._div.innerHTML +=
    '<input type="checkbox" id="parishToggle" onclick="toggleParish()" checked>Parishes </br>'
  + '<input type="checkbox" id="wellToggle" onclick="toggleWell()" checked>Wells </br>'
  + '<input type="checkbox" id="fieldToggle" onclick="toggleField()" checked>Fields </br>'
  + '</br></br><p id="sidenote"> Please select item on the map for more information </p>'
  return this._div;
}

info.addTo(map);

//=============================== Toggle Layers ==========================================//
function toggleParish(){
  var checkbox = document.getElementById("parishToggle");
  if(checkbox.checked == true){
    map.addLayer(parishJson);
  }
  else {
    map.removeLayer(parishJson);
  }
  orderLayers();
}

function toggleWell(){
  var checkbox = document.getElementById("wellToggle");
  if(checkbox.checked == true){
    map.addLayer(wellPoints);
  }
  else {
    map.removeLayer(wellPoints);
  }
  orderLayers();
}

function toggleField(){
  var checkbox = document.getElementById("fieldToggle");
  if(checkbox.checked == true){
    map.addLayer(fieldJson);
  }
  else {
    map.removeLayer(fieldJson);
  }
  orderLayers();
}

function orderLayers(){
  parishJson.bringToBack();
  wellPoints.bringToFront();
  fieldJson.bringToFront();
}

//=============================== Parish Layer ==========================================//

//json adapted from http://eric.clst.org/tech/usgeojson/
jQuery.getJSON(parishesUrl, function(data){
  let parishStyle = function (feature) {
    return {
      fillColor: parishColor,
      color: parishColor
    }
  }

  parishJson = L.geoJson(data, {
    onEachFeature: onEachFeature,
    style: parishStyle,
    filter: function(feature, parishLayer) {
      return feature.properties.STATE == 22;
    }
  }).addTo(map);

  try {
      var bounds = parishJson.getBounds();
      if (bounds) {
          map.fitBounds(bounds);
      }
  } catch(err) {
      // pass
  }
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
  parishJson.resetStyle(prevClickedParish);
}

function displayProdDataByParish(e) {
  var parishLayer = e.target;
  if(prevClickedParish!=null){
    resetHighlight();
  }
  var parishCode = translateToParishCode(parishLayer.feature.properties.COUNTY);
  if(parishCode > 0 && parishCode < 69){
    highlightFeature(parishLayer);
    createParishPopup(parishLayer, parishLayer.feature);
  }
}

function createParishPopup(parishLayer, feature){
  var popup = '<div class="popup-content">';
  popup += '<h6>Parish Production Information</h6>';

  if (feature.properties) {
    var parishCode = translateToParishCode(feature.properties.COUNTY);
    var details = findParishProdDetails(parishCode);
    popup += '<table class="table table-striped table-bordered table-condensed"><tr><th> Parish Name </th><td>'+ feature.properties.NAME +'</td></tr>';

    if(details==null){
      popup += '</table>There is no information for this parish';
    }
    else{
      // var information = findParishProdInfo(details.OGP_SEQ_NUM);
      popup += '<tr><th> Number of Producers: </th><td>' + totalNumOfProducersByParish(parishCode) + '</td></tr>';
      popup += '<tr><th> Number of Injectors: </th><td>' + totalNumOfInjectorsByParish(parishCode) + '</td></tr>';
      popup += '<tr><th> Production in Parish: </th><td>' + totalProductionByParish(parishCode) + '</td></tr>';
      popup += '<tr><th> Fields in Parish: </th><td>';
        var fields = findAllFieldsInParish(parishCode);
        console.log(fields.length);
        if(fields.length > 1){
          for(var field in fields){
            popup += field.FIELD_NAME + '</br>';
          }
        }
        else{
          popup += "There are no fields in this parish."
        }
      popup += '</td></tr>';
      popup += '<tr><th> Date Created: </th><td>' + details.CREATE_DATE + '</td></tr>';
      popup += '<tr><th> Last Refresh Date: </th><td>' + REFRESH_DATE + '</td></tr>';
      popup += "</table>";
    }
  }
  else{
    popup += 'There is no information for this parish.';
  }
  popup += "</popup-content>";
  parishLayer.bindPopup(popup, popupOpts);
}

//=============================== Well Mapping ==========================================//
var wellMarkers = new L.MarkerClusterGroup();

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
  var well = findWellInfo(feature.properties.well_serial_num);
  if(well == null){
    var popup = 'Something went wrong';
  }
  else{
    var status = well.WELL_STATUS_CODE;
    if(status == 9 || status == 10){
      var popup = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
      // popup += '<tr><th> Well Serial Number </th><td>'+ feature.properties.well_serial_num +'</td></tr>';
      popup += '<tr><th> Well Name </th><td>' + well.WELL_NAME + '</td></tr>';
      popup += '<tr><th> Spud Date </th><td>' + well.SPUD_DATE + '</td></tr>';

      if(status == 9){
        popup += '<tr><th> Producer/Injector </th><td> Injector /td></tr>';
      }
      else if(status == 10){
        popup += '<tr><th> Producer/Injector </th><td> Producer </td></tr>';
      }

      popup += '<tr><th> Last Refresh Date </th><td>'+ REFRESH_DATE +'</td></tr>';

      var fieldName = findFieldName(well.FIELD_ID);
      if(fieldName != null){
        popup += '<tr><th> Field Name </th><td>'+ fieldName +'</td></tr>';
      }
      popup += "</table></popup-content>";

    }
  }

  layer.bindPopup(popup, popupOpts);
}

var addCsvMarkers = function() {
    map.removeLayer(wellMarkers);
    wellPoints.clearLayers();

    wellMarkers = new L.MarkerClusterGroup(clusterOptions);
    wellPoints.addData(wellCoordsCsv);
    wellMarkers.addLayer(wellPoints);

    map.addLayer(wellMarkers);
    return false;
};

if(typeof(String.prototype.strip) === "undefined") {
    String.prototype.strip = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

map.addLayer(wellMarkers);

// =========================================== Load Shapefile ========================================================//
var fieldJson;
let fieldStyle = function(feature) {
  var fieldType = feature.properties.Field_Type;
  if(fieldType == "Gas"){
    color = gasFieldColor;
  }
  else if(fieldType == "Oil"){
    color = oilFieldColor;
  }
  else{
    color = "#FFF";
  }

  return {
    fillColor: color,
    color: color,
    weight: 1
  }
}

function createFieldPopup(feature, layer){
  if (feature.properties) {
    var fieldId = feature.properties.Field_Id;
    var popup = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
    popup += '<tr><th> Field Name </th><td>'+ feature.properties.Field_Name +'</td></tr>';
    popup += '<tr><th> Field ID </th><td>'+ feature.properties.Field_ID +'</td></tr>';
    popup += '<tr><th> Field Type </th><td>'+ feature.properties.Field_Type +'</td></tr>';
    popup += '<tr><th> Number of Producers </th><td>' + totalNumOfProducersByField(fieldId) + '</td></tr>';
    popup += '<tr><th> Number of Injectors </th><td>' + totalNumOfInjectorsByField(fieldId) +'</td></tr>';
    popup += '<tr><th> Total Production </th><td>' + totalProductionByField(fieldId) + '</td></tr>';
    popup += "</table></popup-content>";
    layer.bindPopup(popup, popupOpts);
  }
}

// jQuery.getJSON(fieldJsonUrl, function(data){
//   let geoJSONOptions = {
//     onEachFeature: createFieldPopup,
//     style: fieldStyle
//   }
//
//   fieldJson = L.geoJson(data, geoJSONOptions).addTo(map);
// });


// =========================================== Helpers ========================================================//

function translateToParishCode(countyCode){
  code = parseInt(countyCode);
  return (code+001)/2;
}

if(typeof(String.prototype.strip) === "undefined") {
    String.prototype.strip = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

var popupOpts = {
    autoPanPadding: new L.Point(5, 50),
    autoPan: true
};

// =========================================== Producer/Injector Helpers ========================================================//

function totalProductionByField(fieldId){
  var production = 0;
  for(var well in wellInfo){
    if(well.WELL_STATUS_CODE == 10 || well.WELL_STATUS_CODE == 9){
      if(well.FIELD_ID == fieldId){
        production += well.GAS_PRODUCTION;
        production += well.OIL_PRODUCTION;
      }
    }
  }
  return production;
}

function totalProductionByParish(parishCode){
  var production = 0;
  for(var well in wellInfo){
    if(well.WELL_STATUS_CODE == 10 || well.WELL_STATUS_CODE == 9){
      if(well.PARISH_CODE == parishCode){
        production += well.GAS_PRODUCTION;
        production += well.OIL_PRODUCTION;
      }
    }
  }
  return production;
}

function totalNumOfProducersByField(fieldId){
  var prodInField = 0;
  for(var well in wellInfo){
      if(well.FIELD_ID == fieldId && well.WELL_STATUS_CODE == 10){
        prodInField++;
      }
  }
  return prodInField;
}

function totalNumOfInjectorsByField(fieldId){
  var injectInField = 0;
  for(var well in wellInfo){
      if(well.FIELD_ID == fieldId && well.WELL_STATUS_CODE == 10){
        injectInField++;
      }
  }
  return injectInField;
}

function totalNumOfProducersByParish(parishCode){
  var prodInParish = 0;
  for(var well in wellInfo){
      if(well.PARISH_CODE == parishCode && well.WELL_STATUS_CODE == 10){
        prodInParish++;
      }
  }
  return prodInParish;
}

function totalNumOfInjectorsByParish(parishCode){
  var injectInParish = 0;
  for(var well in wellInfo){
      if(well.PARISH_CODE == parishCode && well.WELL_STATUS_CODE == 9){
        injectInParish++;
      }
  }
  return injectInParish;
}

// =========================================== Populate CSV Arrays ========================================================//
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

function populateFieldParishes(){
  Papa.parse(fieldParishCsv, {
    header:true,
    dynamicTyping: true,
    delimiter: "^",
    complete: function(results) {
      fieldParishes = results.data;
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
  for(i = 0; i < fieldNames.length-1; i++){
    if(fieldId == fieldNames[i].FIELD_ID){
      return fieldNames[i].FIELD_NAME;
    }
  }
  return null;
}

function findAllFieldsInParish(parishCode){
  var allFields = [];
  for(i = 0; i < fieldParishes.length-1; i++){
    if(parishCode == fieldParishes[i].PARISH_CODE){
      allFields.push(fieldParishes[i].FIELD_ID);
    }
  }
  return allFields;
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
        url: fieldParishUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + fieldParishUrl);
        },
        success: function(csv) {
            fieldParishCsv = csv;
            populateFieldParishes();
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
});
