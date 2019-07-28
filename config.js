var maxZoom = 13;
var fieldSeparator = '^';
var baseAttribution = 'Data, imagery and map information provided by <a href="http://open.mapquest.co.uk" target="_blank">MapQuest</a>, <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> and contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/" target="_blank">CC-BY-SA</a></br>'
 + 'This web portal has been compiled for educational use only, and may not be reproduced without permission. Please contact Jyotsna Sharma (jsharma@lsu.edu) for more information or permissions.';
var subdomains = 'abc';
var clusterOptions = {showCoverageOnHover: false, maxClusterRadius: 50};
var labelColumn = "Name";
var opacity = 1.0;

//URL Variables
var baseUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var parishesUrl = 'data/counties.json'
var wellUrl = 'data/f_wells.csv';
var wellCoordsUrl = 'data/f_well_surface_coords.csv';
var prodUrl = 'data/f_oil_gas_productions.csv';
var prodDetailsUrl = 'data/f_oil_gas_production_details.csv';
var fieldNamesUrl = 'data/f_fields.csv';
var fieldParishUrl = 'data/f_field_parishes.csv';
var fieldJsonUrl = 'data/Louisiana_gas_and_oil_fields_1977_2014.json';
