### Data Transformation

The process for transforming the data into the format and place into the file structure is as follows:

(Using Python (v3+))

1. Convert addresses to latitude/longitude.
```
python geoCodeExcel.py dataFile.xlsx
```
This will run a search for latitude/longitude using open street maps (https://nominatim.openstreetmap.org/). Because the search for a single address is a bit slow, this may take a few minutes.

The output of this command is 2 files:
* dataFile_geocoded.xlsx
* addressesNotFound.txt

The dataFile_geocoded.txt file has 2 new columns 'Latitude' and 'Longitude'. These values are either from openstreetmap or if not found, left blank and need help!

addressesNotFound.txt gives a list of locations that openstreetmap couldn't find.

If you want to change the location of the not found addresses, change the dataFile_geocoded.xlsx file.

2. Wiggle the locations.
```
python wiggleLocations.py dataFile_geocoded.xlsx
```

This will find all locations that are exactly the same and add a small random # to offset these locations for better readability in the map.

The output of this command is 1 file:
* dataFile_geocoded_wiggle.xlsx

3. Convert from xlsx to json for visualization.
```
python data2json.py dataFile_geocoded_wiggle.xlsx
```
This converts the data to a json string and writes out a javascript file that the visualization will read.

The output of this command is 1 file:
* ../data.js

This file should be written in the main folder (one up from this one) and will overwrite any data.js file in that directory.


## Full pipeline
For automation of this process, simply use fullPipline.py
```
python fullPipline.py <file.xlsx
```

### Files in this directory

# geoCodeExcel.py
```
Usage: python geoCodeExcel.py <file.xls > [optional sheetname]
```

# wiggleLocations.py
```
Usage: python wiggleLocations.py <file.xlsx>
```

# xlsx2json.py
```
Usage: python xlsx2json.py <file.xlsx>  
```

# fullPipline.py
```
Usage: python fullPipline.py <file.xlsx
```
