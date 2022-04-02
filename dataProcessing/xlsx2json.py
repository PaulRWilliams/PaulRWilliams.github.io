#!/usr/bin/env python3
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
# Convert .xlsx data to JSON for visualization
# Written by Kristi Potter (kristi.potter@gmail.com)
# 10/02/2021
#
# Usage: python xlsx2json.js
# Outfile: data.js
#
# This script assumes python version 3 is available with pandas.
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
import json
import sys
import pandas as pd

# Function to convert a CSV to JSON saved as a js file
def make_json(file):


    # Read in data.csv
    #csv = pd.read_csv('data.csv').replace('"','\"', regex=True)

    # Read in the data
    df = pd.read_excel(file)

    # Drop all columns that are Unnamed
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

    # Drop all rows that are empty
    df = df.dropna(how='all')
    print("Number of valid rows: ",df.shape[0])

    # Convert columns to the right data type
    df['Date'] = df['Date'].astype(int)
    df = df.drop(['Lat', 'Lon'], axis=1)
    df['Lat'] = df['Generated Lat'].astype(float)
    df['Lon'] = df['Generated Lon'].astype(float)
    df = df.drop(['Generated Lat', 'Generated Lon'], axis=1)

    #  Convert to json
    df = df.to_json(orient='records')

    # Write the file to a json stored in an .js file
    with open('../data.js', 'w', encoding='utf-8') as f:
        f.write("let data=")
        f.write(df)

# Driver Code
if __name__ == '__main__':

    if(len(sys.argv) < 2):
        print("Usage: python xlsx2json.py <file.xlsx>")
        sys.exit()
    file = sys.argv[1]
    make_json(file)
