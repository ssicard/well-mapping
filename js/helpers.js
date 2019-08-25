function checkProdInfoFormat(productionInfo){
  if(productionInfo.length == 1){
    //its still the json in the JSON
    return productionInfo[0];
  }
  return productionInfo;
}
