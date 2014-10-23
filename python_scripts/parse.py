from __future__ import print_function
import csv
import json
import sys
import time
from geopy.geocoders import GoogleV3
from geopy.exc import GeocoderTimedOut


def get_coordinates(address):
    """ Grabs geolocations of address from Google Location Service """

    try:
        g = GoogleV3(api_key='AIzaSyCAV-0C7Btyez-n4H_HdWWFgcwwHKRgiEc',
                     timeout=10)
        location = g.geocode(address)
        time.sleep(0.1)
        if location:
            print('%s found' % address)
            return {'raw': location.raw,
                    'lat': location.latitude,
                    'long': location.longitude,
                    'address': address}
        else:
            print('%s not found' % address)
            return ''
    except GeocoderTimedOut:
        print('request timeout for %s' % address)
        return ''


def main():
    """ Parses the given CSV file and return a json file that has separated the
    cities/muncipalities of the origin data and has fetched the coordinates of
    both cities and countries
    """

    f = open('data/data2.csv', 'r', encoding='utf-8')
    data = csv.reader(f, delimiter=',', dialect=csv.excel_tab)

    header = [v for v in next(data)]
    locations = []
    datalist = []

    found = 0
    not_found = 0
    loc = None

    for d in data:
        row = [v for v in d]
        datalist.append({header[k]: v for k, v in enumerate(row)})

    for i, d in enumerate(datalist):
        datalist[i]['locations'] = []
        datalist[i]['country_coordinates'] = None
        for (k, v) in d.items():
            if k == 'Location (District or Municipality)':
                if v:
                    cities = v.split(', ')
                    for city in cities:
                        loc = get_coordinates("%s %s" % (city,
                                                         datalist[i]['Country']))
                        if loc:
                            found += 1
                            locations.append(loc)
                            new_sub_dict = {'implementer': datalist[i]['Partner'],
                                            'location': city,
                                            'lat': loc['lat'],
                                            'long': loc['long'],
                                            'raw': loc['raw']
                                            }
                        else:
                            new_sub_dict = {'implementer': datalist[i]['Partner'],
                                            'location': city,
                                            'lat': None,
                                            'long': None,
                                            'raw': None
                                            }
                            not_found += 1
                        datalist[i]['locations'].append(new_sub_dict)

            if k == 'Country':
                loc = get_coordinates(datalist[i]['Country'])

                if loc:
                    datalist[i]['country_coordinates'] = {
                        'lat': loc['lat'],
                        'long': loc['long'],
                        'raw': loc['raw']
                    }
                else:
                    datalist[i]['country_coordinates'] = {
                        'lat': None,
                        'long': None,
                        'raw': None
                    }

    print('Coordinates of %s were found' % found)
    print('%s locations skipped because coordinates were not found' % not_found)
    export = open('data/list.json', 'w')

    export.write(json.dumps(datalist, sort_keys=True,
                            indent=4, separators=(',', ': ')))

    export.close()


if __name__ == '__main__':
    if sys.version_info[0] < 3:
        print('This script only runs with Python 3 and higher')
        print('On Mac consider running it using python3')
        sys.exit(1)
    main()
