# README #
--------------
Map based visualization of the works of Paul R Williams.
Written by Kristi Potter 10/02/2021
Contact:
Daisy-O'lice Williams, daisyoli@uoregon.edu
Kristi Potter, kristi.potter@gmail.com
--------------

# How to process addresses into lat/lon
1. Use 'python geoCodeExcel.py <file.xlss > [optional sheetname]'
2. This saves a new file_geocoded.xlsx
Note: This runs on a specified or the first sheet.

# How to save data for visualization
1. Save xcel speadsheet in CSV format as 'data.csv'
2. Convert CSV to json using 'python csv2json.py' (be sure to have python 3 installed)
3. The outfile should automatically save as 'data.js'

# How to update the icon maps
1. In the dataSources/icons/iconsMap.xlsx file, update the Colors column with a new hexadecimal color
2. From the dataProcessing directory, run 'python icons2json.py'
3. This will update the iconMap.js file that is used in the code

#  Dependencies
* D3/Leaftlet
* Data: https://docs.google.com/spreadsheets/d/11qmvnLUmJiTC9SZ1bHYnDmC33ndxUySCetfdxEF9Wvc/edit

* Using:
https://github.com/coryasilva/Leaflet.ExtraMarkers
https://github.com/Leaflet/Leaflet.markercluster

# Development Notes
