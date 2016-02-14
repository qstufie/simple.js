/**
 * simple app
 * App base
 */
(function (w) {
  'use strict';
  // lib
  String.prototype.hashCode = function () {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
      chr = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  };
  /**
   * string converter
   * @param obj
   * @private
   */
  var _s = function (obj) {
    return JSON.stringify(obj);
  };
  /**
   * obj copier
   * @param obj
   * @private
   */
  var _c = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
  /**
   * app base class
   * @param name
   * @param cnf
   */
  var app = function (name, cnf) {
    // defaults
    name = _s(name).hashCode();
    var prefix = '__ss_app_' + name;
    this.name = name;
    // register app
    w[prefix] = this;
    // local storage key
    this.localStorageKey = prefix + '_data';
    this.container = null;
    // state of the app
    this.state = {};
    this.pState = {};
    // cnf default
    this.cnf = {
      localStorageWrite: true,
      localStorageRead: true,
      partialRender: true
    };

    /**
     * callback registry
     * @type {{getElementStyle: {}}}
     */
    this.callback = {
      getElementStyle: {},
      renderElement: {},
      parseElementData: {},
      stateIsUpdated: {}
    };

    // override with external cnf
    if (typeof cnf == 'object') {
      for (var k in cnf) {
        this.cnf[k] = cnf[k];
      }
    }
    /**
     * update state of an element
     * @param elementOrName, if value presents and this param is string, this will be a direct update
     * @param valueOrNull optional, if the first param is element with value, it will use that
     */
    this.updateState = function (elementOrName, valueOrNull) {
      var name, value, element;
      if (typeof elementOrName == 'string') {
        console.log('=> update state by name/value', elementOrName, valueOrNull);
        name = elementOrName;
        value = valueOrNull;
        this.state[elementOrName] = valueOrNull;
      } else if (typeof elementOrName == 'object' && typeof elementOrName.nodeName == 'string') {
        console.log('=> update state by element', elementOrName);
        // must be object
        var el = elementOrName;
        var nodeName = el.nodeName;
        var type = el.type;
        if (nodeName == 'SELECT') {
          type = 'select';
        }
        name = el.name;
        value = el.value;
        switch (type) {
          case 'select':
          case 'text':
          case 'radio':
            this.state[name] = value;
            break;
          case 'checkbox':
            if (!this.state[name]) {
              this.state[name] = [];
            }
            if (el.checked && value.length > 0) {
              if (this.state[name].indexOf(value) < 0) {
                this.state[name].push(value);
              }
            } else {
              var pos = this.state[name].indexOf(value);
              if (pos >= 0) {
                this.state[name].splice(pos, 1);
              }
            }
            break;
          default:
            this.state[name] = value;
            break;
        }
      }
      // save local if necessary
      this.store();
      // callback
      this.stateIsUpdated({
        name: name,
        value: value,
        element: element,
        state: this.state
      });
    };
    /**
     * add callbacks to fire this for your own elements
     * or even directly over-write this function
     * @param data
     */
    this.stateIsUpdated = function (data) {
      // callback by name
      console.log('state updated: ', data);
      if (typeof this.callback.stateIsUpdated[data.name] == 'function') {
        var c = this.callback.stateIsUpdated[data.name];
        return c(data);
      }
      return data;
    };
    /**
     * template engine
     * @param template
     * @param data
     * @returns {*}
     */
    this.htmlTemplate = function (template, data) {
      try {
        var output = template;
        for (var n in data) {
          var search = new RegExp('{' + n + '}', 'g'), rep = data[n];
          output = output.replace(search, rep);
        }
        return output;
      } catch (e) {
        console.log('[Error] html template failure', e);
        return '';
      }
    };
    /**
     * store state in local storage
     */
    this.store = function () {
      if (this.cnf.localStorageWrite && typeof window.localStorage == 'object') {
        window.localStorage.setItem(this.localStorageKey, _s(this.state));
      }
    };
    /**
     * retrieve state from local storage
     */
    this.load = function () {
      if (this.cnf.localStorageRead && typeof window.localStorage == 'object') {
        var d = window.localStorage.getItem(this.localStorageKey);
        if (!d) return;
        try {
          this.state = JSON.parse(d);
        } catch (e) {
          console.log('Unable to parse state ' + d, e);
        }
      }
    };
    /*------ elements cnf ------*/
    /**
     * elements cnf
     * template: must have default template, or render will return empty string
     * if 'selected' template is available, when data fits in the current state, it will use selected state
     * within template, use
     * :__ss for save state calls, e.g. :__ss('foo', 'bar') or :__ss(this) for elements
     * @type {{data: {main: {}, sub: {}}, template: {main: {default: string}, sub: {}}}}
     */
    this.elements = {
      data: {
        main: {},
        sub: {}
      },
      template: {
        main: {
          'default': ''
        },
        sub: {}
      }
    };
    /**
     * callback: get element style
     * @param elName
     * @param state
     * @param data
     */
    this.getElementStyle = function (elName, state, data) {
      // check if callback is registered
      if (typeof this.callback.getElementStyle[elName] == 'function') {
        var c = this.callback.getElementStyle[elName];
        return c(state, data);
      }
      if (state) {
        var s = _s(state);
        var v = _s(data['value']);
        return (s.indexOf(v) >= 0) ? 'selected' : 'default';
      }
      return 'default';
    };
    /**
     * callback: custom data parser
     * @param elName
     * @param state
     * @param data
     * @returns {*}
     */
    this.parseElementData = function (elName, state, data) {
      // check if callback is registered
      if (typeof this.callback.parseElementData[elName] == 'function') {
        var c = this.callback.parseElementData[elName];
        return c(state, data);
      }
      // default
      return data;
    };
    /*------ render ------*/
    // main template style
    this.style = 'default';
    /**
     * render entire app
     */
    this.render = function () {
      this.willRender();
      console.log('=> Rendering Main Template');
      if (!this.container) throw new Error('Invalid container specified');
      var s = this.style;
      var t = this.elements.template.main[s];
      var d = this.elements.data.main;
      if (!t) throw new Error('Invalid master template for style: ' + s);
      for (var n in this.elements.template.sub) {
        // partial if enabled
        if (this.cnf.partialRender && _s(this.state[n]) == _s(this.pState[n]) && typeof d[n] == 'string') {
          console.log('Partial rendering - render from cache for ' + n);
        } else {
          d[n] = this.renderElement(n);
        }
      }
      d['__s'] = prefix + '.updateState';
      this.container.innerHTML = this.htmlTemplate(t, d);
      // make previous state the same as current now
      this.pState = _c(this.state);
      // finally, run did render
      this.didRender();
    };
    /**
     * render single element
     * @param elName
     * @returns {*}
     */
    this.renderElement = function (elName) {
      if (typeof this.elements.template.sub[elName] != 'object') {
        console.log('[Warning] No element template found - return empty string');
        return '';
      }
      // now, find the 4 things: template, data, state, and style
      var data = this.elements.data.sub[elName] || {};
      var state = this.state[elName] || '';
      console.log('=> Rendering ' + elName + ' with state: ', _s(state));
      // if custom render function exists, use it.
      if (typeof this.callback.renderElement[elName] == 'function') {
        var c = this.callback.renderElement[elName];
        return c(state, data);
      }
      // otherwise, default
      var output = '';
      // render as list, even when there's only 1 item (then just render 1)
      // each item will have different styles by callback: this.getElementStyle(element, state, data);
      var self = this;
      data.map(function (item) {
        // do not mute data item piece, so we do a safe copy
        var d = _c(item);
        var s = self.getElementStyle(elName, state, d);
        var t = self.elements.template.sub[elName][s];
        var data = self.parseElementData(elName, state, d);
        // update state interaction
        data['__s'] = prefix + '.updateState';
        data['name'] = elName;
        // get value from state if not present
        if (!data['value']) {
          data['value'] = state ? state : '';
        }
        if (!t) t = self.elements.template.sub[elName]['default'];
        output += self.htmlTemplate(t, data);
      });
      return output;
    };
    /*------ init ------*/
    /**
     * init app
     * @param container
     * @param autoRender
     */
    this.init = function (container, autoRender) {
      if (container) this.container = container;
      // load state from local storage if applicable
      this.load();
      if (autoRender === false) return;
      // next, render
      this.appStart();
      this.render();
      this.appFinish();
    };
    /*------ app callbacks (to be implemented) ------*/
    /**
     * app start, only run once
     */
    this.appStart = function () {
    };
    /**
     * app finish, only run once
     */
    this.appFinish = function () {
    };
    /**
     * app will render, run each time before rendering
     */
    this.willRender = function () {
    };
    /**
     * app finished rendering, run each time before rendering
     */
    this.didRender = function () {
    };
    /**
     * export as querystring
     */
    this.toQuerystring = function () {
      var qs = [];
      for (var n in this.state) {
        var v = this.state[n];
        if (v) {
          qs.push(n + '=' + v);
        }
      }
      return qs.join('&');
    }
  };
  /*------ export ------*/
  w.SimpleApp = app;
  // nodejs compatible
  if (typeof exports != 'undefined') exports.SimpleApp = app;
})(this);
