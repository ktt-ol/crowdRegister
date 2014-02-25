module.exports = function (app, config) {

  app.namespace('/api', function () {
    require('./user.js')(app, config);
  });
};