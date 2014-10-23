from __future__ import print_function
import sys
import json
import re


def main():
    """ Generates geojson at country level """

    f = open('data/list.json', 'r')
    geojson_file = open('../tilemill/data/country_level_list.geojson', 'w')

    geojson = {
        'type': 'FeatureCollection',
        'features': []
    }

    j = json.loads(f.read())

    country_list = {}

    # Group Country info and calculate totals
    for item in j:
        match = re.findall('[0-9]|[.]', item['FY14 Contribution'])
        if match:
            budget = float(''.join(map(str, match)))
        else:
            budget = 0

        if item['Country'] in country_list:
            country_list[item['Country']]['total_partners'] += 1
            country_list[item['Country']]['total_projects'] += 1
            country_list[item['Country']]['total_budget'] += budget
            country_list[item['Country']][
                'total_locations'] += len(item['locations'])

        else:
            country_list[item['Country']] = {
                'type': item['Type of Program'],
                'region': item['Region'],
                'country': item['Country'],
                'total_partners': 1,
                'total_projects': 1,
                'total_budget': budget,
                'total_locations': len(item['locations']),
                'lat': item['country_coordinates']['lat'],
                'long': item['country_coordinates']['long']
            }

    for (k, v) in country_list.items():
        feature = {
            'type': 'Feature',
            'properties': None,
            'geometry': {
                'type': 'Point',
                'coordinates': []
            }
        }
        feature['properties'] = v
        feature['geometry']['coordinates'] = [v['long'], v['lat']]
        geojson['features'].append(feature)

    geojson_file.write(json.dumps(geojson, sort_keys=True,
                                  indent=4, separators=(',', ': ')))
    geojson_file.close()


if __name__ == '__main__':
    if sys.version_info[0] < 3:
        print('This script only runs with Python 3 and higher')
        print('On Mac consider running it using python3')
        sys.exit(1)
    main()
