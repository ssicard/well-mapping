// SETTING GLOBAL VARS //
var oilFieldColor = "#f54242";
var oilFieldColorOpaque = "rgba(245,66,66, .2)";
var gasFieldColor = "#10a14c";
var gasFieldColorOpaque = "rgba(16,161,76, .2)";
var parishColor = "#FDD023";
var wellJson;
var prevClickedParish;
var wellInfo = [];
var wellCoords = [];
var prodDetails = [];
var productionInfo = [];
var parishJson;
var fieldJson;
var chartData;
var prodDetailsDone = false;
var prodInfoDone = false;
var fieldJson;
var fieldBounds = [];
var wellCoordsCsv;

// SETTING MAP VARS //
var map = new L.map('map', {
  zoomControl: false
});
L.tileLayer(baseUrl, {maxZoom: 20, attribution: baseAttribution}).addTo(map);

//=============================== Map Controls ==========================================//
var title = L.control();
title.onAdd = function(map){
  this._div = L.DomUtil.create('div', 'title');

  this._div.innerHTML += '<img src="./assets/img/lsulogo.png" title="LSULogo" alt="LSULogo">';
  this._div.innerHTML += '<h4> Louisiana Oil and Gas Production </h4>';
  return this._div;
}
title.setPosition('topleft');
title.addTo(map);

L.control.zoom({
  position:'topleft'
}).addTo(map);

var prodChartBox = L.control();
prodChartBox.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'prodChartBox');
  this._div.innerHTML = '<canvas id="stateChartGas"></canvas><canvas id="stateChartOil"></canvas>';
  return this._div;
}
prodChartBox.setPosition('bottomright');
prodChartBox.addTo(map);

var selectionMenu = L.control();
selectionMenu.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'selectionMenu');
  this._div.innerHTML = '<h4> Selection Menu </h4>';
  this._div.innerHTML +=
 '<table><tr><td><input type="checkbox" name="parishToggle" id="parishToggle" class="css-checkbox" onclick="toggleParish()" checked/><label for="parishToggle" class="css-label">Display Parish</label></td></tr>'
  + '<tr><td><input type="checkbox"  name="wellToggle" id="wellToggle" class="css-checkbox" onclick="toggleWell()"/><label for="wellToggle" class="css-label">Display Oil/Gas Wells</label></td></tr>'
  + '<tr><td><input type="checkbox" name="fieldToggle" id="fieldToggle" class="css-checkbox" onclick="toggleField()"/><label for="fieldToggle" class="css-label">Display Oil/Gas Fields</label></td></tr></table>'
  + '</br><p id="sidenote"> Please click on item in the map for more information </p>'
  return this._div;
}
selectionMenu.addTo(map);

var fieldListBox = L.control();
fieldListBox.onAdd = function(map){
  this._div = L.DomUtil.create('div', 'fieldListBox');

  this._div.innerHTML += '<h4> Oil and Gas Fields </h4>';

  var allFields = findAllFields();
  for(i=0; i < allFields.length; i++){
    if(allFields[i].FIELD_NAME != undefined){
      this._div.innerHTML += '<li onclick=zoomToField(' + allFields[i].FIELD_ID + ')>' + allFields[i].FIELD_NAME + '</li>';
    }
  }
  return this._div;
}
fieldListBox.setPosition('topright');

var credits = L.control();
credits.onAdd = function(map){
  this._div = L.DomUtil.create('div', 'credits');
  this._div.innerHTML = '<table>'
  + '<tr><th> Site Developer: </th><td>Sarah Sicard (BS, Department of Computer Science)</td></tr>'
  + '<tr><th> Project Supervisor: </th><td>Jyotsna Sharma (Assistant Professor, Department of Petroleum Engineering)</td></tr>'
  + '<tr><th> Data Source: </th><td> Louisiana Department of Natural Resources (DNR)</td></tr>'
  + '<tr><th> Acknowledgements: </th><td> Carrie Wiebelt and James Devitt (DNR) </td></tr></table';
  return this._div;
}
credits.setPosition('bottomleft');
credits.addTo(map);

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
    addWellsToMap();
  }
  else {
    removeWellPoints();
  }
  orderLayers();
}

function toggleField(){
  var checkbox = document.getElementById("fieldToggle");
  if(checkbox.checked == true){
    if(fieldJson != undefined){
      fieldListBox.addTo(map);
      map.addLayer(fieldJson);
    }
  }
  else {
    if(fieldJson != undefined){
      map.removeLayer(fieldJson);
      map.removeLayer(fieldListBox); //TODO
    }
  }
  orderLayers();
}

function orderLayers(){
  if(parishJson != undefined){
    parishJson.bringToBack();
  }
  if(fieldJson != undefined){
    fieldJson.bringToFront();
  }
}

//=============================== Parish Layer ==========================================//

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

//=============================== Well Layer ==========================================//
function addWellsToMap() {
  for (var i = 0; i < wellCoords.length; i++) {
    var wellLocation = L.latLng(wellCoords[i].lat, wellCoords[i].long);
    if(wellLocation != null){
      if(wellCoords[i].lat > 28 && wellCoords[i].lat < 33 && wellCoords[i].long < -87 && wellCoords[i].long > -94.1){ //this is here as a temporary filter because the data has multiple entries for each well point
        var test = L.circleMarker(wellLocation).addTo(map).bindPopup("s/n: " + wellCoords[i].WELL_SERIAL_NUM + "\n lat: " + wellCoords[i].lat + "\n long: " + wellCoords[i].long);
      }
    }
  }
  console.log(test);
  console.log("done loading points");
}

// =========================================== Load Shapefile ========================================================//
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

jQuery.getJSON(fieldJsonUrl, function(data){
  let geoJSONOptions = {
    onEachFeature: eachFieldFeature,
    style: fieldStyle
  }

  fieldJson = L.geoJson(data, geoJSONOptions);
});

// =========================================== RENDER CHART ========================================================//
function renderChart(ctx, chartLabel, data, dataLabels){
  if(chartLabel == 'Oil Production'){
    fieldColor = oilFieldColor;
    fieldColorOpaque = oilFieldColorOpaque;
    text = 'Louisiana Oil Production by Year';
  }
  else {
    fieldColor = gasFieldColor;
    fieldColorOpaque = gasFieldColorOpaque;
    text = 'Louisiana Gas Production by Year';
  }
  var myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: labels,
          datasets: [{
              label: chartLabel,
              data: data,
              borderColor: fieldColor,
              backgroundColor: fieldColorOpaque,
          }]
      },
      options: {
        title: {
          display: true,
          text: text
        },
        scales: {
            yAxes: [{
              scaleLabel:{
                display: true,
                labelString: 'PRODUCTION'
              },
              ticks: {
                  beginAtZero: true
              }
            }],
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'YEAR'
              }
            }]
          }
      },
  });
}

// =========================================== Helpers ========================================================//

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
function totalProductionByParish(parishCode){
  console.log("#totalProductionByParish");
  var production = 0;
  for(var well in wellInfo){
    if(well.WELL_STATUS_CODE == 10 || well.WELL_STATUS_CODE == 9){
      if(well.PARISH_CODE == parishCode){
        production += sumProduction(well);
      }
    }
  }
  return production;
}

function totalNumOfProducersByParish(parishCode){
  console.log("#totalNumOfProducersByParish");

  var prodInParish = 0;
  for(var well in wellInfo){
      if(well.PARISH_CODE == parishCode && well.WELL_STATUS_CODE == 10){
        prodInParish++;
      }
  }
  return prodInParish;
}

function totalNumOfInjectorsByParish(parishCode){
  console.log("#totalNumOfInjectorsByParish");

  var injectInParish = 0;
  for(var well in wellInfo){
      if(well.PARISH_CODE == parishCode && well.WELL_STATUS_CODE == 9){
        injectInParish++;
      }
  }
  return injectInParish;
}

// =========================================== Populate CSV Arrays ========================================================//
function populateProdInfo(prodCsv){
  Papa.parse(prodCsv, {
    header: true,
    dynamicTyping: true,
    delimiter: "^",
    worker: true,
    chunk: function(row){
      if(row.data != undefined){
        productionInfo.push(row.data);
      }
      else {
        console.log("error" + row);
      }
    },
    complete: function(results) {
      prouductionInfo = checkProdInfoFormat(productionInfo);
      console.log("done loading productionInfo")
      prodInfoDone = true;
      if(prodInfoDone && prodDetailsDone){
        // createProdChartForState();
      }
    }
  });
}

function populateProdDetails(prodDetailsCsv){
    Papa.parse(prodDetailsCsv, {
      header: true,
      dynamicTyping: true,
      delimiter: ",",
      worker: true,
      chunk: function(row){
        if(row.data != undefined){
          prodDetails.push(row.data);
        }
        else {
          console.log("error" + row);
        }
      },
      complete: function(results) {
        prodDetails = checkProdDetailsFormat(prodDetails);
        console.log("done loading prodDetails")
        prodDetailsDone = true;
        if(prodInfoDone && prodDetailsDone){
          // createProdChartForState();
        }
      }
    });
}

function populateWellInfo(wellInfoCsv){
  Papa.parse(wellInfoCsv, {
    header:true,
    dynamicTyping: true,
    delimiter: "^",
    worker: true,
    chunk: function(row){
      if(row.data != undefined){
        wellInfo.push(row.data);
      }
      else {
        console.log("error" + row);
      }
    },
    complete: function() {
      wellInfo = checkWellInfoFormat(wellInfo);
      console.log("done loading wellInfo");
    }
  })
}

function populateWellCoords(wellCoordsCsv){
  Papa.parse(wellCoordsCsv, {
    header:true,
    dynamicTyping: true,
    delimiter: ",",
    worker: true,
    chunk: function(row){
      if(row.data != undefined){
        wellCoords.push(row.data);
      }
    },
    complete: function() {
      wellCoords = checkWellCoordsFormat(wellCoords);
      console.log("done loading wellCoords");
    }
  })
}

function populateFieldNames(fieldNamesCsv){
  Papa.parse(fieldNamesCsv, {
    header:true,
    dynamicTyping: true,
    delimiter: "^",
    complete: function(results) {
      fieldNames = results.data;
    }
  })
}

function populateFieldParishes(fieldParishCsv){
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
  console.log("#findParishProdDetails");
  for(i = 0; i < prodDetails.length; i++){
    if(parishCode == prodDetails[i].PARISH_CODE){
      return prodDetails[i];
    }
  }
  return null;
}

function findProdInfo(ogpSeqNum){
  console.log("#findProdInfo")
  productionInfo = checkProdInfoFormat(prouductionInfo);
  for(i = 0; i < productionInfo.length; i++){
    if(ogpSeqNum == productionInfo[i].OGP_SEQ_NUM){
      return productionInfo[i];
    }
  }
  console.log("no match" + ogpSeqNum);
  return null;
}

function findProdDetails(ogpSeqNum){
  console.log("#findProdDetails");
  var prodDetails = [];

  productionDetails = checkProdDetailsFormat(prodDetails);
  for(i = 0; i < productionDetails.length; i++){
    if(ogpSeqNum == productionDetails[i].OGP_SEQ_NUM){
      console.log("match!");
      prodDetails.push(productionDetails[i]);
    }
  }
  return prodDetails;
}

function findFieldName(fieldId){
  console.log("#findFieldName");
  for(i = 0; i < fieldNames.length-1; i++){
    if(fieldId == fieldNames[i].FIELD_ID){
      return fieldNames[i].FIELD_NAME;
    }
  }
  return null;
}

function findAllFieldsInParish(parishCode){
  console.log("findAllFieldsInParish");
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
            populateWellInfo(csv);
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
            populateProdInfo(csv);
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
            populateProdDetails(csv);
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
          populateWellCoords(csv);
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
            populateFieldNames(csv);
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
            populateFieldParishes(csv);
        }
    });
});
