/*global Grp, $*/

window.Grp = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},

  init: function() {
    'use strict';
    Grp.router = new Grp.Routers.Router();
    Backbone.history.start();
  }

};

$(document).ready(function() {
  'use strict';
  Grp.init();
});
