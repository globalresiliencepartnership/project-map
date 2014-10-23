/*global GPR, Backbone*/

GPR.Views = GPR.Views || {};

(function () {
    'use strict';

    GPR.Views.Projects = Backbone.View.extend({

        el: '#overlay',

        initialize: function (data) {
        },

        load: function (query) {
            this.query = query;
            if (typeof this.collection.response != 'undefined') {
                this.render()
            } else {
                var that = this;
                // this.listenToOnce(this.collection, 'loaded', this.render());
                this.collection.fetch({
                    success: function(collection, response, options) {
                        that.render();
                    }
                });
            }
        },

        render: function () {

            var country = _.find(this.collection.response.features, function(item) {
                return this.query == item.properties.country;
            }, this);

            var props = country.properties;
            var template = _.template( $("#modal").html());
            var project = _.template( $("#stats").html());



            this.$el.html( template({
                    id: 1,
                    title: props.country,
                    mainTitle: props.country,
                    stats: project({
                        projects: props.total_projects,
                        partners: props.total_partners,
                        locations: props.total_locations
                    }),
                    content: this.list(props)
                })
            );
            $('#overlay').stop().fadeIn(200);
        },

        list: function(props) {
            var template = _.template( $("#projects-list").html());
            return template({
                projects: GPR.projects.where({Country: props.country})
            });
        }
    });

})();
