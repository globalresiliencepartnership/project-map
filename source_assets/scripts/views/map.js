/*global Grp, Backbone*/
Grp.Views = Grp.Views || {};

(function () {
'use strict';

  Grp.Views.Map = Backbone.View.extend({

    el: '#map',

    // GeoJSON created from the conversion of the spreadsheet data.
    // This should not be modified as we frequently need a reference.
    mapGeojson: null,
    // List of all project pid. Use to ease prev/next navigation
    projectIds: [],
    // List of projects as returned from the api.
    projects: [],

    // Sidebar View.
    sidebarView: null,

    // Project being displayed.
    currentProj: null,

    // Map elements.
    map: null,
    markerClusterLayer: null,
    filteredMarkersLayer: null,
    // Area to use for checking nearby markers. From turf.buffer()
    markerNearbyZone: null,
    nearbyMarkersLayer: null,

    tooltipTemplate: JST['map-tooltip.ejs'],

    initialize: function() {
      var _self = this;
      this.processApiData(function(err, geojson) {
        _self.mapGeojson = geojson;
        _self.render();
      });
    },

    /**
     * Setup the map and the sidebar view.
     *
     * @return this
     */
    render: function() {
      var _self = this;

      this.sidebarView = new Grp.Views.Sidebar();

      this.map = L.mapbox.map('map', 'examples.map-i86nkdio', { zoomControl: false });
                                                                                    window.map = this.map;
      // Create new cluster.
      this.markerClusterLayer = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: function(cluster) {
          return new L.DivIcon({
            className : 'marker cluster',
            iconSize: [],
            html: '<p>' + cluster.getChildCount() + '</p>'
          });
        }
      });

      // Add the processed geoJson layer to the marker cluster.
      this.filteredMarkersLayer = this.getFilteredMarkers(null);
      this.markerClusterLayer.addLayer(this.filteredMarkersLayer);
      // Add clusters to the map.
      this.map.addLayer(this.markerClusterLayer);

      this.addEventListeners();

      return this;
    },

    /**
     * Add view event listeners.
     *
     * @return this
     */
    addEventListeners: function() {
      var _self = this;

      this.sidebarView
        .bind('nav:up', this.sidebarNavUpBtnClick, this)
        .bind('nav:prev', this.sidebarNavPrevBtnClick, this)
        .bind('nav:next', this.sidebarNavNextBtnClick, this);

      $('#map').on('click', '.view-more', function(e) {
        e.preventDefault();

        var pid = $(this).data('pid').toString();
                                                                                  console.log('PID', pid);
        _self.currentProj = _.findWhere(_self.projects, {pid: pid});
        _self.filterByPid(pid);

        // Sidebar.
                                                                                  console.log('Clicked marker props', _self.currentProj);
        _self.sidebarView.setData(_self.currentProj).render();

      });

      return this;
    },

    /////////////////////////////////////////////////
    /// Event Listeners
    ///  

    /**
     * Event listener for 'nav:up'.
     * This event is triggered from the sidebar view.
     */
    sidebarNavUpBtnClick: function() {
      this.resetMarkers();
    },

    /**
     * Event listener for 'nav:next'.
     * This event is triggered from the sidebar view.
     */
    sidebarNavNextBtnClick: function() {
                                                                                    console.log('projectIds', this.projectIds);
      var cIndex = _.indexOf(this.projectIds, this.currentProj.pid);
                                                                                    console.log('currentPid', this.projectIds);
      var nIndex = cIndex + 1;
      var nextPid = nIndex >= this.projectIds.length ? this.projectIds[0] : this.projectIds[nIndex];
                                                                                    console.log('currentPid', nextPid);
      // Find the project with the next PID.
      this.currentProj = _.findWhere(this.projects, {pid: nextPid});
                                                                                    console.log('currentProj', this.currentProj);
      this.filterByPid(this.currentProj.pid);
      this.sidebarView.setData(this.currentProj).render();
    },

    /**
     * Event listener for 'nav:prev'.
     * This event is triggered from the sidebar view.
     */
    sidebarNavPrevBtnClick: function() {
                                                                                    console.log('projectIds', this.projectIds);
      var cIndex = _.indexOf(this.projectIds, this.currentProj.pid);
                                                                                    console.log('currentPid', this.projectIds);
      var nIndex = cIndex - 1;
      var prevPid = nIndex < 0 ? this.projectIds[this.projectIds.length - 1] : this.projectIds[nIndex];
                                                                                    console.log('currentPid', prevPid);
      // Find the project with the next PID.
      this.currentProj = _.findWhere(this.projects, {pid: prevPid});
                                                                                    console.log('currentProj', this.currentProj);
      this.filterByPid(this.currentProj.pid);
      this.sidebarView.setData(this.currentProj).render();
    },

    /////////////////////////////////////////////////
    /// Helpers
    /// 
    
    /**
     * Cleans the map and adds back the marker clusters.
     * 
     * @return this
     */
    resetMarkers: function () {
      // Remove all markers and feature layers from the map.
      this.cleanMap();

      // Add marker cluster back.
      this.filteredMarkersLayer = this.getFilteredMarkers(null);
      this.markerClusterLayer.addLayer(this.filteredMarkersLayer);

      this.map
        .addLayer(this.markerClusterLayer)
        .fitBounds(this.filteredMarkersLayer.getBounds());

      return this;
    },

    /**
     * Removes all the feature layers from the map.
     * 
     * @return this
     */
    cleanMap: function() {
      // Remove individual markers from map.
      this.map
        .removeLayer(this.filteredMarkersLayer)
        .removeLayer(this.markerClusterLayer);

      this.markerClusterLayer.clearLayers();

      // Remove nearby markers.
      if(this.nearbyMarkersLayer) {
        this.map.removeLayer(this.nearbyMarkersLayer);
                                                                                    // Remove turf layer.
                                                                                    this.map.removeLayer(this.nearbyMarkersZoneLayer);
      }

      return this;
    },

    /**
     * Filters the markers and adds them to the map.
     * Shows the nearby markers.
     * 
     * @param  String pid
     *   The projectId to filter for. When null all markers are
     *   returned.
     * @return this
     */
    filterByPid: function (pid) {
      var _self = this;

      // Remove all markers and feature layers from the map.
      this.cleanMap();

      // Filter the markers by th projectId (pid);
      this.filteredMarkersLayer = this.getFilteredMarkers(pid);

      // The turf api needs the a geojson input.
      var geoJson = this.filteredMarkersLayer.toGeoJSON();
      this.markerNearbyZone = turf.buffer(geoJson, 1000, 'kilometers');

      this.nearbyMarkersLayer = this.getNearbyMarkers(this.markerNearbyZone);

                                                                                    // Add turf area to map.
                                                                                    this.nearbyMarkersZoneLayer = L.mapbox.featureLayer().setGeoJSON(this.markerNearbyZone).addTo(_self.map);
      this.map
        .addLayer(this.nearbyMarkersLayer)
        .addLayer(this.filteredMarkersLayer)
        .fitBounds(this.filteredMarkersLayer.getBounds());

      return this;
    },

    /**
     * Return a feature layer containing the markers within the
     * nearbyZone.
     * 
     * @param  geojson nearbyZone 
     *  Result of turf.buffer() 
     * @return L.mapbox.featureLayer
     */
    getNearbyMarkers: function (nearbyZone) {
      var _self = this;
      // To get the nearby marker, create a feature layer with all the markers.
      var nearbyMarkersLayer = L.mapbox.featureLayer().setGeoJSON(this.mapGeojson);
      // Let the filtering begin.
      nearbyMarkersLayer.setFilter(function(geoJsonLayer) {
        // The setFilter method provides a geojson layer, not a feature layer,
        // therefore the .hasLayer method can't be used.
        // Loop over each layer and check if there's a match.
        var found = false;
        // We don't want to include the filtered markers in the nearby ones.
        _self.filteredMarkersLayer.eachLayer(function(layer) {
          if (_.isEqual(geoJsonLayer, layer.toGeoJSON())) { found = true; }
        });

        if (found) { return false; }

        // Check if it is nearby.
        // turf.inside doesn't work with feature collection.
        // Get the first of its features.
        return turf.inside(geoJsonLayer, nearbyZone.features[0]);
      });

      // Now that the markers have been filters proceed with its styling.
      // The icon and tooltip have the same style as the other markers.
      nearbyMarkersLayer.eachLayer(function (layer) {
        var props = layer.feature.properties;

        var marker_icon = L.divIcon({
          className : 'marker single secondary',
          iconSize: [],
          popupAnchor : [0, -16],
        });
        // Set the icon.
        layer.setIcon(marker_icon);

        // Marker popup.
        var popup = _self.tooltipTemplate(props);
        layer.bindPopup(popup);
      });

      return nearbyMarkersLayer;
    },

    /**
     * Creates a features layer from the geojson and filters 
     * according to the given pid.
     * 
     * @param  String pid
     *   The projectId to filter for. When null all markers are
     *   returned.
     * @return L.mapbox.featureLayer
     */
    getFilteredMarkers: function (pid) {
      var _self = this;
      // Create a markers layer from the processed geojson.
      var markers = L.mapbox.featureLayer().setGeoJSON(this.mapGeojson);

      if (pid) {
        markers.setFilter(function(layer) {
          return layer.properties.pid == pid;
        });
      }

      markers.eachLayer(function (layer) {
        var props = layer.feature.properties;

        var marker_icon = L.divIcon({
          className : 'marker single',
          iconSize: [],
          popupAnchor : [0, -16],
        });
        // Set the icon.
        layer.setIcon(marker_icon);

        // Marker popup.
        var popup = _self.tooltipTemplate(props);
        layer.bindPopup(popup);
      });

      return markers;
    },

    /**
     * Converts the data from the google spreadsheet to geojson.
     * 
     * @param  {Function} callback 
     *  Callback when process is complete. Called with two arguments (err, res) 
     */
    processApiData: function(callback) {
      var _self = this;

      async.parallel([
        function(cb){
          $.get('https://spreadsheets.google.com/feeds/list/1a3dc9MtXMHbeY9KusCKFh8u6x6W0EzHvKyHUTsatZmg/1/public/values?alt=json')
            .success(function(data) {
              cb(null, _self.cleanSpreadsheetData(data));
            })
            .fail(function() {
              cb('Fail to load projects from api.');
            });
        },
        function(cb){
          $.get('https://spreadsheets.google.com/feeds/list/1a3dc9MtXMHbeY9KusCKFh8u6x6W0EzHvKyHUTsatZmg/2/public/values?alt=json')
            .success(function(data) {
              cb(null, _self.cleanSpreadsheetData(data));
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

        // Store a list of pids for the navigation.
        _self.projectIds = _.pluck(projects, 'pid');
        _self.projects = projects;

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
    cleanSpreadsheetData: function(raw) {
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