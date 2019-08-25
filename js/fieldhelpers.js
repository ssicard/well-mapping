
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
