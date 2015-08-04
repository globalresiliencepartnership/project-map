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
		      map.scrollWheelZoom.disable(); 
		  
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

        // Clean errors.
        $('#project-submission .error').remove();

        var control = true;

        var $name = $('input[name="name"]');
        var name = $name.val();
        if (!$.trim(name)) {
          control = false;
          if ($name.siblings('.error').length === 0) {
            $name.parent().append('<small class="error">Project title is required.</small>');
          }
        }

        var $focusarea = $('select[name="focusarea"]');
        var focusarea = $focusarea.val();
        console.log(focusarea);
        if (focusarea == '--') {
          control = false;
          if ($focusarea.siblings('.error').length === 0) {
            $focusarea.parent().append('<small class="error">Focus Area is required.</small>');
          }
        }

        var $resp_email = $('input[name="resp_email"]');
        var resp_email = $resp_email.val();
        if (!$.trim(resp_email)) {
          control = false;
          if ($resp_email.siblings('.error').length === 0) {
            $resp_email.parent().append('<small class="error">Email is required.</small>');
          }
        }

        var $url = $('input[name="url"]');
        var url = $url.val();
        if (!$.trim(url)) {
          control = false;
          if ($url.siblings('.error').length === 0) {
            $url.parent().append('<small class="error">Project url is required.</small>');
          }
        }

        var $proj_description = $('textarea[name="proj_description"]');
        var proj_description = $proj_description.val();
        if (!$.trim(proj_description)) {
          control = false;
          if ($proj_description.siblings('.error').length === 0) {
            $proj_description.parent().append('<small class="error">Project description is required.</small>');
          }
        }

        var locations = [];
        var $locations = $('#project-submission .location');
        $locations.each(function() {
          var errors = [];
          var $loc = $(this);
          var lat = parseFloat($loc.find('input[name="location[lat][]"]').val());
          var lng = parseFloat($loc.find('input[name="location[long][]"]').val());

          var country = $loc.find('select[name="location[country][]"]').val();
          if (country == '--') {
            control = false;
            errors.push('Country is required');
          }

          if (isNaN(lat) || isNaN(lng)) {
            control = false;
            errors.push('Latitude or longitude is invalid');
          }

          if (!control) {
            $loc.find('.error').remove();
            $loc.append('<small class="error">' + errors.join(' / ') + '</small>');
            return;
          }

          locations.push({
            latlng: {latitude: lat, longitude: lng},
            country: country
          });
        });

        if (control) {
          var project = new Grp.Models.Project();
          project.set('project', name);
          project.set('focusarea', focusarea);
          project.set('resp_email', resp_email);
          project.set('url', url);
          project.set('description', proj_description);
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
          // Clean errors.
          $('#project-submission .error').remove();
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