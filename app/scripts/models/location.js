/*global GPR, Backbone*/

GPR.Models = GPR.Models || {};

(function () {
    'use strict';

    GPR.Models.Location = Backbone.Model.extend({
        urlRoot: '/grp-map/data/locations.geojson',

        marker: {
            radius: 10,
            weight: 4,
            color: '#DEEBF7',
            opacity: 0.7,
            fillColor: '#ff0000',
            fillOpacity: 0.7
        },

        initialize: function() {
            // this.response = '';
        },

        query: function () {
            var that = this;
            this.fetch({
                success: function(response) {
                    that.attributes = response.attributes;
                    that.trigger('loaded');
                }
            })
        },

    });

})();
