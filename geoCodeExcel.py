#!/usr/bin/env python3
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
# Geoencode Excel file
# Written by Kristi Potter (kristi.potter@gmail.com)
# 10/02/2021
#
# Usage: python geoCodeXLS.py
# Outfile: data.js
#
# This script assumes there exists a data.csv file in this
# folder, and python version 3 is available with pandas.
# * * * * * * * * * * * * * * * * * * * * * * * * * * * //
import sys
import pandas as pd
import requests
import urllib.parse
from pathlib import Path

def geoCodeExcel(file, sheetname):

    # Get the filename and the outfile name
    filename = Path(file)
    outfile = str(filename.with_suffix(''))+"_geocoded"+str(filename.suffix)

    # Read in the data
    df = pd.read_excel(file, sheet_name=sheetname)

    # If we have sheets and none is specified, process only the first
    if isinstance(df, dict):
        first_key = list(df.keys())[0]
        print("Multiple sheets detected. Encoding only " + first_key+".")
        df = df[first_key]

    # Drop all columns that are Unnamed
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]

    # Drop all empty rows
    df = df.dropna(how='all')

    # Convert columns to the right data type
    df['Date'] = df['Date'].astype(str)
    df['Date (PWP)'] = df['Date (PWP)'].astype(str)
    df['Date (KEH)'] = df['Date (KEH)'].astype(str)

    # Add new lat/lon columns
    df['Generated Lat'] = ""
    df['Generated Lon'] = ""

    # Save the addresses that aren't found
    not_found = []

    # Iterate over the dataframe
    for index, row in df.iterrows():

        # Get the address
        address = row['Location']
        print("Address: ", address)

        # Get the lat/lon response
        url = 'https://nominatim.openstreetmap.org/search/' + urllib.parse.quote(address) +'?format=json'
        response = requests.get(url).json()

        if(len(response) == 0):
            print("Address not found: ", address)
            df.at[index,'Generated Lat'] = row["Lat"]
            df.at[index,'Generated Lon'] = row["Lon"]
            not_found.append(address)
        else:
            #print(response[0]["lat"], response[0]["lon"])
            df.at[index,'Generated Lat'] = response[0]["lat"]
            df.at[index,'Generated Lon'] = response[0]["lon"]

    # Write to a new excel file
    df.to_excel(outfile)

    # Save as csv
    df.to_csv('data.csv')

    # Write out any addresses not found
    if(len(not_found) > 0):
        textfile = open("addressesNotFound.txt", "w")
        for element in not_found:
            textfile.write(element + "\n")
        textfile.close()

if __name__ == '__main__':

    if(len(sys.argv) < 2):
        print("Usage: python geoCodeExcel.py <file.xls > [optional sheetname]")
        sys.exit()
    file = sys.argv[1]
    sheetname = None
    if(len(sys.argv) == 3):
        sheetname = sys.argv[2]
    geoCodeExcel(file, sheetname)
