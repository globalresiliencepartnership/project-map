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
  Parse.initialize("8zbh9doCtxZXGe9tOtdJKkhamoOTtYupuT2nk3KQ", "yYCLA97XA6xDh5FyoKo3a2Yoaf7L4y6bAWxJL5V0");

  Grp.init();
});
