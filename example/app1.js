/**
 * example app
 */
(function () {
  var app = SimpleApp('MyAwesomeApp');

  app.data = {
    // if type is wrapper
    bg: {
      element: [{
        label: 'color 1',
        value: 1
      }, {
        label: 'color 2',
        value: 2
      }, {
        label: 'color 3',
        value: 3
      }]
    },
    name: {
      placeholder: 'update welcome'
    },
    submit: {
      type: 'button',
      caption: 'update'
    }
  };

  // main template: the variables should be the sub elements only, main template does not carry data
  app.template.main = {
    default: '<div class="container"><form>' +
    '{bg} {name} {submit}' +
    '</form></div><div class="clearfix"></div>'
  };

// sub template - note the 2 different types
  app.template.sub = {
    bg: {
      _type: 'select',
      // special input such as SELECT can have a wrapper, or think <tr></tr>, etc.
      _wrapper: ['background: <select {attr}><option>-pick color-</option>', '</select>'],
      default: '<option {attr}>{label}</option>'
    },
    name: {
      // all text input are type: input
      _type: 'input',
      default: '<input type="text" {attr} />'
    },
    submit: {
      _type: 'button',
      default: '<button {attr}>{caption}</button>'
    }
  };

  // capture sumbit in state update
  app.on(SimpleAppStateIsUpdated, 'submit', function () {
    alert('current state: ' + app.toQuerystring());
  });
  // update bg color with gender for fun
  app.on(SimpleAppStateIsUpdated, 'bg', function (data) {
    setColor(data.value);
  });
  app.on(SimpleAppDidRender, 'defaultBG', function (data) {
    console.log('>> call: should set color: ' + app.state.bg);
    setColor(app.state.bg);
  });

  function setColor(value) {
    switch (value) {
      case '1':
        color = '	#81c1e7';
        break;
      case '2':
        color = '#c4dfe1';
        break;
      default:
        color = '	#85a291';
        break;
    }
    document.body.style.backgroundColor = color;
  }

  // init app (and auto render)
  app.init(document.getElementById('app1'), true);

})();