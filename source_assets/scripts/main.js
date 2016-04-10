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

  L.mapbox.accessToken = 'pk.eyJ1IjoiZ2xvYmFscmVzaWxpZW5jZXBhcnRuZXJzaGlwIiwiYSI6ImNpazV5bXpkYTAwZDNpZm0yMjAxanFzem0ifQ.U2KL82hmIJNr8Sf1R2vTXw';
  Parse.initialize("8zbh9doCtxZXGe9tOtdJKkhamoOTtYupuT2nk3KQ", "yYCLA97XA6xDh5FyoKo3a2Yoaf7L4y6bAWxJL5V0");

  Grp.init();
});
