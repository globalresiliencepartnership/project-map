from __future__ import print_function
import sys
import json
import csv


def main():

    f = open('data/list.json', 'r')
    csv_file = open('data/list.csv', 'w')

    csv_writer = csv.writer(csv_file, delimiter=',')

    j = json.loads(f.read())

    header = ['type', 'region', 'country', 'partner', 'program_name',
              'award_date', 'expiration_date', 'fy14_contrib', 'notes',
              'implementer', 'lat', 'long', 'city']

    csv_writer.writerow(header)

    counter = 0

    for item in j:
        if item['locations']:
            for s in item['locations']:
                counter += 1
                row = [item['Type of Program'],
                       item['Region'],
                       item['Country'],
                       item['Partner'],
                       item['Program Name'],
                       item['Award Date'],
                       item['Expiration Date'],
                       item['FY14 Contribution'],
                       item['Notes'],
                       s['implementer'],
                       s['lat'],
                       s['long'],
                       s['location']]
                csv_writer.writerow(row)

    print('%s rows processed' % counter)
    print('results stored at list.csv')
    csv_file.close()


if __name__ == '__main__':
    if sys.version_info[0] < 3:
        print('This script only runs with Python 3 and higher')
        print('On Mac consider running it using python3')
        sys.exit(1)
    main()
