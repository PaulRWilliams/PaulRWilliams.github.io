#!/usr/bin/env python3
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
# Convert iconsMap.xlsx data to JSON for visualization
# Written by Kristi Potter (kristi.potter@gmail.com)
# 8/22/2022
#
# Usage: python icons2json.py dataFile.xlsx
# Outfile: iconMaps.js
#
# This script assumes python version 3 is available with pandas.
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
import json
import sys
import pandas as pd

sheets = ['Building', 'Client']

# Function to convert a xlsx to json and save
def make_json(file):

    icons = {}

    for s in sheets:

        # Read in the data
        df = pd.read_excel(file, sheet_name=s+" Map", engine='openpyxl', skiprows=[0])

        # Save only the columns we need
        df = df[[s+' Type','icon','color']]

        # Drop all columns that are Unnamed
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

        # Use the type as the index
        df.set_index(s+' Type',inplace=True)

        #  Convert to dict
        df = df.to_dict('index')

        icons[s+' Type'] = df

    # Write the file to a json stored in an .js file
    with open('../iconMap.js', 'w', encoding='utf-8') as f:
        f.write("const iconMap=")
        f.write(json.dumps(
            icons,
            sort_keys=True,
            indent=4,
            separators=(',', ': ')
        ))


# Driver Code
if __name__ == '__main__':
    make_json('../dataSources/icons/iconsMap.xlsx')
