/*global Grp, Backbone*/
Grp.Views = Grp.Views || {};

(function () {
'use strict';

  Grp.Views.Map = Backbone.View.extend({

    el: '#site-canvas',
    template: JST['map.ejs'],

    // GeoJSON created from the conversion of the spreadsheet data.
    // This should not be modified as we frequently need a reference.
    mapGeojson: null,
    // List of all project pid. Use to ease prev/next navigation
    projectIds: [],
    // List of projects as returned from the api.
    projects: [],
    // List of tour items
    tourItems: [],

    // Sidebar View.
    sidebarView: null,
    
    // Tour View.
    tourView: null,
    
    // Tour item being displayed.
    currentTourItem: 0,

    // Project being displayed.
    currentProj: null,
    
    scrollTimer: null,
    
    clickTimer: null,

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
      this.processApiData(function(err, geojson, tourItems) {
        _self.mapGeojson = geojson;
        _self.tourItems = _.sortBy(tourItems, function(o) { return o.attributes.Weight; });
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

      this.$el.html(this.template());

      this.sidebarView = new Grp.Views.Sidebar();
      
      this.tourView = new Grp.Views.Tour();
      
      
      _self.tourView.setData(_self.tourItems[0].attributes).render();
      
      console.log(_self.tourItems);

      this.map = L.mapbox.map('map', 'devseed.la1fieg0', { maxZoom: 20, zoomControl: false });
                                                                                    window.map = this.map                                                                                                                                                            
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
      
      
      var location = this.tourItems[0].attributes.location;
      var zoom = this.tourItems[0].attributes.zoom;
      this.map.setView([location.latitude, location.longitude], zoom);
      
      this.scrollTimer = window.setInterval(function(){
        location.longitude = location.longitude + 0.001;
		this.map.setView([location.latitude, location.longitude], zoom)
	  }, 20);
	  
      this.clickTimer = window.setInterval(function(){
        $('#tour-next').trigger('click');
	  }, 10000);

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
        
      this.tourView
        .bind('tour:next', this.tourNavNextBtnClick, this)
        .bind('tour:prev', this.tourNavPrevBtnClick, this);
        
      $('#map').on('click', function() {
        clearInterval(_self.clickTimer);
        clearInterval(_self.scrollTimer);
      });

      $('#map').on('click', '.view-more', function(e) {
        e.preventDefault();
		
		$('.tour-cntrl, #sidebar .tour').hide();
		$('#sidebar .project').show();

        var pid = $(this).data('pid').toString();
                                                                                  console.log('PID', pid);
        _self.currentProj = _.findWhere(_self.projects, {id: pid});
        _self.filterByPid(pid);

        // Sidebar.
                                                                                  console.log('Clicked marker props', _self.currentProj);
        _self.sidebarView.setData(_self.currentProj.attributes).render();

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
      $('#sidebar, .tour-cntrl, #sidebar .tour').show();
      $('#sidebar .project').hide();

    },

    /**
     * Event listener for 'nav:next'.
     * This event is triggered from the sidebar view.
     */
    sidebarNavNextBtnClick: function() {
                                                                                    console.log('projectIds', this.projectIds);
      var cIndex = _.indexOf(this.projectIds, this.currentProj.id);
                                                                                    console.log('currentPid', this.projectIds);
      var nIndex = cIndex + 1;
      var nextPid = nIndex >= this.projectIds.length ? this.projectIds[0] : this.projectIds[nIndex];
                                                                                    console.log('currentPid', nextPid);
      // Find the project with the next PID.
      this.currentProj = _.findWhere(this.projects, {id: nextPid});
                                                                                    console.log('currentProj', this.currentProj);
      this.filterByPid(this.currentProj.id);
      this.sidebarView.setData(this.currentProj.attributes).render();
    },

    /**
     * Event listener for 'nav:prev'.
     * This event is triggered from the sidebar view.
     */
    sidebarNavPrevBtnClick: function() {
                                                                                    console.log('projectIds', this.projectIds);
      var cIndex = _.indexOf(this.projectIds, this.currentProj.id);
                                                                                    console.log('currentPid', this.projectIds);
      var nIndex = cIndex - 1;
      var prevPid = nIndex < 0 ? this.projectIds[this.projectIds.length - 1] : this.projectIds[nIndex];
                                                                                    console.log('currentPid', prevPid);
      // Find the project with the next PID.
      this.currentProj = _.findWhere(this.projects, {id: prevPid});
                                                                                    console.log('currentProj', this.currentProj);
      this.filterByPid(this.currentProj.id);
      this.sidebarView.setData(this.currentProj.attributes).render();
    },
    
    /**
     * Event listener for 'tour:prev'.
     * This event is triggered from the tour view.
     */
    tourNavPrevBtnClick: function() {
      
      this.currentTourItem --;
      var tourLength = this.tourItems.length;
      console.log(this.currentTourItem);
      
      clearInterval(this.scrollTimer);
      
      if (this.currentTourItem == -1) {
        this.currentTourItem = tourLength -1;
      } 
      
      var location = this.tourItems[this.currentTourItem].attributes.location;
      var zoom = this.tourItems[this.currentTourItem].attributes.zoom;
      this.map.setView([location.latitude, location.longitude], zoom);
      
      this.tourView.setData(this.tourItems[this.currentTourItem].attributes).render();                                                                           
     
    },
    
    /**
     * Event listener for 'tour:prev'.
     * This event is triggered from the tour view.
     */
    tourNavNextBtnClick: function() {
      
      this.currentTourItem ++;
      var tourLength = this.tourItems.length;
      if (this.currentTourItem >= tourLength) {
        this.currentTourItem = 0;
      } 
      
     clearInterval(this.scrollTimer);
      
      var location = this.tourItems[this.currentTourItem].attributes.location;
      var zoom = this.tourItems[this.currentTourItem].attributes.zoom;
      this.map.setView([location.latitude, location.longitude], zoom);
      
      this.tourView.setData(this.tourItems[this.currentTourItem].attributes).render();

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
      this.nearbyMarkersZoneLayer = L.mapbox.featureLayer().setGeoJSON(this.markerNearbyZone);
      
      this.map
        .addLayer(this.nearbyMarkersLayer)
        .addLayer(this.filteredMarkersLayer)
        .fitBounds(this.filteredMarkersLayer.getBounds(), {'padding': [200, 200]});

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
     * Process the data from the parse api creating a geojson.
     * 
     * @param  {Function} callback 
     *  Callback when process is complete. Called with two arguments (err, res) 
     */
    processApiData: function(callback) {
      var _self = this;

      // All published projects.
      var ProjectQuery = new Parse.Query(Grp.Models.Project);
      ProjectQuery.equalTo("published", 1);

      // All the locations of the published projects.
      var LocationQuery = new Parse.Query(Grp.Models.Location);
      LocationQuery.matchesQuery('project', ProjectQuery);
      LocationQuery.include('project');
      
      // All the tour items
      var TourQuery = new Parse.Query(Grp.Models.TourItem);
      
      async.parallel([
        function(cb){
          TourQuery.find({
            success: function(tourItems) {
              cb(null, tourItems);
            },
            error: function(error) {
              cb(error.message);
            }
          });
        },
      ],
      function(err, res) {
       if (err) { throw new Error(err); }
       
       var tourItems = res[0];
         

      async.parallel([
        function(cb){
          LocationQuery.find({
            success: function(locations) {
              cb(null, locations);
            },
            error: function(error) {
              cb(error.message);
            }
          });
        },
      ],
      function(err, res) {
        if (err) { throw new Error(err); }

        var locations = res[0];

        var geojson = {
          type: "FeatureCollection",
          features: []
        };

        //console.log('locations', locations);

        locations.forEach(function(obj) {
          var project = obj.get('project');

          if (_self.projectIds.indexOf(project.id) == -1) {
            // Store a list of all projects.
            _self.projects.push(project);
            // Store a list of pids for the navigation.
            _self.projectIds.push(project.id);
          }

          // Base feature structure. 
          var feature = {
            type: "Feature",
            geometry: {type: "Point", coordinates: []},
            properties: {}
          };

          // The feature properties will be the related project.
          feature.properties = project.attributes;
          feature.properties.pid = project.id;

          var loc = obj.get('location');
          feature.geometry.coordinates = [loc.longitude, loc.latitude];

          geojson.features.push(feature);

        });
        
        
        callback(null, geojson, tourItems);
        
            }
         )

      });
    }


  });
  
  

})();