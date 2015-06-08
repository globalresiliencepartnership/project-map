/*global Grp, Backbone*/
Grp.Routers = Grp.Routers || {};

(function () {
'use strict';

  Grp.Routers.Router = Backbone.Router.extend({
    routes: {
      'add-project': 'addProject',
      '*default': 'start',
    },

    start : function() {
      $("#site-canvas").unbind();
      Grp.View = new Grp.Views.Map();
      
    },

    addProject : function() {
    
      $("#site-canvas").unbind();
      console.log('dhb');
      Grp.View = new Grp.Views.ProjectForm();
    }

  });

})();