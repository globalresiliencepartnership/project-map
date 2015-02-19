/*global Grp, Backbone*/
Grp.Routers = Grp.Routers || {};

(function () {
'use strict';

  Grp.Routers.Router = Backbone.Router.extend({
    routes: {
      '*default': 'start',
    },

    start : function() {
      console.log('Hello');
    }

  });

})();