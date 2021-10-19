#!/usr/bin/env python3
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
# Convert .csv data to JSON for visualization
# Written by Kristi Potter (kristi.potter@gmail.com)
# 10/02/2021
#
# Usage: python csv2json.js
# Outfile: data.js
#
# This script assumes there exists a data.csv file in this
# folder, and python version 3 is available with pandas.
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
import csv
import json
import sys
import pandas as pd

# Function to convert a CSV to JSON saved as a js file
def make_json():

    # create a dictionary
    data = []

    # Read in data.csv
    csv = pd.read_csv('data.csv').replace('"','\"', regex=True)

    # Drop all columns that are Unnamed
    csv = csv.loc[:, ~csv.columns.str.contains('^Unnamed')]

    # Drop all rows that are empty
    csv = csv.dropna(how='all')
    print("Number of valid rows: ",csv.shape[0])

    # Convert columns to the right data type
    csv['Date'] = csv['Date'].astype(int)
    csv = csv.drop(['Lat', 'Lon'], axis=1)
    csv['Lat'] = csv['Generated Lat'].astype(float)
    csv['Lon'] = csv['Generated Lon'].astype(float)
    csv = csv.drop(['Generated Lat', 'Generated Lon'], axis=1)

    #  Convert to json
    csv = csv.to_json(orient='records')

    # Write the file to a json stored in an .js file
    with open('data.js', 'w', encoding='utf-8') as f:
        f.write("let data=")
        f.write(csv)

# Driver Code
if __name__ == '__main__':
	make_json()
