this["JST"] = this["JST"] || {};

this["JST"]["map-tooltip.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<article>\n  <header>\n    <h2>' +
__e( project ) +
'</h2>\n    <b>';
 if (city) { ;
__p +=
__e( city ) +
', ';
 } ;
__p +=
__e( country ) +
'</b>\n  </header>\n   <p>' +
__e( description ) +
'</p>\n   <a target="blanc" href="' +
__e( url ) +
'">More info &raquo;</a>\n  <div class="content">\n    <!-- <a href="#" class="view-more" data-pid="' +
__e( pid ) +
'">View project</a> -->\n  </div>\n</article>';

}
return __p
};

this["JST"]["map.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<a id="logo" href="http://www.globalresiliencepartnership.org">Global Resilience Partnership</a>\n<div id="map"><!-- Map here --></div>\n<div id="grad"></div>\n<div id="sidebar">\n  <nav>\n    <ul>\n      <li><a href="#" id="tour-prev" title="Previous" class="tour-cntrl"><</a></li>\n\t  <li><a href="#" id="tour-next" title="Next" class="tour-cntrl">></a><li>\n      <li><a href="#" title="Previous project" class="project-cntrl" id="nav-prev"><</a></li>\n      <li><a href="#" title="Zoom out" class="project-cntrl" id="nav-up">^</a></li>\n      <li><a href="#" title="Next project" class="project-cntrl" id="nav-next">></a></li>\n      <li><a href="#" title="About" id="nav-about">?</a></li>\n      <li><a href="#" title="Search" id="nav-search">s</a></li>\n      <li><a href="#/add-project" title="Submit project" id="nav-submit">+</a></li>\n    </ul>\n  </nav>\n  <div class="project"><!-- sidebar.ejs --></div>\n  <div class="tour"><!-- tour.ejs --></div>\n  \n  <div id="search">\n   <h2 id="reset">Where is resilience happening?</h2>\n  \n\n  <select id="select-facet-filter">\n    <option val="country">Country</option>\n    <option val="city">City</option>\n    <option val="project">Project</option>\n  </select>\n  \n  <select id="select-city-filter">\n     <option>Select</option>\n  </select>\n  <select id="select-country-filter">\n    <option>Select</option>\n  </select>\n  <select id="select-project-filter">\n    <option>Select</option>\n  </select>\n  \n  <input id="search-box" class=\'search-ui\' placeholder=\'Enter a search term\' />\n\n<!--\n<div class="dropdown">\n  <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenuCities" data-toggle="dropdown" aria-expanded="true">\n    Dropdown\n    <span class="caret"></span>\n  </button>\n  <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenuCities">\n  </ul>\n</div>\n-->\n\n<a id="more-info" href="#" data-container="body" data-toggle="popover" data-placement="top" data-content="Resilience is the capacity of communities to survive and grow no matter what kinds of chronic stresses and acute shocks they experience.">?</a>\n<a id="add-project" href="#add-project">Submit a project &raquo;</a>\n  \n</div>\n\n  \n</div>\n\n\n\n';

}
return __p
};

this["JST"]["project-form-location.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<fieldset class="location">\n  <a href="#" class="remove revealed" title="Remove this project location">Remove location [x]</a>\n  <fieldset>\n    <label for="location[country][]">Country</label>\n    <select class="form-control" name="location[country][]" id="location[country][]">\n    <option value="--">Select country</option>\n      ';
 _.each(countries, function(v, k) { ;
__p += '\n        <option value="' +
__e( k ) +
'">' +
__e( v.name ) +
'</option>\n      ';
 }); ;
__p += '\n    </select>\n  </fieldset>\n\n  <fieldset>\n    <div class="map"><!-- Map here --></div>\n  </fieldset>\n\n  <div class="geolocation">\n    <fieldset>\n      <label for="location[long][]">Longitude</label>\n      <input type="text" class="form-control" name="location[long][]" id="location[long][]">\n    </fieldset>\n\n    <fieldset>\n      <label for="location[lat][]">Latitude</label>\n      <input type="text" class="form-control" name="location[lat][]" id="location[lat][]">\n    </fieldset>\n  </div>\n</fieldset>\n';

}
return __p
};

this["JST"]["project-form.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="project-submission">\n\n  <a href="#">&laquo; Back to map</a>\n  <h1>Submit new project</h1>\n  <form action="#">\n\n    <fieldset>\n      <label for="name">Project title</label>\n      <input type="text" class="form-control" name="name" id="name">\n    </fieldset>\n\n    <fieldset>\n      <label for="proj_description">Short project description</label>\n      <textarea name="proj_description" class="form-control" id="proj_description"></textarea>\n      <p class="help-text">Provide a short description of the project.</p>\n    </fieldset>\n\n    <fieldset>\n      <label for="resp_email">Contact Email</label>\n      <input type="text" class="form-control" name="resp_email" id="resp_email">\n      <p class="help-text">Email will only be used for contact about the project.</p>\n    </fieldset>\n\n    <fieldset>\n      <label for="url">Link to Project</label>\n      <input type="text" class="form-control" name="url" id="url">\n      <p class="help-text">Provide a link to the project or organization website.</p>\n    </fieldset>\n\n    <fieldset>\n      <label for="focusarea">Focus Area</label>\n      <select multiple name="focusarea" class="form-control" id="focusarea">\n        <option value="--">Select a focus area</option>\n        <option value="Health">Health</option>\n        <option value="Food_Agriculture">Food & Agriculture</option>\n        <option value="Water">Water</option>\n        <option value="Energy">Energy</option>\n        <option value="Ecology_Environment">Ecology & Environment</option>\n        <option value="Finance_Innovation">Finance & Innovation</option>\n        <option value="Oceans_Fisheries">Oceans & Fisheries</option>\n        <option value="Urban_Resilience">Urban Resilience</option>\n        <option value="Gender_Equity">Gender Equity</option>\n        <option value="Economic_Inclusion">Economic Inclusion</option>\n        <option value="Climate_Change">Climate Change</option>\n        <option value="DRR">Disaster Reduction & Recovery</option>\n        <option value="Research_Policy">Research & Policy</option>\n        <option value="Technology">Technology</option>\n        <option value="Other">Other</option>\n      </select>\n      <p class="help-text">The thematic focus of the project, e.g."Food & Agriculture". Select all that apply.</p>\n    </fieldset>\n\n    <fieldset id="proj-locations">\n      <h2>Project locations</h2>\n    </fieldset>\n    \n      <a href="#" class="add" title="Add new project location">Add another location [+]</a>\n\n    <fieldset>\n      <input type="submit" class="btn" name="project_submit" value="Submit project">\n    </fieldset>\n\n    <p class="help-text add"><a href="mailto:gjacobs@rockfound.org">Contact us</a> with questions or feedback on projects.</p>\n\n  </form>\n</div>';

}
return __p
};

this["JST"]["sidebar.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<small class="subtitle">Project</small>\n<h1 class="title">' +
__e( project ) +
'</h1>\n\n<dl class="metadata">\n\n  <dt>Focus</dt>\n  <dd>' +
__e( focus ) +
'</dd>\n\n<!--\n  <dt>Partners</dt>\n  <dd>\n    <ul>\n    ';
 _.each(partners, function(part) { ;
__p += '\n      <li>' +
__e( part ) +
'</li>\n    ';
 }); ;
__p += '\n    </ul>\n  </dd>\n-->';

}
return __p
};

this["JST"]["tour.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h2>' +
__e( title ) +
'</h2>\n<p>' +
__e( text ) +
'</p>';

}
return __p
};