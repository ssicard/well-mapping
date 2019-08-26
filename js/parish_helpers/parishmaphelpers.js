
function onEachFeature(feature, parishLayer) {
  var center = parishLayer.getBounds().getCenter();
  var marker = L.marker(center, {
      icon: L.divIcon({
        iconAnchor: [20, 20],
        iconSize: [40, 40]
      }),
      opacity: 0
  }).bindTooltip(parishLayer.feature.properties.NAME, {
    permanent:true,
    direction: 'center',
    className: 'parish-name'
    // opacity: .5
  }).addTo(map);
    parishLayer.on({
        click: displayProdDataByParish,
    });
}

function highlightFeature(parishLayer) {
  parishLayer.setStyle({
    weight: 5,
    dashArray: '',
    fillOpacity: 0.7
  });

  prevClickedParish = parishLayer;
}

function resetHighlight() {
  parishJson.resetStyle(prevClickedParish);
}

function displayProdDataByParish(e) {
  var parishLayer = e.target;
  if(prevClickedParish!=null){
    resetHighlight();
  }
  var parishCode = translateToParishCode(parishLayer.feature.properties.COUNTY);
  if(parishCode > 0 && parishCode < 69){
    highlightFeature(parishLayer);
    createParishPopup(parishLayer, parishLayer.feature);
    // createProdChartForParish(translateToParishCode(parishLayer.feature.properties.COUNTY));
  }
}

function createParishPopup(parishLayer, feature){
  var popup = '<div class="popup-content">';
  popup += '<h6>Parish Production Information</h6>';

  if (feature.properties) {
    var parishCode = translateToParishCode(feature.properties.COUNTY);
    var details = findParishProdDetails(parishCode);
    var info = findParishProdInfo(details.OGP_SEQ_NUM);
    popup += '<canvas id="parishChartGas"></canvas><canvas id="parishChartOil"></canvas>';

    popup += '<table class="table table-striped table-bordered table-condensed"><tr><th> Parish Name </th><td>'+ feature.properties.NAME +'</td></tr>';

    if(details==null){
      popup += '</table>There is no information for this parish';
    }
    else{
      // var information = findParishProdInfo(details.OGP_SEQ_NUM);
      popup += '<tr><th> Number of Producers: </th><td>' + totalNumOfProducersByParish(parishCode) + '</td></tr>';
      popup += '<tr><th> Number of Injectors: </th><td>' + totalNumOfInjectorsByParish(parishCode) + '</td></tr>';
      popup += '<tr><th> Production in Parish: </th><td>' + totalProductionByParish(parishCode) + '</td></tr>';
      popup += '<tr><th> Fields in Parish: </th><td>';
        var fields = findAllFieldsInParish(parishCode);
        if(fields.length > 1){
          for(var field in fields){
            popup += field.FIELD_NAME + '</br>';
          }
        }
        else{
          popup += "There are no fields in this parish."
        }
      popup += '</td></tr>';
      popup += '<tr><th> Date Created: </th><td>' + info.REPORT_DATE + '</td></tr>';
      popup += '<tr><th> Last Refresh Date: </th><td>' + REFRESH_DATE + '</td></tr>';
      popup += "</table>";
    }
  }
  else{
    popup += 'There is no information for this parish.';
  }
  popup += "</popup-content>";
  parishLayer.bindPopup(popup, popupOpts);

  parishLayer.bindPopup(popup, popupOpts).on('popupopen', function (popup) {
    createProdChartForParish(parishCode);
  });
}
