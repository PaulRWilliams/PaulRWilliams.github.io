#!/usr/bin/env python3
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
# Convert .xlsx data to JSON for visualization
# Written by Kristi Potter (kristi.potter@gmail.com)
# 10/02/2021
#
# Usage: python xlsx2json.py dataFile.xlsx
# Outfile: data.js
#
# This script assumes python version 3 is available with pandas.
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
import json
import sys, os
import pandas as pd
from pathlib import Path

# Function to convert a CSV to JSON saved as a js file
def make_json(file):

    # Read in data.csv
    #csv = pd.read_csv('data.csv').replace('"','\"', regex=True)

    # Read in the data
    df = pd.read_excel(file, engine='openpyxl')

    # Drop all columns that are Unnamed
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

    # Drop all rows that are empty
    df = df.dropna(how='all')
    print("Number of valid rows: ",df.shape[0])

    # Strip leading and trailing white space from column names
    df.columns = df.columns.str.strip()

    # Convert columns to the right data type
    df['Date'] = df['Date'].astype(int)
    df['Latitude'] = df['Latitude'].astype(float)
    df['Longitude'] = df['Longitude'].astype(float)

    #  Convert to json
    df = df.to_json(orient='records')
    
    # Get the filename and the outfile name
    filename = Path(file)
    outfile = str(filename.parent.parent)+"/data.js"
    print("Wrote to:", outfile)

    # Write the file to a json stored in an .js file
    with open(outfile, 'w', encoding='utf-8') as f:
        f.write("let data=")
        f.write(df)

# Driver Code
if __name__ == '__main__':

    if(len(sys.argv) < 2):
        print("Usage: python data2json.py <file.xlsx>")
        sys.exit()
    file = sys.argv[1]
    make_json(file)
