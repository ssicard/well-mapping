function totalProductionByYearByState(){
  console.log("#totalProductionByYearByState");
  var years = new Set();
  var prodJson = [];
  productionDetails = checkProdDetailsFormat(prodDetails);

  for(i=0; i < productionDetails.length; i++){
    var info = findProdInfo(productionDetails[i].OGP_SEQ_NUM);
    console.log("prodInfo");
    console.log(info);
    if(info == null || info.REPORT_DATE == undefined){
      break;
    }
    var year = getYear(info.REPORT_DATE);
    if(years.has(year)){ //If year is already in set, total with prev value
      var index = findCorrectYear(year, prodJson);
      prodJson[index]['oilProd'] = prodJson[index]['oilProd'] + productionDetails[i].OIL_PRODUCTION;
      prodJson[index]['gasProd'] = prodJson[index]['gasProd'] + productionDetails[i].GAS_PRODUCTION;
    }
    else{ //else add to set
      console.log("add year");
      years.add(year);
      item = {};
      item["year"] = year;
      item["gasProd"] = productionDetails[i].GAS_PRODUCTION;
      item["oilProd"] = productionDetails[i].OIL_PRODUCTION;

      prodJson.push(item);
    }
  }

  return prodJson;
}
