/*global Grp, Backbone*/
Grp.Views = Grp.Views || {};

(function () {
'use strict';

  Grp.Views.ProjectForm = Backbone.View.extend({

    el: '#site-canvas',

    template: JST['project-form.ejs'],
    templateLocation: JST['project-form-location.ejs'],

    events: {
    },

    data: null,

    initialize: function() {
      var _self = this;
      $.get('country_centroids.json')
        .success(function(data) {
          _self.centroids = data;
          _self.render();
          _self.addEventListeners();
        });
    },

    render: function() {
      this.$el.html(this.template());

      var $loc = this.addLocationSelection();
      $loc.find('.remove').removeClass('revealed');

      return this;
    },

    /**
     * Adds a new location selection.
     */
    addLocationSelection: function() {
      var $loc = $(this.templateLocation({countries: this.centroids}))

      this.$el.find('#proj-locations').append($loc);
      return $loc;
    },

    /**
     * Add event listeners for form elements.
     */
    addEventListeners: function() {
      var _self = this;
      var $projLocations = this.$el.find('#proj-locations');

      // Remove project location.
      $projLocations.on('click', '.remove', function(e) {
        e.preventDefault();
        $(this).parents('.location').remove();
      });

      // Add project location.
      this.$el.find('.add').click(function(e) {
        e.preventDefault();
        _self.addLocationSelection();
      });

      // Change event for country selection dropdown.
      $projLocations.on('change', 'select[name="location[country][]"]', function(e) {
        var country = $(this).val();
        var $loc = $(this).parents('.location');

        var map = $loc.data('map');
        if (!map) {
          var $mapContainer = $loc.find('.map');
          $mapContainer.addClass('revealed');
          map = L.mapbox.map($mapContainer[0], 'examples.map-i86nkdio');

          var marker = null
          // Map click event to get the coordinates.
          map.on('click', function(e) {
            $loc.find('input[name="location[long][]"]').val(e.latlng.lng);
            $loc.find('input[name="location[lat][]"]').val(e.latlng.lat);

            // Reposition marker.
            if (!marker) {
              marker = L.marker(e.latlng).addTo(map);
            }
            else {
              marker.setLatLng(e.latlng);
            }
          });

          $loc.data('map', map);
        }
        
        map.setView([_self.centroids[country].coordinates[1], _self.centroids[country].coordinates[0]], 9);
      });

      // Handle form submission.
      $('#project-submission input[name="project_submit"]').click(function(e) {
        e.preventDefault();
        var control = true;

        var name = $('input[name="name"]').val();
        if (!$.trim(name)) {
          control = false;
          console.log('Name is required.');
        }

        var type = $('select[name="type"]').val();
        if (type == '--') {
          control = false;
          console.log('type is required.');
        }

        var focus = $('input[name="focus"]').val();
        if (!$.trim(focus)) {
          control = false;
          console.log('focus is required.');
        }

        var innovation = $('input[name="innovation"]').val();
        if (!$.trim(innovation)) {
          control = false;
          console.log('innovation is required.');
        }

        var partnersint = $('textarea[name="partnersint"]').val();
        if (!$.trim(partnersint)) {
          control = false;
          console.log('partnersint is required.');
        }

        var partnerslocal = $('textarea[name="partnerslocal"]').val();
        if (!$.trim(partnerslocal)) {
          control = false;
          console.log('partnerslocal is required.');
        }

        var locations = [];
        $('#project-submission .location').each(function() {
          var $loc = $(this);
          var lat = parseFloat($loc.find('input[name="location[lat][]"]').val());
          var lng = parseFloat($loc.find('input[name="location[long][]"]').val());

          if (isNaN(lat) || isNaN(lng)) {
            control = false;
            console.log('lat/log invalid.');
          }

          var country = $loc.find('select[name="location[country][]"]').val();
          if (country == '--') {
            control = false;
            console.log('country is required.');
          }

          locations.push({
            latlng: {latitude: lat, longitude: lng},
            country: country
          });
        });

        if (control) {
          var project = new Grp.Models.Project();
          project.set('project', name);
          project.set('type', type);
          project.set('focus', focus);
          project.set('innovation', innovation);
          project.set('partnersint', partnersint.replace(/\n/g, '; '));
          project.set('partnerslocal', partnerslocal.replace(/\n/g, '; '));
          project.set('published', 0);

          locations.forEach(function(location) {
            var point = new Parse.GeoPoint(location.latlng);

            var l = new Grp.Models.Location();
            l.set('location', point);
            l.set('project', project);
            l.set('country', _self.centroids[location.country].name);
            l.set('countryCode', location.country);
            l.save();
          });

          _self.resetForm();
        }

      });

      return this;
    },

    /**
     * Resets the project locations and the form.
     * @return this
     */
    resetForm: function() {
      var $loc = this.addLocationSelection();
      $loc.find('.remove').removeClass('revealed');

      this.$el.find('#project-submission form')[0].reset();
      this.$el.find('#proj-locations').html('').append($loc);

      return this;
    },


  });

})();