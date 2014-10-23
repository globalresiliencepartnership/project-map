/*global GPR, $*/


window.GPR = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: function () {
        'use strict';
        GPR.router = new GPR.Routers.App();
        Backbone.history.start();
        $('#overlay').stop().fadeOut(100)
    }
};

$(document).ready(function () {
    'use strict';
    GPR.init();
});
