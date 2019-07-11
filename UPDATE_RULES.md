# Update Steps
1. Download the following files from this site: https://adfprodadm.dnr.state.la.us/DataSubscription/faces/login.jsf
  * In the Wells section…
    * f_wells.csv
    * f_well_surface_coords.csv
    * f_fields.csv
    * f_field_parishes.csv
  * In the OGP section...
    * f_oil_gas_production_details.csv
    * f_oil_gas_productions.csv
2. Unzip all files and rename all the extracted file endings from .txt to .csv.
3. Go the the ‘f_well_surface_coords.csv’ and change the columns ‘G_LATY’ to ‘lat’ and ‘G_LONGX’ to ‘lng’.
4. Replace all of the files in the “data” folder.
5. Go to refresh_date.js
6. Change REFRESH_DATE to DD-MONTH-YYYY of the date when you update the data.
Example: 12-JUNE-2019
Side Note
You need an account on the DNR website to get this information. Use an LSU email address and apply for the educational execption when registering.


## Data Information
* Shapefile with field geometry is generated from :
* All other well/field data is taken from the Department of Natural Resources : https://adfprodadm.dnr.state.la.us/DataSubscription/faces/login.jsf;jsessionid=ufG5JKL19e6_vTeVVo1lIEd0_sryPa56b8kXqfvNqu_IQPQuiKxW!-1509829807
* Parish geometry is from http://eric.clst.org/tech/usgeojson/
* f_parish_codes.csv can be used to reference what the parish codes are. The counties.json file does not use the same parish codes as DNR. I have a helper file that translates doing a math formula, becuase there was a pattern. If this ever changes in the future, this file will need to be changed.
