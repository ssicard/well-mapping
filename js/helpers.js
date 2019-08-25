function checkProdInfoFormat(productionInfo){
  if(productionInfo.length == 1){
    //its still the json in the JSON
    return productionInfo[0];
  }
  return productionInfo;
}

function checkProdDetailsFormat(productionDetails){
  if(productionDetails.length == 1){
    //its still the json in the JSON
    return productionDetails[0];
  }
  return productionDetails;
}
