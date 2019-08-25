function createChartDataJsonForParish(parishCode){
  console.log("#createChartDataJsonForParish");
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
  console.log("#createProdChartForParish")
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


function totalProductionByYearByParish(parishCode){
  console.log("#totalProductionByYearByParish")
  var years = new Set();
  var prodJson = [];

  console.log("prodDetails" + prodDetails.length);
  for(i=0; i < prodDetails.length; i++){
    if(prodDetails[i].PARISH_CODE == parishCode){
      var prodInfo = findParishProdInfo(prodDetails[i].OGP_SEQ_NUM);
      if(prodInfo.REPORT_DATE == undefined){
        break;
      }
      var year = getYear(prodInfo.REPORT_DATE);
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

  return prodJson;
}
