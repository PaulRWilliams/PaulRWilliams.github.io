#!/usr/bin/env python3
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
# Full data processing pipeline.
# Written by Kristi Potter (kristi.potter@gmail.com)
# 4/02/2022
#
# Usage: python fullPipeline.py dataFile.xlsx
# Outfile: ../data.js
#
# This script assumes python version 3 is available with pandas.
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //

from pathlib import Path
import geoCodeExcel
import wiggleLocations
import data2json
import sys


def full_pipeline(file):

    # Parse the file name
    filename = Path(file)

    # Find the lat/lon of the locations
    geoCodeExcel.geoCodeExcel(file, None)

    # Get the geo located outfile
    geo_outfile = str(filename.with_suffix(''))+"_geocoded"+str(filename.suffix)

    # Wiggle the duplicate locations for visualization
    wiggleLocations.wiggleLocations(geo_outfile)

    # Get the wiggle location outfile
    wiggle_outfile = str(filename.with_suffix(''))+"_geocoded_wiggle"+str(filename.suffix)



    # Convert to json
    data2json.make_json(wiggle_outfile)


if __name__ == '__main__':

    if(len(sys.argv) < 2):
        print("Usage: python fullPipline.py <file.xlsx>")
        sys.exit()
    file = sys.argv[1]

    full_pipeline(file)
