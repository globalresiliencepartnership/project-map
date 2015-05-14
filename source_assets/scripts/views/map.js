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
    
    clickTimer: null,

    // Map elements.
    map: null,
    markerClusterLayer: null,
    markerAggregateLayer: null,
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
      
      $('#more-info').popover({trigger: 'hover'});
      
      
      
      
      _self.tourView.setData(_self.tourItems[0].attributes).render();
      
      console.log(_self.tourItems);

      this.map = L.mapbox.map('map', 'devseed.la1fieg0', { maxZoom: 12, minZoom: 2, zoomControl: false }).on('ready', function() {
       new L.Control.Zoom({ position: 'topright' }).addTo(_self.map);
       new L.Control.MiniMap(L.mapbox.tileLayer('devseed.la1fieg0'), {zoomLevelFixed: 2, aimingRectOptions: {color: '#26C9FF', weight: 3, fill: false}}).addTo(_self.map);
       });
       
       window.map = this.map;
    
                                                                                                                                                                 
      // Create new cluster.
      this.markerClusterLayer = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: true,
        iconCreateFunction: function(cluster) {
          return new L.DivIcon({
            className : 'marker cluster',
            iconSize: [],
            html: '<p>' + cluster.getChildCount() + '</p>'
          });
        }
      });
    
      
     // this.markerClusterLayer = L.mapbox.featureLayer();
      
      //this.markerAggregateLayer = L.mapbox.featureLayer();
  
    
      console.log(_self.mapGeojson);
      var projects = []
      var cities = [];
      var countries = [];
      $.each(_self.mapGeojson.features, function(index, value) {
        console.log(value.properties.region);
         projects.push(value.properties.project.substring(0, 30));
         cities.push(value.properties.city);
         countries.push(value.properties.country);
      });
      
      var filterCities = _.unique(cities);
      $.each(filterCities, function(index, value) {
         console.log(value);
         $('#select-city-filter').append('<option value="' + value + '">' + value + '</option>');
      });
      
      var filterCountries = _.unique(countries);
      $.each(filterCountries, function(index, value) {
         console.log(value);
         $('#select-country-filter').append('<option value="' + value + '">' + value + '</option>');
      });
      
      var filterProjects = _.unique(projects);
      $.each(filterProjects, function(index, value) {
         console.log(value);
         $('#select-project-filter').append('<option value="' + value + '">' + value + '</option>');
      });
      
      $("#select-facet-filter").selectmenu();
      $("#select-city-filter").selectmenu();
      $("#select-country-filter").selectmenu();
      $("#select-project-filter").selectmenu();
      $('#select-city-filter-button, #select-project-filter-button').hide();
      $('.ui-icon').addClass('ui-icon-white');
      
      // Set default map view
      this.map.setView([0, 0], 2);

      // Add the processed geoJson layer to the marker cluster.
      this.filteredMarkersLayer = this.getFilteredMarkers(null);
      this.markerClusterLayer.addLayer(this.filteredMarkersLayer)
      // Add clusters to the map.
      this.map.addLayer(this.markerClusterLayer);
      //this.map.addLayer(this.markerAggregateLayer);
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
        .bind('nav:next', this.sidebarNavNextBtnClick, this)
        .bind('nav:about', this.sidebarNavAboutBtnClick, this)
        .bind('nav:search', this.sidebarNavSearchBtnClick, this)
        .bind('nav:searchQuery', this.sidebarNavSearchQuery, this);
        
      this.tourView
        .bind('tour:next', this.tourNavNextBtnClick, this)
        .bind('tour:prev', this.tourNavPrevBtnClick, this);
        
        
      this.map.on('zoomend', function() {
  		var currentZoom = map.getZoom();
 		 $('body').attr('id', 'zoom-' + currentZoom);
	});  
        
      $(document).on('click', '#close-about', function(e) {
        $('#about').removeClass('revealed');
      });
      
      
      /*
      $(document).on('change', '#select-city-filter-button', function(e) {
        var selected = $(this).find('.ui-selectmenu-text');
        $('#search-box').val(selected);
        _self.sidebarNavSearchQuery();
      });
      */
      
      $(document).on('click', '#logo', function(e) {
      
        e.preventDefault();
        
        $('#search-box').val('');
         _self.sidebarNavSearchQuery();
         _self.map.setView([0,0], 2);
        
      });
      
      $('#select-facet-filter').selectmenu({
        change: function( event, data ) {
          if (data.item.value === 'City') {
            $('#select-country-filter-button, #select-project-filter-button').hide();
            $('#select-city-filter-button').show();
          }
          if (data.item.value === 'Country') {
            $('#select-city-filter-button, #select-project-filter-button').hide();
            $('#select-country-filter-button').show();
          }
          if (data.item.value === 'Project') {
            $('#select-city-filter-button, #select-country-filter-button').hide();
            $('#select-project-filter-button').show();
          }
         }
        });
      $('#select-city-filter').selectmenu({
        change: function( event, data ) {
          $('#search-box').val(data.item.value);
          _self.sidebarNavSearchQuery();
        }
      });
      $('#select-country-filter').selectmenu({
        change: function( event, data ) {
          $('#search-box').val(data.item.value);
          _self.sidebarNavSearchQuery();
        }
      });
      $('#select-project-filter').selectmenu({
        change: function( event, data ) {
          $('#search-box').val(data.item.value);
          _self.sidebarNavSearchQuery();
        }
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
      
      var location = this.tourItems[this.currentTourItem].attributes.location;
      var zoom = this.tourItems[this.currentTourItem].attributes.zoom;
      this.map.setView([location.latitude, location.longitude], zoom);
      
      this.tourView.setData(this.tourItems[this.currentTourItem].attributes).render();

    },

    /**
     * Event listener for 'nav:about'.
     * This event is triggered from the sidebar view.
     */
    sidebarNavAboutBtnClick: function() {
          
      $('#about').addClass('revealed');

    },
  
    
     /**
     * Event listener for 'nav:search'.
     * This event is triggered from the sidebar view.
     */  
    sidebarNavSearchBtnClick: function() {
    
      console.log('Search!');
      $('#search').fadeIn();
      
    },
    
    
        
     /**
     * Event listener for 'nav:searchQuery'.
     * This event is triggered from the sidebar view.
     */  
    sidebarNavSearchQuery: function() {
    
    
      var selectedFacet = $('#select-facet-filter').find(":selected").val().toLowerCase();
         
      var searchString = $('#search-box').val().toLowerCase();
      
      console.log(selectedFacet);
      
      //console.log(this.markerClusterLayer);
      
      this.filteredMarkersLayer.setFilter(showProject); 
      
      //this.markerClusterLayer.setFilter(showProject); 
      
      function showProject(feature) {
        
        if (selectedFacet === 'city') {
      
         return feature.properties.city
            .toLowerCase()
            .indexOf(searchString) !== -1;
        }
        if (selectedFacet === 'project') {
      
         return feature.properties.project
            .toLowerCase()
            .indexOf(searchString) !== -1;
        }  
        if (selectedFacet === 'country') {
      
         return feature.properties.country
            .toLowerCase()
            .indexOf(searchString) !== -1;
        } 
        if (selectedFacet === 'region') {
      
         return feature.properties.region
            .toLowerCase()
            .indexOf(searchString) !== -1;
        } 
        if (selectedFacet === 'international partner') {
      
         return feature.properties.partnersint
            .toLowerCase()
            .indexOf(searchString) !== -1;
        } 
        
      }
      
      
      var _self = this;
      
        this.filteredMarkersLayer.eachLayer(function (layer) {
        var props = layer.feature.properties;

        var marker_icon = L.divIcon({
          className : 'marker single',
          iconSize: [],
          popupAnchor : [-6, -12],
        });
        // Set the icon.
        layer.setIcon(marker_icon);

        // Marker popup.
        var popup = _self.tooltipTemplate(props);
        layer.bindPopup(popup);
      });
      
       this.map.fitBounds(this.filteredMarkersLayer.getBounds());
    
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
      //this.markerNearbyZone = turf.buffer(geoJson, 1000, 'kilometers');

     // this.nearbyMarkersLayer = this.getNearbyMarkers(this.markerNearbyZone);

       // Add turf area to map.
      //this.nearbyMarkersZoneLayer = L.mapbox.featureLayer().setGeoJSON(this.markerNearbyZone);
      
      this.map
        //.addLayer(this.nearbyMarkersLayer)
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
        
        console.log(props);

        var marker_icon = L.divIcon({
          className : 'marker single secondary',
          iconSize: [],
          popupAnchor : [-6, -12],
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
          popupAnchor : [-6, -12],
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
          
          var city = obj.get('city');
          feature.properties.city = city;
          
          var country = obj.get('country');
          feature.properties.country = country;

          geojson.features.push(feature);

        });
        
        
        callback(null, geojson, tourItems);
        
            }
         )

      });
    }


  });
  
  

})();