// SETTING GLOBAL VARS //
var oilFieldColor = "#f54242";
var oilFieldColorOpaque = "rgba(245,66,66, .2)";
var gasFieldColor = "#10a14c";
var gasFieldColorOpaque = "rgba(16,161,76, .2)";
var parishColor = "#FDD023";
var prodDetailsCsv;
var prodCsv;
var wellInfoCsv;
var wellCoordsCsv;
var fieldNamesCsv;
var fieldParishCsv;
var prevClickedParish;
var parishJson;
var chartData

// SETTING MAP VARS //
var basemap = new L.TileLayer(baseUrl, {maxZoom: 20, attribution: baseAttribution, subdomains: subdomains, opacity: opacity});
var center = new L.LatLng(0, 0);
var map = new L.Map('map', {
  center: center,
  zoomControl: false,
  layers: [basemap]
});

//=============================== Parish Info Bar ==========================================//
// L.control.zoom({
//   position:'bottomleft'
// }).addTo(map);

var title = L.control();
title.onAdd = function(map){
  this._div = L.DomUtil.create('div', 'title');

  this._div.innerHTML += '<img src="./assets/img/lsulogo.png" title="LSULogo" alt="LSULogo">';
  this._div.innerHTML += '<h4> Louisiana Oil and Gas Production </h4>';
  return this._div;
}
title.setPosition('topleft');
title.addTo(map);

var dataBox = L.control();
dataBox.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'dataBox');
  this._div.innerHTML = '<canvas id="stateChart"></canvas>';
  return this._div;
}
dataBox.setPosition('bottomright');
dataBox.addTo(map);

var info = L.control();
info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this._div.innerHTML = '<h4> Selection Menu </h4>';
  this._div.innerHTML +=
 '<table><tr><td><input type="checkbox" name="parishToggle" id="parishToggle" class="css-checkbox" onclick="toggleParish()" checked/><label for="parishToggle" class="css-label">Display Parish</label></td></tr>'
  + '<tr><td><input type="checkbox"  name="wellToggle" id="wellToggle" class="css-checkbox" onclick="toggleWell()"/><label for="wellToggle" class="css-label">Display Oil/Gas Wells</label></td></tr>'
  + '<tr><td><input type="checkbox" name="fieldToggle" id="fieldToggle" class="css-checkbox" onclick="toggleField()"/><label for="fieldToggle" class="css-label">Display Oil/Gas Fields</label></td></tr></table>'
  + '</br></br><p id="sidenote"> Please click on item in the map for more information </p>'
  return this._div;
}
info.addTo(map);

var credits = L.control();
credits.onAdd = function(map){
  this._div = L.DomUtil.create('div', 'credits');
  this._div.innerHTML = '<h5> Created By </h5>';
  this._div.innerHTML += '<table>'
  + '<tr><th> Jyotsna Sharma </th><td> Assistant Professor, Department of Petroleum Engineering</td></tr>'
  + '<tr><th> Sarah Sicard </th><td> Graduate, Department of Computer Science</td></tr></table>';
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
  wellPoints.bringToFront(); //HMM
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
    createProdChartForParish();
  }
}

function createParishPopup(parishLayer, feature){
  var popup = '<div class="popup-content">';
  popup += '<h6>Parish Production Information</h6>';

  if (feature.properties) {
    var parishCode = translateToParishCode(feature.properties.COUNTY);
    var details = findParishProdDetails(parishCode);
    popup += '<canvas id="myChart"></canvas>';

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
  createProdChartForParish(parishCode);
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

// =========================================== ALL LOUISIANA CHART HELPERS ========================================================//
function createChartDataJsonForState(){
  var summaries = totalProductionByState();

  var json = '{"Production": [';
  for(i=0; i < summaries.length; i++){
    json += '{ "year": "' + summaries[i].year + '",';
    json += '"oilSum":' + summaries[i].oilProd + ',';
    json += '"gasSum": ' + summaries[i].gasProd + ' },';
  }

  json = json.substring(0, json.length - 1); //remove trailing comma
  json += ']}';
  var obj = JSON.parse(json);

  return obj;
}

function createProdChartForState() {
  oilData = [];
  gasData = [];
  labels =  [];

  chartData = createChartDataJsonForState();
  var dataArr = chartData.Production;

  for(i=0; i < dataArr.length; i++){
   labels.push(dataArr[i].year);
   oilData.push(dataArr[i].oilSum);
   gasData.push(dataArr[i].gasSum)
  }
  renderChartForState(oilData, gasData, labels);
}

function renderChartForState(oilData, gasData, labels) {
      var ctx = document.getElementById("stateChart").getContext('2d');
      var myChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Oil Production',
                  data: oilData,
                  borderColor: oilFieldColor,
                  backgroundColor: oilFieldColorOpaque,
              },
              {
                  label: 'Gas Production',
                  data: gasData,
                  borderColor: gasFieldColor,
                  backgroundColor: gasFieldColorOpaque,
              }]
          },
          options: {
            title: {
              display: true,
              text: 'Louisiana Oil/Gas Production By Year'
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

// =========================================== CHART HELPERS ========================================================//
function createChartDataJson(parishCode){
  var dict = totalProductioninYearByParish(parishCode);

  var json = '{"ParishProduction": [';
  for(var key in dict){
    json += '{ "year": "' + key + '",';
    json += '"prodSum":' + dict[key] + ' },';
  }

  json = json.substring(0, json.length - 1); //remove trailing comma
  json += ']}';
  var obj = JSON.parse(json);

  return obj;
}

function createProdChartForParish() {
  console.log("in");
  data = [];
  labels =  [];

  chartData = createChartDataJson(9);
  var dataArr = chartData.ParishProduction;

  for(i=0; i < dataArr.length; i++){
   labels.push(dataArr[i].year);
   data.push(dataArr[i].prodSum);
  }
  renderChart(data, labels);
}

function renderChart(data, labels) {
  var ctx = document.getElementById("stateChart").getContext('2d');

      var myChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Oil/Gas Production By Year',
                  data: data,
                  borderColor: 'rgba(253,208,35, 1)',
                  backgroundColor: 'rgba(253,208,35, 0.4)',
              }]
          },
          options: {
            title: {
              display: true,
              text: 'Oil/Gas Production of Parish By Year'
            },
            scales: {
                yAxes: [{
                  scaleLabel:{
                    display: true,
                    labelString: 'production'
                  },
                  ticks: {
                      beginAtZero: true
                  }
                }],
                xAxes: [{
                  scaleLabel: {
                    display: true,
                    labelString: 'year'
                  }
                }]
              }
          },
      });
  }

// =========================================== Helpers ========================================================//

function translateToParishCode(countyCode){
  code = parseInt(countyCode);
  return (code+001)/2;
}

function findCorrectYear(year){
  console.log(year);
  for(var entry in jsonObj){
    console.log(entry);
    if(jsonObj[entry].year == year){
      return entry;
    }
  }
  return null;
}

function sumProduction(prodDetail){
  return prodDetail.GAS_PRODUCTION + prodDetail.OIL_PRODUCTION;
}

function transformDate(date){
  return date.replace(/\d+-\w+-/, "");
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

function totalProductioninYearByParish(parishCode){
  var years = new Set();
  var dict = new Object();
  for(i=0; i < prodDetails.length; i++){
    if(prodDetails[i].PARISH_CODE == parishCode){
      var year = transformDate(prodDetails[i].CREATE_DATE);
      if(years.has(year)){ //If year is already in set, total with prev value
        dict[year] += sumProduction(prodDetails[i]);
      }
      else{ //else add to set
        years.add(year);
        dict[year] = sumProduction(prodDetails[i]);
      }
    }
  }

  return dict;
}

function totalProductionByState(){
  var years = new Set();
  jsonObj = [];

  for(i=0; i < prodDetails.length; i++){
    var year = transformDate(prodDetails[i].CREATE_DATE);
    if(years.has(year)){ //If year is already in set, total with prev value
      var index = findCorrectYear(year);
      jsonObj[index]['oilProd'] = jsonObj[index]['oilProd'] + prodDetails[i].OIL_PRODUCTION;
      jsonObj[index]['gasProd'] = jsonObj[index]['gasProd'] + prodDetails[i].GAS_PRODUCTION;
    }
    else{ //else add to set
      years.add(year);
      item = {};
      item["year"] = year;
      item["gasProd"] = prodDetails[i].GAS_PRODUCTION;
      item["oilProd"] = prodDetails[i].OIL_PRODUCTION;

      jsonObj.push(item);
    }
  }

  console.log(jsonObj);

  return jsonObj;
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
    createProdChartForState();
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
