/*global Grp, Backbone*/
Grp.Views = Grp.Views || {};

(function () {
'use strict';

  Grp.Views.Map = Backbone.View.extend({

    el: '#map',

    mapGeojson: null,

    initialize: function() {
      var _self = this;
      this.processApiData(function(err, geojson) {
        _self.mapGeojson = geojson;
        _self.render();
      });
    },

    render: function() {
      var map = L.mapbox.map('map', 'examples.map-i86nkdio');

      // Create new cluster.
      var clusterGroup = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: function(cluster) {
          return new L.DivIcon({
            className : 'marker cluster',
            iconSize: [],
            html: '<p>' + cluster.getChildCount() + '</p>'
          });
        }
      });

      // Create a markers layer from the processed geojson.
      var markers = L.geoJson(this.mapGeojson, {
        onEachFeature: function (feature, layer) {
          setIcon(layer, 'marker single');
        }
      });

      // Click event for the markers.
      // On click, fade all markers not belonging to the given project.
      markers.on('click', function(e) {
        var pid = e.layer.feature.properties.pid;

        markers.eachLayer(function(layer) {
          if (layer.feature.properties.pid != pid) {
            setIcon(layer, 'marker single faded');
          }
          else {
            setIcon(layer, 'marker single');
          }
        });
      });
      
      // Add the processed geoJson layer to the marker cluster.
      clusterGroup.addLayer(markers);
      // Add clusters to the map.
      map.addLayer(clusterGroup);

      // Helper function to set the icon for the marker layer.
      function setIcon(layer, classes) {
        // Create a divIcon for the marker.
        var marker_icon = L.divIcon({
          className : classes,
          iconSize: [],
          popupAnchor : [0, 0],
        });
        // Set the icon.
        layer.setIcon(marker_icon);
      }

    },

    processApiData: function(callback) {
      var _self = this;

      async.parallel([
        function(cb){
          $.get('https://spreadsheets.google.com/feeds/list/1a3dc9MtXMHbeY9KusCKFh8u6x6W0EzHvKyHUTsatZmg/1/public/values?alt=json')
            .success(function(data) {
              cb(null, _self.cleanGoogleData(data));
            })
            .fail(function() {
              cb('Fail to load projects from api.');
            });
        },
        function(cb){
          $.get('https://spreadsheets.google.com/feeds/list/1a3dc9MtXMHbeY9KusCKFh8u6x6W0EzHvKyHUTsatZmg/2/public/values?alt=json')
            .success(function(data) {
              cb(null, _self.cleanGoogleData(data));
            })
            .fail(function() {
              cb('Fail to load projects\' location from api.');
            });
        },
        function(cb){
          $.get('/country_centroids.json')
            .success(function(data) {
              cb(null, data);
            })
            .fail(function() {
              cb('Fail to load country_centroids.');
            });
        },
      ],
      function(err, res) {
        if (err) { throw new Error(err); }

        var projects = res[0];
        var locations = res[1];
        var centroids = res[2];

        var geojson = {
          type: "FeatureCollection",
          features: []
        };

        locations.forEach(function(obj) {
          // Base feature structure. 
          var feature = {
            type: "Feature",
            geometry: {type: "Point", coordinates: []},
            properties: {}
          };

          // The feature properties will be the related project.
          feature.properties = _.findWhere(projects, {pid: obj.pid});
          // Add the country as a property.
          feature.properties.country = obj.country;
          // If there are coordinates use them, otherwise use the country centroid.
          feature.geometry.coordinates = obj.longitude && obj.latitude ? [obj.longitude, obj.latitude] : centroids[obj.countrycode].coordinates;

          geojson.features.push(feature);
        });

        callback(null, geojson);

      });

    },

    // Transform this:
    // "feed": {
    //  "entry": [
    //    {
    //      "gsx$pid": {
    //        "$t": "value"
    //      }
    //      ...
    //    }
    //    ...
    //  ]
    // }
    // 
    // Into this:
    // [
    //  {
    //    "pid": "value",
    //    "project": "value"
    //    ...
    //  }
    // ]
    // 
    // It will only extract keys that start with gsx$
    cleanGoogleData: function(raw) {
      var entries = raw.feed.entry;
        var cleanEntries = [];
        entries.forEach(function(obj) {
          var clean = {};
          for (var key in obj) {
            var pieces = key.match(/^gsx\$(.+)/);
            if (obj.hasOwnProperty(key) && pieces) {
              clean[pieces[1]] = obj[key].$t;
            }
          }
          cleanEntries.push(clean);
        });

        return cleanEntries;
    },

  });

})();