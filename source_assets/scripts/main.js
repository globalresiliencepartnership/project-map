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
  Parse.initialize("VHXflTAD6nz8NAMNLX7NjSfbiSXH0El18vz4pqrN", "vCizo6jB9bkogr4rKRAupHEfNebEls1IbEWHBeJ3");

  Grp.init();
});
