/*global GPR, Backbone*/

GPR.Collections = GPR.Collections || {};

(function () {
    'use strict';

    GPR.Collections.Projects = Backbone.Collection.extend({
        // model: GPR.Models.Project,
        url: '/data/projects.json',

        initialize: function() {
            var that = this;
            this.fetch({
                success: function(response) {
                    // that.models = response;
                    that.trigger('loaded');
                }
            })
        },
    });

})();
