/*global Grp, Backbone*/
Grp.Views = Grp.Views || {};

(function () {
'use strict';

  Grp.Views.Map = Backbone.View.extend({

    el: '#map',

    mapGeojson: null,
    projectIds: [],
    projects: [],

    sidebar: null,

    currentProj: null,

    // Map elements.
    map: null,
    markerCluster: null,
    filteredMarkers: null,

    tooltipTemplate: JST['map-tooltip.ejs'],

    initialize: function() {
      var _self = this;
      this.processApiData(function(err, geojson) {
        _self.mapGeojson = geojson;
        _self.render();
      });
    },

    render: function() {
      var _self = this;

      this.sidebar = new Grp.Views.Sidebar();

      this.sidebar
        .on('nav:up', this.sidebarNavUpBtnClick, this)
        .bind('nav:prev', this.sidebarNavPrevBtnClick, this)
        .bind('nav:next', this.sidebarNavNextBtnClick, this);

      this.map = L.mapbox.map('map', 'examples.map-i86nkdio', { zoomControl: false });
                                                                                    window.map = this.map;
      // Create new cluster.
      this.markerCluster = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        iconCreateFunction: function(cluster) {
          return new L.DivIcon({
            className : 'marker cluster',
            iconSize: [],
            html: '<p>' + cluster.getChildCount() + '</p>'
          });
        }
      });

      $('#map').on('click', '.view-more', function(e) {
        e.preventDefault();

        var pid = $(this).data('pid').toString();
                                                                                  console.log('PID', pid);
        _self.currentProj = _.findWhere(_self.projects, {pid: pid});
        _self.filterByPid(pid);

        // Sidebar.
                                                                                  console.log('Clicked marker props', _self.currentProj);
        _self.sidebar.setData(_self.currentProj).render();

      });

      // Add the processed geoJson layer to the marker cluster.
      this.filteredMarkers = this.getFilteredMarkers(null);
      this.markerCluster.addLayer(this.filteredMarkers);
      // Add clusters to the map.
      this.map.addLayer(this.markerCluster);
    },

    /////////////////////////////////////////////////
    /// Event Listeners
    ///  

    sidebarNavUpBtnClick: function() {
      this.resetMarkers();
    },

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
      this.sidebar.setData(this.currentProj).render();
    },

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
      this.sidebar.setData(this.currentProj).render();
    },

    /////////////////////////////////////////////////
    /// Helpers
    /// 
    resetMarkers: function () {
      // Remove individual markers from map.
      this.map.removeLayer(this.filteredMarkers);
      this.markerCluster.clearLayers();

      // Add marker cluster back.
      this.filteredMarkers = this.getFilteredMarkers(null);
      this.markerCluster.addLayer(this.filteredMarkers);
      this.map.addLayer(this.markerCluster);
      this.map.fitBounds(this.filteredMarkers.getBounds());
    },

    filterByPid: function (pid) {
      // Remove individual markers from map.
      this.map.removeLayer(this.filteredMarkers);
      this.map.removeLayer(this.markerCluster);

      this.filteredMarkers = this.getFilteredMarkers(pid);
      this.map.addLayer(this.filteredMarkers);
      this.map.fitBounds(this.filteredMarkers.getBounds());
    },

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
          popupAnchor : [0, 0],
        });
        // Set the icon.
        layer.setIcon(marker_icon);

        // Marker popup.
        var popup = _self.tooltipTemplate(props);
        layer.bindPopup(popup);
      });

      return markers;
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