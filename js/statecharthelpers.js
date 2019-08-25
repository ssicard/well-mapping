function createChartDataJsonForState(){
  console.log("#createChartDataJsonForState");
  var summaries = totalProductionByYearByState();
  console.log("summaries");
  console.log(summaries.length);

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


function createProdChartForState() {
  console.log("#createProdChartForState");

  oilData = [];
  gasData = [];
  labels =  [];

  chartData = createChartDataJsonForState();
  var dataArr = chartData.Production;
  console.log("dataArr");
  console.log(dataArr);


  labels = Object.keys(dataArr);
  for(var k in dataArr) {
    oilData.push(dataArr[k].oilSum);
    gasData.push(dataArr[k].gasSum);
  }
  renderChartForState(oilData, gasData, labels);
}


function renderChartForState(oilData, gasData, labels) {
    var ctx = document.getElementById("stateChartGas").getContext('2d');
    renderChart(ctx, 'Gas Production', gasData, labels);
    ctx = document.getElementById("stateChartOil").getContext('2d');
    renderChart(ctx, 'Oil Production', oilData, labels);
}


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
