
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

function findAllFields(){
  var allFields = [];
  for(i = 0; i < fieldNames.length-1; i++){
    allFields.push(fieldNames[i]);
  }
  return allFields;
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
