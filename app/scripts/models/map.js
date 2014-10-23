/*global GPR, Backbone*/

GPR.Models = GPR.Models || {};

(function () {
    'use strict';

    GPR.Models.Map = Backbone.Model.extend({
        defaults: {
            token: 'pk.eyJ1Ijoic2Npc2NvIiwiYSI6InVEREpQdjQifQ.jsWwLl3hdVM1n0DtcLY54w',
            base: 'wbiknowledge.world-bank-border',
            view: [15, 20],
            zoom: 3
        }
    });

})();
