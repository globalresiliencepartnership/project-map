/*global GPR, Backbone*/

GPR.Routers = GPR.Routers || {};

(function () {
    'use strict';
    var init = false;

    function bootstrap() {
        init = true;
        GPR.projects = new GPR.Collections.Projects({});
        GPR.locations = new GPR.Models.Location({});
        GPR.countries = new GPR.Collections.Countries({});
        GPR.countryView = new GPR.Views.Country({collection: GPR.countries});
        GPR.locationView = new GPR.Views.Location({collection: GPR.locations});
        GPR.projectsView = new GPR.Views.Projects({collection: GPR.countries});
        var baseMap = new GPR.Models.Map({});
        GPR.mapview = new GPR.Views.Map({ model: baseMap });

        GPR.map = GPR.mapview.render();
    }

    // Global base MAP
    // var baseMap = new GPR.Models.Map({});


    GPR.Routers.App = Backbone.Router.extend({

        routes: {
            ''              : 'newload',
            'country/:name' : 'modal',
            'locations'     : 'locations',

            // '*'     : 'newload'
        },

        newload: function() {
            if (!init) bootstrap();
            GPR.locationView.load('prepare');
            GPR.countryView.loaded = true;
            if (GPR.map.getZoom() <= 5) {
                GPR.locationView.removeLayer();
                GPR.countryView.addLayer();
            }

            $('.sector-navigation a#location').removeClass('active');
            $('.sector-navigation a#country').addClass('active');

        },

        modal: function(name) {
            if (!init) bootstrap();
            this.newload();
            GPR.projectsView.load(name);
        },

        locations: function() {
            if (!init) bootstrap();
            GPR.locationView.load('render');
            GPR.countryView.loaded = false;
            GPR.locationView.addLayer();
            GPR.countryView.removeLayer();

            $('.sector-navigation a#country').removeClass('active');
            $('.sector-navigation a#location').addClass('active');


        }
    });

})();
