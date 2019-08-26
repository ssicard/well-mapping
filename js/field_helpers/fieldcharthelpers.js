
function createProdChartForField(fieldId) {
  console.log("#createProdChartForField");
  console.log("creating prod chart for field" + fieldId);
  oilData = [];
  gasData = [];
  labels =  [];

  chartData = createChartDataJsonForField(fieldId);
  var dataArr = chartData.Production;
  console.log("dataArr");
  console.log(dataArr);

  labels = Object.keys(dataArr);
  for(var k in dataArr) {
    oilData.push(dataArr[k].oilSum);
    gasData.push(dataArr[k].gasSum);
  }
  renderChartForField(oilData, gasData, labels);
}


function renderChartForField(oilData, gasData, labels){
  var ctx = document.getElementById("fieldChartGas").getContext('2d');
  renderChart(ctx, 'Gas Production', gasData, labels);
  var ctx = document.getElementById("fieldChartOil").getContext('2d');
  renderChart(ctx, 'Oil Production', oilData, labels);
}

function totalProductionByYearByField(fieldId){
  console.log("#totalProductionByYearByField");
  var years = new Set();
  var prodJson = [];
  var fieldProdInfo = findFieldProdInfo(fieldId, productionInfo);
  var prodInfo = fieldProdInfo[0];
  var prodDetails = findProdDetails(prodInfo.OGP_SEQ_NUM);
  console.log(prodDetails);
  if(prodDetails.length > 0){
    for(j = 0; j < prodDetails.length; j++){
      var prodDetail = prodDetails[i];
      if(prodInfo.REPORT_DATE != undefined){
        var year = getYear(prodInfo.REPORT_DATE);
        if(years.has(year)){ //If year is already in set, total with prev value
          var index = findCorrectYear(year, prodJson);
          prodJson[index]['oilProd'] = prodJson[index]['oilProd'] + prodInfo.OIL_PRODUCTION;
          prodJson[index]['gasProd'] = prodJson[index]['gasProd'] + prodInfo.GAS_PRODUCTION;
        }
        else{ //else add to set
          years.add(year);
          item = {};
          item["year"] = year;
          item["gasProd"] = prodDetail.GAS_PRODUCTION;
          item["oilProd"] = prodDetail.OIL_PRODUCTION;

          prodJson.push(item);
        }
      }
      else{
        console.log("no report date for field OGP_SEQ_NUM: " + prodInfo.OGP_SEQ_NUM);
      }
    }
  }
  else{
    console.log("No details for field OGP_SEQ_NUM: " + prodInfo.OGP_SEQ_NUM);
  }
  return prodJson;
}

function findFieldProdInfo(fieldId, productionInfo){
  console.log("#findFieldProdInfo");
  var fieldProdInfo = [];

  productionInfo = checkProdInfoFormat(productionInfo);
  for(i = 0; i < productionInfo.length; i++){
    if(fieldId == productionInfo[i].FIELD_ID){
      fieldProdInfo.push(productionInfo[i]);
    }
  }
  return fieldProdInfo;
}

function createChartDataJsonForField(fieldId){
  console.log("#createChartDataJsonForField")
  var summaries = totalProductionByYearByField(fieldId);

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
