/*global Grp, Backbone*/
Grp.Views = Grp.Views || {};

(function () {
'use strict';

  Grp.Views.Tour = Backbone.View.extend({

    el: '#sidebar',

    template: JST['tour.ejs'],

    events: {
      'click #tour-prev' : 'tourPrevBtnClick',
      'click #tour-next' : 'tourNextBtnClick'
    },

    data: null,

    initialize: function() {
    },

    setData: function(data) {
     
     this.data = data;
     console.log(data);
    
      return this;
    },

    render: function() {
      console.log('tour data', this.data);
      this.$el.find('.tour').html(this.template(this.data));
      this.$el.addClass('revealed');
      return this;
    },

    ///////////////////////////////////
    /// Event listeners
    

    tourPrevBtnClick: function(e) {
      e.preventDefault();
     this.trigger('tour:prev');
      // console.log('tour prev');
     
    },

    tourNextBtnClick: function(e) {
      e.preventDefault();
      this.trigger('tour:next');
       //console.log('tour next');
    },

  });

})();