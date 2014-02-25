'use strict';

/**
 * Application routes
 */
module.exports = function(app, config) {

  var api = require('./controllers/api/'),
    index = require('./controllers');

  // Server API Routes
  api(app, config);
  

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};