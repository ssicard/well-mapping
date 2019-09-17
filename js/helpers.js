function checkProdInfoFormat(productionInfo){
  return checkArrFormat(productionInfo);
}

function checkProdDetailsFormat(productionDetails){
  return checkArrFormat(productionDetails);
}

function checkWellCoordsFormat(wellCoords){
  return checkArrFormat(wellCoords);
}

function checkWellInfoFormat(wellInfo){
  return checkArrFormat(wellInfo);
}

function checkArrFormat(array){
  if(array.length == 1){
    //its still the json in the JSON
    return array[0];
  }
  return array;
}

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

function getYear(date){
  if(date != null){
    return date.replace(/\d+-\w+-/, "");
  }
}
