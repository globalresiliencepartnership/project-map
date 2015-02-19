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

  L.mapbox.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q';

  Grp.init();
});
