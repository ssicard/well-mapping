
function findWellInfo(wellSerialNum){
  for(i = 0; i < wellInfo.length-1; i++){
    if(wellSerialNum == wellInfo[i].WELL_SERIAL_NUM){
      return wellInfo[i];
    }
  }
  console.log("no well found")
  return null;
}
