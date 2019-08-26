
function findWellInfo(wellSerialNum){
  console.log("#findWellInfo")
  for(i = 0; i < wellInfo.length-1; i++){
    if(wellSerialNum == wellInfo[i].WELL_SERIAL_NUM){
      return wellInfo[i];
    }
  }
  return null;
}
