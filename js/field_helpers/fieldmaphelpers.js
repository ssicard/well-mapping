var fieldBounds = {};

function createFieldPopup(feature, layer){
  if (feature.properties) {
    var fieldId = feature.properties.Field_ID;
    var popup = '<canvas id="fieldChartGas"></canvas><canvas id="fieldChartOil"></canvas>'
    popup += '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
    popup += '<tr><th> Field Name </th><td>'+ feature.properties.Field_Name +'</td></tr>';
    popup += '<tr><th> Field ID </th><td>'+ feature.properties.Field_ID +'</td></tr>';
    popup += '<tr><th> Field Type </th><td>'+ feature.properties.Field_Type +'</td></tr>';
    popup += '<tr><th> Number of Producers </th><td>' + totalNumOfProducersByField(fieldId) + '</td></tr>';
    popup += '<tr><th> Number of Injectors </th><td>' + totalNumOfInjectorsByField(fieldId) +'</td></tr>';
    popup += '<tr><th> Total Production </th><td>' + totalProductionByField(fieldId) + '</td></tr>';
    popup += "</table></popup-content>";
    layer.bindPopup(popup, popupOpts).on('popupopen', function (popup) {
      createProdChartForField(fieldId);
    });
  }
}

function addToFieldBoundArr(feature, layer){
  if(feature.properties){
    var fieldId = feature.properties.Field_ID;
    var bounds = layer.getBounds();
    fieldBounds[fieldId] = bounds;
  }
}

function eachFieldFeature(feature, layer){
  createFieldPopup(feature, layer);
  addToFieldBoundArr(feature, layer);
}


function zoomToField(fieldId){
  var bounds = findBoundsForField(fieldId);
  map.fitBounds(bounds);
}

function findBoundsForField(fieldId){
  fieldStr = fieldId.toString();
  //prepend with 0 for index purposes
  if(fieldStr.length < 4){
    for(i = 0; i < (4 - fieldStr.length); i++){
      fieldStr = "0" + fieldStr;
    }
  }
  return fieldBounds[fieldStr];
}
