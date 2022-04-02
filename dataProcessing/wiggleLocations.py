#!/usr/bin/env python3
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
# Wiggle lat/lon locations by a small random 3 for visualization.
# Written by Kristi Potter (kristi.potter@gmail.com)
# 4/02/2022
#
# Usage: python wiggleLocations.py dataFile_geocoded.xlsx
# Outfile: dataFile_geocoded_wiggle.xlsx
#
# This script assumes python version 3 is available with pandas.
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
import sys
import pandas as pd
import numpy as np
from pathlib import Path

def wiggleLocations(file):

    # Read in the data
    df = pd.read_excel(file)
    df['Generated Lat'] = pd.to_numeric(df['Generated Lat'])
    df['Generated Lon'] = pd.to_numeric(df['Generated Lon'])

    # Find the duplicated locations
    df['Status'] = 'Unique'
    df.loc[df[df.loc[:, ['Generated Lat', 'Generated Lon']].duplicated(keep=False)].index, 'Status'] = 'Duplicate'
    dups = df.loc[df['Status'] == 'Duplicate']
    dups = dups.sort_values(by=['Generated Lat'])

    # Save the processed indexes
    processed = []
    for index, row in dups.iterrows():

        # If we've processed this index, move on, else save this index
        if index in processed:
            continue
        else:
            processed.append(index)

        # Get the lat/lon
        lat = row['Generated Lat']
        lon = row['Generated Lon']

        # Find all rows that match this location
        matches = dups.loc[(dups['Generated Lat'] == lat) & (dups['Generated Lon'] == lon)]

        # Iterate over the matches
        for idx, r in matches.iterrows():

            # Add a random # to the location
            rand = np.random.uniform(-.001, .001)
            df.loc[idx,'Generated Lon']  = r['Generated Lon'] + rand
            df.loc[idx,'Generated Lat']  = r['Generated Lat'] + rand

            # Add this index to the processed list
            processed.append(index)

    # Write to a new excel file
    filename = Path(file)
    outfile = str(filename.with_suffix(''))+"_wiggle"+str(filename.suffix)
    df.to_excel(outfile)


if __name__ == '__main__':

    if(len(sys.argv) < 2):
        print("Usage: python wiggleLocations.py <file.xlsx>")
        sys.exit()
    file = sys.argv[1]

    wiggleLocations(file)
