
function findFieldProdInfo(fieldId, productionInfo){
  var fieldProdInfo = [];

  console.log("#findFieldProdInfo");
  console.log(fieldId);
  productionInfo = checkProdInfoFormat(productionInfo);
  for(i = 0; i < productionInfo.length; i++){
    if(fieldId == productionInfo[i].FIELD_ID){
      console.log("match");
      fieldProdInfo.push(productionInfo[i]);
    }
  }
  if(fieldProdInfo.length < 1){
    console.log("no match");
  }
  return fieldProdInfo;
}
