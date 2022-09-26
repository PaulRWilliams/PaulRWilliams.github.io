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
from geopy.geocoders import Nominatim
import time

def geoCodeExcel(file, sheetname):

    # initialize Nominatim API
    geolocator = Nominatim(user_agent="PRWGeoEncode")

    # Get the filename and the outfile name
    filename = Path(file)
    outfile = str(filename.with_suffix(''))+"_geocoded"+str(filename.suffix)
    addressesNotFoundFile = str(filename.parent)+"/addressesNotFound.txt"

    # Read in the data
    df = pd.read_excel(file, sheet_name=sheetname, engine='openpyxl')

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
    df['Latitude'] = ""
    df['Longitude'] = ""

    # Add the city, state, country
    df['city'] = ""
    df['county'] = ""
    df['state'] = ""
    df['country'] = ""

    # Notes on the whole response and if the address is found
    df['response'] = ""
    df['not found'] = ""

    # Save the addresses that aren't found
    not_found = []

    # Iterate over the dataframe
    for index, row in df.iterrows():
        #row = df.iloc[150]

        # Get the address from the spreadsheet
        address = row['Location']
        print("Address: ", address, "("+str(index)+")")

        # Using Nominatim (via openstreetmap), find the address
        location = geolocator.geocode(address)

        # If the address is not found, note that
        if location == None:
            print("Address not found: ", address)
            df.at[index, 'not found'] = "not found"
            not_found.append(address)

            # While we don't have a location, peel off the address until we do
            newAddress = address
            while location == None:

                # Try to find the city, country
                newAddress = newAddress.split(" ", 1)[1]

                # Using Nominatim (via openstreetmap), find the address
                location = geolocator.geocode(newAddress, timeout=None)
                time.sleep(2)
            print("new location", location)
        # Save the coordinates
        df.at[index,'Latitude'] = location.latitude
        df.at[index,'Longitude'] = location.longitude

        # Reverse lookup to get all info at that lat/lon
        locDetail = geolocator.reverse(str(location.latitude)+","+str(location.longitude)).raw['address']

        # Save all info on this location
        df.at[index, 'response'] = locDetail

        # Save info to sort by
        if('city' in locDetail.keys()):
            df.at[index, "city"] = locDetail['city']
        elif ('hamlet' in locDetail.keys()):
            df.at[index, "city"] = locDetail['hamlet']
        elif ('village' in locDetail.keys()):
            df.at[index, "city"] = locDetail['village']
        elif ('suburb' in locDetail.keys()):
            df.at[index, "city"] = locDetail['suburb']
        elif ('town' in locDetail.keys()):
            df.at[index, "city"] = locDetail['town']
        else:
            df.at[index, "city"] = ""

        if('county' in locDetail.keys()):
            df.at[index, "county"] = locDetail['county']
        else:
            df.at[index, "county"] = ""

        if('state' in locDetail.keys()):
            df.at[index, "state"] = locDetail['state']
        else:
            df.at[index, "state"] = ""
        df.at[index, "country"] = locDetail['country']

        #break

    # Convert the generated lat/lon columns to numbers
    df['Latitude'] = pd.to_numeric(df['Latitude'])
    df['Longitude'] = pd.to_numeric(df['Longitude'])

    # Write to a new excel file
    df.to_excel(outfile)
    print("Wrote to:", outfile)

    # Write out any addresses not found
    if(len(not_found) > 0):
        textfile = open(addressesNotFoundFile, "w")
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
