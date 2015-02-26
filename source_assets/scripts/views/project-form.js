/*global Grp, Backbone*/
Grp.Views = Grp.Views || {};

(function () {
'use strict';

  Grp.Views.ProjectForm = Backbone.View.extend({

    el: '#site-canvas',

    template: JST['project-form.ejs'],

    events: {
    },

    data: null,

    initialize: function() {
      this.render();
      this.addEventListeners();
    },

    render: function() {
      this.$el.html(this.template());
      return this;
    },

    addEventListeners: function() {
      var _self = this;

      // Remove project location.
      this.$el.find('#proj-locations').on('click', '.remove', function(e) {
        e.preventDefault();
        $(this).parents('.location').remove();
      });

      // Add project location.
      this.$el.find('.add').click(function(e) {
        e.preventDefault();
        var loc = _self.$el.find('.location:eq(0)').clone();

        loc.find('input').val('');
        loc.find('select').prop('selectedIndex',0);
        loc.find('.remove').addClass('revealed');

        _self.$el.find('#proj-locations').append(loc);
      });


      // Handle form submission.
      $('#project-submission input[name="project_submit"]').click(function(e) {
        e.preventDefault();

        var name = $('input[name="name"]').val();
        var type = $('select[name="type"]').val();
        var focus = $('input[name="focus"]').val();
        var innovation = $('input[name="innovation"]').val();
        var region = $('input[name="region"]').val();
        var partnersint = $('textarea[name="partnersint"]').val();
        var partnerslocal = $('textarea[name="partnerslocal"]').val();

        console.log(name, type, focus, innovation, region, partnersint, partnerslocal);

      });

      return this;
    },


  });

})();