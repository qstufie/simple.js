/**
 * example app
 * index page
 * static app example
 */
(function () {
  var app = SimpleApp('static_index');

  app.data = {
    hdr: {
      title: 'Welcome to Simple.JS',
      content: 'Simple Web App Engine with no external dependencies'
    },
    welcome: {
      class: 'panel panel-default',
      title: 'Cross App Interactions',
      content: 'You can use the form (which is actually a different app) below to change the text of this line.'
    },
    row: {
      element: [
        {
          title: 'Small and Nimble',
          content: 'The entire JS lib, before gzip, is 4k, you may well include it' +
          ' directly in the html to save another HTTP connection'
        },
        {
          title: 'Native yet extensible',
          content: 'There\'s absolutely no external JS lib required,' +
          ' only native JS is used in the library, this means you may use it with any library of your own choice; '
        },
        {
          title: 'Optimal Performance',
          content: 'No DOM operation is being performed in the app render, and each element is cached, ' +
          'at the same time, it allows your own app.js to be loaded via defer or async to allow for parallel load.'
        }
      ]
    }
  };

  app.template.main = {
    default: '<div class="container">{hdr} {welcome} {row}</div>'
  };

  app.template.sub = {
    hdr: {
      default: '<div class="jumbotron" {attr}><h1>{title}</h1><p>{content}</p></div>'
    },
    welcome: {
      default: '<div {attr}><div class="panel-heading"><strong>{title}</strong></div><div class="panel-body">{content}</div></div>',
      plain: '<div {attr}><h3>{title}</h3><p>{content}</p></div></div>'
    },
    row: {
      _wrapper: ['<div {attr}>', '</div>'],
      default: '<div class="col-sm-4" {attr}><h3>{title}</h3><p>{content}</p></div>'
    }
  };

  // init app (and auto render)
  app.init(document.getElementById('index'), true);

})();
