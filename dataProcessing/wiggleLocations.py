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
    df = pd.read_excel(file, engine='openpyxl')
    df['Latitude'] = pd.to_numeric(df['Latitude'])
    df['Longitude'] = pd.to_numeric(df['Longitude'])

    # Find the duplicated locations
    df['Dups'] = 'Unique'
    df.loc[df[df.loc[:, ['Latitude', 'Longitude']].duplicated(keep=False)].index, 'Dups'] = 'Duplicate'
    dups = df.loc[df['Dups'] == 'Duplicate']
    dups = dups.sort_values(by=['Latitude'])

    # Save the processed indexes
    processed = []
    for index, row in dups.iterrows():

        # If we've processed this index, move on, else save this index
        if index in processed:
            continue
        else:
            processed.append(index)

        # Get the lat/lon
        lat = row['Latitude']
        lon = row['Longitude']

        # Find all rows that match this location
        matches = dups.loc[(dups['Latitude'] == lat) & (dups['Longitude'] == lon)]

        # Iterate over the matches
        for idx, r in matches.iterrows():

            # Add a random # to the location
            rand = np.random.uniform(-.001, .001)
            df.loc[idx,'Longitude']  = r['Longitude'] + rand
            df.loc[idx,'Latitude']  = r['Latitude'] + rand

            # Add this index to the processed list
            processed.append(index)

    # Write to a new excel file
    filename = Path(file)
    outfile = str(filename.with_suffix(''))+"_wiggle"+str(filename.suffix)
    print("Wrote to:", outfile)
    df.to_excel(outfile)


if __name__ == '__main__':

    if(len(sys.argv) < 2):
        print("Usage: python wiggleLocations.py <file.xlsx>")
        sys.exit()
    file = sys.argv[1]

    wiggleLocations(file)
