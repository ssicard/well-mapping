// SETTING GLOBAL VARS //
var oilFieldColor = "#f54242";
var oilFieldColorOpaque = "rgba(245,66,66, .2)";
var gasFieldColor = "#10a14c";
var gasFieldColorOpaque = "rgba(16,161,76, .2)";
var parishColor = "#FDD023";
var wellCoordsCsv;
var prevClickedParish;
var wellInfo = [];
var parishJson;
var fieldJson;
var chartData;

// SETTING MAP VARS //
var basemap = new L.TileLayer(baseUrl, {maxZoom: 20, attribution: baseAttribution, subdomains: subdomains, opacity: opacity});
var center = new L.LatLng(0, 0);
var map = new L.Map('map', {
  center: center,
  zoomControl: false,
  layers: [basemap]
});

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

function zoomToField(fieldId){
  console.log(fieldId);
  //search json for feature with FIELD_ID
  if(fieldJson != undefined){
    for(var feature in fieldJson){

    }
  }

  //zoomTofeature
  function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
  }
}
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
    addWellPoints();
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

function onEachFeature(feature, parishLayer) {
  var center = parishLayer.getBounds().getCenter();
  var marker = L.marker(center, {
      icon: L.divIcon({
        iconAnchor: [20, 20],
        iconSize: [40, 40]
      }),
      opacity: 0
  }).bindTooltip(parishLayer.feature.properties.NAME, {
    permanent:true,
    direction: 'center',
    className: 'parish-name'
    // opacity: .5
  }).addTo(map);
    parishLayer.on({
        click: displayProdDataByParish,
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
    createProdChartForParish(translateToParishCode(parishLayer.feature.properties.COUNTY));
  }
}

function createParishPopup(parishLayer, feature){
  var popup = '<div class="popup-content">';
  popup += '<h6>Parish Production Information</h6>';

  if (feature.properties) {
    var parishCode = translateToParishCode(feature.properties.COUNTY);
    var details = findParishProdDetails(parishCode);
    popup += '<canvas id="parishChartGas"></canvas><canvas id="parishChartOil"></canvas>';

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


  parishLayer.bindPopup(popup, popupOpts).on('popupopen', function (popup) {
    renderChartForParish(labelsParish, oilDataParish, gasDataParish);
  });
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
    autoPan: true,
    closeOnEscapeKey: true,
};

function createWellPopup(feature, layer){
  console.log("Well Serial Num:" + feature.properties.well_serial_num);
  var well = findWellInfo(feature.properties.well_serial_num);
  if(well == null){
    var popup = 'Something went wrong'
              + feature.properties.well_serial_num;
  }
  else{
    var status = well.WELL_STATUS_CODE;
    if(status == 9 || status == 10){
      var popup = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
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

var addWellPoints = function() {

    wellMarkers = new L.MarkerClusterGroup(clusterOptions);
    wellPoints.addData(wellCoordsCsv);
    wellMarkers.addLayer(wellPoints);

    map.addLayer(wellMarkers);
    return false;
};

var removeWellPoints = function() {
    map.removeLayer(wellMarkers);
    wellPoints.clearLayers();
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

jQuery.getJSON(fieldJsonUrl, function(data){
  let geoJSONOptions = {
    onEachFeature: createFieldPopup,
    style: fieldStyle
  }

  fieldJson = L.geoJson(data, geoJSONOptions);
});


// =========================================== ALL LOUISIANA CHART HELPERS ========================================================//
function createChartDataJsonForState(){
  var summaries = totalProductionByYearByState();

  var json = '{"Production": {';
  if(summaries.length == 0){
    json += '}}';
  }
  else{
    for(i=0; i < summaries.length; i++){
      json += '"' + summaries[i].year + '": {';
      json += '"oilSum":' + summaries[i].oilProd + ',';
      json += '"gasSum": ' + summaries[i].gasProd + ' },';
    }

    json = json.substring(0, json.length - 1); //remove trailing comma
    json += '}}';
  }

  var obj = JSON.parse(json);

  return obj;
}

function createProdChartForState() {
  oilData = [];
  gasData = [];
  labels =  [];

  chartData = createChartDataJsonForState();
  var dataArr = chartData.Production;
  console.log(dataArr);

  labels = Object.keys(dataArr);
  for(var k in dataArr) {
    oilData.push(dataArr[k].oilSum);
    gasData.push(dataArr[k].gasSum);
  }
  renderChartForState(oilData, gasData, labels);
}

// =========================================== RENDER CHART HELPERS ========================================================//

function renderChartForState(oilData, gasData, labels) {
    var ctx = document.getElementById("stateChartGas").getContext('2d');
    renderChart(ctx, 'Gas Production', gasData, labels);
    ctx = document.getElementById("stateChartOil").getContext('2d');
    renderChart(ctx, 'Oil Production', oilData, labels);
}

function renderChartForParish(oilData, gasData, labels){
  var ctx = document.getElementById("parishChartGas").getContext('2d');
  renderChart(ctx, 'Gas Production', gasData, labels);
  var ctx = document.getElementById("parishChartOil").getContext('2d');
  renderChart(ctx, 'Oil Production', oilData, labels);
}

function renderChartForField(oilData, gasData, labels){
  var ctx = document.getElementById("fieldChartGas").getContext('2d');
  renderChart(ctx, 'Gas Production', gasData, labels);
  var ctx = document.getElementById("fieldChartOil").getContext('2d');
  renderChart(ctx, 'Oil Production', oilData, labels);
}

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

// =========================================== PARISH CHART HELPERS ========================================================//
function createChartDataJsonForParish(parishCode){
  var summaries = totalProductionByYearByParish(parishCode);

  console.log("summaries");
  console.log(summaries);
  var json = '{"ParishProduction": {';
  if(summaries.length == 0){
    json += '}}';
  }
  else{
    for(i=0; i < summaries.length; i++){
      json += '"' + summaries[i].year + '": {';
      json += '"oilSum":' + summaries[i].oilProd + ',';
      json += '"gasSum": ' + summaries[i].gasProd + ' },';
    }

    json = json.substring(0, json.length - 1); //remove trailing comma
    json += ']}';
  }
  console.log("preparse");


  console.log(json);
  var obj = JSON.parse(json);
  console.log("postparse");

  console.log(obj);


  return obj;
}

function createProdChartForParish() {
  oilDataParish = [];
  gasDataParish = [];
  labelsParish =  [];

  chartData = createChartDataJsonForParish();
  var dataArr = chartData.ParishProduction;

  labels = Object.keys(dataArr);
  for(var k in dataArr) {
    oilData.push(dataArr[k].oilSum);
    gasData.push(dataArr[k].gasSum);
  }
  renderChartForParish(oilData, gasData, labels);
}

// =========================================== Helpers ========================================================//

function translateToParishCode(countyCode){
  code = parseInt(countyCode);
  return (code+001)/2;
}

function findCorrectYear(year, prodJson){
  for(var entry in prodJson){
    if(prodJson[entry].year == year){
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
        production += sumProduction(well);
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
        production += sumProduction(well);
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

function totalProductionByYearByParish(parishCode){
  var years = new Set();
  var prodJson = [];

  console.log("prodDetails" + prodDetails.length);
  for(i=0; i < prodDetails.length; i++){
    if(prodDetails[i].PARISH_CODE == parishCode){
      var year = transformDate(prodDetails[i].CREATE_DATE);
      if(years.has(year)){ //If year is already in set, total with prev value
        var index = findCorrectYear(year, prodJson);
        prodJson[index]['oilProd'] = prodJson[index]['oilProd'] + prodDetails[i].OIL_PRODUCTION;
        prodJson[index]['gasProd'] = prodJson[index]['gasProd'] + prodDetails[i].GAS_PRODUCTION;
      }
      else{ //else add to set
        years.add(year);
        item = {};
        item["year"] = year;
        item["gasProd"] = prodDetails[i].GAS_PRODUCTION;
        item["oilProd"] = prodDetails[i].OIL_PRODUCTION;

        prodJson.push(item);
      }
    }
  }

  //TODO sort by year
  return prodJson;
}

function totalProductionByYearByState(){
  var years = new Set();
  var prodJson = [];

  for(i=0; i < prodDetails.length; i++){
    var year = transformDate(prodDetails[i].CREATE_DATE);
    if(years.has(year)){ //If year is already in set, total with prev value
      var index = findCorrectYear(year, prodJson);
      prodJson[index]['oilProd'] = prodJson[index]['oilProd'] + prodDetails[i].OIL_PRODUCTION;
      prodJson[index]['gasProd'] = prodJson[index]['gasProd'] + prodDetails[i].GAS_PRODUCTION;
    }
    else{ //else add to set
      years.add(year);
      item = {};
      item["year"] = year;
      item["gasProd"] = prodDetails[i].GAS_PRODUCTION;
      item["oilProd"] = prodDetails[i].OIL_PRODUCTION;

      prodJson.push(item);
    }
  }

  return prodJson;
}

// =========================================== Populate CSV Arrays ========================================================//
function populateProd(prodCsv){
  Papa.parse(prodCsv, {
    header: true,
    dynamicTyping: true,
    delimiter: "^",
    complete: function(results) {
      prodInfo = results.data;
    }
  });
}

function populateProdDetails(prodDetailsCsv){
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

function populateWellInfo(wellInfoCsv){
  Papa.parse(wellInfoCsv, {
    header:true,
    dynamicTyping: true,
    delimiter: "^",
    worker: true,
    step: function(row){
      console.log("wellInfo row:");
      if(row.data != undefined){
        wellInfo.push(row.data);
      }
      else {
        console.log(row);
      }
    },
    complete: function() {
      console.log("done");
      console.log(wellInfo);
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

function findAllFields(){
  var allFields = [];
  for(i = 0; i < fieldNames.length-1; i++){
    allFields.push(fieldNames[i]);
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
        url: prodUrl,
        contentType: "text/csv; charset=utf-8",
        error: function() {
            alert('Error loading' + prodUrl);
        },
        success: function(csv) {
            populateProd(csv);
        }
    });
});
