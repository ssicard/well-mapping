
var popupOpts = {
    autoPanPadding: new L.Point(5, 50),
    autoPan: true,
    closeOnEscapeKey: true,
};

function createWellPopup(feature, layer){
  var well = findWellInfo(feature.properties.well_serial_num);
  if(well == null){
    var popup = 'Something went wrong'
              + feature.properties.well_serial_num;
  }
  else{
    var status = well.WELL_STATUS_CODE;
    if(status == 9 || status == 10){
      var popup = '<div class="popup-content"><table class="table table-striped table-bordered table-condensed">';
      popup += '<tr><th> Well Name </th><td>' + well.WELL_NAME + '</td></tr>';
      popup += '<tr><th> Spud Date </th><td>' + well.SPUD_DATE + '</td></tr>';

      if(status == 9){
        popup += '<tr><th> Producer/Injector </th><td> Injector </td></tr>';
      }
      else if(status == 10){
        popup += '<tr><th> Producer/Injector </th><td> Producer </td></tr>';
      }

      popup += '<tr><th> Last Refresh Date </th><td>'+ REFRESH_DATE +'</td></tr>';

      var fieldName = findFieldName(well.FIELD_ID);
      if(fieldName != null){
        popup += '<tr><th> Field Name </th><td>'+ fieldName +'</td></tr>';
      }
      popup += "</table></popup-content>";

    }
  }

  layer.bindPopup(popup, popupOpts);
}


function eachWellFeature(feature, layer){
  createWellPopup(feature, layer);
}
