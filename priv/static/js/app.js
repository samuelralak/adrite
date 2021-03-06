(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
(function() {
    var global = window;
    var __shims = {assert: ({}),buffer: ({}),child_process: ({}),cluster: ({}),crypto: ({}),dgram: ({}),dns: ({}),events: ({}),fs: ({}),http: ({}),https: ({}),net: ({}),os: ({}),path: ({}),punycode: ({}),querystring: ({}),readline: ({}),repl: ({}),string_decoder: ({}),tls: ({}),tty: ({}),url: ({}),util: ({}),vm: ({}),zlib: ({}),process: ({"env":{}})};
    var process = __shims.process;

    var __makeRequire = function(r, __brmap) {
      return function(name) {
        if (__brmap[name] !== undefined) name = __brmap[name];
        name = name.replace(".js", "");
        return ["assert","buffer","child_process","cluster","crypto","dgram","dns","events","fs","http","https","net","os","path","punycode","querystring","readline","repl","string_decoder","tls","tty","url","util","vm","zlib","process"].indexOf(name) === -1 ? r(name) : __shims[name];
      }
    };
  require.register('phoenix', function(exports,req,module){
    var require = __makeRequire((function(n) { return req(n.replace('./', 'phoenix/')); }), {});
    (function(exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Phoenix Channels JavaScript client
//
// ## Socket Connection
//
// A single connection is established to the server and
// channels are mulitplexed over the connection.
// Connect to the server using the `Socket` class:
//
//     let socket = new Socket("/ws", {params: {userToken: "123"}})
//     socket.connect()
//
// The `Socket` constructor takes the mount point of the socket,
// the authentication params, as well as options that can be found in
// the Socket docs, such as configuring the `LongPoll` transport, and
// heartbeat.
//
// ## Channels
//
// Channels are isolated, concurrent processes on the server that
// subscribe to topics and broker events between the client and server.
// To join a channel, you must provide the topic, and channel params for
// authorization. Here's an example chat room example where `"new_msg"`
// events are listened for, messages are pushed to the server, and
// the channel is joined with ok/error/timeout matches:
//
//     let channel = socket.channel("rooms:123", {token: roomToken})
//     channel.on("new_msg", msg => console.log("Got message", msg) )
//     $input.onEnter( e => {
//       channel.push("new_msg", {body: e.target.val}, 10000)
//        .receive("ok", (msg) => console.log("created message", msg) )
//        .receive("error", (reasons) => console.log("create failed", reasons) )
//        .receive("timeout", () => console.log("Networking issue...") )
//     })
//     channel.join()
//       .receive("ok", ({messages}) => console.log("catching up", messages) )
//       .receive("error", ({reason}) => console.log("failed join", reason) )
//       .receive("timeout", () => console.log("Networking issue. Still waiting...") )
//
//
// ## Joining
//
// Creating a channel with `socket.channel(topic, params)`, binds the params to
// `channel.params`, which are sent up on `channel.join()`.
// Subsequent rejoins will send up the modified params for
// updating authorization params, or passing up last_message_id information.
// Successful joins receive an "ok" status, while unsuccessful joins
// receive "error".
//
//
// ## Pushing Messages
//
// From the previous example, we can see that pushing messages to the server
// can be done with `channel.push(eventName, payload)` and we can optionally
// receive responses from the push. Additionally, we can use
// `receive("timeout", callback)` to abort waiting for our other `receive` hooks
//  and take action after some period of waiting. The default timeout is 5000ms.
//
//
// ## Socket Hooks
//
// Lifecycle events of the multiplexed connection can be hooked into via
// `socket.onError()` and `socket.onClose()` events, ie:
//
//     socket.onError( () => console.log("there was an error with the connection!") )
//     socket.onClose( () => console.log("the connection dropped") )
//
//
// ## Channel Hooks
//
// For each joined channel, you can bind to `onError` and `onClose` events
// to monitor the channel lifecycle, ie:
//
//     channel.onError( () => console.log("there was an error!") )
//     channel.onClose( () => console.log("the channel has gone away gracefully") )
//
// ### onError hooks
//
// `onError` hooks are invoked if the socket connection drops, or the channel
// crashes on the server. In either case, a channel rejoin is attemtped
// automatically in an exponential backoff manner.
//
// ### onClose hooks
//
// `onClose` hooks are invoked only in two cases. 1) the channel explicitly
// closed on the server, or 2). The client explicitly closed, by calling
// `channel.leave()`
//

var VSN = "1.0.0";
var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var DEFAULT_TIMEOUT = 10000;
var CHANNEL_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining"
};
var CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};
var TRANSPORTS = {
  longpoll: "longpoll",
  websocket: "websocket"
};

var Push = function () {

  // Initializes the Push
  //
  // channel - The Channel
  // event - The event, for example `"phx_join"`
  // payload - The payload, for example `{user_id: 123}`
  // timeout - The push timeout in milliseconds
  //

  function Push(channel, event, payload, timeout) {
    _classCallCheck(this, Push);

    this.channel = channel;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.timeout = timeout;
    this.timeoutTimer = null;
    this.recHooks = [];
    this.sent = false;
  }

  _createClass(Push, [{
    key: "resend",
    value: function resend(timeout) {
      this.timeout = timeout;
      this.cancelRefEvent();
      this.ref = null;
      this.refEvent = null;
      this.receivedResp = null;
      this.sent = false;
      this.send();
    }
  }, {
    key: "send",
    value: function send() {
      if (this.hasReceived("timeout")) {
        return;
      }
      this.startTimeout();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: this.ref
      });
    }
  }, {
    key: "receive",
    value: function receive(status, callback) {
      if (this.hasReceived(status)) {
        callback(this.receivedResp.response);
      }

      this.recHooks.push({ status: status, callback: callback });
      return this;
    }

    // private

  }, {
    key: "matchReceive",
    value: function matchReceive(_ref) {
      var status = _ref.status;
      var response = _ref.response;
      var ref = _ref.ref;

      this.recHooks.filter(function (h) {
        return h.status === status;
      }).forEach(function (h) {
        return h.callback(response);
      });
    }
  }, {
    key: "cancelRefEvent",
    value: function cancelRefEvent() {
      if (!this.refEvent) {
        return;
      }
      this.channel.off(this.refEvent);
    }
  }, {
    key: "cancelTimeout",
    value: function cancelTimeout() {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }, {
    key: "startTimeout",
    value: function startTimeout() {
      var _this = this;

      if (this.timeoutTimer) {
        return;
      }
      this.ref = this.channel.socket.makeRef();
      this.refEvent = this.channel.replyEventName(this.ref);

      this.channel.on(this.refEvent, function (payload) {
        _this.cancelRefEvent();
        _this.cancelTimeout();
        _this.receivedResp = payload;
        _this.matchReceive(payload);
      });

      this.timeoutTimer = setTimeout(function () {
        _this.trigger("timeout", {});
      }, this.timeout);
    }
  }, {
    key: "hasReceived",
    value: function hasReceived(status) {
      return this.receivedResp && this.receivedResp.status === status;
    }
  }, {
    key: "trigger",
    value: function trigger(status, response) {
      this.channel.trigger(this.refEvent, { status: status, response: response });
    }
  }]);

  return Push;
}();

var Channel = exports.Channel = function () {
  function Channel(topic, params, socket) {
    var _this2 = this;

    _classCallCheck(this, Channel);

    this.state = CHANNEL_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.timeout = this.socket.timeout;
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this2.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this2.state = CHANNEL_STATES.joined;
      _this2.rejoinTimer.reset();
      _this2.pushBuffer.forEach(function (pushEvent) {
        return pushEvent.send();
      });
      _this2.pushBuffer = [];
    });
    this.onClose(function () {
      _this2.socket.log("channel", "close " + _this2.topic);
      _this2.state = CHANNEL_STATES.closed;
      _this2.socket.remove(_this2);
    });
    this.onError(function (reason) {
      _this2.socket.log("channel", "error " + _this2.topic, reason);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("timeout", function () {
      if (_this2.state !== CHANNEL_STATES.joining) {
        return;
      }

      _this2.socket.log("channel", "timeout " + _this2.topic, _this2.joinPush.timeout);
      _this2.state = CHANNEL_STATES.errored;
      _this2.rejoinTimer.scheduleTimeout();
    });
    this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
      _this2.trigger(_this2.replyEventName(ref), payload);
    });
  }

  _createClass(Channel, [{
    key: "rejoinUntilConnected",
    value: function rejoinUntilConnected() {
      this.rejoinTimer.scheduleTimeout();
      if (this.socket.isConnected()) {
        this.rejoin();
      }
    }
  }, {
    key: "join",
    value: function join() {
      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

      if (this.joinedOnce) {
        throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
      } else {
        this.joinedOnce = true;
      }
      this.rejoin(timeout);
      return this.joinPush;
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.on(CHANNEL_EVENTS.close, callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.on(CHANNEL_EVENTS.error, function (reason) {
        return callback(reason);
      });
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      this.bindings.push({ event: event, callback: callback });
    }
  }, {
    key: "off",
    value: function off(event) {
      this.bindings = this.bindings.filter(function (bind) {
        return bind.event !== event;
      });
    }
  }, {
    key: "canPush",
    value: function canPush() {
      return this.socket.isConnected() && this.state === CHANNEL_STATES.joined;
    }
  }, {
    key: "push",
    value: function push(event, payload) {
      var timeout = arguments.length <= 2 || arguments[2] === undefined ? this.timeout : arguments[2];

      if (!this.joinedOnce) {
        throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
      }
      var pushEvent = new Push(this, event, payload, timeout);
      if (this.canPush()) {
        pushEvent.send();
      } else {
        pushEvent.startTimeout();
        this.pushBuffer.push(pushEvent);
      }

      return pushEvent;
    }

    // Leaves the channel
    //
    // Unsubscribes from server events, and
    // instructs channel to terminate on server
    //
    // Triggers onClose() hooks
    //
    // To receive leave acknowledgements, use the a `receive`
    // hook to bind to the server ack, ie:
    //
    //     channel.leave().receive("ok", () => alert("left!") )
    //

  }, {
    key: "leave",
    value: function leave() {
      var _this3 = this;

      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];

      var onClose = function onClose() {
        _this3.socket.log("channel", "leave " + _this3.topic);
        _this3.trigger(CHANNEL_EVENTS.close, "leave");
      };
      var leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
      leavePush.receive("ok", function () {
        return onClose();
      }).receive("timeout", function () {
        return onClose();
      });
      leavePush.send();
      if (!this.canPush()) {
        leavePush.trigger("ok", {});
      }

      return leavePush;
    }

    // Overridable message hook
    //
    // Receives all events for specialized message handling

  }, {
    key: "onMessage",
    value: function onMessage(event, payload, ref) {}

    // private

  }, {
    key: "isMember",
    value: function isMember(topic) {
      return this.topic === topic;
    }
  }, {
    key: "sendJoin",
    value: function sendJoin(timeout) {
      this.state = CHANNEL_STATES.joining;
      this.joinPush.resend(timeout);
    }
  }, {
    key: "rejoin",
    value: function rejoin() {
      var timeout = arguments.length <= 0 || arguments[0] === undefined ? this.timeout : arguments[0];
      this.sendJoin(timeout);
    }
  }, {
    key: "trigger",
    value: function trigger(triggerEvent, payload, ref) {
      this.onMessage(triggerEvent, payload, ref);
      this.bindings.filter(function (bind) {
        return bind.event === triggerEvent;
      }).map(function (bind) {
        return bind.callback(payload, ref);
      });
    }
  }, {
    key: "replyEventName",
    value: function replyEventName(ref) {
      return "chan_reply_" + ref;
    }
  }]);

  return Channel;
}();

var Socket = exports.Socket = function () {

  // Initializes the Socket
  //
  // endPoint - The string WebSocket endpoint, ie, "ws://example.com/ws",
  //                                               "wss://example.com"
  //                                               "/ws" (inherited host & protocol)
  // opts - Optional configuration
  //   transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
  //               Defaults to WebSocket with automatic LongPoll fallback.
  //   timeout - The default timeout in milliseconds to trigger push timeouts.
  //             Defaults `DEFAULT_TIMEOUT`
  //   heartbeatIntervalMs - The millisec interval to send a heartbeat message
  //   reconnectAfterMs - The optional function that returns the millsec
  //                      reconnect interval. Defaults to stepped backoff of:
  //
  //     function(tries){
  //       return [1000, 5000, 10000][tries - 1] || 10000
  //     }
  //
  //   logger - The optional function for specialized logging, ie:
  //     `logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
  //
  //   longpollerTimeout - The maximum timeout of a long poll AJAX request.
  //                        Defaults to 20s (double the server long poll timer).
  //
  //   params - The optional params to pass when connecting
  //
  // For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
  //

  function Socket(endPoint) {
    var _this4 = this;

    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Socket);

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.timeout = opts.timeout || DEFAULT_TIMEOUT;
    this.transport = opts.transport || window.WebSocket || LongPoll;
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 2000, 5000, 10000][tries - 1] || 10000;
    };
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.params = opts.params || {};
    this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
    this.reconnectTimer = new Timer(function () {
      _this4.disconnect(function () {
        return _this4.connect();
      });
    }, this.reconnectAfterMs);
  }

  _createClass(Socket, [{
    key: "protocol",
    value: function protocol() {
      return location.protocol.match(/^https/) ? "wss" : "ws";
    }
  }, {
    key: "endPointURL",
    value: function endPointURL() {
      var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
      if (uri.charAt(0) !== "/") {
        return uri;
      }
      if (uri.charAt(1) === "/") {
        return this.protocol() + ":" + uri;
      }

      return this.protocol() + "://" + location.host + uri;
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback, code, reason) {
      if (this.conn) {
        this.conn.onclose = function () {}; // noop
        if (code) {
          this.conn.close(code, reason || "");
        } else {
          this.conn.close();
        }
        this.conn = null;
      }
      callback && callback();
    }

    // params - The params to send when connecting, for example `{user_id: userToken}`

  }, {
    key: "connect",
    value: function connect(params) {
      var _this5 = this;

      if (params) {
        console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
        this.params = params;
      }
      if (this.conn) {
        return;
      }

      this.conn = new this.transport(this.endPointURL());
      this.conn.timeout = this.longpollerTimeout;
      this.conn.onopen = function () {
        return _this5.onConnOpen();
      };
      this.conn.onerror = function (error) {
        return _this5.onConnError(error);
      };
      this.conn.onmessage = function (event) {
        return _this5.onConnMessage(event);
      };
      this.conn.onclose = function (event) {
        return _this5.onConnClose(event);
      };
    }

    // Logs the message. Override `this.logger` for specialized logging. noops by default

  }, {
    key: "log",
    value: function log(kind, msg, data) {
      this.logger(kind, msg, data);
    }

    // Registers callbacks for connection state change events
    //
    // Examples
    //
    //    socket.onError(function(error){ alert("An error occurred") })
    //

  }, {
    key: "onOpen",
    value: function onOpen(callback) {
      this.stateChangeCallbacks.open.push(callback);
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.stateChangeCallbacks.close.push(callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.stateChangeCallbacks.error.push(callback);
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      this.stateChangeCallbacks.message.push(callback);
    }
  }, {
    key: "onConnOpen",
    value: function onConnOpen() {
      var _this6 = this;

      this.log("transport", "connected to " + this.endPointURL(), this.transport.prototype);
      this.flushSendBuffer();
      this.reconnectTimer.reset();
      if (!this.conn.skipHeartbeat) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(function () {
          return _this6.sendHeartbeat();
        }, this.heartbeatIntervalMs);
      }
      this.stateChangeCallbacks.open.forEach(function (callback) {
        return callback();
      });
    }
  }, {
    key: "onConnClose",
    value: function onConnClose(event) {
      this.log("transport", "close", event);
      this.triggerChanError();
      clearInterval(this.heartbeatTimer);
      this.reconnectTimer.scheduleTimeout();
      this.stateChangeCallbacks.close.forEach(function (callback) {
        return callback(event);
      });
    }
  }, {
    key: "onConnError",
    value: function onConnError(error) {
      this.log("transport", error);
      this.triggerChanError();
      this.stateChangeCallbacks.error.forEach(function (callback) {
        return callback(error);
      });
    }
  }, {
    key: "triggerChanError",
    value: function triggerChanError() {
      this.channels.forEach(function (channel) {
        return channel.trigger(CHANNEL_EVENTS.error);
      });
    }
  }, {
    key: "connectionState",
    value: function connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return "connecting";
        case SOCKET_STATES.open:
          return "open";
        case SOCKET_STATES.closing:
          return "closing";
        default:
          return "closed";
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this.connectionState() === "open";
    }
  }, {
    key: "remove",
    value: function remove(channel) {
      this.channels = this.channels.filter(function (c) {
        return !c.isMember(channel.topic);
      });
    }
  }, {
    key: "channel",
    value: function channel(topic) {
      var chanParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var chan = new Channel(topic, chanParams, this);
      this.channels.push(chan);
      return chan;
    }
  }, {
    key: "push",
    value: function push(data) {
      var _this7 = this;

      var topic = data.topic;
      var event = data.event;
      var payload = data.payload;
      var ref = data.ref;

      var callback = function callback() {
        return _this7.conn.send(JSON.stringify(data));
      };
      this.log("push", topic + " " + event + " (" + ref + ")", payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }

    // Return the next message ref, accounting for overflows

  }, {
    key: "makeRef",
    value: function makeRef() {
      var newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }

      return this.ref.toString();
    }
  }, {
    key: "sendHeartbeat",
    value: function sendHeartbeat() {
      if (!this.isConnected()) {
        return;
      }
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.makeRef() });
    }
  }, {
    key: "flushSendBuffer",
    value: function flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach(function (callback) {
          return callback();
        });
        this.sendBuffer = [];
      }
    }
  }, {
    key: "onConnMessage",
    value: function onConnMessage(rawMessage) {
      var msg = JSON.parse(rawMessage.data);
      var topic = msg.topic;
      var event = msg.event;
      var payload = msg.payload;
      var ref = msg.ref;

      this.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
      this.channels.filter(function (channel) {
        return channel.isMember(topic);
      }).forEach(function (channel) {
        return channel.trigger(event, payload, ref);
      });
      this.stateChangeCallbacks.message.forEach(function (callback) {
        return callback(msg);
      });
    }
  }]);

  return Socket;
}();

var LongPoll = exports.LongPoll = function () {
  function LongPoll(endPoint) {
    _classCallCheck(this, LongPoll);

    this.endPoint = null;
    this.token = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.pollEndpoint = this.normalizeEndpoint(endPoint);
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  _createClass(LongPoll, [{
    key: "normalizeEndpoint",
    value: function normalizeEndpoint(endPoint) {
      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
    }
  }, {
    key: "endpointURL",
    value: function endpointURL() {
      return Ajax.appendParams(this.pollEndpoint, { token: this.token });
    }
  }, {
    key: "closeAndRetry",
    value: function closeAndRetry() {
      this.close();
      this.readyState = SOCKET_STATES.connecting;
    }
  }, {
    key: "ontimeout",
    value: function ontimeout() {
      this.onerror("timeout");
      this.closeAndRetry();
    }
  }, {
    key: "poll",
    value: function poll() {
      var _this8 = this;

      if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
        return;
      }

      Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
        if (resp) {
          var status = resp.status;
          var token = resp.token;
          var messages = resp.messages;

          _this8.token = token;
        } else {
          var status = 0;
        }

        switch (status) {
          case 200:
            messages.forEach(function (msg) {
              return _this8.onmessage({ data: JSON.stringify(msg) });
            });
            _this8.poll();
            break;
          case 204:
            _this8.poll();
            break;
          case 410:
            _this8.readyState = SOCKET_STATES.open;
            _this8.onopen();
            _this8.poll();
            break;
          case 0:
          case 500:
            _this8.onerror();
            _this8.closeAndRetry();
            break;
          default:
            throw "unhandled poll status " + status;
        }
      });
    }
  }, {
    key: "send",
    value: function send(body) {
      var _this9 = this;

      Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
        if (!resp || resp.status !== 200) {
          _this9.onerror(status);
          _this9.closeAndRetry();
        }
      });
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      this.readyState = SOCKET_STATES.closed;
      this.onclose();
    }
  }]);

  return LongPoll;
}();

var Ajax = exports.Ajax = function () {
  function Ajax() {
    _classCallCheck(this, Ajax);
  }

  _createClass(Ajax, null, [{
    key: "request",
    value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
      if (window.XDomainRequest) {
        var req = new XDomainRequest(); // IE8, IE9
        this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
      } else {
        var req = window.XMLHttpRequest ? new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
        new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
        this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback);
      }
    }
  }, {
    key: "xdomainRequest",
    value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
      var _this10 = this;

      req.timeout = timeout;
      req.open(method, endPoint);
      req.onload = function () {
        var response = _this10.parseJSON(req.responseText);
        callback && callback(response);
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      // Work around bug in IE9 that requires an attached onprogress handler
      req.onprogress = function () {};

      req.send(body);
    }
  }, {
    key: "xhrRequest",
    value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
      var _this11 = this;

      req.timeout = timeout;
      req.open(method, endPoint, true);
      req.setRequestHeader("Content-Type", accept);
      req.onerror = function () {
        callback && callback(null);
      };
      req.onreadystatechange = function () {
        if (req.readyState === _this11.states.complete && callback) {
          var response = _this11.parseJSON(req.responseText);
          callback(response);
        }
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      req.send(body);
    }
  }, {
    key: "parseJSON",
    value: function parseJSON(resp) {
      return resp && resp !== "" ? JSON.parse(resp) : null;
    }
  }, {
    key: "serialize",
    value: function serialize(obj, parentKey) {
      var queryStr = [];
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
        var paramVal = obj[key];
        if ((typeof paramVal === "undefined" ? "undefined" : _typeof(paramVal)) === "object") {
          queryStr.push(this.serialize(paramVal, paramKey));
        } else {
          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
        }
      }
      return queryStr.join("&");
    }
  }, {
    key: "appendParams",
    value: function appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }

      var prefix = url.match(/\?/) ? "&" : "?";
      return "" + url + prefix + this.serialize(params);
    }
  }]);

  return Ajax;
}();

Ajax.states = { complete: 4 };

// Creates a timer that accepts a `timerCalc` function to perform
// calculated timeout retries, such as exponential backoff.
//
// ## Examples
//
//    let reconnectTimer = new Timer(() => this.connect(), function(tries){
//      return [1000, 5000, 10000][tries - 1] || 10000
//    })
//    reconnectTimer.scheduleTimeout() // fires after 1000
//    reconnectTimer.scheduleTimeout() // fires after 5000
//    reconnectTimer.reset()
//    reconnectTimer.scheduleTimeout() // fires after 1000
//

var Timer = function () {
  function Timer(callback, timerCalc) {
    _classCallCheck(this, Timer);

    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;
  }

  _createClass(Timer, [{
    key: "reset",
    value: function reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }

    // Cancels any previous scheduleTimeout and schedules callback

  }, {
    key: "scheduleTimeout",
    value: function scheduleTimeout() {
      var _this12 = this;

      clearTimeout(this.timer);

      this.timer = setTimeout(function () {
        _this12.tries = _this12.tries + 1;
        _this12.callback();
      }, this.timerCalc(this.tries + 1));
    }
  }]);

  return Timer;
}();


})(typeof(exports) === "undefined" ? window.Phoenix = window.Phoenix || {} : exports);

  });
require.register('phoenix_html', function(exports,req,module){
    var require = __makeRequire((function(n) { return req(n.replace('./', 'phoenix_html/')); }), {});
    'use strict';

window.addEventListener('click', function (event) {
  if(event.target && event.target.matches('a[data-submit=parent]')) {
    var message = event.target.getAttribute('data-confirm');
    if (message === null || confirm(message)) {
      event.target.parentNode.submit();
    };
    event.preventDefault();
    return false;
  }
}, false);
  });
})();/*! jQuery v2.2.4 | (c) jQuery Foundation | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=a.document,e=c.slice,f=c.concat,g=c.push,h=c.indexOf,i={},j=i.toString,k=i.hasOwnProperty,l={},m="2.2.4",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return e.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:e.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a){return n.each(this,a)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(e.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:g,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=a&&a.toString();return!n.isArray(a)&&b-parseFloat(b)+1>=0},isPlainObject:function(a){var b;if("object"!==n.type(a)||a.nodeType||n.isWindow(a))return!1;if(a.constructor&&!k.call(a,"constructor")&&!k.call(a.constructor.prototype||{},"isPrototypeOf"))return!1;for(b in a);return void 0===b||k.call(a,b)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?i[j.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=d.createElement("script"),b.text=a,d.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(s(a)){for(c=a.length;c>d;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):g.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:h.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,g=0,h=[];if(s(a))for(d=a.length;d>g;g++)e=b(a[g],g,c),null!=e&&h.push(e);else for(g in a)e=b(a[g],g,c),null!=e&&h.push(e);return f.apply([],h)},guid:1,proxy:function(a,b){var c,d,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(d=e.call(arguments,2),f=function(){return a.apply(b||this,d.concat(e.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:l}),"function"==typeof Symbol&&(n.fn[Symbol.iterator]=c[Symbol.iterator]),n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){i["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=!!a&&"length"in a&&a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ga(),z=ga(),A=ga(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp(L+"+","g"),Q=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),R=new RegExp("^"+L+"*,"+L+"*"),S=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),T=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),U=new RegExp(O),V=new RegExp("^"+M+"$"),W={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},X=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,_=/[+~]/,aa=/'|\\/g,ba=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),ca=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},da=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(ea){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fa(a,b,d,e){var f,h,j,k,l,o,r,s,w=b&&b.ownerDocument,x=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==x&&9!==x&&11!==x)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==x&&(o=$.exec(a)))if(f=o[1]){if(9===x){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(w&&(j=w.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(o[2])return H.apply(d,b.getElementsByTagName(a)),d;if((f=o[3])&&c.getElementsByClassName&&b.getElementsByClassName)return H.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==x)w=b,s=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(aa,"\\$&"):b.setAttribute("id",k=u),r=g(a),h=r.length,l=V.test(k)?"#"+k:"[id='"+k+"']";while(h--)r[h]=l+" "+qa(r[h]);s=r.join(","),w=_.test(a)&&oa(b.parentNode)||b}if(s)try{return H.apply(d,w.querySelectorAll(s)),d}catch(y){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(Q,"$1"),b,d,e)}function ga(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ha(a){return a[u]=!0,a}function ia(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ja(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function ka(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function la(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function na(a){return ha(function(b){return b=+b,ha(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function oa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=fa.support={},f=fa.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fa.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ia(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ia(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Z.test(n.getElementsByClassName),c.getById=ia(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return"undefined"!=typeof b.getElementsByClassName&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=Z.test(n.querySelectorAll))&&(ia(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ia(function(a){var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ia(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return ka(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?ka(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},fa.matches=function(a,b){return fa(a,null,null,b)},fa.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(T,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fa(b,n,null,[a]).length>0},fa.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fa.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fa.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fa.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fa.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fa.selectors={cacheLength:50,createPseudo:ha,match:W,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ba,ca),a[3]=(a[3]||a[4]||a[5]||"").replace(ba,ca),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fa.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fa.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&U.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ba,ca).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fa.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(P," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fa.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ha(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ha(function(a){var b=[],c=[],d=h(a.replace(Q,"$1"));return d[u]?ha(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ha(function(a){return function(b){return fa(a,b).length>0}}),contains:ha(function(a){return a=a.replace(ba,ca),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ha(function(a){return V.test(a||"")||fa.error("unsupported lang: "+a),a=a.replace(ba,ca).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:na(function(){return[0]}),last:na(function(a,b){return[b-1]}),eq:na(function(a,b,c){return[0>c?c+b:c]}),even:na(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:na(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:na(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:na(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=la(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=ma(b);function pa(){}pa.prototype=d.filters=d.pseudos,d.setFilters=new pa,g=fa.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=R.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(Q," ")}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fa.error(a):z(a,i).slice(0)};function qa(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function ra(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(j=b[u]||(b[u]={}),i=j[b.uniqueID]||(j[b.uniqueID]={}),(h=i[d])&&h[0]===w&&h[1]===f)return k[2]=h[2];if(i[d]=k,k[2]=a(b,c,g))return!0}}}function sa(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ta(a,b,c){for(var d=0,e=b.length;e>d;d++)fa(a,b[d],c);return c}function ua(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function va(a,b,c,d,e,f){return d&&!d[u]&&(d=va(d)),e&&!e[u]&&(e=va(e,f)),ha(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ta(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ua(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ua(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ua(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ra(function(a){return a===b},h,!0),l=ra(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[ra(sa(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return va(i>1&&sa(m),i>1&&qa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(Q,"$1"),c,e>i&&wa(a.slice(i,e)),f>e&&wa(a=a.slice(e)),f>e&&qa(a))}m.push(c)}return sa(m)}function xa(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=F.call(i));u=ua(u)}H.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&fa.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ha(f):f}return h=fa.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xa(e,d)),f.selector=a}return f},i=fa.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ba,ca),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ba,ca),_.test(j[0].type)&&oa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qa(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||_.test(a)&&oa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ia(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ia(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ja("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ia(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ja("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ia(function(a){return null==a.getAttribute("disabled")})||ja(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fa}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.uniqueSort=n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},v=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},w=n.expr.match.needsContext,x=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,y=/^.[^:#\[\.,]*$/;function z(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(y.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return h.call(b,a)>-1!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(z(this,a||[],!1))},not:function(a){return this.pushStack(z(this,a||[],!0))},is:function(a){return!!z(this,"string"==typeof a&&w.test(a)?n(a):a||[],!1).length}});var A,B=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=n.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||A,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:B.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),x.test(e[1])&&n.isPlainObject(b))for(e in b)n.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&f.parentNode&&(this.length=1,this[0]=f),this.context=d,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?void 0!==c.ready?c.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};C.prototype=n.fn,A=n(d);var D=/^(?:parents|prev(?:Until|All))/,E={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=w.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?h.call(n(a),this[0]):h.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function F(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return u(a,"parentNode")},parentsUntil:function(a,b,c){return u(a,"parentNode",c)},next:function(a){return F(a,"nextSibling")},prev:function(a){return F(a,"previousSibling")},nextAll:function(a){return u(a,"nextSibling")},prevAll:function(a){return u(a,"previousSibling")},nextUntil:function(a,b,c){return u(a,"nextSibling",c)},prevUntil:function(a,b,c){return u(a,"previousSibling",c)},siblings:function(a){return v((a.parentNode||{}).firstChild,a)},children:function(a){return v(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(E[a]||n.uniqueSort(e),D.test(a)&&e.reverse()),this.pushStack(e)}});var G=/\S+/g;function H(a){var b={};return n.each(a.match(G)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?H(a):n.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){n.each(b,function(b,c){n.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==n.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return n.each(arguments,function(a,b){var c;while((c=n.inArray(b,f,c))>-1)f.splice(c,1),h>=c&&h--}),this},has:function(a){return a?n.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().progress(c.notify).done(c.resolve).fail(c.reject):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=e.call(arguments),d=c.length,f=1!==d||a&&n.isFunction(a.promise)?d:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?e.call(arguments):d,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(d>1)for(i=new Array(d),j=new Array(d),k=new Array(d);d>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().progress(h(b,j,i)).done(h(b,k,c)).fail(g.reject):--f;return f||g.resolveWith(k,c),g.promise()}});var I;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(I.resolveWith(d,[n]),n.fn.triggerHandler&&(n(d).triggerHandler("ready"),n(d).off("ready"))))}});function J(){d.removeEventListener("DOMContentLoaded",J),a.removeEventListener("load",J),n.ready()}n.ready.promise=function(b){return I||(I=n.Deferred(),"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(n.ready):(d.addEventListener("DOMContentLoaded",J),a.addEventListener("load",J))),I.promise(b)},n.ready.promise();var K=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)K(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},L=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function M(){this.expando=n.expando+M.uid++}M.uid=1,M.prototype={register:function(a,b){var c=b||{};return a.nodeType?a[this.expando]=c:Object.defineProperty(a,this.expando,{value:c,writable:!0,configurable:!0}),a[this.expando]},cache:function(a){if(!L(a))return{};var b=a[this.expando];return b||(b={},L(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[b]=c;else for(d in b)e[d]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=a[this.expando];if(void 0!==f){if(void 0===b)this.register(a);else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in f?d=[b,e]:(d=e,d=d in f?[d]:d.match(G)||[])),c=d.length;while(c--)delete f[d[c]]}(void 0===b||n.isEmptyObject(f))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!n.isEmptyObject(b)}};var N=new M,O=new M,P=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Q=/[A-Z]/g;function R(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Q,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:P.test(c)?n.parseJSON(c):c;
}catch(e){}O.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return O.hasData(a)||N.hasData(a)},data:function(a,b,c){return O.access(a,b,c)},removeData:function(a,b){O.remove(a,b)},_data:function(a,b,c){return N.access(a,b,c)},_removeData:function(a,b){N.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=O.get(f),1===f.nodeType&&!N.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),R(f,d,e[d])));N.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){O.set(this,a)}):K(this,function(b){var c,d;if(f&&void 0===b){if(c=O.get(f,a)||O.get(f,a.replace(Q,"-$&").toLowerCase()),void 0!==c)return c;if(d=n.camelCase(a),c=O.get(f,d),void 0!==c)return c;if(c=R(f,d,void 0),void 0!==c)return c}else d=n.camelCase(a),this.each(function(){var c=O.get(this,d);O.set(this,d,b),a.indexOf("-")>-1&&void 0!==c&&O.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){O.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=N.get(a,b),c&&(!d||n.isArray(c)?d=N.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return N.get(a,c)||N.access(a,c,{empty:n.Callbacks("once memory").add(function(){N.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=N.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),U=["Top","Right","Bottom","Left"],V=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)};function W(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return n.css(a,b,"")},i=h(),j=c&&c[3]||(n.cssNumber[b]?"":"px"),k=(n.cssNumber[b]||"px"!==j&&+i)&&T.exec(n.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,n.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var X=/^(?:checkbox|radio)$/i,Y=/<([\w:-]+)/,Z=/^$|\/(?:java|ecma)script/i,$={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};$.optgroup=$.option,$.tbody=$.tfoot=$.colgroup=$.caption=$.thead,$.th=$.td;function _(a,b){var c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function aa(a,b){for(var c=0,d=a.length;d>c;c++)N.set(a[c],"globalEval",!b||N.get(b[c],"globalEval"))}var ba=/<|&#?\w+;/;function ca(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],o=0,p=a.length;p>o;o++)if(f=a[o],f||0===f)if("object"===n.type(f))n.merge(m,f.nodeType?[f]:f);else if(ba.test(f)){g=g||l.appendChild(b.createElement("div")),h=(Y.exec(f)||["",""])[1].toLowerCase(),i=$[h]||$._default,g.innerHTML=i[1]+n.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;n.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",o=0;while(f=m[o++])if(d&&n.inArray(f,d)>-1)e&&e.push(f);else if(j=n.contains(f.ownerDocument,f),g=_(l.appendChild(f),"script"),j&&aa(g),c){k=0;while(f=g[k++])Z.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var da=/^key/,ea=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,fa=/^([^.]*)(?:\.(.+)|)/;function ga(){return!0}function ha(){return!1}function ia(){try{return d.activeElement}catch(a){}}function ja(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ja(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=ha;else if(!e)return a;return 1===f&&(g=e,e=function(a){return n().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=n.guid++)),a.each(function(){n.event.add(this,b,e,d,c)})}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return"undefined"!=typeof n&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(G)||[""],j=b.length;while(j--)h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.hasData(a)&&N.get(a);if(r&&(i=r.events)){b=(b||"").match(G)||[""],j=b.length;while(j--)if(h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&N.remove(a,"handle events")}},dispatch:function(a){a=n.event.fix(a);var b,c,d,f,g,h=[],i=e.call(arguments),j=(N.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())a.rnamespace&&!a.rnamespace.test(g.namespace)||(a.handleObj=g,a.data=g.data,d=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==d&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&("click"!==a.type||isNaN(a.button)||a.button<1))for(;i!==this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>-1:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,e,f,g=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||d,e=c.documentElement,f=c.body,a.pageX=b.clientX+(e&&e.scrollLeft||f&&f.scrollLeft||0)-(e&&e.clientLeft||f&&f.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||f&&f.scrollTop||0)-(e&&e.clientTop||f&&f.clientTop||0)),a.which||void 0===g||(a.which=1&g?1:2&g?3:4&g?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,e,f=a.type,g=a,h=this.fixHooks[f];h||(this.fixHooks[f]=h=ea.test(f)?this.mouseHooks:da.test(f)?this.keyHooks:{}),e=h.props?this.props.concat(h.props):this.props,a=new n.Event(g),b=e.length;while(b--)c=e[b],a[c]=g[c];return a.target||(a.target=d),3===a.target.nodeType&&(a.target=a.target.parentNode),h.filter?h.filter(a,g):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==ia()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===ia()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ga:ha):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={constructor:n.Event,isDefaultPrevented:ha,isPropagationStopped:ha,isImmediatePropagationStopped:ha,isSimulated:!1,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ga,a&&!this.isSimulated&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ga,a&&!this.isSimulated&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ga,a&&!this.isSimulated&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||n.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),n.fn.extend({on:function(a,b,c,d){return ja(this,a,b,c,d)},one:function(a,b,c,d){return ja(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=ha),this.each(function(){n.event.remove(this,a,c,b)})}});var ka=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,la=/<script|<style|<link/i,ma=/checked\s*(?:[^=]|=\s*.checked.)/i,na=/^true\/(.*)/,oa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function pa(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function qa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function ra(a){var b=na.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function sa(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(N.hasData(a)&&(f=N.access(a),g=N.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}O.hasData(a)&&(h=O.access(a),i=n.extend({},h),O.set(b,i))}}function ta(a,b){var c=b.nodeName.toLowerCase();"input"===c&&X.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function ua(a,b,c,d){b=f.apply([],b);var e,g,h,i,j,k,m=0,o=a.length,p=o-1,q=b[0],r=n.isFunction(q);if(r||o>1&&"string"==typeof q&&!l.checkClone&&ma.test(q))return a.each(function(e){var f=a.eq(e);r&&(b[0]=q.call(this,e,f.html())),ua(f,b,c,d)});if(o&&(e=ca(b,a[0].ownerDocument,!1,a,d),g=e.firstChild,1===e.childNodes.length&&(e=g),g||d)){for(h=n.map(_(e,"script"),qa),i=h.length;o>m;m++)j=e,m!==p&&(j=n.clone(j,!0,!0),i&&n.merge(h,_(j,"script"))),c.call(a[m],j,m);if(i)for(k=h[h.length-1].ownerDocument,n.map(h,ra),m=0;i>m;m++)j=h[m],Z.test(j.type||"")&&!N.access(j,"globalEval")&&n.contains(k,j)&&(j.src?n._evalUrl&&n._evalUrl(j.src):n.globalEval(j.textContent.replace(oa,"")))}return a}function va(a,b,c){for(var d,e=b?n.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||n.cleanData(_(d)),d.parentNode&&(c&&n.contains(d.ownerDocument,d)&&aa(_(d,"script")),d.parentNode.removeChild(d));return a}n.extend({htmlPrefilter:function(a){return a.replace(ka,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=_(h),f=_(a),d=0,e=f.length;e>d;d++)ta(f[d],g[d]);if(b)if(c)for(f=f||_(a),g=g||_(h),d=0,e=f.length;e>d;d++)sa(f[d],g[d]);else sa(a,h);return g=_(h,"script"),g.length>0&&aa(g,!i&&_(a,"script")),h},cleanData:function(a){for(var b,c,d,e=n.event.special,f=0;void 0!==(c=a[f]);f++)if(L(c)){if(b=c[N.expando]){if(b.events)for(d in b.events)e[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);c[N.expando]=void 0}c[O.expando]&&(c[O.expando]=void 0)}}}),n.fn.extend({domManip:ua,detach:function(a){return va(this,a,!0)},remove:function(a){return va(this,a)},text:function(a){return K(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.appendChild(a)}})},prepend:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(_(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return K(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!la.test(a)&&!$[(Y.exec(a)||["",""])[1].toLowerCase()]){a=n.htmlPrefilter(a);try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(_(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return ua(this,arguments,function(b){var c=this.parentNode;n.inArray(this,a)<0&&(n.cleanData(_(this)),c&&c.replaceChild(b,this))},a)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),f=e.length-1,h=0;f>=h;h++)c=h===f?this:this.clone(!0),n(e[h])[b](c),g.apply(d,c.get());return this.pushStack(d)}});var wa,xa={HTML:"block",BODY:"block"};function ya(a,b){var c=n(b.createElement(a)).appendTo(b.body),d=n.css(c[0],"display");return c.detach(),d}function za(a){var b=d,c=xa[a];return c||(c=ya(a,b),"none"!==c&&c||(wa=(wa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=wa[0].contentDocument,b.write(),b.close(),c=ya(a,b),wa.detach()),xa[a]=c),c}var Aa=/^margin/,Ba=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ca=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)},Da=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e},Ea=d.documentElement;!function(){var b,c,e,f,g=d.createElement("div"),h=d.createElement("div");if(h.style){h.style.backgroundClip="content-box",h.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===h.style.backgroundClip,g.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",g.appendChild(h);function i(){h.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",h.innerHTML="",Ea.appendChild(g);var d=a.getComputedStyle(h);b="1%"!==d.top,f="2px"===d.marginLeft,c="4px"===d.width,h.style.marginRight="50%",e="4px"===d.marginRight,Ea.removeChild(g)}n.extend(l,{pixelPosition:function(){return i(),b},boxSizingReliable:function(){return null==c&&i(),c},pixelMarginRight:function(){return null==c&&i(),e},reliableMarginLeft:function(){return null==c&&i(),f},reliableMarginRight:function(){var b,c=h.appendChild(d.createElement("div"));return c.style.cssText=h.style.cssText="-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",h.style.width="1px",Ea.appendChild(g),b=!parseFloat(a.getComputedStyle(c).marginRight),Ea.removeChild(g),h.removeChild(c),b}})}}();function Fa(a,b,c){var d,e,f,g,h=a.style;return c=c||Ca(a),g=c?c.getPropertyValue(b)||c[b]:void 0,""!==g&&void 0!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),c&&!l.pixelMarginRight()&&Ba.test(g)&&Aa.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f),void 0!==g?g+"":g}function Ga(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Ha=/^(none|table(?!-c[ea]).+)/,Ia={position:"absolute",visibility:"hidden",display:"block"},Ja={letterSpacing:"0",fontWeight:"400"},Ka=["Webkit","O","Moz","ms"],La=d.createElement("div").style;function Ma(a){if(a in La)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ka.length;while(c--)if(a=Ka[c]+b,a in La)return a}function Na(a,b,c){var d=T.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Oa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+U[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+U[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+U[f]+"Width",!0,e))):(g+=n.css(a,"padding"+U[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+U[f]+"Width",!0,e)));return g}function Pa(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Ca(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=Fa(a,b,f),(0>e||null==e)&&(e=a.style[b]),Ba.test(e))return e;d=g&&(l.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Oa(a,b,c||(g?"border":"content"),d,f)+"px"}function Qa(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=N.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&V(d)&&(f[g]=N.access(d,"olddisplay",za(d.nodeName)))):(e=V(d),"none"===c&&e||N.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Fa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=T.exec(c))&&e[1]&&(c=W(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(n.cssNumber[h]?"":"px")),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Fa(a,b,d)),"normal"===e&&b in Ja&&(e=Ja[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?Ha.test(n.css(a,"display"))&&0===a.offsetWidth?Da(a,Ia,function(){return Pa(a,b,d)}):Pa(a,b,d):void 0},set:function(a,c,d){var e,f=d&&Ca(a),g=d&&Oa(a,b,d,"border-box"===n.css(a,"boxSizing",!1,f),f);return g&&(e=T.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=n.css(a,b)),Na(a,c,g)}}}),n.cssHooks.marginLeft=Ga(l.reliableMarginLeft,function(a,b){return b?(parseFloat(Fa(a,"marginLeft"))||a.getBoundingClientRect().left-Da(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px":void 0}),n.cssHooks.marginRight=Ga(l.reliableMarginRight,function(a,b){return b?Da(a,{display:"inline-block"},Fa,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+U[d]+b]=f[d]||f[d-2]||f[0];return e}},Aa.test(a)||(n.cssHooks[a+b].set=Na)}),n.fn.extend({css:function(a,b){return K(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=Ca(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Qa(this,!0)},hide:function(){return Qa(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){V(this)?n(this).show():n(this).hide()})}});function Ra(a,b,c,d,e){return new Ra.prototype.init(a,b,c,d,e)}n.Tween=Ra,Ra.prototype={constructor:Ra,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||n.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ra.propHooks[this.prop];return a&&a.get?a.get(this):Ra.propHooks._default.get(this)},run:function(a){var b,c=Ra.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ra.propHooks._default.set(this),this}},Ra.prototype.init.prototype=Ra.prototype,Ra.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[n.cssProps[a.prop]]&&!n.cssHooks[a.prop]?a.elem[a.prop]=a.now:n.style(a.elem,a.prop,a.now+a.unit)}}},Ra.propHooks.scrollTop=Ra.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},n.fx=Ra.prototype.init,n.fx.step={};var Sa,Ta,Ua=/^(?:toggle|show|hide)$/,Va=/queueHooks$/;function Wa(){return a.setTimeout(function(){Sa=void 0}),Sa=n.now()}function Xa(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=U[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ya(a,b,c){for(var d,e=(_a.tweeners[b]||[]).concat(_a.tweeners["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Za(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&V(a),q=N.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?N.get(a,"olddisplay")||za(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Ua.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?za(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=N.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;N.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ya(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function $a(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function _a(a,b,c){var d,e,f=0,g=_a.prefilters.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Sa||Wa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},c),originalProperties:b,originalOptions:c,startTime:Sa||Wa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for($a(k,j.opts.specialEasing);g>f;f++)if(d=_a.prefilters[f].call(j,a,k,j.opts))return n.isFunction(d.stop)&&(n._queueHooks(j.elem,j.opts.queue).stop=n.proxy(d.stop,d)),d;return n.map(k,Ya,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(_a,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return W(c.elem,a,T.exec(b),c),c}]},tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.match(G);for(var c,d=0,e=a.length;e>d;d++)c=a[d],_a.tweeners[c]=_a.tweeners[c]||[],_a.tweeners[c].unshift(b)},prefilters:[Za],prefilter:function(a,b){b?_a.prefilters.unshift(a):_a.prefilters.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(V).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=_a(this,n.extend({},a),f);(e||N.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=N.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Va.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=N.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Xa(b,!0),a,d,e)}}),n.each({slideDown:Xa("show"),slideUp:Xa("hide"),slideToggle:Xa("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Sa=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Sa=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ta||(Ta=a.setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){a.clearInterval(Ta),Ta=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(b,c){return b=n.fx?n.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=d.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var ab,bb=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return K(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),e=n.attrHooks[b]||(n.expr.match.bool.test(b)?ab:void 0)),void 0!==c?null===c?void n.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=n.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(G);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)}}),ab={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=bb[b]||n.find.attr;bb[b]=function(a,b,d){var e,f;return d||(f=bb[b],bb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,bb[b]=f),e}});var cb=/^(?:input|select|textarea|button)$/i,db=/^(?:a|area)$/i;n.fn.extend({prop:function(a,b){return K(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&n.isXMLDoc(a)||(b=n.propFix[b]||b,e=n.propHooks[b]),
void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=n.find.attr(a,"tabindex");return b?parseInt(b,10):cb.test(a.nodeName)||db.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),l.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var eb=/[\t\r\n\f]/g;function fb(a){return a.getAttribute&&a.getAttribute("class")||""}n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,fb(this)))});if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,fb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):n.isFunction(a)?this.each(function(c){n(this).toggleClass(a.call(this,c,fb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=n(this),f=a.match(G)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=fb(this),b&&N.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":N.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+fb(c)+" ").replace(eb," ").indexOf(b)>-1)return!0;return!1}});var gb=/\r/g,hb=/[\x20\t\r\n\f]+/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(gb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a)).replace(hb," ")}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],(c.selected||i===e)&&(l.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentNode.disabled||!n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(n.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>-1:void 0}},l.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var ib=/^(?:focusinfocus|focusoutblur)$/;n.extend(n.event,{trigger:function(b,c,e,f){var g,h,i,j,l,m,o,p=[e||d],q=k.call(b,"type")?b.type:b,r=k.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!ib.test(q+n.event.triggered)&&(q.indexOf(".")>-1&&(r=q.split("."),q=r.shift(),r.sort()),l=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=r.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},f||!o.trigger||o.trigger.apply(e,c)!==!1)){if(!f&&!o.noBubble&&!n.isWindow(e)){for(j=o.delegateType||q,ib.test(j+q)||(h=h.parentNode);h;h=h.parentNode)p.push(h),i=h;i===(e.ownerDocument||d)&&p.push(i.defaultView||i.parentWindow||a)}g=0;while((h=p[g++])&&!b.isPropagationStopped())b.type=g>1?j:o.bindType||q,m=(N.get(h,"events")||{})[b.type]&&N.get(h,"handle"),m&&m.apply(h,c),m=l&&h[l],m&&m.apply&&L(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=q,f||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!L(e)||l&&n.isFunction(e[q])&&!n.isWindow(e)&&(i=e[l],i&&(e[l]=null),n.event.triggered=q,e[q](),n.event.triggered=void 0,i&&(e[l]=i)),b.result}},simulate:function(a,b,c){var d=n.extend(new n.Event,c,{type:a,isSimulated:!0});n.event.trigger(d,null,b)}}),n.fn.extend({trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),l.focusin="onfocusin"in a,l.focusin||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a))};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=N.access(d,b);e||d.addEventListener(a,c,!0),N.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=N.access(d,b)-1;e?N.access(d,b,e):(d.removeEventListener(a,c,!0),N.remove(d,b))}}});var jb=a.location,kb=n.now(),lb=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||n.error("Invalid XML: "+b),c};var mb=/#.*$/,nb=/([?&])_=[^&]*/,ob=/^(.*?):[ \t]*([^\r\n]*)$/gm,pb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,qb=/^(?:GET|HEAD)$/,rb=/^\/\//,sb={},tb={},ub="*/".concat("*"),vb=d.createElement("a");vb.href=jb.href;function wb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(G)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function xb(a,b,c,d){var e={},f=a===tb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function yb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function zb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Ab(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:jb.href,type:"GET",isLocal:pb.test(jb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":ub,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?yb(yb(a,n.ajaxSettings),b):yb(n.ajaxSettings,a)},ajaxPrefilter:wb(sb),ajaxTransport:wb(tb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m=n.ajaxSetup({},c),o=m.context||m,p=m.context&&(o.nodeType||o.jquery)?n(o):n.event,q=n.Deferred(),r=n.Callbacks("once memory"),s=m.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,getResponseHeader:function(a){var b;if(2===v){if(!h){h={};while(b=ob.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===v?g:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return v||(a=u[c]=u[c]||a,t[a]=b),this},overrideMimeType:function(a){return v||(m.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>v)for(b in a)s[b]=[s[b],a[b]];else x.always(a[x.status]);return this},abort:function(a){var b=a||w;return e&&e.abort(b),z(0,b),this}};if(q.promise(x).complete=r.add,x.success=x.done,x.error=x.fail,m.url=((b||m.url||jb.href)+"").replace(mb,"").replace(rb,jb.protocol+"//"),m.type=c.method||c.type||m.method||m.type,m.dataTypes=n.trim(m.dataType||"*").toLowerCase().match(G)||[""],null==m.crossDomain){j=d.createElement("a");try{j.href=m.url,j.href=j.href,m.crossDomain=vb.protocol+"//"+vb.host!=j.protocol+"//"+j.host}catch(y){m.crossDomain=!0}}if(m.data&&m.processData&&"string"!=typeof m.data&&(m.data=n.param(m.data,m.traditional)),xb(sb,m,c,x),2===v)return x;k=n.event&&m.global,k&&0===n.active++&&n.event.trigger("ajaxStart"),m.type=m.type.toUpperCase(),m.hasContent=!qb.test(m.type),f=m.url,m.hasContent||(m.data&&(f=m.url+=(lb.test(f)?"&":"?")+m.data,delete m.data),m.cache===!1&&(m.url=nb.test(f)?f.replace(nb,"$1_="+kb++):f+(lb.test(f)?"&":"?")+"_="+kb++)),m.ifModified&&(n.lastModified[f]&&x.setRequestHeader("If-Modified-Since",n.lastModified[f]),n.etag[f]&&x.setRequestHeader("If-None-Match",n.etag[f])),(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",m.contentType),x.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+ub+"; q=0.01":""):m.accepts["*"]);for(l in m.headers)x.setRequestHeader(l,m.headers[l]);if(m.beforeSend&&(m.beforeSend.call(o,x,m)===!1||2===v))return x.abort();w="abort";for(l in{success:1,error:1,complete:1})x[l](m[l]);if(e=xb(tb,m,c,x)){if(x.readyState=1,k&&p.trigger("ajaxSend",[x,m]),2===v)return x;m.async&&m.timeout>0&&(i=a.setTimeout(function(){x.abort("timeout")},m.timeout));try{v=1,e.send(t,z)}catch(y){if(!(2>v))throw y;z(-1,y)}}else z(-1,"No Transport");function z(b,c,d,h){var j,l,t,u,w,y=c;2!==v&&(v=2,i&&a.clearTimeout(i),e=void 0,g=h||"",x.readyState=b>0?4:0,j=b>=200&&300>b||304===b,d&&(u=zb(m,x,d)),u=Ab(m,u,x,j),j?(m.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(n.lastModified[f]=w),w=x.getResponseHeader("etag"),w&&(n.etag[f]=w)),204===b||"HEAD"===m.type?y="nocontent":304===b?y="notmodified":(y=u.state,l=u.data,t=u.error,j=!t)):(t=y,!b&&y||(y="error",0>b&&(b=0))),x.status=b,x.statusText=(c||y)+"",j?q.resolveWith(o,[l,y,x]):q.rejectWith(o,[x,y,t]),x.statusCode(s),s=void 0,k&&p.trigger(j?"ajaxSuccess":"ajaxError",[x,m,j?l:t]),r.fireWith(o,[x,y]),k&&(p.trigger("ajaxComplete",[x,m]),--n.active||n.event.trigger("ajaxStop")))}return x},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax(n.extend({url:a,type:b,dataType:e,data:c,success:d},n.isPlainObject(a)&&a))}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return n.isFunction(a)?this.each(function(b){n(this).wrapInner(a.call(this,b))}):this.each(function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return!n.expr.filters.visible(a)},n.expr.filters.visible=function(a){return a.offsetWidth>0||a.offsetHeight>0||a.getClientRects().length>0};var Bb=/%20/g,Cb=/\[\]$/,Db=/\r?\n/g,Eb=/^(?:submit|button|image|reset|file)$/i,Fb=/^(?:input|select|textarea|keygen)/i;function Gb(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||Cb.test(a)?d(a,e):Gb(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Gb(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Gb(c,a[c],b,e);return d.join("&").replace(Bb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Fb.test(this.nodeName)&&!Eb.test(a)&&(this.checked||!X.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(Db,"\r\n")}}):{name:b.name,value:c.replace(Db,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Hb={0:200,1223:204},Ib=n.ajaxSettings.xhr();l.cors=!!Ib&&"withCredentials"in Ib,l.ajax=Ib=!!Ib,n.ajaxTransport(function(b){var c,d;return l.cors||Ib&&!b.crossDomain?{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Hb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=n("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Jb=[],Kb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Jb.pop()||n.expando+"_"+kb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Kb.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Kb.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Kb,"$1"+e):b.jsonp!==!1&&(b.url+=(lb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?n(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Jb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||d;var e=x.exec(a),f=!c&&[];return e?[b.createElement(e[1])]:(e=ca([a],b,f),f&&f.length&&n(f).remove(),n.merge([],e.childNodes))};var Lb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Lb)return Lb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};function Mb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,n.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(e=d.getBoundingClientRect(),c=Mb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ea})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;n.fn[a]=function(d){return K(this,function(a,d,e){var f=Mb(a);return void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=Ga(l.pixelPosition,function(a,c){return c?(c=Fa(a,b),Ba.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return K(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},size:function(){return this.length}}),n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Nb=a.jQuery,Ob=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Ob),b&&a.jQuery===n&&(a.jQuery=Nb),n},b||(a.jQuery=a.$=n),n});

require.register("web/static/js/app", function(exports, require, module) {
"use strict";

require("phoenix_html");

var _jqueryui = require("./jqueryui");

var _jqueryui2 = _interopRequireDefault(_jqueryui);

var _bootstrap = require("./bootstrap");

var _bootstrap2 = _interopRequireDefault(_bootstrap);

var _chart = require("./chart");

var _chart2 = _interopRequireDefault(_chart);

var _scripts = require("./scripts");

var _scripts2 = _interopRequireDefault(_scripts);

var _charts = require("./charts");

var _charts2 = _interopRequireDefault(_charts);

var _sites = require("./sites");

var _sites2 = _interopRequireDefault(_sites);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
});

;require.register("web/static/js/bootstrap", function(exports, require, module) {
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * Bootstrap v3.3.6 (http://getbootstrap.com)
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under the MIT license
 */

if (typeof jQuery === 'undefined') {
  throw new Error('Bootstrap\'s JavaScript requires jQuery');
}

+function ($) {
  'use strict';

  var version = $.fn.jquery.split(' ')[0].split('.');
  if (version[0] < 2 && version[1] < 9 || version[0] == 1 && version[1] == 9 && version[2] < 1 || version[0] > 2) {
    throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher, but lower than version 3');
  }
}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.6
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap');

    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    };

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] };
      }
    }

    return false; // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false;
    var $el = this;
    $(this).one('bsTransitionEnd', function () {
      called = true;
    });
    var callback = function callback() {
      if (!called) $($el).trigger($.support.transition.end);
    };
    setTimeout(callback, duration);
    return this;
  };

  $(function () {
    $.support.transition = transitionEnd();

    if (!$.support.transition) return;

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function handle(e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments);
      }
    };
  });
}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.6
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]';
  var Alert = function Alert(el) {
    $(el).on('click', dismiss, this.close);
  };

  Alert.VERSION = '3.3.6';

  Alert.TRANSITION_DURATION = 150;

  Alert.prototype.close = function (e) {
    var $this = $(this);
    var selector = $this.attr('data-target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    var $parent = $(selector);

    if (e) e.preventDefault();

    if (!$parent.length) {
      $parent = $this.closest('.alert');
    }

    $parent.trigger(e = $.Event('close.bs.alert'));

    if (e.isDefaultPrevented()) return;

    $parent.removeClass('in');

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove();
    }

    $.support.transition && $parent.hasClass('fade') ? $parent.one('bsTransitionEnd', removeElement).emulateTransitionEnd(Alert.TRANSITION_DURATION) : removeElement();
  };

  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.alert');

      if (!data) $this.data('bs.alert', data = new Alert(this));
      if (typeof option == 'string') data[option].call($this);
    });
  }

  var old = $.fn.alert;

  $.fn.alert = Plugin;
  $.fn.alert.Constructor = Alert;

  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old;
    return this;
  };

  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close);
}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.6
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function Button(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Button.DEFAULTS, options);
    this.isLoading = false;
  };

  Button.VERSION = '3.3.6';

  Button.DEFAULTS = {
    loadingText: 'loading...'
  };

  Button.prototype.setState = function (state) {
    var d = 'disabled';
    var $el = this.$element;
    var val = $el.is('input') ? 'val' : 'html';
    var data = $el.data();

    state += 'Text';

    if (data.resetText == null) $el.data('resetText', $el[val]());

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state]);

      if (state == 'loadingText') {
        this.isLoading = true;
        $el.addClass(d).attr(d, d);
      } else if (this.isLoading) {
        this.isLoading = false;
        $el.removeClass(d).removeAttr(d);
      }
    }, this), 0);
  };

  Button.prototype.toggle = function () {
    var changed = true;
    var $parent = this.$element.closest('[data-toggle="buttons"]');

    if ($parent.length) {
      var $input = this.$element.find('input');
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false;
        $parent.find('.active').removeClass('active');
        this.$element.addClass('active');
      } else if ($input.prop('type') == 'checkbox') {
        if ($input.prop('checked') !== this.$element.hasClass('active')) changed = false;
        this.$element.toggleClass('active');
      }
      $input.prop('checked', this.$element.hasClass('active'));
      if (changed) $input.trigger('change');
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'));
      this.$element.toggleClass('active');
    }
  };

  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.button');
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      if (!data) $this.data('bs.button', data = new Button(this, options));

      if (option == 'toggle') data.toggle();else if (option) data.setState(option);
    });
  }

  var old = $.fn.button;

  $.fn.button = Plugin;
  $.fn.button.Constructor = Button;

  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old;
    return this;
  };

  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    var $btn = $(e.target);
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn');
    Plugin.call($btn, 'toggle');
    if (!($(e.target).is('input[type="radio"]') || $(e.target).is('input[type="checkbox"]'))) e.preventDefault();
  }).on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
    $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type));
  });
}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.6
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function Carousel(element, options) {
    this.$element = $(element);
    this.$indicators = this.$element.find('.carousel-indicators');
    this.options = options;
    this.paused = null;
    this.sliding = null;
    this.interval = null;
    this.$active = null;
    this.$items = null;

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this));

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element.on('mouseenter.bs.carousel', $.proxy(this.pause, this)).on('mouseleave.bs.carousel', $.proxy(this.cycle, this));
  };

  Carousel.VERSION = '3.3.6';

  Carousel.TRANSITION_DURATION = 600;

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  };

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return;
    switch (e.which) {
      case 37:
        this.prev();break;
      case 39:
        this.next();break;
      default:
        return;
    }

    e.preventDefault();
  };

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false);

    this.interval && clearInterval(this.interval);

    this.options.interval && !this.paused && (this.interval = setInterval($.proxy(this.next, this), this.options.interval));

    return this;
  };

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item');
    return this.$items.index(item || this.$active);
  };

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active);
    var willWrap = direction == 'prev' && activeIndex === 0 || direction == 'next' && activeIndex == this.$items.length - 1;
    if (willWrap && !this.options.wrap) return active;
    var delta = direction == 'prev' ? -1 : 1;
    var itemIndex = (activeIndex + delta) % this.$items.length;
    return this.$items.eq(itemIndex);
  };

  Carousel.prototype.to = function (pos) {
    var that = this;
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'));

    if (pos > this.$items.length - 1 || pos < 0) return;

    if (this.sliding) return this.$element.one('slid.bs.carousel', function () {
      that.to(pos);
    }); // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle();

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos));
  };

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true);

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end);
      this.cycle(true);
    }

    this.interval = clearInterval(this.interval);

    return this;
  };

  Carousel.prototype.next = function () {
    if (this.sliding) return;
    return this.slide('next');
  };

  Carousel.prototype.prev = function () {
    if (this.sliding) return;
    return this.slide('prev');
  };

  Carousel.prototype.slide = function (type, next) {
    var $active = this.$element.find('.item.active');
    var $next = next || this.getItemForDirection(type, $active);
    var isCycling = this.interval;
    var direction = type == 'next' ? 'left' : 'right';
    var that = this;

    if ($next.hasClass('active')) return this.sliding = false;

    var relatedTarget = $next[0];
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    });
    this.$element.trigger(slideEvent);
    if (slideEvent.isDefaultPrevented()) return;

    this.sliding = true;

    isCycling && this.pause();

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active');
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
      $nextIndicator && $nextIndicator.addClass('active');
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }); // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type);
      $next[0].offsetWidth; // force reflow
      $active.addClass(direction);
      $next.addClass(direction);
      $active.one('bsTransitionEnd', function () {
        $next.removeClass([type, direction].join(' ')).addClass('active');
        $active.removeClass(['active', direction].join(' '));
        that.sliding = false;
        setTimeout(function () {
          that.$element.trigger(slidEvent);
        }, 0);
      }).emulateTransitionEnd(Carousel.TRANSITION_DURATION);
    } else {
      $active.removeClass('active');
      $next.addClass('active');
      this.sliding = false;
      this.$element.trigger(slidEvent);
    }

    isCycling && this.cycle();

    return this;
  };

  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.carousel');
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option);
      var action = typeof option == 'string' ? option : options.slide;

      if (!data) $this.data('bs.carousel', data = new Carousel(this, options));
      if (typeof option == 'number') data.to(option);else if (action) data[action]();else if (options.interval) data.pause().cycle();
    });
  }

  var old = $.fn.carousel;

  $.fn.carousel = Plugin;
  $.fn.carousel.Constructor = Carousel;

  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old;
    return this;
  };

  // CAROUSEL DATA-API
  // =================

  var clickHandler = function clickHandler(e) {
    var href;
    var $this = $(this);
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')); // strip for ie7
    if (!$target.hasClass('carousel')) return;
    var options = $.extend({}, $target.data(), $this.data());
    var slideIndex = $this.attr('data-slide-to');
    if (slideIndex) options.interval = false;

    Plugin.call($target, options);

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex);
    }

    e.preventDefault();
  };

  $(document).on('click.bs.carousel.data-api', '[data-slide]', clickHandler).on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler);

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this);
      Plugin.call($carousel, $carousel.data());
    });
  });
}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.6
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function Collapse(element, options) {
    this.$element = $(element);
    this.options = $.extend({}, Collapse.DEFAULTS, options);
    this.$trigger = $('[data-toggle="collapse"][href="#' + element.id + '"],' + '[data-toggle="collapse"][data-target="#' + element.id + '"]');
    this.transitioning = null;

    if (this.options.parent) {
      this.$parent = this.getParent();
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger);
    }

    if (this.options.toggle) this.toggle();
  };

  Collapse.VERSION = '3.3.6';

  Collapse.TRANSITION_DURATION = 350;

  Collapse.DEFAULTS = {
    toggle: true
  };

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width');
    return hasWidth ? 'width' : 'height';
  };

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return;

    var activesData;
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing');

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse');
      if (activesData && activesData.transitioning) return;
    }

    var startEvent = $.Event('show.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented()) return;

    if (actives && actives.length) {
      Plugin.call(actives, 'hide');
      activesData || actives.data('bs.collapse', null);
    }

    var dimension = this.dimension();

    this.$element.removeClass('collapse').addClass('collapsing')[dimension](0).attr('aria-expanded', true);

    this.$trigger.removeClass('collapsed').attr('aria-expanded', true);

    this.transitioning = 1;

    var complete = function complete() {
      this.$element.removeClass('collapsing').addClass('collapse in')[dimension]('');
      this.transitioning = 0;
      this.$element.trigger('shown.bs.collapse');
    };

    if (!$.support.transition) return complete.call(this);

    var scrollSize = $.camelCase(['scroll', dimension].join('-'));

    this.$element.one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize]);
  };

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return;

    var startEvent = $.Event('hide.bs.collapse');
    this.$element.trigger(startEvent);
    if (startEvent.isDefaultPrevented()) return;

    var dimension = this.dimension();

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight;

    this.$element.addClass('collapsing').removeClass('collapse in').attr('aria-expanded', false);

    this.$trigger.addClass('collapsed').attr('aria-expanded', false);

    this.transitioning = 1;

    var complete = function complete() {
      this.transitioning = 0;
      this.$element.removeClass('collapsing').addClass('collapse').trigger('hidden.bs.collapse');
    };

    if (!$.support.transition) return complete.call(this);

    this.$element[dimension](0).one('bsTransitionEnd', $.proxy(complete, this)).emulateTransitionEnd(Collapse.TRANSITION_DURATION);
  };

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']();
  };

  Collapse.prototype.getParent = function () {
    return $(this.options.parent).find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]').each($.proxy(function (i, element) {
      var $element = $(element);
      this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element);
    }, this)).end();
  };

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in');

    $element.attr('aria-expanded', isOpen);
    $trigger.toggleClass('collapsed', !isOpen).attr('aria-expanded', isOpen);
  };

  function getTargetFromTrigger($trigger) {
    var href;
    var target = $trigger.attr('data-target') || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''); // strip for ie7

    return $(target);
  }

  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.collapse');
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option);

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false;
      if (!data) $this.data('bs.collapse', data = new Collapse(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.collapse;

  $.fn.collapse = Plugin;
  $.fn.collapse.Constructor = Collapse;

  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old;
    return this;
  };

  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this = $(this);

    if (!$this.attr('data-target')) e.preventDefault();

    var $target = getTargetFromTrigger($this);
    var data = $target.data('bs.collapse');
    var option = data ? 'toggle' : $this.data();

    Plugin.call($target, option);
  });
}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.6
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop';
  var toggle = '[data-toggle="dropdown"]';
  var Dropdown = function Dropdown(element) {
    $(element).on('click.bs.dropdown', this.toggle);
  };

  Dropdown.VERSION = '3.3.6';

  function getParent($this) {
    var selector = $this.attr('data-target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    var $parent = selector && $(selector);

    return $parent && $parent.length ? $parent : $this.parent();
  }

  function clearMenus(e) {
    if (e && e.which === 3) return;
    $(backdrop).remove();
    $(toggle).each(function () {
      var $this = $(this);
      var $parent = getParent($this);
      var relatedTarget = { relatedTarget: this };

      if (!$parent.hasClass('open')) return;

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return;

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget));

      if (e.isDefaultPrevented()) return;

      $this.attr('aria-expanded', 'false');
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget));
    });
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this);

    if ($this.is('.disabled, :disabled')) return;

    var $parent = getParent($this);
    var isActive = $parent.hasClass('open');

    clearMenus();

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div')).addClass('dropdown-backdrop').insertAfter($(this)).on('click', clearMenus);
      }

      var relatedTarget = { relatedTarget: this };
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget));

      if (e.isDefaultPrevented()) return;

      $this.trigger('focus').attr('aria-expanded', 'true');

      $parent.toggleClass('open').trigger($.Event('shown.bs.dropdown', relatedTarget));
    }

    return false;
  };

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return;

    var $this = $(this);

    e.preventDefault();
    e.stopPropagation();

    if ($this.is('.disabled, :disabled')) return;

    var $parent = getParent($this);
    var isActive = $parent.hasClass('open');

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus');
      return $this.trigger('click');
    }

    var desc = ' li:not(.disabled):visible a';
    var $items = $parent.find('.dropdown-menu' + desc);

    if (!$items.length) return;

    var index = $items.index(e.target);

    if (e.which == 38 && index > 0) index--; // up
    if (e.which == 40 && index < $items.length - 1) index++; // down
    if (!~index) index = 0;

    $items.eq(index).trigger('focus');
  };

  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.dropdown');

      if (!data) $this.data('bs.dropdown', data = new Dropdown(this));
      if (typeof option == 'string') data[option].call($this);
    });
  }

  var old = $.fn.dropdown;

  $.fn.dropdown = Plugin;
  $.fn.dropdown.Constructor = Dropdown;

  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old;
    return this;
  };

  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document).on('click.bs.dropdown.data-api', clearMenus).on('click.bs.dropdown.data-api', '.dropdown form', function (e) {
    e.stopPropagation();
  }).on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle).on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown).on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown);
}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.6
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function Modal(element, options) {
    this.options = options;
    this.$body = $(document.body);
    this.$element = $(element);
    this.$dialog = this.$element.find('.modal-dialog');
    this.$backdrop = null;
    this.isShown = null;
    this.originalBodyPad = null;
    this.scrollbarWidth = 0;
    this.ignoreBackdropClick = false;

    if (this.options.remote) {
      this.$element.find('.modal-content').load(this.options.remote, $.proxy(function () {
        this.$element.trigger('loaded.bs.modal');
      }, this));
    }
  };

  Modal.VERSION = '3.3.6';

  Modal.TRANSITION_DURATION = 300;
  Modal.BACKDROP_TRANSITION_DURATION = 150;

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  };

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget);
  };

  Modal.prototype.show = function (_relatedTarget) {
    var that = this;
    var e = $.Event('show.bs.modal', { relatedTarget: _relatedTarget });

    this.$element.trigger(e);

    if (this.isShown || e.isDefaultPrevented()) return;

    this.isShown = true;

    this.checkScrollbar();
    this.setScrollbar();
    this.$body.addClass('modal-open');

    this.escape();
    this.resize();

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this));

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true;
      });
    });

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade');

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body); // don't move modals dom position
      }

      that.$element.show().scrollTop(0);

      that.adjustDialog();

      if (transition) {
        that.$element[0].offsetWidth; // force reflow
      }

      that.$element.addClass('in');

      that.enforceFocus();

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget });

      transition ? that.$dialog // wait for modal to slide in
      .one('bsTransitionEnd', function () {
        that.$element.trigger('focus').trigger(e);
      }).emulateTransitionEnd(Modal.TRANSITION_DURATION) : that.$element.trigger('focus').trigger(e);
    });
  };

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault();

    e = $.Event('hide.bs.modal');

    this.$element.trigger(e);

    if (!this.isShown || e.isDefaultPrevented()) return;

    this.isShown = false;

    this.escape();
    this.resize();

    $(document).off('focusin.bs.modal');

    this.$element.removeClass('in').off('click.dismiss.bs.modal').off('mouseup.dismiss.bs.modal');

    this.$dialog.off('mousedown.dismiss.bs.modal');

    $.support.transition && this.$element.hasClass('fade') ? this.$element.one('bsTransitionEnd', $.proxy(this.hideModal, this)).emulateTransitionEnd(Modal.TRANSITION_DURATION) : this.hideModal();
  };

  Modal.prototype.enforceFocus = function () {
    $(document).off('focusin.bs.modal') // guard against infinite focus loop
    .on('focusin.bs.modal', $.proxy(function (e) {
      if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
        this.$element.trigger('focus');
      }
    }, this));
  };

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide();
      }, this));
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal');
    }
  };

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this));
    } else {
      $(window).off('resize.bs.modal');
    }
  };

  Modal.prototype.hideModal = function () {
    var that = this;
    this.$element.hide();
    this.backdrop(function () {
      that.$body.removeClass('modal-open');
      that.resetAdjustments();
      that.resetScrollbar();
      that.$element.trigger('hidden.bs.modal');
    });
  };

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove();
    this.$backdrop = null;
  };

  Modal.prototype.backdrop = function (callback) {
    var that = this;
    var animate = this.$element.hasClass('fade') ? 'fade' : '';

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate;

      this.$backdrop = $(document.createElement('div')).addClass('modal-backdrop ' + animate).appendTo(this.$body);

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false;
          return;
        }
        if (e.target !== e.currentTarget) return;
        this.options.backdrop == 'static' ? this.$element[0].focus() : this.hide();
      }, this));

      if (doAnimate) this.$backdrop[0].offsetWidth; // force reflow

      this.$backdrop.addClass('in');

      if (!callback) return;

      doAnimate ? this.$backdrop.one('bsTransitionEnd', callback).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callback();
    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in');

      var callbackRemove = function callbackRemove() {
        that.removeBackdrop();
        callback && callback();
      };
      $.support.transition && this.$element.hasClass('fade') ? this.$backdrop.one('bsTransitionEnd', callbackRemove).emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) : callbackRemove();
    } else if (callback) {
      callback();
    }
  };

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog();
  };

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight;

    this.$element.css({
      paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    });
  };

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    });
  };

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth;
    if (!fullWindowWidth) {
      // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect();
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth;
    this.scrollbarWidth = this.measureScrollbar();
  };

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt(this.$body.css('padding-right') || 0, 10);
    this.originalBodyPad = document.body.style.paddingRight || '';
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth);
  };

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad);
  };

  Modal.prototype.measureScrollbar = function () {
    // thx walsh
    var scrollDiv = document.createElement('div');
    scrollDiv.className = 'modal-scrollbar-measure';
    this.$body.append(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    this.$body[0].removeChild(scrollDiv);
    return scrollbarWidth;
  };

  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.modal');
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option);

      if (!data) $this.data('bs.modal', data = new Modal(this, options));
      if (typeof option == 'string') data[option](_relatedTarget);else if (options.show) data.show(_relatedTarget);
    });
  }

  var old = $.fn.modal;

  $.fn.modal = Plugin;
  $.fn.modal.Constructor = Modal;

  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old;
    return this;
  };

  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this = $(this);
    var href = $this.attr('href');
    var $target = $($this.attr('data-target') || href && href.replace(/.*(?=#[^\s]+$)/, '')); // strip for ie7
    var option = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

    if ($this.is('a')) e.preventDefault();

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return; // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus');
      });
    });
    Plugin.call($target, option, this);
  });
}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.6
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function Tooltip(element, options) {
    this.type = null;
    this.options = null;
    this.enabled = null;
    this.timeout = null;
    this.hoverState = null;
    this.$element = null;
    this.inState = null;

    this.init('tooltip', element, options);
  };

  Tooltip.VERSION = '3.3.6';

  Tooltip.TRANSITION_DURATION = 150;

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  };

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled = true;
    this.type = type;
    this.$element = $(element);
    this.options = this.getOptions(options);
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : this.options.viewport.selector || this.options.viewport);
    this.inState = { click: false, hover: false, focus: false };

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!');
    }

    var triggers = this.options.trigger.split(' ');

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i];

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this));
      } else if (trigger != 'manual') {
        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';

        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this));
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this));
      }
    }

    this.options.selector ? this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' }) : this.fixTitle();
  };

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS;
  };

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options);

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      };
    }

    return options;
  };

  Tooltip.prototype.getDelegateOptions = function () {
    var options = {};
    var defaults = this.getDefaults();

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value;
    });

    return options;
  };

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true;
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in';
      return;
    }

    clearTimeout(self.timeout);

    self.hoverState = 'in';

    if (!self.options.delay || !self.options.delay.show) return self.show();

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show();
    }, self.options.delay.show);
  };

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true;
    }

    return false;
  };

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ? obj : $(obj.currentTarget).data('bs.' + this.type);

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false;
    }

    if (self.isInStateTrue()) return;

    clearTimeout(self.timeout);

    self.hoverState = 'out';

    if (!self.options.delay || !self.options.delay.hide) return self.hide();

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide();
    }, self.options.delay.hide);
  };

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type);

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e);

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0]);
      if (e.isDefaultPrevented() || !inDom) return;
      var that = this;

      var $tip = this.tip();

      var tipId = this.getUID(this.type);

      this.setContent();
      $tip.attr('id', tipId);
      this.$element.attr('aria-describedby', tipId);

      if (this.options.animation) $tip.addClass('fade');

      var placement = typeof this.options.placement == 'function' ? this.options.placement.call(this, $tip[0], this.$element[0]) : this.options.placement;

      var autoToken = /\s?auto?\s?/i;
      var autoPlace = autoToken.test(placement);
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top';

      $tip.detach().css({ top: 0, left: 0, display: 'block' }).addClass(placement).data('bs.' + this.type, this);

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element);
      this.$element.trigger('inserted.bs.' + this.type);

      var pos = this.getPosition();
      var actualWidth = $tip[0].offsetWidth;
      var actualHeight = $tip[0].offsetHeight;

      if (autoPlace) {
        var orgPlacement = placement;
        var viewportDim = this.getPosition(this.$viewport);

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement == 'top' && pos.top - actualHeight < viewportDim.top ? 'bottom' : placement == 'right' && pos.right + actualWidth > viewportDim.width ? 'left' : placement == 'left' && pos.left - actualWidth < viewportDim.left ? 'right' : placement;

        $tip.removeClass(orgPlacement).addClass(placement);
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

      this.applyPlacement(calculatedOffset, placement);

      var complete = function complete() {
        var prevHoverState = that.hoverState;
        that.$element.trigger('shown.bs.' + that.type);
        that.hoverState = null;

        if (prevHoverState == 'out') that.leave(that);
      };

      $.support.transition && this.$tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();
    }
  };

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip = this.tip();
    var width = $tip[0].offsetWidth;
    var height = $tip[0].offsetHeight;

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10);
    var marginLeft = parseInt($tip.css('margin-left'), 10);

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop)) marginTop = 0;
    if (isNaN(marginLeft)) marginLeft = 0;

    offset.top += marginTop;
    offset.left += marginLeft;

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function using(props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        });
      }
    }, offset), 0);

    $tip.addClass('in');

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth = $tip[0].offsetWidth;
    var actualHeight = $tip[0].offsetHeight;

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight;
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight);

    if (delta.left) offset.left += delta.left;else offset.top += delta.top;

    var isVertical = /top|bottom/.test(placement);
    var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight;
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';

    $tip.offset(offset);
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical);
  };

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow().css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%').css(isVertical ? 'top' : 'left', '');
  };

  Tooltip.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
    $tip.removeClass('fade in top bottom left right');
  };

  Tooltip.prototype.hide = function (callback) {
    var that = this;
    var $tip = $(this.$tip);
    var e = $.Event('hide.bs.' + this.type);

    function complete() {
      if (that.hoverState != 'in') $tip.detach();
      that.$element.removeAttr('aria-describedby').trigger('hidden.bs.' + that.type);
      callback && callback();
    }

    this.$element.trigger(e);

    if (e.isDefaultPrevented()) return;

    $tip.removeClass('in');

    $.support.transition && $tip.hasClass('fade') ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(Tooltip.TRANSITION_DURATION) : complete();

    this.hoverState = null;

    return this;
  };

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element;
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
    }
  };

  Tooltip.prototype.hasContent = function () {
    return this.getTitle();
  };

  Tooltip.prototype.getPosition = function ($element) {
    $element = $element || this.$element;

    var el = $element[0];
    var isBody = el.tagName == 'BODY';

    var elRect = el.getBoundingClientRect();
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top });
    }
    var elOffset = isBody ? { top: 0, left: 0 } : $element.offset();
    var scroll = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() };
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null;

    return $.extend({}, elRect, scroll, outerDims, elOffset);
  };

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2 } : placement == 'top' ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } : placement == 'left' ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
    /* placement == 'right' */{ top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width };
  };

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 };
    if (!this.$viewport) return delta;

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0;
    var viewportDimensions = this.getPosition(this.$viewport);

    if (/right|left/.test(placement)) {
      var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
      if (topEdgeOffset < viewportDimensions.top) {
        // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset;
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
        // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
      }
    } else {
      var leftEdgeOffset = pos.left - viewportPadding;
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth;
      if (leftEdgeOffset < viewportDimensions.left) {
        // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset;
      } else if (rightEdgeOffset > viewportDimensions.right) {
        // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset;
      }
    }

    return delta;
  };

  Tooltip.prototype.getTitle = function () {
    var title;
    var $e = this.$element;
    var o = this.options;

    title = $e.attr('data-original-title') || (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);

    return title;
  };

  Tooltip.prototype.getUID = function (prefix) {
    do {
      prefix += ~~(Math.random() * 1000000);
    } while (document.getElementById(prefix));
    return prefix;
  };

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template);
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!');
      }
    }
    return this.$tip;
  };

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow');
  };

  Tooltip.prototype.enable = function () {
    this.enabled = true;
  };

  Tooltip.prototype.disable = function () {
    this.enabled = false;
  };

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled;
  };

  Tooltip.prototype.toggle = function (e) {
    var self = this;
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type);
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions());
        $(e.currentTarget).data('bs.' + this.type, self);
      }
    }

    if (e) {
      self.inState.click = !self.inState.click;
      if (self.isInStateTrue()) self.enter(self);else self.leave(self);
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
    }
  };

  Tooltip.prototype.destroy = function () {
    var that = this;
    clearTimeout(this.timeout);
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type);
      if (that.$tip) {
        that.$tip.detach();
      }
      that.$tip = null;
      that.$arrow = null;
      that.$viewport = null;
    });
  };

  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tooltip');
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      if (!data && /destroy|hide/.test(option)) return;
      if (!data) $this.data('bs.tooltip', data = new Tooltip(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.tooltip;

  $.fn.tooltip = Plugin;
  $.fn.tooltip.Constructor = Tooltip;

  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };
}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.6
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function Popover(element, options) {
    this.init('popover', element, options);
  };

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js');

  Popover.VERSION = '3.3.6';

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  });

  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype);

  Popover.prototype.constructor = Popover;

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS;
  };

  Popover.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();
    var content = this.getContent();

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title);
    $tip.find('.popover-content').children().detach().end()[// we use append for html objects to maintain js events
    this.options.html ? typeof content == 'string' ? 'html' : 'append' : 'text'](content);

    $tip.removeClass('fade top bottom left right in');

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide();
  };

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent();
  };

  Popover.prototype.getContent = function () {
    var $e = this.$element;
    var o = this.options;

    return $e.attr('data-content') || (typeof o.content == 'function' ? o.content.call($e[0]) : o.content);
  };

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.arrow');
  };

  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.popover');
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      if (!data && /destroy|hide/.test(option)) return;
      if (!data) $this.data('bs.popover', data = new Popover(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.popover;

  $.fn.popover = Plugin;
  $.fn.popover.Constructor = Popover;

  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old;
    return this;
  };
}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.6
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body = $(document.body);
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element);
    this.options = $.extend({}, ScrollSpy.DEFAULTS, options);
    this.selector = (this.options.target || '') + ' .nav li > a';
    this.offsets = [];
    this.targets = [];
    this.activeTarget = null;
    this.scrollHeight = 0;

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this));
    this.refresh();
    this.process();
  }

  ScrollSpy.VERSION = '3.3.6';

  ScrollSpy.DEFAULTS = {
    offset: 10
  };

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight);
  };

  ScrollSpy.prototype.refresh = function () {
    var that = this;
    var offsetMethod = 'offset';
    var offsetBase = 0;

    this.offsets = [];
    this.targets = [];
    this.scrollHeight = this.getScrollHeight();

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position';
      offsetBase = this.$scrollElement.scrollTop();
    }

    this.$body.find(this.selector).map(function () {
      var $el = $(this);
      var href = $el.data('target') || $el.attr('href');
      var $href = /^#./.test(href) && $(href);

      return $href && $href.length && $href.is(':visible') && [[$href[offsetMethod]().top + offsetBase, href]] || null;
    }).sort(function (a, b) {
      return a[0] - b[0];
    }).each(function () {
      that.offsets.push(this[0]);
      that.targets.push(this[1]);
    });
  };

  ScrollSpy.prototype.process = function () {
    var scrollTop = this.$scrollElement.scrollTop() + this.options.offset;
    var scrollHeight = this.getScrollHeight();
    var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height();
    var offsets = this.offsets;
    var targets = this.targets;
    var activeTarget = this.activeTarget;
    var i;

    if (this.scrollHeight != scrollHeight) {
      this.refresh();
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i);
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null;
      return this.clear();
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i] && scrollTop >= offsets[i] && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1]) && this.activate(targets[i]);
    }
  };

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target;

    this.clear();

    var selector = this.selector + '[data-target="' + target + '"],' + this.selector + '[href="' + target + '"]';

    var active = $(selector).parents('li').addClass('active');

    if (active.parent('.dropdown-menu').length) {
      active = active.closest('li.dropdown').addClass('active');
    }

    active.trigger('activate.bs.scrollspy');
  };

  ScrollSpy.prototype.clear = function () {
    $(this.selector).parentsUntil(this.options.target, '.active').removeClass('active');
  };

  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.scrollspy');
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      if (!data) $this.data('bs.scrollspy', data = new ScrollSpy(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.scrollspy;

  $.fn.scrollspy = Plugin;
  $.fn.scrollspy.Constructor = ScrollSpy;

  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old;
    return this;
  };

  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this);
      Plugin.call($spy, $spy.data());
    });
  });
}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.6
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function Tab(element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element);
    // jscs:enable requireDollarBeforejQueryAssignment
  };

  Tab.VERSION = '3.3.6';

  Tab.TRANSITION_DURATION = 150;

  Tab.prototype.show = function () {
    var $this = this.element;
    var $ul = $this.closest('ul:not(.dropdown-menu)');
    var selector = $this.data('target');

    if (!selector) {
      selector = $this.attr('href');
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return;

    var $previous = $ul.find('.active:last a');
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    });
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    });

    $previous.trigger(hideEvent);
    $this.trigger(showEvent);

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return;

    var $target = $(selector);

    this.activate($this.closest('li'), $ul);
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      });
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      });
    });
  };

  Tab.prototype.activate = function (element, container, callback) {
    var $active = container.find('> .active');
    var transition = callback && $.support.transition && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length);

    function next() {
      $active.removeClass('active').find('> .dropdown-menu > .active').removeClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', false);

      element.addClass('active').find('[data-toggle="tab"]').attr('aria-expanded', true);

      if (transition) {
        element[0].offsetWidth; // reflow for transition
        element.addClass('in');
      } else {
        element.removeClass('fade');
      }

      if (element.parent('.dropdown-menu').length) {
        element.closest('li.dropdown').addClass('active').end().find('[data-toggle="tab"]').attr('aria-expanded', true);
      }

      callback && callback();
    }

    $active.length && transition ? $active.one('bsTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION) : next();

    $active.removeClass('in');
  };

  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tab');

      if (!data) $this.data('bs.tab', data = new Tab(this));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.tab;

  $.fn.tab = Plugin;
  $.fn.tab.Constructor = Tab;

  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this;
  };

  // TAB DATA-API
  // ============

  var clickHandler = function clickHandler(e) {
    e.preventDefault();
    Plugin.call($(this), 'show');
  };

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler).on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler);
}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.6
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function Affix(element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options);

    this.$target = $(this.options.target).on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this)).on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this));

    this.$element = $(element);
    this.affixed = null;
    this.unpin = null;
    this.pinnedOffset = null;

    this.checkPosition();
  };

  Affix.VERSION = '3.3.6';

  Affix.RESET = 'affix affix-top affix-bottom';

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  };

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop = this.$target.scrollTop();
    var position = this.$element.offset();
    var targetHeight = this.$target.height();

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false;

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return scrollTop + this.unpin <= position.top ? false : 'bottom';
      return scrollTop + targetHeight <= scrollHeight - offsetBottom ? false : 'bottom';
    }

    var initializing = this.affixed == null;
    var colliderTop = initializing ? scrollTop : position.top;
    var colliderHeight = initializing ? targetHeight : height;

    if (offsetTop != null && scrollTop <= offsetTop) return 'top';
    if (offsetBottom != null && colliderTop + colliderHeight >= scrollHeight - offsetBottom) return 'bottom';

    return false;
  };

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset;
    this.$element.removeClass(Affix.RESET).addClass('affix');
    var scrollTop = this.$target.scrollTop();
    var position = this.$element.offset();
    return this.pinnedOffset = position.top - scrollTop;
  };

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1);
  };

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return;

    var height = this.$element.height();
    var offset = this.options.offset;
    var offsetTop = offset.top;
    var offsetBottom = offset.bottom;
    var scrollHeight = Math.max($(document).height(), $(document.body).height());

    if ((typeof offset === 'undefined' ? 'undefined' : _typeof(offset)) != 'object') offsetBottom = offsetTop = offset;
    if (typeof offsetTop == 'function') offsetTop = offset.top(this.$element);
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element);

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom);

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '');

      var affixType = 'affix' + (affix ? '-' + affix : '');
      var e = $.Event(affixType + '.bs.affix');

      this.$element.trigger(e);

      if (e.isDefaultPrevented()) return;

      this.affixed = affix;
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null;

      this.$element.removeClass(Affix.RESET).addClass(affixType).trigger(affixType.replace('affix', 'affixed') + '.bs.affix');
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      });
    }
  };

  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.affix');
      var options = (typeof option === 'undefined' ? 'undefined' : _typeof(option)) == 'object' && option;

      if (!data) $this.data('bs.affix', data = new Affix(this, options));
      if (typeof option == 'string') data[option]();
    });
  }

  var old = $.fn.affix;

  $.fn.affix = Plugin;
  $.fn.affix.Constructor = Affix;

  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old;
    return this;
  };

  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this);
      var data = $spy.data();

      data.offset = data.offset || {};

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom;
      if (data.offsetTop != null) data.offset.top = data.offsetTop;

      Plugin.call($spy, data);
    });
  });
}(jQuery);
});

require.register("web/static/js/chart", function(exports, require, module) {
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/*!
 * Chart.js
 * http://chartjs.org/
 * Version: 2.1.6
 *
 * Copyright 2016 Nick Downie
 * Released under the MIT license
 * https://github.com/chartjs/Chart.js/blob/master/LICENSE.md
 */(function(f){if((typeof exports==="undefined"?"undefined":_typeof(exports))==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else{var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else{g=this;}g.Chart=f();}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f;}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++){s(r[o]);}return s;}({1:[function(require,module,exports){},{}],2:[function(require,module,exports){/* MIT license */var colorNames=require(6);module.exports={getRgba:getRgba,getHsla:getHsla,getRgb:getRgb,getHsl:getHsl,getHwb:getHwb,getAlpha:getAlpha,hexString:hexString,rgbString:rgbString,rgbaString:rgbaString,percentString:percentString,percentaString:percentaString,hslString:hslString,hslaString:hslaString,hwbString:hwbString,keyword:keyword};function getRgba(string){if(!string){return;}var abbr=/^#([a-fA-F0-9]{3})$/,hex=/^#([a-fA-F0-9]{6})$/,rgba=/^rgba?\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,per=/^rgba?\(\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*,\s*([+-]?[\d\.]+)\%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)$/,keyword=/(\w+)/;var rgb=[0,0,0],a=1,match=string.match(abbr);if(match){match=match[1];for(var i=0;i<rgb.length;i++){rgb[i]=parseInt(match[i]+match[i],16);}}else if(match=string.match(hex)){match=match[1];for(var i=0;i<rgb.length;i++){rgb[i]=parseInt(match.slice(i*2,i*2+2),16);}}else if(match=string.match(rgba)){for(var i=0;i<rgb.length;i++){rgb[i]=parseInt(match[i+1]);}a=parseFloat(match[4]);}else if(match=string.match(per)){for(var i=0;i<rgb.length;i++){rgb[i]=Math.round(parseFloat(match[i+1])*2.55);}a=parseFloat(match[4]);}else if(match=string.match(keyword)){if(match[1]=="transparent"){return[0,0,0,0];}rgb=colorNames[match[1]];if(!rgb){return;}}for(var i=0;i<rgb.length;i++){rgb[i]=scale(rgb[i],0,255);}if(!a&&a!=0){a=1;}else{a=scale(a,0,1);}rgb[3]=a;return rgb;}function getHsla(string){if(!string){return;}var hsl=/^hsla?\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;var match=string.match(hsl);if(match){var alpha=parseFloat(match[4]);var h=scale(parseInt(match[1]),0,360),s=scale(parseFloat(match[2]),0,100),l=scale(parseFloat(match[3]),0,100),a=scale(isNaN(alpha)?1:alpha,0,1);return[h,s,l,a];}}function getHwb(string){if(!string){return;}var hwb=/^hwb\(\s*([+-]?\d+)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?[\d\.]+)\s*)?\)/;var match=string.match(hwb);if(match){var alpha=parseFloat(match[4]);var h=scale(parseInt(match[1]),0,360),w=scale(parseFloat(match[2]),0,100),b=scale(parseFloat(match[3]),0,100),a=scale(isNaN(alpha)?1:alpha,0,1);return[h,w,b,a];}}function getRgb(string){var rgba=getRgba(string);return rgba&&rgba.slice(0,3);}function getHsl(string){var hsla=getHsla(string);return hsla&&hsla.slice(0,3);}function getAlpha(string){var vals=getRgba(string);if(vals){return vals[3];}else if(vals=getHsla(string)){return vals[3];}else if(vals=getHwb(string)){return vals[3];}}// generators
function hexString(rgb){return"#"+hexDouble(rgb[0])+hexDouble(rgb[1])+hexDouble(rgb[2]);}function rgbString(rgba,alpha){if(alpha<1||rgba[3]&&rgba[3]<1){return rgbaString(rgba,alpha);}return"rgb("+rgba[0]+", "+rgba[1]+", "+rgba[2]+")";}function rgbaString(rgba,alpha){if(alpha===undefined){alpha=rgba[3]!==undefined?rgba[3]:1;}return"rgba("+rgba[0]+", "+rgba[1]+", "+rgba[2]+", "+alpha+")";}function percentString(rgba,alpha){if(alpha<1||rgba[3]&&rgba[3]<1){return percentaString(rgba,alpha);}var r=Math.round(rgba[0]/255*100),g=Math.round(rgba[1]/255*100),b=Math.round(rgba[2]/255*100);return"rgb("+r+"%, "+g+"%, "+b+"%)";}function percentaString(rgba,alpha){var r=Math.round(rgba[0]/255*100),g=Math.round(rgba[1]/255*100),b=Math.round(rgba[2]/255*100);return"rgba("+r+"%, "+g+"%, "+b+"%, "+(alpha||rgba[3]||1)+")";}function hslString(hsla,alpha){if(alpha<1||hsla[3]&&hsla[3]<1){return hslaString(hsla,alpha);}return"hsl("+hsla[0]+", "+hsla[1]+"%, "+hsla[2]+"%)";}function hslaString(hsla,alpha){if(alpha===undefined){alpha=hsla[3]!==undefined?hsla[3]:1;}return"hsla("+hsla[0]+", "+hsla[1]+"%, "+hsla[2]+"%, "+alpha+")";}// hwb is a bit different than rgb(a) & hsl(a) since there is no alpha specific syntax
// (hwb have alpha optional & 1 is default value)
function hwbString(hwb,alpha){if(alpha===undefined){alpha=hwb[3]!==undefined?hwb[3]:1;}return"hwb("+hwb[0]+", "+hwb[1]+"%, "+hwb[2]+"%"+(alpha!==undefined&&alpha!==1?", "+alpha:"")+")";}function keyword(rgb){return reverseNames[rgb.slice(0,3)];}// helpers
function scale(num,min,max){return Math.min(Math.max(min,num),max);}function hexDouble(num){var str=num.toString(16).toUpperCase();return str.length<2?"0"+str:str;}//create a list of reverse color names
var reverseNames={};for(var name in colorNames){reverseNames[colorNames[name]]=name;}},{"6":6}],3:[function(require,module,exports){/* MIT license */var convert=require(5);var string=require(2);var Color=function Color(obj){if(obj instanceof Color){return obj;}if(!(this instanceof Color)){return new Color(obj);}this.values={rgb:[0,0,0],hsl:[0,0,0],hsv:[0,0,0],hwb:[0,0,0],cmyk:[0,0,0,0],alpha:1};// parse Color() argument
var vals;if(typeof obj==='string'){vals=string.getRgba(obj);if(vals){this.setValues('rgb',vals);}else if(vals=string.getHsla(obj)){this.setValues('hsl',vals);}else if(vals=string.getHwb(obj)){this.setValues('hwb',vals);}else{throw new Error('Unable to parse color from string "'+obj+'"');}}else if((typeof obj==="undefined"?"undefined":_typeof(obj))==='object'){vals=obj;if(vals.r!==undefined||vals.red!==undefined){this.setValues('rgb',vals);}else if(vals.l!==undefined||vals.lightness!==undefined){this.setValues('hsl',vals);}else if(vals.v!==undefined||vals.value!==undefined){this.setValues('hsv',vals);}else if(vals.w!==undefined||vals.whiteness!==undefined){this.setValues('hwb',vals);}else if(vals.c!==undefined||vals.cyan!==undefined){this.setValues('cmyk',vals);}else{throw new Error('Unable to parse color from object '+JSON.stringify(obj));}}};Color.prototype={rgb:function rgb(){return this.setSpace('rgb',arguments);},hsl:function hsl(){return this.setSpace('hsl',arguments);},hsv:function hsv(){return this.setSpace('hsv',arguments);},hwb:function hwb(){return this.setSpace('hwb',arguments);},cmyk:function cmyk(){return this.setSpace('cmyk',arguments);},rgbArray:function rgbArray(){return this.values.rgb;},hslArray:function hslArray(){return this.values.hsl;},hsvArray:function hsvArray(){return this.values.hsv;},hwbArray:function hwbArray(){var values=this.values;if(values.alpha!==1){return values.hwb.concat([values.alpha]);}return values.hwb;},cmykArray:function cmykArray(){return this.values.cmyk;},rgbaArray:function rgbaArray(){var values=this.values;return values.rgb.concat([values.alpha]);},hslaArray:function hslaArray(){var values=this.values;return values.hsl.concat([values.alpha]);},alpha:function alpha(val){if(val===undefined){return this.values.alpha;}this.setValues('alpha',val);return this;},red:function red(val){return this.setChannel('rgb',0,val);},green:function green(val){return this.setChannel('rgb',1,val);},blue:function blue(val){return this.setChannel('rgb',2,val);},hue:function hue(val){if(val){val%=360;val=val<0?360+val:val;}return this.setChannel('hsl',0,val);},saturation:function saturation(val){return this.setChannel('hsl',1,val);},lightness:function lightness(val){return this.setChannel('hsl',2,val);},saturationv:function saturationv(val){return this.setChannel('hsv',1,val);},whiteness:function whiteness(val){return this.setChannel('hwb',1,val);},blackness:function blackness(val){return this.setChannel('hwb',2,val);},value:function value(val){return this.setChannel('hsv',2,val);},cyan:function cyan(val){return this.setChannel('cmyk',0,val);},magenta:function magenta(val){return this.setChannel('cmyk',1,val);},yellow:function yellow(val){return this.setChannel('cmyk',2,val);},black:function black(val){return this.setChannel('cmyk',3,val);},hexString:function hexString(){return string.hexString(this.values.rgb);},rgbString:function rgbString(){return string.rgbString(this.values.rgb,this.values.alpha);},rgbaString:function rgbaString(){return string.rgbaString(this.values.rgb,this.values.alpha);},percentString:function percentString(){return string.percentString(this.values.rgb,this.values.alpha);},hslString:function hslString(){return string.hslString(this.values.hsl,this.values.alpha);},hslaString:function hslaString(){return string.hslaString(this.values.hsl,this.values.alpha);},hwbString:function hwbString(){return string.hwbString(this.values.hwb,this.values.alpha);},keyword:function keyword(){return string.keyword(this.values.rgb,this.values.alpha);},rgbNumber:function rgbNumber(){var rgb=this.values.rgb;return rgb[0]<<16|rgb[1]<<8|rgb[2];},luminosity:function luminosity(){// http://www.w3.org/TR/WCAG20/#relativeluminancedef
var rgb=this.values.rgb;var lum=[];for(var i=0;i<rgb.length;i++){var chan=rgb[i]/255;lum[i]=chan<=0.03928?chan/12.92:Math.pow((chan+0.055)/1.055,2.4);}return 0.2126*lum[0]+0.7152*lum[1]+0.0722*lum[2];},contrast:function contrast(color2){// http://www.w3.org/TR/WCAG20/#contrast-ratiodef
var lum1=this.luminosity();var lum2=color2.luminosity();if(lum1>lum2){return(lum1+0.05)/(lum2+0.05);}return(lum2+0.05)/(lum1+0.05);},level:function level(color2){var contrastRatio=this.contrast(color2);if(contrastRatio>=7.1){return'AAA';}return contrastRatio>=4.5?'AA':'';},dark:function dark(){// YIQ equation from http://24ways.org/2010/calculating-color-contrast
var rgb=this.values.rgb;var yiq=(rgb[0]*299+rgb[1]*587+rgb[2]*114)/1000;return yiq<128;},light:function light(){return!this.dark();},negate:function negate(){var rgb=[];for(var i=0;i<3;i++){rgb[i]=255-this.values.rgb[i];}this.setValues('rgb',rgb);return this;},lighten:function lighten(ratio){var hsl=this.values.hsl;hsl[2]+=hsl[2]*ratio;this.setValues('hsl',hsl);return this;},darken:function darken(ratio){var hsl=this.values.hsl;hsl[2]-=hsl[2]*ratio;this.setValues('hsl',hsl);return this;},saturate:function saturate(ratio){var hsl=this.values.hsl;hsl[1]+=hsl[1]*ratio;this.setValues('hsl',hsl);return this;},desaturate:function desaturate(ratio){var hsl=this.values.hsl;hsl[1]-=hsl[1]*ratio;this.setValues('hsl',hsl);return this;},whiten:function whiten(ratio){var hwb=this.values.hwb;hwb[1]+=hwb[1]*ratio;this.setValues('hwb',hwb);return this;},blacken:function blacken(ratio){var hwb=this.values.hwb;hwb[2]+=hwb[2]*ratio;this.setValues('hwb',hwb);return this;},greyscale:function greyscale(){var rgb=this.values.rgb;// http://en.wikipedia.org/wiki/Grayscale#Converting_color_to_grayscale
var val=rgb[0]*0.3+rgb[1]*0.59+rgb[2]*0.11;this.setValues('rgb',[val,val,val]);return this;},clearer:function clearer(ratio){var alpha=this.values.alpha;this.setValues('alpha',alpha-alpha*ratio);return this;},opaquer:function opaquer(ratio){var alpha=this.values.alpha;this.setValues('alpha',alpha+alpha*ratio);return this;},rotate:function rotate(degrees){var hsl=this.values.hsl;var hue=(hsl[0]+degrees)%360;hsl[0]=hue<0?360+hue:hue;this.setValues('hsl',hsl);return this;},/**
	 * Ported from sass implementation in C
	 * https://github.com/sass/libsass/blob/0e6b4a2850092356aa3ece07c6b249f0221caced/functions.cpp#L209
	 */mix:function mix(mixinColor,weight){var color1=this;var color2=mixinColor;var p=weight===undefined?0.5:weight;var w=2*p-1;var a=color1.alpha()-color2.alpha();var w1=((w*a===-1?w:(w+a)/(1+w*a))+1)/2.0;var w2=1-w1;return this.rgb(w1*color1.red()+w2*color2.red(),w1*color1.green()+w2*color2.green(),w1*color1.blue()+w2*color2.blue()).alpha(color1.alpha()*p+color2.alpha()*(1-p));},toJSON:function toJSON(){return this.rgb();},clone:function clone(){// NOTE(SB): using node-clone creates a dependency to Buffer when using browserify,
// making the final build way to big to embed in Chart.js. So let's do it manually,
// assuming that values to clone are 1 dimension arrays containing only numbers,
// except 'alpha' which is a number.
var result=new Color();var source=this.values;var target=result.values;var value,type;for(var prop in source){if(source.hasOwnProperty(prop)){value=source[prop];type={}.toString.call(value);if(type==='[object Array]'){target[prop]=value.slice(0);}else if(type==='[object Number]'){target[prop]=value;}else{console.error('unexpected color value:',value);}}}return result;}};Color.prototype.spaces={rgb:['red','green','blue'],hsl:['hue','saturation','lightness'],hsv:['hue','saturation','value'],hwb:['hue','whiteness','blackness'],cmyk:['cyan','magenta','yellow','black']};Color.prototype.maxes={rgb:[255,255,255],hsl:[360,100,100],hsv:[360,100,100],hwb:[360,100,100],cmyk:[100,100,100,100]};Color.prototype.getValues=function(space){var values=this.values;var vals={};for(var i=0;i<space.length;i++){vals[space.charAt(i)]=values[space][i];}if(values.alpha!==1){vals.a=values.alpha;}// {r: 255, g: 255, b: 255, a: 0.4}
return vals;};Color.prototype.setValues=function(space,vals){var values=this.values;var spaces=this.spaces;var maxes=this.maxes;var alpha=1;var i;if(space==='alpha'){alpha=vals;}else if(vals.length){// [10, 10, 10]
values[space]=vals.slice(0,space.length);alpha=vals[space.length];}else if(vals[space.charAt(0)]!==undefined){// {r: 10, g: 10, b: 10}
for(i=0;i<space.length;i++){values[space][i]=vals[space.charAt(i)];}alpha=vals.a;}else if(vals[spaces[space][0]]!==undefined){// {red: 10, green: 10, blue: 10}
var chans=spaces[space];for(i=0;i<space.length;i++){values[space][i]=vals[chans[i]];}alpha=vals.alpha;}values.alpha=Math.max(0,Math.min(1,alpha===undefined?values.alpha:alpha));if(space==='alpha'){return false;}var capped;// cap values of the space prior converting all values
for(i=0;i<space.length;i++){capped=Math.max(0,Math.min(maxes[space][i],values[space][i]));values[space][i]=Math.round(capped);}// convert to all the other color spaces
for(var sname in spaces){if(sname!==space){values[sname]=convert[space][sname](values[space]);}}return true;};Color.prototype.setSpace=function(space,args){var vals=args[0];if(vals===undefined){// color.rgb()
return this.getValues(space);}// color.rgb(10, 10, 10)
if(typeof vals==='number'){vals=Array.prototype.slice.call(args);}this.setValues(space,vals);return this;};Color.prototype.setChannel=function(space,index,val){var svalues=this.values[space];if(val===undefined){// color.red()
return svalues[index];}else if(val===svalues[index]){// color.red(color.red())
return this;}// color.red(100)
svalues[index]=val;this.setValues(space,svalues);return this;};if(typeof window!=='undefined'){window.Color=Color;}module.exports=Color;},{"2":2,"5":5}],4:[function(require,module,exports){/* MIT license */module.exports={rgb2hsl:rgb2hsl,rgb2hsv:rgb2hsv,rgb2hwb:rgb2hwb,rgb2cmyk:rgb2cmyk,rgb2keyword:rgb2keyword,rgb2xyz:rgb2xyz,rgb2lab:rgb2lab,rgb2lch:rgb2lch,hsl2rgb:hsl2rgb,hsl2hsv:hsl2hsv,hsl2hwb:hsl2hwb,hsl2cmyk:hsl2cmyk,hsl2keyword:hsl2keyword,hsv2rgb:hsv2rgb,hsv2hsl:hsv2hsl,hsv2hwb:hsv2hwb,hsv2cmyk:hsv2cmyk,hsv2keyword:hsv2keyword,hwb2rgb:hwb2rgb,hwb2hsl:hwb2hsl,hwb2hsv:hwb2hsv,hwb2cmyk:hwb2cmyk,hwb2keyword:hwb2keyword,cmyk2rgb:cmyk2rgb,cmyk2hsl:cmyk2hsl,cmyk2hsv:cmyk2hsv,cmyk2hwb:cmyk2hwb,cmyk2keyword:cmyk2keyword,keyword2rgb:keyword2rgb,keyword2hsl:keyword2hsl,keyword2hsv:keyword2hsv,keyword2hwb:keyword2hwb,keyword2cmyk:keyword2cmyk,keyword2lab:keyword2lab,keyword2xyz:keyword2xyz,xyz2rgb:xyz2rgb,xyz2lab:xyz2lab,xyz2lch:xyz2lch,lab2xyz:lab2xyz,lab2rgb:lab2rgb,lab2lch:lab2lch,lch2lab:lch2lab,lch2xyz:lch2xyz,lch2rgb:lch2rgb};function rgb2hsl(rgb){var r=rgb[0]/255,g=rgb[1]/255,b=rgb[2]/255,min=Math.min(r,g,b),max=Math.max(r,g,b),delta=max-min,h,s,l;if(max==min)h=0;else if(r==max)h=(g-b)/delta;else if(g==max)h=2+(b-r)/delta;else if(b==max)h=4+(r-g)/delta;h=Math.min(h*60,360);if(h<0)h+=360;l=(min+max)/2;if(max==min)s=0;else if(l<=0.5)s=delta/(max+min);else s=delta/(2-max-min);return[h,s*100,l*100];}function rgb2hsv(rgb){var r=rgb[0],g=rgb[1],b=rgb[2],min=Math.min(r,g,b),max=Math.max(r,g,b),delta=max-min,h,s,v;if(max==0)s=0;else s=delta/max*1000/10;if(max==min)h=0;else if(r==max)h=(g-b)/delta;else if(g==max)h=2+(b-r)/delta;else if(b==max)h=4+(r-g)/delta;h=Math.min(h*60,360);if(h<0)h+=360;v=max/255*1000/10;return[h,s,v];}function rgb2hwb(rgb){var r=rgb[0],g=rgb[1],b=rgb[2],h=rgb2hsl(rgb)[0],w=1/255*Math.min(r,Math.min(g,b)),b=1-1/255*Math.max(r,Math.max(g,b));return[h,w*100,b*100];}function rgb2cmyk(rgb){var r=rgb[0]/255,g=rgb[1]/255,b=rgb[2]/255,c,m,y,k;k=Math.min(1-r,1-g,1-b);c=(1-r-k)/(1-k)||0;m=(1-g-k)/(1-k)||0;y=(1-b-k)/(1-k)||0;return[c*100,m*100,y*100,k*100];}function rgb2keyword(rgb){return reverseKeywords[JSON.stringify(rgb)];}function rgb2xyz(rgb){var r=rgb[0]/255,g=rgb[1]/255,b=rgb[2]/255;// assume sRGB
r=r>0.04045?Math.pow((r+0.055)/1.055,2.4):r/12.92;g=g>0.04045?Math.pow((g+0.055)/1.055,2.4):g/12.92;b=b>0.04045?Math.pow((b+0.055)/1.055,2.4):b/12.92;var x=r*0.4124+g*0.3576+b*0.1805;var y=r*0.2126+g*0.7152+b*0.0722;var z=r*0.0193+g*0.1192+b*0.9505;return[x*100,y*100,z*100];}function rgb2lab(rgb){var xyz=rgb2xyz(rgb),x=xyz[0],y=xyz[1],z=xyz[2],l,a,b;x/=95.047;y/=100;z/=108.883;x=x>0.008856?Math.pow(x,1/3):7.787*x+16/116;y=y>0.008856?Math.pow(y,1/3):7.787*y+16/116;z=z>0.008856?Math.pow(z,1/3):7.787*z+16/116;l=116*y-16;a=500*(x-y);b=200*(y-z);return[l,a,b];}function rgb2lch(args){return lab2lch(rgb2lab(args));}function hsl2rgb(hsl){var h=hsl[0]/360,s=hsl[1]/100,l=hsl[2]/100,t1,t2,t3,rgb,val;if(s==0){val=l*255;return[val,val,val];}if(l<0.5)t2=l*(1+s);else t2=l+s-l*s;t1=2*l-t2;rgb=[0,0,0];for(var i=0;i<3;i++){t3=h+1/3*-(i-1);t3<0&&t3++;t3>1&&t3--;if(6*t3<1)val=t1+(t2-t1)*6*t3;else if(2*t3<1)val=t2;else if(3*t3<2)val=t1+(t2-t1)*(2/3-t3)*6;else val=t1;rgb[i]=val*255;}return rgb;}function hsl2hsv(hsl){var h=hsl[0],s=hsl[1]/100,l=hsl[2]/100,sv,v;if(l===0){// no need to do calc on black
// also avoids divide by 0 error
return[0,0,0];}l*=2;s*=l<=1?l:2-l;v=(l+s)/2;sv=2*s/(l+s);return[h,sv*100,v*100];}function hsl2hwb(args){return rgb2hwb(hsl2rgb(args));}function hsl2cmyk(args){return rgb2cmyk(hsl2rgb(args));}function hsl2keyword(args){return rgb2keyword(hsl2rgb(args));}function hsv2rgb(hsv){var h=hsv[0]/60,s=hsv[1]/100,v=hsv[2]/100,hi=Math.floor(h)%6;var f=h-Math.floor(h),p=255*v*(1-s),q=255*v*(1-s*f),t=255*v*(1-s*(1-f)),v=255*v;switch(hi){case 0:return[v,t,p];case 1:return[q,v,p];case 2:return[p,v,t];case 3:return[p,q,v];case 4:return[t,p,v];case 5:return[v,p,q];}}function hsv2hsl(hsv){var h=hsv[0],s=hsv[1]/100,v=hsv[2]/100,sl,l;l=(2-s)*v;sl=s*v;sl/=l<=1?l:2-l;sl=sl||0;l/=2;return[h,sl*100,l*100];}function hsv2hwb(args){return rgb2hwb(hsv2rgb(args));}function hsv2cmyk(args){return rgb2cmyk(hsv2rgb(args));}function hsv2keyword(args){return rgb2keyword(hsv2rgb(args));}// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
function hwb2rgb(hwb){var h=hwb[0]/360,wh=hwb[1]/100,bl=hwb[2]/100,ratio=wh+bl,i,v,f,n;// wh + bl cant be > 1
if(ratio>1){wh/=ratio;bl/=ratio;}i=Math.floor(6*h);v=1-bl;f=6*h-i;if((i&0x01)!=0){f=1-f;}n=wh+f*(v-wh);// linear interpolation
switch(i){default:case 6:case 0:r=v;g=n;b=wh;break;case 1:r=n;g=v;b=wh;break;case 2:r=wh;g=v;b=n;break;case 3:r=wh;g=n;b=v;break;case 4:r=n;g=wh;b=v;break;case 5:r=v;g=wh;b=n;break;}return[r*255,g*255,b*255];}function hwb2hsl(args){return rgb2hsl(hwb2rgb(args));}function hwb2hsv(args){return rgb2hsv(hwb2rgb(args));}function hwb2cmyk(args){return rgb2cmyk(hwb2rgb(args));}function hwb2keyword(args){return rgb2keyword(hwb2rgb(args));}function cmyk2rgb(cmyk){var c=cmyk[0]/100,m=cmyk[1]/100,y=cmyk[2]/100,k=cmyk[3]/100,r,g,b;r=1-Math.min(1,c*(1-k)+k);g=1-Math.min(1,m*(1-k)+k);b=1-Math.min(1,y*(1-k)+k);return[r*255,g*255,b*255];}function cmyk2hsl(args){return rgb2hsl(cmyk2rgb(args));}function cmyk2hsv(args){return rgb2hsv(cmyk2rgb(args));}function cmyk2hwb(args){return rgb2hwb(cmyk2rgb(args));}function cmyk2keyword(args){return rgb2keyword(cmyk2rgb(args));}function xyz2rgb(xyz){var x=xyz[0]/100,y=xyz[1]/100,z=xyz[2]/100,r,g,b;r=x*3.2406+y*-1.5372+z*-0.4986;g=x*-0.9689+y*1.8758+z*0.0415;b=x*0.0557+y*-0.2040+z*1.0570;// assume sRGB
r=r>0.0031308?1.055*Math.pow(r,1.0/2.4)-0.055:r=r*12.92;g=g>0.0031308?1.055*Math.pow(g,1.0/2.4)-0.055:g=g*12.92;b=b>0.0031308?1.055*Math.pow(b,1.0/2.4)-0.055:b=b*12.92;r=Math.min(Math.max(0,r),1);g=Math.min(Math.max(0,g),1);b=Math.min(Math.max(0,b),1);return[r*255,g*255,b*255];}function xyz2lab(xyz){var x=xyz[0],y=xyz[1],z=xyz[2],l,a,b;x/=95.047;y/=100;z/=108.883;x=x>0.008856?Math.pow(x,1/3):7.787*x+16/116;y=y>0.008856?Math.pow(y,1/3):7.787*y+16/116;z=z>0.008856?Math.pow(z,1/3):7.787*z+16/116;l=116*y-16;a=500*(x-y);b=200*(y-z);return[l,a,b];}function xyz2lch(args){return lab2lch(xyz2lab(args));}function lab2xyz(lab){var l=lab[0],a=lab[1],b=lab[2],x,y,z,y2;if(l<=8){y=l*100/903.3;y2=7.787*(y/100)+16/116;}else{y=100*Math.pow((l+16)/116,3);y2=Math.pow(y/100,1/3);}x=x/95.047<=0.008856?x=95.047*(a/500+y2-16/116)/7.787:95.047*Math.pow(a/500+y2,3);z=z/108.883<=0.008859?z=108.883*(y2-b/200-16/116)/7.787:108.883*Math.pow(y2-b/200,3);return[x,y,z];}function lab2lch(lab){var l=lab[0],a=lab[1],b=lab[2],hr,h,c;hr=Math.atan2(b,a);h=hr*360/2/Math.PI;if(h<0){h+=360;}c=Math.sqrt(a*a+b*b);return[l,c,h];}function lab2rgb(args){return xyz2rgb(lab2xyz(args));}function lch2lab(lch){var l=lch[0],c=lch[1],h=lch[2],a,b,hr;hr=h/360*2*Math.PI;a=c*Math.cos(hr);b=c*Math.sin(hr);return[l,a,b];}function lch2xyz(args){return lab2xyz(lch2lab(args));}function lch2rgb(args){return lab2rgb(lch2lab(args));}function keyword2rgb(keyword){return cssKeywords[keyword];}function keyword2hsl(args){return rgb2hsl(keyword2rgb(args));}function keyword2hsv(args){return rgb2hsv(keyword2rgb(args));}function keyword2hwb(args){return rgb2hwb(keyword2rgb(args));}function keyword2cmyk(args){return rgb2cmyk(keyword2rgb(args));}function keyword2lab(args){return rgb2lab(keyword2rgb(args));}function keyword2xyz(args){return rgb2xyz(keyword2rgb(args));}var cssKeywords={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],grey:[128,128,128],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],rebeccapurple:[102,51,153],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]};var reverseKeywords={};for(var key in cssKeywords){reverseKeywords[JSON.stringify(cssKeywords[key])]=key;}},{}],5:[function(require,module,exports){var conversions=require(4);var convert=function convert(){return new Converter();};for(var func in conversions){// export Raw versions
convert[func+"Raw"]=function(func){// accept array or plain args
return function(arg){if(typeof arg=="number")arg=Array.prototype.slice.call(arguments);return conversions[func](arg);};}(func);var pair=/(\w+)2(\w+)/.exec(func),from=pair[1],to=pair[2];// export rgb2hsl and ["rgb"]["hsl"]
convert[from]=convert[from]||{};convert[from][to]=convert[func]=function(func){return function(arg){if(typeof arg=="number")arg=Array.prototype.slice.call(arguments);var val=conversions[func](arg);if(typeof val=="string"||val===undefined)return val;// keyword
for(var i=0;i<val.length;i++){val[i]=Math.round(val[i]);}return val;};}(func);}/* Converter does lazy conversion and caching */var Converter=function Converter(){this.convs={};};/* Either get the values for a space or
  set the values for a space, depending on args */Converter.prototype.routeSpace=function(space,args){var values=args[0];if(values===undefined){// color.rgb()
return this.getValues(space);}// color.rgb(10, 10, 10)
if(typeof values=="number"){values=Array.prototype.slice.call(args);}return this.setValues(space,values);};/* Set the values for a space, invalidating cache */Converter.prototype.setValues=function(space,values){this.space=space;this.convs={};this.convs[space]=values;return this;};/* Get the values for a space. If there's already
  a conversion for the space, fetch it, otherwise
  compute it */Converter.prototype.getValues=function(space){var vals=this.convs[space];if(!vals){var fspace=this.space,from=this.convs[fspace];vals=convert[fspace][space](from);this.convs[space]=vals;}return vals;};["rgb","hsl","hsv","cmyk","keyword"].forEach(function(space){Converter.prototype[space]=function(vals){return this.routeSpace(space,arguments);};});module.exports=convert;},{"4":4}],6:[function(require,module,exports){module.exports={"aliceblue":[240,248,255],"antiquewhite":[250,235,215],"aqua":[0,255,255],"aquamarine":[127,255,212],"azure":[240,255,255],"beige":[245,245,220],"bisque":[255,228,196],"black":[0,0,0],"blanchedalmond":[255,235,205],"blue":[0,0,255],"blueviolet":[138,43,226],"brown":[165,42,42],"burlywood":[222,184,135],"cadetblue":[95,158,160],"chartreuse":[127,255,0],"chocolate":[210,105,30],"coral":[255,127,80],"cornflowerblue":[100,149,237],"cornsilk":[255,248,220],"crimson":[220,20,60],"cyan":[0,255,255],"darkblue":[0,0,139],"darkcyan":[0,139,139],"darkgoldenrod":[184,134,11],"darkgray":[169,169,169],"darkgreen":[0,100,0],"darkgrey":[169,169,169],"darkkhaki":[189,183,107],"darkmagenta":[139,0,139],"darkolivegreen":[85,107,47],"darkorange":[255,140,0],"darkorchid":[153,50,204],"darkred":[139,0,0],"darksalmon":[233,150,122],"darkseagreen":[143,188,143],"darkslateblue":[72,61,139],"darkslategray":[47,79,79],"darkslategrey":[47,79,79],"darkturquoise":[0,206,209],"darkviolet":[148,0,211],"deeppink":[255,20,147],"deepskyblue":[0,191,255],"dimgray":[105,105,105],"dimgrey":[105,105,105],"dodgerblue":[30,144,255],"firebrick":[178,34,34],"floralwhite":[255,250,240],"forestgreen":[34,139,34],"fuchsia":[255,0,255],"gainsboro":[220,220,220],"ghostwhite":[248,248,255],"gold":[255,215,0],"goldenrod":[218,165,32],"gray":[128,128,128],"green":[0,128,0],"greenyellow":[173,255,47],"grey":[128,128,128],"honeydew":[240,255,240],"hotpink":[255,105,180],"indianred":[205,92,92],"indigo":[75,0,130],"ivory":[255,255,240],"khaki":[240,230,140],"lavender":[230,230,250],"lavenderblush":[255,240,245],"lawngreen":[124,252,0],"lemonchiffon":[255,250,205],"lightblue":[173,216,230],"lightcoral":[240,128,128],"lightcyan":[224,255,255],"lightgoldenrodyellow":[250,250,210],"lightgray":[211,211,211],"lightgreen":[144,238,144],"lightgrey":[211,211,211],"lightpink":[255,182,193],"lightsalmon":[255,160,122],"lightseagreen":[32,178,170],"lightskyblue":[135,206,250],"lightslategray":[119,136,153],"lightslategrey":[119,136,153],"lightsteelblue":[176,196,222],"lightyellow":[255,255,224],"lime":[0,255,0],"limegreen":[50,205,50],"linen":[250,240,230],"magenta":[255,0,255],"maroon":[128,0,0],"mediumaquamarine":[102,205,170],"mediumblue":[0,0,205],"mediumorchid":[186,85,211],"mediumpurple":[147,112,219],"mediumseagreen":[60,179,113],"mediumslateblue":[123,104,238],"mediumspringgreen":[0,250,154],"mediumturquoise":[72,209,204],"mediumvioletred":[199,21,133],"midnightblue":[25,25,112],"mintcream":[245,255,250],"mistyrose":[255,228,225],"moccasin":[255,228,181],"navajowhite":[255,222,173],"navy":[0,0,128],"oldlace":[253,245,230],"olive":[128,128,0],"olivedrab":[107,142,35],"orange":[255,165,0],"orangered":[255,69,0],"orchid":[218,112,214],"palegoldenrod":[238,232,170],"palegreen":[152,251,152],"paleturquoise":[175,238,238],"palevioletred":[219,112,147],"papayawhip":[255,239,213],"peachpuff":[255,218,185],"peru":[205,133,63],"pink":[255,192,203],"plum":[221,160,221],"powderblue":[176,224,230],"purple":[128,0,128],"rebeccapurple":[102,51,153],"red":[255,0,0],"rosybrown":[188,143,143],"royalblue":[65,105,225],"saddlebrown":[139,69,19],"salmon":[250,128,114],"sandybrown":[244,164,96],"seagreen":[46,139,87],"seashell":[255,245,238],"sienna":[160,82,45],"silver":[192,192,192],"skyblue":[135,206,235],"slateblue":[106,90,205],"slategray":[112,128,144],"slategrey":[112,128,144],"snow":[255,250,250],"springgreen":[0,255,127],"steelblue":[70,130,180],"tan":[210,180,140],"teal":[0,128,128],"thistle":[216,191,216],"tomato":[255,99,71],"turquoise":[64,224,208],"violet":[238,130,238],"wheat":[245,222,179],"white":[255,255,255],"whitesmoke":[245,245,245],"yellow":[255,255,0],"yellowgreen":[154,205,50]};},{}],7:[function(require,module,exports){/**
 * @namespace Chart
 */var Chart=require(26)();require(25)(Chart);require(24)(Chart);require(21)(Chart);require(22)(Chart);require(23)(Chart);require(27)(Chart);require(31)(Chart);require(29)(Chart);require(30)(Chart);require(32)(Chart);require(28)(Chart);require(33)(Chart);require(34)(Chart);require(35)(Chart);require(36)(Chart);require(37)(Chart);require(40)(Chart);require(38)(Chart);require(39)(Chart);require(41)(Chart);require(42)(Chart);require(43)(Chart);// Controllers must be loaded after elements
// See Chart.core.datasetController.dataElementType
require(15)(Chart);require(16)(Chart);require(17)(Chart);require(18)(Chart);require(19)(Chart);require(20)(Chart);require(8)(Chart);require(9)(Chart);require(10)(Chart);require(11)(Chart);require(12)(Chart);require(13)(Chart);require(14)(Chart);window.Chart=module.exports=Chart;},{"10":10,"11":11,"12":12,"13":13,"14":14,"15":15,"16":16,"17":17,"18":18,"19":19,"20":20,"21":21,"22":22,"23":23,"24":24,"25":25,"26":26,"27":27,"28":28,"29":29,"30":30,"31":31,"32":32,"33":33,"34":34,"35":35,"36":36,"37":37,"38":38,"39":39,"40":40,"41":41,"42":42,"43":43,"8":8,"9":9}],8:[function(require,module,exports){"use strict";module.exports=function(Chart){Chart.Bar=function(context,config){config.type='bar';return new Chart(context,config);};};},{}],9:[function(require,module,exports){"use strict";module.exports=function(Chart){Chart.Bubble=function(context,config){config.type='bubble';return new Chart(context,config);};};},{}],10:[function(require,module,exports){"use strict";module.exports=function(Chart){Chart.Doughnut=function(context,config){config.type='doughnut';return new Chart(context,config);};};},{}],11:[function(require,module,exports){"use strict";module.exports=function(Chart){Chart.Line=function(context,config){config.type='line';return new Chart(context,config);};};},{}],12:[function(require,module,exports){"use strict";module.exports=function(Chart){Chart.PolarArea=function(context,config){config.type='polarArea';return new Chart(context,config);};};},{}],13:[function(require,module,exports){"use strict";module.exports=function(Chart){Chart.Radar=function(context,config){config.options=Chart.helpers.configMerge({aspectRatio:1},config.options);config.type='radar';return new Chart(context,config);};};},{}],14:[function(require,module,exports){"use strict";module.exports=function(Chart){var defaultConfig={hover:{mode:'single'},scales:{xAxes:[{type:"linear",// scatter should not use a category axis
position:"bottom",id:"x-axis-1"// need an ID so datasets can reference the scale
}],yAxes:[{type:"linear",position:"left",id:"y-axis-1"}]},tooltips:{callbacks:{title:function title(tooltipItems,data){// Title doesn't make sense for scatter since we format the data as a point
return'';},label:function label(tooltipItem,data){return'('+tooltipItem.xLabel+', '+tooltipItem.yLabel+')';}}}};// Register the default config for this type
Chart.defaults.scatter=defaultConfig;// Scatter charts use line controllers
Chart.controllers.scatter=Chart.controllers.line;Chart.Scatter=function(context,config){config.type='scatter';return new Chart(context,config);};};},{}],15:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.bar={hover:{mode:"label"},scales:{xAxes:[{type:"category",// Specific to Bar Controller
categoryPercentage:0.8,barPercentage:0.9,// grid line settings
gridLines:{offsetGridLines:true}}],yAxes:[{type:"linear"}]}};Chart.controllers.bar=Chart.DatasetController.extend({dataElementType:Chart.elements.Rectangle,initialize:function initialize(chart,datasetIndex){Chart.DatasetController.prototype.initialize.call(this,chart,datasetIndex);// Use this to indicate that this is a bar dataset.
this.getMeta().bar=true;},// Get the number of datasets that display bars. We use this to correctly calculate the bar width
getBarCount:function getBarCount(){var me=this;var barCount=0;helpers.each(me.chart.data.datasets,function(dataset,datasetIndex){var meta=me.chart.getDatasetMeta(datasetIndex);if(meta.bar&&me.chart.isDatasetVisible(datasetIndex)){++barCount;}},me);return barCount;},update:function update(reset){var me=this;helpers.each(me.getMeta().data,function(rectangle,index){me.updateElement(rectangle,index,reset);},me);},updateElement:function updateElement(rectangle,index,reset){var me=this;var meta=me.getMeta();var xScale=me.getScaleForId(meta.xAxisID);var yScale=me.getScaleForId(meta.yAxisID);var scaleBase=yScale.getBasePixel();var rectangleElementOptions=me.chart.options.elements.rectangle;var custom=rectangle.custom||{};var dataset=me.getDataset();helpers.extend(rectangle,{// Utility
_xScale:xScale,_yScale:yScale,_datasetIndex:me.index,_index:index,// Desired view properties
_model:{x:me.calculateBarX(index,me.index),y:reset?scaleBase:me.calculateBarY(index,me.index),// Tooltip
label:me.chart.data.labels[index],datasetLabel:dataset.label,// Appearance
base:reset?scaleBase:me.calculateBarBase(me.index,index),width:me.calculateBarWidth(index),backgroundColor:custom.backgroundColor?custom.backgroundColor:helpers.getValueAtIndexOrDefault(dataset.backgroundColor,index,rectangleElementOptions.backgroundColor),borderSkipped:custom.borderSkipped?custom.borderSkipped:rectangleElementOptions.borderSkipped,borderColor:custom.borderColor?custom.borderColor:helpers.getValueAtIndexOrDefault(dataset.borderColor,index,rectangleElementOptions.borderColor),borderWidth:custom.borderWidth?custom.borderWidth:helpers.getValueAtIndexOrDefault(dataset.borderWidth,index,rectangleElementOptions.borderWidth)}});rectangle.pivot();},calculateBarBase:function calculateBarBase(datasetIndex,index){var me=this;var meta=me.getMeta();var yScale=me.getScaleForId(meta.yAxisID);var base=0;if(yScale.options.stacked){var chart=me.chart;var datasets=chart.data.datasets;var value=datasets[datasetIndex].data[index];if(value<0){for(var i=0;i<datasetIndex;i++){var negDS=datasets[i];var negDSMeta=chart.getDatasetMeta(i);if(negDSMeta.bar&&negDSMeta.yAxisID===yScale.id&&chart.isDatasetVisible(i)){base+=negDS.data[index]<0?negDS.data[index]:0;}}}else{for(var j=0;j<datasetIndex;j++){var posDS=datasets[j];var posDSMeta=chart.getDatasetMeta(j);if(posDSMeta.bar&&posDSMeta.yAxisID===yScale.id&&chart.isDatasetVisible(j)){base+=posDS.data[index]>0?posDS.data[index]:0;}}}return yScale.getPixelForValue(base);}return yScale.getBasePixel();},getRuler:function getRuler(index){var me=this;var meta=me.getMeta();var xScale=me.getScaleForId(meta.xAxisID);var datasetCount=me.getBarCount();var tickWidth;if(xScale.options.type==='category'){tickWidth=xScale.getPixelForTick(index+1)-xScale.getPixelForTick(index);}else{// Average width
tickWidth=xScale.width/xScale.ticks.length;}var categoryWidth=tickWidth*xScale.options.categoryPercentage;var categorySpacing=(tickWidth-tickWidth*xScale.options.categoryPercentage)/2;var fullBarWidth=categoryWidth/datasetCount;if(xScale.ticks.length!==me.chart.data.labels.length){var perc=xScale.ticks.length/me.chart.data.labels.length;fullBarWidth=fullBarWidth*perc;}var barWidth=fullBarWidth*xScale.options.barPercentage;var barSpacing=fullBarWidth-fullBarWidth*xScale.options.barPercentage;return{datasetCount:datasetCount,tickWidth:tickWidth,categoryWidth:categoryWidth,categorySpacing:categorySpacing,fullBarWidth:fullBarWidth,barWidth:barWidth,barSpacing:barSpacing};},calculateBarWidth:function calculateBarWidth(index){var xScale=this.getScaleForId(this.getMeta().xAxisID);var ruler=this.getRuler(index);return xScale.options.stacked?ruler.categoryWidth:ruler.barWidth;},// Get bar index from the given dataset index accounting for the fact that not all bars are visible
getBarIndex:function getBarIndex(datasetIndex){var barIndex=0;var meta,j;for(j=0;j<datasetIndex;++j){meta=this.chart.getDatasetMeta(j);if(meta.bar&&this.chart.isDatasetVisible(j)){++barIndex;}}return barIndex;},calculateBarX:function calculateBarX(index,datasetIndex){var me=this;var meta=me.getMeta();var xScale=me.getScaleForId(meta.xAxisID);var barIndex=me.getBarIndex(datasetIndex);var ruler=me.getRuler(index);var leftTick=xScale.getPixelForValue(null,index,datasetIndex,me.chart.isCombo);leftTick-=me.chart.isCombo?ruler.tickWidth/2:0;if(xScale.options.stacked){return leftTick+ruler.categoryWidth/2+ruler.categorySpacing;}return leftTick+ruler.barWidth/2+ruler.categorySpacing+ruler.barWidth*barIndex+ruler.barSpacing/2+ruler.barSpacing*barIndex;},calculateBarY:function calculateBarY(index,datasetIndex){var me=this;var meta=me.getMeta();var yScale=me.getScaleForId(meta.yAxisID);var value=me.getDataset().data[index];if(yScale.options.stacked){var sumPos=0,sumNeg=0;for(var i=0;i<datasetIndex;i++){var ds=me.chart.data.datasets[i];var dsMeta=me.chart.getDatasetMeta(i);if(dsMeta.bar&&dsMeta.yAxisID===yScale.id&&me.chart.isDatasetVisible(i)){if(ds.data[index]<0){sumNeg+=ds.data[index]||0;}else{sumPos+=ds.data[index]||0;}}}if(value<0){return yScale.getPixelForValue(sumNeg+value);}else{return yScale.getPixelForValue(sumPos+value);}}return yScale.getPixelForValue(value);},draw:function draw(ease){var me=this;var easingDecimal=ease||1;helpers.each(me.getMeta().data,function(rectangle,index){var d=me.getDataset().data[index];if(d!==null&&d!==undefined&&!isNaN(d)){rectangle.transition(easingDecimal).draw();}},me);},setHoverStyle:function setHoverStyle(rectangle){var dataset=this.chart.data.datasets[rectangle._datasetIndex];var index=rectangle._index;var custom=rectangle.custom||{};var model=rectangle._model;model.backgroundColor=custom.hoverBackgroundColor?custom.hoverBackgroundColor:helpers.getValueAtIndexOrDefault(dataset.hoverBackgroundColor,index,helpers.getHoverColor(model.backgroundColor));model.borderColor=custom.hoverBorderColor?custom.hoverBorderColor:helpers.getValueAtIndexOrDefault(dataset.hoverBorderColor,index,helpers.getHoverColor(model.borderColor));model.borderWidth=custom.hoverBorderWidth?custom.hoverBorderWidth:helpers.getValueAtIndexOrDefault(dataset.hoverBorderWidth,index,model.borderWidth);},removeHoverStyle:function removeHoverStyle(rectangle){var dataset=this.chart.data.datasets[rectangle._datasetIndex];var index=rectangle._index;var custom=rectangle.custom||{};var model=rectangle._model;var rectangleElementOptions=this.chart.options.elements.rectangle;model.backgroundColor=custom.backgroundColor?custom.backgroundColor:helpers.getValueAtIndexOrDefault(dataset.backgroundColor,index,rectangleElementOptions.backgroundColor);model.borderColor=custom.borderColor?custom.borderColor:helpers.getValueAtIndexOrDefault(dataset.borderColor,index,rectangleElementOptions.borderColor);model.borderWidth=custom.borderWidth?custom.borderWidth:helpers.getValueAtIndexOrDefault(dataset.borderWidth,index,rectangleElementOptions.borderWidth);}});// including horizontalBar in the bar file, instead of a file of its own
// it extends bar (like pie extends doughnut)
Chart.defaults.horizontalBar={hover:{mode:"label"},scales:{xAxes:[{type:"linear",position:"bottom"}],yAxes:[{position:"left",type:"category",// Specific to Horizontal Bar Controller
categoryPercentage:0.8,barPercentage:0.9,// grid line settings
gridLines:{offsetGridLines:true}}]},elements:{rectangle:{borderSkipped:'left'}},tooltips:{callbacks:{title:function title(tooltipItems,data){// Pick first xLabel for now
var title='';if(tooltipItems.length>0){if(tooltipItems[0].yLabel){title=tooltipItems[0].yLabel;}else if(data.labels.length>0&&tooltipItems[0].index<data.labels.length){title=data.labels[tooltipItems[0].index];}}return title;},label:function label(tooltipItem,data){var datasetLabel=data.datasets[tooltipItem.datasetIndex].label||'';return datasetLabel+': '+tooltipItem.xLabel;}}}};Chart.controllers.horizontalBar=Chart.controllers.bar.extend({updateElement:function updateElement(rectangle,index,reset,numBars){var me=this;var meta=me.getMeta();var xScale=me.getScaleForId(meta.xAxisID);var yScale=me.getScaleForId(meta.yAxisID);var scaleBase=xScale.getBasePixel();var custom=rectangle.custom||{};var dataset=me.getDataset();var rectangleElementOptions=me.chart.options.elements.rectangle;helpers.extend(rectangle,{// Utility
_xScale:xScale,_yScale:yScale,_datasetIndex:me.index,_index:index,// Desired view properties
_model:{x:reset?scaleBase:me.calculateBarX(index,me.index),y:me.calculateBarY(index,me.index),// Tooltip
label:me.chart.data.labels[index],datasetLabel:dataset.label,// Appearance
base:reset?scaleBase:me.calculateBarBase(me.index,index),height:me.calculateBarHeight(index),backgroundColor:custom.backgroundColor?custom.backgroundColor:helpers.getValueAtIndexOrDefault(dataset.backgroundColor,index,rectangleElementOptions.backgroundColor),borderSkipped:custom.borderSkipped?custom.borderSkipped:rectangleElementOptions.borderSkipped,borderColor:custom.borderColor?custom.borderColor:helpers.getValueAtIndexOrDefault(dataset.borderColor,index,rectangleElementOptions.borderColor),borderWidth:custom.borderWidth?custom.borderWidth:helpers.getValueAtIndexOrDefault(dataset.borderWidth,index,rectangleElementOptions.borderWidth)},draw:function draw(){var ctx=this._chart.ctx;var vm=this._view;var halfHeight=vm.height/2,topY=vm.y-halfHeight,bottomY=vm.y+halfHeight,right=vm.base-(vm.base-vm.x),halfStroke=vm.borderWidth/2;// Canvas doesn't allow us to stroke inside the width so we can
// adjust the sizes to fit if we're setting a stroke on the line
if(vm.borderWidth){topY+=halfStroke;bottomY-=halfStroke;right+=halfStroke;}ctx.beginPath();ctx.fillStyle=vm.backgroundColor;ctx.strokeStyle=vm.borderColor;ctx.lineWidth=vm.borderWidth;// Corner points, from bottom-left to bottom-right clockwise
// | 1 2 |
// | 0 3 |
var corners=[[vm.base,bottomY],[vm.base,topY],[right,topY],[right,bottomY]];// Find first (starting) corner with fallback to 'bottom'
var borders=['bottom','left','top','right'];var startCorner=borders.indexOf(vm.borderSkipped,0);if(startCorner===-1)startCorner=0;function cornerAt(index){return corners[(startCorner+index)%4];}// Draw rectangle from 'startCorner'
ctx.moveTo.apply(ctx,cornerAt(0));for(var i=1;i<4;i++){ctx.lineTo.apply(ctx,cornerAt(i));}ctx.fill();if(vm.borderWidth){ctx.stroke();}},inRange:function inRange(mouseX,mouseY){var vm=this._view;var inRange=false;if(vm){if(vm.x<vm.base){inRange=mouseY>=vm.y-vm.height/2&&mouseY<=vm.y+vm.height/2&&mouseX>=vm.x&&mouseX<=vm.base;}else{inRange=mouseY>=vm.y-vm.height/2&&mouseY<=vm.y+vm.height/2&&mouseX>=vm.base&&mouseX<=vm.x;}}return inRange;}});rectangle.pivot();},calculateBarBase:function calculateBarBase(datasetIndex,index){var me=this;var meta=me.getMeta();var xScale=me.getScaleForId(meta.xAxisID);var base=0;if(xScale.options.stacked){var value=me.chart.data.datasets[datasetIndex].data[index];if(value<0){for(var i=0;i<datasetIndex;i++){var negDS=me.chart.data.datasets[i];var negDSMeta=me.chart.getDatasetMeta(i);if(negDSMeta.bar&&negDSMeta.xAxisID===xScale.id&&me.chart.isDatasetVisible(i)){base+=negDS.data[index]<0?negDS.data[index]:0;}}}else{for(var j=0;j<datasetIndex;j++){var posDS=me.chart.data.datasets[j];var posDSMeta=me.chart.getDatasetMeta(j);if(posDSMeta.bar&&posDSMeta.xAxisID===xScale.id&&me.chart.isDatasetVisible(j)){base+=posDS.data[index]>0?posDS.data[index]:0;}}}return xScale.getPixelForValue(base);}return xScale.getBasePixel();},getRuler:function getRuler(index){var me=this;var meta=me.getMeta();var yScale=me.getScaleForId(meta.yAxisID);var datasetCount=me.getBarCount();var tickHeight;if(yScale.options.type==='category'){tickHeight=yScale.getPixelForTick(index+1)-yScale.getPixelForTick(index);}else{// Average width
tickHeight=yScale.width/yScale.ticks.length;}var categoryHeight=tickHeight*yScale.options.categoryPercentage;var categorySpacing=(tickHeight-tickHeight*yScale.options.categoryPercentage)/2;var fullBarHeight=categoryHeight/datasetCount;if(yScale.ticks.length!==me.chart.data.labels.length){var perc=yScale.ticks.length/me.chart.data.labels.length;fullBarHeight=fullBarHeight*perc;}var barHeight=fullBarHeight*yScale.options.barPercentage;var barSpacing=fullBarHeight-fullBarHeight*yScale.options.barPercentage;return{datasetCount:datasetCount,tickHeight:tickHeight,categoryHeight:categoryHeight,categorySpacing:categorySpacing,fullBarHeight:fullBarHeight,barHeight:barHeight,barSpacing:barSpacing};},calculateBarHeight:function calculateBarHeight(index){var me=this;var yScale=me.getScaleForId(me.getMeta().yAxisID);var ruler=me.getRuler(index);return yScale.options.stacked?ruler.categoryHeight:ruler.barHeight;},calculateBarX:function calculateBarX(index,datasetIndex){var me=this;var meta=me.getMeta();var xScale=me.getScaleForId(meta.xAxisID);var value=me.getDataset().data[index];if(xScale.options.stacked){var sumPos=0,sumNeg=0;for(var i=0;i<datasetIndex;i++){var ds=me.chart.data.datasets[i];var dsMeta=me.chart.getDatasetMeta(i);if(dsMeta.bar&&dsMeta.xAxisID===xScale.id&&me.chart.isDatasetVisible(i)){if(ds.data[index]<0){sumNeg+=ds.data[index]||0;}else{sumPos+=ds.data[index]||0;}}}if(value<0){return xScale.getPixelForValue(sumNeg+value);}else{return xScale.getPixelForValue(sumPos+value);}}return xScale.getPixelForValue(value);},calculateBarY:function calculateBarY(index,datasetIndex){var me=this;var meta=me.getMeta();var yScale=me.getScaleForId(meta.yAxisID);var barIndex=me.getBarIndex(datasetIndex);var ruler=me.getRuler(index);var topTick=yScale.getPixelForValue(null,index,datasetIndex,me.chart.isCombo);topTick-=me.chart.isCombo?ruler.tickHeight/2:0;if(yScale.options.stacked){return topTick+ruler.categoryHeight/2+ruler.categorySpacing;}return topTick+ruler.barHeight/2+ruler.categorySpacing+ruler.barHeight*barIndex+ruler.barSpacing/2+ruler.barSpacing*barIndex;}});};},{}],16:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.bubble={hover:{mode:"single"},scales:{xAxes:[{type:"linear",// bubble should probably use a linear scale by default
position:"bottom",id:"x-axis-0"// need an ID so datasets can reference the scale
}],yAxes:[{type:"linear",position:"left",id:"y-axis-0"}]},tooltips:{callbacks:{title:function title(tooltipItems,data){// Title doesn't make sense for scatter since we format the data as a point
return'';},label:function label(tooltipItem,data){var datasetLabel=data.datasets[tooltipItem.datasetIndex].label||'';var dataPoint=data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];return datasetLabel+': ('+dataPoint.x+', '+dataPoint.y+', '+dataPoint.r+')';}}}};Chart.controllers.bubble=Chart.DatasetController.extend({dataElementType:Chart.elements.Point,update:function update(reset){var me=this;var meta=me.getMeta();var points=meta.data;// Update Points
helpers.each(points,function(point,index){me.updateElement(point,index,reset);});},updateElement:function updateElement(point,index,reset){var me=this;var meta=me.getMeta();var xScale=me.getScaleForId(meta.xAxisID);var yScale=me.getScaleForId(meta.yAxisID);var custom=point.custom||{};var dataset=me.getDataset();var data=dataset.data[index];var pointElementOptions=me.chart.options.elements.point;var dsIndex=me.index;helpers.extend(point,{// Utility
_xScale:xScale,_yScale:yScale,_datasetIndex:dsIndex,_index:index,// Desired view properties
_model:{x:reset?xScale.getPixelForDecimal(0.5):xScale.getPixelForValue(data,index,dsIndex,me.chart.isCombo),y:reset?yScale.getBasePixel():yScale.getPixelForValue(data,index,dsIndex),// Appearance
radius:reset?0:custom.radius?custom.radius:me.getRadius(data),// Tooltip
hitRadius:custom.hitRadius?custom.hitRadius:helpers.getValueAtIndexOrDefault(dataset.hitRadius,index,pointElementOptions.hitRadius)}});// Trick to reset the styles of the point
Chart.DatasetController.prototype.removeHoverStyle.call(me,point,pointElementOptions);var model=point._model;model.skip=custom.skip?custom.skip:isNaN(model.x)||isNaN(model.y);point.pivot();},getRadius:function getRadius(value){return value.r||this.chart.options.elements.point.radius;},setHoverStyle:function setHoverStyle(point){var me=this;Chart.DatasetController.prototype.setHoverStyle.call(me,point);// Radius
var dataset=me.chart.data.datasets[point._datasetIndex];var index=point._index;var custom=point.custom||{};var model=point._model;model.radius=custom.hoverRadius?custom.hoverRadius:helpers.getValueAtIndexOrDefault(dataset.hoverRadius,index,me.chart.options.elements.point.hoverRadius)+me.getRadius(dataset.data[index]);},removeHoverStyle:function removeHoverStyle(point){var me=this;Chart.DatasetController.prototype.removeHoverStyle.call(me,point,me.chart.options.elements.point);var dataVal=me.chart.data.datasets[point._datasetIndex].data[point._index];var custom=point.custom||{};var model=point._model;model.radius=custom.radius?custom.radius:me.getRadius(dataVal);}});};},{}],17:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers,defaults=Chart.defaults;defaults.doughnut={animation:{//Boolean - Whether we animate the rotation of the Doughnut
animateRotate:true,//Boolean - Whether we animate scaling the Doughnut from the centre
animateScale:false},aspectRatio:1,hover:{mode:'single'},legendCallback:function legendCallback(chart){var text=[];text.push('<ul class="'+chart.id+'-legend">');var data=chart.data;var datasets=data.datasets;var labels=data.labels;if(datasets.length){for(var i=0;i<datasets[0].data.length;++i){text.push('<li><span style="background-color:'+datasets[0].backgroundColor[i]+'"></span>');if(labels[i]){text.push(labels[i]);}text.push('</li>');}}text.push('</ul>');return text.join("");},legend:{labels:{generateLabels:function generateLabels(chart){var data=chart.data;if(data.labels.length&&data.datasets.length){return data.labels.map(function(label,i){var meta=chart.getDatasetMeta(0);var ds=data.datasets[0];var arc=meta.data[i];var custom=arc.custom||{};var getValueAtIndexOrDefault=helpers.getValueAtIndexOrDefault;var arcOpts=chart.options.elements.arc;var fill=custom.backgroundColor?custom.backgroundColor:getValueAtIndexOrDefault(ds.backgroundColor,i,arcOpts.backgroundColor);var stroke=custom.borderColor?custom.borderColor:getValueAtIndexOrDefault(ds.borderColor,i,arcOpts.borderColor);var bw=custom.borderWidth?custom.borderWidth:getValueAtIndexOrDefault(ds.borderWidth,i,arcOpts.borderWidth);return{text:label,fillStyle:fill,strokeStyle:stroke,lineWidth:bw,hidden:isNaN(ds.data[i])||meta.data[i].hidden,// Extra data used for toggling the correct item
index:i};});}else{return[];}}},onClick:function onClick(e,legendItem){var index=legendItem.index;var chart=this.chart;var i,ilen,meta;for(i=0,ilen=(chart.data.datasets||[]).length;i<ilen;++i){meta=chart.getDatasetMeta(i);meta.data[index].hidden=!meta.data[index].hidden;}chart.update();}},//The percentage of the chart that we cut out of the middle.
cutoutPercentage:50,//The rotation of the chart, where the first data arc begins.
rotation:Math.PI*-0.5,//The total circumference of the chart.
circumference:Math.PI*2.0,// Need to override these to give a nice default
tooltips:{callbacks:{title:function title(){return'';},label:function label(tooltipItem,data){return data.labels[tooltipItem.index]+': '+data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];}}}};defaults.pie=helpers.clone(defaults.doughnut);helpers.extend(defaults.pie,{cutoutPercentage:0});Chart.controllers.doughnut=Chart.controllers.pie=Chart.DatasetController.extend({dataElementType:Chart.elements.Arc,linkScales:helpers.noop,// Get index of the dataset in relation to the visible datasets. This allows determining the inner and outer radius correctly
getRingIndex:function getRingIndex(datasetIndex){var ringIndex=0;for(var j=0;j<datasetIndex;++j){if(this.chart.isDatasetVisible(j)){++ringIndex;}}return ringIndex;},update:function update(reset){var me=this;var chart=me.chart,chartArea=chart.chartArea,opts=chart.options,arcOpts=opts.elements.arc,availableWidth=chartArea.right-chartArea.left-arcOpts.borderWidth,availableHeight=chartArea.bottom-chartArea.top-arcOpts.borderWidth,minSize=Math.min(availableWidth,availableHeight),offset={x:0,y:0},meta=me.getMeta(),cutoutPercentage=opts.cutoutPercentage,circumference=opts.circumference;// If the chart's circumference isn't a full circle, calculate minSize as a ratio of the width/height of the arc
if(circumference<Math.PI*2.0){var startAngle=opts.rotation%(Math.PI*2.0);startAngle+=Math.PI*2.0*(startAngle>=Math.PI?-1:startAngle<-Math.PI?1:0);var endAngle=startAngle+circumference;var start={x:Math.cos(startAngle),y:Math.sin(startAngle)};var end={x:Math.cos(endAngle),y:Math.sin(endAngle)};var contains0=startAngle<=0&&0<=endAngle||startAngle<=Math.PI*2.0&&Math.PI*2.0<=endAngle;var contains90=startAngle<=Math.PI*0.5&&Math.PI*0.5<=endAngle||startAngle<=Math.PI*2.5&&Math.PI*2.5<=endAngle;var contains180=startAngle<=-Math.PI&&-Math.PI<=endAngle||startAngle<=Math.PI&&Math.PI<=endAngle;var contains270=startAngle<=-Math.PI*0.5&&-Math.PI*0.5<=endAngle||startAngle<=Math.PI*1.5&&Math.PI*1.5<=endAngle;var cutout=cutoutPercentage/100.0;var min={x:contains180?-1:Math.min(start.x*(start.x<0?1:cutout),end.x*(end.x<0?1:cutout)),y:contains270?-1:Math.min(start.y*(start.y<0?1:cutout),end.y*(end.y<0?1:cutout))};var max={x:contains0?1:Math.max(start.x*(start.x>0?1:cutout),end.x*(end.x>0?1:cutout)),y:contains90?1:Math.max(start.y*(start.y>0?1:cutout),end.y*(end.y>0?1:cutout))};var size={width:(max.x-min.x)*0.5,height:(max.y-min.y)*0.5};minSize=Math.min(availableWidth/size.width,availableHeight/size.height);offset={x:(max.x+min.x)*-0.5,y:(max.y+min.y)*-0.5};}chart.outerRadius=Math.max(minSize/2,0);chart.innerRadius=Math.max(cutoutPercentage?chart.outerRadius/100*cutoutPercentage:1,0);chart.radiusLength=(chart.outerRadius-chart.innerRadius)/chart.getVisibleDatasetCount();chart.offsetX=offset.x*chart.outerRadius;chart.offsetY=offset.y*chart.outerRadius;meta.total=me.calculateTotal();me.outerRadius=chart.outerRadius-chart.radiusLength*me.getRingIndex(me.index);me.innerRadius=me.outerRadius-chart.radiusLength;helpers.each(meta.data,function(arc,index){me.updateElement(arc,index,reset);});},updateElement:function updateElement(arc,index,reset){var me=this;var chart=me.chart,chartArea=chart.chartArea,opts=chart.options,animationOpts=opts.animation,arcOpts=opts.elements.arc,centerX=(chartArea.left+chartArea.right)/2,centerY=(chartArea.top+chartArea.bottom)/2,startAngle=opts.rotation,// non reset case handled later
endAngle=opts.rotation,// non reset case handled later
dataset=me.getDataset(),circumference=reset&&animationOpts.animateRotate?0:arc.hidden?0:me.calculateCircumference(dataset.data[index])*(opts.circumference/(2.0*Math.PI)),innerRadius=reset&&animationOpts.animateScale?0:me.innerRadius,outerRadius=reset&&animationOpts.animateScale?0:me.outerRadius,custom=arc.custom||{},valueAtIndexOrDefault=helpers.getValueAtIndexOrDefault;helpers.extend(arc,{// Utility
_datasetIndex:me.index,_index:index,// Desired view properties
_model:{x:centerX+chart.offsetX,y:centerY+chart.offsetY,startAngle:startAngle,endAngle:endAngle,circumference:circumference,outerRadius:outerRadius,innerRadius:innerRadius,label:valueAtIndexOrDefault(dataset.label,index,chart.data.labels[index])}});var model=arc._model;// Resets the visual styles
this.removeHoverStyle(arc);// Set correct angles if not resetting
if(!reset||!animationOpts.animateRotate){if(index===0){model.startAngle=opts.rotation;}else{model.startAngle=me.getMeta().data[index-1]._model.endAngle;}model.endAngle=model.startAngle+model.circumference;}arc.pivot();},removeHoverStyle:function removeHoverStyle(arc){Chart.DatasetController.prototype.removeHoverStyle.call(this,arc,this.chart.options.elements.arc);},calculateTotal:function calculateTotal(){var dataset=this.getDataset();var meta=this.getMeta();var total=0;var value;helpers.each(meta.data,function(element,index){value=dataset.data[index];if(!isNaN(value)&&!element.hidden){total+=Math.abs(value);}});return total;},calculateCircumference:function calculateCircumference(value){var total=this.getMeta().total;if(total>0&&!isNaN(value)){return Math.PI*2.0*(value/total);}else{return 0;}}});};},{}],18:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.line={showLines:true,hover:{mode:"label"},scales:{xAxes:[{type:"category",id:'x-axis-0'}],yAxes:[{type:"linear",id:'y-axis-0'}]}};function lineEnabled(dataset,options){return helpers.getValueOrDefault(dataset.showLine,options.showLines);}Chart.controllers.line=Chart.DatasetController.extend({datasetElementType:Chart.elements.Line,dataElementType:Chart.elements.Point,addElementAndReset:function addElementAndReset(index){var me=this;var options=me.chart.options;var meta=me.getMeta();Chart.DatasetController.prototype.addElementAndReset.call(me,index);// Make sure bezier control points are updated
if(lineEnabled(me.getDataset(),options)&&meta.dataset._model.tension!==0){me.updateBezierControlPoints();}},update:function update(reset){var me=this;var meta=me.getMeta();var line=meta.dataset;var points=meta.data||[];var options=me.chart.options;var lineElementOptions=options.elements.line;var scale=me.getScaleForId(meta.yAxisID);var i,ilen,custom;var dataset=me.getDataset();var showLine=lineEnabled(dataset,options);// Update Line
if(showLine){custom=line.custom||{};// Compatibility: If the properties are defined with only the old name, use those values
if(dataset.tension!==undefined&&dataset.lineTension===undefined){dataset.lineTension=dataset.tension;}// Utility
line._scale=scale;line._datasetIndex=me.index;// Data
line._children=points;// Model
line._model={// Appearance
// The default behavior of lines is to break at null values, according
// to https://github.com/chartjs/Chart.js/issues/2435#issuecomment-216718158
// This option gives linse the ability to span gaps
spanGaps:dataset.spanGaps?dataset.spanGaps:false,tension:custom.tension?custom.tension:helpers.getValueOrDefault(dataset.lineTension,lineElementOptions.tension),backgroundColor:custom.backgroundColor?custom.backgroundColor:dataset.backgroundColor||lineElementOptions.backgroundColor,borderWidth:custom.borderWidth?custom.borderWidth:dataset.borderWidth||lineElementOptions.borderWidth,borderColor:custom.borderColor?custom.borderColor:dataset.borderColor||lineElementOptions.borderColor,borderCapStyle:custom.borderCapStyle?custom.borderCapStyle:dataset.borderCapStyle||lineElementOptions.borderCapStyle,borderDash:custom.borderDash?custom.borderDash:dataset.borderDash||lineElementOptions.borderDash,borderDashOffset:custom.borderDashOffset?custom.borderDashOffset:dataset.borderDashOffset||lineElementOptions.borderDashOffset,borderJoinStyle:custom.borderJoinStyle?custom.borderJoinStyle:dataset.borderJoinStyle||lineElementOptions.borderJoinStyle,fill:custom.fill?custom.fill:dataset.fill!==undefined?dataset.fill:lineElementOptions.fill,// Scale
scaleTop:scale.top,scaleBottom:scale.bottom,scaleZero:scale.getBasePixel()};line.pivot();}// Update Points
for(i=0,ilen=points.length;i<ilen;++i){me.updateElement(points[i],i,reset);}if(showLine&&line._model.tension!==0){me.updateBezierControlPoints();}// Now pivot the point for animation
for(i=0,ilen=points.length;i<ilen;++i){points[i].pivot();}},getPointBackgroundColor:function getPointBackgroundColor(point,index){var backgroundColor=this.chart.options.elements.point.backgroundColor;var dataset=this.getDataset();var custom=point.custom||{};if(custom.backgroundColor){backgroundColor=custom.backgroundColor;}else if(dataset.pointBackgroundColor){backgroundColor=helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor,index,backgroundColor);}else if(dataset.backgroundColor){backgroundColor=dataset.backgroundColor;}return backgroundColor;},getPointBorderColor:function getPointBorderColor(point,index){var borderColor=this.chart.options.elements.point.borderColor;var dataset=this.getDataset();var custom=point.custom||{};if(custom.borderColor){borderColor=custom.borderColor;}else if(dataset.pointBorderColor){borderColor=helpers.getValueAtIndexOrDefault(dataset.pointBorderColor,index,borderColor);}else if(dataset.borderColor){borderColor=dataset.borderColor;}return borderColor;},getPointBorderWidth:function getPointBorderWidth(point,index){var borderWidth=this.chart.options.elements.point.borderWidth;var dataset=this.getDataset();var custom=point.custom||{};if(custom.borderWidth){borderWidth=custom.borderWidth;}else if(dataset.pointBorderWidth){borderWidth=helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth,index,borderWidth);}else if(dataset.borderWidth){borderWidth=dataset.borderWidth;}return borderWidth;},updateElement:function updateElement(point,index,reset){var me=this;var meta=me.getMeta();var custom=point.custom||{};var dataset=me.getDataset();var datasetIndex=me.index;var value=dataset.data[index];var yScale=me.getScaleForId(meta.yAxisID);var xScale=me.getScaleForId(meta.xAxisID);var pointOptions=me.chart.options.elements.point;var x,y;// Compatibility: If the properties are defined with only the old name, use those values
if(dataset.radius!==undefined&&dataset.pointRadius===undefined){dataset.pointRadius=dataset.radius;}if(dataset.hitRadius!==undefined&&dataset.pointHitRadius===undefined){dataset.pointHitRadius=dataset.hitRadius;}x=xScale.getPixelForValue(value,index,datasetIndex,me.chart.isCombo);y=reset?yScale.getBasePixel():me.calculatePointY(value,index,datasetIndex,me.chart.isCombo);// Utility
point._xScale=xScale;point._yScale=yScale;point._datasetIndex=datasetIndex;point._index=index;// Desired view properties
point._model={x:x,y:y,skip:custom.skip||isNaN(x)||isNaN(y),// Appearance
radius:custom.radius||helpers.getValueAtIndexOrDefault(dataset.pointRadius,index,pointOptions.radius),pointStyle:custom.pointStyle||helpers.getValueAtIndexOrDefault(dataset.pointStyle,index,pointOptions.pointStyle),backgroundColor:me.getPointBackgroundColor(point,index),borderColor:me.getPointBorderColor(point,index),borderWidth:me.getPointBorderWidth(point,index),tension:meta.dataset._model?meta.dataset._model.tension:0,// Tooltip
hitRadius:custom.hitRadius||helpers.getValueAtIndexOrDefault(dataset.pointHitRadius,index,pointOptions.hitRadius)};},calculatePointY:function calculatePointY(value,index,datasetIndex,isCombo){var me=this;var chart=me.chart;var meta=me.getMeta();var yScale=me.getScaleForId(meta.yAxisID);var sumPos=0;var sumNeg=0;var i,ds,dsMeta;if(yScale.options.stacked){for(i=0;i<datasetIndex;i++){ds=chart.data.datasets[i];dsMeta=chart.getDatasetMeta(i);if(dsMeta.type==='line'&&chart.isDatasetVisible(i)){if(ds.data[index]<0){sumNeg+=ds.data[index]||0;}else{sumPos+=ds.data[index]||0;}}}if(value<0){return yScale.getPixelForValue(sumNeg+value);}else{return yScale.getPixelForValue(sumPos+value);}}return yScale.getPixelForValue(value);},updateBezierControlPoints:function updateBezierControlPoints(){var meta=this.getMeta();var area=this.chart.chartArea;var points=meta.data||[];var i,ilen,point,model,controlPoints;for(i=0,ilen=points.length;i<ilen;++i){point=points[i];model=point._model;controlPoints=helpers.splineCurve(helpers.previousItem(points,i)._model,model,helpers.nextItem(points,i)._model,meta.dataset._model.tension);model.controlPointPreviousX=controlPoints.previous.x;model.controlPointPreviousY=controlPoints.previous.y;model.controlPointNextX=controlPoints.next.x;model.controlPointNextY=controlPoints.next.y;}},draw:function draw(ease){var me=this;var meta=me.getMeta();var points=meta.data||[];var easingDecimal=ease||1;var i,ilen;// Transition Point Locations
for(i=0,ilen=points.length;i<ilen;++i){points[i].transition(easingDecimal);}// Transition and Draw the line
if(lineEnabled(me.getDataset(),me.chart.options)){meta.dataset.transition(easingDecimal).draw();}// Draw the points
for(i=0,ilen=points.length;i<ilen;++i){points[i].draw();}},setHoverStyle:function setHoverStyle(point){// Point
var dataset=this.chart.data.datasets[point._datasetIndex];var index=point._index;var custom=point.custom||{};var model=point._model;model.radius=custom.hoverRadius||helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius,index,this.chart.options.elements.point.hoverRadius);model.backgroundColor=custom.hoverBackgroundColor||helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor,index,helpers.getHoverColor(model.backgroundColor));model.borderColor=custom.hoverBorderColor||helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor,index,helpers.getHoverColor(model.borderColor));model.borderWidth=custom.hoverBorderWidth||helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderWidth,index,model.borderWidth);},removeHoverStyle:function removeHoverStyle(point){var me=this;var dataset=me.chart.data.datasets[point._datasetIndex];var index=point._index;var custom=point.custom||{};var model=point._model;// Compatibility: If the properties are defined with only the old name, use those values
if(dataset.radius!==undefined&&dataset.pointRadius===undefined){dataset.pointRadius=dataset.radius;}model.radius=custom.radius||helpers.getValueAtIndexOrDefault(dataset.pointRadius,index,me.chart.options.elements.point.radius);model.backgroundColor=me.getPointBackgroundColor(point,index);model.borderColor=me.getPointBorderColor(point,index);model.borderWidth=me.getPointBorderWidth(point,index);}});};},{}],19:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.polarArea={scale:{type:"radialLinear",lineArc:true// so that lines are circular
},//Boolean - Whether to animate the rotation of the chart
animation:{animateRotate:true,animateScale:true},aspectRatio:1,legendCallback:function legendCallback(chart){var text=[];text.push('<ul class="'+chart.id+'-legend">');var data=chart.data;var datasets=data.datasets;var labels=data.labels;if(datasets.length){for(var i=0;i<datasets[0].data.length;++i){text.push('<li><span style="background-color:'+datasets[0].backgroundColor[i]+'">');if(labels[i]){text.push(labels[i]);}text.push('</span></li>');}}text.push('</ul>');return text.join("");},legend:{labels:{generateLabels:function generateLabels(chart){var data=chart.data;if(data.labels.length&&data.datasets.length){return data.labels.map(function(label,i){var meta=chart.getDatasetMeta(0);var ds=data.datasets[0];var arc=meta.data[i];var custom=arc.custom||{};var getValueAtIndexOrDefault=helpers.getValueAtIndexOrDefault;var arcOpts=chart.options.elements.arc;var fill=custom.backgroundColor?custom.backgroundColor:getValueAtIndexOrDefault(ds.backgroundColor,i,arcOpts.backgroundColor);var stroke=custom.borderColor?custom.borderColor:getValueAtIndexOrDefault(ds.borderColor,i,arcOpts.borderColor);var bw=custom.borderWidth?custom.borderWidth:getValueAtIndexOrDefault(ds.borderWidth,i,arcOpts.borderWidth);return{text:label,fillStyle:fill,strokeStyle:stroke,lineWidth:bw,hidden:isNaN(ds.data[i])||meta.data[i].hidden,// Extra data used for toggling the correct item
index:i};});}else{return[];}}},onClick:function onClick(e,legendItem){var index=legendItem.index;var chart=this.chart;var i,ilen,meta;for(i=0,ilen=(chart.data.datasets||[]).length;i<ilen;++i){meta=chart.getDatasetMeta(i);meta.data[index].hidden=!meta.data[index].hidden;}chart.update();}},// Need to override these to give a nice default
tooltips:{callbacks:{title:function title(){return'';},label:function label(tooltipItem,data){return data.labels[tooltipItem.index]+': '+tooltipItem.yLabel;}}}};Chart.controllers.polarArea=Chart.DatasetController.extend({dataElementType:Chart.elements.Arc,linkScales:helpers.noop,update:function update(reset){var me=this;var chart=me.chart;var chartArea=chart.chartArea;var meta=me.getMeta();var opts=chart.options;var arcOpts=opts.elements.arc;var minSize=Math.min(chartArea.right-chartArea.left,chartArea.bottom-chartArea.top);chart.outerRadius=Math.max((minSize-arcOpts.borderWidth/2)/2,0);chart.innerRadius=Math.max(opts.cutoutPercentage?chart.outerRadius/100*opts.cutoutPercentage:1,0);chart.radiusLength=(chart.outerRadius-chart.innerRadius)/chart.getVisibleDatasetCount();me.outerRadius=chart.outerRadius-chart.radiusLength*me.index;me.innerRadius=me.outerRadius-chart.radiusLength;meta.count=me.countVisibleElements();helpers.each(meta.data,function(arc,index){me.updateElement(arc,index,reset);});},updateElement:function updateElement(arc,index,reset){var me=this;var chart=me.chart;var chartArea=chart.chartArea;var dataset=me.getDataset();var opts=chart.options;var animationOpts=opts.animation;var arcOpts=opts.elements.arc;var custom=arc.custom||{};var scale=chart.scale;var getValueAtIndexOrDefault=helpers.getValueAtIndexOrDefault;var labels=chart.data.labels;var circumference=me.calculateCircumference(dataset.data[index]);var centerX=(chartArea.left+chartArea.right)/2;var centerY=(chartArea.top+chartArea.bottom)/2;// If there is NaN data before us, we need to calculate the starting angle correctly.
// We could be way more efficient here, but its unlikely that the polar area chart will have a lot of data
var visibleCount=0;var meta=me.getMeta();for(var i=0;i<index;++i){if(!isNaN(dataset.data[i])&&!meta.data[i].hidden){++visibleCount;}}var negHalfPI=-0.5*Math.PI;var distance=arc.hidden?0:scale.getDistanceFromCenterForValue(dataset.data[index]);var startAngle=negHalfPI+circumference*visibleCount;var endAngle=startAngle+(arc.hidden?0:circumference);var resetRadius=animationOpts.animateScale?0:scale.getDistanceFromCenterForValue(dataset.data[index]);helpers.extend(arc,{// Utility
_datasetIndex:me.index,_index:index,_scale:scale,// Desired view properties
_model:{x:centerX,y:centerY,innerRadius:0,outerRadius:reset?resetRadius:distance,startAngle:reset&&animationOpts.animateRotate?negHalfPI:startAngle,endAngle:reset&&animationOpts.animateRotate?negHalfPI:endAngle,label:getValueAtIndexOrDefault(labels,index,labels[index])}});// Apply border and fill style
me.removeHoverStyle(arc);arc.pivot();},removeHoverStyle:function removeHoverStyle(arc){Chart.DatasetController.prototype.removeHoverStyle.call(this,arc,this.chart.options.elements.arc);},countVisibleElements:function countVisibleElements(){var dataset=this.getDataset();var meta=this.getMeta();var count=0;helpers.each(meta.data,function(element,index){if(!isNaN(dataset.data[index])&&!element.hidden){count++;}});return count;},calculateCircumference:function calculateCircumference(value){var count=this.getMeta().count;if(count>0&&!isNaN(value)){return 2*Math.PI/count;}else{return 0;}}});};},{}],20:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.radar={scale:{type:"radialLinear"},elements:{line:{tension:0// no bezier in radar
}}};Chart.controllers.radar=Chart.DatasetController.extend({datasetElementType:Chart.elements.Line,dataElementType:Chart.elements.Point,linkScales:helpers.noop,addElementAndReset:function addElementAndReset(index){Chart.DatasetController.prototype.addElementAndReset.call(this,index);// Make sure bezier control points are updated
this.updateBezierControlPoints();},update:function update(reset){var me=this;var meta=me.getMeta();var line=meta.dataset;var points=meta.data;var custom=line.custom||{};var dataset=me.getDataset();var lineElementOptions=me.chart.options.elements.line;var scale=me.chart.scale;// Compatibility: If the properties are defined with only the old name, use those values
if(dataset.tension!==undefined&&dataset.lineTension===undefined){dataset.lineTension=dataset.tension;}helpers.extend(meta.dataset,{// Utility
_datasetIndex:me.index,// Data
_children:points,_loop:true,// Model
_model:{// Appearance
tension:custom.tension?custom.tension:helpers.getValueOrDefault(dataset.lineTension,lineElementOptions.tension),backgroundColor:custom.backgroundColor?custom.backgroundColor:dataset.backgroundColor||lineElementOptions.backgroundColor,borderWidth:custom.borderWidth?custom.borderWidth:dataset.borderWidth||lineElementOptions.borderWidth,borderColor:custom.borderColor?custom.borderColor:dataset.borderColor||lineElementOptions.borderColor,fill:custom.fill?custom.fill:dataset.fill!==undefined?dataset.fill:lineElementOptions.fill,borderCapStyle:custom.borderCapStyle?custom.borderCapStyle:dataset.borderCapStyle||lineElementOptions.borderCapStyle,borderDash:custom.borderDash?custom.borderDash:dataset.borderDash||lineElementOptions.borderDash,borderDashOffset:custom.borderDashOffset?custom.borderDashOffset:dataset.borderDashOffset||lineElementOptions.borderDashOffset,borderJoinStyle:custom.borderJoinStyle?custom.borderJoinStyle:dataset.borderJoinStyle||lineElementOptions.borderJoinStyle,// Scale
scaleTop:scale.top,scaleBottom:scale.bottom,scaleZero:scale.getBasePosition()}});meta.dataset.pivot();// Update Points
helpers.each(points,function(point,index){me.updateElement(point,index,reset);},me);// Update bezier control points
me.updateBezierControlPoints();},updateElement:function updateElement(point,index,reset){var me=this;var custom=point.custom||{};var dataset=me.getDataset();var scale=me.chart.scale;var pointElementOptions=me.chart.options.elements.point;var pointPosition=scale.getPointPositionForValue(index,dataset.data[index]);helpers.extend(point,{// Utility
_datasetIndex:me.index,_index:index,_scale:scale,// Desired view properties
_model:{x:reset?scale.xCenter:pointPosition.x,// value not used in dataset scale, but we want a consistent API between scales
y:reset?scale.yCenter:pointPosition.y,// Appearance
tension:custom.tension?custom.tension:helpers.getValueOrDefault(dataset.tension,me.chart.options.elements.line.tension),radius:custom.radius?custom.radius:helpers.getValueAtIndexOrDefault(dataset.pointRadius,index,pointElementOptions.radius),backgroundColor:custom.backgroundColor?custom.backgroundColor:helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor,index,pointElementOptions.backgroundColor),borderColor:custom.borderColor?custom.borderColor:helpers.getValueAtIndexOrDefault(dataset.pointBorderColor,index,pointElementOptions.borderColor),borderWidth:custom.borderWidth?custom.borderWidth:helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth,index,pointElementOptions.borderWidth),pointStyle:custom.pointStyle?custom.pointStyle:helpers.getValueAtIndexOrDefault(dataset.pointStyle,index,pointElementOptions.pointStyle),// Tooltip
hitRadius:custom.hitRadius?custom.hitRadius:helpers.getValueAtIndexOrDefault(dataset.hitRadius,index,pointElementOptions.hitRadius)}});point._model.skip=custom.skip?custom.skip:isNaN(point._model.x)||isNaN(point._model.y);},updateBezierControlPoints:function updateBezierControlPoints(){var chartArea=this.chart.chartArea;var meta=this.getMeta();helpers.each(meta.data,function(point,index){var model=point._model;var controlPoints=helpers.splineCurve(helpers.previousItem(meta.data,index,true)._model,model,helpers.nextItem(meta.data,index,true)._model,model.tension);// Prevent the bezier going outside of the bounds of the graph
model.controlPointPreviousX=Math.max(Math.min(controlPoints.previous.x,chartArea.right),chartArea.left);model.controlPointPreviousY=Math.max(Math.min(controlPoints.previous.y,chartArea.bottom),chartArea.top);model.controlPointNextX=Math.max(Math.min(controlPoints.next.x,chartArea.right),chartArea.left);model.controlPointNextY=Math.max(Math.min(controlPoints.next.y,chartArea.bottom),chartArea.top);// Now pivot the point for animation
point.pivot();});},draw:function draw(ease){var meta=this.getMeta();var easingDecimal=ease||1;// Transition Point Locations
helpers.each(meta.data,function(point,index){point.transition(easingDecimal);});// Transition and Draw the line
meta.dataset.transition(easingDecimal).draw();// Draw the points
helpers.each(meta.data,function(point){point.draw();});},setHoverStyle:function setHoverStyle(point){// Point
var dataset=this.chart.data.datasets[point._datasetIndex];var custom=point.custom||{};var index=point._index;var model=point._model;model.radius=custom.hoverRadius?custom.hoverRadius:helpers.getValueAtIndexOrDefault(dataset.pointHoverRadius,index,this.chart.options.elements.point.hoverRadius);model.backgroundColor=custom.hoverBackgroundColor?custom.hoverBackgroundColor:helpers.getValueAtIndexOrDefault(dataset.pointHoverBackgroundColor,index,helpers.getHoverColor(model.backgroundColor));model.borderColor=custom.hoverBorderColor?custom.hoverBorderColor:helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderColor,index,helpers.getHoverColor(model.borderColor));model.borderWidth=custom.hoverBorderWidth?custom.hoverBorderWidth:helpers.getValueAtIndexOrDefault(dataset.pointHoverBorderWidth,index,model.borderWidth);},removeHoverStyle:function removeHoverStyle(point){var dataset=this.chart.data.datasets[point._datasetIndex];var custom=point.custom||{};var index=point._index;var model=point._model;var pointElementOptions=this.chart.options.elements.point;model.radius=custom.radius?custom.radius:helpers.getValueAtIndexOrDefault(dataset.radius,index,pointElementOptions.radius);model.backgroundColor=custom.backgroundColor?custom.backgroundColor:helpers.getValueAtIndexOrDefault(dataset.pointBackgroundColor,index,pointElementOptions.backgroundColor);model.borderColor=custom.borderColor?custom.borderColor:helpers.getValueAtIndexOrDefault(dataset.pointBorderColor,index,pointElementOptions.borderColor);model.borderWidth=custom.borderWidth?custom.borderWidth:helpers.getValueAtIndexOrDefault(dataset.pointBorderWidth,index,pointElementOptions.borderWidth);}});};},{}],21:[function(require,module,exports){/*global window: false */"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.global.animation={duration:1000,easing:"easeOutQuart",onProgress:helpers.noop,onComplete:helpers.noop};Chart.Animation=Chart.Element.extend({currentStep:null,// the current animation step
numSteps:60,// default number of steps
easing:"",// the easing to use for this animation
render:null,// render function used by the animation service
onAnimationProgress:null,// user specified callback to fire on each step of the animation
onAnimationComplete:null// user specified callback to fire when the animation finishes
});Chart.animationService={frameDuration:17,animations:[],dropFrames:0,request:null,addAnimation:function addAnimation(chartInstance,animationObject,duration,lazy){var me=this;if(!lazy){chartInstance.animating=true;}for(var index=0;index<me.animations.length;++index){if(me.animations[index].chartInstance===chartInstance){// replacing an in progress animation
me.animations[index].animationObject=animationObject;return;}}me.animations.push({chartInstance:chartInstance,animationObject:animationObject});// If there are no animations queued, manually kickstart a digest, for lack of a better word
if(me.animations.length===1){me.requestAnimationFrame();}},// Cancel the animation for a given chart instance
cancelAnimation:function cancelAnimation(chartInstance){var index=helpers.findIndex(this.animations,function(animationWrapper){return animationWrapper.chartInstance===chartInstance;});if(index!==-1){this.animations.splice(index,1);chartInstance.animating=false;}},requestAnimationFrame:function requestAnimationFrame(){var me=this;if(me.request===null){// Skip animation frame requests until the active one is executed.
// This can happen when processing mouse events, e.g. 'mousemove'
// and 'mouseout' events will trigger multiple renders.
me.request=helpers.requestAnimFrame.call(window,function(){me.request=null;me.startDigest();});}},startDigest:function startDigest(){var me=this;var startTime=Date.now();var framesToDrop=0;if(me.dropFrames>1){framesToDrop=Math.floor(me.dropFrames);me.dropFrames=me.dropFrames%1;}var i=0;while(i<me.animations.length){if(me.animations[i].animationObject.currentStep===null){me.animations[i].animationObject.currentStep=0;}me.animations[i].animationObject.currentStep+=1+framesToDrop;if(me.animations[i].animationObject.currentStep>me.animations[i].animationObject.numSteps){me.animations[i].animationObject.currentStep=me.animations[i].animationObject.numSteps;}me.animations[i].animationObject.render(me.animations[i].chartInstance,me.animations[i].animationObject);if(me.animations[i].animationObject.onAnimationProgress&&me.animations[i].animationObject.onAnimationProgress.call){me.animations[i].animationObject.onAnimationProgress.call(me.animations[i].chartInstance,me.animations[i]);}if(me.animations[i].animationObject.currentStep===me.animations[i].animationObject.numSteps){if(me.animations[i].animationObject.onAnimationComplete&&me.animations[i].animationObject.onAnimationComplete.call){me.animations[i].animationObject.onAnimationComplete.call(me.animations[i].chartInstance,me.animations[i]);}// executed the last frame. Remove the animation.
me.animations[i].chartInstance.animating=false;me.animations.splice(i,1);}else{++i;}}var endTime=Date.now();var dropFrames=(endTime-startTime)/me.frameDuration;me.dropFrames+=dropFrames;// Do we have more stuff to animate?
if(me.animations.length>0){me.requestAnimationFrame();}}};};},{}],22:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;//Create a dictionary of chart types, to allow for extension of existing types
Chart.types={};//Store a reference to each instance - allowing us to globally resize chart instances on window resize.
//Destroy method on the chart will remove the instance of the chart from this reference.
Chart.instances={};// Controllers available for dataset visualization eg. bar, line, slice, etc.
Chart.controllers={};/**
	 * @class Chart.Controller
	 * The main controller of a chart.
	 */Chart.Controller=function(instance){this.chart=instance;this.config=instance.config;this.options=this.config.options=helpers.configMerge(Chart.defaults.global,Chart.defaults[this.config.type],this.config.options||{});this.id=helpers.uid();Object.defineProperty(this,'data',{get:function get(){return this.config.data;}});//Add the chart instance to the global namespace
Chart.instances[this.id]=this;if(this.options.responsive){// Silent resize before chart draws
this.resize(true);}this.initialize();return this;};helpers.extend(Chart.Controller.prototype,/** @lends Chart.Controller */{initialize:function initialize(){var me=this;// Before init plugin notification
Chart.plugins.notify('beforeInit',[me]);me.bindEvents();// Make sure controllers are built first so that each dataset is bound to an axis before the scales
// are built
me.ensureScalesHaveIDs();me.buildOrUpdateControllers();me.buildScales();me.updateLayout();me.resetElements();me.initToolTip();me.update();// After init plugin notification
Chart.plugins.notify('afterInit',[me]);return me;},clear:function clear(){helpers.clear(this.chart);return this;},stop:function stop(){// Stops any current animation loop occuring
Chart.animationService.cancelAnimation(this);return this;},resize:function resize(silent){var me=this;var chart=me.chart;var canvas=chart.canvas;var newWidth=helpers.getMaximumWidth(canvas);var aspectRatio=chart.aspectRatio;var newHeight=me.options.maintainAspectRatio&&isNaN(aspectRatio)===false&&isFinite(aspectRatio)&&aspectRatio!==0?newWidth/aspectRatio:helpers.getMaximumHeight(canvas);var sizeChanged=chart.width!==newWidth||chart.height!==newHeight;if(!sizeChanged){return me;}canvas.width=chart.width=newWidth;canvas.height=chart.height=newHeight;helpers.retinaScale(chart);// Notify any plugins about the resize
var newSize={width:newWidth,height:newHeight};Chart.plugins.notify('resize',[me,newSize]);// Notify of resize
if(me.options.onResize){me.options.onResize(me,newSize);}if(!silent){me.stop();me.update(me.options.responsiveAnimationDuration);}return me;},ensureScalesHaveIDs:function ensureScalesHaveIDs(){var options=this.options;var scalesOptions=options.scales||{};var scaleOptions=options.scale;helpers.each(scalesOptions.xAxes,function(xAxisOptions,index){xAxisOptions.id=xAxisOptions.id||'x-axis-'+index;});helpers.each(scalesOptions.yAxes,function(yAxisOptions,index){yAxisOptions.id=yAxisOptions.id||'y-axis-'+index;});if(scaleOptions){scaleOptions.id=scaleOptions.id||'scale';}},/**
		 * Builds a map of scale ID to scale object for future lookup.
		 */buildScales:function buildScales(){var me=this;var options=me.options;var scales=me.scales={};var items=[];if(options.scales){items=items.concat((options.scales.xAxes||[]).map(function(xAxisOptions){return{options:xAxisOptions,dtype:'category'};}),(options.scales.yAxes||[]).map(function(yAxisOptions){return{options:yAxisOptions,dtype:'linear'};}));}if(options.scale){items.push({options:options.scale,dtype:'radialLinear',isDefault:true});}helpers.each(items,function(item,index){var scaleOptions=item.options;var scaleType=helpers.getValueOrDefault(scaleOptions.type,item.dtype);var scaleClass=Chart.scaleService.getScaleConstructor(scaleType);if(!scaleClass){return;}var scale=new scaleClass({id:scaleOptions.id,options:scaleOptions,ctx:me.chart.ctx,chart:me});scales[scale.id]=scale;// TODO(SB): I think we should be able to remove this custom case (options.scale)
// and consider it as a regular scale part of the "scales"" map only! This would
// make the logic easier and remove some useless? custom code.
if(item.isDefault){me.scale=scale;}});Chart.scaleService.addScalesToLayout(this);},updateLayout:function updateLayout(){Chart.layoutService.update(this,this.chart.width,this.chart.height);},buildOrUpdateControllers:function buildOrUpdateControllers(){var me=this;var types=[];var newControllers=[];helpers.each(me.data.datasets,function(dataset,datasetIndex){var meta=me.getDatasetMeta(datasetIndex);if(!meta.type){meta.type=dataset.type||me.config.type;}types.push(meta.type);if(meta.controller){meta.controller.updateIndex(datasetIndex);}else{meta.controller=new Chart.controllers[meta.type](me,datasetIndex);newControllers.push(meta.controller);}},me);if(types.length>1){for(var i=1;i<types.length;i++){if(types[i]!==types[i-1]){me.isCombo=true;break;}}}return newControllers;},resetElements:function resetElements(){var me=this;helpers.each(me.data.datasets,function(dataset,datasetIndex){me.getDatasetMeta(datasetIndex).controller.reset();},me);},update:function update(animationDuration,lazy){var me=this;Chart.plugins.notify('beforeUpdate',[me]);// In case the entire data object changed
me.tooltip._data=me.data;// Make sure dataset controllers are updated and new controllers are reset
var newControllers=me.buildOrUpdateControllers();// Make sure all dataset controllers have correct meta data counts
helpers.each(me.data.datasets,function(dataset,datasetIndex){me.getDatasetMeta(datasetIndex).controller.buildOrUpdateElements();},me);Chart.layoutService.update(me,me.chart.width,me.chart.height);// Apply changes to the dataets that require the scales to have been calculated i.e BorderColor chages
Chart.plugins.notify('afterScaleUpdate',[me]);// Can only reset the new controllers after the scales have been updated
helpers.each(newControllers,function(controller){controller.reset();});me.updateDatasets();// Do this before render so that any plugins that need final scale updates can use it
Chart.plugins.notify('afterUpdate',[me]);me.render(animationDuration,lazy);},/**
		 * @method beforeDatasetsUpdate
		 * @description Called before all datasets are updated. If a plugin returns false,
		 * the datasets update will be cancelled until another chart update is triggered.
		 * @param {Object} instance the chart instance being updated.
		 * @returns {Boolean} false to cancel the datasets update.
		 * @memberof Chart.PluginBase
		 * @since version 2.1.5
		 * @instance
		 *//**
		 * @method afterDatasetsUpdate
		 * @description Called after all datasets have been updated. Note that this
		 * extension will not be called if the datasets update has been cancelled.
		 * @param {Object} instance the chart instance being updated.
		 * @memberof Chart.PluginBase
		 * @since version 2.1.5
		 * @instance
		 *//**
		 * Updates all datasets unless a plugin returns false to the beforeDatasetsUpdate
		 * extension, in which case no datasets will be updated and the afterDatasetsUpdate
		 * notification will be skipped.
		 * @protected
		 * @instance
		 */updateDatasets:function updateDatasets(){var me=this;var i,ilen;if(Chart.plugins.notify('beforeDatasetsUpdate',[me])){for(i=0,ilen=me.data.datasets.length;i<ilen;++i){me.getDatasetMeta(i).controller.update();}Chart.plugins.notify('afterDatasetsUpdate',[me]);}},render:function render(duration,lazy){var me=this;Chart.plugins.notify('beforeRender',[me]);var animationOptions=me.options.animation;if(animationOptions&&(typeof duration!=='undefined'&&duration!==0||typeof duration==='undefined'&&animationOptions.duration!==0)){var animation=new Chart.Animation();animation.numSteps=(duration||animationOptions.duration)/16.66;//60 fps
animation.easing=animationOptions.easing;// render function
animation.render=function(chartInstance,animationObject){var easingFunction=helpers.easingEffects[animationObject.easing];var stepDecimal=animationObject.currentStep/animationObject.numSteps;var easeDecimal=easingFunction(stepDecimal);chartInstance.draw(easeDecimal,stepDecimal,animationObject.currentStep);};// user events
animation.onAnimationProgress=animationOptions.onProgress;animation.onAnimationComplete=animationOptions.onComplete;Chart.animationService.addAnimation(me,animation,duration,lazy);}else{me.draw();if(animationOptions&&animationOptions.onComplete&&animationOptions.onComplete.call){animationOptions.onComplete.call(me);}}return me;},draw:function draw(ease){var me=this;var easingDecimal=ease||1;me.clear();Chart.plugins.notify('beforeDraw',[me,easingDecimal]);// Draw all the scales
helpers.each(me.boxes,function(box){box.draw(me.chartArea);},me);if(me.scale){me.scale.draw();}Chart.plugins.notify('beforeDatasetsDraw',[me,easingDecimal]);// Draw each dataset via its respective controller (reversed to support proper line stacking)
helpers.each(me.data.datasets,function(dataset,datasetIndex){if(me.isDatasetVisible(datasetIndex)){me.getDatasetMeta(datasetIndex).controller.draw(ease);}},me,true);Chart.plugins.notify('afterDatasetsDraw',[me,easingDecimal]);// Finally draw the tooltip
me.tooltip.transition(easingDecimal).draw();Chart.plugins.notify('afterDraw',[me,easingDecimal]);},// Get the single element that was clicked on
// @return : An object containing the dataset index and element index of the matching element. Also contains the rectangle that was draw
getElementAtEvent:function getElementAtEvent(e){var me=this;var eventPosition=helpers.getRelativePosition(e,me.chart);var elementsArray=[];helpers.each(me.data.datasets,function(dataset,datasetIndex){if(me.isDatasetVisible(datasetIndex)){var meta=me.getDatasetMeta(datasetIndex);helpers.each(meta.data,function(element,index){if(element.inRange(eventPosition.x,eventPosition.y)){elementsArray.push(element);return elementsArray;}});}});return elementsArray;},getElementsAtEvent:function getElementsAtEvent(e){var me=this;var eventPosition=helpers.getRelativePosition(e,me.chart);var elementsArray=[];var found=function(){if(me.data.datasets){for(var i=0;i<me.data.datasets.length;i++){var meta=me.getDatasetMeta(i);if(me.isDatasetVisible(i)){for(var j=0;j<meta.data.length;j++){if(meta.data[j].inRange(eventPosition.x,eventPosition.y)){return meta.data[j];}}}}}}.call(me);if(!found){return elementsArray;}helpers.each(me.data.datasets,function(dataset,datasetIndex){if(me.isDatasetVisible(datasetIndex)){var meta=me.getDatasetMeta(datasetIndex);elementsArray.push(meta.data[found._index]);}},me);return elementsArray;},getElementsAtEventForMode:function getElementsAtEventForMode(e,mode){var me=this;switch(mode){case'single':return me.getElementAtEvent(e);case'label':return me.getElementsAtEvent(e);case'dataset':return me.getDatasetAtEvent(e);default:return e;}},getDatasetAtEvent:function getDatasetAtEvent(e){var elementsArray=this.getElementAtEvent(e);if(elementsArray.length>0){elementsArray=this.getDatasetMeta(elementsArray[0]._datasetIndex).data;}return elementsArray;},getDatasetMeta:function getDatasetMeta(datasetIndex){var me=this;var dataset=me.data.datasets[datasetIndex];if(!dataset._meta){dataset._meta={};}var meta=dataset._meta[me.id];if(!meta){meta=dataset._meta[me.id]={type:null,data:[],dataset:null,controller:null,hidden:null,// See isDatasetVisible() comment
xAxisID:null,yAxisID:null};}return meta;},getVisibleDatasetCount:function getVisibleDatasetCount(){var count=0;for(var i=0,ilen=this.data.datasets.length;i<ilen;++i){if(this.isDatasetVisible(i)){count++;}}return count;},isDatasetVisible:function isDatasetVisible(datasetIndex){var meta=this.getDatasetMeta(datasetIndex);// meta.hidden is a per chart dataset hidden flag override with 3 states: if true or false,
// the dataset.hidden value is ignored, else if null, the dataset hidden state is returned.
return typeof meta.hidden==='boolean'?!meta.hidden:!this.data.datasets[datasetIndex].hidden;},generateLegend:function generateLegend(){return this.options.legendCallback(this);},destroy:function destroy(){var me=this;me.stop();me.clear();helpers.unbindEvents(me,me.events);helpers.removeResizeListener(me.chart.canvas.parentNode);// Reset canvas height/width attributes
var canvas=me.chart.canvas;canvas.width=me.chart.width;canvas.height=me.chart.height;// if we scaled the canvas in response to a devicePixelRatio !== 1, we need to undo that transform here
if(me.chart.originalDevicePixelRatio!==undefined){me.chart.ctx.scale(1/me.chart.originalDevicePixelRatio,1/me.chart.originalDevicePixelRatio);}// Reset to the old style since it may have been changed by the device pixel ratio changes
canvas.style.width=me.chart.originalCanvasStyleWidth;canvas.style.height=me.chart.originalCanvasStyleHeight;Chart.plugins.notify('destroy',[me]);delete Chart.instances[me.id];},toBase64Image:function toBase64Image(){return this.chart.canvas.toDataURL.apply(this.chart.canvas,arguments);},initToolTip:function initToolTip(){var me=this;me.tooltip=new Chart.Tooltip({_chart:me.chart,_chartInstance:me,_data:me.data,_options:me.options.tooltips},me);},bindEvents:function bindEvents(){var me=this;helpers.bindEvents(me,me.options.events,function(evt){me.eventHandler(evt);});},updateHoverStyle:function updateHoverStyle(elements,mode,enabled){var method=enabled?'setHoverStyle':'removeHoverStyle';var element,i,ilen;switch(mode){case'single':elements=[elements[0]];break;case'label':case'dataset':// elements = elements;
break;default:// unsupported mode
return;}for(i=0,ilen=elements.length;i<ilen;++i){element=elements[i];if(element){this.getDatasetMeta(element._datasetIndex).controller[method](element);}}},eventHandler:function eventHandler(e){var me=this;var tooltip=me.tooltip;var options=me.options||{};var hoverOptions=options.hover;var tooltipsOptions=options.tooltips;me.lastActive=me.lastActive||[];me.lastTooltipActive=me.lastTooltipActive||[];// Find Active Elements for hover and tooltips
if(e.type==='mouseout'){me.active=[];me.tooltipActive=[];}else{me.active=me.getElementsAtEventForMode(e,hoverOptions.mode);me.tooltipActive=me.getElementsAtEventForMode(e,tooltipsOptions.mode);}// On Hover hook
if(hoverOptions.onHover){hoverOptions.onHover.call(me,me.active);}if(e.type==='mouseup'||e.type==='click'){if(options.onClick){options.onClick.call(me,e,me.active);}if(me.legend&&me.legend.handleEvent){me.legend.handleEvent(e);}}// Remove styling for last active (even if it may still be active)
if(me.lastActive.length){me.updateHoverStyle(me.lastActive,hoverOptions.mode,false);}// Built in hover styling
if(me.active.length&&hoverOptions.mode){me.updateHoverStyle(me.active,hoverOptions.mode,true);}// Built in Tooltips
if(tooltipsOptions.enabled||tooltipsOptions.custom){tooltip.initialize();tooltip._active=me.tooltipActive;tooltip.update(true);}// Hover animations
tooltip.pivot();if(!me.animating){// If entering, leaving, or changing elements, animate the change via pivot
if(!helpers.arrayEquals(me.active,me.lastActive)||!helpers.arrayEquals(me.tooltipActive,me.lastTooltipActive)){me.stop();if(tooltipsOptions.enabled||tooltipsOptions.custom){tooltip.update(true);}// We only need to render at this point. Updating will cause scales to be
// recomputed generating flicker & using more memory than necessary.
me.render(hoverOptions.animationDuration,true);}}// Remember Last Actives
me.lastActive=me.active;me.lastTooltipActive=me.tooltipActive;return me;}});};},{}],23:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;var noop=helpers.noop;// Base class for all dataset controllers (line, bar, etc)
Chart.DatasetController=function(chart,datasetIndex){this.initialize.call(this,chart,datasetIndex);};helpers.extend(Chart.DatasetController.prototype,{/**
		 * Element type used to generate a meta dataset (e.g. Chart.element.Line).
		 * @type {Chart.core.element}
		 */datasetElementType:null,/**
		 * Element type used to generate a meta data (e.g. Chart.element.Point).
		 * @type {Chart.core.element}
		 */dataElementType:null,initialize:function initialize(chart,datasetIndex){var me=this;me.chart=chart;me.index=datasetIndex;me.linkScales();me.addElements();},updateIndex:function updateIndex(datasetIndex){this.index=datasetIndex;},linkScales:function linkScales(){var me=this;var meta=me.getMeta();var dataset=me.getDataset();if(meta.xAxisID===null){meta.xAxisID=dataset.xAxisID||me.chart.options.scales.xAxes[0].id;}if(meta.yAxisID===null){meta.yAxisID=dataset.yAxisID||me.chart.options.scales.yAxes[0].id;}},getDataset:function getDataset(){return this.chart.data.datasets[this.index];},getMeta:function getMeta(){return this.chart.getDatasetMeta(this.index);},getScaleForId:function getScaleForId(scaleID){return this.chart.scales[scaleID];},reset:function reset(){this.update(true);},createMetaDataset:function createMetaDataset(){var me=this;var type=me.datasetElementType;return type&&new type({_chart:me.chart.chart,_datasetIndex:me.index});},createMetaData:function createMetaData(index){var me=this;var type=me.dataElementType;return type&&new type({_chart:me.chart.chart,_datasetIndex:me.index,_index:index});},addElements:function addElements(){var me=this;var meta=me.getMeta();var data=me.getDataset().data||[];var metaData=meta.data;var i,ilen;for(i=0,ilen=data.length;i<ilen;++i){metaData[i]=metaData[i]||me.createMetaData(meta,i);}meta.dataset=meta.dataset||me.createMetaDataset();},addElementAndReset:function addElementAndReset(index){var me=this;var element=me.createMetaData(index);me.getMeta().data.splice(index,0,element);me.updateElement(element,index,true);},buildOrUpdateElements:function buildOrUpdateElements(){// Handle the number of data points changing
var meta=this.getMeta(),md=meta.data,numData=this.getDataset().data.length,numMetaData=md.length;// Make sure that we handle number of datapoints changing
if(numData<numMetaData){// Remove excess bars for data points that have been removed
md.splice(numData,numMetaData-numData);}else if(numData>numMetaData){// Add new elements
for(var index=numMetaData;index<numData;++index){this.addElementAndReset(index);}}},update:noop,draw:function draw(ease){var easingDecimal=ease||1;helpers.each(this.getMeta().data,function(element,index){element.transition(easingDecimal).draw();});},removeHoverStyle:function removeHoverStyle(element,elementOpts){var dataset=this.chart.data.datasets[element._datasetIndex],index=element._index,custom=element.custom||{},valueOrDefault=helpers.getValueAtIndexOrDefault,color=helpers.color,model=element._model;model.backgroundColor=custom.backgroundColor?custom.backgroundColor:valueOrDefault(dataset.backgroundColor,index,elementOpts.backgroundColor);model.borderColor=custom.borderColor?custom.borderColor:valueOrDefault(dataset.borderColor,index,elementOpts.borderColor);model.borderWidth=custom.borderWidth?custom.borderWidth:valueOrDefault(dataset.borderWidth,index,elementOpts.borderWidth);},setHoverStyle:function setHoverStyle(element){var dataset=this.chart.data.datasets[element._datasetIndex],index=element._index,custom=element.custom||{},valueOrDefault=helpers.getValueAtIndexOrDefault,color=helpers.color,getHoverColor=helpers.getHoverColor,model=element._model;model.backgroundColor=custom.hoverBackgroundColor?custom.hoverBackgroundColor:valueOrDefault(dataset.hoverBackgroundColor,index,getHoverColor(model.backgroundColor));model.borderColor=custom.hoverBorderColor?custom.hoverBorderColor:valueOrDefault(dataset.hoverBorderColor,index,getHoverColor(model.borderColor));model.borderWidth=custom.hoverBorderWidth?custom.hoverBorderWidth:valueOrDefault(dataset.hoverBorderWidth,index,model.borderWidth);}});Chart.DatasetController.extend=helpers.inherits;};},{}],24:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.elements={};Chart.Element=function(configuration){helpers.extend(this,configuration);this.initialize.apply(this,arguments);};helpers.extend(Chart.Element.prototype,{initialize:function initialize(){this.hidden=false;},pivot:function pivot(){var me=this;if(!me._view){me._view=helpers.clone(me._model);}me._start=helpers.clone(me._view);return me;},transition:function transition(ease){var me=this;if(!me._view){me._view=helpers.clone(me._model);}// No animation -> No Transition
if(ease===1){me._view=me._model;me._start=null;return me;}if(!me._start){me.pivot();}helpers.each(me._model,function(value,key){if(key[0]==='_'){}// Only non-underscored properties
// Init if doesn't exist
else if(!me._view.hasOwnProperty(key)){if(typeof value==='number'&&!isNaN(me._view[key])){me._view[key]=value*ease;}else{me._view[key]=value;}}// No unnecessary computations
else if(value===me._view[key]){}// It's the same! Woohoo!
// Color transitions if possible
else if(typeof value==='string'){try{var color=helpers.color(me._model[key]).mix(helpers.color(me._start[key]),ease);me._view[key]=color.rgbString();}catch(err){me._view[key]=value;}}// Number transitions
else if(typeof value==='number'){var startVal=me._start[key]!==undefined&&isNaN(me._start[key])===false?me._start[key]:0;me._view[key]=(me._model[key]-startVal)*ease+startVal;}// Everything else
else{me._view[key]=value;}},me);return me;},tooltipPosition:function tooltipPosition(){return{x:this._model.x,y:this._model.y};},hasValue:function hasValue(){return helpers.isNumber(this._model.x)&&helpers.isNumber(this._model.y);}});Chart.Element.extend=helpers.inherits;};},{}],25:[function(require,module,exports){/*global window: false *//*global document: false */"use strict";var color=require(3);module.exports=function(Chart){//Global Chart helpers object for utility methods and classes
var helpers=Chart.helpers={};//-- Basic js utility methods
helpers.each=function(loopable,callback,self,reverse){// Check to see if null or undefined firstly.
var i,len;if(helpers.isArray(loopable)){len=loopable.length;if(reverse){for(i=len-1;i>=0;i--){callback.call(self,loopable[i],i);}}else{for(i=0;i<len;i++){callback.call(self,loopable[i],i);}}}else if((typeof loopable==="undefined"?"undefined":_typeof(loopable))==='object'){var keys=Object.keys(loopable);len=keys.length;for(i=0;i<len;i++){callback.call(self,loopable[keys[i]],keys[i]);}}};helpers.clone=function(obj){var objClone={};helpers.each(obj,function(value,key){if(helpers.isArray(value)){objClone[key]=value.slice(0);}else if((typeof value==="undefined"?"undefined":_typeof(value))==='object'&&value!==null){objClone[key]=helpers.clone(value);}else{objClone[key]=value;}});return objClone;};helpers.extend=function(base){var setFn=function setFn(value,key){base[key]=value;};for(var i=1,ilen=arguments.length;i<ilen;i++){helpers.each(arguments[i],setFn);}return base;};// Need a special merge function to chart configs since they are now grouped
helpers.configMerge=function(_base){var base=helpers.clone(_base);helpers.each(Array.prototype.slice.call(arguments,1),function(extension){helpers.each(extension,function(value,key){if(key==='scales'){// Scale config merging is complex. Add out own function here for that
base[key]=helpers.scaleMerge(base.hasOwnProperty(key)?base[key]:{},value);}else if(key==='scale'){// Used in polar area & radar charts since there is only one scale
base[key]=helpers.configMerge(base.hasOwnProperty(key)?base[key]:{},Chart.scaleService.getScaleDefaults(value.type),value);}else if(base.hasOwnProperty(key)&&helpers.isArray(base[key])&&helpers.isArray(value)){// In this case we have an array of objects replacing another array. Rather than doing a strict replace,
// merge. This allows easy scale option merging
var baseArray=base[key];helpers.each(value,function(valueObj,index){if(index<baseArray.length){if(_typeof(baseArray[index])==='object'&&baseArray[index]!==null&&(typeof valueObj==="undefined"?"undefined":_typeof(valueObj))==='object'&&valueObj!==null){// Two objects are coming together. Do a merge of them.
baseArray[index]=helpers.configMerge(baseArray[index],valueObj);}else{// Just overwrite in this case since there is nothing to merge
baseArray[index]=valueObj;}}else{baseArray.push(valueObj);// nothing to merge
}});}else if(base.hasOwnProperty(key)&&_typeof(base[key])==="object"&&base[key]!==null&&(typeof value==="undefined"?"undefined":_typeof(value))==="object"){// If we are overwriting an object with an object, do a merge of the properties.
base[key]=helpers.configMerge(base[key],value);}else{// can just overwrite the value in this case
base[key]=value;}});});return base;};helpers.scaleMerge=function(_base,extension){var base=helpers.clone(_base);helpers.each(extension,function(value,key){if(key==='xAxes'||key==='yAxes'){// These properties are arrays of items
if(base.hasOwnProperty(key)){helpers.each(value,function(valueObj,index){var axisType=helpers.getValueOrDefault(valueObj.type,key==='xAxes'?'category':'linear');var axisDefaults=Chart.scaleService.getScaleDefaults(axisType);if(index>=base[key].length||!base[key][index].type){base[key].push(helpers.configMerge(axisDefaults,valueObj));}else if(valueObj.type&&valueObj.type!==base[key][index].type){// Type changed. Bring in the new defaults before we bring in valueObj so that valueObj can override the correct scale defaults
base[key][index]=helpers.configMerge(base[key][index],axisDefaults,valueObj);}else{// Type is the same
base[key][index]=helpers.configMerge(base[key][index],valueObj);}});}else{base[key]=[];helpers.each(value,function(valueObj){var axisType=helpers.getValueOrDefault(valueObj.type,key==='xAxes'?'category':'linear');base[key].push(helpers.configMerge(Chart.scaleService.getScaleDefaults(axisType),valueObj));});}}else if(base.hasOwnProperty(key)&&_typeof(base[key])==="object"&&base[key]!==null&&(typeof value==="undefined"?"undefined":_typeof(value))==="object"){// If we are overwriting an object with an object, do a merge of the properties.
base[key]=helpers.configMerge(base[key],value);}else{// can just overwrite the value in this case
base[key]=value;}});return base;};helpers.getValueAtIndexOrDefault=function(value,index,defaultValue){if(value===undefined||value===null){return defaultValue;}if(helpers.isArray(value)){return index<value.length?value[index]:defaultValue;}return value;};helpers.getValueOrDefault=function(value,defaultValue){return value===undefined?defaultValue:value;};helpers.indexOf=Array.prototype.indexOf?function(array,item){return array.indexOf(item);}:function(array,item){for(var i=0,ilen=array.length;i<ilen;++i){if(array[i]===item){return i;}}return-1;};helpers.where=function(collection,filterCallback){if(helpers.isArray(collection)&&Array.prototype.filter){return collection.filter(filterCallback);}else{var filtered=[];helpers.each(collection,function(item){if(filterCallback(item)){filtered.push(item);}});return filtered;}};helpers.findIndex=Array.prototype.findIndex?function(array,callback,scope){return array.findIndex(callback,scope);}:function(array,callback,scope){scope=scope===undefined?array:scope;for(var i=0,ilen=array.length;i<ilen;++i){if(callback.call(scope,array[i],i,array)){return i;}}return-1;};helpers.findNextWhere=function(arrayToSearch,filterCallback,startIndex){// Default to start of the array
if(startIndex===undefined||startIndex===null){startIndex=-1;}for(var i=startIndex+1;i<arrayToSearch.length;i++){var currentItem=arrayToSearch[i];if(filterCallback(currentItem)){return currentItem;}}};helpers.findPreviousWhere=function(arrayToSearch,filterCallback,startIndex){// Default to end of the array
if(startIndex===undefined||startIndex===null){startIndex=arrayToSearch.length;}for(var i=startIndex-1;i>=0;i--){var currentItem=arrayToSearch[i];if(filterCallback(currentItem)){return currentItem;}}};helpers.inherits=function(extensions){//Basic javascript inheritance based on the model created in Backbone.js
var parent=this;var ChartElement=extensions&&extensions.hasOwnProperty("constructor")?extensions.constructor:function(){return parent.apply(this,arguments);};var Surrogate=function Surrogate(){this.constructor=ChartElement;};Surrogate.prototype=parent.prototype;ChartElement.prototype=new Surrogate();ChartElement.extend=helpers.inherits;if(extensions){helpers.extend(ChartElement.prototype,extensions);}ChartElement.__super__=parent.prototype;return ChartElement;};helpers.noop=function(){};helpers.uid=function(){var id=0;return function(){return id++;};}();//-- Math methods
helpers.isNumber=function(n){return!isNaN(parseFloat(n))&&isFinite(n);};helpers.almostEquals=function(x,y,epsilon){return Math.abs(x-y)<epsilon;};helpers.max=function(array){return array.reduce(function(max,value){if(!isNaN(value)){return Math.max(max,value);}else{return max;}},Number.NEGATIVE_INFINITY);};helpers.min=function(array){return array.reduce(function(min,value){if(!isNaN(value)){return Math.min(min,value);}else{return min;}},Number.POSITIVE_INFINITY);};helpers.sign=Math.sign?function(x){return Math.sign(x);}:function(x){x=+x;// convert to a number
if(x===0||isNaN(x)){return x;}return x>0?1:-1;};helpers.log10=Math.log10?function(x){return Math.log10(x);}:function(x){return Math.log(x)/Math.LN10;};helpers.toRadians=function(degrees){return degrees*(Math.PI/180);};helpers.toDegrees=function(radians){return radians*(180/Math.PI);};// Gets the angle from vertical upright to the point about a centre.
helpers.getAngleFromPoint=function(centrePoint,anglePoint){var distanceFromXCenter=anglePoint.x-centrePoint.x,distanceFromYCenter=anglePoint.y-centrePoint.y,radialDistanceFromCenter=Math.sqrt(distanceFromXCenter*distanceFromXCenter+distanceFromYCenter*distanceFromYCenter);var angle=Math.atan2(distanceFromYCenter,distanceFromXCenter);if(angle<-0.5*Math.PI){angle+=2.0*Math.PI;// make sure the returned angle is in the range of (-PI/2, 3PI/2]
}return{angle:angle,distance:radialDistanceFromCenter};};helpers.aliasPixel=function(pixelWidth){return pixelWidth%2===0?0:0.5;};helpers.splineCurve=function(firstPoint,middlePoint,afterPoint,t){//Props to Rob Spencer at scaled innovation for his post on splining between points
//http://scaledinnovation.com/analytics/splines/aboutSplines.html
// This function must also respect "skipped" points
var previous=firstPoint.skip?middlePoint:firstPoint,current=middlePoint,next=afterPoint.skip?middlePoint:afterPoint;var d01=Math.sqrt(Math.pow(current.x-previous.x,2)+Math.pow(current.y-previous.y,2));var d12=Math.sqrt(Math.pow(next.x-current.x,2)+Math.pow(next.y-current.y,2));var s01=d01/(d01+d12);var s12=d12/(d01+d12);// If all points are the same, s01 & s02 will be inf
s01=isNaN(s01)?0:s01;s12=isNaN(s12)?0:s12;var fa=t*s01;// scaling factor for triangle Ta
var fb=t*s12;return{previous:{x:current.x-fa*(next.x-previous.x),y:current.y-fa*(next.y-previous.y)},next:{x:current.x+fb*(next.x-previous.x),y:current.y+fb*(next.y-previous.y)}};};helpers.nextItem=function(collection,index,loop){if(loop){return index>=collection.length-1?collection[0]:collection[index+1];}return index>=collection.length-1?collection[collection.length-1]:collection[index+1];};helpers.previousItem=function(collection,index,loop){if(loop){return index<=0?collection[collection.length-1]:collection[index-1];}return index<=0?collection[0]:collection[index-1];};// Implementation of the nice number algorithm used in determining where axis labels will go
helpers.niceNum=function(range,round){var exponent=Math.floor(helpers.log10(range));var fraction=range/Math.pow(10,exponent);var niceFraction;if(round){if(fraction<1.5){niceFraction=1;}else if(fraction<3){niceFraction=2;}else if(fraction<7){niceFraction=5;}else{niceFraction=10;}}else{if(fraction<=1.0){niceFraction=1;}else if(fraction<=2){niceFraction=2;}else if(fraction<=5){niceFraction=5;}else{niceFraction=10;}}return niceFraction*Math.pow(10,exponent);};//Easing functions adapted from Robert Penner's easing equations
//http://www.robertpenner.com/easing/
var easingEffects=helpers.easingEffects={linear:function linear(t){return t;},easeInQuad:function easeInQuad(t){return t*t;},easeOutQuad:function easeOutQuad(t){return-1*t*(t-2);},easeInOutQuad:function easeInOutQuad(t){if((t/=1/2)<1){return 1/2*t*t;}return-1/2*(--t*(t-2)-1);},easeInCubic:function easeInCubic(t){return t*t*t;},easeOutCubic:function easeOutCubic(t){return 1*((t=t/1-1)*t*t+1);},easeInOutCubic:function easeInOutCubic(t){if((t/=1/2)<1){return 1/2*t*t*t;}return 1/2*((t-=2)*t*t+2);},easeInQuart:function easeInQuart(t){return t*t*t*t;},easeOutQuart:function easeOutQuart(t){return-1*((t=t/1-1)*t*t*t-1);},easeInOutQuart:function easeInOutQuart(t){if((t/=1/2)<1){return 1/2*t*t*t*t;}return-1/2*((t-=2)*t*t*t-2);},easeInQuint:function easeInQuint(t){return 1*(t/=1)*t*t*t*t;},easeOutQuint:function easeOutQuint(t){return 1*((t=t/1-1)*t*t*t*t+1);},easeInOutQuint:function easeInOutQuint(t){if((t/=1/2)<1){return 1/2*t*t*t*t*t;}return 1/2*((t-=2)*t*t*t*t+2);},easeInSine:function easeInSine(t){return-1*Math.cos(t/1*(Math.PI/2))+1;},easeOutSine:function easeOutSine(t){return 1*Math.sin(t/1*(Math.PI/2));},easeInOutSine:function easeInOutSine(t){return-1/2*(Math.cos(Math.PI*t/1)-1);},easeInExpo:function easeInExpo(t){return t===0?1:1*Math.pow(2,10*(t/1-1));},easeOutExpo:function easeOutExpo(t){return t===1?1:1*(-Math.pow(2,-10*t/1)+1);},easeInOutExpo:function easeInOutExpo(t){if(t===0){return 0;}if(t===1){return 1;}if((t/=1/2)<1){return 1/2*Math.pow(2,10*(t-1));}return 1/2*(-Math.pow(2,-10*--t)+2);},easeInCirc:function easeInCirc(t){if(t>=1){return t;}return-1*(Math.sqrt(1-(t/=1)*t)-1);},easeOutCirc:function easeOutCirc(t){return 1*Math.sqrt(1-(t=t/1-1)*t);},easeInOutCirc:function easeInOutCirc(t){if((t/=1/2)<1){return-1/2*(Math.sqrt(1-t*t)-1);}return 1/2*(Math.sqrt(1-(t-=2)*t)+1);},easeInElastic:function easeInElastic(t){var s=1.70158;var p=0;var a=1;if(t===0){return 0;}if((t/=1)===1){return 1;}if(!p){p=1*0.3;}if(a<Math.abs(1)){a=1;s=p/4;}else{s=p/(2*Math.PI)*Math.asin(1/a);}return-(a*Math.pow(2,10*(t-=1))*Math.sin((t*1-s)*(2*Math.PI)/p));},easeOutElastic:function easeOutElastic(t){var s=1.70158;var p=0;var a=1;if(t===0){return 0;}if((t/=1)===1){return 1;}if(!p){p=1*0.3;}if(a<Math.abs(1)){a=1;s=p/4;}else{s=p/(2*Math.PI)*Math.asin(1/a);}return a*Math.pow(2,-10*t)*Math.sin((t*1-s)*(2*Math.PI)/p)+1;},easeInOutElastic:function easeInOutElastic(t){var s=1.70158;var p=0;var a=1;if(t===0){return 0;}if((t/=1/2)===2){return 1;}if(!p){p=1*(0.3*1.5);}if(a<Math.abs(1)){a=1;s=p/4;}else{s=p/(2*Math.PI)*Math.asin(1/a);}if(t<1){return-0.5*(a*Math.pow(2,10*(t-=1))*Math.sin((t*1-s)*(2*Math.PI)/p));}return a*Math.pow(2,-10*(t-=1))*Math.sin((t*1-s)*(2*Math.PI)/p)*0.5+1;},easeInBack:function easeInBack(t){var s=1.70158;return 1*(t/=1)*t*((s+1)*t-s);},easeOutBack:function easeOutBack(t){var s=1.70158;return 1*((t=t/1-1)*t*((s+1)*t+s)+1);},easeInOutBack:function easeInOutBack(t){var s=1.70158;if((t/=1/2)<1){return 1/2*(t*t*(((s*=1.525)+1)*t-s));}return 1/2*((t-=2)*t*(((s*=1.525)+1)*t+s)+2);},easeInBounce:function easeInBounce(t){return 1-easingEffects.easeOutBounce(1-t);},easeOutBounce:function easeOutBounce(t){if((t/=1)<1/2.75){return 1*(7.5625*t*t);}else if(t<2/2.75){return 1*(7.5625*(t-=1.5/2.75)*t+0.75);}else if(t<2.5/2.75){return 1*(7.5625*(t-=2.25/2.75)*t+0.9375);}else{return 1*(7.5625*(t-=2.625/2.75)*t+0.984375);}},easeInOutBounce:function easeInOutBounce(t){if(t<1/2){return easingEffects.easeInBounce(t*2)*0.5;}return easingEffects.easeOutBounce(t*2-1)*0.5+1*0.5;}};//Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
helpers.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(callback){return window.setTimeout(callback,1000/60);};}();helpers.cancelAnimFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.oCancelAnimationFrame||window.msCancelAnimationFrame||function(callback){return window.clearTimeout(callback,1000/60);};}();//-- DOM methods
helpers.getRelativePosition=function(evt,chart){var mouseX,mouseY;var e=evt.originalEvent||evt,canvas=evt.currentTarget||evt.srcElement,boundingRect=canvas.getBoundingClientRect();var touches=e.touches;if(touches&&touches.length>0){mouseX=touches[0].clientX;mouseY=touches[0].clientY;}else{mouseX=e.clientX;mouseY=e.clientY;}// Scale mouse coordinates into canvas coordinates
// by following the pattern laid out by 'jerryj' in the comments of
// http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
var paddingLeft=parseFloat(helpers.getStyle(canvas,'padding-left'));var paddingTop=parseFloat(helpers.getStyle(canvas,'padding-top'));var paddingRight=parseFloat(helpers.getStyle(canvas,'padding-right'));var paddingBottom=parseFloat(helpers.getStyle(canvas,'padding-bottom'));var width=boundingRect.right-boundingRect.left-paddingLeft-paddingRight;var height=boundingRect.bottom-boundingRect.top-paddingTop-paddingBottom;// We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
// the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
mouseX=Math.round((mouseX-boundingRect.left-paddingLeft)/width*canvas.width/chart.currentDevicePixelRatio);mouseY=Math.round((mouseY-boundingRect.top-paddingTop)/height*canvas.height/chart.currentDevicePixelRatio);return{x:mouseX,y:mouseY};};helpers.addEvent=function(node,eventType,method){if(node.addEventListener){node.addEventListener(eventType,method);}else if(node.attachEvent){node.attachEvent("on"+eventType,method);}else{node["on"+eventType]=method;}};helpers.removeEvent=function(node,eventType,handler){if(node.removeEventListener){node.removeEventListener(eventType,handler,false);}else if(node.detachEvent){node.detachEvent("on"+eventType,handler);}else{node["on"+eventType]=helpers.noop;}};helpers.bindEvents=function(chartInstance,arrayOfEvents,handler){// Create the events object if it's not already present
var events=chartInstance.events=chartInstance.events||{};helpers.each(arrayOfEvents,function(eventName){events[eventName]=function(){handler.apply(chartInstance,arguments);};helpers.addEvent(chartInstance.chart.canvas,eventName,events[eventName]);});};helpers.unbindEvents=function(chartInstance,arrayOfEvents){var canvas=chartInstance.chart.canvas;helpers.each(arrayOfEvents,function(handler,eventName){helpers.removeEvent(canvas,eventName,handler);});};// Private helper function to convert max-width/max-height values that may be percentages into a number
function parseMaxStyle(styleValue,node,parentProperty){var valueInPixels;if(typeof styleValue==='string'){valueInPixels=parseInt(styleValue,10);if(styleValue.indexOf('%')!=-1){// percentage * size in dimension
valueInPixels=valueInPixels/100*node.parentNode[parentProperty];}}else{valueInPixels=styleValue;}return valueInPixels;}/**
	 * Returns if the given value contains an effective constraint.
	 * @private
	 */function isConstrainedValue(value){return value!==undefined&&value!==null&&value!=='none';}// Private helper to get a constraint dimension
// @param domNode : the node to check the constraint on
// @param maxStyle : the style that defines the maximum for the direction we are using (maxWidth / maxHeight)
// @param percentageProperty : property of parent to use when calculating width as a percentage
// @see http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser
function getConstraintDimension(domNode,maxStyle,percentageProperty){var view=document.defaultView;var parentNode=domNode.parentNode;var constrainedNode=view.getComputedStyle(domNode)[maxStyle];var constrainedContainer=view.getComputedStyle(parentNode)[maxStyle];var hasCNode=isConstrainedValue(constrainedNode);var hasCContainer=isConstrainedValue(constrainedContainer);var infinity=Number.POSITIVE_INFINITY;if(hasCNode||hasCContainer){return Math.min(hasCNode?parseMaxStyle(constrainedNode,domNode,percentageProperty):infinity,hasCContainer?parseMaxStyle(constrainedContainer,parentNode,percentageProperty):infinity);}return'none';}// returns Number or undefined if no constraint
helpers.getConstraintWidth=function(domNode){return getConstraintDimension(domNode,'max-width','clientWidth');};// returns Number or undefined if no constraint
helpers.getConstraintHeight=function(domNode){return getConstraintDimension(domNode,'max-height','clientHeight');};helpers.getMaximumWidth=function(domNode){var container=domNode.parentNode;var padding=parseInt(helpers.getStyle(container,'padding-left'))+parseInt(helpers.getStyle(container,'padding-right'));var w=container.clientWidth-padding;var cw=helpers.getConstraintWidth(domNode);return isNaN(cw)?w:Math.min(w,cw);};helpers.getMaximumHeight=function(domNode){var container=domNode.parentNode;var padding=parseInt(helpers.getStyle(container,'padding-top'))+parseInt(helpers.getStyle(container,'padding-bottom'));var h=container.clientHeight-padding;var ch=helpers.getConstraintHeight(domNode);return isNaN(ch)?h:Math.min(h,ch);};helpers.getStyle=function(el,property){return el.currentStyle?el.currentStyle[property]:document.defaultView.getComputedStyle(el,null).getPropertyValue(property);};helpers.retinaScale=function(chart){var ctx=chart.ctx;var canvas=chart.canvas;var width=canvas.width;var height=canvas.height;var pixelRatio=chart.currentDevicePixelRatio=window.devicePixelRatio||1;if(pixelRatio!==1){canvas.height=height*pixelRatio;canvas.width=width*pixelRatio;ctx.scale(pixelRatio,pixelRatio);// Store the device pixel ratio so that we can go backwards in `destroy`.
// The devicePixelRatio changes with zoom, so there are no guarantees that it is the same
// when destroy is called
chart.originalDevicePixelRatio=chart.originalDevicePixelRatio||pixelRatio;}canvas.style.width=width+'px';canvas.style.height=height+'px';};//-- Canvas methods
helpers.clear=function(chart){chart.ctx.clearRect(0,0,chart.width,chart.height);};helpers.fontString=function(pixelSize,fontStyle,fontFamily){return fontStyle+" "+pixelSize+"px "+fontFamily;};helpers.longestText=function(ctx,font,arrayOfThings,cache){cache=cache||{};var data=cache.data=cache.data||{};var gc=cache.garbageCollect=cache.garbageCollect||[];if(cache.font!==font){data=cache.data={};gc=cache.garbageCollect=[];cache.font=font;}ctx.font=font;var longest=0;helpers.each(arrayOfThings,function(thing){// Undefined strings and arrays should not be measured
if(thing!==undefined&&thing!==null&&helpers.isArray(thing)!==true){longest=helpers.measureText(ctx,data,gc,longest,thing);}else if(helpers.isArray(thing)){// if it is an array lets measure each element
// to do maybe simplify this function a bit so we can do this more recursively?
helpers.each(thing,function(nestedThing){// Undefined strings and arrays should not be measured
if(nestedThing!==undefined&&nestedThing!==null&&!helpers.isArray(nestedThing)){longest=helpers.measureText(ctx,data,gc,longest,nestedThing);}});}});var gcLen=gc.length/2;if(gcLen>arrayOfThings.length){for(var i=0;i<gcLen;i++){delete data[gc[i]];}gc.splice(0,gcLen);}return longest;};helpers.measureText=function(ctx,data,gc,longest,string){var textWidth=data[string];if(!textWidth){textWidth=data[string]=ctx.measureText(string).width;gc.push(string);}if(textWidth>longest){longest=textWidth;}return longest;};helpers.numberOfLabelLines=function(arrayOfThings){var numberOfLines=1;helpers.each(arrayOfThings,function(thing){if(helpers.isArray(thing)){if(thing.length>numberOfLines){numberOfLines=thing.length;}}});return numberOfLines;};helpers.drawRoundedRectangle=function(ctx,x,y,width,height,radius){ctx.beginPath();ctx.moveTo(x+radius,y);ctx.lineTo(x+width-radius,y);ctx.quadraticCurveTo(x+width,y,x+width,y+radius);ctx.lineTo(x+width,y+height-radius);ctx.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);ctx.lineTo(x+radius,y+height);ctx.quadraticCurveTo(x,y+height,x,y+height-radius);ctx.lineTo(x,y+radius);ctx.quadraticCurveTo(x,y,x+radius,y);ctx.closePath();};helpers.color=function(c){if(!color){console.log('Color.js not found!');return c;}/* global CanvasGradient */if(c instanceof CanvasGradient){return color(Chart.defaults.global.defaultColor);}return color(c);};helpers.addResizeListener=function(node,callback){// Hide an iframe before the node
var hiddenIframe=document.createElement('iframe');var hiddenIframeClass='chartjs-hidden-iframe';if(hiddenIframe.classlist){// can use classlist
hiddenIframe.classlist.add(hiddenIframeClass);}else{hiddenIframe.setAttribute('class',hiddenIframeClass);}// Set the style
var style=hiddenIframe.style;style.width='100%';style.display='block';style.border=0;style.height=0;style.margin=0;style.position='absolute';style.left=0;style.right=0;style.top=0;style.bottom=0;// Insert the iframe so that contentWindow is available
node.insertBefore(hiddenIframe,node.firstChild);(hiddenIframe.contentWindow||hiddenIframe).onresize=function(){if(callback){callback();}};};helpers.removeResizeListener=function(node){var hiddenIframe=node.querySelector('.chartjs-hidden-iframe');// Remove the resize detect iframe
if(hiddenIframe){hiddenIframe.parentNode.removeChild(hiddenIframe);}};helpers.isArray=Array.isArray?function(obj){return Array.isArray(obj);}:function(obj){return Object.prototype.toString.call(obj)==='[object Array]';};//! @see http://stackoverflow.com/a/14853974
helpers.arrayEquals=function(a0,a1){var i,ilen,v0,v1;if(!a0||!a1||a0.length!=a1.length){return false;}for(i=0,ilen=a0.length;i<ilen;++i){v0=a0[i];v1=a1[i];if(v0 instanceof Array&&v1 instanceof Array){if(!helpers.arrayEquals(v0,v1)){return false;}}else if(v0!=v1){// NOTE: two different object instances will never be equal: {x:20} != {x:20}
return false;}}return true;};helpers.callCallback=function(fn,args,_tArg){if(fn&&typeof fn.call==='function'){fn.apply(_tArg,args);}};helpers.getHoverColor=function(color){/* global CanvasPattern */return color instanceof CanvasPattern?color:helpers.color(color).saturate(0.5).darken(0.1).rgbString();};};},{"3":3}],26:[function(require,module,exports){"use strict";module.exports=function(){//Occupy the global variable of Chart, and create a simple base class
var Chart=function Chart(context,config){var me=this;var helpers=Chart.helpers;me.config=config;// Support a jQuery'd canvas element
if(context.length&&context[0].getContext){context=context[0];}// Support a canvas domnode
if(context.getContext){context=context.getContext("2d");}me.ctx=context;me.canvas=context.canvas;context.canvas.style.display=context.canvas.style.display||'block';// Figure out what the size of the chart will be.
// If the canvas has a specified width and height, we use those else
// we look to see if the canvas node has a CSS width and height.
// If there is still no height, fill the parent container
me.width=context.canvas.width||parseInt(helpers.getStyle(context.canvas,'width'),10)||helpers.getMaximumWidth(context.canvas);me.height=context.canvas.height||parseInt(helpers.getStyle(context.canvas,'height'),10)||helpers.getMaximumHeight(context.canvas);me.aspectRatio=me.width/me.height;if(isNaN(me.aspectRatio)||isFinite(me.aspectRatio)===false){// If the canvas has no size, try and figure out what the aspect ratio will be.
// Some charts prefer square canvases (pie, radar, etc). If that is specified, use that
// else use the canvas default ratio of 2
me.aspectRatio=config.aspectRatio!==undefined?config.aspectRatio:2;}// Store the original style of the element so we can set it back
me.originalCanvasStyleWidth=context.canvas.style.width;me.originalCanvasStyleHeight=context.canvas.style.height;// High pixel density displays - multiply the size of the canvas height/width by the device pixel ratio, then scale.
helpers.retinaScale(me);if(config){me.controller=new Chart.Controller(me);}// Always bind this so that if the responsive state changes we still work
helpers.addResizeListener(context.canvas.parentNode,function(){if(me.controller&&me.controller.config.options.responsive){me.controller.resize();}});return me.controller?me.controller:me;};//Globally expose the defaults to allow for user updating/changing
Chart.defaults={global:{responsive:true,responsiveAnimationDuration:0,maintainAspectRatio:true,events:["mousemove","mouseout","click","touchstart","touchmove"],hover:{onHover:null,mode:'single',animationDuration:400},onClick:null,defaultColor:'rgba(0,0,0,0.1)',defaultFontColor:'#666',defaultFontFamily:"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",defaultFontSize:12,defaultFontStyle:'normal',showLines:true,// Element defaults defined in element extensions
elements:{},// Legend callback string
legendCallback:function legendCallback(chart){var text=[];text.push('<ul class="'+chart.id+'-legend">');for(var i=0;i<chart.data.datasets.length;i++){text.push('<li><span style="background-color:'+chart.data.datasets[i].backgroundColor+'"></span>');if(chart.data.datasets[i].label){text.push(chart.data.datasets[i].label);}text.push('</li>');}text.push('</ul>');return text.join("");}}};Chart.Chart=Chart;return Chart;};},{}],27:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;// The layout service is very self explanatory.  It's responsible for the layout within a chart.
// Scales, Legends and Plugins all rely on the layout service and can easily register to be placed anywhere they need
// It is this service's responsibility of carrying out that layout.
Chart.layoutService={defaults:{},// Register a box to a chartInstance. A box is simply a reference to an object that requires layout. eg. Scales, Legend, Plugins.
addBox:function addBox(chartInstance,box){if(!chartInstance.boxes){chartInstance.boxes=[];}chartInstance.boxes.push(box);},removeBox:function removeBox(chartInstance,box){if(!chartInstance.boxes){return;}chartInstance.boxes.splice(chartInstance.boxes.indexOf(box),1);},// The most important function
update:function update(chartInstance,width,height){if(!chartInstance){return;}var xPadding=0;var yPadding=0;var leftBoxes=helpers.where(chartInstance.boxes,function(box){return box.options.position==="left";});var rightBoxes=helpers.where(chartInstance.boxes,function(box){return box.options.position==="right";});var topBoxes=helpers.where(chartInstance.boxes,function(box){return box.options.position==="top";});var bottomBoxes=helpers.where(chartInstance.boxes,function(box){return box.options.position==="bottom";});// Boxes that overlay the chartarea such as the radialLinear scale
var chartAreaBoxes=helpers.where(chartInstance.boxes,function(box){return box.options.position==="chartArea";});// Ensure that full width boxes are at the very top / bottom
topBoxes.sort(function(a,b){return(b.options.fullWidth?1:0)-(a.options.fullWidth?1:0);});bottomBoxes.sort(function(a,b){return(a.options.fullWidth?1:0)-(b.options.fullWidth?1:0);});// Essentially we now have any number of boxes on each of the 4 sides.
// Our canvas looks like the following.
// The areas L1 and L2 are the left axes. R1 is the right axis, T1 is the top axis and
// B1 is the bottom axis
// There are also 4 quadrant-like locations (left to right instead of clockwise) reserved for chart overlays
// These locations are single-box locations only, when trying to register a chartArea location that is already taken,
// an error will be thrown.
//
// |----------------------------------------------------|
// |                  T1 (Full Width)                   |
// |----------------------------------------------------|
// |    |    |                 T2                  |    |
// |    |----|-------------------------------------|----|
// |    |    | C1 |                           | C2 |    |
// |    |    |----|                           |----|    |
// |    |    |                                     |    |
// | L1 | L2 |           ChartArea (C0)            | R1 |
// |    |    |                                     |    |
// |    |    |----|                           |----|    |
// |    |    | C3 |                           | C4 |    |
// |    |----|-------------------------------------|----|
// |    |    |                 B1                  |    |
// |----------------------------------------------------|
// |                  B2 (Full Width)                   |
// |----------------------------------------------------|
//
// What we do to find the best sizing, we do the following
// 1. Determine the minimum size of the chart area.
// 2. Split the remaining width equally between each vertical axis
// 3. Split the remaining height equally between each horizontal axis
// 4. Give each layout the maximum size it can be. The layout will return it's minimum size
// 5. Adjust the sizes of each axis based on it's minimum reported size.
// 6. Refit each axis
// 7. Position each axis in the final location
// 8. Tell the chart the final location of the chart area
// 9. Tell any axes that overlay the chart area the positions of the chart area
// Step 1
var chartWidth=width-2*xPadding;var chartHeight=height-2*yPadding;var chartAreaWidth=chartWidth/2;// min 50%
var chartAreaHeight=chartHeight/2;// min 50%
// Step 2
var verticalBoxWidth=(width-chartAreaWidth)/(leftBoxes.length+rightBoxes.length);// Step 3
var horizontalBoxHeight=(height-chartAreaHeight)/(topBoxes.length+bottomBoxes.length);// Step 4
var maxChartAreaWidth=chartWidth;var maxChartAreaHeight=chartHeight;var minBoxSizes=[];helpers.each(leftBoxes.concat(rightBoxes,topBoxes,bottomBoxes),getMinimumBoxSize);function getMinimumBoxSize(box){var minSize;var isHorizontal=box.isHorizontal();if(isHorizontal){minSize=box.update(box.options.fullWidth?chartWidth:maxChartAreaWidth,horizontalBoxHeight);maxChartAreaHeight-=minSize.height;}else{minSize=box.update(verticalBoxWidth,chartAreaHeight);maxChartAreaWidth-=minSize.width;}minBoxSizes.push({horizontal:isHorizontal,minSize:minSize,box:box});}// At this point, maxChartAreaHeight and maxChartAreaWidth are the size the chart area could
// be if the axes are drawn at their minimum sizes.
// Steps 5 & 6
var totalLeftBoxesWidth=xPadding;var totalRightBoxesWidth=xPadding;var totalTopBoxesHeight=yPadding;var totalBottomBoxesHeight=yPadding;// Update, and calculate the left and right margins for the horizontal boxes
helpers.each(leftBoxes.concat(rightBoxes),fitBox);helpers.each(leftBoxes,function(box){totalLeftBoxesWidth+=box.width;});helpers.each(rightBoxes,function(box){totalRightBoxesWidth+=box.width;});// Set the Left and Right margins for the horizontal boxes
helpers.each(topBoxes.concat(bottomBoxes),fitBox);// Function to fit a box
function fitBox(box){var minBoxSize=helpers.findNextWhere(minBoxSizes,function(minBoxSize){return minBoxSize.box===box;});if(minBoxSize){if(box.isHorizontal()){var scaleMargin={left:totalLeftBoxesWidth,right:totalRightBoxesWidth,top:0,bottom:0};// Don't use min size here because of label rotation. When the labels are rotated, their rotation highly depends
// on the margin. Sometimes they need to increase in size slightly
box.update(box.options.fullWidth?chartWidth:maxChartAreaWidth,chartHeight/2,scaleMargin);}else{box.update(minBoxSize.minSize.width,maxChartAreaHeight);}}}// Figure out how much margin is on the top and bottom of the vertical boxes
helpers.each(topBoxes,function(box){totalTopBoxesHeight+=box.height;});helpers.each(bottomBoxes,function(box){totalBottomBoxesHeight+=box.height;});// Let the left layout know the final margin
helpers.each(leftBoxes.concat(rightBoxes),finalFitVerticalBox);function finalFitVerticalBox(box){var minBoxSize=helpers.findNextWhere(minBoxSizes,function(minBoxSize){return minBoxSize.box===box;});var scaleMargin={left:0,right:0,top:totalTopBoxesHeight,bottom:totalBottomBoxesHeight};if(minBoxSize){box.update(minBoxSize.minSize.width,maxChartAreaHeight,scaleMargin);}}// Recalculate because the size of each layout might have changed slightly due to the margins (label rotation for instance)
totalLeftBoxesWidth=xPadding;totalRightBoxesWidth=xPadding;totalTopBoxesHeight=yPadding;totalBottomBoxesHeight=yPadding;helpers.each(leftBoxes,function(box){totalLeftBoxesWidth+=box.width;});helpers.each(rightBoxes,function(box){totalRightBoxesWidth+=box.width;});helpers.each(topBoxes,function(box){totalTopBoxesHeight+=box.height;});helpers.each(bottomBoxes,function(box){totalBottomBoxesHeight+=box.height;});// Figure out if our chart area changed. This would occur if the dataset layout label rotation
// changed due to the application of the margins in step 6. Since we can only get bigger, this is safe to do
// without calling `fit` again
var newMaxChartAreaHeight=height-totalTopBoxesHeight-totalBottomBoxesHeight;var newMaxChartAreaWidth=width-totalLeftBoxesWidth-totalRightBoxesWidth;if(newMaxChartAreaWidth!==maxChartAreaWidth||newMaxChartAreaHeight!==maxChartAreaHeight){helpers.each(leftBoxes,function(box){box.height=newMaxChartAreaHeight;});helpers.each(rightBoxes,function(box){box.height=newMaxChartAreaHeight;});helpers.each(topBoxes,function(box){if(!box.options.fullWidth){box.width=newMaxChartAreaWidth;}});helpers.each(bottomBoxes,function(box){if(!box.options.fullWidth){box.width=newMaxChartAreaWidth;}});maxChartAreaHeight=newMaxChartAreaHeight;maxChartAreaWidth=newMaxChartAreaWidth;}// Step 7 - Position the boxes
var left=xPadding;var top=yPadding;var right=0;var bottom=0;helpers.each(leftBoxes.concat(topBoxes),placeBox);// Account for chart width and height
left+=maxChartAreaWidth;top+=maxChartAreaHeight;helpers.each(rightBoxes,placeBox);helpers.each(bottomBoxes,placeBox);function placeBox(box){if(box.isHorizontal()){box.left=box.options.fullWidth?xPadding:totalLeftBoxesWidth;box.right=box.options.fullWidth?width-xPadding:totalLeftBoxesWidth+maxChartAreaWidth;box.top=top;box.bottom=top+box.height;// Move to next point
top=box.bottom;}else{box.left=left;box.right=left+box.width;box.top=totalTopBoxesHeight;box.bottom=totalTopBoxesHeight+maxChartAreaHeight;// Move to next point
left=box.right;}}// Step 8
chartInstance.chartArea={left:totalLeftBoxesWidth,top:totalTopBoxesHeight,right:totalLeftBoxesWidth+maxChartAreaWidth,bottom:totalTopBoxesHeight+maxChartAreaHeight};// Step 9
helpers.each(chartAreaBoxes,function(box){box.left=chartInstance.chartArea.left;box.top=chartInstance.chartArea.top;box.right=chartInstance.chartArea.right;box.bottom=chartInstance.chartArea.bottom;box.update(maxChartAreaWidth,maxChartAreaHeight);});}};};},{}],28:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;var noop=helpers.noop;Chart.defaults.global.legend={display:true,position:'top',fullWidth:true,// marks that this box should take the full width of the canvas (pushing down other boxes)
reverse:false,// a callback that will handle
onClick:function onClick(e,legendItem){var index=legendItem.datasetIndex;var ci=this.chart;var meta=ci.getDatasetMeta(index);// See controller.isDatasetVisible comment
meta.hidden=meta.hidden===null?!ci.data.datasets[index].hidden:null;// We hid a dataset ... rerender the chart
ci.update();},labels:{boxWidth:40,padding:10,// Generates labels shown in the legend
// Valid properties to return:
// text : text to display
// fillStyle : fill of coloured box
// strokeStyle: stroke of coloured box
// hidden : if this legend item refers to a hidden item
// lineCap : cap style for line
// lineDash
// lineDashOffset :
// lineJoin :
// lineWidth :
generateLabels:function generateLabels(chart){var data=chart.data;return helpers.isArray(data.datasets)?data.datasets.map(function(dataset,i){return{text:dataset.label,fillStyle:!helpers.isArray(dataset.backgroundColor)?dataset.backgroundColor:dataset.backgroundColor[0],hidden:!chart.isDatasetVisible(i),lineCap:dataset.borderCapStyle,lineDash:dataset.borderDash,lineDashOffset:dataset.borderDashOffset,lineJoin:dataset.borderJoinStyle,lineWidth:dataset.borderWidth,strokeStyle:dataset.borderColor,// Below is extra data used for toggling the datasets
datasetIndex:i};},this):[];}}};Chart.Legend=Chart.Element.extend({initialize:function initialize(config){helpers.extend(this,config);// Contains hit boxes for each dataset (in dataset order)
this.legendHitBoxes=[];// Are we in doughnut mode which has a different data type
this.doughnutMode=false;},// These methods are ordered by lifecyle. Utilities then follow.
// Any function defined here is inherited by all legend types.
// Any function can be extended by the legend type
beforeUpdate:noop,update:function update(maxWidth,maxHeight,margins){var me=this;// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
me.beforeUpdate();// Absorb the master measurements
me.maxWidth=maxWidth;me.maxHeight=maxHeight;me.margins=margins;// Dimensions
me.beforeSetDimensions();me.setDimensions();me.afterSetDimensions();// Labels
me.beforeBuildLabels();me.buildLabels();me.afterBuildLabels();// Fit
me.beforeFit();me.fit();me.afterFit();//
me.afterUpdate();return me.minSize;},afterUpdate:noop,//
beforeSetDimensions:noop,setDimensions:function setDimensions(){var me=this;// Set the unconstrained dimension before label rotation
if(me.isHorizontal()){// Reset position before calculating rotation
me.width=me.maxWidth;me.left=0;me.right=me.width;}else{me.height=me.maxHeight;// Reset position before calculating rotation
me.top=0;me.bottom=me.height;}// Reset padding
me.paddingLeft=0;me.paddingTop=0;me.paddingRight=0;me.paddingBottom=0;// Reset minSize
me.minSize={width:0,height:0};},afterSetDimensions:noop,//
beforeBuildLabels:noop,buildLabels:function buildLabels(){var me=this;me.legendItems=me.options.labels.generateLabels.call(me,me.chart);if(me.options.reverse){me.legendItems.reverse();}},afterBuildLabels:noop,//
beforeFit:noop,fit:function fit(){var me=this;var opts=me.options;var labelOpts=opts.labels;var display=opts.display;var ctx=me.ctx;var globalDefault=Chart.defaults.global,itemOrDefault=helpers.getValueOrDefault,fontSize=itemOrDefault(labelOpts.fontSize,globalDefault.defaultFontSize),fontStyle=itemOrDefault(labelOpts.fontStyle,globalDefault.defaultFontStyle),fontFamily=itemOrDefault(labelOpts.fontFamily,globalDefault.defaultFontFamily),labelFont=helpers.fontString(fontSize,fontStyle,fontFamily);// Reset hit boxes
var hitboxes=me.legendHitBoxes=[];var minSize=me.minSize;var isHorizontal=me.isHorizontal();if(isHorizontal){minSize.width=me.maxWidth;// fill all the width
minSize.height=display?10:0;}else{minSize.width=display?10:0;minSize.height=me.maxHeight;// fill all the height
}// Increase sizes here
if(display){ctx.font=labelFont;if(isHorizontal){// Labels
// Width of each line of legend boxes. Labels wrap onto multiple lines when there are too many to fit on one
var lineWidths=me.lineWidths=[0];var totalHeight=me.legendItems.length?fontSize+labelOpts.padding:0;ctx.textAlign="left";ctx.textBaseline='top';helpers.each(me.legendItems,function(legendItem,i){var width=labelOpts.boxWidth+fontSize/2+ctx.measureText(legendItem.text).width;if(lineWidths[lineWidths.length-1]+width+labelOpts.padding>=me.width){totalHeight+=fontSize+labelOpts.padding;lineWidths[lineWidths.length]=me.left;}// Store the hitbox width and height here. Final position will be updated in `draw`
hitboxes[i]={left:0,top:0,width:width,height:fontSize};lineWidths[lineWidths.length-1]+=width+labelOpts.padding;});minSize.height+=totalHeight;}else{var vPadding=labelOpts.padding;var columnWidths=me.columnWidths=[];var totalWidth=labelOpts.padding;var currentColWidth=0;var currentColHeight=0;var itemHeight=fontSize+vPadding;helpers.each(me.legendItems,function(legendItem,i){var itemWidth=labelOpts.boxWidth+fontSize/2+ctx.measureText(legendItem.text).width;// If too tall, go to new column
if(currentColHeight+itemHeight>minSize.height){totalWidth+=currentColWidth+labelOpts.padding;columnWidths.push(currentColWidth);// previous column width
currentColWidth=0;currentColHeight=0;}// Get max width
currentColWidth=Math.max(currentColWidth,itemWidth);currentColHeight+=itemHeight;// Store the hitbox width and height here. Final position will be updated in `draw`
hitboxes[i]={left:0,top:0,width:itemWidth,height:fontSize};});totalWidth+=currentColWidth;columnWidths.push(currentColWidth);minSize.width+=totalWidth;}}me.width=minSize.width;me.height=minSize.height;},afterFit:noop,// Shared Methods
isHorizontal:function isHorizontal(){return this.options.position==="top"||this.options.position==="bottom";},// Actualy draw the legend on the canvas
draw:function draw(){var me=this;var opts=me.options;var labelOpts=opts.labels;var globalDefault=Chart.defaults.global,lineDefault=globalDefault.elements.line,legendWidth=me.width,legendHeight=me.height,lineWidths=me.lineWidths;if(opts.display){var ctx=me.ctx,cursor,itemOrDefault=helpers.getValueOrDefault,fontColor=itemOrDefault(labelOpts.fontColor,globalDefault.defaultFontColor),fontSize=itemOrDefault(labelOpts.fontSize,globalDefault.defaultFontSize),fontStyle=itemOrDefault(labelOpts.fontStyle,globalDefault.defaultFontStyle),fontFamily=itemOrDefault(labelOpts.fontFamily,globalDefault.defaultFontFamily),labelFont=helpers.fontString(fontSize,fontStyle,fontFamily);// Canvas setup
ctx.textAlign="left";ctx.textBaseline='top';ctx.lineWidth=0.5;ctx.strokeStyle=fontColor;// for strikethrough effect
ctx.fillStyle=fontColor;// render in correct colour
ctx.font=labelFont;var boxWidth=labelOpts.boxWidth,hitboxes=me.legendHitBoxes;// current position
var drawLegendBox=function drawLegendBox(x,y,legendItem){// Set the ctx for the box
ctx.save();ctx.fillStyle=itemOrDefault(legendItem.fillStyle,globalDefault.defaultColor);ctx.lineCap=itemOrDefault(legendItem.lineCap,lineDefault.borderCapStyle);ctx.lineDashOffset=itemOrDefault(legendItem.lineDashOffset,lineDefault.borderDashOffset);ctx.lineJoin=itemOrDefault(legendItem.lineJoin,lineDefault.borderJoinStyle);ctx.lineWidth=itemOrDefault(legendItem.lineWidth,lineDefault.borderWidth);ctx.strokeStyle=itemOrDefault(legendItem.strokeStyle,globalDefault.defaultColor);if(ctx.setLineDash){// IE 9 and 10 do not support line dash
ctx.setLineDash(itemOrDefault(legendItem.lineDash,lineDefault.borderDash));}// Draw the box
ctx.strokeRect(x,y,boxWidth,fontSize);ctx.fillRect(x,y,boxWidth,fontSize);ctx.restore();};var fillText=function fillText(x,y,legendItem,textWidth){ctx.fillText(legendItem.text,boxWidth+fontSize/2+x,y);if(legendItem.hidden){// Strikethrough the text if hidden
ctx.beginPath();ctx.lineWidth=2;ctx.moveTo(boxWidth+fontSize/2+x,y+fontSize/2);ctx.lineTo(boxWidth+fontSize/2+x+textWidth,y+fontSize/2);ctx.stroke();}};// Horizontal
var isHorizontal=me.isHorizontal();if(isHorizontal){cursor={x:me.left+(legendWidth-lineWidths[0])/2,y:me.top+labelOpts.padding,line:0};}else{cursor={x:me.left+labelOpts.padding,y:me.top,line:0};}var itemHeight=fontSize+labelOpts.padding;helpers.each(me.legendItems,function(legendItem,i){var textWidth=ctx.measureText(legendItem.text).width,width=boxWidth+fontSize/2+textWidth,x=cursor.x,y=cursor.y;if(isHorizontal){if(x+width>=legendWidth){y=cursor.y+=fontSize+labelOpts.padding;cursor.line++;x=cursor.x=me.left+(legendWidth-lineWidths[cursor.line])/2;}}else{if(y+itemHeight>me.bottom){x=cursor.x=x+me.columnWidths[cursor.line]+labelOpts.padding;y=cursor.y=me.top;cursor.line++;}}drawLegendBox(x,y,legendItem);hitboxes[i].left=x;hitboxes[i].top=y;// Fill the actual label
fillText(x,y,legendItem,textWidth);if(isHorizontal){cursor.x+=width+labelOpts.padding;}else{cursor.y+=itemHeight;}});}},// Handle an event
handleEvent:function handleEvent(e){var me=this;var position=helpers.getRelativePosition(e,me.chart.chart),x=position.x,y=position.y,opts=me.options;if(x>=me.left&&x<=me.right&&y>=me.top&&y<=me.bottom){// See if we are touching one of the dataset boxes
var lh=me.legendHitBoxes;for(var i=0;i<lh.length;++i){var hitBox=lh[i];if(x>=hitBox.left&&x<=hitBox.left+hitBox.width&&y>=hitBox.top&&y<=hitBox.top+hitBox.height){// Touching an element
if(opts.onClick){opts.onClick.call(me,e,me.legendItems[i]);}break;}}}}});// Register the legend plugin
Chart.plugins.register({beforeInit:function beforeInit(chartInstance){var opts=chartInstance.options;var legendOpts=opts.legend;if(legendOpts){chartInstance.legend=new Chart.Legend({ctx:chartInstance.chart.ctx,options:legendOpts,chart:chartInstance});Chart.layoutService.addBox(chartInstance,chartInstance.legend);}}});};},{}],29:[function(require,module,exports){"use strict";module.exports=function(Chart){var noop=Chart.helpers.noop;/**
	 * The plugin service singleton
	 * @namespace Chart.plugins
	 * @since 2.1.0
	 */Chart.plugins={_plugins:[],/**
		 * Registers the given plugin(s) if not already registered.
		 * @param {Array|Object} plugins plugin instance(s).
		 */register:function register(plugins){var p=this._plugins;[].concat(plugins).forEach(function(plugin){if(p.indexOf(plugin)===-1){p.push(plugin);}});},/**
		 * Unregisters the given plugin(s) only if registered.
		 * @param {Array|Object} plugins plugin instance(s).
		 */unregister:function unregister(plugins){var p=this._plugins;[].concat(plugins).forEach(function(plugin){var idx=p.indexOf(plugin);if(idx!==-1){p.splice(idx,1);}});},/**
		 * Remove all registered p^lugins.
		 * @since 2.1.5
		 */clear:function clear(){this._plugins=[];},/**
		 * Returns the number of registered plugins?
		 * @returns {Number}
		 * @since 2.1.5
		 */count:function count(){return this._plugins.length;},/**
		 * Returns all registered plugin intances.
		 * @returns {Array} array of plugin objects.
		 * @since 2.1.5
		 */getAll:function getAll(){return this._plugins;},/**
		 * Calls registered plugins on the specified extension, with the given args. This
		 * method immediately returns as soon as a plugin explicitly returns false. The
		 * returned value can be used, for instance, to interrupt the current action.
		 * @param {String} extension the name of the plugin method to call (e.g. 'beforeUpdate').
		 * @param {Array} [args] extra arguments to apply to the extension call.
		 * @returns {Boolean} false if any of the plugins return false, else returns true.
		 */notify:function notify(extension,args){var plugins=this._plugins;var ilen=plugins.length;var i,plugin;for(i=0;i<ilen;++i){plugin=plugins[i];if(typeof plugin[extension]==='function'){if(plugin[extension].apply(plugin,args||[])===false){return false;}}}return true;}};/**
	 * Plugin extension methods.
	 * @interface Chart.PluginBase
	 * @since 2.1.0
	 */Chart.PluginBase=Chart.Element.extend({// Called at start of chart init
beforeInit:noop,// Called at end of chart init
afterInit:noop,// Called at start of update
beforeUpdate:noop,// Called at end of update
afterUpdate:noop,// Called at start of draw
beforeDraw:noop,// Called at end of draw
afterDraw:noop,// Called during destroy
destroy:noop});/**
	 * Provided for backward compatibility, use Chart.plugins instead
	 * @namespace Chart.pluginService
	 * @deprecated since version 2.1.5
	 * @todo remove me at version 3
	 */Chart.pluginService=Chart.plugins;};},{}],30:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.scale={display:true,position:"left",// grid line settings
gridLines:{display:true,color:"rgba(0, 0, 0, 0.1)",lineWidth:1,drawBorder:true,drawOnChartArea:true,drawTicks:true,tickMarkLength:10,zeroLineWidth:1,zeroLineColor:"rgba(0,0,0,0.25)",offsetGridLines:false},// scale label
scaleLabel:{// actual label
labelString:'',// display property
display:false},// label settings
ticks:{beginAtZero:false,minRotation:0,maxRotation:50,mirror:false,padding:10,reverse:false,display:true,autoSkip:true,autoSkipPadding:0,labelOffset:0,// We pass through arrays to be rendered as multiline labels, we convert Others to strings here.
callback:function callback(value){return helpers.isArray(value)?value:''+value;}}};Chart.Scale=Chart.Element.extend({// These methods are ordered by lifecyle. Utilities then follow.
// Any function defined here is inherited by all scale types.
// Any function can be extended by the scale type
beforeUpdate:function beforeUpdate(){helpers.callCallback(this.options.beforeUpdate,[this]);},update:function update(maxWidth,maxHeight,margins){var me=this;// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
me.beforeUpdate();// Absorb the master measurements
me.maxWidth=maxWidth;me.maxHeight=maxHeight;me.margins=helpers.extend({left:0,right:0,top:0,bottom:0},margins);// Dimensions
me.beforeSetDimensions();me.setDimensions();me.afterSetDimensions();// Data min/max
me.beforeDataLimits();me.determineDataLimits();me.afterDataLimits();// Ticks
me.beforeBuildTicks();me.buildTicks();me.afterBuildTicks();me.beforeTickToLabelConversion();me.convertTicksToLabels();me.afterTickToLabelConversion();// Tick Rotation
me.beforeCalculateTickRotation();me.calculateTickRotation();me.afterCalculateTickRotation();// Fit
me.beforeFit();me.fit();me.afterFit();//
me.afterUpdate();return me.minSize;},afterUpdate:function afterUpdate(){helpers.callCallback(this.options.afterUpdate,[this]);},//
beforeSetDimensions:function beforeSetDimensions(){helpers.callCallback(this.options.beforeSetDimensions,[this]);},setDimensions:function setDimensions(){var me=this;// Set the unconstrained dimension before label rotation
if(me.isHorizontal()){// Reset position before calculating rotation
me.width=me.maxWidth;me.left=0;me.right=me.width;}else{me.height=me.maxHeight;// Reset position before calculating rotation
me.top=0;me.bottom=me.height;}// Reset padding
me.paddingLeft=0;me.paddingTop=0;me.paddingRight=0;me.paddingBottom=0;},afterSetDimensions:function afterSetDimensions(){helpers.callCallback(this.options.afterSetDimensions,[this]);},// Data limits
beforeDataLimits:function beforeDataLimits(){helpers.callCallback(this.options.beforeDataLimits,[this]);},determineDataLimits:helpers.noop,afterDataLimits:function afterDataLimits(){helpers.callCallback(this.options.afterDataLimits,[this]);},//
beforeBuildTicks:function beforeBuildTicks(){helpers.callCallback(this.options.beforeBuildTicks,[this]);},buildTicks:helpers.noop,afterBuildTicks:function afterBuildTicks(){helpers.callCallback(this.options.afterBuildTicks,[this]);},beforeTickToLabelConversion:function beforeTickToLabelConversion(){helpers.callCallback(this.options.beforeTickToLabelConversion,[this]);},convertTicksToLabels:function convertTicksToLabels(){var me=this;// Convert ticks to strings
me.ticks=me.ticks.map(function(numericalTick,index,ticks){if(me.options.ticks.userCallback){return me.options.ticks.userCallback(numericalTick,index,ticks);}return me.options.ticks.callback(numericalTick,index,ticks);},me);},afterTickToLabelConversion:function afterTickToLabelConversion(){helpers.callCallback(this.options.afterTickToLabelConversion,[this]);},//
beforeCalculateTickRotation:function beforeCalculateTickRotation(){helpers.callCallback(this.options.beforeCalculateTickRotation,[this]);},calculateTickRotation:function calculateTickRotation(){var me=this;var context=me.ctx;var globalDefaults=Chart.defaults.global;var optionTicks=me.options.ticks;//Get the width of each grid by calculating the difference
//between x offsets between 0 and 1.
var tickFontSize=helpers.getValueOrDefault(optionTicks.fontSize,globalDefaults.defaultFontSize);var tickFontStyle=helpers.getValueOrDefault(optionTicks.fontStyle,globalDefaults.defaultFontStyle);var tickFontFamily=helpers.getValueOrDefault(optionTicks.fontFamily,globalDefaults.defaultFontFamily);var tickLabelFont=helpers.fontString(tickFontSize,tickFontStyle,tickFontFamily);context.font=tickLabelFont;var firstWidth=context.measureText(me.ticks[0]).width;var lastWidth=context.measureText(me.ticks[me.ticks.length-1]).width;var firstRotated;me.labelRotation=optionTicks.minRotation||0;me.paddingRight=0;me.paddingLeft=0;if(me.options.display){if(me.isHorizontal()){me.paddingRight=lastWidth/2+3;me.paddingLeft=firstWidth/2+3;if(!me.longestTextCache){me.longestTextCache={};}var originalLabelWidth=helpers.longestText(context,tickLabelFont,me.ticks,me.longestTextCache);var labelWidth=originalLabelWidth;var cosRotation;var sinRotation;// Allow 3 pixels x2 padding either side for label readability
// only the index matters for a dataset scale, but we want a consistent interface between scales
var tickWidth=me.getPixelForTick(1)-me.getPixelForTick(0)-6;//Max label rotation can be set or default to 90 - also act as a loop counter
while(labelWidth>tickWidth&&me.labelRotation<optionTicks.maxRotation){cosRotation=Math.cos(helpers.toRadians(me.labelRotation));sinRotation=Math.sin(helpers.toRadians(me.labelRotation));firstRotated=cosRotation*firstWidth;// We're right aligning the text now.
if(firstRotated+tickFontSize/2>me.yLabelWidth){me.paddingLeft=firstRotated+tickFontSize/2;}me.paddingRight=tickFontSize/2;if(sinRotation*originalLabelWidth>me.maxHeight){// go back one step
me.labelRotation--;break;}me.labelRotation++;labelWidth=cosRotation*originalLabelWidth;}}}if(me.margins){me.paddingLeft=Math.max(me.paddingLeft-me.margins.left,0);me.paddingRight=Math.max(me.paddingRight-me.margins.right,0);}},afterCalculateTickRotation:function afterCalculateTickRotation(){helpers.callCallback(this.options.afterCalculateTickRotation,[this]);},//
beforeFit:function beforeFit(){helpers.callCallback(this.options.beforeFit,[this]);},fit:function fit(){var me=this;// Reset
var minSize=me.minSize={width:0,height:0};var opts=me.options;var globalDefaults=Chart.defaults.global;var tickOpts=opts.ticks;var scaleLabelOpts=opts.scaleLabel;var display=opts.display;var isHorizontal=me.isHorizontal();var tickFontSize=helpers.getValueOrDefault(tickOpts.fontSize,globalDefaults.defaultFontSize);var tickFontStyle=helpers.getValueOrDefault(tickOpts.fontStyle,globalDefaults.defaultFontStyle);var tickFontFamily=helpers.getValueOrDefault(tickOpts.fontFamily,globalDefaults.defaultFontFamily);var tickLabelFont=helpers.fontString(tickFontSize,tickFontStyle,tickFontFamily);var scaleLabelFontSize=helpers.getValueOrDefault(scaleLabelOpts.fontSize,globalDefaults.defaultFontSize);var scaleLabelFontStyle=helpers.getValueOrDefault(scaleLabelOpts.fontStyle,globalDefaults.defaultFontStyle);var scaleLabelFontFamily=helpers.getValueOrDefault(scaleLabelOpts.fontFamily,globalDefaults.defaultFontFamily);var scaleLabelFont=helpers.fontString(scaleLabelFontSize,scaleLabelFontStyle,scaleLabelFontFamily);var tickMarkLength=opts.gridLines.tickMarkLength;// Width
if(isHorizontal){// subtract the margins to line up with the chartArea if we are a full width scale
minSize.width=me.isFullWidth()?me.maxWidth-me.margins.left-me.margins.right:me.maxWidth;}else{minSize.width=display?tickMarkLength:0;}// height
if(isHorizontal){minSize.height=display?tickMarkLength:0;}else{minSize.height=me.maxHeight;// fill all the height
}// Are we showing a title for the scale?
if(scaleLabelOpts.display&&display){if(isHorizontal){minSize.height+=scaleLabelFontSize*1.5;}else{minSize.width+=scaleLabelFontSize*1.5;}}if(tickOpts.display&&display){// Don't bother fitting the ticks if we are not showing them
if(!me.longestTextCache){me.longestTextCache={};}var largestTextWidth=helpers.longestText(me.ctx,tickLabelFont,me.ticks,me.longestTextCache);var tallestLabelHeightInLines=helpers.numberOfLabelLines(me.ticks);var lineSpace=tickFontSize*0.5;if(isHorizontal){// A horizontal axis is more constrained by the height.
me.longestLabelWidth=largestTextWidth;// TODO - improve this calculation
var labelHeight=Math.sin(helpers.toRadians(me.labelRotation))*me.longestLabelWidth+tickFontSize*tallestLabelHeightInLines+lineSpace*tallestLabelHeightInLines;minSize.height=Math.min(me.maxHeight,minSize.height+labelHeight);me.ctx.font=tickLabelFont;var firstLabelWidth=me.ctx.measureText(me.ticks[0]).width;var lastLabelWidth=me.ctx.measureText(me.ticks[me.ticks.length-1]).width;// Ensure that our ticks are always inside the canvas. When rotated, ticks are right aligned which means that the right padding is dominated
// by the font height
var cosRotation=Math.cos(helpers.toRadians(me.labelRotation));var sinRotation=Math.sin(helpers.toRadians(me.labelRotation));me.paddingLeft=me.labelRotation!==0?cosRotation*firstLabelWidth+3:firstLabelWidth/2+3;// add 3 px to move away from canvas edges
me.paddingRight=me.labelRotation!==0?sinRotation*(tickFontSize/2)+3:lastLabelWidth/2+3;// when rotated
}else{// A vertical axis is more constrained by the width. Labels are the dominant factor here, so get that length first
var maxLabelWidth=me.maxWidth-minSize.width;// Account for padding
var mirror=tickOpts.mirror;if(!mirror){largestTextWidth+=me.options.ticks.padding;}else{// If mirrored text is on the inside so don't expand
largestTextWidth=0;}if(largestTextWidth<maxLabelWidth){// We don't need all the room
minSize.width+=largestTextWidth;}else{// Expand to max size
minSize.width=me.maxWidth;}me.paddingTop=tickFontSize/2;me.paddingBottom=tickFontSize/2;}}if(me.margins){me.paddingLeft=Math.max(me.paddingLeft-me.margins.left,0);me.paddingTop=Math.max(me.paddingTop-me.margins.top,0);me.paddingRight=Math.max(me.paddingRight-me.margins.right,0);me.paddingBottom=Math.max(me.paddingBottom-me.margins.bottom,0);}me.width=minSize.width;me.height=minSize.height;},afterFit:function afterFit(){helpers.callCallback(this.options.afterFit,[this]);},// Shared Methods
isHorizontal:function isHorizontal(){return this.options.position==="top"||this.options.position==="bottom";},isFullWidth:function isFullWidth(){return this.options.fullWidth;},// Get the correct value. NaN bad inputs, If the value type is object get the x or y based on whether we are horizontal or not
getRightValue:function getRightValue(rawValue){// Null and undefined values first
if(rawValue===null||typeof rawValue==='undefined'){return NaN;}// isNaN(object) returns true, so make sure NaN is checking for a number
if(typeof rawValue==='number'&&isNaN(rawValue)){return NaN;}// If it is in fact an object, dive in one more level
if((typeof rawValue==="undefined"?"undefined":_typeof(rawValue))==="object"){if(rawValue instanceof Date||rawValue.isValid){return rawValue;}else{return getRightValue(this.isHorizontal()?rawValue.x:rawValue.y);}}// Value is good, return it
return rawValue;},// Used to get the value to display in the tooltip for the data at the given index
// function getLabelForIndex(index, datasetIndex)
getLabelForIndex:helpers.noop,// Used to get data value locations.  Value can either be an index or a numerical value
getPixelForValue:helpers.noop,// Used to get the data value from a given pixel. This is the inverse of getPixelForValue
getValueForPixel:helpers.noop,// Used for tick location, should
getPixelForTick:function getPixelForTick(index,includeOffset){var me=this;if(me.isHorizontal()){var innerWidth=me.width-(me.paddingLeft+me.paddingRight);var tickWidth=innerWidth/Math.max(me.ticks.length-(me.options.gridLines.offsetGridLines?0:1),1);var pixel=tickWidth*index+me.paddingLeft;if(includeOffset){pixel+=tickWidth/2;}var finalVal=me.left+Math.round(pixel);finalVal+=me.isFullWidth()?me.margins.left:0;return finalVal;}else{var innerHeight=me.height-(me.paddingTop+me.paddingBottom);return me.top+index*(innerHeight/(me.ticks.length-1));}},// Utility for getting the pixel location of a percentage of scale
getPixelForDecimal:function getPixelForDecimal(decimal/*, includeOffset*/){var me=this;if(me.isHorizontal()){var innerWidth=me.width-(me.paddingLeft+me.paddingRight);var valueOffset=innerWidth*decimal+me.paddingLeft;var finalVal=me.left+Math.round(valueOffset);finalVal+=me.isFullWidth()?me.margins.left:0;return finalVal;}else{return me.top+decimal*me.height;}},getBasePixel:function getBasePixel(){var me=this;var min=me.min;var max=me.max;return me.getPixelForValue(me.beginAtZero?0:min<0&&max<0?max:min>0&&max>0?min:0);},// Actualy draw the scale on the canvas
// @param {rectangle} chartArea : the area of the chart to draw full grid lines on
draw:function draw(chartArea){var me=this;var options=me.options;if(!options.display){return;}var context=me.ctx;var globalDefaults=Chart.defaults.global;var optionTicks=options.ticks;var gridLines=options.gridLines;var scaleLabel=options.scaleLabel;var isRotated=me.labelRotation!==0;var skipRatio;var useAutoskipper=optionTicks.autoSkip;var isHorizontal=me.isHorizontal();// figure out the maximum number of gridlines to show
var maxTicks;if(optionTicks.maxTicksLimit){maxTicks=optionTicks.maxTicksLimit;}var tickFontColor=helpers.getValueOrDefault(optionTicks.fontColor,globalDefaults.defaultFontColor);var tickFontSize=helpers.getValueOrDefault(optionTicks.fontSize,globalDefaults.defaultFontSize);var tickFontStyle=helpers.getValueOrDefault(optionTicks.fontStyle,globalDefaults.defaultFontStyle);var tickFontFamily=helpers.getValueOrDefault(optionTicks.fontFamily,globalDefaults.defaultFontFamily);var tickLabelFont=helpers.fontString(tickFontSize,tickFontStyle,tickFontFamily);var tl=gridLines.tickMarkLength;var scaleLabelFontColor=helpers.getValueOrDefault(scaleLabel.fontColor,globalDefaults.defaultFontColor);var scaleLabelFontSize=helpers.getValueOrDefault(scaleLabel.fontSize,globalDefaults.defaultFontSize);var scaleLabelFontStyle=helpers.getValueOrDefault(scaleLabel.fontStyle,globalDefaults.defaultFontStyle);var scaleLabelFontFamily=helpers.getValueOrDefault(scaleLabel.fontFamily,globalDefaults.defaultFontFamily);var scaleLabelFont=helpers.fontString(scaleLabelFontSize,scaleLabelFontStyle,scaleLabelFontFamily);var labelRotationRadians=helpers.toRadians(me.labelRotation);var cosRotation=Math.cos(labelRotationRadians);var sinRotation=Math.sin(labelRotationRadians);var longestRotatedLabel=me.longestLabelWidth*cosRotation;var rotatedLabelHeight=tickFontSize*sinRotation;// Make sure we draw text in the correct color and font
context.fillStyle=tickFontColor;var itemsToDraw=[];if(isHorizontal){skipRatio=false;// Only calculate the skip ratio with the half width of longestRotateLabel if we got an actual rotation
// See #2584
if(isRotated){longestRotatedLabel/=2;}if((longestRotatedLabel+optionTicks.autoSkipPadding)*me.ticks.length>me.width-(me.paddingLeft+me.paddingRight)){skipRatio=1+Math.floor((longestRotatedLabel+optionTicks.autoSkipPadding)*me.ticks.length/(me.width-(me.paddingLeft+me.paddingRight)));}// if they defined a max number of optionTicks,
// increase skipRatio until that number is met
if(maxTicks&&me.ticks.length>maxTicks){while(!skipRatio||me.ticks.length/(skipRatio||1)>maxTicks){if(!skipRatio){skipRatio=1;}skipRatio+=1;}}if(!useAutoskipper){skipRatio=false;}}var xTickStart=options.position==="right"?me.left:me.right-tl;var xTickEnd=options.position==="right"?me.left+tl:me.right;var yTickStart=options.position==="bottom"?me.top:me.bottom-tl;var yTickEnd=options.position==="bottom"?me.top+tl:me.bottom;helpers.each(me.ticks,function(label,index){// If the callback returned a null or undefined value, do not draw this line
if(label===undefined||label===null){return;}var isLastTick=me.ticks.length===index+1;// Since we always show the last tick,we need may need to hide the last shown one before
var shouldSkip=skipRatio>1&&index%skipRatio>0||index%skipRatio===0&&index+skipRatio>=me.ticks.length;if(shouldSkip&&!isLastTick||label===undefined||label===null){return;}var lineWidth,lineColor;if(index===(typeof me.zeroLineIndex!=='undefined'?me.zeroLineIndex:0)){// Draw the first index specially
lineWidth=gridLines.zeroLineWidth;lineColor=gridLines.zeroLineColor;}else{lineWidth=helpers.getValueAtIndexOrDefault(gridLines.lineWidth,index);lineColor=helpers.getValueAtIndexOrDefault(gridLines.color,index);}// Common properties
var tx1,ty1,tx2,ty2,x1,y1,x2,y2,labelX,labelY;var textAlign,textBaseline='middle';if(isHorizontal){if(!isRotated){textBaseline=options.position==='top'?'bottom':'top';}textAlign=isRotated?'right':'center';var xLineValue=me.getPixelForTick(index)+helpers.aliasPixel(lineWidth);// xvalues for grid lines
labelX=me.getPixelForTick(index,gridLines.offsetGridLines)+optionTicks.labelOffset;// x values for optionTicks (need to consider offsetLabel option)
labelY=isRotated?me.top+12:options.position==='top'?me.bottom-tl:me.top+tl;tx1=tx2=x1=x2=xLineValue;ty1=yTickStart;ty2=yTickEnd;y1=chartArea.top;y2=chartArea.bottom;}else{if(options.position==='left'){if(optionTicks.mirror){labelX=me.right+optionTicks.padding;textAlign='left';}else{labelX=me.right-optionTicks.padding;textAlign='right';}}else{// right side
if(optionTicks.mirror){labelX=me.left-optionTicks.padding;textAlign='right';}else{labelX=me.left+optionTicks.padding;textAlign='left';}}var yLineValue=me.getPixelForTick(index);// xvalues for grid lines
yLineValue+=helpers.aliasPixel(lineWidth);labelY=me.getPixelForTick(index,gridLines.offsetGridLines);tx1=xTickStart;tx2=xTickEnd;x1=chartArea.left;x2=chartArea.right;ty1=ty2=y1=y2=yLineValue;}itemsToDraw.push({tx1:tx1,ty1:ty1,tx2:tx2,ty2:ty2,x1:x1,y1:y1,x2:x2,y2:y2,labelX:labelX,labelY:labelY,glWidth:lineWidth,glColor:lineColor,rotation:-1*labelRotationRadians,label:label,textBaseline:textBaseline,textAlign:textAlign});});// Draw all of the tick labels, tick marks, and grid lines at the correct places
helpers.each(itemsToDraw,function(itemToDraw){if(gridLines.display){context.lineWidth=itemToDraw.glWidth;context.strokeStyle=itemToDraw.glColor;context.beginPath();if(gridLines.drawTicks){context.moveTo(itemToDraw.tx1,itemToDraw.ty1);context.lineTo(itemToDraw.tx2,itemToDraw.ty2);}if(gridLines.drawOnChartArea){context.moveTo(itemToDraw.x1,itemToDraw.y1);context.lineTo(itemToDraw.x2,itemToDraw.y2);}context.stroke();}if(optionTicks.display){context.save();context.translate(itemToDraw.labelX,itemToDraw.labelY);context.rotate(itemToDraw.rotation);context.font=tickLabelFont;context.textBaseline=itemToDraw.textBaseline;context.textAlign=itemToDraw.textAlign;var label=itemToDraw.label;if(helpers.isArray(label)){for(var i=0,y=0;i<label.length;++i){// We just make sure the multiline element is a string here..
context.fillText(''+label[i],0,y);// apply same lineSpacing as calculated @ L#320
y+=tickFontSize*1.5;}}else{context.fillText(label,0,0);}context.restore();}});if(scaleLabel.display){// Draw the scale label
var scaleLabelX;var scaleLabelY;var rotation=0;if(isHorizontal){scaleLabelX=me.left+(me.right-me.left)/2;// midpoint of the width
scaleLabelY=options.position==='bottom'?me.bottom-scaleLabelFontSize/2:me.top+scaleLabelFontSize/2;}else{var isLeft=options.position==='left';scaleLabelX=isLeft?me.left+scaleLabelFontSize/2:me.right-scaleLabelFontSize/2;scaleLabelY=me.top+(me.bottom-me.top)/2;rotation=isLeft?-0.5*Math.PI:0.5*Math.PI;}context.save();context.translate(scaleLabelX,scaleLabelY);context.rotate(rotation);context.textAlign='center';context.textBaseline='middle';context.fillStyle=scaleLabelFontColor;// render in correct colour
context.font=scaleLabelFont;context.fillText(scaleLabel.labelString,0,0);context.restore();}if(gridLines.drawBorder){// Draw the line at the edge of the axis
context.lineWidth=helpers.getValueAtIndexOrDefault(gridLines.lineWidth,0);context.strokeStyle=helpers.getValueAtIndexOrDefault(gridLines.color,0);var x1=me.left,x2=me.right,y1=me.top,y2=me.bottom;var aliasPixel=helpers.aliasPixel(context.lineWidth);if(isHorizontal){y1=y2=options.position==='top'?me.bottom:me.top;y1+=aliasPixel;y2+=aliasPixel;}else{x1=x2=options.position==='left'?me.right:me.left;x1+=aliasPixel;x2+=aliasPixel;}context.beginPath();context.moveTo(x1,y1);context.lineTo(x2,y2);context.stroke();}}});};},{}],31:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.scaleService={// Scale registration object. Extensions can register new scale types (such as log or DB scales) and then
// use the new chart options to grab the correct scale
constructors:{},// Use a registration function so that we can move to an ES6 map when we no longer need to support
// old browsers
// Scale config defaults
defaults:{},registerScaleType:function registerScaleType(type,scaleConstructor,defaults){this.constructors[type]=scaleConstructor;this.defaults[type]=helpers.clone(defaults);},getScaleConstructor:function getScaleConstructor(type){return this.constructors.hasOwnProperty(type)?this.constructors[type]:undefined;},getScaleDefaults:function getScaleDefaults(type){// Return the scale defaults merged with the global settings so that we always use the latest ones
return this.defaults.hasOwnProperty(type)?helpers.scaleMerge(Chart.defaults.scale,this.defaults[type]):{};},updateScaleDefaults:function updateScaleDefaults(type,additions){var defaults=this.defaults;if(defaults.hasOwnProperty(type)){defaults[type]=helpers.extend(defaults[type],additions);}},addScalesToLayout:function addScalesToLayout(chartInstance){// Adds each scale to the chart.boxes array to be sized accordingly
helpers.each(chartInstance.scales,function(scale){Chart.layoutService.addBox(chartInstance,scale);});}};};},{}],32:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.global.title={display:false,position:'top',fullWidth:true,// marks that this box should take the full width of the canvas (pushing down other boxes)
fontStyle:'bold',padding:10,// actual title
text:''};var noop=helpers.noop;Chart.Title=Chart.Element.extend({initialize:function initialize(config){var me=this;helpers.extend(me,config);me.options=helpers.configMerge(Chart.defaults.global.title,config.options);// Contains hit boxes for each dataset (in dataset order)
me.legendHitBoxes=[];},// These methods are ordered by lifecyle. Utilities then follow.
beforeUpdate:function beforeUpdate(){var chartOpts=this.chart.options;if(chartOpts&&chartOpts.title){this.options=helpers.configMerge(Chart.defaults.global.title,chartOpts.title);}},update:function update(maxWidth,maxHeight,margins){var me=this;// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
me.beforeUpdate();// Absorb the master measurements
me.maxWidth=maxWidth;me.maxHeight=maxHeight;me.margins=margins;// Dimensions
me.beforeSetDimensions();me.setDimensions();me.afterSetDimensions();// Labels
me.beforeBuildLabels();me.buildLabels();me.afterBuildLabels();// Fit
me.beforeFit();me.fit();me.afterFit();//
me.afterUpdate();return me.minSize;},afterUpdate:noop,//
beforeSetDimensions:noop,setDimensions:function setDimensions(){var me=this;// Set the unconstrained dimension before label rotation
if(me.isHorizontal()){// Reset position before calculating rotation
me.width=me.maxWidth;me.left=0;me.right=me.width;}else{me.height=me.maxHeight;// Reset position before calculating rotation
me.top=0;me.bottom=me.height;}// Reset padding
me.paddingLeft=0;me.paddingTop=0;me.paddingRight=0;me.paddingBottom=0;// Reset minSize
me.minSize={width:0,height:0};},afterSetDimensions:noop,//
beforeBuildLabels:noop,buildLabels:noop,afterBuildLabels:noop,//
beforeFit:noop,fit:function fit(){var me=this,ctx=me.ctx,valueOrDefault=helpers.getValueOrDefault,opts=me.options,globalDefaults=Chart.defaults.global,display=opts.display,fontSize=valueOrDefault(opts.fontSize,globalDefaults.defaultFontSize),minSize=me.minSize;if(me.isHorizontal()){minSize.width=me.maxWidth;// fill all the width
minSize.height=display?fontSize+opts.padding*2:0;}else{minSize.width=display?fontSize+opts.padding*2:0;minSize.height=me.maxHeight;// fill all the height
}me.width=minSize.width;me.height=minSize.height;},afterFit:noop,// Shared Methods
isHorizontal:function isHorizontal(){var pos=this.options.position;return pos==="top"||pos==="bottom";},// Actualy draw the title block on the canvas
draw:function draw(){var me=this,ctx=me.ctx,valueOrDefault=helpers.getValueOrDefault,opts=me.options,globalDefaults=Chart.defaults.global;if(opts.display){var fontSize=valueOrDefault(opts.fontSize,globalDefaults.defaultFontSize),fontStyle=valueOrDefault(opts.fontStyle,globalDefaults.defaultFontStyle),fontFamily=valueOrDefault(opts.fontFamily,globalDefaults.defaultFontFamily),titleFont=helpers.fontString(fontSize,fontStyle,fontFamily),rotation=0,titleX,titleY,top=me.top,left=me.left,bottom=me.bottom,right=me.right;ctx.fillStyle=valueOrDefault(opts.fontColor,globalDefaults.defaultFontColor);// render in correct colour
ctx.font=titleFont;// Horizontal
if(me.isHorizontal()){titleX=left+(right-left)/2;// midpoint of the width
titleY=top+(bottom-top)/2;// midpoint of the height
}else{titleX=opts.position==='left'?left+fontSize/2:right-fontSize/2;titleY=top+(bottom-top)/2;rotation=Math.PI*(opts.position==='left'?-0.5:0.5);}ctx.save();ctx.translate(titleX,titleY);ctx.rotate(rotation);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(opts.text,0,0);ctx.restore();}}});// Register the title plugin
Chart.plugins.register({beforeInit:function beforeInit(chartInstance){var opts=chartInstance.options;var titleOpts=opts.title;if(titleOpts){chartInstance.titleBlock=new Chart.Title({ctx:chartInstance.chart.ctx,options:titleOpts,chart:chartInstance});Chart.layoutService.addBox(chartInstance,chartInstance.titleBlock);}}});};},{}],33:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;Chart.defaults.global.tooltips={enabled:true,custom:null,mode:'single',backgroundColor:"rgba(0,0,0,0.8)",titleFontStyle:"bold",titleSpacing:2,titleMarginBottom:6,titleFontColor:"#fff",titleAlign:"left",bodySpacing:2,bodyFontColor:"#fff",bodyAlign:"left",footerFontStyle:"bold",footerSpacing:2,footerMarginTop:6,footerFontColor:"#fff",footerAlign:"left",yPadding:6,xPadding:6,yAlign:'center',xAlign:'center',caretSize:5,cornerRadius:6,multiKeyBackground:'#fff',callbacks:{// Args are: (tooltipItems, data)
beforeTitle:helpers.noop,title:function title(tooltipItems,data){// Pick first xLabel for now
var title='';var labels=data.labels;var labelCount=labels?labels.length:0;if(tooltipItems.length>0){var item=tooltipItems[0];if(item.xLabel){title=item.xLabel;}else if(labelCount>0&&item.index<labelCount){title=labels[item.index];}}return title;},afterTitle:helpers.noop,// Args are: (tooltipItems, data)
beforeBody:helpers.noop,// Args are: (tooltipItem, data)
beforeLabel:helpers.noop,label:function label(tooltipItem,data){var datasetLabel=data.datasets[tooltipItem.datasetIndex].label||'';return datasetLabel+': '+tooltipItem.yLabel;},labelColor:function labelColor(tooltipItem,chartInstance){var meta=chartInstance.getDatasetMeta(tooltipItem.datasetIndex);var activeElement=meta.data[tooltipItem.index];var view=activeElement._view;return{borderColor:view.borderColor,backgroundColor:view.backgroundColor};},afterLabel:helpers.noop,// Args are: (tooltipItems, data)
afterBody:helpers.noop,// Args are: (tooltipItems, data)
beforeFooter:helpers.noop,footer:helpers.noop,afterFooter:helpers.noop}};// Helper to push or concat based on if the 2nd parameter is an array or not
function pushOrConcat(base,toPush){if(toPush){if(helpers.isArray(toPush)){//base = base.concat(toPush);
Array.prototype.push.apply(base,toPush);}else{base.push(toPush);}}return base;}function getAveragePosition(elements){if(!elements.length){return false;}var i,len;var xPositions=[];var yPositions=[];for(i=0,len=elements.length;i<len;++i){var el=elements[i];if(el&&el.hasValue()){var pos=el.tooltipPosition();xPositions.push(pos.x);yPositions.push(pos.y);}}var x=0,y=0;for(i=0,len-xPositions.length;i<len;++i){x+=xPositions[i];y+=yPositions[i];}return{x:Math.round(x/xPositions.length),y:Math.round(y/xPositions.length)};}// Private helper to create a tooltip iteam model
// @param element : the chart element (point, arc, bar) to create the tooltip item for
// @return : new tooltip item
function createTooltipItem(element){var xScale=element._xScale;var yScale=element._yScale||element._scale;// handle radar || polarArea charts
var index=element._index,datasetIndex=element._datasetIndex;return{xLabel:xScale?xScale.getLabelForIndex(index,datasetIndex):'',yLabel:yScale?yScale.getLabelForIndex(index,datasetIndex):'',index:index,datasetIndex:datasetIndex};}Chart.Tooltip=Chart.Element.extend({initialize:function initialize(){var me=this;var globalDefaults=Chart.defaults.global;var tooltipOpts=me._options;var getValueOrDefault=helpers.getValueOrDefault;helpers.extend(me,{_model:{// Positioning
xPadding:tooltipOpts.xPadding,yPadding:tooltipOpts.yPadding,xAlign:tooltipOpts.yAlign,yAlign:tooltipOpts.xAlign,// Body
bodyFontColor:tooltipOpts.bodyFontColor,_bodyFontFamily:getValueOrDefault(tooltipOpts.bodyFontFamily,globalDefaults.defaultFontFamily),_bodyFontStyle:getValueOrDefault(tooltipOpts.bodyFontStyle,globalDefaults.defaultFontStyle),_bodyAlign:tooltipOpts.bodyAlign,bodyFontSize:getValueOrDefault(tooltipOpts.bodyFontSize,globalDefaults.defaultFontSize),bodySpacing:tooltipOpts.bodySpacing,// Title
titleFontColor:tooltipOpts.titleFontColor,_titleFontFamily:getValueOrDefault(tooltipOpts.titleFontFamily,globalDefaults.defaultFontFamily),_titleFontStyle:getValueOrDefault(tooltipOpts.titleFontStyle,globalDefaults.defaultFontStyle),titleFontSize:getValueOrDefault(tooltipOpts.titleFontSize,globalDefaults.defaultFontSize),_titleAlign:tooltipOpts.titleAlign,titleSpacing:tooltipOpts.titleSpacing,titleMarginBottom:tooltipOpts.titleMarginBottom,// Footer
footerFontColor:tooltipOpts.footerFontColor,_footerFontFamily:getValueOrDefault(tooltipOpts.footerFontFamily,globalDefaults.defaultFontFamily),_footerFontStyle:getValueOrDefault(tooltipOpts.footerFontStyle,globalDefaults.defaultFontStyle),footerFontSize:getValueOrDefault(tooltipOpts.footerFontSize,globalDefaults.defaultFontSize),_footerAlign:tooltipOpts.footerAlign,footerSpacing:tooltipOpts.footerSpacing,footerMarginTop:tooltipOpts.footerMarginTop,// Appearance
caretSize:tooltipOpts.caretSize,cornerRadius:tooltipOpts.cornerRadius,backgroundColor:tooltipOpts.backgroundColor,opacity:0,legendColorBackground:tooltipOpts.multiKeyBackground}});},// Get the title
// Args are: (tooltipItem, data)
getTitle:function getTitle(){var me=this;var opts=me._options;var callbacks=opts.callbacks;var beforeTitle=callbacks.beforeTitle.apply(me,arguments),title=callbacks.title.apply(me,arguments),afterTitle=callbacks.afterTitle.apply(me,arguments);var lines=[];lines=pushOrConcat(lines,beforeTitle);lines=pushOrConcat(lines,title);lines=pushOrConcat(lines,afterTitle);return lines;},// Args are: (tooltipItem, data)
getBeforeBody:function getBeforeBody(){var lines=this._options.callbacks.beforeBody.apply(this,arguments);return helpers.isArray(lines)?lines:lines!==undefined?[lines]:[];},// Args are: (tooltipItem, data)
getBody:function getBody(tooltipItems,data){var me=this;var callbacks=me._options.callbacks;var bodyItems=[];helpers.each(tooltipItems,function(tooltipItem){var bodyItem={before:[],lines:[],after:[]};pushOrConcat(bodyItem.before,callbacks.beforeLabel.call(me,tooltipItem,data));pushOrConcat(bodyItem.lines,callbacks.label.call(me,tooltipItem,data));pushOrConcat(bodyItem.after,callbacks.afterLabel.call(me,tooltipItem,data));bodyItems.push(bodyItem);});return bodyItems;},// Args are: (tooltipItem, data)
getAfterBody:function getAfterBody(){var lines=this._options.callbacks.afterBody.apply(this,arguments);return helpers.isArray(lines)?lines:lines!==undefined?[lines]:[];},// Get the footer and beforeFooter and afterFooter lines
// Args are: (tooltipItem, data)
getFooter:function getFooter(){var me=this;var callbacks=me._options.callbacks;var beforeFooter=callbacks.beforeFooter.apply(me,arguments);var footer=callbacks.footer.apply(me,arguments);var afterFooter=callbacks.afterFooter.apply(me,arguments);var lines=[];lines=pushOrConcat(lines,beforeFooter);lines=pushOrConcat(lines,footer);lines=pushOrConcat(lines,afterFooter);return lines;},update:function update(changed){var me=this;var opts=me._options;var model=me._model;var active=me._active;var data=me._data;var chartInstance=me._chartInstance;var i,len;if(active.length){model.opacity=1;var labelColors=[],tooltipPosition=getAveragePosition(active);var tooltipItems=[];for(i=0,len=active.length;i<len;++i){tooltipItems.push(createTooltipItem(active[i]));}// If the user provided a sorting function, use it to modify the tooltip items
if(opts.itemSort){tooltipItems=tooltipItems.sort(opts.itemSort);}// If there is more than one item, show color items
if(active.length>1){helpers.each(tooltipItems,function(tooltipItem){labelColors.push(opts.callbacks.labelColor.call(me,tooltipItem,chartInstance));});}// Build the Text Lines
helpers.extend(model,{title:me.getTitle(tooltipItems,data),beforeBody:me.getBeforeBody(tooltipItems,data),body:me.getBody(tooltipItems,data),afterBody:me.getAfterBody(tooltipItems,data),footer:me.getFooter(tooltipItems,data),x:Math.round(tooltipPosition.x),y:Math.round(tooltipPosition.y),caretPadding:helpers.getValueOrDefault(tooltipPosition.padding,2),labelColors:labelColors});// We need to determine alignment of
var tooltipSize=me.getTooltipSize(model);me.determineAlignment(tooltipSize);// Smart Tooltip placement to stay on the canvas
helpers.extend(model,me.getBackgroundPoint(model,tooltipSize));}else{me._model.opacity=0;}if(changed&&opts.custom){opts.custom.call(me,model);}return me;},getTooltipSize:function getTooltipSize(vm){var ctx=this._chart.ctx;var size={height:vm.yPadding*2,// Tooltip Padding
width:0};// Count of all lines in the body
var body=vm.body;var combinedBodyLength=body.reduce(function(count,bodyItem){return count+bodyItem.before.length+bodyItem.lines.length+bodyItem.after.length;},0);combinedBodyLength+=vm.beforeBody.length+vm.afterBody.length;var titleLineCount=vm.title.length;var footerLineCount=vm.footer.length;var titleFontSize=vm.titleFontSize,bodyFontSize=vm.bodyFontSize,footerFontSize=vm.footerFontSize;size.height+=titleLineCount*titleFontSize;// Title Lines
size.height+=(titleLineCount-1)*vm.titleSpacing;// Title Line Spacing
size.height+=titleLineCount?vm.titleMarginBottom:0;// Title's bottom Margin
size.height+=combinedBodyLength*bodyFontSize;// Body Lines
size.height+=combinedBodyLength?(combinedBodyLength-1)*vm.bodySpacing:0;// Body Line Spacing
size.height+=footerLineCount?vm.footerMarginTop:0;// Footer Margin
size.height+=footerLineCount*footerFontSize;// Footer Lines
size.height+=footerLineCount?(footerLineCount-1)*vm.footerSpacing:0;// Footer Line Spacing
// Title width
var widthPadding=0;var maxLineWidth=function maxLineWidth(line){size.width=Math.max(size.width,ctx.measureText(line).width+widthPadding);};ctx.font=helpers.fontString(titleFontSize,vm._titleFontStyle,vm._titleFontFamily);helpers.each(vm.title,maxLineWidth);// Body width
ctx.font=helpers.fontString(bodyFontSize,vm._bodyFontStyle,vm._bodyFontFamily);helpers.each(vm.beforeBody.concat(vm.afterBody),maxLineWidth);// Body lines may include some extra width due to the color box
widthPadding=body.length>1?bodyFontSize+2:0;helpers.each(body,function(bodyItem){helpers.each(bodyItem.before,maxLineWidth);helpers.each(bodyItem.lines,maxLineWidth);helpers.each(bodyItem.after,maxLineWidth);});// Reset back to 0
widthPadding=0;// Footer width
ctx.font=helpers.fontString(footerFontSize,vm._footerFontStyle,vm._footerFontFamily);helpers.each(vm.footer,maxLineWidth);// Add padding
size.width+=2*vm.xPadding;return size;},determineAlignment:function determineAlignment(size){var me=this;var model=me._model;var chart=me._chart;var chartArea=me._chartInstance.chartArea;if(model.y<size.height){model.yAlign='top';}else if(model.y>chart.height-size.height){model.yAlign='bottom';}var lf,rf;// functions to determine left, right alignment
var olf,orf;// functions to determine if left/right alignment causes tooltip to go outside chart
var yf;// function to get the y alignment if the tooltip goes outside of the left or right edges
var midX=(chartArea.left+chartArea.right)/2;var midY=(chartArea.top+chartArea.bottom)/2;if(model.yAlign==='center'){lf=function lf(x){return x<=midX;};rf=function rf(x){return x>midX;};}else{lf=function lf(x){return x<=size.width/2;};rf=function rf(x){return x>=chart.width-size.width/2;};}olf=function olf(x){return x+size.width>chart.width;};orf=function orf(x){return x-size.width<0;};yf=function yf(y){return y<=midY?'top':'bottom';};if(lf(model.x)){model.xAlign='left';// Is tooltip too wide and goes over the right side of the chart.?
if(olf(model.x)){model.xAlign='center';model.yAlign=yf(model.y);}}else if(rf(model.x)){model.xAlign='right';// Is tooltip too wide and goes outside left edge of canvas?
if(orf(model.x)){model.xAlign='center';model.yAlign=yf(model.y);}}},getBackgroundPoint:function getBackgroundPoint(vm,size){// Background Position
var pt={x:vm.x,y:vm.y};var caretSize=vm.caretSize,caretPadding=vm.caretPadding,cornerRadius=vm.cornerRadius,xAlign=vm.xAlign,yAlign=vm.yAlign,paddingAndSize=caretSize+caretPadding,radiusAndPadding=cornerRadius+caretPadding;if(xAlign==='right'){pt.x-=size.width;}else if(xAlign==='center'){pt.x-=size.width/2;}if(yAlign==='top'){pt.y+=paddingAndSize;}else if(yAlign==='bottom'){pt.y-=size.height+paddingAndSize;}else{pt.y-=size.height/2;}if(yAlign==='center'){if(xAlign==='left'){pt.x+=paddingAndSize;}else if(xAlign==='right'){pt.x-=paddingAndSize;}}else{if(xAlign==='left'){pt.x-=radiusAndPadding;}else if(xAlign==='right'){pt.x+=radiusAndPadding;}}return pt;},drawCaret:function drawCaret(tooltipPoint,size,opacity,caretPadding){var vm=this._view;var ctx=this._chart.ctx;var x1,x2,x3;var y1,y2,y3;var caretSize=vm.caretSize;var cornerRadius=vm.cornerRadius;var xAlign=vm.xAlign,yAlign=vm.yAlign;var ptX=tooltipPoint.x,ptY=tooltipPoint.y;var width=size.width,height=size.height;if(yAlign==='center'){// Left or right side
if(xAlign==='left'){x1=ptX;x2=x1-caretSize;x3=x1;}else{x1=ptX+width;x2=x1+caretSize;x3=x1;}y2=ptY+height/2;y1=y2-caretSize;y3=y2+caretSize;}else{if(xAlign==='left'){x1=ptX+cornerRadius;x2=x1+caretSize;x3=x2+caretSize;}else if(xAlign==='right'){x1=ptX+width-cornerRadius;x2=x1-caretSize;x3=x2-caretSize;}else{x2=ptX+width/2;x1=x2-caretSize;x3=x2+caretSize;}if(yAlign==='top'){y1=ptY;y2=y1-caretSize;y3=y1;}else{y1=ptY+height;y2=y1+caretSize;y3=y1;}}var bgColor=helpers.color(vm.backgroundColor);ctx.fillStyle=bgColor.alpha(opacity*bgColor.alpha()).rgbString();ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fill();},drawTitle:function drawTitle(pt,vm,ctx,opacity){var title=vm.title;if(title.length){ctx.textAlign=vm._titleAlign;ctx.textBaseline="top";var titleFontSize=vm.titleFontSize,titleSpacing=vm.titleSpacing;var titleFontColor=helpers.color(vm.titleFontColor);ctx.fillStyle=titleFontColor.alpha(opacity*titleFontColor.alpha()).rgbString();ctx.font=helpers.fontString(titleFontSize,vm._titleFontStyle,vm._titleFontFamily);var i,len;for(i=0,len=title.length;i<len;++i){ctx.fillText(title[i],pt.x,pt.y);pt.y+=titleFontSize+titleSpacing;// Line Height and spacing
if(i+1===title.length){pt.y+=vm.titleMarginBottom-titleSpacing;// If Last, add margin, remove spacing
}}}},drawBody:function drawBody(pt,vm,ctx,opacity){var bodyFontSize=vm.bodyFontSize;var bodySpacing=vm.bodySpacing;var body=vm.body;ctx.textAlign=vm._bodyAlign;ctx.textBaseline="top";var bodyFontColor=helpers.color(vm.bodyFontColor);var textColor=bodyFontColor.alpha(opacity*bodyFontColor.alpha()).rgbString();ctx.fillStyle=textColor;ctx.font=helpers.fontString(bodyFontSize,vm._bodyFontStyle,vm._bodyFontFamily);// Before Body
var xLinePadding=0;var fillLineOfText=function fillLineOfText(line){ctx.fillText(line,pt.x+xLinePadding,pt.y);pt.y+=bodyFontSize+bodySpacing;};// Before body lines
helpers.each(vm.beforeBody,fillLineOfText);var drawColorBoxes=body.length>1;xLinePadding=drawColorBoxes?bodyFontSize+2:0;// Draw body lines now
helpers.each(body,function(bodyItem,i){helpers.each(bodyItem.before,fillLineOfText);helpers.each(bodyItem.lines,function(line){// Draw Legend-like boxes if needed
if(drawColorBoxes){// Fill a white rect so that colours merge nicely if the opacity is < 1
ctx.fillStyle=helpers.color(vm.legendColorBackground).alpha(opacity).rgbaString();ctx.fillRect(pt.x,pt.y,bodyFontSize,bodyFontSize);// Border
ctx.strokeStyle=helpers.color(vm.labelColors[i].borderColor).alpha(opacity).rgbaString();ctx.strokeRect(pt.x,pt.y,bodyFontSize,bodyFontSize);// Inner square
ctx.fillStyle=helpers.color(vm.labelColors[i].backgroundColor).alpha(opacity).rgbaString();ctx.fillRect(pt.x+1,pt.y+1,bodyFontSize-2,bodyFontSize-2);ctx.fillStyle=textColor;}fillLineOfText(line);});helpers.each(bodyItem.after,fillLineOfText);});// Reset back to 0 for after body
xLinePadding=0;// After body lines
helpers.each(vm.afterBody,fillLineOfText);pt.y-=bodySpacing;// Remove last body spacing
},drawFooter:function drawFooter(pt,vm,ctx,opacity){var footer=vm.footer;if(footer.length){pt.y+=vm.footerMarginTop;ctx.textAlign=vm._footerAlign;ctx.textBaseline="top";var footerFontColor=helpers.color(vm.footerFontColor);ctx.fillStyle=footerFontColor.alpha(opacity*footerFontColor.alpha()).rgbString();ctx.font=helpers.fontString(vm.footerFontSize,vm._footerFontStyle,vm._footerFontFamily);helpers.each(footer,function(line){ctx.fillText(line,pt.x,pt.y);pt.y+=vm.footerFontSize+vm.footerSpacing;});}},draw:function draw(){var ctx=this._chart.ctx;var vm=this._view;if(vm.opacity===0){return;}var tooltipSize=this.getTooltipSize(vm);var pt={x:vm.x,y:vm.y};// IE11/Edge does not like very small opacities, so snap to 0
var opacity=Math.abs(vm.opacity<1e-3)?0:vm.opacity;if(this._options.enabled){// Draw Background
var bgColor=helpers.color(vm.backgroundColor);ctx.fillStyle=bgColor.alpha(opacity*bgColor.alpha()).rgbString();helpers.drawRoundedRectangle(ctx,pt.x,pt.y,tooltipSize.width,tooltipSize.height,vm.cornerRadius);ctx.fill();// Draw Caret
this.drawCaret(pt,tooltipSize,opacity,vm.caretPadding);// Draw Title, Body, and Footer
pt.x+=vm.xPadding;pt.y+=vm.yPadding;// Titles
this.drawTitle(pt,vm,ctx,opacity);// Body
this.drawBody(pt,vm,ctx,opacity);// Footer
this.drawFooter(pt,vm,ctx,opacity);}}});};},{}],34:[function(require,module,exports){"use strict";module.exports=function(Chart,moment){var helpers=Chart.helpers,globalOpts=Chart.defaults.global;globalOpts.elements.arc={backgroundColor:globalOpts.defaultColor,borderColor:"#fff",borderWidth:2};Chart.elements.Arc=Chart.Element.extend({inLabelRange:function inLabelRange(mouseX){var vm=this._view;if(vm){return Math.pow(mouseX-vm.x,2)<Math.pow(vm.radius+vm.hoverRadius,2);}else{return false;}},inRange:function inRange(chartX,chartY){var vm=this._view;if(vm){var pointRelativePosition=helpers.getAngleFromPoint(vm,{x:chartX,y:chartY}),angle=pointRelativePosition.angle,distance=pointRelativePosition.distance;//Sanitise angle range
var startAngle=vm.startAngle;var endAngle=vm.endAngle;while(endAngle<startAngle){endAngle+=2.0*Math.PI;}while(angle>endAngle){angle-=2.0*Math.PI;}while(angle<startAngle){angle+=2.0*Math.PI;}//Check if within the range of the open/close angle
var betweenAngles=angle>=startAngle&&angle<=endAngle,withinRadius=distance>=vm.innerRadius&&distance<=vm.outerRadius;return betweenAngles&&withinRadius;}else{return false;}},tooltipPosition:function tooltipPosition(){var vm=this._view;var centreAngle=vm.startAngle+(vm.endAngle-vm.startAngle)/2,rangeFromCentre=(vm.outerRadius-vm.innerRadius)/2+vm.innerRadius;return{x:vm.x+Math.cos(centreAngle)*rangeFromCentre,y:vm.y+Math.sin(centreAngle)*rangeFromCentre};},draw:function draw(){var ctx=this._chart.ctx,vm=this._view,sA=vm.startAngle,eA=vm.endAngle;ctx.beginPath();ctx.arc(vm.x,vm.y,vm.outerRadius,sA,eA);ctx.arc(vm.x,vm.y,vm.innerRadius,eA,sA,true);ctx.closePath();ctx.strokeStyle=vm.borderColor;ctx.lineWidth=vm.borderWidth;ctx.fillStyle=vm.backgroundColor;ctx.fill();ctx.lineJoin='bevel';if(vm.borderWidth){ctx.stroke();}}});};},{}],35:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;var globalDefaults=Chart.defaults.global;Chart.defaults.global.elements.line={tension:0.4,backgroundColor:globalDefaults.defaultColor,borderWidth:3,borderColor:globalDefaults.defaultColor,borderCapStyle:'butt',borderDash:[],borderDashOffset:0.0,borderJoinStyle:'miter',fill:true// do we fill in the area between the line and its base axis
};Chart.elements.Line=Chart.Element.extend({lineToNextPoint:function lineToNextPoint(previousPoint,point,nextPoint,skipHandler,previousSkipHandler){var me=this;var ctx=me._chart.ctx;var spanGaps=me._view?me._view.spanGaps:false;if(point._view.skip&&!spanGaps){skipHandler.call(me,previousPoint,point,nextPoint);}else if(previousPoint._view.skip&&!spanGaps){previousSkipHandler.call(me,previousPoint,point,nextPoint);}else if(point._view.tension===0){ctx.lineTo(point._view.x,point._view.y);}else{// Line between points
ctx.bezierCurveTo(previousPoint._view.controlPointNextX,previousPoint._view.controlPointNextY,point._view.controlPointPreviousX,point._view.controlPointPreviousY,point._view.x,point._view.y);}},draw:function draw(){var me=this;var vm=me._view;var ctx=me._chart.ctx;var first=me._children[0];var last=me._children[me._children.length-1];function loopBackToStart(drawLineToCenter){if(!first._view.skip&&!last._view.skip){// Draw a bezier line from last to first
ctx.bezierCurveTo(last._view.controlPointNextX,last._view.controlPointNextY,first._view.controlPointPreviousX,first._view.controlPointPreviousY,first._view.x,first._view.y);}else if(drawLineToCenter){// Go to center
ctx.lineTo(me._view.scaleZero.x,me._view.scaleZero.y);}}ctx.save();// If we had points and want to fill this line, do so.
if(me._children.length>0&&vm.fill){// Draw the background first (so the border is always on top)
ctx.beginPath();helpers.each(me._children,function(point,index){var previous=helpers.previousItem(me._children,index);var next=helpers.nextItem(me._children,index);// First point moves to it's starting position no matter what
if(index===0){if(me._loop){ctx.moveTo(vm.scaleZero.x,vm.scaleZero.y);}else{ctx.moveTo(point._view.x,vm.scaleZero);}if(point._view.skip){if(!me._loop){ctx.moveTo(next._view.x,me._view.scaleZero);}}else{ctx.lineTo(point._view.x,point._view.y);}}else{me.lineToNextPoint(previous,point,next,function(previousPoint,point,nextPoint){if(me._loop){// Go to center
ctx.lineTo(me._view.scaleZero.x,me._view.scaleZero.y);}else{ctx.lineTo(previousPoint._view.x,me._view.scaleZero);ctx.moveTo(nextPoint._view.x,me._view.scaleZero);}},function(previousPoint,point){// If we skipped the last point, draw a line to ourselves so that the fill is nice
ctx.lineTo(point._view.x,point._view.y);});}},me);// For radial scales, loop back around to the first point
if(me._loop){loopBackToStart(true);}else{//Round off the line by going to the base of the chart, back to the start, then fill.
ctx.lineTo(me._children[me._children.length-1]._view.x,vm.scaleZero);ctx.lineTo(me._children[0]._view.x,vm.scaleZero);}ctx.fillStyle=vm.backgroundColor||globalDefaults.defaultColor;ctx.closePath();ctx.fill();}var globalOptionLineElements=globalDefaults.elements.line;// Now draw the line between all the points with any borders
ctx.lineCap=vm.borderCapStyle||globalOptionLineElements.borderCapStyle;// IE 9 and 10 do not support line dash
if(ctx.setLineDash){ctx.setLineDash(vm.borderDash||globalOptionLineElements.borderDash);}ctx.lineDashOffset=vm.borderDashOffset||globalOptionLineElements.borderDashOffset;ctx.lineJoin=vm.borderJoinStyle||globalOptionLineElements.borderJoinStyle;ctx.lineWidth=vm.borderWidth||globalOptionLineElements.borderWidth;ctx.strokeStyle=vm.borderColor||globalDefaults.defaultColor;ctx.beginPath();helpers.each(me._children,function(point,index){var previous=helpers.previousItem(me._children,index);var next=helpers.nextItem(me._children,index);if(index===0){ctx.moveTo(point._view.x,point._view.y);}else{me.lineToNextPoint(previous,point,next,function(previousPoint,point,nextPoint){ctx.moveTo(nextPoint._view.x,nextPoint._view.y);},function(previousPoint,point){// If we skipped the last point, move up to our point preventing a line from being drawn
ctx.moveTo(point._view.x,point._view.y);});}},me);if(me._loop&&me._children.length>0){loopBackToStart();}ctx.stroke();ctx.restore();}});};},{}],36:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers,globalOpts=Chart.defaults.global,defaultColor=globalOpts.defaultColor;globalOpts.elements.point={radius:3,pointStyle:'circle',backgroundColor:defaultColor,borderWidth:1,borderColor:defaultColor,// Hover
hitRadius:1,hoverRadius:4,hoverBorderWidth:1};Chart.elements.Point=Chart.Element.extend({inRange:function inRange(mouseX,mouseY){var vm=this._view;return vm?Math.pow(mouseX-vm.x,2)+Math.pow(mouseY-vm.y,2)<Math.pow(vm.hitRadius+vm.radius,2):false;},inLabelRange:function inLabelRange(mouseX){var vm=this._view;return vm?Math.pow(mouseX-vm.x,2)<Math.pow(vm.radius+vm.hitRadius,2):false;},tooltipPosition:function tooltipPosition(){var vm=this._view;return{x:vm.x,y:vm.y,padding:vm.radius+vm.borderWidth};},draw:function draw(){var vm=this._view;var ctx=this._chart.ctx;var pointStyle=vm.pointStyle;var radius=vm.radius;var x=vm.x;var y=vm.y;var type,edgeLength,xOffset,yOffset,height,size;if(vm.skip){return;}if((typeof pointStyle==="undefined"?"undefined":_typeof(pointStyle))==='object'){type=pointStyle.toString();if(type==='[object HTMLImageElement]'||type==='[object HTMLCanvasElement]'){ctx.drawImage(pointStyle,x-pointStyle.width/2,y-pointStyle.height/2);return;}}if(isNaN(radius)||radius<=0){return;}ctx.strokeStyle=vm.borderColor||defaultColor;ctx.lineWidth=helpers.getValueOrDefault(vm.borderWidth,globalOpts.elements.point.borderWidth);ctx.fillStyle=vm.backgroundColor||defaultColor;switch(pointStyle){// Default includes circle
default:ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);ctx.closePath();ctx.fill();break;case'triangle':ctx.beginPath();edgeLength=3*radius/Math.sqrt(3);height=edgeLength*Math.sqrt(3)/2;ctx.moveTo(x-edgeLength/2,y+height/3);ctx.lineTo(x+edgeLength/2,y+height/3);ctx.lineTo(x,y-2*height/3);ctx.closePath();ctx.fill();break;case'rect':size=1/Math.SQRT2*radius;ctx.fillRect(x-size,y-size,2*size,2*size);ctx.strokeRect(x-size,y-size,2*size,2*size);break;case'rectRot':size=1/Math.SQRT2*radius;ctx.beginPath();ctx.moveTo(x-size,y);ctx.lineTo(x,y+size);ctx.lineTo(x+size,y);ctx.lineTo(x,y-size);ctx.closePath();ctx.fill();break;case'cross':ctx.beginPath();ctx.moveTo(x,y+radius);ctx.lineTo(x,y-radius);ctx.moveTo(x-radius,y);ctx.lineTo(x+radius,y);ctx.closePath();break;case'crossRot':ctx.beginPath();xOffset=Math.cos(Math.PI/4)*radius;yOffset=Math.sin(Math.PI/4)*radius;ctx.moveTo(x-xOffset,y-yOffset);ctx.lineTo(x+xOffset,y+yOffset);ctx.moveTo(x-xOffset,y+yOffset);ctx.lineTo(x+xOffset,y-yOffset);ctx.closePath();break;case'star':ctx.beginPath();ctx.moveTo(x,y+radius);ctx.lineTo(x,y-radius);ctx.moveTo(x-radius,y);ctx.lineTo(x+radius,y);xOffset=Math.cos(Math.PI/4)*radius;yOffset=Math.sin(Math.PI/4)*radius;ctx.moveTo(x-xOffset,y-yOffset);ctx.lineTo(x+xOffset,y+yOffset);ctx.moveTo(x-xOffset,y+yOffset);ctx.lineTo(x+xOffset,y-yOffset);ctx.closePath();break;case'line':ctx.beginPath();ctx.moveTo(x-radius,y);ctx.lineTo(x+radius,y);ctx.closePath();break;case'dash':ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+radius,y);ctx.closePath();break;}ctx.stroke();}});};},{}],37:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers,globalOpts=Chart.defaults.global;globalOpts.elements.rectangle={backgroundColor:globalOpts.defaultColor,borderWidth:0,borderColor:globalOpts.defaultColor,borderSkipped:'bottom'};Chart.elements.Rectangle=Chart.Element.extend({draw:function draw(){var ctx=this._chart.ctx;var vm=this._view;var halfWidth=vm.width/2,leftX=vm.x-halfWidth,rightX=vm.x+halfWidth,top=vm.base-(vm.base-vm.y),halfStroke=vm.borderWidth/2;// Canvas doesn't allow us to stroke inside the width so we can
// adjust the sizes to fit if we're setting a stroke on the line
if(vm.borderWidth){leftX+=halfStroke;rightX-=halfStroke;top+=halfStroke;}ctx.beginPath();ctx.fillStyle=vm.backgroundColor;ctx.strokeStyle=vm.borderColor;ctx.lineWidth=vm.borderWidth;// Corner points, from bottom-left to bottom-right clockwise
// | 1 2 |
// | 0 3 |
var corners=[[leftX,vm.base],[leftX,top],[rightX,top],[rightX,vm.base]];// Find first (starting) corner with fallback to 'bottom' 
var borders=['bottom','left','top','right'];var startCorner=borders.indexOf(vm.borderSkipped,0);if(startCorner===-1)startCorner=0;function cornerAt(index){return corners[(startCorner+index)%4];}// Draw rectangle from 'startCorner'
ctx.moveTo.apply(ctx,cornerAt(0));for(var i=1;i<4;i++){ctx.lineTo.apply(ctx,cornerAt(i));}ctx.fill();if(vm.borderWidth){ctx.stroke();}},height:function height(){var vm=this._view;return vm.base-vm.y;},inRange:function inRange(mouseX,mouseY){var vm=this._view;return vm?vm.y<vm.base?mouseX>=vm.x-vm.width/2&&mouseX<=vm.x+vm.width/2&&mouseY>=vm.y&&mouseY<=vm.base:mouseX>=vm.x-vm.width/2&&mouseX<=vm.x+vm.width/2&&mouseY>=vm.base&&mouseY<=vm.y:false;},inLabelRange:function inLabelRange(mouseX){var vm=this._view;return vm?mouseX>=vm.x-vm.width/2&&mouseX<=vm.x+vm.width/2:false;},tooltipPosition:function tooltipPosition(){var vm=this._view;return{x:vm.x,y:vm.y};}});};},{}],38:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;// Default config for a category scale
var defaultConfig={position:"bottom"};var DatasetScale=Chart.Scale.extend({// Implement this so that 
determineDataLimits:function determineDataLimits(){var me=this;me.minIndex=0;me.maxIndex=me.chart.data.labels.length-1;var findIndex;if(me.options.ticks.min!==undefined){// user specified min value
findIndex=helpers.indexOf(me.chart.data.labels,me.options.ticks.min);me.minIndex=findIndex!==-1?findIndex:me.minIndex;}if(me.options.ticks.max!==undefined){// user specified max value
findIndex=helpers.indexOf(me.chart.data.labels,me.options.ticks.max);me.maxIndex=findIndex!==-1?findIndex:me.maxIndex;}me.min=me.chart.data.labels[me.minIndex];me.max=me.chart.data.labels[me.maxIndex];},buildTicks:function buildTicks(index){var me=this;// If we are viewing some subset of labels, slice the original array
me.ticks=me.minIndex===0&&me.maxIndex===me.chart.data.labels.length-1?me.chart.data.labels:me.chart.data.labels.slice(me.minIndex,me.maxIndex+1);},getLabelForIndex:function getLabelForIndex(index,datasetIndex){return this.ticks[index];},// Used to get data value locations.  Value can either be an index or a numerical value
getPixelForValue:function getPixelForValue(value,index,datasetIndex,includeOffset){var me=this;// 1 is added because we need the length but we have the indexes
var offsetAmt=Math.max(me.maxIndex+1-me.minIndex-(me.options.gridLines.offsetGridLines?0:1),1);if(me.isHorizontal()){var innerWidth=me.width-(me.paddingLeft+me.paddingRight);var valueWidth=innerWidth/offsetAmt;var widthOffset=valueWidth*(index-me.minIndex)+me.paddingLeft;if(me.options.gridLines.offsetGridLines&&includeOffset){widthOffset+=valueWidth/2;}return me.left+Math.round(widthOffset);}else{var innerHeight=me.height-(me.paddingTop+me.paddingBottom);var valueHeight=innerHeight/offsetAmt;var heightOffset=valueHeight*(index-me.minIndex)+me.paddingTop;if(me.options.gridLines.offsetGridLines&&includeOffset){heightOffset+=valueHeight/2;}return me.top+Math.round(heightOffset);}},getPixelForTick:function getPixelForTick(index,includeOffset){return this.getPixelForValue(this.ticks[index],index+this.minIndex,null,includeOffset);},getValueForPixel:function getValueForPixel(pixel){var me=this;var value;var offsetAmt=Math.max(me.ticks.length-(me.options.gridLines.offsetGridLines?0:1),1);var horz=me.isHorizontal();var innerDimension=horz?me.width-(me.paddingLeft+me.paddingRight):me.height-(me.paddingTop+me.paddingBottom);var valueDimension=innerDimension/offsetAmt;if(me.options.gridLines.offsetGridLines){pixel-=valueDimension/2;}pixel-=horz?me.paddingLeft:me.paddingTop;if(pixel<=0){value=0;}else{value=Math.round(pixel/valueDimension);}return value;}});Chart.scaleService.registerScaleType("category",DatasetScale,defaultConfig);};},{}],39:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;var defaultConfig={position:"left",ticks:{callback:function callback(tickValue,index,ticks){// If we have lots of ticks, don't use the ones
var delta=ticks.length>3?ticks[2]-ticks[1]:ticks[1]-ticks[0];// If we have a number like 2.5 as the delta, figure out how many decimal places we need
if(Math.abs(delta)>1){if(tickValue!==Math.floor(tickValue)){// not an integer
delta=tickValue-Math.floor(tickValue);}}var logDelta=helpers.log10(Math.abs(delta));var tickString='';if(tickValue!==0){var numDecimal=-1*Math.floor(logDelta);numDecimal=Math.max(Math.min(numDecimal,20),0);// toFixed has a max of 20 decimal places
tickString=tickValue.toFixed(numDecimal);}else{tickString='0';// never show decimal places for 0
}return tickString;}}};var LinearScale=Chart.LinearScaleBase.extend({determineDataLimits:function determineDataLimits(){var me=this;var opts=me.options;var tickOpts=opts.ticks;var chart=me.chart;var data=chart.data;var datasets=data.datasets;var isHorizontal=me.isHorizontal();function IDMatches(meta){return isHorizontal?meta.xAxisID===me.id:meta.yAxisID===me.id;}// First Calculate the range
me.min=null;me.max=null;if(opts.stacked){var valuesPerType={};var hasPositiveValues=false;var hasNegativeValues=false;helpers.each(datasets,function(dataset,datasetIndex){var meta=chart.getDatasetMeta(datasetIndex);if(valuesPerType[meta.type]===undefined){valuesPerType[meta.type]={positiveValues:[],negativeValues:[]};}// Store these per type
var positiveValues=valuesPerType[meta.type].positiveValues;var negativeValues=valuesPerType[meta.type].negativeValues;if(chart.isDatasetVisible(datasetIndex)&&IDMatches(meta)){helpers.each(dataset.data,function(rawValue,index){var value=+me.getRightValue(rawValue);if(isNaN(value)||meta.data[index].hidden){return;}positiveValues[index]=positiveValues[index]||0;negativeValues[index]=negativeValues[index]||0;if(opts.relativePoints){positiveValues[index]=100;}else{if(value<0){hasNegativeValues=true;negativeValues[index]+=value;}else{hasPositiveValues=true;positiveValues[index]+=value;}}});}});helpers.each(valuesPerType,function(valuesForType){var values=valuesForType.positiveValues.concat(valuesForType.negativeValues);var minVal=helpers.min(values);var maxVal=helpers.max(values);me.min=me.min===null?minVal:Math.min(me.min,minVal);me.max=me.max===null?maxVal:Math.max(me.max,maxVal);});}else{helpers.each(datasets,function(dataset,datasetIndex){var meta=chart.getDatasetMeta(datasetIndex);if(chart.isDatasetVisible(datasetIndex)&&IDMatches(meta)){helpers.each(dataset.data,function(rawValue,index){var value=+me.getRightValue(rawValue);if(isNaN(value)||meta.data[index].hidden){return;}if(me.min===null){me.min=value;}else if(value<me.min){me.min=value;}if(me.max===null){me.max=value;}else if(value>me.max){me.max=value;}});}});}// Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
this.handleTickRangeOptions();},getTickLimit:function getTickLimit(){var maxTicks;var me=this;var tickOpts=me.options.ticks;if(me.isHorizontal()){maxTicks=Math.min(tickOpts.maxTicksLimit?tickOpts.maxTicksLimit:11,Math.ceil(me.width/50));}else{// The factor of 2 used to scale the font size has been experimentally determined.
var tickFontSize=helpers.getValueOrDefault(tickOpts.fontSize,Chart.defaults.global.defaultFontSize);maxTicks=Math.min(tickOpts.maxTicksLimit?tickOpts.maxTicksLimit:11,Math.ceil(me.height/(2*tickFontSize)));}return maxTicks;},// Called after the ticks are built. We need 
handleDirectionalChanges:function handleDirectionalChanges(){if(!this.isHorizontal()){// We are in a vertical orientation. The top value is the highest. So reverse the array
this.ticks.reverse();}},getLabelForIndex:function getLabelForIndex(index,datasetIndex){return+this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);},// Utils
getPixelForValue:function getPixelForValue(value,index,datasetIndex,includeOffset){// This must be called after fit has been run so that
//      this.left, this.top, this.right, and this.bottom have been defined
var me=this;var paddingLeft=me.paddingLeft;var paddingBottom=me.paddingBottom;var start=me.start;var rightValue=+me.getRightValue(value);var pixel;var innerDimension;var range=me.end-start;if(me.isHorizontal()){innerDimension=me.width-(paddingLeft+me.paddingRight);pixel=me.left+innerDimension/range*(rightValue-start);return Math.round(pixel+paddingLeft);}else{innerDimension=me.height-(me.paddingTop+paddingBottom);pixel=me.bottom-paddingBottom-innerDimension/range*(rightValue-start);return Math.round(pixel);}},getValueForPixel:function getValueForPixel(pixel){var me=this;var isHorizontal=me.isHorizontal();var paddingLeft=me.paddingLeft;var paddingBottom=me.paddingBottom;var innerDimension=isHorizontal?me.width-(paddingLeft+me.paddingRight):me.height-(me.paddingTop+paddingBottom);var offset=(isHorizontal?pixel-me.left-paddingLeft:me.bottom-paddingBottom-pixel)/innerDimension;return me.start+(me.end-me.start)*offset;},getPixelForTick:function getPixelForTick(index,includeOffset){return this.getPixelForValue(this.ticksAsNumbers[index],null,null,includeOffset);}});Chart.scaleService.registerScaleType("linear",LinearScale,defaultConfig);};},{}],40:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers,noop=helpers.noop;Chart.LinearScaleBase=Chart.Scale.extend({handleTickRangeOptions:function handleTickRangeOptions(){var me=this;var opts=me.options;var tickOpts=opts.ticks;// If we are forcing it to begin at 0, but 0 will already be rendered on the chart,
// do nothing since that would make the chart weird. If the user really wants a weird chart
// axis, they can manually override it
if(tickOpts.beginAtZero){var minSign=helpers.sign(me.min);var maxSign=helpers.sign(me.max);if(minSign<0&&maxSign<0){// move the top up to 0
me.max=0;}else if(minSign>0&&maxSign>0){// move the botttom down to 0
me.min=0;}}if(tickOpts.min!==undefined){me.min=tickOpts.min;}else if(tickOpts.suggestedMin!==undefined){me.min=Math.min(me.min,tickOpts.suggestedMin);}if(tickOpts.max!==undefined){me.max=tickOpts.max;}else if(tickOpts.suggestedMax!==undefined){me.max=Math.max(me.max,tickOpts.suggestedMax);}if(me.min===me.max){me.max++;if(!tickOpts.beginAtZero){me.min--;}}},getTickLimit:noop,handleDirectionalChanges:noop,buildTicks:function buildTicks(){var me=this;var opts=me.options;var tickOpts=opts.ticks;var getValueOrDefault=helpers.getValueOrDefault;var isHorizontal=me.isHorizontal();var ticks=me.ticks=[];// Figure out what the max number of ticks we can support it is based on the size of
// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
// the graph
var maxTicks=me.getTickLimit();// Make sure we always have at least 2 ticks
maxTicks=Math.max(2,maxTicks);// To get a "nice" value for the tick spacing, we will use the appropriately named
// "nice number" algorithm. See http://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
// for details.
var spacing;var fixedStepSizeSet=tickOpts.fixedStepSize&&tickOpts.fixedStepSize>0||tickOpts.stepSize&&tickOpts.stepSize>0;if(fixedStepSizeSet){spacing=getValueOrDefault(tickOpts.fixedStepSize,tickOpts.stepSize);}else{var niceRange=helpers.niceNum(me.max-me.min,false);spacing=helpers.niceNum(niceRange/(maxTicks-1),true);}var niceMin=Math.floor(me.min/spacing)*spacing;var niceMax=Math.ceil(me.max/spacing)*spacing;var numSpaces=(niceMax-niceMin)/spacing;// If very close to our rounded value, use it.
if(helpers.almostEquals(numSpaces,Math.round(numSpaces),spacing/1000)){numSpaces=Math.round(numSpaces);}else{numSpaces=Math.ceil(numSpaces);}// Put the values into the ticks array
ticks.push(tickOpts.min!==undefined?tickOpts.min:niceMin);for(var j=1;j<numSpaces;++j){ticks.push(niceMin+j*spacing);}ticks.push(tickOpts.max!==undefined?tickOpts.max:niceMax);me.handleDirectionalChanges();// At this point, we need to update our max and min given the tick values since we have expanded the
// range of the scale
me.max=helpers.max(ticks);me.min=helpers.min(ticks);if(tickOpts.reverse){ticks.reverse();me.start=me.max;me.end=me.min;}else{me.start=me.min;me.end=me.max;}},convertTicksToLabels:function convertTicksToLabels(){var me=this;me.ticksAsNumbers=me.ticks.slice();me.zeroLineIndex=me.ticks.indexOf(0);Chart.Scale.prototype.convertTicksToLabels.call(me);}});};},{}],41:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;var defaultConfig={position:"left",// label settings
ticks:{callback:function callback(value,index,arr){var remain=value/Math.pow(10,Math.floor(helpers.log10(value)));if(remain===1||remain===2||remain===5||index===0||index===arr.length-1){return value.toExponential();}else{return'';}}}};var LogarithmicScale=Chart.Scale.extend({determineDataLimits:function determineDataLimits(){var me=this;var opts=me.options;var tickOpts=opts.ticks;var chart=me.chart;var data=chart.data;var datasets=data.datasets;var getValueOrDefault=helpers.getValueOrDefault;var isHorizontal=me.isHorizontal();function IDMatches(meta){return isHorizontal?meta.xAxisID===me.id:meta.yAxisID===me.id;}// Calculate Range
me.min=null;me.max=null;if(opts.stacked){var valuesPerType={};helpers.each(datasets,function(dataset,datasetIndex){var meta=chart.getDatasetMeta(datasetIndex);if(chart.isDatasetVisible(datasetIndex)&&IDMatches(meta)){if(valuesPerType[meta.type]===undefined){valuesPerType[meta.type]=[];}helpers.each(dataset.data,function(rawValue,index){var values=valuesPerType[meta.type];var value=+me.getRightValue(rawValue);if(isNaN(value)||meta.data[index].hidden){return;}values[index]=values[index]||0;if(opts.relativePoints){values[index]=100;}else{// Don't need to split positive and negative since the log scale can't handle a 0 crossing
values[index]+=value;}});}});helpers.each(valuesPerType,function(valuesForType){var minVal=helpers.min(valuesForType);var maxVal=helpers.max(valuesForType);me.min=me.min===null?minVal:Math.min(me.min,minVal);me.max=me.max===null?maxVal:Math.max(me.max,maxVal);});}else{helpers.each(datasets,function(dataset,datasetIndex){var meta=chart.getDatasetMeta(datasetIndex);if(chart.isDatasetVisible(datasetIndex)&&IDMatches(meta)){helpers.each(dataset.data,function(rawValue,index){var value=+me.getRightValue(rawValue);if(isNaN(value)||meta.data[index].hidden){return;}if(me.min===null){me.min=value;}else if(value<me.min){me.min=value;}if(me.max===null){me.max=value;}else if(value>me.max){me.max=value;}});}});}me.min=getValueOrDefault(tickOpts.min,me.min);me.max=getValueOrDefault(tickOpts.max,me.max);if(me.min===me.max){if(me.min!==0&&me.min!==null){me.min=Math.pow(10,Math.floor(helpers.log10(me.min))-1);me.max=Math.pow(10,Math.floor(helpers.log10(me.max))+1);}else{me.min=1;me.max=10;}}},buildTicks:function buildTicks(){var me=this;var opts=me.options;var tickOpts=opts.ticks;var getValueOrDefault=helpers.getValueOrDefault;// Reset the ticks array. Later on, we will draw a grid line at these positions
// The array simply contains the numerical value of the spots where ticks will be
var ticks=me.ticks=[];// Figure out what the max number of ticks we can support it is based on the size of
// the axis area. For now, we say that the minimum tick spacing in pixels must be 50
// We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
// the graph
var tickVal=getValueOrDefault(tickOpts.min,Math.pow(10,Math.floor(helpers.log10(me.min))));while(tickVal<me.max){ticks.push(tickVal);var exp=Math.floor(helpers.log10(tickVal));var significand=Math.floor(tickVal/Math.pow(10,exp))+1;if(significand===10){significand=1;++exp;}tickVal=significand*Math.pow(10,exp);}var lastTick=getValueOrDefault(tickOpts.max,tickVal);ticks.push(lastTick);if(!me.isHorizontal()){// We are in a vertical orientation. The top value is the highest. So reverse the array
ticks.reverse();}// At this point, we need to update our max and min given the tick values since we have expanded the
// range of the scale
me.max=helpers.max(ticks);me.min=helpers.min(ticks);if(tickOpts.reverse){ticks.reverse();me.start=me.max;me.end=me.min;}else{me.start=me.min;me.end=me.max;}},convertTicksToLabels:function convertTicksToLabels(){this.tickValues=this.ticks.slice();Chart.Scale.prototype.convertTicksToLabels.call(this);},// Get the correct tooltip label
getLabelForIndex:function getLabelForIndex(index,datasetIndex){return+this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);},getPixelForTick:function getPixelForTick(index,includeOffset){return this.getPixelForValue(this.tickValues[index],null,null,includeOffset);},getPixelForValue:function getPixelForValue(value,index,datasetIndex,includeOffset){var me=this;var innerDimension;var pixel;var start=me.start;var newVal=+me.getRightValue(value);var range=helpers.log10(me.end)-helpers.log10(start);var paddingTop=me.paddingTop;var paddingBottom=me.paddingBottom;var paddingLeft=me.paddingLeft;if(me.isHorizontal()){if(newVal===0){pixel=me.left+paddingLeft;}else{innerDimension=me.width-(paddingLeft+me.paddingRight);pixel=me.left+innerDimension/range*(helpers.log10(newVal)-helpers.log10(start));pixel+=paddingLeft;}}else{// Bottom - top since pixels increase downard on a screen
if(newVal===0){pixel=me.top+paddingTop;}else{innerDimension=me.height-(paddingTop+paddingBottom);pixel=me.bottom-paddingBottom-innerDimension/range*(helpers.log10(newVal)-helpers.log10(start));}}return pixel;},getValueForPixel:function getValueForPixel(pixel){var me=this;var offset;var range=helpers.log10(me.end)-helpers.log10(me.start);var value;var innerDimension;if(me.isHorizontal()){innerDimension=me.width-(me.paddingLeft+me.paddingRight);value=me.start*Math.pow(10,(pixel-me.left-me.paddingLeft)*range/innerDimension);}else{innerDimension=me.height-(me.paddingTop+me.paddingBottom);value=Math.pow(10,(me.bottom-me.paddingBottom-pixel)*range/innerDimension)/me.start;}return value;}});Chart.scaleService.registerScaleType("logarithmic",LogarithmicScale,defaultConfig);};},{}],42:[function(require,module,exports){"use strict";module.exports=function(Chart){var helpers=Chart.helpers;var globalDefaults=Chart.defaults.global;var defaultConfig={display:true,//Boolean - Whether to animate scaling the chart from the centre
animate:true,lineArc:false,position:"chartArea",angleLines:{display:true,color:"rgba(0, 0, 0, 0.1)",lineWidth:1},// label settings
ticks:{//Boolean - Show a backdrop to the scale label
showLabelBackdrop:true,//String - The colour of the label backdrop
backdropColor:"rgba(255,255,255,0.75)",//Number - The backdrop padding above & below the label in pixels
backdropPaddingY:2,//Number - The backdrop padding to the side of the label in pixels
backdropPaddingX:2},pointLabels:{//Number - Point label font size in pixels
fontSize:10,//Function - Used to convert point labels
callback:function callback(label){return label;}}};var LinearRadialScale=Chart.LinearScaleBase.extend({getValueCount:function getValueCount(){return this.chart.data.labels.length;},setDimensions:function setDimensions(){var me=this;var opts=me.options;var tickOpts=opts.ticks;// Set the unconstrained dimension before label rotation
me.width=me.maxWidth;me.height=me.maxHeight;me.xCenter=Math.round(me.width/2);me.yCenter=Math.round(me.height/2);var minSize=helpers.min([me.height,me.width]);var tickFontSize=helpers.getValueOrDefault(tickOpts.fontSize,globalDefaults.defaultFontSize);me.drawingArea=opts.display?minSize/2-(tickFontSize/2+tickOpts.backdropPaddingY):minSize/2;},determineDataLimits:function determineDataLimits(){var me=this;var chart=me.chart;me.min=null;me.max=null;helpers.each(chart.data.datasets,function(dataset,datasetIndex){if(chart.isDatasetVisible(datasetIndex)){var meta=chart.getDatasetMeta(datasetIndex);helpers.each(dataset.data,function(rawValue,index){var value=+me.getRightValue(rawValue);if(isNaN(value)||meta.data[index].hidden){return;}if(me.min===null){me.min=value;}else if(value<me.min){me.min=value;}if(me.max===null){me.max=value;}else if(value>me.max){me.max=value;}});}});// Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
me.handleTickRangeOptions();},getTickLimit:function getTickLimit(){var tickOpts=this.options.ticks;var tickFontSize=helpers.getValueOrDefault(tickOpts.fontSize,globalDefaults.defaultFontSize);return Math.min(tickOpts.maxTicksLimit?tickOpts.maxTicksLimit:11,Math.ceil(this.drawingArea/(1.5*tickFontSize)));},convertTicksToLabels:function convertTicksToLabels(){var me=this;Chart.LinearScaleBase.prototype.convertTicksToLabels.call(me);// Point labels
me.pointLabels=me.chart.data.labels.map(me.options.pointLabels.callback,me);},getLabelForIndex:function getLabelForIndex(index,datasetIndex){return+this.getRightValue(this.chart.data.datasets[datasetIndex].data[index]);},fit:function fit(){/*
			 * Right, this is really confusing and there is a lot of maths going on here
			 * The gist of the problem is here: https://gist.github.com/nnnick/696cc9c55f4b0beb8fe9
			 *
			 * Reaction: https://dl.dropboxusercontent.com/u/34601363/toomuchscience.gif
			 *
			 * Solution:
			 *
			 * We assume the radius of the polygon is half the size of the canvas at first
			 * at each index we check if the text overlaps.
			 *
			 * Where it does, we store that angle and that index.
			 *
			 * After finding the largest index and angle we calculate how much we need to remove
			 * from the shape radius to move the point inwards by that x.
			 *
			 * We average the left and right distances to get the maximum shape radius that can fit in the box
			 * along with labels.
			 *
			 * Once we have that, we can find the centre point for the chart, by taking the x text protrusion
			 * on each side, removing that from the size, halving it and adding the left x protrusion width.
			 *
			 * This will mean we have a shape fitted to the canvas, as large as it can be with the labels
			 * and position it in the most space efficient manner
			 *
			 * https://dl.dropboxusercontent.com/u/34601363/yeahscience.gif
			 */var pointLabels=this.options.pointLabels;var pointLabelFontSize=helpers.getValueOrDefault(pointLabels.fontSize,globalDefaults.defaultFontSize);var pointLabeFontStyle=helpers.getValueOrDefault(pointLabels.fontStyle,globalDefaults.defaultFontStyle);var pointLabeFontFamily=helpers.getValueOrDefault(pointLabels.fontFamily,globalDefaults.defaultFontFamily);var pointLabeFont=helpers.fontString(pointLabelFontSize,pointLabeFontStyle,pointLabeFontFamily);// Get maximum radius of the polygon. Either half the height (minus the text width) or half the width.
// Use this to calculate the offset + change. - Make sure L/R protrusion is at least 0 to stop issues with centre points
var largestPossibleRadius=helpers.min([this.height/2-pointLabelFontSize-5,this.width/2]),pointPosition,i,textWidth,halfTextWidth,furthestRight=this.width,furthestRightIndex,furthestRightAngle,furthestLeft=0,furthestLeftIndex,furthestLeftAngle,xProtrusionLeft,xProtrusionRight,radiusReductionRight,radiusReductionLeft,maxWidthRadius;this.ctx.font=pointLabeFont;for(i=0;i<this.getValueCount();i++){// 5px to space the text slightly out - similar to what we do in the draw function.
pointPosition=this.getPointPosition(i,largestPossibleRadius);textWidth=this.ctx.measureText(this.pointLabels[i]?this.pointLabels[i]:'').width+5;if(i===0||i===this.getValueCount()/2){// If we're at index zero, or exactly the middle, we're at exactly the top/bottom
// of the radar chart, so text will be aligned centrally, so we'll half it and compare
// w/left and right text sizes
halfTextWidth=textWidth/2;if(pointPosition.x+halfTextWidth>furthestRight){furthestRight=pointPosition.x+halfTextWidth;furthestRightIndex=i;}if(pointPosition.x-halfTextWidth<furthestLeft){furthestLeft=pointPosition.x-halfTextWidth;furthestLeftIndex=i;}}else if(i<this.getValueCount()/2){// Less than half the values means we'll left align the text
if(pointPosition.x+textWidth>furthestRight){furthestRight=pointPosition.x+textWidth;furthestRightIndex=i;}}else if(i>this.getValueCount()/2){// More than half the values means we'll right align the text
if(pointPosition.x-textWidth<furthestLeft){furthestLeft=pointPosition.x-textWidth;furthestLeftIndex=i;}}}xProtrusionLeft=furthestLeft;xProtrusionRight=Math.ceil(furthestRight-this.width);furthestRightAngle=this.getIndexAngle(furthestRightIndex);furthestLeftAngle=this.getIndexAngle(furthestLeftIndex);radiusReductionRight=xProtrusionRight/Math.sin(furthestRightAngle+Math.PI/2);radiusReductionLeft=xProtrusionLeft/Math.sin(furthestLeftAngle+Math.PI/2);// Ensure we actually need to reduce the size of the chart
radiusReductionRight=helpers.isNumber(radiusReductionRight)?radiusReductionRight:0;radiusReductionLeft=helpers.isNumber(radiusReductionLeft)?radiusReductionLeft:0;this.drawingArea=Math.round(largestPossibleRadius-(radiusReductionLeft+radiusReductionRight)/2);this.setCenterPoint(radiusReductionLeft,radiusReductionRight);},setCenterPoint:function setCenterPoint(leftMovement,rightMovement){var me=this;var maxRight=me.width-rightMovement-me.drawingArea,maxLeft=leftMovement+me.drawingArea;me.xCenter=Math.round((maxLeft+maxRight)/2+me.left);// Always vertically in the centre as the text height doesn't change
me.yCenter=Math.round(me.height/2+me.top);},getIndexAngle:function getIndexAngle(index){var angleMultiplier=Math.PI*2/this.getValueCount();// Start from the top instead of right, so remove a quarter of the circle
return index*angleMultiplier-Math.PI/2;},getDistanceFromCenterForValue:function getDistanceFromCenterForValue(value){var me=this;if(value===null){return 0;// null always in center
}// Take into account half font size + the yPadding of the top value
var scalingFactor=me.drawingArea/(me.max-me.min);if(me.options.reverse){return(me.max-value)*scalingFactor;}else{return(value-me.min)*scalingFactor;}},getPointPosition:function getPointPosition(index,distanceFromCenter){var me=this;var thisAngle=me.getIndexAngle(index);return{x:Math.round(Math.cos(thisAngle)*distanceFromCenter)+me.xCenter,y:Math.round(Math.sin(thisAngle)*distanceFromCenter)+me.yCenter};},getPointPositionForValue:function getPointPositionForValue(index,value){return this.getPointPosition(index,this.getDistanceFromCenterForValue(value));},getBasePosition:function getBasePosition(){var me=this;var min=me.min;var max=me.max;return me.getPointPositionForValue(0,me.beginAtZero?0:min<0&&max<0?max:min>0&&max>0?min:0);},draw:function draw(){var me=this;var opts=me.options;var gridLineOpts=opts.gridLines;var tickOpts=opts.ticks;var angleLineOpts=opts.angleLines;var pointLabelOpts=opts.pointLabels;var getValueOrDefault=helpers.getValueOrDefault;if(opts.display){var ctx=me.ctx;// Tick Font
var tickFontSize=getValueOrDefault(tickOpts.fontSize,globalDefaults.defaultFontSize);var tickFontStyle=getValueOrDefault(tickOpts.fontStyle,globalDefaults.defaultFontStyle);var tickFontFamily=getValueOrDefault(tickOpts.fontFamily,globalDefaults.defaultFontFamily);var tickLabelFont=helpers.fontString(tickFontSize,tickFontStyle,tickFontFamily);helpers.each(me.ticks,function(label,index){// Don't draw a centre value (if it is minimum)
if(index>0||opts.reverse){var yCenterOffset=me.getDistanceFromCenterForValue(me.ticksAsNumbers[index]);var yHeight=me.yCenter-yCenterOffset;// Draw circular lines around the scale
if(gridLineOpts.display&&index!==0){ctx.strokeStyle=helpers.getValueAtIndexOrDefault(gridLineOpts.color,index-1);ctx.lineWidth=helpers.getValueAtIndexOrDefault(gridLineOpts.lineWidth,index-1);if(opts.lineArc){// Draw circular arcs between the points
ctx.beginPath();ctx.arc(me.xCenter,me.yCenter,yCenterOffset,0,Math.PI*2);ctx.closePath();ctx.stroke();}else{// Draw straight lines connecting each index
ctx.beginPath();for(var i=0;i<me.getValueCount();i++){var pointPosition=me.getPointPosition(i,yCenterOffset);if(i===0){ctx.moveTo(pointPosition.x,pointPosition.y);}else{ctx.lineTo(pointPosition.x,pointPosition.y);}}ctx.closePath();ctx.stroke();}}if(tickOpts.display){var tickFontColor=getValueOrDefault(tickOpts.fontColor,globalDefaults.defaultFontColor);ctx.font=tickLabelFont;if(tickOpts.showLabelBackdrop){var labelWidth=ctx.measureText(label).width;ctx.fillStyle=tickOpts.backdropColor;ctx.fillRect(me.xCenter-labelWidth/2-tickOpts.backdropPaddingX,yHeight-tickFontSize/2-tickOpts.backdropPaddingY,labelWidth+tickOpts.backdropPaddingX*2,tickFontSize+tickOpts.backdropPaddingY*2);}ctx.textAlign='center';ctx.textBaseline="middle";ctx.fillStyle=tickFontColor;ctx.fillText(label,me.xCenter,yHeight);}}});if(!opts.lineArc){ctx.lineWidth=angleLineOpts.lineWidth;ctx.strokeStyle=angleLineOpts.color;var outerDistance=me.getDistanceFromCenterForValue(opts.reverse?me.min:me.max);// Point Label Font
var pointLabelFontSize=getValueOrDefault(pointLabelOpts.fontSize,globalDefaults.defaultFontSize);var pointLabeFontStyle=getValueOrDefault(pointLabelOpts.fontStyle,globalDefaults.defaultFontStyle);var pointLabeFontFamily=getValueOrDefault(pointLabelOpts.fontFamily,globalDefaults.defaultFontFamily);var pointLabeFont=helpers.fontString(pointLabelFontSize,pointLabeFontStyle,pointLabeFontFamily);for(var i=me.getValueCount()-1;i>=0;i--){if(angleLineOpts.display){var outerPosition=me.getPointPosition(i,outerDistance);ctx.beginPath();ctx.moveTo(me.xCenter,me.yCenter);ctx.lineTo(outerPosition.x,outerPosition.y);ctx.stroke();ctx.closePath();}// Extra 3px out for some label spacing
var pointLabelPosition=me.getPointPosition(i,outerDistance+5);// Keep this in loop since we may support array properties here
var pointLabelFontColor=getValueOrDefault(pointLabelOpts.fontColor,globalDefaults.defaultFontColor);ctx.font=pointLabeFont;ctx.fillStyle=pointLabelFontColor;var pointLabels=me.pointLabels,labelsCount=pointLabels.length,halfLabelsCount=pointLabels.length/2,quarterLabelsCount=halfLabelsCount/2,upperHalf=i<quarterLabelsCount||i>labelsCount-quarterLabelsCount,exactQuarter=i===quarterLabelsCount||i===labelsCount-quarterLabelsCount;if(i===0){ctx.textAlign='center';}else if(i===halfLabelsCount){ctx.textAlign='center';}else if(i<halfLabelsCount){ctx.textAlign='left';}else{ctx.textAlign='right';}// Set the correct text baseline based on outer positioning
if(exactQuarter){ctx.textBaseline='middle';}else if(upperHalf){ctx.textBaseline='bottom';}else{ctx.textBaseline='top';}ctx.fillText(pointLabels[i]?pointLabels[i]:'',pointLabelPosition.x,pointLabelPosition.y);}}}}});Chart.scaleService.registerScaleType("radialLinear",LinearRadialScale,defaultConfig);};},{}],43:[function(require,module,exports){/*global window: false */"use strict";var moment=require(1);moment=typeof moment==='function'?moment:window.moment;module.exports=function(Chart){var helpers=Chart.helpers;var time={units:[{name:'millisecond',steps:[1,2,5,10,20,50,100,250,500]},{name:'second',steps:[1,2,5,10,30]},{name:'minute',steps:[1,2,5,10,30]},{name:'hour',steps:[1,2,3,6,12]},{name:'day',steps:[1,2,5]},{name:'week',maxStep:4},{name:'month',maxStep:3},{name:'quarter',maxStep:4},{name:'year',maxStep:false}]};var defaultConfig={position:"bottom",time:{parser:false,// false == a pattern string from http://momentjs.com/docs/#/parsing/string-format/ or a custom callback that converts its argument to a moment
format:false,// DEPRECATED false == date objects, moment object, callback or a pattern string from http://momentjs.com/docs/#/parsing/string-format/
unit:false,// false == automatic or override with week, month, year, etc.
round:false,// none, or override with week, month, year, etc.
displayFormat:false,// DEPRECATED
isoWeekday:false,// override week start day - see http://momentjs.com/docs/#/get-set/iso-weekday/
// defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
displayFormats:{'millisecond':'h:mm:ss.SSS a',// 11:20:01.123 AM,
'second':'h:mm:ss a',// 11:20:01 AM
'minute':'h:mm:ss a',// 11:20:01 AM
'hour':'MMM D, hA',// Sept 4, 5PM
'day':'ll',// Sep 4 2015
'week':'ll',// Week 46, or maybe "[W]WW - YYYY" ?
'month':'MMM YYYY',// Sept 2015
'quarter':'[Q]Q - YYYY',// Q3
'year':'YYYY'// 2015
}},ticks:{autoSkip:false}};var TimeScale=Chart.Scale.extend({initialize:function initialize(){if(!moment){throw new Error('Chart.js - Moment.js could not be found! You must include it before Chart.js to use the time scale. Download at https://momentjs.com');}Chart.Scale.prototype.initialize.call(this);},getLabelMoment:function getLabelMoment(datasetIndex,index){return this.labelMoments[datasetIndex][index];},getMomentStartOf:function getMomentStartOf(tick){var me=this;if(me.options.time.unit==='week'&&me.options.time.isoWeekday!==false){return tick.clone().startOf('isoWeek').isoWeekday(me.options.time.isoWeekday);}else{return tick.clone().startOf(me.tickUnit);}},determineDataLimits:function determineDataLimits(){var me=this;me.labelMoments=[];// Only parse these once. If the dataset does not have data as x,y pairs, we will use
// these
var scaleLabelMoments=[];if(me.chart.data.labels&&me.chart.data.labels.length>0){helpers.each(me.chart.data.labels,function(label,index){var labelMoment=me.parseTime(label);if(labelMoment.isValid()){if(me.options.time.round){labelMoment.startOf(me.options.time.round);}scaleLabelMoments.push(labelMoment);}},me);me.firstTick=moment.min.call(me,scaleLabelMoments);me.lastTick=moment.max.call(me,scaleLabelMoments);}else{me.firstTick=null;me.lastTick=null;}helpers.each(me.chart.data.datasets,function(dataset,datasetIndex){var momentsForDataset=[];var datasetVisible=me.chart.isDatasetVisible(datasetIndex);if(_typeof(dataset.data[0])==='object'&&dataset.data[0]!==null){helpers.each(dataset.data,function(value,index){var labelMoment=me.parseTime(me.getRightValue(value));if(labelMoment.isValid()){if(me.options.time.round){labelMoment.startOf(me.options.time.round);}momentsForDataset.push(labelMoment);if(datasetVisible){// May have gone outside the scale ranges, make sure we keep the first and last ticks updated
me.firstTick=me.firstTick!==null?moment.min(me.firstTick,labelMoment):labelMoment;me.lastTick=me.lastTick!==null?moment.max(me.lastTick,labelMoment):labelMoment;}}},me);}else{// We have no labels. Use the ones from the scale
momentsForDataset=scaleLabelMoments;}me.labelMoments.push(momentsForDataset);},me);// Set these after we've done all the data
if(me.options.time.min){me.firstTick=me.parseTime(me.options.time.min);}if(me.options.time.max){me.lastTick=me.parseTime(me.options.time.max);}// We will modify these, so clone for later
me.firstTick=(me.firstTick||moment()).clone();me.lastTick=(me.lastTick||moment()).clone();},buildTicks:function buildTicks(index){var me=this;me.ctx.save();var tickFontSize=helpers.getValueOrDefault(me.options.ticks.fontSize,Chart.defaults.global.defaultFontSize);var tickFontStyle=helpers.getValueOrDefault(me.options.ticks.fontStyle,Chart.defaults.global.defaultFontStyle);var tickFontFamily=helpers.getValueOrDefault(me.options.ticks.fontFamily,Chart.defaults.global.defaultFontFamily);var tickLabelFont=helpers.fontString(tickFontSize,tickFontStyle,tickFontFamily);me.ctx.font=tickLabelFont;me.ticks=[];me.unitScale=1;// How much we scale the unit by, ie 2 means 2x unit per step
me.scaleSizeInUnits=0;// How large the scale is in the base unit (seconds, minutes, etc)
// Set unit override if applicable
if(me.options.time.unit){me.tickUnit=me.options.time.unit||'day';me.displayFormat=me.options.time.displayFormats[me.tickUnit];me.scaleSizeInUnits=me.lastTick.diff(me.firstTick,me.tickUnit,true);me.unitScale=helpers.getValueOrDefault(me.options.time.unitStepSize,1);}else{// Determine the smallest needed unit of the time
var innerWidth=me.isHorizontal()?me.width-(me.paddingLeft+me.paddingRight):me.height-(me.paddingTop+me.paddingBottom);// Crude approximation of what the label length might be
var tempFirstLabel=me.tickFormatFunction(me.firstTick,0,[]);var tickLabelWidth=me.ctx.measureText(tempFirstLabel).width;var cosRotation=Math.cos(helpers.toRadians(me.options.ticks.maxRotation));var sinRotation=Math.sin(helpers.toRadians(me.options.ticks.maxRotation));tickLabelWidth=tickLabelWidth*cosRotation+tickFontSize*sinRotation;var labelCapacity=innerWidth/tickLabelWidth;// Start as small as possible
me.tickUnit='millisecond';me.scaleSizeInUnits=me.lastTick.diff(me.firstTick,me.tickUnit,true);me.displayFormat=me.options.time.displayFormats[me.tickUnit];var unitDefinitionIndex=0;var unitDefinition=time.units[unitDefinitionIndex];// While we aren't ideal and we don't have units left
while(unitDefinitionIndex<time.units.length){// Can we scale this unit. If `false` we can scale infinitely
me.unitScale=1;if(helpers.isArray(unitDefinition.steps)&&Math.ceil(me.scaleSizeInUnits/labelCapacity)<helpers.max(unitDefinition.steps)){// Use one of the prefedined steps
for(var idx=0;idx<unitDefinition.steps.length;++idx){if(unitDefinition.steps[idx]>=Math.ceil(me.scaleSizeInUnits/labelCapacity)){me.unitScale=helpers.getValueOrDefault(me.options.time.unitStepSize,unitDefinition.steps[idx]);break;}}break;}else if(unitDefinition.maxStep===false||Math.ceil(me.scaleSizeInUnits/labelCapacity)<unitDefinition.maxStep){// We have a max step. Scale this unit
me.unitScale=helpers.getValueOrDefault(me.options.time.unitStepSize,Math.ceil(me.scaleSizeInUnits/labelCapacity));break;}else{// Move to the next unit up
++unitDefinitionIndex;unitDefinition=time.units[unitDefinitionIndex];me.tickUnit=unitDefinition.name;var leadingUnitBuffer=me.firstTick.diff(me.getMomentStartOf(me.firstTick),me.tickUnit,true);var trailingUnitBuffer=me.getMomentStartOf(me.lastTick.clone().add(1,me.tickUnit)).diff(me.lastTick,me.tickUnit,true);me.scaleSizeInUnits=me.lastTick.diff(me.firstTick,me.tickUnit,true)+leadingUnitBuffer+trailingUnitBuffer;me.displayFormat=me.options.time.displayFormats[unitDefinition.name];}}}var roundedStart;// Only round the first tick if we have no hard minimum
if(!me.options.time.min){me.firstTick=me.getMomentStartOf(me.firstTick);roundedStart=me.firstTick;}else{roundedStart=me.getMomentStartOf(me.firstTick);}// Only round the last tick if we have no hard maximum
if(!me.options.time.max){var roundedEnd=me.getMomentStartOf(me.lastTick);if(roundedEnd.diff(me.lastTick,me.tickUnit,true)!==0){// Do not use end of because we need me to be in the next time unit
me.lastTick=me.getMomentStartOf(me.lastTick.add(1,me.tickUnit));}}me.smallestLabelSeparation=me.width;helpers.each(me.chart.data.datasets,function(dataset,datasetIndex){for(var i=1;i<me.labelMoments[datasetIndex].length;i++){me.smallestLabelSeparation=Math.min(me.smallestLabelSeparation,me.labelMoments[datasetIndex][i].diff(me.labelMoments[datasetIndex][i-1],me.tickUnit,true));}},me);// Tick displayFormat override
if(me.options.time.displayFormat){me.displayFormat=me.options.time.displayFormat;}// first tick. will have been rounded correctly if options.time.min is not specified
me.ticks.push(me.firstTick.clone());// For every unit in between the first and last moment, create a moment and add it to the ticks tick
for(var i=1;i<=me.scaleSizeInUnits;++i){var newTick=roundedStart.clone().add(i,me.tickUnit);// Are we greater than the max time
if(me.options.time.max&&newTick.diff(me.lastTick,me.tickUnit,true)>=0){break;}if(i%me.unitScale===0){me.ticks.push(newTick);}}// Always show the right tick
var diff=me.ticks[me.ticks.length-1].diff(me.lastTick,me.tickUnit);if(diff!==0||me.scaleSizeInUnits===0){// this is a weird case. If the <max> option is the same as the end option, we can't just diff the times because the tick was created from the roundedStart
// but the last tick was not rounded.
if(me.options.time.max){me.ticks.push(me.lastTick.clone());me.scaleSizeInUnits=me.lastTick.diff(me.ticks[0],me.tickUnit,true);}else{me.ticks.push(me.lastTick.clone());me.scaleSizeInUnits=me.lastTick.diff(me.firstTick,me.tickUnit,true);}}me.ctx.restore();},// Get tooltip label
getLabelForIndex:function getLabelForIndex(index,datasetIndex){var me=this;var label=me.chart.data.labels&&index<me.chart.data.labels.length?me.chart.data.labels[index]:'';if(_typeof(me.chart.data.datasets[datasetIndex].data[0])==='object'){label=me.getRightValue(me.chart.data.datasets[datasetIndex].data[index]);}// Format nicely
if(me.options.time.tooltipFormat){label=me.parseTime(label).format(me.options.time.tooltipFormat);}return label;},// Function to format an individual tick mark
tickFormatFunction:function tickFormatFunction(tick,index,ticks){var formattedTick=tick.format(this.displayFormat);var tickOpts=this.options.ticks;var callback=helpers.getValueOrDefault(tickOpts.callback,tickOpts.userCallback);if(callback){return callback(formattedTick,index,ticks);}else{return formattedTick;}},convertTicksToLabels:function convertTicksToLabels(){var me=this;me.tickMoments=me.ticks;me.ticks=me.ticks.map(me.tickFormatFunction,me);},getPixelForValue:function getPixelForValue(value,index,datasetIndex,includeOffset){var me=this;var labelMoment=value&&value.isValid&&value.isValid()?value:me.getLabelMoment(datasetIndex,index);if(labelMoment){var offset=labelMoment.diff(me.firstTick,me.tickUnit,true);var decimal=offset/me.scaleSizeInUnits;if(me.isHorizontal()){var innerWidth=me.width-(me.paddingLeft+me.paddingRight);var valueWidth=innerWidth/Math.max(me.ticks.length-1,1);var valueOffset=innerWidth*decimal+me.paddingLeft;return me.left+Math.round(valueOffset);}else{var innerHeight=me.height-(me.paddingTop+me.paddingBottom);var valueHeight=innerHeight/Math.max(me.ticks.length-1,1);var heightOffset=innerHeight*decimal+me.paddingTop;return me.top+Math.round(heightOffset);}}},getPixelForTick:function getPixelForTick(index,includeOffset){return this.getPixelForValue(this.tickMoments[index],null,null,includeOffset);},getValueForPixel:function getValueForPixel(pixel){var me=this;var innerDimension=me.isHorizontal()?me.width-(me.paddingLeft+me.paddingRight):me.height-(me.paddingTop+me.paddingBottom);var offset=(pixel-(me.isHorizontal()?me.left+me.paddingLeft:me.top+me.paddingTop))/innerDimension;offset*=me.scaleSizeInUnits;return me.firstTick.clone().add(moment.duration(offset,me.tickUnit).asSeconds(),'seconds');},parseTime:function parseTime(label){var me=this;if(typeof me.options.time.parser==='string'){return moment(label,me.options.time.parser);}if(typeof me.options.time.parser==='function'){return me.options.time.parser(label);}// Date objects
if(typeof label.getMonth==='function'||typeof label==='number'){return moment(label);}// Moment support
if(label.isValid&&label.isValid()){return label;}// Custom parsing (return an instance of moment)
if(typeof me.options.time.format!=='string'&&me.options.time.format.call){console.warn("options.time.format is deprecated and replaced by options.time.parser. See http://nnnick.github.io/Chart.js/docs-v2/#scales-time-scale");return me.options.time.format(label);}// Moment format parsing
return moment(label,me.options.time.format);}});Chart.scaleService.registerScaleType("time",TimeScale,defaultConfig);};},{"1":1}]},{},[7])(7);});
});

require.register("web/static/js/charts", function(exports, require, module) {
"use strict";

$(document).ready(function () {
  var labels = [];
  var labourData = [];
  var materialData = [];
  var data = {};

  $(".dayOfWeek").each(function (index) {
    labels.push($(this).text());
  });

  $(".labourData").each(function (index) {
    if ($(this).text() == "") {
      labourData.push(0.00);
    } else {
      labourData.push(parseFloat($(this).text().replace(/\,/g, '')));
    }
  });

  $(".materialData").each(function (index) {
    if ($(this).text() == "") {
      materialData.push(0.00);
    } else {
      materialData.push(parseFloat($(this).text().replace(/\,/g, '')));
    }
  });

  data.labourData = labourData;
  data.materialData = materialData;

  if (labels.length !== 0) {
    renderBarChart(data, labels);
  }

  $(".changeGraphType").on("change", function (event) {
    var type = $(this).val();
    $(".graphArea").empty();
    $(".graphArea").html("<canvas id='myChart' width='400' height='200'></canvas>");
    changeGraphType(type, data, labels);
    event.preventDefault();
  });

  function changeGraphType(type, data, labels) {
    switch (type) {
      case "bar":
        renderBarChart(data, labels);
        break;
      case "line":
        renderLineChart(data, labels);
        break;
    }
  }

  function renderBarChart(data, labels) {
    var ctx = $("#myChart");
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Labour',
          data: data.labourData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255,99,132,1)',
          borderWidth: 1 }, {
          label: 'Material',
          data: data.materialData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1 }]
      }, options: {
        scales: { yAxes: [{ ticks: { beginAtZero: true } }]
        }
      }
    });
  }

  function renderLineChart(data, labels) {
    var ctx = $("#myChart");
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: "Labour",
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255,99,132,1)",
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: data.labourData
        }, {
          label: "Material",
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: data.materialData
        }]
      }, options: {
        scales: { yAxes: [{ ticks: { beginAtZero: true } }]
        }
      }
    });
  }
});
});

require.register("web/static/js/jqueryui", function(exports, require, module) {
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};/*! jQuery UI - v1.11.4 - 2016-06-05
* http://jqueryui.com
* Includes: core.js, widget.js, mouse.js, position.js, draggable.js, droppable.js, resizable.js, selectable.js, sortable.js, accordion.js, autocomplete.js, button.js, datepicker.js, dialog.js, menu.js, progressbar.js, selectmenu.js, slider.js, spinner.js, tabs.js, tooltip.js, effect.js, effect-blind.js, effect-bounce.js, effect-clip.js, effect-drop.js, effect-explode.js, effect-fade.js, effect-fold.js, effect-highlight.js, effect-puff.js, effect-pulsate.js, effect-scale.js, effect-shake.js, effect-size.js, effect-slide.js, effect-transfer.js
* Copyright jQuery Foundation and other contributors; Licensed MIT */(function(factory){if(typeof define==="function"&&define.amd){// AMD. Register as an anonymous module.
define(["jquery"],factory);}else{// Browser globals
factory(jQuery);}})(function($){/*!
 * jQuery UI Core 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui=$.ui||{};$.extend($.ui,{version:"1.11.4",keyCode:{BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}});// plugins
$.fn.extend({scrollParent:function scrollParent(includeHidden){var position=this.css("position"),excludeStaticParent=position==="absolute",overflowRegex=includeHidden?/(auto|scroll|hidden)/:/(auto|scroll)/,scrollParent=this.parents().filter(function(){var parent=$(this);if(excludeStaticParent&&parent.css("position")==="static"){return false;}return overflowRegex.test(parent.css("overflow")+parent.css("overflow-y")+parent.css("overflow-x"));}).eq(0);return position==="fixed"||!scrollParent.length?$(this[0].ownerDocument||document):scrollParent;},uniqueId:function(){var uuid=0;return function(){return this.each(function(){if(!this.id){this.id="ui-id-"+ ++uuid;}});};}(),removeUniqueId:function removeUniqueId(){return this.each(function(){if(/^ui-id-\d+$/.test(this.id)){$(this).removeAttr("id");}});}});// selectors
function _focusable(element,isTabIndexNotNaN){var map,mapName,img,nodeName=element.nodeName.toLowerCase();if("area"===nodeName){map=element.parentNode;mapName=map.name;if(!element.href||!mapName||map.nodeName.toLowerCase()!=="map"){return false;}img=$("img[usemap='#"+mapName+"']")[0];return!!img&&visible(img);}return(/^(input|select|textarea|button|object)$/.test(nodeName)?!element.disabled:"a"===nodeName?element.href||isTabIndexNotNaN:isTabIndexNotNaN)&&// the element and all of its ancestors must be visible
visible(element);}function visible(element){return $.expr.filters.visible(element)&&!$(element).parents().addBack().filter(function(){return $.css(this,"visibility")==="hidden";}).length;}$.extend($.expr[":"],{data:$.expr.createPseudo?$.expr.createPseudo(function(dataName){return function(elem){return!!$.data(elem,dataName);};}):// support: jQuery <1.8
function(elem,i,match){return!!$.data(elem,match[3]);},focusable:function focusable(element){return _focusable(element,!isNaN($.attr(element,"tabindex")));},tabbable:function tabbable(element){var tabIndex=$.attr(element,"tabindex"),isTabIndexNaN=isNaN(tabIndex);return(isTabIndexNaN||tabIndex>=0)&&_focusable(element,!isTabIndexNaN);}});// support: jQuery <1.8
if(!$("<a>").outerWidth(1).jquery){$.each(["Width","Height"],function(i,name){var side=name==="Width"?["Left","Right"]:["Top","Bottom"],type=name.toLowerCase(),orig={innerWidth:$.fn.innerWidth,innerHeight:$.fn.innerHeight,outerWidth:$.fn.outerWidth,outerHeight:$.fn.outerHeight};function reduce(elem,size,border,margin){$.each(side,function(){size-=parseFloat($.css(elem,"padding"+this))||0;if(border){size-=parseFloat($.css(elem,"border"+this+"Width"))||0;}if(margin){size-=parseFloat($.css(elem,"margin"+this))||0;}});return size;}$.fn["inner"+name]=function(size){if(size===undefined){return orig["inner"+name].call(this);}return this.each(function(){$(this).css(type,reduce(this,size)+"px");});};$.fn["outer"+name]=function(size,margin){if(typeof size!=="number"){return orig["outer"+name].call(this,size);}return this.each(function(){$(this).css(type,reduce(this,size,true,margin)+"px");});};});}// support: jQuery <1.8
if(!$.fn.addBack){$.fn.addBack=function(selector){return this.add(selector==null?this.prevObject:this.prevObject.filter(selector));};}// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if($("<a>").data("a-b","a").removeData("a-b").data("a-b")){$.fn.removeData=function(removeData){return function(key){if(arguments.length){return removeData.call(this,$.camelCase(key));}else{return removeData.call(this);}};}($.fn.removeData);}// deprecated
$.ui.ie=!!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());$.fn.extend({focus:function(orig){return function(delay,fn){return typeof delay==="number"?this.each(function(){var elem=this;setTimeout(function(){$(elem).focus();if(fn){fn.call(elem);}},delay);}):orig.apply(this,arguments);};}($.fn.focus),disableSelection:function(){var eventType="onselectstart"in document.createElement("div")?"selectstart":"mousedown";return function(){return this.bind(eventType+".ui-disableSelection",function(event){event.preventDefault();});};}(),enableSelection:function enableSelection(){return this.unbind(".ui-disableSelection");},zIndex:function zIndex(_zIndex){if(_zIndex!==undefined){return this.css("zIndex",_zIndex);}if(this.length){var elem=$(this[0]),position,value;while(elem.length&&elem[0]!==document){// Ignore z-index if position is set to a value where z-index is ignored by the browser
// This makes behavior of this function consistent across browsers
// WebKit always returns auto if the element is positioned
position=elem.css("position");if(position==="absolute"||position==="relative"||position==="fixed"){// IE returns 0 when zIndex is not specified
// other browsers return a string
// we ignore the case of nested elements with an explicit value of 0
// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
value=parseInt(elem.css("zIndex"),10);if(!isNaN(value)&&value!==0){return value;}}elem=elem.parent();}}return 0;}});// $.ui.plugin is deprecated. Use $.widget() extensions instead.
$.ui.plugin={add:function add(module,option,set){var i,proto=$.ui[module].prototype;for(i in set){proto.plugins[i]=proto.plugins[i]||[];proto.plugins[i].push([option,set[i]]);}},call:function call(instance,name,args,allowDisconnected){var i,set=instance.plugins[name];if(!set){return;}if(!allowDisconnected&&(!instance.element[0].parentNode||instance.element[0].parentNode.nodeType===11)){return;}for(i=0;i<set.length;i++){if(instance.options[set[i][0]]){set[i][1].apply(instance.element,args);}}}};/*!
 * jQuery UI Widget 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */var widget_uuid=0,widget_slice=Array.prototype.slice;$.cleanData=function(orig){return function(elems){var events,elem,i;for(i=0;(elem=elems[i])!=null;i++){try{// Only trigger remove when necessary to save time
events=$._data(elem,"events");if(events&&events.remove){$(elem).triggerHandler("remove");}// http://bugs.jquery.com/ticket/8235
}catch(e){}}orig(elems);};}($.cleanData);$.widget=function(name,base,prototype){var fullName,existingConstructor,constructor,basePrototype,// proxiedPrototype allows the provided prototype to remain unmodified
// so that it can be used as a mixin for multiple widgets (#8876)
proxiedPrototype={},namespace=name.split(".")[0];name=name.split(".")[1];fullName=namespace+"-"+name;if(!prototype){prototype=base;base=$.Widget;}// create selector for plugin
$.expr[":"][fullName.toLowerCase()]=function(elem){return!!$.data(elem,fullName);};$[namespace]=$[namespace]||{};existingConstructor=$[namespace][name];constructor=$[namespace][name]=function(options,element){// allow instantiation without "new" keyword
if(!this._createWidget){return new constructor(options,element);}// allow instantiation without initializing for simple inheritance
// must use "new" keyword (the code above always passes args)
if(arguments.length){this._createWidget(options,element);}};// extend with the existing constructor to carry over any static properties
$.extend(constructor,existingConstructor,{version:prototype.version,// copy the object used to create the prototype in case we need to
// redefine the widget later
_proto:$.extend({},prototype),// track widgets that inherit from this widget in case this widget is
// redefined after a widget inherits from it
_childConstructors:[]});basePrototype=new base();// we need to make the options hash a property directly on the new instance
// otherwise we'll modify the options hash on the prototype that we're
// inheriting from
basePrototype.options=$.widget.extend({},basePrototype.options);$.each(prototype,function(prop,value){if(!$.isFunction(value)){proxiedPrototype[prop]=value;return;}proxiedPrototype[prop]=function(){var _super=function _super(){return base.prototype[prop].apply(this,arguments);},_superApply=function _superApply(args){return base.prototype[prop].apply(this,args);};return function(){var __super=this._super,__superApply=this._superApply,returnValue;this._super=_super;this._superApply=_superApply;returnValue=value.apply(this,arguments);this._super=__super;this._superApply=__superApply;return returnValue;};}();});constructor.prototype=$.widget.extend(basePrototype,{// TODO: remove support for widgetEventPrefix
// always use the name + a colon as the prefix, e.g., draggable:start
// don't prefix for widgets that aren't DOM-based
widgetEventPrefix:existingConstructor?basePrototype.widgetEventPrefix||name:name},proxiedPrototype,{constructor:constructor,namespace:namespace,widgetName:name,widgetFullName:fullName});// If this widget is being redefined then we need to find all widgets that
// are inheriting from it and redefine all of them so that they inherit from
// the new version of this widget. We're essentially trying to replace one
// level in the prototype chain.
if(existingConstructor){$.each(existingConstructor._childConstructors,function(i,child){var childPrototype=child.prototype;// redefine the child widget using the same prototype that was
// originally used, but inherit from the new version of the base
$.widget(childPrototype.namespace+"."+childPrototype.widgetName,constructor,child._proto);});// remove the list of existing child constructors from the old constructor
// so the old child constructors can be garbage collected
delete existingConstructor._childConstructors;}else{base._childConstructors.push(constructor);}$.widget.bridge(name,constructor);return constructor;};$.widget.extend=function(target){var input=widget_slice.call(arguments,1),inputIndex=0,inputLength=input.length,key,value;for(;inputIndex<inputLength;inputIndex++){for(key in input[inputIndex]){value=input[inputIndex][key];if(input[inputIndex].hasOwnProperty(key)&&value!==undefined){// Clone objects
if($.isPlainObject(value)){target[key]=$.isPlainObject(target[key])?$.widget.extend({},target[key],value):// Don't extend strings, arrays, etc. with objects
$.widget.extend({},value);// Copy everything else by reference
}else{target[key]=value;}}}}return target;};$.widget.bridge=function(name,object){var fullName=object.prototype.widgetFullName||name;$.fn[name]=function(options){var isMethodCall=typeof options==="string",args=widget_slice.call(arguments,1),returnValue=this;if(isMethodCall){this.each(function(){var methodValue,instance=$.data(this,fullName);if(options==="instance"){returnValue=instance;return false;}if(!instance){return $.error("cannot call methods on "+name+" prior to initialization; "+"attempted to call method '"+options+"'");}if(!$.isFunction(instance[options])||options.charAt(0)==="_"){return $.error("no such method '"+options+"' for "+name+" widget instance");}methodValue=instance[options].apply(instance,args);if(methodValue!==instance&&methodValue!==undefined){returnValue=methodValue&&methodValue.jquery?returnValue.pushStack(methodValue.get()):methodValue;return false;}});}else{// Allow multiple hashes to be passed on init
if(args.length){options=$.widget.extend.apply(null,[options].concat(args));}this.each(function(){var instance=$.data(this,fullName);if(instance){instance.option(options||{});if(instance._init){instance._init();}}else{$.data(this,fullName,new object(options,this));}});}return returnValue;};};$.Widget=function()/* options, element */{};$.Widget._childConstructors=[];$.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",defaultElement:"<div>",options:{disabled:false,// callbacks
create:null},_createWidget:function _createWidget(options,element){element=$(element||this.defaultElement||this)[0];this.element=$(element);this.uuid=widget_uuid++;this.eventNamespace="."+this.widgetName+this.uuid;this.bindings=$();this.hoverable=$();this.focusable=$();if(element!==this){$.data(element,this.widgetFullName,this);this._on(true,this.element,{remove:function remove(event){if(event.target===element){this.destroy();}}});this.document=$(element.style?// element within the document
element.ownerDocument:// element is window or document
element.document||element);this.window=$(this.document[0].defaultView||this.document[0].parentWindow);}this.options=$.widget.extend({},this.options,this._getCreateOptions(),options);this._create();this._trigger("create",null,this._getCreateEventData());this._init();},_getCreateOptions:$.noop,_getCreateEventData:$.noop,_create:$.noop,_init:$.noop,destroy:function destroy(){this._destroy();// we can probably remove the unbind calls in 2.0
// all event bindings should go through this._on()
this.element.unbind(this.eventNamespace).removeData(this.widgetFullName)// support: jquery <1.6.3
// http://bugs.jquery.com/ticket/9413
.removeData($.camelCase(this.widgetFullName));this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName+"-disabled "+"ui-state-disabled");// clean up events and states
this.bindings.unbind(this.eventNamespace);this.hoverable.removeClass("ui-state-hover");this.focusable.removeClass("ui-state-focus");},_destroy:$.noop,widget:function widget(){return this.element;},option:function option(key,value){var options=key,parts,curOption,i;if(arguments.length===0){// don't return a reference to the internal hash
return $.widget.extend({},this.options);}if(typeof key==="string"){// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
options={};parts=key.split(".");key=parts.shift();if(parts.length){curOption=options[key]=$.widget.extend({},this.options[key]);for(i=0;i<parts.length-1;i++){curOption[parts[i]]=curOption[parts[i]]||{};curOption=curOption[parts[i]];}key=parts.pop();if(arguments.length===1){return curOption[key]===undefined?null:curOption[key];}curOption[key]=value;}else{if(arguments.length===1){return this.options[key]===undefined?null:this.options[key];}options[key]=value;}}this._setOptions(options);return this;},_setOptions:function _setOptions(options){var key;for(key in options){this._setOption(key,options[key]);}return this;},_setOption:function _setOption(key,value){this.options[key]=value;if(key==="disabled"){this.widget().toggleClass(this.widgetFullName+"-disabled",!!value);// If the widget is becoming disabled, then nothing is interactive
if(value){this.hoverable.removeClass("ui-state-hover");this.focusable.removeClass("ui-state-focus");}}return this;},enable:function enable(){return this._setOptions({disabled:false});},disable:function disable(){return this._setOptions({disabled:true});},_on:function _on(suppressDisabledCheck,element,handlers){var delegateElement,instance=this;// no suppressDisabledCheck flag, shuffle arguments
if(typeof suppressDisabledCheck!=="boolean"){handlers=element;element=suppressDisabledCheck;suppressDisabledCheck=false;}// no element argument, shuffle and use this.element
if(!handlers){handlers=element;element=this.element;delegateElement=this.widget();}else{element=delegateElement=$(element);this.bindings=this.bindings.add(element);}$.each(handlers,function(event,handler){function handlerProxy(){// allow widgets to customize the disabled handling
// - disabled as an array instead of boolean
// - disabled class as method for disabling individual parts
if(!suppressDisabledCheck&&(instance.options.disabled===true||$(this).hasClass("ui-state-disabled"))){return;}return(typeof handler==="string"?instance[handler]:handler).apply(instance,arguments);}// copy the guid so direct unbinding works
if(typeof handler!=="string"){handlerProxy.guid=handler.guid=handler.guid||handlerProxy.guid||$.guid++;}var match=event.match(/^([\w:-]*)\s*(.*)$/),eventName=match[1]+instance.eventNamespace,selector=match[2];if(selector){delegateElement.delegate(selector,eventName,handlerProxy);}else{element.bind(eventName,handlerProxy);}});},_off:function _off(element,eventName){eventName=(eventName||"").split(" ").join(this.eventNamespace+" ")+this.eventNamespace;element.unbind(eventName).undelegate(eventName);// Clear the stack to avoid memory leaks (#10056)
this.bindings=$(this.bindings.not(element).get());this.focusable=$(this.focusable.not(element).get());this.hoverable=$(this.hoverable.not(element).get());},_delay:function _delay(handler,delay){function handlerProxy(){return(typeof handler==="string"?instance[handler]:handler).apply(instance,arguments);}var instance=this;return setTimeout(handlerProxy,delay||0);},_hoverable:function _hoverable(element){this.hoverable=this.hoverable.add(element);this._on(element,{mouseenter:function mouseenter(event){$(event.currentTarget).addClass("ui-state-hover");},mouseleave:function mouseleave(event){$(event.currentTarget).removeClass("ui-state-hover");}});},_focusable:function _focusable(element){this.focusable=this.focusable.add(element);this._on(element,{focusin:function focusin(event){$(event.currentTarget).addClass("ui-state-focus");},focusout:function focusout(event){$(event.currentTarget).removeClass("ui-state-focus");}});},_trigger:function _trigger(type,event,data){var prop,orig,callback=this.options[type];data=data||{};event=$.Event(event);event.type=(type===this.widgetEventPrefix?type:this.widgetEventPrefix+type).toLowerCase();// the original event may come from any element
// so we need to reset the target on the new event
event.target=this.element[0];// copy original event properties over to the new event
orig=event.originalEvent;if(orig){for(prop in orig){if(!(prop in event)){event[prop]=orig[prop];}}}this.element.trigger(event,data);return!($.isFunction(callback)&&callback.apply(this.element[0],[event].concat(data))===false||event.isDefaultPrevented());}};$.each({show:"fadeIn",hide:"fadeOut"},function(method,defaultEffect){$.Widget.prototype["_"+method]=function(element,options,callback){if(typeof options==="string"){options={effect:options};}var hasOptions,effectName=!options?method:options===true||typeof options==="number"?defaultEffect:options.effect||defaultEffect;options=options||{};if(typeof options==="number"){options={duration:options};}hasOptions=!$.isEmptyObject(options);options.complete=callback;if(options.delay){element.delay(options.delay);}if(hasOptions&&$.effects&&$.effects.effect[effectName]){element[method](options);}else if(effectName!==method&&element[effectName]){element[effectName](options.duration,options.easing,callback);}else{element.queue(function(next){$(this)[method]();if(callback){callback.call(element[0]);}next();});}};});var widget=$.widget;/*!
 * jQuery UI Mouse 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/mouse/
 */var mouseHandled=false;$(document).mouseup(function(){mouseHandled=false;});var mouse=$.widget("ui.mouse",{version:"1.11.4",options:{cancel:"input,textarea,button,select,option",distance:1,delay:0},_mouseInit:function _mouseInit(){var that=this;this.element.bind("mousedown."+this.widgetName,function(event){return that._mouseDown(event);}).bind("click."+this.widgetName,function(event){if(true===$.data(event.target,that.widgetName+".preventClickEvent")){$.removeData(event.target,that.widgetName+".preventClickEvent");event.stopImmediatePropagation();return false;}});this.started=false;},// TODO: make sure destroying one instance of mouse doesn't mess with
// other instances of mouse
_mouseDestroy:function _mouseDestroy(){this.element.unbind("."+this.widgetName);if(this._mouseMoveDelegate){this.document.unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);}},_mouseDown:function _mouseDown(event){// don't let more than one widget handle mouseStart
if(mouseHandled){return;}this._mouseMoved=false;// we may have missed mouseup (out of window)
this._mouseStarted&&this._mouseUp(event);this._mouseDownEvent=event;var that=this,btnIsLeft=event.which===1,// event.target.nodeName works around a bug in IE 8 with
// disabled inputs (#7620)
elIsCancel=typeof this.options.cancel==="string"&&event.target.nodeName?$(event.target).closest(this.options.cancel).length:false;if(!btnIsLeft||elIsCancel||!this._mouseCapture(event)){return true;}this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet){this._mouseDelayTimer=setTimeout(function(){that.mouseDelayMet=true;},this.options.delay);}if(this._mouseDistanceMet(event)&&this._mouseDelayMet(event)){this._mouseStarted=this._mouseStart(event)!==false;if(!this._mouseStarted){event.preventDefault();return true;}}// Click event may never have fired (Gecko & Opera)
if(true===$.data(event.target,this.widgetName+".preventClickEvent")){$.removeData(event.target,this.widgetName+".preventClickEvent");}// these delegates are required to keep context
this._mouseMoveDelegate=function(event){return that._mouseMove(event);};this._mouseUpDelegate=function(event){return that._mouseUp(event);};this.document.bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);event.preventDefault();mouseHandled=true;return true;},_mouseMove:function _mouseMove(event){// Only check for mouseups outside the document if you've moved inside the document
// at least once. This prevents the firing of mouseup in the case of IE<9, which will
// fire a mousemove event if content is placed under the cursor. See #7778
// Support: IE <9
if(this._mouseMoved){// IE mouseup check - mouseup happened when mouse was out of window
if($.ui.ie&&(!document.documentMode||document.documentMode<9)&&!event.button){return this._mouseUp(event);// Iframe mouseup check - mouseup occurred in another document
}else if(!event.which){return this._mouseUp(event);}}if(event.which||event.button){this._mouseMoved=true;}if(this._mouseStarted){this._mouseDrag(event);return event.preventDefault();}if(this._mouseDistanceMet(event)&&this._mouseDelayMet(event)){this._mouseStarted=this._mouseStart(this._mouseDownEvent,event)!==false;this._mouseStarted?this._mouseDrag(event):this._mouseUp(event);}return!this._mouseStarted;},_mouseUp:function _mouseUp(event){this.document.unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted){this._mouseStarted=false;if(event.target===this._mouseDownEvent.target){$.data(event.target,this.widgetName+".preventClickEvent",true);}this._mouseStop(event);}mouseHandled=false;return false;},_mouseDistanceMet:function _mouseDistanceMet(event){return Math.max(Math.abs(this._mouseDownEvent.pageX-event.pageX),Math.abs(this._mouseDownEvent.pageY-event.pageY))>=this.options.distance;},_mouseDelayMet:function _mouseDelayMet()/* event */{return this.mouseDelayMet;},// These are placeholder methods, to be overriden by extending plugin
_mouseStart:function _mouseStart()/* event */{},_mouseDrag:function _mouseDrag()/* event */{},_mouseStop:function _mouseStop()/* event */{},_mouseCapture:function _mouseCapture()/* event */{return true;}});/*!
 * jQuery UI Position 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */(function(){$.ui=$.ui||{};var cachedScrollbarWidth,supportsOffsetFractions,max=Math.max,abs=Math.abs,round=Math.round,rhorizontal=/left|center|right/,rvertical=/top|center|bottom/,roffset=/[\+\-]\d+(\.[\d]+)?%?/,rposition=/^\w+/,rpercent=/%$/,_position=$.fn.position;function getOffsets(offsets,width,height){return[parseFloat(offsets[0])*(rpercent.test(offsets[0])?width/100:1),parseFloat(offsets[1])*(rpercent.test(offsets[1])?height/100:1)];}function parseCss(element,property){return parseInt($.css(element,property),10)||0;}function getDimensions(elem){var raw=elem[0];if(raw.nodeType===9){return{width:elem.width(),height:elem.height(),offset:{top:0,left:0}};}if($.isWindow(raw)){return{width:elem.width(),height:elem.height(),offset:{top:elem.scrollTop(),left:elem.scrollLeft()}};}if(raw.preventDefault){return{width:0,height:0,offset:{top:raw.pageY,left:raw.pageX}};}return{width:elem.outerWidth(),height:elem.outerHeight(),offset:elem.offset()};}$.position={scrollbarWidth:function scrollbarWidth(){if(cachedScrollbarWidth!==undefined){return cachedScrollbarWidth;}var w1,w2,div=$("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),innerDiv=div.children()[0];$("body").append(div);w1=innerDiv.offsetWidth;div.css("overflow","scroll");w2=innerDiv.offsetWidth;if(w1===w2){w2=div[0].clientWidth;}div.remove();return cachedScrollbarWidth=w1-w2;},getScrollInfo:function getScrollInfo(within){var overflowX=within.isWindow||within.isDocument?"":within.element.css("overflow-x"),overflowY=within.isWindow||within.isDocument?"":within.element.css("overflow-y"),hasOverflowX=overflowX==="scroll"||overflowX==="auto"&&within.width<within.element[0].scrollWidth,hasOverflowY=overflowY==="scroll"||overflowY==="auto"&&within.height<within.element[0].scrollHeight;return{width:hasOverflowY?$.position.scrollbarWidth():0,height:hasOverflowX?$.position.scrollbarWidth():0};},getWithinInfo:function getWithinInfo(element){var withinElement=$(element||window),isWindow=$.isWindow(withinElement[0]),isDocument=!!withinElement[0]&&withinElement[0].nodeType===9;return{element:withinElement,isWindow:isWindow,isDocument:isDocument,offset:withinElement.offset()||{left:0,top:0},scrollLeft:withinElement.scrollLeft(),scrollTop:withinElement.scrollTop(),// support: jQuery 1.6.x
// jQuery 1.6 doesn't support .outerWidth/Height() on documents or windows
width:isWindow||isDocument?withinElement.width():withinElement.outerWidth(),height:isWindow||isDocument?withinElement.height():withinElement.outerHeight()};}};$.fn.position=function(options){if(!options||!options.of){return _position.apply(this,arguments);}// make a copy, we don't want to modify arguments
options=$.extend({},options);var atOffset,targetWidth,targetHeight,targetOffset,basePosition,dimensions,target=$(options.of),within=$.position.getWithinInfo(options.within),scrollInfo=$.position.getScrollInfo(within),collision=(options.collision||"flip").split(" "),offsets={};dimensions=getDimensions(target);if(target[0].preventDefault){// force left top to allow flipping
options.at="left top";}targetWidth=dimensions.width;targetHeight=dimensions.height;targetOffset=dimensions.offset;// clone to reuse original targetOffset later
basePosition=$.extend({},targetOffset);// force my and at to have valid horizontal and vertical positions
// if a value is missing or invalid, it will be converted to center
$.each(["my","at"],function(){var pos=(options[this]||"").split(" "),horizontalOffset,verticalOffset;if(pos.length===1){pos=rhorizontal.test(pos[0])?pos.concat(["center"]):rvertical.test(pos[0])?["center"].concat(pos):["center","center"];}pos[0]=rhorizontal.test(pos[0])?pos[0]:"center";pos[1]=rvertical.test(pos[1])?pos[1]:"center";// calculate offsets
horizontalOffset=roffset.exec(pos[0]);verticalOffset=roffset.exec(pos[1]);offsets[this]=[horizontalOffset?horizontalOffset[0]:0,verticalOffset?verticalOffset[0]:0];// reduce to just the positions without the offsets
options[this]=[rposition.exec(pos[0])[0],rposition.exec(pos[1])[0]];});// normalize collision option
if(collision.length===1){collision[1]=collision[0];}if(options.at[0]==="right"){basePosition.left+=targetWidth;}else if(options.at[0]==="center"){basePosition.left+=targetWidth/2;}if(options.at[1]==="bottom"){basePosition.top+=targetHeight;}else if(options.at[1]==="center"){basePosition.top+=targetHeight/2;}atOffset=getOffsets(offsets.at,targetWidth,targetHeight);basePosition.left+=atOffset[0];basePosition.top+=atOffset[1];return this.each(function(){var collisionPosition,using,elem=$(this),elemWidth=elem.outerWidth(),elemHeight=elem.outerHeight(),marginLeft=parseCss(this,"marginLeft"),marginTop=parseCss(this,"marginTop"),collisionWidth=elemWidth+marginLeft+parseCss(this,"marginRight")+scrollInfo.width,collisionHeight=elemHeight+marginTop+parseCss(this,"marginBottom")+scrollInfo.height,position=$.extend({},basePosition),myOffset=getOffsets(offsets.my,elem.outerWidth(),elem.outerHeight());if(options.my[0]==="right"){position.left-=elemWidth;}else if(options.my[0]==="center"){position.left-=elemWidth/2;}if(options.my[1]==="bottom"){position.top-=elemHeight;}else if(options.my[1]==="center"){position.top-=elemHeight/2;}position.left+=myOffset[0];position.top+=myOffset[1];// if the browser doesn't support fractions, then round for consistent results
if(!supportsOffsetFractions){position.left=round(position.left);position.top=round(position.top);}collisionPosition={marginLeft:marginLeft,marginTop:marginTop};$.each(["left","top"],function(i,dir){if($.ui.position[collision[i]]){$.ui.position[collision[i]][dir](position,{targetWidth:targetWidth,targetHeight:targetHeight,elemWidth:elemWidth,elemHeight:elemHeight,collisionPosition:collisionPosition,collisionWidth:collisionWidth,collisionHeight:collisionHeight,offset:[atOffset[0]+myOffset[0],atOffset[1]+myOffset[1]],my:options.my,at:options.at,within:within,elem:elem});}});if(options.using){// adds feedback as second argument to using callback, if present
using=function using(props){var left=targetOffset.left-position.left,right=left+targetWidth-elemWidth,top=targetOffset.top-position.top,bottom=top+targetHeight-elemHeight,feedback={target:{element:target,left:targetOffset.left,top:targetOffset.top,width:targetWidth,height:targetHeight},element:{element:elem,left:position.left,top:position.top,width:elemWidth,height:elemHeight},horizontal:right<0?"left":left>0?"right":"center",vertical:bottom<0?"top":top>0?"bottom":"middle"};if(targetWidth<elemWidth&&abs(left+right)<targetWidth){feedback.horizontal="center";}if(targetHeight<elemHeight&&abs(top+bottom)<targetHeight){feedback.vertical="middle";}if(max(abs(left),abs(right))>max(abs(top),abs(bottom))){feedback.important="horizontal";}else{feedback.important="vertical";}options.using.call(this,props,feedback);};}elem.offset($.extend(position,{using:using}));});};$.ui.position={fit:{left:function left(position,data){var within=data.within,withinOffset=within.isWindow?within.scrollLeft:within.offset.left,outerWidth=within.width,collisionPosLeft=position.left-data.collisionPosition.marginLeft,overLeft=withinOffset-collisionPosLeft,overRight=collisionPosLeft+data.collisionWidth-outerWidth-withinOffset,newOverRight;// element is wider than within
if(data.collisionWidth>outerWidth){// element is initially over the left side of within
if(overLeft>0&&overRight<=0){newOverRight=position.left+overLeft+data.collisionWidth-outerWidth-withinOffset;position.left+=overLeft-newOverRight;// element is initially over right side of within
}else if(overRight>0&&overLeft<=0){position.left=withinOffset;// element is initially over both left and right sides of within
}else{if(overLeft>overRight){position.left=withinOffset+outerWidth-data.collisionWidth;}else{position.left=withinOffset;}}// too far left -> align with left edge
}else if(overLeft>0){position.left+=overLeft;// too far right -> align with right edge
}else if(overRight>0){position.left-=overRight;// adjust based on position and margin
}else{position.left=max(position.left-collisionPosLeft,position.left);}},top:function top(position,data){var within=data.within,withinOffset=within.isWindow?within.scrollTop:within.offset.top,outerHeight=data.within.height,collisionPosTop=position.top-data.collisionPosition.marginTop,overTop=withinOffset-collisionPosTop,overBottom=collisionPosTop+data.collisionHeight-outerHeight-withinOffset,newOverBottom;// element is taller than within
if(data.collisionHeight>outerHeight){// element is initially over the top of within
if(overTop>0&&overBottom<=0){newOverBottom=position.top+overTop+data.collisionHeight-outerHeight-withinOffset;position.top+=overTop-newOverBottom;// element is initially over bottom of within
}else if(overBottom>0&&overTop<=0){position.top=withinOffset;// element is initially over both top and bottom of within
}else{if(overTop>overBottom){position.top=withinOffset+outerHeight-data.collisionHeight;}else{position.top=withinOffset;}}// too far up -> align with top
}else if(overTop>0){position.top+=overTop;// too far down -> align with bottom edge
}else if(overBottom>0){position.top-=overBottom;// adjust based on position and margin
}else{position.top=max(position.top-collisionPosTop,position.top);}}},flip:{left:function left(position,data){var within=data.within,withinOffset=within.offset.left+within.scrollLeft,outerWidth=within.width,offsetLeft=within.isWindow?within.scrollLeft:within.offset.left,collisionPosLeft=position.left-data.collisionPosition.marginLeft,overLeft=collisionPosLeft-offsetLeft,overRight=collisionPosLeft+data.collisionWidth-outerWidth-offsetLeft,myOffset=data.my[0]==="left"?-data.elemWidth:data.my[0]==="right"?data.elemWidth:0,atOffset=data.at[0]==="left"?data.targetWidth:data.at[0]==="right"?-data.targetWidth:0,offset=-2*data.offset[0],newOverRight,newOverLeft;if(overLeft<0){newOverRight=position.left+myOffset+atOffset+offset+data.collisionWidth-outerWidth-withinOffset;if(newOverRight<0||newOverRight<abs(overLeft)){position.left+=myOffset+atOffset+offset;}}else if(overRight>0){newOverLeft=position.left-data.collisionPosition.marginLeft+myOffset+atOffset+offset-offsetLeft;if(newOverLeft>0||abs(newOverLeft)<overRight){position.left+=myOffset+atOffset+offset;}}},top:function top(position,data){var within=data.within,withinOffset=within.offset.top+within.scrollTop,outerHeight=within.height,offsetTop=within.isWindow?within.scrollTop:within.offset.top,collisionPosTop=position.top-data.collisionPosition.marginTop,overTop=collisionPosTop-offsetTop,overBottom=collisionPosTop+data.collisionHeight-outerHeight-offsetTop,top=data.my[1]==="top",myOffset=top?-data.elemHeight:data.my[1]==="bottom"?data.elemHeight:0,atOffset=data.at[1]==="top"?data.targetHeight:data.at[1]==="bottom"?-data.targetHeight:0,offset=-2*data.offset[1],newOverTop,newOverBottom;if(overTop<0){newOverBottom=position.top+myOffset+atOffset+offset+data.collisionHeight-outerHeight-withinOffset;if(newOverBottom<0||newOverBottom<abs(overTop)){position.top+=myOffset+atOffset+offset;}}else if(overBottom>0){newOverTop=position.top-data.collisionPosition.marginTop+myOffset+atOffset+offset-offsetTop;if(newOverTop>0||abs(newOverTop)<overBottom){position.top+=myOffset+atOffset+offset;}}}},flipfit:{left:function left(){$.ui.position.flip.left.apply(this,arguments);$.ui.position.fit.left.apply(this,arguments);},top:function top(){$.ui.position.flip.top.apply(this,arguments);$.ui.position.fit.top.apply(this,arguments);}}};// fraction support test
(function(){var testElement,testElementParent,testElementStyle,offsetLeft,i,body=document.getElementsByTagName("body")[0],div=document.createElement("div");//Create a "fake body" for testing based on method used in jQuery.support
testElement=document.createElement(body?"div":"body");testElementStyle={visibility:"hidden",width:0,height:0,border:0,margin:0,background:"none"};if(body){$.extend(testElementStyle,{position:"absolute",left:"-1000px",top:"-1000px"});}for(i in testElementStyle){testElement.style[i]=testElementStyle[i];}testElement.appendChild(div);testElementParent=body||document.documentElement;testElementParent.insertBefore(testElement,testElementParent.firstChild);div.style.cssText="position: absolute; left: 10.7432222px;";offsetLeft=$(div).offset().left;supportsOffsetFractions=offsetLeft>10&&offsetLeft<11;testElement.innerHTML="";testElementParent.removeChild(testElement);})();})();var position=$.ui.position;/*!
 * jQuery UI Draggable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/draggable/
 */$.widget("ui.draggable",$.ui.mouse,{version:"1.11.4",widgetEventPrefix:"drag",options:{addClasses:true,appendTo:"parent",axis:false,connectToSortable:false,containment:false,cursor:"auto",cursorAt:false,grid:false,handle:false,helper:"original",iframeFix:false,opacity:false,refreshPositions:false,revert:false,revertDuration:500,scope:"default",scroll:true,scrollSensitivity:20,scrollSpeed:20,snap:false,snapMode:"both",snapTolerance:20,stack:false,zIndex:false,// callbacks
drag:null,start:null,stop:null},_create:function _create(){if(this.options.helper==="original"){this._setPositionRelative();}if(this.options.addClasses){this.element.addClass("ui-draggable");}if(this.options.disabled){this.element.addClass("ui-draggable-disabled");}this._setHandleClassName();this._mouseInit();},_setOption:function _setOption(key,value){this._super(key,value);if(key==="handle"){this._removeHandleClassName();this._setHandleClassName();}},_destroy:function _destroy(){if((this.helper||this.element).is(".ui-draggable-dragging")){this.destroyOnClear=true;return;}this.element.removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled");this._removeHandleClassName();this._mouseDestroy();},_mouseCapture:function _mouseCapture(event){var o=this.options;this._blurActiveElement(event);// among others, prevent a drag on a resizable-handle
if(this.helper||o.disabled||$(event.target).closest(".ui-resizable-handle").length>0){return false;}//Quit if we're not on a valid handle
this.handle=this._getHandle(event);if(!this.handle){return false;}this._blockFrames(o.iframeFix===true?"iframe":o.iframeFix);return true;},_blockFrames:function _blockFrames(selector){this.iframeBlocks=this.document.find(selector).map(function(){var iframe=$(this);return $("<div>").css("position","absolute").appendTo(iframe.parent()).outerWidth(iframe.outerWidth()).outerHeight(iframe.outerHeight()).offset(iframe.offset())[0];});},_unblockFrames:function _unblockFrames(){if(this.iframeBlocks){this.iframeBlocks.remove();delete this.iframeBlocks;}},_blurActiveElement:function _blurActiveElement(event){var document=this.document[0];// Only need to blur if the event occurred on the draggable itself, see #10527
if(!this.handleElement.is(event.target)){return;}// support: IE9
// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
try{// Support: IE9, IE10
// If the <body> is blurred, IE will switch windows, see #9520
if(document.activeElement&&document.activeElement.nodeName.toLowerCase()!=="body"){// Blur any element that currently has focus, see #4261
$(document.activeElement).blur();}}catch(error){}},_mouseStart:function _mouseStart(event){var o=this.options;//Create and append the visible helper
this.helper=this._createHelper(event);this.helper.addClass("ui-draggable-dragging");//Cache the helper size
this._cacheHelperProportions();//If ddmanager is used for droppables, set the global draggable
if($.ui.ddmanager){$.ui.ddmanager.current=this;}/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 *///Cache the margins of the original element
this._cacheMargins();//Store the helper's css position
this.cssPosition=this.helper.css("position");this.scrollParent=this.helper.scrollParent(true);this.offsetParent=this.helper.offsetParent();this.hasFixedAncestor=this.helper.parents().filter(function(){return $(this).css("position")==="fixed";}).length>0;//The element's absolute position on the page minus margins
this.positionAbs=this.element.offset();this._refreshOffsets(event);//Generate the original position
this.originalPosition=this.position=this._generatePosition(event,false);this.originalPageX=event.pageX;this.originalPageY=event.pageY;//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
o.cursorAt&&this._adjustOffsetFromHelper(o.cursorAt);//Set a containment if given in the options
this._setContainment();//Trigger event + callbacks
if(this._trigger("start",event)===false){this._clear();return false;}//Recache the helper size
this._cacheHelperProportions();//Prepare the droppable offsets
if($.ui.ddmanager&&!o.dropBehaviour){$.ui.ddmanager.prepareOffsets(this,event);}// Reset helper's right/bottom css if they're set and set explicit width/height instead
// as this prevents resizing of elements with right/bottom set (see #7772)
this._normalizeRightBottom();this._mouseDrag(event,true);//Execute the drag once - this causes the helper not to be visible before getting its correct position
//If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
if($.ui.ddmanager){$.ui.ddmanager.dragStart(this,event);}return true;},_refreshOffsets:function _refreshOffsets(event){this.offset={top:this.positionAbs.top-this.margins.top,left:this.positionAbs.left-this.margins.left,scroll:false,parent:this._getParentOffset(),relative:this._getRelativeOffset()};this.offset.click={left:event.pageX-this.offset.left,top:event.pageY-this.offset.top};},_mouseDrag:function _mouseDrag(event,noPropagation){// reset any necessary cached properties (see #5009)
if(this.hasFixedAncestor){this.offset.parent=this._getParentOffset();}//Compute the helpers position
this.position=this._generatePosition(event,true);this.positionAbs=this._convertPositionTo("absolute");//Call plugins and callbacks and use the resulting position if something is returned
if(!noPropagation){var ui=this._uiHash();if(this._trigger("drag",event,ui)===false){this._mouseUp({});return false;}this.position=ui.position;}this.helper[0].style.left=this.position.left+"px";this.helper[0].style.top=this.position.top+"px";if($.ui.ddmanager){$.ui.ddmanager.drag(this,event);}return false;},_mouseStop:function _mouseStop(event){//If we are using droppables, inform the manager about the drop
var that=this,dropped=false;if($.ui.ddmanager&&!this.options.dropBehaviour){dropped=$.ui.ddmanager.drop(this,event);}//if a drop comes from outside (a sortable)
if(this.dropped){dropped=this.dropped;this.dropped=false;}if(this.options.revert==="invalid"&&!dropped||this.options.revert==="valid"&&dropped||this.options.revert===true||$.isFunction(this.options.revert)&&this.options.revert.call(this.element,dropped)){$(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){if(that._trigger("stop",event)!==false){that._clear();}});}else{if(this._trigger("stop",event)!==false){this._clear();}}return false;},_mouseUp:function _mouseUp(event){this._unblockFrames();//If the ddmanager is used for droppables, inform the manager that dragging has stopped (see #5003)
if($.ui.ddmanager){$.ui.ddmanager.dragStop(this,event);}// Only need to focus if the event occurred on the draggable itself, see #10527
if(this.handleElement.is(event.target)){// The interaction is over; whether or not the click resulted in a drag, focus the element
this.element.focus();}return $.ui.mouse.prototype._mouseUp.call(this,event);},cancel:function cancel(){if(this.helper.is(".ui-draggable-dragging")){this._mouseUp({});}else{this._clear();}return this;},_getHandle:function _getHandle(event){return this.options.handle?!!$(event.target).closest(this.element.find(this.options.handle)).length:true;},_setHandleClassName:function _setHandleClassName(){this.handleElement=this.options.handle?this.element.find(this.options.handle):this.element;this.handleElement.addClass("ui-draggable-handle");},_removeHandleClassName:function _removeHandleClassName(){this.handleElement.removeClass("ui-draggable-handle");},_createHelper:function _createHelper(event){var o=this.options,helperIsFunction=$.isFunction(o.helper),helper=helperIsFunction?$(o.helper.apply(this.element[0],[event])):o.helper==="clone"?this.element.clone().removeAttr("id"):this.element;if(!helper.parents("body").length){helper.appendTo(o.appendTo==="parent"?this.element[0].parentNode:o.appendTo);}// http://bugs.jqueryui.com/ticket/9446
// a helper function can return the original element
// which wouldn't have been set to relative in _create
if(helperIsFunction&&helper[0]===this.element[0]){this._setPositionRelative();}if(helper[0]!==this.element[0]&&!/(fixed|absolute)/.test(helper.css("position"))){helper.css("position","absolute");}return helper;},_setPositionRelative:function _setPositionRelative(){if(!/^(?:r|a|f)/.test(this.element.css("position"))){this.element[0].style.position="relative";}},_adjustOffsetFromHelper:function _adjustOffsetFromHelper(obj){if(typeof obj==="string"){obj=obj.split(" ");}if($.isArray(obj)){obj={left:+obj[0],top:+obj[1]||0};}if("left"in obj){this.offset.click.left=obj.left+this.margins.left;}if("right"in obj){this.offset.click.left=this.helperProportions.width-obj.right+this.margins.left;}if("top"in obj){this.offset.click.top=obj.top+this.margins.top;}if("bottom"in obj){this.offset.click.top=this.helperProportions.height-obj.bottom+this.margins.top;}},_isRootNode:function _isRootNode(element){return /(html|body)/i.test(element.tagName)||element===this.document[0];},_getParentOffset:function _getParentOffset(){//Get the offsetParent and cache its position
var po=this.offsetParent.offset(),document=this.document[0];// This is a special case where we need to modify a offset calculated on start, since the following happened:
// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
if(this.cssPosition==="absolute"&&this.scrollParent[0]!==document&&$.contains(this.scrollParent[0],this.offsetParent[0])){po.left+=this.scrollParent.scrollLeft();po.top+=this.scrollParent.scrollTop();}if(this._isRootNode(this.offsetParent[0])){po={top:0,left:0};}return{top:po.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:po.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)};},_getRelativeOffset:function _getRelativeOffset(){if(this.cssPosition!=="relative"){return{top:0,left:0};}var p=this.element.position(),scrollIsRootNode=this._isRootNode(this.scrollParent[0]);return{top:p.top-(parseInt(this.helper.css("top"),10)||0)+(!scrollIsRootNode?this.scrollParent.scrollTop():0),left:p.left-(parseInt(this.helper.css("left"),10)||0)+(!scrollIsRootNode?this.scrollParent.scrollLeft():0)};},_cacheMargins:function _cacheMargins(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0};},_cacheHelperProportions:function _cacheHelperProportions(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()};},_setContainment:function _setContainment(){var isUserScrollable,c,ce,o=this.options,document=this.document[0];this.relativeContainer=null;if(!o.containment){this.containment=null;return;}if(o.containment==="window"){this.containment=[$(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,$(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,$(window).scrollLeft()+$(window).width()-this.helperProportions.width-this.margins.left,$(window).scrollTop()+($(window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];return;}if(o.containment==="document"){this.containment=[0,0,$(document).width()-this.helperProportions.width-this.margins.left,($(document).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];return;}if(o.containment.constructor===Array){this.containment=o.containment;return;}if(o.containment==="parent"){o.containment=this.helper[0].parentNode;}c=$(o.containment);ce=c[0];if(!ce){return;}isUserScrollable=/(scroll|auto)/.test(c.css("overflow"));this.containment=[(parseInt(c.css("borderLeftWidth"),10)||0)+(parseInt(c.css("paddingLeft"),10)||0),(parseInt(c.css("borderTopWidth"),10)||0)+(parseInt(c.css("paddingTop"),10)||0),(isUserScrollable?Math.max(ce.scrollWidth,ce.offsetWidth):ce.offsetWidth)-(parseInt(c.css("borderRightWidth"),10)||0)-(parseInt(c.css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(isUserScrollable?Math.max(ce.scrollHeight,ce.offsetHeight):ce.offsetHeight)-(parseInt(c.css("borderBottomWidth"),10)||0)-(parseInt(c.css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom];this.relativeContainer=c;},_convertPositionTo:function _convertPositionTo(d,pos){if(!pos){pos=this.position;}var mod=d==="absolute"?1:-1,scrollIsRootNode=this._isRootNode(this.scrollParent[0]);return{top:pos.top+// The absolute mouse position
this.offset.relative.top*mod+// Only for relative positioned nodes: Relative offset from element to offset parent
this.offset.parent.top*mod-// The offsetParent's offset without borders (offset + border)
(this.cssPosition==="fixed"?-this.offset.scroll.top:scrollIsRootNode?0:this.offset.scroll.top)*mod,left:pos.left+// The absolute mouse position
this.offset.relative.left*mod+// Only for relative positioned nodes: Relative offset from element to offset parent
this.offset.parent.left*mod-// The offsetParent's offset without borders (offset + border)
(this.cssPosition==="fixed"?-this.offset.scroll.left:scrollIsRootNode?0:this.offset.scroll.left)*mod};},_generatePosition:function _generatePosition(event,constrainPosition){var containment,co,top,left,o=this.options,scrollIsRootNode=this._isRootNode(this.scrollParent[0]),pageX=event.pageX,pageY=event.pageY;// Cache the scroll
if(!scrollIsRootNode||!this.offset.scroll){this.offset.scroll={top:this.scrollParent.scrollTop(),left:this.scrollParent.scrollLeft()};}/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */// If we are not dragging yet, we won't check for options
if(constrainPosition){if(this.containment){if(this.relativeContainer){co=this.relativeContainer.offset();containment=[this.containment[0]+co.left,this.containment[1]+co.top,this.containment[2]+co.left,this.containment[3]+co.top];}else{containment=this.containment;}if(event.pageX-this.offset.click.left<containment[0]){pageX=containment[0]+this.offset.click.left;}if(event.pageY-this.offset.click.top<containment[1]){pageY=containment[1]+this.offset.click.top;}if(event.pageX-this.offset.click.left>containment[2]){pageX=containment[2]+this.offset.click.left;}if(event.pageY-this.offset.click.top>containment[3]){pageY=containment[3]+this.offset.click.top;}}if(o.grid){//Check for grid elements set to 0 to prevent divide by 0 error causing invalid argument errors in IE (see ticket #6950)
top=o.grid[1]?this.originalPageY+Math.round((pageY-this.originalPageY)/o.grid[1])*o.grid[1]:this.originalPageY;pageY=containment?top-this.offset.click.top>=containment[1]||top-this.offset.click.top>containment[3]?top:top-this.offset.click.top>=containment[1]?top-o.grid[1]:top+o.grid[1]:top;left=o.grid[0]?this.originalPageX+Math.round((pageX-this.originalPageX)/o.grid[0])*o.grid[0]:this.originalPageX;pageX=containment?left-this.offset.click.left>=containment[0]||left-this.offset.click.left>containment[2]?left:left-this.offset.click.left>=containment[0]?left-o.grid[0]:left+o.grid[0]:left;}if(o.axis==="y"){pageX=this.originalPageX;}if(o.axis==="x"){pageY=this.originalPageY;}}return{top:pageY-// The absolute mouse position
this.offset.click.top-// Click offset (relative to the element)
this.offset.relative.top-// Only for relative positioned nodes: Relative offset from element to offset parent
this.offset.parent.top+(// The offsetParent's offset without borders (offset + border)
this.cssPosition==="fixed"?-this.offset.scroll.top:scrollIsRootNode?0:this.offset.scroll.top),left:pageX-// The absolute mouse position
this.offset.click.left-// Click offset (relative to the element)
this.offset.relative.left-// Only for relative positioned nodes: Relative offset from element to offset parent
this.offset.parent.left+(// The offsetParent's offset without borders (offset + border)
this.cssPosition==="fixed"?-this.offset.scroll.left:scrollIsRootNode?0:this.offset.scroll.left)};},_clear:function _clear(){this.helper.removeClass("ui-draggable-dragging");if(this.helper[0]!==this.element[0]&&!this.cancelHelperRemoval){this.helper.remove();}this.helper=null;this.cancelHelperRemoval=false;if(this.destroyOnClear){this.destroy();}},_normalizeRightBottom:function _normalizeRightBottom(){if(this.options.axis!=="y"&&this.helper.css("right")!=="auto"){this.helper.width(this.helper.width());this.helper.css("right","auto");}if(this.options.axis!=="x"&&this.helper.css("bottom")!=="auto"){this.helper.height(this.helper.height());this.helper.css("bottom","auto");}},// From now on bulk stuff - mainly helpers
_trigger:function _trigger(type,event,ui){ui=ui||this._uiHash();$.ui.plugin.call(this,type,[event,ui,this],true);// Absolute position and offset (see #6884 ) have to be recalculated after plugins
if(/^(drag|start|stop)/.test(type)){this.positionAbs=this._convertPositionTo("absolute");ui.offset=this.positionAbs;}return $.Widget.prototype._trigger.call(this,type,event,ui);},plugins:{},_uiHash:function _uiHash(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs};}});$.ui.plugin.add("draggable","connectToSortable",{start:function start(event,ui,draggable){var uiSortable=$.extend({},ui,{item:draggable.element});draggable.sortables=[];$(draggable.options.connectToSortable).each(function(){var sortable=$(this).sortable("instance");if(sortable&&!sortable.options.disabled){draggable.sortables.push(sortable);// refreshPositions is called at drag start to refresh the containerCache
// which is used in drag. This ensures it's initialized and synchronized
// with any changes that might have happened on the page since initialization.
sortable.refreshPositions();sortable._trigger("activate",event,uiSortable);}});},stop:function stop(event,ui,draggable){var uiSortable=$.extend({},ui,{item:draggable.element});draggable.cancelHelperRemoval=false;$.each(draggable.sortables,function(){var sortable=this;if(sortable.isOver){sortable.isOver=0;// Allow this sortable to handle removing the helper
draggable.cancelHelperRemoval=true;sortable.cancelHelperRemoval=false;// Use _storedCSS To restore properties in the sortable,
// as this also handles revert (#9675) since the draggable
// may have modified them in unexpected ways (#8809)
sortable._storedCSS={position:sortable.placeholder.css("position"),top:sortable.placeholder.css("top"),left:sortable.placeholder.css("left")};sortable._mouseStop(event);// Once drag has ended, the sortable should return to using
// its original helper, not the shared helper from draggable
sortable.options.helper=sortable.options._helper;}else{// Prevent this Sortable from removing the helper.
// However, don't set the draggable to remove the helper
// either as another connected Sortable may yet handle the removal.
sortable.cancelHelperRemoval=true;sortable._trigger("deactivate",event,uiSortable);}});},drag:function drag(event,ui,draggable){$.each(draggable.sortables,function(){var innermostIntersecting=false,sortable=this;// Copy over variables that sortable's _intersectsWith uses
sortable.positionAbs=draggable.positionAbs;sortable.helperProportions=draggable.helperProportions;sortable.offset.click=draggable.offset.click;if(sortable._intersectsWith(sortable.containerCache)){innermostIntersecting=true;$.each(draggable.sortables,function(){// Copy over variables that sortable's _intersectsWith uses
this.positionAbs=draggable.positionAbs;this.helperProportions=draggable.helperProportions;this.offset.click=draggable.offset.click;if(this!==sortable&&this._intersectsWith(this.containerCache)&&$.contains(sortable.element[0],this.element[0])){innermostIntersecting=false;}return innermostIntersecting;});}if(innermostIntersecting){// If it intersects, we use a little isOver variable and set it once,
// so that the move-in stuff gets fired only once.
if(!sortable.isOver){sortable.isOver=1;// Store draggable's parent in case we need to reappend to it later.
draggable._parent=ui.helper.parent();sortable.currentItem=ui.helper.appendTo(sortable.element).data("ui-sortable-item",true);// Store helper option to later restore it
sortable.options._helper=sortable.options.helper;sortable.options.helper=function(){return ui.helper[0];};// Fire the start events of the sortable with our passed browser event,
// and our own helper (so it doesn't create a new one)
event.target=sortable.currentItem[0];sortable._mouseCapture(event,true);sortable._mouseStart(event,true,true);// Because the browser event is way off the new appended portlet,
// modify necessary variables to reflect the changes
sortable.offset.click.top=draggable.offset.click.top;sortable.offset.click.left=draggable.offset.click.left;sortable.offset.parent.left-=draggable.offset.parent.left-sortable.offset.parent.left;sortable.offset.parent.top-=draggable.offset.parent.top-sortable.offset.parent.top;draggable._trigger("toSortable",event);// Inform draggable that the helper is in a valid drop zone,
// used solely in the revert option to handle "valid/invalid".
draggable.dropped=sortable.element;// Need to refreshPositions of all sortables in the case that
// adding to one sortable changes the location of the other sortables (#9675)
$.each(draggable.sortables,function(){this.refreshPositions();});// hack so receive/update callbacks work (mostly)
draggable.currentItem=draggable.element;sortable.fromOutside=draggable;}if(sortable.currentItem){sortable._mouseDrag(event);// Copy the sortable's position because the draggable's can potentially reflect
// a relative position, while sortable is always absolute, which the dragged
// element has now become. (#8809)
ui.position=sortable.position;}}else{// If it doesn't intersect with the sortable, and it intersected before,
// we fake the drag stop of the sortable, but make sure it doesn't remove
// the helper by using cancelHelperRemoval.
if(sortable.isOver){sortable.isOver=0;sortable.cancelHelperRemoval=true;// Calling sortable's mouseStop would trigger a revert,
// so revert must be temporarily false until after mouseStop is called.
sortable.options._revert=sortable.options.revert;sortable.options.revert=false;sortable._trigger("out",event,sortable._uiHash(sortable));sortable._mouseStop(event,true);// restore sortable behaviors that were modfied
// when the draggable entered the sortable area (#9481)
sortable.options.revert=sortable.options._revert;sortable.options.helper=sortable.options._helper;if(sortable.placeholder){sortable.placeholder.remove();}// Restore and recalculate the draggable's offset considering the sortable
// may have modified them in unexpected ways. (#8809, #10669)
ui.helper.appendTo(draggable._parent);draggable._refreshOffsets(event);ui.position=draggable._generatePosition(event,true);draggable._trigger("fromSortable",event);// Inform draggable that the helper is no longer in a valid drop zone
draggable.dropped=false;// Need to refreshPositions of all sortables just in case removing
// from one sortable changes the location of other sortables (#9675)
$.each(draggable.sortables,function(){this.refreshPositions();});}}});}});$.ui.plugin.add("draggable","cursor",{start:function start(event,ui,instance){var t=$("body"),o=instance.options;if(t.css("cursor")){o._cursor=t.css("cursor");}t.css("cursor",o.cursor);},stop:function stop(event,ui,instance){var o=instance.options;if(o._cursor){$("body").css("cursor",o._cursor);}}});$.ui.plugin.add("draggable","opacity",{start:function start(event,ui,instance){var t=$(ui.helper),o=instance.options;if(t.css("opacity")){o._opacity=t.css("opacity");}t.css("opacity",o.opacity);},stop:function stop(event,ui,instance){var o=instance.options;if(o._opacity){$(ui.helper).css("opacity",o._opacity);}}});$.ui.plugin.add("draggable","scroll",{start:function start(event,ui,i){if(!i.scrollParentNotHidden){i.scrollParentNotHidden=i.helper.scrollParent(false);}if(i.scrollParentNotHidden[0]!==i.document[0]&&i.scrollParentNotHidden[0].tagName!=="HTML"){i.overflowOffset=i.scrollParentNotHidden.offset();}},drag:function drag(event,ui,i){var o=i.options,scrolled=false,scrollParent=i.scrollParentNotHidden[0],document=i.document[0];if(scrollParent!==document&&scrollParent.tagName!=="HTML"){if(!o.axis||o.axis!=="x"){if(i.overflowOffset.top+scrollParent.offsetHeight-event.pageY<o.scrollSensitivity){scrollParent.scrollTop=scrolled=scrollParent.scrollTop+o.scrollSpeed;}else if(event.pageY-i.overflowOffset.top<o.scrollSensitivity){scrollParent.scrollTop=scrolled=scrollParent.scrollTop-o.scrollSpeed;}}if(!o.axis||o.axis!=="y"){if(i.overflowOffset.left+scrollParent.offsetWidth-event.pageX<o.scrollSensitivity){scrollParent.scrollLeft=scrolled=scrollParent.scrollLeft+o.scrollSpeed;}else if(event.pageX-i.overflowOffset.left<o.scrollSensitivity){scrollParent.scrollLeft=scrolled=scrollParent.scrollLeft-o.scrollSpeed;}}}else{if(!o.axis||o.axis!=="x"){if(event.pageY-$(document).scrollTop()<o.scrollSensitivity){scrolled=$(document).scrollTop($(document).scrollTop()-o.scrollSpeed);}else if($(window).height()-(event.pageY-$(document).scrollTop())<o.scrollSensitivity){scrolled=$(document).scrollTop($(document).scrollTop()+o.scrollSpeed);}}if(!o.axis||o.axis!=="y"){if(event.pageX-$(document).scrollLeft()<o.scrollSensitivity){scrolled=$(document).scrollLeft($(document).scrollLeft()-o.scrollSpeed);}else if($(window).width()-(event.pageX-$(document).scrollLeft())<o.scrollSensitivity){scrolled=$(document).scrollLeft($(document).scrollLeft()+o.scrollSpeed);}}}if(scrolled!==false&&$.ui.ddmanager&&!o.dropBehaviour){$.ui.ddmanager.prepareOffsets(i,event);}}});$.ui.plugin.add("draggable","snap",{start:function start(event,ui,i){var o=i.options;i.snapElements=[];$(o.snap.constructor!==String?o.snap.items||":data(ui-draggable)":o.snap).each(function(){var $t=$(this),$o=$t.offset();if(this!==i.element[0]){i.snapElements.push({item:this,width:$t.outerWidth(),height:$t.outerHeight(),top:$o.top,left:$o.left});}});},drag:function drag(event,ui,inst){var ts,bs,ls,rs,l,r,t,b,i,first,o=inst.options,d=o.snapTolerance,x1=ui.offset.left,x2=x1+inst.helperProportions.width,y1=ui.offset.top,y2=y1+inst.helperProportions.height;for(i=inst.snapElements.length-1;i>=0;i--){l=inst.snapElements[i].left-inst.margins.left;r=l+inst.snapElements[i].width;t=inst.snapElements[i].top-inst.margins.top;b=t+inst.snapElements[i].height;if(x2<l-d||x1>r+d||y2<t-d||y1>b+d||!$.contains(inst.snapElements[i].item.ownerDocument,inst.snapElements[i].item)){if(inst.snapElements[i].snapping){inst.options.snap.release&&inst.options.snap.release.call(inst.element,event,$.extend(inst._uiHash(),{snapItem:inst.snapElements[i].item}));}inst.snapElements[i].snapping=false;continue;}if(o.snapMode!=="inner"){ts=Math.abs(t-y2)<=d;bs=Math.abs(b-y1)<=d;ls=Math.abs(l-x2)<=d;rs=Math.abs(r-x1)<=d;if(ts){ui.position.top=inst._convertPositionTo("relative",{top:t-inst.helperProportions.height,left:0}).top;}if(bs){ui.position.top=inst._convertPositionTo("relative",{top:b,left:0}).top;}if(ls){ui.position.left=inst._convertPositionTo("relative",{top:0,left:l-inst.helperProportions.width}).left;}if(rs){ui.position.left=inst._convertPositionTo("relative",{top:0,left:r}).left;}}first=ts||bs||ls||rs;if(o.snapMode!=="outer"){ts=Math.abs(t-y1)<=d;bs=Math.abs(b-y2)<=d;ls=Math.abs(l-x1)<=d;rs=Math.abs(r-x2)<=d;if(ts){ui.position.top=inst._convertPositionTo("relative",{top:t,left:0}).top;}if(bs){ui.position.top=inst._convertPositionTo("relative",{top:b-inst.helperProportions.height,left:0}).top;}if(ls){ui.position.left=inst._convertPositionTo("relative",{top:0,left:l}).left;}if(rs){ui.position.left=inst._convertPositionTo("relative",{top:0,left:r-inst.helperProportions.width}).left;}}if(!inst.snapElements[i].snapping&&(ts||bs||ls||rs||first)){inst.options.snap.snap&&inst.options.snap.snap.call(inst.element,event,$.extend(inst._uiHash(),{snapItem:inst.snapElements[i].item}));}inst.snapElements[i].snapping=ts||bs||ls||rs||first;}}});$.ui.plugin.add("draggable","stack",{start:function start(event,ui,instance){var min,o=instance.options,group=$.makeArray($(o.stack)).sort(function(a,b){return(parseInt($(a).css("zIndex"),10)||0)-(parseInt($(b).css("zIndex"),10)||0);});if(!group.length){return;}min=parseInt($(group[0]).css("zIndex"),10)||0;$(group).each(function(i){$(this).css("zIndex",min+i);});this.css("zIndex",min+group.length);}});$.ui.plugin.add("draggable","zIndex",{start:function start(event,ui,instance){var t=$(ui.helper),o=instance.options;if(t.css("zIndex")){o._zIndex=t.css("zIndex");}t.css("zIndex",o.zIndex);},stop:function stop(event,ui,instance){var o=instance.options;if(o._zIndex){$(ui.helper).css("zIndex",o._zIndex);}}});var draggable=$.ui.draggable;/*!
 * jQuery UI Droppable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/droppable/
 */$.widget("ui.droppable",{version:"1.11.4",widgetEventPrefix:"drop",options:{accept:"*",activeClass:false,addClasses:true,greedy:false,hoverClass:false,scope:"default",tolerance:"intersect",// callbacks
activate:null,deactivate:null,drop:null,out:null,over:null},_create:function _create(){var proportions,o=this.options,accept=o.accept;this.isover=false;this.isout=true;this.accept=$.isFunction(accept)?accept:function(d){return d.is(accept);};this.proportions=function()/* valueToWrite */{if(arguments.length){// Store the droppable's proportions
proportions=arguments[0];}else{// Retrieve or derive the droppable's proportions
return proportions?proportions:proportions={width:this.element[0].offsetWidth,height:this.element[0].offsetHeight};}};this._addToManager(o.scope);o.addClasses&&this.element.addClass("ui-droppable");},_addToManager:function _addToManager(scope){// Add the reference and positions to the manager
$.ui.ddmanager.droppables[scope]=$.ui.ddmanager.droppables[scope]||[];$.ui.ddmanager.droppables[scope].push(this);},_splice:function _splice(drop){var i=0;for(;i<drop.length;i++){if(drop[i]===this){drop.splice(i,1);}}},_destroy:function _destroy(){var drop=$.ui.ddmanager.droppables[this.options.scope];this._splice(drop);this.element.removeClass("ui-droppable ui-droppable-disabled");},_setOption:function _setOption(key,value){if(key==="accept"){this.accept=$.isFunction(value)?value:function(d){return d.is(value);};}else if(key==="scope"){var drop=$.ui.ddmanager.droppables[this.options.scope];this._splice(drop);this._addToManager(value);}this._super(key,value);},_activate:function _activate(event){var draggable=$.ui.ddmanager.current;if(this.options.activeClass){this.element.addClass(this.options.activeClass);}if(draggable){this._trigger("activate",event,this.ui(draggable));}},_deactivate:function _deactivate(event){var draggable=$.ui.ddmanager.current;if(this.options.activeClass){this.element.removeClass(this.options.activeClass);}if(draggable){this._trigger("deactivate",event,this.ui(draggable));}},_over:function _over(event){var draggable=$.ui.ddmanager.current;// Bail if draggable and droppable are same element
if(!draggable||(draggable.currentItem||draggable.element)[0]===this.element[0]){return;}if(this.accept.call(this.element[0],draggable.currentItem||draggable.element)){if(this.options.hoverClass){this.element.addClass(this.options.hoverClass);}this._trigger("over",event,this.ui(draggable));}},_out:function _out(event){var draggable=$.ui.ddmanager.current;// Bail if draggable and droppable are same element
if(!draggable||(draggable.currentItem||draggable.element)[0]===this.element[0]){return;}if(this.accept.call(this.element[0],draggable.currentItem||draggable.element)){if(this.options.hoverClass){this.element.removeClass(this.options.hoverClass);}this._trigger("out",event,this.ui(draggable));}},_drop:function _drop(event,custom){var draggable=custom||$.ui.ddmanager.current,childrenIntersection=false;// Bail if draggable and droppable are same element
if(!draggable||(draggable.currentItem||draggable.element)[0]===this.element[0]){return false;}this.element.find(":data(ui-droppable)").not(".ui-draggable-dragging").each(function(){var inst=$(this).droppable("instance");if(inst.options.greedy&&!inst.options.disabled&&inst.options.scope===draggable.options.scope&&inst.accept.call(inst.element[0],draggable.currentItem||draggable.element)&&$.ui.intersect(draggable,$.extend(inst,{offset:inst.element.offset()}),inst.options.tolerance,event)){childrenIntersection=true;return false;}});if(childrenIntersection){return false;}if(this.accept.call(this.element[0],draggable.currentItem||draggable.element)){if(this.options.activeClass){this.element.removeClass(this.options.activeClass);}if(this.options.hoverClass){this.element.removeClass(this.options.hoverClass);}this._trigger("drop",event,this.ui(draggable));return this.element;}return false;},ui:function ui(c){return{draggable:c.currentItem||c.element,helper:c.helper,position:c.position,offset:c.positionAbs};}});$.ui.intersect=function(){function isOverAxis(x,reference,size){return x>=reference&&x<reference+size;}return function(draggable,droppable,toleranceMode,event){if(!droppable.offset){return false;}var x1=(draggable.positionAbs||draggable.position.absolute).left+draggable.margins.left,y1=(draggable.positionAbs||draggable.position.absolute).top+draggable.margins.top,x2=x1+draggable.helperProportions.width,y2=y1+draggable.helperProportions.height,l=droppable.offset.left,t=droppable.offset.top,r=l+droppable.proportions().width,b=t+droppable.proportions().height;switch(toleranceMode){case"fit":return l<=x1&&x2<=r&&t<=y1&&y2<=b;case"intersect":return l<x1+draggable.helperProportions.width/2&&// Right Half
x2-draggable.helperProportions.width/2<r&&// Left Half
t<y1+draggable.helperProportions.height/2&&// Bottom Half
y2-draggable.helperProportions.height/2<b;// Top Half
case"pointer":return isOverAxis(event.pageY,t,droppable.proportions().height)&&isOverAxis(event.pageX,l,droppable.proportions().width);case"touch":return(y1>=t&&y1<=b||// Top edge touching
y2>=t&&y2<=b||// Bottom edge touching
y1<t&&y2>b// Surrounded vertically
)&&(x1>=l&&x1<=r||// Left edge touching
x2>=l&&x2<=r||// Right edge touching
x1<l&&x2>r// Surrounded horizontally
);default:return false;}};}();/*
	This manager tracks offsets of draggables and droppables
*/$.ui.ddmanager={current:null,droppables:{"default":[]},prepareOffsets:function prepareOffsets(t,event){var i,j,m=$.ui.ddmanager.droppables[t.options.scope]||[],type=event?event.type:null,// workaround for #2317
list=(t.currentItem||t.element).find(":data(ui-droppable)").addBack();droppablesLoop:for(i=0;i<m.length;i++){// No disabled and non-accepted
if(m[i].options.disabled||t&&!m[i].accept.call(m[i].element[0],t.currentItem||t.element)){continue;}// Filter out elements in the current dragged item
for(j=0;j<list.length;j++){if(list[j]===m[i].element[0]){m[i].proportions().height=0;continue droppablesLoop;}}m[i].visible=m[i].element.css("display")!=="none";if(!m[i].visible){continue;}// Activate the droppable if used directly from draggables
if(type==="mousedown"){m[i]._activate.call(m[i],event);}m[i].offset=m[i].element.offset();m[i].proportions({width:m[i].element[0].offsetWidth,height:m[i].element[0].offsetHeight});}},drop:function drop(draggable,event){var dropped=false;// Create a copy of the droppables in case the list changes during the drop (#9116)
$.each(($.ui.ddmanager.droppables[draggable.options.scope]||[]).slice(),function(){if(!this.options){return;}if(!this.options.disabled&&this.visible&&$.ui.intersect(draggable,this,this.options.tolerance,event)){dropped=this._drop.call(this,event)||dropped;}if(!this.options.disabled&&this.visible&&this.accept.call(this.element[0],draggable.currentItem||draggable.element)){this.isout=true;this.isover=false;this._deactivate.call(this,event);}});return dropped;},dragStart:function dragStart(draggable,event){// Listen for scrolling so that if the dragging causes scrolling the position of the droppables can be recalculated (see #5003)
draggable.element.parentsUntil("body").bind("scroll.droppable",function(){if(!draggable.options.refreshPositions){$.ui.ddmanager.prepareOffsets(draggable,event);}});},drag:function drag(draggable,event){// If you have a highly dynamic page, you might try this option. It renders positions every time you move the mouse.
if(draggable.options.refreshPositions){$.ui.ddmanager.prepareOffsets(draggable,event);}// Run through all droppables and check their positions based on specific tolerance options
$.each($.ui.ddmanager.droppables[draggable.options.scope]||[],function(){if(this.options.disabled||this.greedyChild||!this.visible){return;}var parentInstance,scope,parent,intersects=$.ui.intersect(draggable,this,this.options.tolerance,event),c=!intersects&&this.isover?"isout":intersects&&!this.isover?"isover":null;if(!c){return;}if(this.options.greedy){// find droppable parents with same scope
scope=this.options.scope;parent=this.element.parents(":data(ui-droppable)").filter(function(){return $(this).droppable("instance").options.scope===scope;});if(parent.length){parentInstance=$(parent[0]).droppable("instance");parentInstance.greedyChild=c==="isover";}}// we just moved into a greedy child
if(parentInstance&&c==="isover"){parentInstance.isover=false;parentInstance.isout=true;parentInstance._out.call(parentInstance,event);}this[c]=true;this[c==="isout"?"isover":"isout"]=false;this[c==="isover"?"_over":"_out"].call(this,event);// we just moved out of a greedy child
if(parentInstance&&c==="isout"){parentInstance.isout=false;parentInstance.isover=true;parentInstance._over.call(parentInstance,event);}});},dragStop:function dragStop(draggable,event){draggable.element.parentsUntil("body").unbind("scroll.droppable");// Call prepareOffsets one final time since IE does not fire return scroll events when overflow was caused by drag (see #5003)
if(!draggable.options.refreshPositions){$.ui.ddmanager.prepareOffsets(draggable,event);}}};var droppable=$.ui.droppable;/*!
 * jQuery UI Resizable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/resizable/
 */$.widget("ui.resizable",$.ui.mouse,{version:"1.11.4",widgetEventPrefix:"resize",options:{alsoResize:false,animate:false,animateDuration:"slow",animateEasing:"swing",aspectRatio:false,autoHide:false,containment:false,ghost:false,grid:false,handles:"e,s,se",helper:false,maxHeight:null,maxWidth:null,minHeight:10,minWidth:10,// See #7960
zIndex:90,// callbacks
resize:null,start:null,stop:null},_num:function _num(value){return parseInt(value,10)||0;},_isNumber:function _isNumber(value){return!isNaN(parseInt(value,10));},_hasScroll:function _hasScroll(el,a){if($(el).css("overflow")==="hidden"){return false;}var scroll=a&&a==="left"?"scrollLeft":"scrollTop",has=false;if(el[scroll]>0){return true;}// TODO: determine which cases actually cause this to happen
// if the element doesn't have the scroll set, see if it's possible to
// set the scroll
el[scroll]=1;has=el[scroll]>0;el[scroll]=0;return has;},_create:function _create(){var n,i,handle,axis,hname,that=this,o=this.options;this.element.addClass("ui-resizable");$.extend(this,{_aspectRatio:!!o.aspectRatio,aspectRatio:o.aspectRatio,originalElement:this.element,_proportionallyResizeElements:[],_helper:o.helper||o.ghost||o.animate?o.helper||"ui-resizable-helper":null});// Wrap the element if it cannot hold child nodes
if(this.element[0].nodeName.match(/^(canvas|textarea|input|select|button|img)$/i)){this.element.wrap($("<div class='ui-wrapper' style='overflow: hidden;'></div>").css({position:this.element.css("position"),width:this.element.outerWidth(),height:this.element.outerHeight(),top:this.element.css("top"),left:this.element.css("left")}));this.element=this.element.parent().data("ui-resizable",this.element.resizable("instance"));this.elementIsWrapper=true;this.element.css({marginLeft:this.originalElement.css("marginLeft"),marginTop:this.originalElement.css("marginTop"),marginRight:this.originalElement.css("marginRight"),marginBottom:this.originalElement.css("marginBottom")});this.originalElement.css({marginLeft:0,marginTop:0,marginRight:0,marginBottom:0});// support: Safari
// Prevent Safari textarea resize
this.originalResizeStyle=this.originalElement.css("resize");this.originalElement.css("resize","none");this._proportionallyResizeElements.push(this.originalElement.css({position:"static",zoom:1,display:"block"}));// support: IE9
// avoid IE jump (hard set the margin)
this.originalElement.css({margin:this.originalElement.css("margin")});this._proportionallyResize();}this.handles=o.handles||(!$(".ui-resizable-handle",this.element).length?"e,s,se":{n:".ui-resizable-n",e:".ui-resizable-e",s:".ui-resizable-s",w:".ui-resizable-w",se:".ui-resizable-se",sw:".ui-resizable-sw",ne:".ui-resizable-ne",nw:".ui-resizable-nw"});this._handles=$();if(this.handles.constructor===String){if(this.handles==="all"){this.handles="n,e,s,w,se,sw,ne,nw";}n=this.handles.split(",");this.handles={};for(i=0;i<n.length;i++){handle=$.trim(n[i]);hname="ui-resizable-"+handle;axis=$("<div class='ui-resizable-handle "+hname+"'></div>");axis.css({zIndex:o.zIndex});// TODO : What's going on here?
if("se"===handle){axis.addClass("ui-icon ui-icon-gripsmall-diagonal-se");}this.handles[handle]=".ui-resizable-"+handle;this.element.append(axis);}}this._renderAxis=function(target){var i,axis,padPos,padWrapper;target=target||this.element;for(i in this.handles){if(this.handles[i].constructor===String){this.handles[i]=this.element.children(this.handles[i]).first().show();}else if(this.handles[i].jquery||this.handles[i].nodeType){this.handles[i]=$(this.handles[i]);this._on(this.handles[i],{"mousedown":that._mouseDown});}if(this.elementIsWrapper&&this.originalElement[0].nodeName.match(/^(textarea|input|select|button)$/i)){axis=$(this.handles[i],this.element);padWrapper=/sw|ne|nw|se|n|s/.test(i)?axis.outerHeight():axis.outerWidth();padPos=["padding",/ne|nw|n/.test(i)?"Top":/se|sw|s/.test(i)?"Bottom":/^e$/.test(i)?"Right":"Left"].join("");target.css(padPos,padWrapper);this._proportionallyResize();}this._handles=this._handles.add(this.handles[i]);}};// TODO: make renderAxis a prototype function
this._renderAxis(this.element);this._handles=this._handles.add(this.element.find(".ui-resizable-handle"));this._handles.disableSelection();this._handles.mouseover(function(){if(!that.resizing){if(this.className){axis=this.className.match(/ui-resizable-(se|sw|ne|nw|n|e|s|w)/i);}that.axis=axis&&axis[1]?axis[1]:"se";}});if(o.autoHide){this._handles.hide();$(this.element).addClass("ui-resizable-autohide").mouseenter(function(){if(o.disabled){return;}$(this).removeClass("ui-resizable-autohide");that._handles.show();}).mouseleave(function(){if(o.disabled){return;}if(!that.resizing){$(this).addClass("ui-resizable-autohide");that._handles.hide();}});}this._mouseInit();},_destroy:function _destroy(){this._mouseDestroy();var wrapper,_destroy=function _destroy(exp){$(exp).removeClass("ui-resizable ui-resizable-disabled ui-resizable-resizing").removeData("resizable").removeData("ui-resizable").unbind(".resizable").find(".ui-resizable-handle").remove();};// TODO: Unwrap at same DOM position
if(this.elementIsWrapper){_destroy(this.element);wrapper=this.element;this.originalElement.css({position:wrapper.css("position"),width:wrapper.outerWidth(),height:wrapper.outerHeight(),top:wrapper.css("top"),left:wrapper.css("left")}).insertAfter(wrapper);wrapper.remove();}this.originalElement.css("resize",this.originalResizeStyle);_destroy(this.originalElement);return this;},_mouseCapture:function _mouseCapture(event){var i,handle,capture=false;for(i in this.handles){handle=$(this.handles[i])[0];if(handle===event.target||$.contains(handle,event.target)){capture=true;}}return!this.options.disabled&&capture;},_mouseStart:function _mouseStart(event){var curleft,curtop,cursor,o=this.options,el=this.element;this.resizing=true;this._renderProxy();curleft=this._num(this.helper.css("left"));curtop=this._num(this.helper.css("top"));if(o.containment){curleft+=$(o.containment).scrollLeft()||0;curtop+=$(o.containment).scrollTop()||0;}this.offset=this.helper.offset();this.position={left:curleft,top:curtop};this.size=this._helper?{width:this.helper.width(),height:this.helper.height()}:{width:el.width(),height:el.height()};this.originalSize=this._helper?{width:el.outerWidth(),height:el.outerHeight()}:{width:el.width(),height:el.height()};this.sizeDiff={width:el.outerWidth()-el.width(),height:el.outerHeight()-el.height()};this.originalPosition={left:curleft,top:curtop};this.originalMousePosition={left:event.pageX,top:event.pageY};this.aspectRatio=typeof o.aspectRatio==="number"?o.aspectRatio:this.originalSize.width/this.originalSize.height||1;cursor=$(".ui-resizable-"+this.axis).css("cursor");$("body").css("cursor",cursor==="auto"?this.axis+"-resize":cursor);el.addClass("ui-resizable-resizing");this._propagate("start",event);return true;},_mouseDrag:function _mouseDrag(event){var data,props,smp=this.originalMousePosition,a=this.axis,dx=event.pageX-smp.left||0,dy=event.pageY-smp.top||0,trigger=this._change[a];this._updatePrevProperties();if(!trigger){return false;}data=trigger.apply(this,[event,dx,dy]);this._updateVirtualBoundaries(event.shiftKey);if(this._aspectRatio||event.shiftKey){data=this._updateRatio(data,event);}data=this._respectSize(data,event);this._updateCache(data);this._propagate("resize",event);props=this._applyChanges();if(!this._helper&&this._proportionallyResizeElements.length){this._proportionallyResize();}if(!$.isEmptyObject(props)){this._updatePrevProperties();this._trigger("resize",event,this.ui());this._applyChanges();}return false;},_mouseStop:function _mouseStop(event){this.resizing=false;var pr,ista,soffseth,soffsetw,s,left,top,o=this.options,that=this;if(this._helper){pr=this._proportionallyResizeElements;ista=pr.length&&/textarea/i.test(pr[0].nodeName);soffseth=ista&&this._hasScroll(pr[0],"left")?0:that.sizeDiff.height;soffsetw=ista?0:that.sizeDiff.width;s={width:that.helper.width()-soffsetw,height:that.helper.height()-soffseth};left=parseInt(that.element.css("left"),10)+(that.position.left-that.originalPosition.left)||null;top=parseInt(that.element.css("top"),10)+(that.position.top-that.originalPosition.top)||null;if(!o.animate){this.element.css($.extend(s,{top:top,left:left}));}that.helper.height(that.size.height);that.helper.width(that.size.width);if(this._helper&&!o.animate){this._proportionallyResize();}}$("body").css("cursor","auto");this.element.removeClass("ui-resizable-resizing");this._propagate("stop",event);if(this._helper){this.helper.remove();}return false;},_updatePrevProperties:function _updatePrevProperties(){this.prevPosition={top:this.position.top,left:this.position.left};this.prevSize={width:this.size.width,height:this.size.height};},_applyChanges:function _applyChanges(){var props={};if(this.position.top!==this.prevPosition.top){props.top=this.position.top+"px";}if(this.position.left!==this.prevPosition.left){props.left=this.position.left+"px";}if(this.size.width!==this.prevSize.width){props.width=this.size.width+"px";}if(this.size.height!==this.prevSize.height){props.height=this.size.height+"px";}this.helper.css(props);return props;},_updateVirtualBoundaries:function _updateVirtualBoundaries(forceAspectRatio){var pMinWidth,pMaxWidth,pMinHeight,pMaxHeight,b,o=this.options;b={minWidth:this._isNumber(o.minWidth)?o.minWidth:0,maxWidth:this._isNumber(o.maxWidth)?o.maxWidth:Infinity,minHeight:this._isNumber(o.minHeight)?o.minHeight:0,maxHeight:this._isNumber(o.maxHeight)?o.maxHeight:Infinity};if(this._aspectRatio||forceAspectRatio){pMinWidth=b.minHeight*this.aspectRatio;pMinHeight=b.minWidth/this.aspectRatio;pMaxWidth=b.maxHeight*this.aspectRatio;pMaxHeight=b.maxWidth/this.aspectRatio;if(pMinWidth>b.minWidth){b.minWidth=pMinWidth;}if(pMinHeight>b.minHeight){b.minHeight=pMinHeight;}if(pMaxWidth<b.maxWidth){b.maxWidth=pMaxWidth;}if(pMaxHeight<b.maxHeight){b.maxHeight=pMaxHeight;}}this._vBoundaries=b;},_updateCache:function _updateCache(data){this.offset=this.helper.offset();if(this._isNumber(data.left)){this.position.left=data.left;}if(this._isNumber(data.top)){this.position.top=data.top;}if(this._isNumber(data.height)){this.size.height=data.height;}if(this._isNumber(data.width)){this.size.width=data.width;}},_updateRatio:function _updateRatio(data){var cpos=this.position,csize=this.size,a=this.axis;if(this._isNumber(data.height)){data.width=data.height*this.aspectRatio;}else if(this._isNumber(data.width)){data.height=data.width/this.aspectRatio;}if(a==="sw"){data.left=cpos.left+(csize.width-data.width);data.top=null;}if(a==="nw"){data.top=cpos.top+(csize.height-data.height);data.left=cpos.left+(csize.width-data.width);}return data;},_respectSize:function _respectSize(data){var o=this._vBoundaries,a=this.axis,ismaxw=this._isNumber(data.width)&&o.maxWidth&&o.maxWidth<data.width,ismaxh=this._isNumber(data.height)&&o.maxHeight&&o.maxHeight<data.height,isminw=this._isNumber(data.width)&&o.minWidth&&o.minWidth>data.width,isminh=this._isNumber(data.height)&&o.minHeight&&o.minHeight>data.height,dw=this.originalPosition.left+this.originalSize.width,dh=this.position.top+this.size.height,cw=/sw|nw|w/.test(a),ch=/nw|ne|n/.test(a);if(isminw){data.width=o.minWidth;}if(isminh){data.height=o.minHeight;}if(ismaxw){data.width=o.maxWidth;}if(ismaxh){data.height=o.maxHeight;}if(isminw&&cw){data.left=dw-o.minWidth;}if(ismaxw&&cw){data.left=dw-o.maxWidth;}if(isminh&&ch){data.top=dh-o.minHeight;}if(ismaxh&&ch){data.top=dh-o.maxHeight;}// Fixing jump error on top/left - bug #2330
if(!data.width&&!data.height&&!data.left&&data.top){data.top=null;}else if(!data.width&&!data.height&&!data.top&&data.left){data.left=null;}return data;},_getPaddingPlusBorderDimensions:function _getPaddingPlusBorderDimensions(element){var i=0,widths=[],borders=[element.css("borderTopWidth"),element.css("borderRightWidth"),element.css("borderBottomWidth"),element.css("borderLeftWidth")],paddings=[element.css("paddingTop"),element.css("paddingRight"),element.css("paddingBottom"),element.css("paddingLeft")];for(;i<4;i++){widths[i]=parseInt(borders[i],10)||0;widths[i]+=parseInt(paddings[i],10)||0;}return{height:widths[0]+widths[2],width:widths[1]+widths[3]};},_proportionallyResize:function _proportionallyResize(){if(!this._proportionallyResizeElements.length){return;}var prel,i=0,element=this.helper||this.element;for(;i<this._proportionallyResizeElements.length;i++){prel=this._proportionallyResizeElements[i];// TODO: Seems like a bug to cache this.outerDimensions
// considering that we are in a loop.
if(!this.outerDimensions){this.outerDimensions=this._getPaddingPlusBorderDimensions(prel);}prel.css({height:element.height()-this.outerDimensions.height||0,width:element.width()-this.outerDimensions.width||0});}},_renderProxy:function _renderProxy(){var el=this.element,o=this.options;this.elementOffset=el.offset();if(this._helper){this.helper=this.helper||$("<div style='overflow:hidden;'></div>");this.helper.addClass(this._helper).css({width:this.element.outerWidth()-1,height:this.element.outerHeight()-1,position:"absolute",left:this.elementOffset.left+"px",top:this.elementOffset.top+"px",zIndex:++o.zIndex//TODO: Don't modify option
});this.helper.appendTo("body").disableSelection();}else{this.helper=this.element;}},_change:{e:function e(event,dx){return{width:this.originalSize.width+dx};},w:function w(event,dx){var cs=this.originalSize,sp=this.originalPosition;return{left:sp.left+dx,width:cs.width-dx};},n:function n(event,dx,dy){var cs=this.originalSize,sp=this.originalPosition;return{top:sp.top+dy,height:cs.height-dy};},s:function s(event,dx,dy){return{height:this.originalSize.height+dy};},se:function se(event,dx,dy){return $.extend(this._change.s.apply(this,arguments),this._change.e.apply(this,[event,dx,dy]));},sw:function sw(event,dx,dy){return $.extend(this._change.s.apply(this,arguments),this._change.w.apply(this,[event,dx,dy]));},ne:function ne(event,dx,dy){return $.extend(this._change.n.apply(this,arguments),this._change.e.apply(this,[event,dx,dy]));},nw:function nw(event,dx,dy){return $.extend(this._change.n.apply(this,arguments),this._change.w.apply(this,[event,dx,dy]));}},_propagate:function _propagate(n,event){$.ui.plugin.call(this,n,[event,this.ui()]);n!=="resize"&&this._trigger(n,event,this.ui());},plugins:{},ui:function ui(){return{originalElement:this.originalElement,element:this.element,helper:this.helper,position:this.position,size:this.size,originalSize:this.originalSize,originalPosition:this.originalPosition};}});/*
 * Resizable Extensions
 */$.ui.plugin.add("resizable","animate",{stop:function stop(event){var that=$(this).resizable("instance"),o=that.options,pr=that._proportionallyResizeElements,ista=pr.length&&/textarea/i.test(pr[0].nodeName),soffseth=ista&&that._hasScroll(pr[0],"left")?0:that.sizeDiff.height,soffsetw=ista?0:that.sizeDiff.width,style={width:that.size.width-soffsetw,height:that.size.height-soffseth},left=parseInt(that.element.css("left"),10)+(that.position.left-that.originalPosition.left)||null,top=parseInt(that.element.css("top"),10)+(that.position.top-that.originalPosition.top)||null;that.element.animate($.extend(style,top&&left?{top:top,left:left}:{}),{duration:o.animateDuration,easing:o.animateEasing,step:function step(){var data={width:parseInt(that.element.css("width"),10),height:parseInt(that.element.css("height"),10),top:parseInt(that.element.css("top"),10),left:parseInt(that.element.css("left"),10)};if(pr&&pr.length){$(pr[0]).css({width:data.width,height:data.height});}// propagating resize, and updating values for each animation step
that._updateCache(data);that._propagate("resize",event);}});}});$.ui.plugin.add("resizable","containment",{start:function start(){var element,p,co,ch,cw,width,height,that=$(this).resizable("instance"),o=that.options,el=that.element,oc=o.containment,ce=oc instanceof $?oc.get(0):/parent/.test(oc)?el.parent().get(0):oc;if(!ce){return;}that.containerElement=$(ce);if(/document/.test(oc)||oc===document){that.containerOffset={left:0,top:0};that.containerPosition={left:0,top:0};that.parentData={element:$(document),left:0,top:0,width:$(document).width(),height:$(document).height()||document.body.parentNode.scrollHeight};}else{element=$(ce);p=[];$(["Top","Right","Left","Bottom"]).each(function(i,name){p[i]=that._num(element.css("padding"+name));});that.containerOffset=element.offset();that.containerPosition=element.position();that.containerSize={height:element.innerHeight()-p[3],width:element.innerWidth()-p[1]};co=that.containerOffset;ch=that.containerSize.height;cw=that.containerSize.width;width=that._hasScroll(ce,"left")?ce.scrollWidth:cw;height=that._hasScroll(ce)?ce.scrollHeight:ch;that.parentData={element:ce,left:co.left,top:co.top,width:width,height:height};}},resize:function resize(event){var woset,hoset,isParent,isOffsetRelative,that=$(this).resizable("instance"),o=that.options,co=that.containerOffset,cp=that.position,pRatio=that._aspectRatio||event.shiftKey,cop={top:0,left:0},ce=that.containerElement,continueResize=true;if(ce[0]!==document&&/static/.test(ce.css("position"))){cop=co;}if(cp.left<(that._helper?co.left:0)){that.size.width=that.size.width+(that._helper?that.position.left-co.left:that.position.left-cop.left);if(pRatio){that.size.height=that.size.width/that.aspectRatio;continueResize=false;}that.position.left=o.helper?co.left:0;}if(cp.top<(that._helper?co.top:0)){that.size.height=that.size.height+(that._helper?that.position.top-co.top:that.position.top);if(pRatio){that.size.width=that.size.height*that.aspectRatio;continueResize=false;}that.position.top=that._helper?co.top:0;}isParent=that.containerElement.get(0)===that.element.parent().get(0);isOffsetRelative=/relative|absolute/.test(that.containerElement.css("position"));if(isParent&&isOffsetRelative){that.offset.left=that.parentData.left+that.position.left;that.offset.top=that.parentData.top+that.position.top;}else{that.offset.left=that.element.offset().left;that.offset.top=that.element.offset().top;}woset=Math.abs(that.sizeDiff.width+(that._helper?that.offset.left-cop.left:that.offset.left-co.left));hoset=Math.abs(that.sizeDiff.height+(that._helper?that.offset.top-cop.top:that.offset.top-co.top));if(woset+that.size.width>=that.parentData.width){that.size.width=that.parentData.width-woset;if(pRatio){that.size.height=that.size.width/that.aspectRatio;continueResize=false;}}if(hoset+that.size.height>=that.parentData.height){that.size.height=that.parentData.height-hoset;if(pRatio){that.size.width=that.size.height*that.aspectRatio;continueResize=false;}}if(!continueResize){that.position.left=that.prevPosition.left;that.position.top=that.prevPosition.top;that.size.width=that.prevSize.width;that.size.height=that.prevSize.height;}},stop:function stop(){var that=$(this).resizable("instance"),o=that.options,co=that.containerOffset,cop=that.containerPosition,ce=that.containerElement,helper=$(that.helper),ho=helper.offset(),w=helper.outerWidth()-that.sizeDiff.width,h=helper.outerHeight()-that.sizeDiff.height;if(that._helper&&!o.animate&&/relative/.test(ce.css("position"))){$(this).css({left:ho.left-cop.left-co.left,width:w,height:h});}if(that._helper&&!o.animate&&/static/.test(ce.css("position"))){$(this).css({left:ho.left-cop.left-co.left,width:w,height:h});}}});$.ui.plugin.add("resizable","alsoResize",{start:function start(){var that=$(this).resizable("instance"),o=that.options;$(o.alsoResize).each(function(){var el=$(this);el.data("ui-resizable-alsoresize",{width:parseInt(el.width(),10),height:parseInt(el.height(),10),left:parseInt(el.css("left"),10),top:parseInt(el.css("top"),10)});});},resize:function resize(event,ui){var that=$(this).resizable("instance"),o=that.options,os=that.originalSize,op=that.originalPosition,delta={height:that.size.height-os.height||0,width:that.size.width-os.width||0,top:that.position.top-op.top||0,left:that.position.left-op.left||0};$(o.alsoResize).each(function(){var el=$(this),start=$(this).data("ui-resizable-alsoresize"),style={},css=el.parents(ui.originalElement[0]).length?["width","height"]:["width","height","top","left"];$.each(css,function(i,prop){var sum=(start[prop]||0)+(delta[prop]||0);if(sum&&sum>=0){style[prop]=sum||null;}});el.css(style);});},stop:function stop(){$(this).removeData("resizable-alsoresize");}});$.ui.plugin.add("resizable","ghost",{start:function start(){var that=$(this).resizable("instance"),o=that.options,cs=that.size;that.ghost=that.originalElement.clone();that.ghost.css({opacity:0.25,display:"block",position:"relative",height:cs.height,width:cs.width,margin:0,left:0,top:0}).addClass("ui-resizable-ghost").addClass(typeof o.ghost==="string"?o.ghost:"");that.ghost.appendTo(that.helper);},resize:function resize(){var that=$(this).resizable("instance");if(that.ghost){that.ghost.css({position:"relative",height:that.size.height,width:that.size.width});}},stop:function stop(){var that=$(this).resizable("instance");if(that.ghost&&that.helper){that.helper.get(0).removeChild(that.ghost.get(0));}}});$.ui.plugin.add("resizable","grid",{resize:function resize(){var outerDimensions,that=$(this).resizable("instance"),o=that.options,cs=that.size,os=that.originalSize,op=that.originalPosition,a=that.axis,grid=typeof o.grid==="number"?[o.grid,o.grid]:o.grid,gridX=grid[0]||1,gridY=grid[1]||1,ox=Math.round((cs.width-os.width)/gridX)*gridX,oy=Math.round((cs.height-os.height)/gridY)*gridY,newWidth=os.width+ox,newHeight=os.height+oy,isMaxWidth=o.maxWidth&&o.maxWidth<newWidth,isMaxHeight=o.maxHeight&&o.maxHeight<newHeight,isMinWidth=o.minWidth&&o.minWidth>newWidth,isMinHeight=o.minHeight&&o.minHeight>newHeight;o.grid=grid;if(isMinWidth){newWidth+=gridX;}if(isMinHeight){newHeight+=gridY;}if(isMaxWidth){newWidth-=gridX;}if(isMaxHeight){newHeight-=gridY;}if(/^(se|s|e)$/.test(a)){that.size.width=newWidth;that.size.height=newHeight;}else if(/^(ne)$/.test(a)){that.size.width=newWidth;that.size.height=newHeight;that.position.top=op.top-oy;}else if(/^(sw)$/.test(a)){that.size.width=newWidth;that.size.height=newHeight;that.position.left=op.left-ox;}else{if(newHeight-gridY<=0||newWidth-gridX<=0){outerDimensions=that._getPaddingPlusBorderDimensions(this);}if(newHeight-gridY>0){that.size.height=newHeight;that.position.top=op.top-oy;}else{newHeight=gridY-outerDimensions.height;that.size.height=newHeight;that.position.top=op.top+os.height-newHeight;}if(newWidth-gridX>0){that.size.width=newWidth;that.position.left=op.left-ox;}else{newWidth=gridX-outerDimensions.width;that.size.width=newWidth;that.position.left=op.left+os.width-newWidth;}}}});var resizable=$.ui.resizable;/*!
 * jQuery UI Selectable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/selectable/
 */var selectable=$.widget("ui.selectable",$.ui.mouse,{version:"1.11.4",options:{appendTo:"body",autoRefresh:true,distance:0,filter:"*",tolerance:"touch",// callbacks
selected:null,selecting:null,start:null,stop:null,unselected:null,unselecting:null},_create:function _create(){var selectees,that=this;this.element.addClass("ui-selectable");this.dragged=false;// cache selectee children based on filter
this.refresh=function(){selectees=$(that.options.filter,that.element[0]);selectees.addClass("ui-selectee");selectees.each(function(){var $this=$(this),pos=$this.offset();$.data(this,"selectable-item",{element:this,$element:$this,left:pos.left,top:pos.top,right:pos.left+$this.outerWidth(),bottom:pos.top+$this.outerHeight(),startselected:false,selected:$this.hasClass("ui-selected"),selecting:$this.hasClass("ui-selecting"),unselecting:$this.hasClass("ui-unselecting")});});};this.refresh();this.selectees=selectees.addClass("ui-selectee");this._mouseInit();this.helper=$("<div class='ui-selectable-helper'></div>");},_destroy:function _destroy(){this.selectees.removeClass("ui-selectee").removeData("selectable-item");this.element.removeClass("ui-selectable ui-selectable-disabled");this._mouseDestroy();},_mouseStart:function _mouseStart(event){var that=this,options=this.options;this.opos=[event.pageX,event.pageY];if(this.options.disabled){return;}this.selectees=$(options.filter,this.element[0]);this._trigger("start",event);$(options.appendTo).append(this.helper);// position helper (lasso)
this.helper.css({"left":event.pageX,"top":event.pageY,"width":0,"height":0});if(options.autoRefresh){this.refresh();}this.selectees.filter(".ui-selected").each(function(){var selectee=$.data(this,"selectable-item");selectee.startselected=true;if(!event.metaKey&&!event.ctrlKey){selectee.$element.removeClass("ui-selected");selectee.selected=false;selectee.$element.addClass("ui-unselecting");selectee.unselecting=true;// selectable UNSELECTING callback
that._trigger("unselecting",event,{unselecting:selectee.element});}});$(event.target).parents().addBack().each(function(){var doSelect,selectee=$.data(this,"selectable-item");if(selectee){doSelect=!event.metaKey&&!event.ctrlKey||!selectee.$element.hasClass("ui-selected");selectee.$element.removeClass(doSelect?"ui-unselecting":"ui-selected").addClass(doSelect?"ui-selecting":"ui-unselecting");selectee.unselecting=!doSelect;selectee.selecting=doSelect;selectee.selected=doSelect;// selectable (UN)SELECTING callback
if(doSelect){that._trigger("selecting",event,{selecting:selectee.element});}else{that._trigger("unselecting",event,{unselecting:selectee.element});}return false;}});},_mouseDrag:function _mouseDrag(event){this.dragged=true;if(this.options.disabled){return;}var tmp,that=this,options=this.options,x1=this.opos[0],y1=this.opos[1],x2=event.pageX,y2=event.pageY;if(x1>x2){tmp=x2;x2=x1;x1=tmp;}if(y1>y2){tmp=y2;y2=y1;y1=tmp;}this.helper.css({left:x1,top:y1,width:x2-x1,height:y2-y1});this.selectees.each(function(){var selectee=$.data(this,"selectable-item"),hit=false;//prevent helper from being selected if appendTo: selectable
if(!selectee||selectee.element===that.element[0]){return;}if(options.tolerance==="touch"){hit=!(selectee.left>x2||selectee.right<x1||selectee.top>y2||selectee.bottom<y1);}else if(options.tolerance==="fit"){hit=selectee.left>x1&&selectee.right<x2&&selectee.top>y1&&selectee.bottom<y2;}if(hit){// SELECT
if(selectee.selected){selectee.$element.removeClass("ui-selected");selectee.selected=false;}if(selectee.unselecting){selectee.$element.removeClass("ui-unselecting");selectee.unselecting=false;}if(!selectee.selecting){selectee.$element.addClass("ui-selecting");selectee.selecting=true;// selectable SELECTING callback
that._trigger("selecting",event,{selecting:selectee.element});}}else{// UNSELECT
if(selectee.selecting){if((event.metaKey||event.ctrlKey)&&selectee.startselected){selectee.$element.removeClass("ui-selecting");selectee.selecting=false;selectee.$element.addClass("ui-selected");selectee.selected=true;}else{selectee.$element.removeClass("ui-selecting");selectee.selecting=false;if(selectee.startselected){selectee.$element.addClass("ui-unselecting");selectee.unselecting=true;}// selectable UNSELECTING callback
that._trigger("unselecting",event,{unselecting:selectee.element});}}if(selectee.selected){if(!event.metaKey&&!event.ctrlKey&&!selectee.startselected){selectee.$element.removeClass("ui-selected");selectee.selected=false;selectee.$element.addClass("ui-unselecting");selectee.unselecting=true;// selectable UNSELECTING callback
that._trigger("unselecting",event,{unselecting:selectee.element});}}}});return false;},_mouseStop:function _mouseStop(event){var that=this;this.dragged=false;$(".ui-unselecting",this.element[0]).each(function(){var selectee=$.data(this,"selectable-item");selectee.$element.removeClass("ui-unselecting");selectee.unselecting=false;selectee.startselected=false;that._trigger("unselected",event,{unselected:selectee.element});});$(".ui-selecting",this.element[0]).each(function(){var selectee=$.data(this,"selectable-item");selectee.$element.removeClass("ui-selecting").addClass("ui-selected");selectee.selecting=false;selectee.selected=true;selectee.startselected=true;that._trigger("selected",event,{selected:selectee.element});});this._trigger("stop",event);this.helper.remove();return false;}});/*!
 * jQuery UI Sortable 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/sortable/
 */var sortable=$.widget("ui.sortable",$.ui.mouse,{version:"1.11.4",widgetEventPrefix:"sort",ready:false,options:{appendTo:"parent",axis:false,connectWith:false,containment:false,cursor:"auto",cursorAt:false,dropOnEmpty:true,forcePlaceholderSize:false,forceHelperSize:false,grid:false,handle:false,helper:"original",items:"> *",opacity:false,placeholder:false,revert:false,scroll:true,scrollSensitivity:20,scrollSpeed:20,scope:"default",tolerance:"intersect",zIndex:1000,// callbacks
activate:null,beforeStop:null,change:null,deactivate:null,out:null,over:null,receive:null,remove:null,sort:null,start:null,stop:null,update:null},_isOverAxis:function _isOverAxis(x,reference,size){return x>=reference&&x<reference+size;},_isFloating:function _isFloating(item){return /left|right/.test(item.css("float"))||/inline|table-cell/.test(item.css("display"));},_create:function _create(){this.containerCache={};this.element.addClass("ui-sortable");//Get the items
this.refresh();//Let's determine the parent's offset
this.offset=this.element.offset();//Initialize mouse events for interaction
this._mouseInit();this._setHandleClassName();//We're ready to go
this.ready=true;},_setOption:function _setOption(key,value){this._super(key,value);if(key==="handle"){this._setHandleClassName();}},_setHandleClassName:function _setHandleClassName(){this.element.find(".ui-sortable-handle").removeClass("ui-sortable-handle");$.each(this.items,function(){(this.instance.options.handle?this.item.find(this.instance.options.handle):this.item).addClass("ui-sortable-handle");});},_destroy:function _destroy(){this.element.removeClass("ui-sortable ui-sortable-disabled").find(".ui-sortable-handle").removeClass("ui-sortable-handle");this._mouseDestroy();for(var i=this.items.length-1;i>=0;i--){this.items[i].item.removeData(this.widgetName+"-item");}return this;},_mouseCapture:function _mouseCapture(event,overrideHandle){var currentItem=null,validHandle=false,that=this;if(this.reverting){return false;}if(this.options.disabled||this.options.type==="static"){return false;}//We have to refresh the items data once first
this._refreshItems(event);//Find out if the clicked node (or one of its parents) is a actual item in this.items
$(event.target).parents().each(function(){if($.data(this,that.widgetName+"-item")===that){currentItem=$(this);return false;}});if($.data(event.target,that.widgetName+"-item")===that){currentItem=$(event.target);}if(!currentItem){return false;}if(this.options.handle&&!overrideHandle){$(this.options.handle,currentItem).find("*").addBack().each(function(){if(this===event.target){validHandle=true;}});if(!validHandle){return false;}}this.currentItem=currentItem;this._removeCurrentsFromItems();return true;},_mouseStart:function _mouseStart(event,overrideHandle,noActivation){var i,body,o=this.options;this.currentContainer=this;//We only need to call refreshPositions, because the refreshItems call has been moved to mouseCapture
this.refreshPositions();//Create and append the visible helper
this.helper=this._createHelper(event);//Cache the helper size
this._cacheHelperProportions();/*
		 * - Position generation -
		 * This block generates everything position related - it's the core of draggables.
		 *///Cache the margins of the original element
this._cacheMargins();//Get the next scrolling parent
this.scrollParent=this.helper.scrollParent();//The element's absolute position on the page minus margins
this.offset=this.currentItem.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};$.extend(this.offset,{click:{//Where the click happened, relative to the element
left:event.pageX-this.offset.left,top:event.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()//This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
});// Only after we got the offset, we can change the helper's position to absolute
// TODO: Still need to figure out a way to make relative sorting possible
this.helper.css("position","absolute");this.cssPosition=this.helper.css("position");//Generate the original position
this.originalPosition=this._generatePosition(event);this.originalPageX=event.pageX;this.originalPageY=event.pageY;//Adjust the mouse offset relative to the helper if "cursorAt" is supplied
o.cursorAt&&this._adjustOffsetFromHelper(o.cursorAt);//Cache the former DOM position
this.domPosition={prev:this.currentItem.prev()[0],parent:this.currentItem.parent()[0]};//If the helper is not the original, hide the original so it's not playing any role during the drag, won't cause anything bad this way
if(this.helper[0]!==this.currentItem[0]){this.currentItem.hide();}//Create the placeholder
this._createPlaceholder();//Set a containment if given in the options
if(o.containment){this._setContainment();}if(o.cursor&&o.cursor!=="auto"){// cursor option
body=this.document.find("body");// support: IE
this.storedCursor=body.css("cursor");body.css("cursor",o.cursor);this.storedStylesheet=$("<style>*{ cursor: "+o.cursor+" !important; }</style>").appendTo(body);}if(o.opacity){// opacity option
if(this.helper.css("opacity")){this._storedOpacity=this.helper.css("opacity");}this.helper.css("opacity",o.opacity);}if(o.zIndex){// zIndex option
if(this.helper.css("zIndex")){this._storedZIndex=this.helper.css("zIndex");}this.helper.css("zIndex",o.zIndex);}//Prepare scrolling
if(this.scrollParent[0]!==this.document[0]&&this.scrollParent[0].tagName!=="HTML"){this.overflowOffset=this.scrollParent.offset();}//Call callbacks
this._trigger("start",event,this._uiHash());//Recache the helper size
if(!this._preserveHelperProportions){this._cacheHelperProportions();}//Post "activate" events to possible containers
if(!noActivation){for(i=this.containers.length-1;i>=0;i--){this.containers[i]._trigger("activate",event,this._uiHash(this));}}//Prepare possible droppables
if($.ui.ddmanager){$.ui.ddmanager.current=this;}if($.ui.ddmanager&&!o.dropBehaviour){$.ui.ddmanager.prepareOffsets(this,event);}this.dragging=true;this.helper.addClass("ui-sortable-helper");this._mouseDrag(event);//Execute the drag once - this causes the helper not to be visible before getting its correct position
return true;},_mouseDrag:function _mouseDrag(event){var i,item,itemElement,intersection,o=this.options,scrolled=false;//Compute the helpers position
this.position=this._generatePosition(event);this.positionAbs=this._convertPositionTo("absolute");if(!this.lastPositionAbs){this.lastPositionAbs=this.positionAbs;}//Do scrolling
if(this.options.scroll){if(this.scrollParent[0]!==this.document[0]&&this.scrollParent[0].tagName!=="HTML"){if(this.overflowOffset.top+this.scrollParent[0].offsetHeight-event.pageY<o.scrollSensitivity){this.scrollParent[0].scrollTop=scrolled=this.scrollParent[0].scrollTop+o.scrollSpeed;}else if(event.pageY-this.overflowOffset.top<o.scrollSensitivity){this.scrollParent[0].scrollTop=scrolled=this.scrollParent[0].scrollTop-o.scrollSpeed;}if(this.overflowOffset.left+this.scrollParent[0].offsetWidth-event.pageX<o.scrollSensitivity){this.scrollParent[0].scrollLeft=scrolled=this.scrollParent[0].scrollLeft+o.scrollSpeed;}else if(event.pageX-this.overflowOffset.left<o.scrollSensitivity){this.scrollParent[0].scrollLeft=scrolled=this.scrollParent[0].scrollLeft-o.scrollSpeed;}}else{if(event.pageY-this.document.scrollTop()<o.scrollSensitivity){scrolled=this.document.scrollTop(this.document.scrollTop()-o.scrollSpeed);}else if(this.window.height()-(event.pageY-this.document.scrollTop())<o.scrollSensitivity){scrolled=this.document.scrollTop(this.document.scrollTop()+o.scrollSpeed);}if(event.pageX-this.document.scrollLeft()<o.scrollSensitivity){scrolled=this.document.scrollLeft(this.document.scrollLeft()-o.scrollSpeed);}else if(this.window.width()-(event.pageX-this.document.scrollLeft())<o.scrollSensitivity){scrolled=this.document.scrollLeft(this.document.scrollLeft()+o.scrollSpeed);}}if(scrolled!==false&&$.ui.ddmanager&&!o.dropBehaviour){$.ui.ddmanager.prepareOffsets(this,event);}}//Regenerate the absolute position used for position checks
this.positionAbs=this._convertPositionTo("absolute");//Set the helper position
if(!this.options.axis||this.options.axis!=="y"){this.helper[0].style.left=this.position.left+"px";}if(!this.options.axis||this.options.axis!=="x"){this.helper[0].style.top=this.position.top+"px";}//Rearrange
for(i=this.items.length-1;i>=0;i--){//Cache variables and intersection, continue if no intersection
item=this.items[i];itemElement=item.item[0];intersection=this._intersectsWithPointer(item);if(!intersection){continue;}// Only put the placeholder inside the current Container, skip all
// items from other containers. This works because when moving
// an item from one container to another the
// currentContainer is switched before the placeholder is moved.
//
// Without this, moving items in "sub-sortables" can cause
// the placeholder to jitter between the outer and inner container.
if(item.instance!==this.currentContainer){continue;}// cannot intersect with itself
// no useless actions that have been done before
// no action if the item moved is the parent of the item checked
if(itemElement!==this.currentItem[0]&&this.placeholder[intersection===1?"next":"prev"]()[0]!==itemElement&&!$.contains(this.placeholder[0],itemElement)&&(this.options.type==="semi-dynamic"?!$.contains(this.element[0],itemElement):true)){this.direction=intersection===1?"down":"up";if(this.options.tolerance==="pointer"||this._intersectsWithSides(item)){this._rearrange(event,item);}else{break;}this._trigger("change",event,this._uiHash());break;}}//Post events to containers
this._contactContainers(event);//Interconnect with droppables
if($.ui.ddmanager){$.ui.ddmanager.drag(this,event);}//Call callbacks
this._trigger("sort",event,this._uiHash());this.lastPositionAbs=this.positionAbs;return false;},_mouseStop:function _mouseStop(event,noPropagation){if(!event){return;}//If we are using droppables, inform the manager about the drop
if($.ui.ddmanager&&!this.options.dropBehaviour){$.ui.ddmanager.drop(this,event);}if(this.options.revert){var that=this,cur=this.placeholder.offset(),axis=this.options.axis,animation={};if(!axis||axis==="x"){animation.left=cur.left-this.offset.parent.left-this.margins.left+(this.offsetParent[0]===this.document[0].body?0:this.offsetParent[0].scrollLeft);}if(!axis||axis==="y"){animation.top=cur.top-this.offset.parent.top-this.margins.top+(this.offsetParent[0]===this.document[0].body?0:this.offsetParent[0].scrollTop);}this.reverting=true;$(this.helper).animate(animation,parseInt(this.options.revert,10)||500,function(){that._clear(event);});}else{this._clear(event,noPropagation);}return false;},cancel:function cancel(){if(this.dragging){this._mouseUp({target:null});if(this.options.helper==="original"){this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");}else{this.currentItem.show();}//Post deactivating events to containers
for(var i=this.containers.length-1;i>=0;i--){this.containers[i]._trigger("deactivate",null,this._uiHash(this));if(this.containers[i].containerCache.over){this.containers[i]._trigger("out",null,this._uiHash(this));this.containers[i].containerCache.over=0;}}}if(this.placeholder){//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
if(this.placeholder[0].parentNode){this.placeholder[0].parentNode.removeChild(this.placeholder[0]);}if(this.options.helper!=="original"&&this.helper&&this.helper[0].parentNode){this.helper.remove();}$.extend(this,{helper:null,dragging:false,reverting:false,_noFinalSort:null});if(this.domPosition.prev){$(this.domPosition.prev).after(this.currentItem);}else{$(this.domPosition.parent).prepend(this.currentItem);}}return this;},serialize:function serialize(o){var items=this._getItemsAsjQuery(o&&o.connected),str=[];o=o||{};$(items).each(function(){var res=($(o.item||this).attr(o.attribute||"id")||"").match(o.expression||/(.+)[\-=_](.+)/);if(res){str.push((o.key||res[1]+"[]")+"="+(o.key&&o.expression?res[1]:res[2]));}});if(!str.length&&o.key){str.push(o.key+"=");}return str.join("&");},toArray:function toArray(o){var items=this._getItemsAsjQuery(o&&o.connected),ret=[];o=o||{};items.each(function(){ret.push($(o.item||this).attr(o.attribute||"id")||"");});return ret;},/* Be careful with the following core functions */_intersectsWith:function _intersectsWith(item){var x1=this.positionAbs.left,x2=x1+this.helperProportions.width,y1=this.positionAbs.top,y2=y1+this.helperProportions.height,l=item.left,r=l+item.width,t=item.top,b=t+item.height,dyClick=this.offset.click.top,dxClick=this.offset.click.left,isOverElementHeight=this.options.axis==="x"||y1+dyClick>t&&y1+dyClick<b,isOverElementWidth=this.options.axis==="y"||x1+dxClick>l&&x1+dxClick<r,isOverElement=isOverElementHeight&&isOverElementWidth;if(this.options.tolerance==="pointer"||this.options.forcePointerForContainers||this.options.tolerance!=="pointer"&&this.helperProportions[this.floating?"width":"height"]>item[this.floating?"width":"height"]){return isOverElement;}else{return l<x1+this.helperProportions.width/2&&// Right Half
x2-this.helperProportions.width/2<r&&// Left Half
t<y1+this.helperProportions.height/2&&// Bottom Half
y2-this.helperProportions.height/2<b;// Top Half
}},_intersectsWithPointer:function _intersectsWithPointer(item){var isOverElementHeight=this.options.axis==="x"||this._isOverAxis(this.positionAbs.top+this.offset.click.top,item.top,item.height),isOverElementWidth=this.options.axis==="y"||this._isOverAxis(this.positionAbs.left+this.offset.click.left,item.left,item.width),isOverElement=isOverElementHeight&&isOverElementWidth,verticalDirection=this._getDragVerticalDirection(),horizontalDirection=this._getDragHorizontalDirection();if(!isOverElement){return false;}return this.floating?horizontalDirection&&horizontalDirection==="right"||verticalDirection==="down"?2:1:verticalDirection&&(verticalDirection==="down"?2:1);},_intersectsWithSides:function _intersectsWithSides(item){var isOverBottomHalf=this._isOverAxis(this.positionAbs.top+this.offset.click.top,item.top+item.height/2,item.height),isOverRightHalf=this._isOverAxis(this.positionAbs.left+this.offset.click.left,item.left+item.width/2,item.width),verticalDirection=this._getDragVerticalDirection(),horizontalDirection=this._getDragHorizontalDirection();if(this.floating&&horizontalDirection){return horizontalDirection==="right"&&isOverRightHalf||horizontalDirection==="left"&&!isOverRightHalf;}else{return verticalDirection&&(verticalDirection==="down"&&isOverBottomHalf||verticalDirection==="up"&&!isOverBottomHalf);}},_getDragVerticalDirection:function _getDragVerticalDirection(){var delta=this.positionAbs.top-this.lastPositionAbs.top;return delta!==0&&(delta>0?"down":"up");},_getDragHorizontalDirection:function _getDragHorizontalDirection(){var delta=this.positionAbs.left-this.lastPositionAbs.left;return delta!==0&&(delta>0?"right":"left");},refresh:function refresh(event){this._refreshItems(event);this._setHandleClassName();this.refreshPositions();return this;},_connectWith:function _connectWith(){var options=this.options;return options.connectWith.constructor===String?[options.connectWith]:options.connectWith;},_getItemsAsjQuery:function _getItemsAsjQuery(connected){var i,j,cur,inst,items=[],queries=[],connectWith=this._connectWith();if(connectWith&&connected){for(i=connectWith.length-1;i>=0;i--){cur=$(connectWith[i],this.document[0]);for(j=cur.length-1;j>=0;j--){inst=$.data(cur[j],this.widgetFullName);if(inst&&inst!==this&&!inst.options.disabled){queries.push([$.isFunction(inst.options.items)?inst.options.items.call(inst.element):$(inst.options.items,inst.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),inst]);}}}}queries.push([$.isFunction(this.options.items)?this.options.items.call(this.element,null,{options:this.options,item:this.currentItem}):$(this.options.items,this.element).not(".ui-sortable-helper").not(".ui-sortable-placeholder"),this]);function addItems(){items.push(this);}for(i=queries.length-1;i>=0;i--){queries[i][0].each(addItems);}return $(items);},_removeCurrentsFromItems:function _removeCurrentsFromItems(){var list=this.currentItem.find(":data("+this.widgetName+"-item)");this.items=$.grep(this.items,function(item){for(var j=0;j<list.length;j++){if(list[j]===item.item[0]){return false;}}return true;});},_refreshItems:function _refreshItems(event){this.items=[];this.containers=[this];var i,j,cur,inst,targetData,_queries,item,queriesLength,items=this.items,queries=[[$.isFunction(this.options.items)?this.options.items.call(this.element[0],event,{item:this.currentItem}):$(this.options.items,this.element),this]],connectWith=this._connectWith();if(connectWith&&this.ready){//Shouldn't be run the first time through due to massive slow-down
for(i=connectWith.length-1;i>=0;i--){cur=$(connectWith[i],this.document[0]);for(j=cur.length-1;j>=0;j--){inst=$.data(cur[j],this.widgetFullName);if(inst&&inst!==this&&!inst.options.disabled){queries.push([$.isFunction(inst.options.items)?inst.options.items.call(inst.element[0],event,{item:this.currentItem}):$(inst.options.items,inst.element),inst]);this.containers.push(inst);}}}}for(i=queries.length-1;i>=0;i--){targetData=queries[i][1];_queries=queries[i][0];for(j=0,queriesLength=_queries.length;j<queriesLength;j++){item=$(_queries[j]);item.data(this.widgetName+"-item",targetData);// Data for target checking (mouse manager)
items.push({item:item,instance:targetData,width:0,height:0,left:0,top:0});}}},refreshPositions:function refreshPositions(fast){// Determine whether items are being displayed horizontally
this.floating=this.items.length?this.options.axis==="x"||this._isFloating(this.items[0].item):false;//This has to be redone because due to the item being moved out/into the offsetParent, the offsetParent's position will change
if(this.offsetParent&&this.helper){this.offset.parent=this._getParentOffset();}var i,item,t,p;for(i=this.items.length-1;i>=0;i--){item=this.items[i];//We ignore calculating positions of all connected containers when we're not over them
if(item.instance!==this.currentContainer&&this.currentContainer&&item.item[0]!==this.currentItem[0]){continue;}t=this.options.toleranceElement?$(this.options.toleranceElement,item.item):item.item;if(!fast){item.width=t.outerWidth();item.height=t.outerHeight();}p=t.offset();item.left=p.left;item.top=p.top;}if(this.options.custom&&this.options.custom.refreshContainers){this.options.custom.refreshContainers.call(this);}else{for(i=this.containers.length-1;i>=0;i--){p=this.containers[i].element.offset();this.containers[i].containerCache.left=p.left;this.containers[i].containerCache.top=p.top;this.containers[i].containerCache.width=this.containers[i].element.outerWidth();this.containers[i].containerCache.height=this.containers[i].element.outerHeight();}}return this;},_createPlaceholder:function _createPlaceholder(that){that=that||this;var className,o=that.options;if(!o.placeholder||o.placeholder.constructor===String){className=o.placeholder;o.placeholder={element:function element(){var nodeName=that.currentItem[0].nodeName.toLowerCase(),element=$("<"+nodeName+">",that.document[0]).addClass(className||that.currentItem[0].className+" ui-sortable-placeholder").removeClass("ui-sortable-helper");if(nodeName==="tbody"){that._createTrPlaceholder(that.currentItem.find("tr").eq(0),$("<tr>",that.document[0]).appendTo(element));}else if(nodeName==="tr"){that._createTrPlaceholder(that.currentItem,element);}else if(nodeName==="img"){element.attr("src",that.currentItem.attr("src"));}if(!className){element.css("visibility","hidden");}return element;},update:function update(container,p){// 1. If a className is set as 'placeholder option, we don't force sizes - the class is responsible for that
// 2. The option 'forcePlaceholderSize can be enabled to force it even if a class name is specified
if(className&&!o.forcePlaceholderSize){return;}//If the element doesn't have a actual height by itself (without styles coming from a stylesheet), it receives the inline height from the dragged item
if(!p.height()){p.height(that.currentItem.innerHeight()-parseInt(that.currentItem.css("paddingTop")||0,10)-parseInt(that.currentItem.css("paddingBottom")||0,10));}if(!p.width()){p.width(that.currentItem.innerWidth()-parseInt(that.currentItem.css("paddingLeft")||0,10)-parseInt(that.currentItem.css("paddingRight")||0,10));}}};}//Create the placeholder
that.placeholder=$(o.placeholder.element.call(that.element,that.currentItem));//Append it after the actual current item
that.currentItem.after(that.placeholder);//Update the size of the placeholder (TODO: Logic to fuzzy, see line 316/317)
o.placeholder.update(that,that.placeholder);},_createTrPlaceholder:function _createTrPlaceholder(sourceTr,targetTr){var that=this;sourceTr.children().each(function(){$("<td>&#160;</td>",that.document[0]).attr("colspan",$(this).attr("colspan")||1).appendTo(targetTr);});},_contactContainers:function _contactContainers(event){var i,j,dist,itemWithLeastDistance,posProperty,sizeProperty,cur,nearBottom,floating,axis,innermostContainer=null,innermostIndex=null;// get innermost container that intersects with item
for(i=this.containers.length-1;i>=0;i--){// never consider a container that's located within the item itself
if($.contains(this.currentItem[0],this.containers[i].element[0])){continue;}if(this._intersectsWith(this.containers[i].containerCache)){// if we've already found a container and it's more "inner" than this, then continue
if(innermostContainer&&$.contains(this.containers[i].element[0],innermostContainer.element[0])){continue;}innermostContainer=this.containers[i];innermostIndex=i;}else{// container doesn't intersect. trigger "out" event if necessary
if(this.containers[i].containerCache.over){this.containers[i]._trigger("out",event,this._uiHash(this));this.containers[i].containerCache.over=0;}}}// if no intersecting containers found, return
if(!innermostContainer){return;}// move the item into the container if it's not there already
if(this.containers.length===1){if(!this.containers[innermostIndex].containerCache.over){this.containers[innermostIndex]._trigger("over",event,this._uiHash(this));this.containers[innermostIndex].containerCache.over=1;}}else{//When entering a new container, we will find the item with the least distance and append our item near it
dist=10000;itemWithLeastDistance=null;floating=innermostContainer.floating||this._isFloating(this.currentItem);posProperty=floating?"left":"top";sizeProperty=floating?"width":"height";axis=floating?"clientX":"clientY";for(j=this.items.length-1;j>=0;j--){if(!$.contains(this.containers[innermostIndex].element[0],this.items[j].item[0])){continue;}if(this.items[j].item[0]===this.currentItem[0]){continue;}cur=this.items[j].item.offset()[posProperty];nearBottom=false;if(event[axis]-cur>this.items[j][sizeProperty]/2){nearBottom=true;}if(Math.abs(event[axis]-cur)<dist){dist=Math.abs(event[axis]-cur);itemWithLeastDistance=this.items[j];this.direction=nearBottom?"up":"down";}}//Check if dropOnEmpty is enabled
if(!itemWithLeastDistance&&!this.options.dropOnEmpty){return;}if(this.currentContainer===this.containers[innermostIndex]){if(!this.currentContainer.containerCache.over){this.containers[innermostIndex]._trigger("over",event,this._uiHash());this.currentContainer.containerCache.over=1;}return;}itemWithLeastDistance?this._rearrange(event,itemWithLeastDistance,null,true):this._rearrange(event,null,this.containers[innermostIndex].element,true);this._trigger("change",event,this._uiHash());this.containers[innermostIndex]._trigger("change",event,this._uiHash(this));this.currentContainer=this.containers[innermostIndex];//Update the placeholder
this.options.placeholder.update(this.currentContainer,this.placeholder);this.containers[innermostIndex]._trigger("over",event,this._uiHash(this));this.containers[innermostIndex].containerCache.over=1;}},_createHelper:function _createHelper(event){var o=this.options,helper=$.isFunction(o.helper)?$(o.helper.apply(this.element[0],[event,this.currentItem])):o.helper==="clone"?this.currentItem.clone():this.currentItem;//Add the helper to the DOM if that didn't happen already
if(!helper.parents("body").length){$(o.appendTo!=="parent"?o.appendTo:this.currentItem[0].parentNode)[0].appendChild(helper[0]);}if(helper[0]===this.currentItem[0]){this._storedCSS={width:this.currentItem[0].style.width,height:this.currentItem[0].style.height,position:this.currentItem.css("position"),top:this.currentItem.css("top"),left:this.currentItem.css("left")};}if(!helper[0].style.width||o.forceHelperSize){helper.width(this.currentItem.width());}if(!helper[0].style.height||o.forceHelperSize){helper.height(this.currentItem.height());}return helper;},_adjustOffsetFromHelper:function _adjustOffsetFromHelper(obj){if(typeof obj==="string"){obj=obj.split(" ");}if($.isArray(obj)){obj={left:+obj[0],top:+obj[1]||0};}if("left"in obj){this.offset.click.left=obj.left+this.margins.left;}if("right"in obj){this.offset.click.left=this.helperProportions.width-obj.right+this.margins.left;}if("top"in obj){this.offset.click.top=obj.top+this.margins.top;}if("bottom"in obj){this.offset.click.top=this.helperProportions.height-obj.bottom+this.margins.top;}},_getParentOffset:function _getParentOffset(){//Get the offsetParent and cache its position
this.offsetParent=this.helper.offsetParent();var po=this.offsetParent.offset();// This is a special case where we need to modify a offset calculated on start, since the following happened:
// 1. The position of the helper is absolute, so it's position is calculated based on the next positioned parent
// 2. The actual offset parent is a child of the scroll parent, and the scroll parent isn't the document, which means that
//    the scroll is included in the initial calculation of the offset of the parent, and never recalculated upon drag
if(this.cssPosition==="absolute"&&this.scrollParent[0]!==this.document[0]&&$.contains(this.scrollParent[0],this.offsetParent[0])){po.left+=this.scrollParent.scrollLeft();po.top+=this.scrollParent.scrollTop();}// This needs to be actually done for all browsers, since pageX/pageY includes this information
// with an ugly IE fix
if(this.offsetParent[0]===this.document[0].body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()==="html"&&$.ui.ie){po={top:0,left:0};}return{top:po.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:po.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)};},_getRelativeOffset:function _getRelativeOffset(){if(this.cssPosition==="relative"){var p=this.currentItem.position();return{top:p.top-(parseInt(this.helper.css("top"),10)||0)+this.scrollParent.scrollTop(),left:p.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()};}else{return{top:0,left:0};}},_cacheMargins:function _cacheMargins(){this.margins={left:parseInt(this.currentItem.css("marginLeft"),10)||0,top:parseInt(this.currentItem.css("marginTop"),10)||0};},_cacheHelperProportions:function _cacheHelperProportions(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()};},_setContainment:function _setContainment(){var ce,co,over,o=this.options;if(o.containment==="parent"){o.containment=this.helper[0].parentNode;}if(o.containment==="document"||o.containment==="window"){this.containment=[0-this.offset.relative.left-this.offset.parent.left,0-this.offset.relative.top-this.offset.parent.top,o.containment==="document"?this.document.width():this.window.width()-this.helperProportions.width-this.margins.left,(o.containment==="document"?this.document.width():this.window.height()||this.document[0].body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];}if(!/^(document|window|parent)$/.test(o.containment)){ce=$(o.containment)[0];co=$(o.containment).offset();over=$(ce).css("overflow")!=="hidden";this.containment=[co.left+(parseInt($(ce).css("borderLeftWidth"),10)||0)+(parseInt($(ce).css("paddingLeft"),10)||0)-this.margins.left,co.top+(parseInt($(ce).css("borderTopWidth"),10)||0)+(parseInt($(ce).css("paddingTop"),10)||0)-this.margins.top,co.left+(over?Math.max(ce.scrollWidth,ce.offsetWidth):ce.offsetWidth)-(parseInt($(ce).css("borderLeftWidth"),10)||0)-(parseInt($(ce).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left,co.top+(over?Math.max(ce.scrollHeight,ce.offsetHeight):ce.offsetHeight)-(parseInt($(ce).css("borderTopWidth"),10)||0)-(parseInt($(ce).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top];}},_convertPositionTo:function _convertPositionTo(d,pos){if(!pos){pos=this.position;}var mod=d==="absolute"?1:-1,scroll=this.cssPosition==="absolute"&&!(this.scrollParent[0]!==this.document[0]&&$.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,scrollIsRootNode=/(html|body)/i.test(scroll[0].tagName);return{top:pos.top+// The absolute mouse position
this.offset.relative.top*mod+// Only for relative positioned nodes: Relative offset from element to offset parent
this.offset.parent.top*mod-// The offsetParent's offset without borders (offset + border)
(this.cssPosition==="fixed"?-this.scrollParent.scrollTop():scrollIsRootNode?0:scroll.scrollTop())*mod,left:pos.left+// The absolute mouse position
this.offset.relative.left*mod+// Only for relative positioned nodes: Relative offset from element to offset parent
this.offset.parent.left*mod-// The offsetParent's offset without borders (offset + border)
(this.cssPosition==="fixed"?-this.scrollParent.scrollLeft():scrollIsRootNode?0:scroll.scrollLeft())*mod};},_generatePosition:function _generatePosition(event){var top,left,o=this.options,pageX=event.pageX,pageY=event.pageY,scroll=this.cssPosition==="absolute"&&!(this.scrollParent[0]!==this.document[0]&&$.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,scrollIsRootNode=/(html|body)/i.test(scroll[0].tagName);// This is another very weird special case that only happens for relative elements:
// 1. If the css position is relative
// 2. and the scroll parent is the document or similar to the offset parent
// we have to refresh the relative offset during the scroll so there are no jumps
if(this.cssPosition==="relative"&&!(this.scrollParent[0]!==this.document[0]&&this.scrollParent[0]!==this.offsetParent[0])){this.offset.relative=this._getRelativeOffset();}/*
		 * - Position constraining -
		 * Constrain the position to a mix of grid, containment.
		 */if(this.originalPosition){//If we are not dragging yet, we won't check for options
if(this.containment){if(event.pageX-this.offset.click.left<this.containment[0]){pageX=this.containment[0]+this.offset.click.left;}if(event.pageY-this.offset.click.top<this.containment[1]){pageY=this.containment[1]+this.offset.click.top;}if(event.pageX-this.offset.click.left>this.containment[2]){pageX=this.containment[2]+this.offset.click.left;}if(event.pageY-this.offset.click.top>this.containment[3]){pageY=this.containment[3]+this.offset.click.top;}}if(o.grid){top=this.originalPageY+Math.round((pageY-this.originalPageY)/o.grid[1])*o.grid[1];pageY=this.containment?top-this.offset.click.top>=this.containment[1]&&top-this.offset.click.top<=this.containment[3]?top:top-this.offset.click.top>=this.containment[1]?top-o.grid[1]:top+o.grid[1]:top;left=this.originalPageX+Math.round((pageX-this.originalPageX)/o.grid[0])*o.grid[0];pageX=this.containment?left-this.offset.click.left>=this.containment[0]&&left-this.offset.click.left<=this.containment[2]?left:left-this.offset.click.left>=this.containment[0]?left-o.grid[0]:left+o.grid[0]:left;}}return{top:pageY-// The absolute mouse position
this.offset.click.top-// Click offset (relative to the element)
this.offset.relative.top-// Only for relative positioned nodes: Relative offset from element to offset parent
this.offset.parent.top+(// The offsetParent's offset without borders (offset + border)
this.cssPosition==="fixed"?-this.scrollParent.scrollTop():scrollIsRootNode?0:scroll.scrollTop()),left:pageX-// The absolute mouse position
this.offset.click.left-// Click offset (relative to the element)
this.offset.relative.left-// Only for relative positioned nodes: Relative offset from element to offset parent
this.offset.parent.left+(// The offsetParent's offset without borders (offset + border)
this.cssPosition==="fixed"?-this.scrollParent.scrollLeft():scrollIsRootNode?0:scroll.scrollLeft())};},_rearrange:function _rearrange(event,i,a,hardRefresh){a?a[0].appendChild(this.placeholder[0]):i.item[0].parentNode.insertBefore(this.placeholder[0],this.direction==="down"?i.item[0]:i.item[0].nextSibling);//Various things done here to improve the performance:
// 1. we create a setTimeout, that calls refreshPositions
// 2. on the instance, we have a counter variable, that get's higher after every append
// 3. on the local scope, we copy the counter variable, and check in the timeout, if it's still the same
// 4. this lets only the last addition to the timeout stack through
this.counter=this.counter?++this.counter:1;var counter=this.counter;this._delay(function(){if(counter===this.counter){this.refreshPositions(!hardRefresh);//Precompute after each DOM insertion, NOT on mousemove
}});},_clear:function _clear(event,noPropagation){this.reverting=false;// We delay all events that have to be triggered to after the point where the placeholder has been removed and
// everything else normalized again
var i,delayedTriggers=[];// We first have to update the dom position of the actual currentItem
// Note: don't do it if the current item is already removed (by a user), or it gets reappended (see #4088)
if(!this._noFinalSort&&this.currentItem.parent().length){this.placeholder.before(this.currentItem);}this._noFinalSort=null;if(this.helper[0]===this.currentItem[0]){for(i in this._storedCSS){if(this._storedCSS[i]==="auto"||this._storedCSS[i]==="static"){this._storedCSS[i]="";}}this.currentItem.css(this._storedCSS).removeClass("ui-sortable-helper");}else{this.currentItem.show();}if(this.fromOutside&&!noPropagation){delayedTriggers.push(function(event){this._trigger("receive",event,this._uiHash(this.fromOutside));});}if((this.fromOutside||this.domPosition.prev!==this.currentItem.prev().not(".ui-sortable-helper")[0]||this.domPosition.parent!==this.currentItem.parent()[0])&&!noPropagation){delayedTriggers.push(function(event){this._trigger("update",event,this._uiHash());});//Trigger update callback if the DOM position has changed
}// Check if the items Container has Changed and trigger appropriate
// events.
if(this!==this.currentContainer){if(!noPropagation){delayedTriggers.push(function(event){this._trigger("remove",event,this._uiHash());});delayedTriggers.push(function(c){return function(event){c._trigger("receive",event,this._uiHash(this));};}.call(this,this.currentContainer));delayedTriggers.push(function(c){return function(event){c._trigger("update",event,this._uiHash(this));};}.call(this,this.currentContainer));}}//Post events to containers
function delayEvent(type,instance,container){return function(event){container._trigger(type,event,instance._uiHash(instance));};}for(i=this.containers.length-1;i>=0;i--){if(!noPropagation){delayedTriggers.push(delayEvent("deactivate",this,this.containers[i]));}if(this.containers[i].containerCache.over){delayedTriggers.push(delayEvent("out",this,this.containers[i]));this.containers[i].containerCache.over=0;}}//Do what was originally in plugins
if(this.storedCursor){this.document.find("body").css("cursor",this.storedCursor);this.storedStylesheet.remove();}if(this._storedOpacity){this.helper.css("opacity",this._storedOpacity);}if(this._storedZIndex){this.helper.css("zIndex",this._storedZIndex==="auto"?"":this._storedZIndex);}this.dragging=false;if(!noPropagation){this._trigger("beforeStop",event,this._uiHash());}//$(this.placeholder[0]).remove(); would have been the jQuery way - unfortunately, it unbinds ALL events from the original node!
this.placeholder[0].parentNode.removeChild(this.placeholder[0]);if(!this.cancelHelperRemoval){if(this.helper[0]!==this.currentItem[0]){this.helper.remove();}this.helper=null;}if(!noPropagation){for(i=0;i<delayedTriggers.length;i++){delayedTriggers[i].call(this,event);}//Trigger all delayed events
this._trigger("stop",event,this._uiHash());}this.fromOutside=false;return!this.cancelHelperRemoval;},_trigger:function _trigger(){if($.Widget.prototype._trigger.apply(this,arguments)===false){this.cancel();}},_uiHash:function _uiHash(_inst){var inst=_inst||this;return{helper:inst.helper,placeholder:inst.placeholder||$([]),position:inst.position,originalPosition:inst.originalPosition,offset:inst.positionAbs,item:inst.currentItem,sender:_inst?_inst.element:null};}});/*!
 * jQuery UI Accordion 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/accordion/
 */var accordion=$.widget("ui.accordion",{version:"1.11.4",options:{active:0,animate:{},collapsible:false,event:"click",header:"> li > :first-child,> :not(li):even",heightStyle:"auto",icons:{activeHeader:"ui-icon-triangle-1-s",header:"ui-icon-triangle-1-e"},// callbacks
activate:null,beforeActivate:null},hideProps:{borderTopWidth:"hide",borderBottomWidth:"hide",paddingTop:"hide",paddingBottom:"hide",height:"hide"},showProps:{borderTopWidth:"show",borderBottomWidth:"show",paddingTop:"show",paddingBottom:"show",height:"show"},_create:function _create(){var options=this.options;this.prevShow=this.prevHide=$();this.element.addClass("ui-accordion ui-widget ui-helper-reset")// ARIA
.attr("role","tablist");// don't allow collapsible: false and active: false / null
if(!options.collapsible&&(options.active===false||options.active==null)){options.active=0;}this._processPanels();// handle negative values
if(options.active<0){options.active+=this.headers.length;}this._refresh();},_getCreateEventData:function _getCreateEventData(){return{header:this.active,panel:!this.active.length?$():this.active.next()};},_createIcons:function _createIcons(){var icons=this.options.icons;if(icons){$("<span>").addClass("ui-accordion-header-icon ui-icon "+icons.header).prependTo(this.headers);this.active.children(".ui-accordion-header-icon").removeClass(icons.header).addClass(icons.activeHeader);this.headers.addClass("ui-accordion-icons");}},_destroyIcons:function _destroyIcons(){this.headers.removeClass("ui-accordion-icons").children(".ui-accordion-header-icon").remove();},_destroy:function _destroy(){var contents;// clean up main element
this.element.removeClass("ui-accordion ui-widget ui-helper-reset").removeAttr("role");// clean up headers
this.headers.removeClass("ui-accordion-header ui-accordion-header-active ui-state-default "+"ui-corner-all ui-state-active ui-state-disabled ui-corner-top").removeAttr("role").removeAttr("aria-expanded").removeAttr("aria-selected").removeAttr("aria-controls").removeAttr("tabIndex").removeUniqueId();this._destroyIcons();// clean up content panels
contents=this.headers.next().removeClass("ui-helper-reset ui-widget-content ui-corner-bottom "+"ui-accordion-content ui-accordion-content-active ui-state-disabled").css("display","").removeAttr("role").removeAttr("aria-hidden").removeAttr("aria-labelledby").removeUniqueId();if(this.options.heightStyle!=="content"){contents.css("height","");}},_setOption:function _setOption(key,value){if(key==="active"){// _activate() will handle invalid values and update this.options
this._activate(value);return;}if(key==="event"){if(this.options.event){this._off(this.headers,this.options.event);}this._setupEvents(value);}this._super(key,value);// setting collapsible: false while collapsed; open first panel
if(key==="collapsible"&&!value&&this.options.active===false){this._activate(0);}if(key==="icons"){this._destroyIcons();if(value){this._createIcons();}}// #5332 - opacity doesn't cascade to positioned elements in IE
// so we need to add the disabled class to the headers and panels
if(key==="disabled"){this.element.toggleClass("ui-state-disabled",!!value).attr("aria-disabled",value);this.headers.add(this.headers.next()).toggleClass("ui-state-disabled",!!value);}},_keydown:function _keydown(event){if(event.altKey||event.ctrlKey){return;}var keyCode=$.ui.keyCode,length=this.headers.length,currentIndex=this.headers.index(event.target),toFocus=false;switch(event.keyCode){case keyCode.RIGHT:case keyCode.DOWN:toFocus=this.headers[(currentIndex+1)%length];break;case keyCode.LEFT:case keyCode.UP:toFocus=this.headers[(currentIndex-1+length)%length];break;case keyCode.SPACE:case keyCode.ENTER:this._eventHandler(event);break;case keyCode.HOME:toFocus=this.headers[0];break;case keyCode.END:toFocus=this.headers[length-1];break;}if(toFocus){$(event.target).attr("tabIndex",-1);$(toFocus).attr("tabIndex",0);toFocus.focus();event.preventDefault();}},_panelKeyDown:function _panelKeyDown(event){if(event.keyCode===$.ui.keyCode.UP&&event.ctrlKey){$(event.currentTarget).prev().focus();}},refresh:function refresh(){var options=this.options;this._processPanels();// was collapsed or no panel
if(options.active===false&&options.collapsible===true||!this.headers.length){options.active=false;this.active=$();// active false only when collapsible is true
}else if(options.active===false){this._activate(0);// was active, but active panel is gone
}else if(this.active.length&&!$.contains(this.element[0],this.active[0])){// all remaining panel are disabled
if(this.headers.length===this.headers.find(".ui-state-disabled").length){options.active=false;this.active=$();// activate previous panel
}else{this._activate(Math.max(0,options.active-1));}// was active, active panel still exists
}else{// make sure active index is correct
options.active=this.headers.index(this.active);}this._destroyIcons();this._refresh();},_processPanels:function _processPanels(){var prevHeaders=this.headers,prevPanels=this.panels;this.headers=this.element.find(this.options.header).addClass("ui-accordion-header ui-state-default ui-corner-all");this.panels=this.headers.next().addClass("ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom").filter(":not(.ui-accordion-content-active)").hide();// Avoid memory leaks (#10056)
if(prevPanels){this._off(prevHeaders.not(this.headers));this._off(prevPanels.not(this.panels));}},_refresh:function _refresh(){var maxHeight,options=this.options,heightStyle=options.heightStyle,parent=this.element.parent();this.active=this._findActive(options.active).addClass("ui-accordion-header-active ui-state-active ui-corner-top").removeClass("ui-corner-all");this.active.next().addClass("ui-accordion-content-active").show();this.headers.attr("role","tab").each(function(){var header=$(this),headerId=header.uniqueId().attr("id"),panel=header.next(),panelId=panel.uniqueId().attr("id");header.attr("aria-controls",panelId);panel.attr("aria-labelledby",headerId);}).next().attr("role","tabpanel");this.headers.not(this.active).attr({"aria-selected":"false","aria-expanded":"false",tabIndex:-1}).next().attr({"aria-hidden":"true"}).hide();// make sure at least one header is in the tab order
if(!this.active.length){this.headers.eq(0).attr("tabIndex",0);}else{this.active.attr({"aria-selected":"true","aria-expanded":"true",tabIndex:0}).next().attr({"aria-hidden":"false"});}this._createIcons();this._setupEvents(options.event);if(heightStyle==="fill"){maxHeight=parent.height();this.element.siblings(":visible").each(function(){var elem=$(this),position=elem.css("position");if(position==="absolute"||position==="fixed"){return;}maxHeight-=elem.outerHeight(true);});this.headers.each(function(){maxHeight-=$(this).outerHeight(true);});this.headers.next().each(function(){$(this).height(Math.max(0,maxHeight-$(this).innerHeight()+$(this).height()));}).css("overflow","auto");}else if(heightStyle==="auto"){maxHeight=0;this.headers.next().each(function(){maxHeight=Math.max(maxHeight,$(this).css("height","").height());}).height(maxHeight);}},_activate:function _activate(index){var active=this._findActive(index)[0];// trying to activate the already active panel
if(active===this.active[0]){return;}// trying to collapse, simulate a click on the currently active header
active=active||this.active[0];this._eventHandler({target:active,currentTarget:active,preventDefault:$.noop});},_findActive:function _findActive(selector){return typeof selector==="number"?this.headers.eq(selector):$();},_setupEvents:function _setupEvents(event){var events={keydown:"_keydown"};if(event){$.each(event.split(" "),function(index,eventName){events[eventName]="_eventHandler";});}this._off(this.headers.add(this.headers.next()));this._on(this.headers,events);this._on(this.headers.next(),{keydown:"_panelKeyDown"});this._hoverable(this.headers);this._focusable(this.headers);},_eventHandler:function _eventHandler(event){var options=this.options,active=this.active,clicked=$(event.currentTarget),clickedIsActive=clicked[0]===active[0],collapsing=clickedIsActive&&options.collapsible,toShow=collapsing?$():clicked.next(),toHide=active.next(),eventData={oldHeader:active,oldPanel:toHide,newHeader:collapsing?$():clicked,newPanel:toShow};event.preventDefault();if(// click on active header, but not collapsible
clickedIsActive&&!options.collapsible||// allow canceling activation
this._trigger("beforeActivate",event,eventData)===false){return;}options.active=collapsing?false:this.headers.index(clicked);// when the call to ._toggle() comes after the class changes
// it causes a very odd bug in IE 8 (see #6720)
this.active=clickedIsActive?$():clicked;this._toggle(eventData);// switch classes
// corner classes on the previously active header stay after the animation
active.removeClass("ui-accordion-header-active ui-state-active");if(options.icons){active.children(".ui-accordion-header-icon").removeClass(options.icons.activeHeader).addClass(options.icons.header);}if(!clickedIsActive){clicked.removeClass("ui-corner-all").addClass("ui-accordion-header-active ui-state-active ui-corner-top");if(options.icons){clicked.children(".ui-accordion-header-icon").removeClass(options.icons.header).addClass(options.icons.activeHeader);}clicked.next().addClass("ui-accordion-content-active");}},_toggle:function _toggle(data){var toShow=data.newPanel,toHide=this.prevShow.length?this.prevShow:data.oldPanel;// handle activating a panel during the animation for another activation
this.prevShow.add(this.prevHide).stop(true,true);this.prevShow=toShow;this.prevHide=toHide;if(this.options.animate){this._animate(toShow,toHide,data);}else{toHide.hide();toShow.show();this._toggleComplete(data);}toHide.attr({"aria-hidden":"true"});toHide.prev().attr({"aria-selected":"false","aria-expanded":"false"});// if we're switching panels, remove the old header from the tab order
// if we're opening from collapsed state, remove the previous header from the tab order
// if we're collapsing, then keep the collapsing header in the tab order
if(toShow.length&&toHide.length){toHide.prev().attr({"tabIndex":-1,"aria-expanded":"false"});}else if(toShow.length){this.headers.filter(function(){return parseInt($(this).attr("tabIndex"),10)===0;}).attr("tabIndex",-1);}toShow.attr("aria-hidden","false").prev().attr({"aria-selected":"true","aria-expanded":"true",tabIndex:0});},_animate:function _animate(toShow,toHide,data){var total,easing,duration,that=this,adjust=0,boxSizing=toShow.css("box-sizing"),down=toShow.length&&(!toHide.length||toShow.index()<toHide.index()),animate=this.options.animate||{},options=down&&animate.down||animate,complete=function complete(){that._toggleComplete(data);};if(typeof options==="number"){duration=options;}if(typeof options==="string"){easing=options;}// fall back from options to animation in case of partial down settings
easing=easing||options.easing||animate.easing;duration=duration||options.duration||animate.duration;if(!toHide.length){return toShow.animate(this.showProps,duration,easing,complete);}if(!toShow.length){return toHide.animate(this.hideProps,duration,easing,complete);}total=toShow.show().outerHeight();toHide.animate(this.hideProps,{duration:duration,easing:easing,step:function step(now,fx){fx.now=Math.round(now);}});toShow.hide().animate(this.showProps,{duration:duration,easing:easing,complete:complete,step:function step(now,fx){fx.now=Math.round(now);if(fx.prop!=="height"){if(boxSizing==="content-box"){adjust+=fx.now;}}else if(that.options.heightStyle!=="content"){fx.now=Math.round(total-toHide.outerHeight()-adjust);adjust=0;}}});},_toggleComplete:function _toggleComplete(data){var toHide=data.oldPanel;toHide.removeClass("ui-accordion-content-active").prev().removeClass("ui-corner-top").addClass("ui-corner-all");// Work around for rendering bug in IE (#5421)
if(toHide.length){toHide.parent()[0].className=toHide.parent()[0].className;}this._trigger("activate",null,data);}});/*!
 * jQuery UI Menu 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/menu/
 */var menu=$.widget("ui.menu",{version:"1.11.4",defaultElement:"<ul>",delay:300,options:{icons:{submenu:"ui-icon-carat-1-e"},items:"> *",menus:"ul",position:{my:"left-1 top",at:"right top"},role:"menu",// callbacks
blur:null,focus:null,select:null},_create:function _create(){this.activeMenu=this.element;// Flag used to prevent firing of the click handler
// as the event bubbles up through nested menus
this.mouseHandled=false;this.element.uniqueId().addClass("ui-menu ui-widget ui-widget-content").toggleClass("ui-menu-icons",!!this.element.find(".ui-icon").length).attr({role:this.options.role,tabIndex:0});if(this.options.disabled){this.element.addClass("ui-state-disabled").attr("aria-disabled","true");}this._on({// Prevent focus from sticking to links inside menu after clicking
// them (focus should always stay on UL during navigation).
"mousedown .ui-menu-item":function mousedownUiMenuItem(event){event.preventDefault();},"click .ui-menu-item":function clickUiMenuItem(event){var target=$(event.target);if(!this.mouseHandled&&target.not(".ui-state-disabled").length){this.select(event);// Only set the mouseHandled flag if the event will bubble, see #9469.
if(!event.isPropagationStopped()){this.mouseHandled=true;}// Open submenu on click
if(target.has(".ui-menu").length){this.expand(event);}else if(!this.element.is(":focus")&&$(this.document[0].activeElement).closest(".ui-menu").length){// Redirect focus to the menu
this.element.trigger("focus",[true]);// If the active item is on the top level, let it stay active.
// Otherwise, blur the active item since it is no longer visible.
if(this.active&&this.active.parents(".ui-menu").length===1){clearTimeout(this.timer);}}}},"mouseenter .ui-menu-item":function mouseenterUiMenuItem(event){// Ignore mouse events while typeahead is active, see #10458.
// Prevents focusing the wrong item when typeahead causes a scroll while the mouse
// is over an item in the menu
if(this.previousFilter){return;}var target=$(event.currentTarget);// Remove ui-state-active class from siblings of the newly focused menu item
// to avoid a jump caused by adjacent elements both having a class with a border
target.siblings(".ui-state-active").removeClass("ui-state-active");this.focus(event,target);},mouseleave:"collapseAll","mouseleave .ui-menu":"collapseAll",focus:function focus(event,keepActiveItem){// If there's already an active item, keep it active
// If not, activate the first item
var item=this.active||this.element.find(this.options.items).eq(0);if(!keepActiveItem){this.focus(event,item);}},blur:function blur(event){this._delay(function(){if(!$.contains(this.element[0],this.document[0].activeElement)){this.collapseAll(event);}});},keydown:"_keydown"});this.refresh();// Clicks outside of a menu collapse any open menus
this._on(this.document,{click:function click(event){if(this._closeOnDocumentClick(event)){this.collapseAll(event);}// Reset the mouseHandled flag
this.mouseHandled=false;}});},_destroy:function _destroy(){// Destroy (sub)menus
this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeClass("ui-menu ui-widget ui-widget-content ui-menu-icons ui-front").removeAttr("role").removeAttr("tabIndex").removeAttr("aria-labelledby").removeAttr("aria-expanded").removeAttr("aria-hidden").removeAttr("aria-disabled").removeUniqueId().show();// Destroy menu items
this.element.find(".ui-menu-item").removeClass("ui-menu-item").removeAttr("role").removeAttr("aria-disabled").removeUniqueId().removeClass("ui-state-hover").removeAttr("tabIndex").removeAttr("role").removeAttr("aria-haspopup").children().each(function(){var elem=$(this);if(elem.data("ui-menu-submenu-carat")){elem.remove();}});// Destroy menu dividers
this.element.find(".ui-menu-divider").removeClass("ui-menu-divider ui-widget-content");},_keydown:function _keydown(event){var match,prev,character,skip,preventDefault=true;switch(event.keyCode){case $.ui.keyCode.PAGE_UP:this.previousPage(event);break;case $.ui.keyCode.PAGE_DOWN:this.nextPage(event);break;case $.ui.keyCode.HOME:this._move("first","first",event);break;case $.ui.keyCode.END:this._move("last","last",event);break;case $.ui.keyCode.UP:this.previous(event);break;case $.ui.keyCode.DOWN:this.next(event);break;case $.ui.keyCode.LEFT:this.collapse(event);break;case $.ui.keyCode.RIGHT:if(this.active&&!this.active.is(".ui-state-disabled")){this.expand(event);}break;case $.ui.keyCode.ENTER:case $.ui.keyCode.SPACE:this._activate(event);break;case $.ui.keyCode.ESCAPE:this.collapse(event);break;default:preventDefault=false;prev=this.previousFilter||"";character=String.fromCharCode(event.keyCode);skip=false;clearTimeout(this.filterTimer);if(character===prev){skip=true;}else{character=prev+character;}match=this._filterMenuItems(character);match=skip&&match.index(this.active.next())!==-1?this.active.nextAll(".ui-menu-item"):match;// If no matches on the current filter, reset to the last character pressed
// to move down the menu to the first item that starts with that character
if(!match.length){character=String.fromCharCode(event.keyCode);match=this._filterMenuItems(character);}if(match.length){this.focus(event,match);this.previousFilter=character;this.filterTimer=this._delay(function(){delete this.previousFilter;},1000);}else{delete this.previousFilter;}}if(preventDefault){event.preventDefault();}},_activate:function _activate(event){if(!this.active.is(".ui-state-disabled")){if(this.active.is("[aria-haspopup='true']")){this.expand(event);}else{this.select(event);}}},refresh:function refresh(){var menus,items,that=this,icon=this.options.icons.submenu,submenus=this.element.find(this.options.menus);this.element.toggleClass("ui-menu-icons",!!this.element.find(".ui-icon").length);// Initialize nested menus
submenus.filter(":not(.ui-menu)").addClass("ui-menu ui-widget ui-widget-content ui-front").hide().attr({role:this.options.role,"aria-hidden":"true","aria-expanded":"false"}).each(function(){var menu=$(this),item=menu.parent(),submenuCarat=$("<span>").addClass("ui-menu-icon ui-icon "+icon).data("ui-menu-submenu-carat",true);item.attr("aria-haspopup","true").prepend(submenuCarat);menu.attr("aria-labelledby",item.attr("id"));});menus=submenus.add(this.element);items=menus.find(this.options.items);// Initialize menu-items containing spaces and/or dashes only as dividers
items.not(".ui-menu-item").each(function(){var item=$(this);if(that._isDivider(item)){item.addClass("ui-widget-content ui-menu-divider");}});// Don't refresh list items that are already adapted
items.not(".ui-menu-item, .ui-menu-divider").addClass("ui-menu-item").uniqueId().attr({tabIndex:-1,role:this._itemRole()});// Add aria-disabled attribute to any disabled menu item
items.filter(".ui-state-disabled").attr("aria-disabled","true");// If the active item has been removed, blur the menu
if(this.active&&!$.contains(this.element[0],this.active[0])){this.blur();}},_itemRole:function _itemRole(){return{menu:"menuitem",listbox:"option"}[this.options.role];},_setOption:function _setOption(key,value){if(key==="icons"){this.element.find(".ui-menu-icon").removeClass(this.options.icons.submenu).addClass(value.submenu);}if(key==="disabled"){this.element.toggleClass("ui-state-disabled",!!value).attr("aria-disabled",value);}this._super(key,value);},focus:function focus(event,item){var nested,focused;this.blur(event,event&&event.type==="focus");this._scrollIntoView(item);this.active=item.first();focused=this.active.addClass("ui-state-focus").removeClass("ui-state-active");// Only update aria-activedescendant if there's a role
// otherwise we assume focus is managed elsewhere
if(this.options.role){this.element.attr("aria-activedescendant",focused.attr("id"));}// Highlight active parent menu item, if any
this.active.parent().closest(".ui-menu-item").addClass("ui-state-active");if(event&&event.type==="keydown"){this._close();}else{this.timer=this._delay(function(){this._close();},this.delay);}nested=item.children(".ui-menu");if(nested.length&&event&&/^mouse/.test(event.type)){this._startOpening(nested);}this.activeMenu=item.parent();this._trigger("focus",event,{item:item});},_scrollIntoView:function _scrollIntoView(item){var borderTop,paddingTop,offset,scroll,elementHeight,itemHeight;if(this._hasScroll()){borderTop=parseFloat($.css(this.activeMenu[0],"borderTopWidth"))||0;paddingTop=parseFloat($.css(this.activeMenu[0],"paddingTop"))||0;offset=item.offset().top-this.activeMenu.offset().top-borderTop-paddingTop;scroll=this.activeMenu.scrollTop();elementHeight=this.activeMenu.height();itemHeight=item.outerHeight();if(offset<0){this.activeMenu.scrollTop(scroll+offset);}else if(offset+itemHeight>elementHeight){this.activeMenu.scrollTop(scroll+offset-elementHeight+itemHeight);}}},blur:function blur(event,fromFocus){if(!fromFocus){clearTimeout(this.timer);}if(!this.active){return;}this.active.removeClass("ui-state-focus");this.active=null;this._trigger("blur",event,{item:this.active});},_startOpening:function _startOpening(submenu){clearTimeout(this.timer);// Don't open if already open fixes a Firefox bug that caused a .5 pixel
// shift in the submenu position when mousing over the carat icon
if(submenu.attr("aria-hidden")!=="true"){return;}this.timer=this._delay(function(){this._close();this._open(submenu);},this.delay);},_open:function _open(submenu){var position=$.extend({of:this.active},this.options.position);clearTimeout(this.timer);this.element.find(".ui-menu").not(submenu.parents(".ui-menu")).hide().attr("aria-hidden","true");submenu.show().removeAttr("aria-hidden").attr("aria-expanded","true").position(position);},collapseAll:function collapseAll(event,all){clearTimeout(this.timer);this.timer=this._delay(function(){// If we were passed an event, look for the submenu that contains the event
var currentMenu=all?this.element:$(event&&event.target).closest(this.element.find(".ui-menu"));// If we found no valid submenu ancestor, use the main menu to close all sub menus anyway
if(!currentMenu.length){currentMenu=this.element;}this._close(currentMenu);this.blur(event);this.activeMenu=currentMenu;},this.delay);},// With no arguments, closes the currently active menu - if nothing is active
// it closes all menus.  If passed an argument, it will search for menus BELOW
_close:function _close(startMenu){if(!startMenu){startMenu=this.active?this.active.parent():this.element;}startMenu.find(".ui-menu").hide().attr("aria-hidden","true").attr("aria-expanded","false").end().find(".ui-state-active").not(".ui-state-focus").removeClass("ui-state-active");},_closeOnDocumentClick:function _closeOnDocumentClick(event){return!$(event.target).closest(".ui-menu").length;},_isDivider:function _isDivider(item){// Match hyphen, em dash, en dash
return!/[^\-\u2014\u2013\s]/.test(item.text());},collapse:function collapse(event){var newItem=this.active&&this.active.parent().closest(".ui-menu-item",this.element);if(newItem&&newItem.length){this._close();this.focus(event,newItem);}},expand:function expand(event){var newItem=this.active&&this.active.children(".ui-menu ").find(this.options.items).first();if(newItem&&newItem.length){this._open(newItem.parent());// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
this._delay(function(){this.focus(event,newItem);});}},next:function next(event){this._move("next","first",event);},previous:function previous(event){this._move("prev","last",event);},isFirstItem:function isFirstItem(){return this.active&&!this.active.prevAll(".ui-menu-item").length;},isLastItem:function isLastItem(){return this.active&&!this.active.nextAll(".ui-menu-item").length;},_move:function _move(direction,filter,event){var next;if(this.active){if(direction==="first"||direction==="last"){next=this.active[direction==="first"?"prevAll":"nextAll"](".ui-menu-item").eq(-1);}else{next=this.active[direction+"All"](".ui-menu-item").eq(0);}}if(!next||!next.length||!this.active){next=this.activeMenu.find(this.options.items)[filter]();}this.focus(event,next);},nextPage:function nextPage(event){var item,base,height;if(!this.active){this.next(event);return;}if(this.isLastItem()){return;}if(this._hasScroll()){base=this.active.offset().top;height=this.element.height();this.active.nextAll(".ui-menu-item").each(function(){item=$(this);return item.offset().top-base-height<0;});this.focus(event,item);}else{this.focus(event,this.activeMenu.find(this.options.items)[!this.active?"first":"last"]());}},previousPage:function previousPage(event){var item,base,height;if(!this.active){this.next(event);return;}if(this.isFirstItem()){return;}if(this._hasScroll()){base=this.active.offset().top;height=this.element.height();this.active.prevAll(".ui-menu-item").each(function(){item=$(this);return item.offset().top-base+height>0;});this.focus(event,item);}else{this.focus(event,this.activeMenu.find(this.options.items).first());}},_hasScroll:function _hasScroll(){return this.element.outerHeight()<this.element.prop("scrollHeight");},select:function select(event){// TODO: It should never be possible to not have an active item at this
// point, but the tests don't trigger mouseenter before click.
this.active=this.active||$(event.target).closest(".ui-menu-item");var ui={item:this.active};if(!this.active.has(".ui-menu").length){this.collapseAll(event,true);}this._trigger("select",event,ui);},_filterMenuItems:function _filterMenuItems(character){var escapedCharacter=character.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&"),regex=new RegExp("^"+escapedCharacter,"i");return this.activeMenu.find(this.options.items)// Only match on items, not dividers or other content (#10571)
.filter(".ui-menu-item").filter(function(){return regex.test($.trim($(this).text()));});}});/*!
 * jQuery UI Autocomplete 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/autocomplete/
 */$.widget("ui.autocomplete",{version:"1.11.4",defaultElement:"<input>",options:{appendTo:null,autoFocus:false,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null,// callbacks
change:null,close:null,focus:null,open:null,response:null,search:null,select:null},requestIndex:0,pending:0,_create:function _create(){// Some browsers only repeat keydown events, not keypress events,
// so we use the suppressKeyPress flag to determine if we've already
// handled the keydown event. #7269
// Unfortunately the code for & in keypress is the same as the up arrow,
// so we use the suppressKeyPressRepeat flag to avoid handling keypress
// events when we know the keydown event was used to modify the
// search term. #7799
var suppressKeyPress,suppressKeyPressRepeat,suppressInput,nodeName=this.element[0].nodeName.toLowerCase(),isTextarea=nodeName==="textarea",isInput=nodeName==="input";this.isMultiLine=// Textareas are always multi-line
isTextarea?true:// Inputs are always single-line, even if inside a contentEditable element
// IE also treats inputs as contentEditable
isInput?false:// All other element types are determined by whether or not they're contentEditable
this.element.prop("isContentEditable");this.valueMethod=this.element[isTextarea||isInput?"val":"text"];this.isNewMenu=true;this.element.addClass("ui-autocomplete-input").attr("autocomplete","off");this._on(this.element,{keydown:function keydown(event){if(this.element.prop("readOnly")){suppressKeyPress=true;suppressInput=true;suppressKeyPressRepeat=true;return;}suppressKeyPress=false;suppressInput=false;suppressKeyPressRepeat=false;var keyCode=$.ui.keyCode;switch(event.keyCode){case keyCode.PAGE_UP:suppressKeyPress=true;this._move("previousPage",event);break;case keyCode.PAGE_DOWN:suppressKeyPress=true;this._move("nextPage",event);break;case keyCode.UP:suppressKeyPress=true;this._keyEvent("previous",event);break;case keyCode.DOWN:suppressKeyPress=true;this._keyEvent("next",event);break;case keyCode.ENTER:// when menu is open and has focus
if(this.menu.active){// #6055 - Opera still allows the keypress to occur
// which causes forms to submit
suppressKeyPress=true;event.preventDefault();this.menu.select(event);}break;case keyCode.TAB:if(this.menu.active){this.menu.select(event);}break;case keyCode.ESCAPE:if(this.menu.element.is(":visible")){if(!this.isMultiLine){this._value(this.term);}this.close(event);// Different browsers have different default behavior for escape
// Single press can mean undo or clear
// Double press in IE means clear the whole form
event.preventDefault();}break;default:suppressKeyPressRepeat=true;// search timeout should be triggered before the input value is changed
this._searchTimeout(event);break;}},keypress:function keypress(event){if(suppressKeyPress){suppressKeyPress=false;if(!this.isMultiLine||this.menu.element.is(":visible")){event.preventDefault();}return;}if(suppressKeyPressRepeat){return;}// replicate some key handlers to allow them to repeat in Firefox and Opera
var keyCode=$.ui.keyCode;switch(event.keyCode){case keyCode.PAGE_UP:this._move("previousPage",event);break;case keyCode.PAGE_DOWN:this._move("nextPage",event);break;case keyCode.UP:this._keyEvent("previous",event);break;case keyCode.DOWN:this._keyEvent("next",event);break;}},input:function input(event){if(suppressInput){suppressInput=false;event.preventDefault();return;}this._searchTimeout(event);},focus:function focus(){this.selectedItem=null;this.previous=this._value();},blur:function blur(event){if(this.cancelBlur){delete this.cancelBlur;return;}clearTimeout(this.searching);this.close(event);this._change(event);}});this._initSource();this.menu=$("<ul>").addClass("ui-autocomplete ui-front").appendTo(this._appendTo()).menu({// disable ARIA support, the live region takes care of that
role:null}).hide().menu("instance");this._on(this.menu.element,{mousedown:function mousedown(event){// prevent moving focus out of the text field
event.preventDefault();// IE doesn't prevent moving focus even with event.preventDefault()
// so we set a flag to know when we should ignore the blur event
this.cancelBlur=true;this._delay(function(){delete this.cancelBlur;});// clicking on the scrollbar causes focus to shift to the body
// but we can't detect a mouseup or a click immediately afterward
// so we have to track the next mousedown and close the menu if
// the user clicks somewhere outside of the autocomplete
var menuElement=this.menu.element[0];if(!$(event.target).closest(".ui-menu-item").length){this._delay(function(){var that=this;this.document.one("mousedown",function(event){if(event.target!==that.element[0]&&event.target!==menuElement&&!$.contains(menuElement,event.target)){that.close();}});});}},menufocus:function menufocus(event,ui){var label,item;// support: Firefox
// Prevent accidental activation of menu items in Firefox (#7024 #9118)
if(this.isNewMenu){this.isNewMenu=false;if(event.originalEvent&&/^mouse/.test(event.originalEvent.type)){this.menu.blur();this.document.one("mousemove",function(){$(event.target).trigger(event.originalEvent);});return;}}item=ui.item.data("ui-autocomplete-item");if(false!==this._trigger("focus",event,{item:item})){// use value to match what will end up in the input, if it was a key event
if(event.originalEvent&&/^key/.test(event.originalEvent.type)){this._value(item.value);}}// Announce the value in the liveRegion
label=ui.item.attr("aria-label")||item.value;if(label&&$.trim(label).length){this.liveRegion.children().hide();$("<div>").text(label).appendTo(this.liveRegion);}},menuselect:function menuselect(event,ui){var item=ui.item.data("ui-autocomplete-item"),previous=this.previous;// only trigger when focus was lost (click on menu)
if(this.element[0]!==this.document[0].activeElement){this.element.focus();this.previous=previous;// #6109 - IE triggers two focus events and the second
// is asynchronous, so we need to reset the previous
// term synchronously and asynchronously :-(
this._delay(function(){this.previous=previous;this.selectedItem=item;});}if(false!==this._trigger("select",event,{item:item})){this._value(item.value);}// reset the term after the select event
// this allows custom select handling to work properly
this.term=this._value();this.close(event);this.selectedItem=item;}});this.liveRegion=$("<span>",{role:"status","aria-live":"assertive","aria-relevant":"additions"}).addClass("ui-helper-hidden-accessible").appendTo(this.document[0].body);// turning off autocomplete prevents the browser from remembering the
// value when navigating through history, so we re-enable autocomplete
// if the page is unloaded before the widget is destroyed. #7790
this._on(this.window,{beforeunload:function beforeunload(){this.element.removeAttr("autocomplete");}});},_destroy:function _destroy(){clearTimeout(this.searching);this.element.removeClass("ui-autocomplete-input").removeAttr("autocomplete");this.menu.element.remove();this.liveRegion.remove();},_setOption:function _setOption(key,value){this._super(key,value);if(key==="source"){this._initSource();}if(key==="appendTo"){this.menu.element.appendTo(this._appendTo());}if(key==="disabled"&&value&&this.xhr){this.xhr.abort();}},_appendTo:function _appendTo(){var element=this.options.appendTo;if(element){element=element.jquery||element.nodeType?$(element):this.document.find(element).eq(0);}if(!element||!element[0]){element=this.element.closest(".ui-front");}if(!element.length){element=this.document[0].body;}return element;},_initSource:function _initSource(){var array,url,that=this;if($.isArray(this.options.source)){array=this.options.source;this.source=function(request,response){response($.ui.autocomplete.filter(array,request.term));};}else if(typeof this.options.source==="string"){url=this.options.source;this.source=function(request,response){if(that.xhr){that.xhr.abort();}that.xhr=$.ajax({url:url,data:request,dataType:"json",success:function success(data){response(data);},error:function error(){response([]);}});};}else{this.source=this.options.source;}},_searchTimeout:function _searchTimeout(event){clearTimeout(this.searching);this.searching=this._delay(function(){// Search if the value has changed, or if the user retypes the same value (see #7434)
var equalValues=this.term===this._value(),menuVisible=this.menu.element.is(":visible"),modifierKey=event.altKey||event.ctrlKey||event.metaKey||event.shiftKey;if(!equalValues||equalValues&&!menuVisible&&!modifierKey){this.selectedItem=null;this.search(null,event);}},this.options.delay);},search:function search(value,event){value=value!=null?value:this._value();// always save the actual value, not the one passed as an argument
this.term=this._value();if(value.length<this.options.minLength){return this.close(event);}if(this._trigger("search",event)===false){return;}return this._search(value);},_search:function _search(value){this.pending++;this.element.addClass("ui-autocomplete-loading");this.cancelSearch=false;this.source({term:value},this._response());},_response:function _response(){var index=++this.requestIndex;return $.proxy(function(content){if(index===this.requestIndex){this.__response(content);}this.pending--;if(!this.pending){this.element.removeClass("ui-autocomplete-loading");}},this);},__response:function __response(content){if(content){content=this._normalize(content);}this._trigger("response",null,{content:content});if(!this.options.disabled&&content&&content.length&&!this.cancelSearch){this._suggest(content);this._trigger("open");}else{// use ._close() instead of .close() so we don't cancel future searches
this._close();}},close:function close(event){this.cancelSearch=true;this._close(event);},_close:function _close(event){if(this.menu.element.is(":visible")){this.menu.element.hide();this.menu.blur();this.isNewMenu=true;this._trigger("close",event);}},_change:function _change(event){if(this.previous!==this._value()){this._trigger("change",event,{item:this.selectedItem});}},_normalize:function _normalize(items){// assume all items have the right format when the first item is complete
if(items.length&&items[0].label&&items[0].value){return items;}return $.map(items,function(item){if(typeof item==="string"){return{label:item,value:item};}return $.extend({},item,{label:item.label||item.value,value:item.value||item.label});});},_suggest:function _suggest(items){var ul=this.menu.element.empty();this._renderMenu(ul,items);this.isNewMenu=true;this.menu.refresh();// size and position menu
ul.show();this._resizeMenu();ul.position($.extend({of:this.element},this.options.position));if(this.options.autoFocus){this.menu.next();}},_resizeMenu:function _resizeMenu(){var ul=this.menu.element;ul.outerWidth(Math.max(// Firefox wraps long text (possibly a rounding bug)
// so we add 1px to avoid the wrapping (#7513)
ul.width("").outerWidth()+1,this.element.outerWidth()));},_renderMenu:function _renderMenu(ul,items){var that=this;$.each(items,function(index,item){that._renderItemData(ul,item);});},_renderItemData:function _renderItemData(ul,item){return this._renderItem(ul,item).data("ui-autocomplete-item",item);},_renderItem:function _renderItem(ul,item){return $("<li>").text(item.label).appendTo(ul);},_move:function _move(direction,event){if(!this.menu.element.is(":visible")){this.search(null,event);return;}if(this.menu.isFirstItem()&&/^previous/.test(direction)||this.menu.isLastItem()&&/^next/.test(direction)){if(!this.isMultiLine){this._value(this.term);}this.menu.blur();return;}this.menu[direction](event);},widget:function widget(){return this.menu.element;},_value:function _value(){return this.valueMethod.apply(this.element,arguments);},_keyEvent:function _keyEvent(keyEvent,event){if(!this.isMultiLine||this.menu.element.is(":visible")){this._move(keyEvent,event);// prevents moving cursor to beginning/end of the text field in some browsers
event.preventDefault();}}});$.extend($.ui.autocomplete,{escapeRegex:function escapeRegex(value){return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&");},filter:function filter(array,term){var matcher=new RegExp($.ui.autocomplete.escapeRegex(term),"i");return $.grep(array,function(value){return matcher.test(value.label||value.value||value);});}});// live region extension, adding a `messages` option
// NOTE: This is an experimental API. We are still investigating
// a full solution for string manipulation and internationalization.
$.widget("ui.autocomplete",$.ui.autocomplete,{options:{messages:{noResults:"No search results.",results:function results(amount){return amount+(amount>1?" results are":" result is")+" available, use up and down arrow keys to navigate.";}}},__response:function __response(content){var message;this._superApply(arguments);if(this.options.disabled||this.cancelSearch){return;}if(content&&content.length){message=this.options.messages.results(content.length);}else{message=this.options.messages.noResults;}this.liveRegion.children().hide();$("<div>").text(message).appendTo(this.liveRegion);}});var autocomplete=$.ui.autocomplete;/*!
 * jQuery UI Button 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/button/
 */var lastActive,baseClasses="ui-button ui-widget ui-state-default ui-corner-all",typeClasses="ui-button-icons-only ui-button-icon-only ui-button-text-icons ui-button-text-icon-primary ui-button-text-icon-secondary ui-button-text-only",formResetHandler=function formResetHandler(){var form=$(this);setTimeout(function(){form.find(":ui-button").button("refresh");},1);},radioGroup=function radioGroup(radio){var name=radio.name,form=radio.form,radios=$([]);if(name){name=name.replace(/'/g,"\\'");if(form){radios=$(form).find("[name='"+name+"'][type=radio]");}else{radios=$("[name='"+name+"'][type=radio]",radio.ownerDocument).filter(function(){return!this.form;});}}return radios;};$.widget("ui.button",{version:"1.11.4",defaultElement:"<button>",options:{disabled:null,text:true,label:null,icons:{primary:null,secondary:null}},_create:function _create(){this.element.closest("form").unbind("reset"+this.eventNamespace).bind("reset"+this.eventNamespace,formResetHandler);if(typeof this.options.disabled!=="boolean"){this.options.disabled=!!this.element.prop("disabled");}else{this.element.prop("disabled",this.options.disabled);}this._determineButtonType();this.hasTitle=!!this.buttonElement.attr("title");var that=this,options=this.options,toggleButton=this.type==="checkbox"||this.type==="radio",activeClass=!toggleButton?"ui-state-active":"";if(options.label===null){options.label=this.type==="input"?this.buttonElement.val():this.buttonElement.html();}this._hoverable(this.buttonElement);this.buttonElement.addClass(baseClasses).attr("role","button").bind("mouseenter"+this.eventNamespace,function(){if(options.disabled){return;}if(this===lastActive){$(this).addClass("ui-state-active");}}).bind("mouseleave"+this.eventNamespace,function(){if(options.disabled){return;}$(this).removeClass(activeClass);}).bind("click"+this.eventNamespace,function(event){if(options.disabled){event.preventDefault();event.stopImmediatePropagation();}});// Can't use _focusable() because the element that receives focus
// and the element that gets the ui-state-focus class are different
this._on({focus:function focus(){this.buttonElement.addClass("ui-state-focus");},blur:function blur(){this.buttonElement.removeClass("ui-state-focus");}});if(toggleButton){this.element.bind("change"+this.eventNamespace,function(){that.refresh();});}if(this.type==="checkbox"){this.buttonElement.bind("click"+this.eventNamespace,function(){if(options.disabled){return false;}});}else if(this.type==="radio"){this.buttonElement.bind("click"+this.eventNamespace,function(){if(options.disabled){return false;}$(this).addClass("ui-state-active");that.buttonElement.attr("aria-pressed","true");var radio=that.element[0];radioGroup(radio).not(radio).map(function(){return $(this).button("widget")[0];}).removeClass("ui-state-active").attr("aria-pressed","false");});}else{this.buttonElement.bind("mousedown"+this.eventNamespace,function(){if(options.disabled){return false;}$(this).addClass("ui-state-active");lastActive=this;that.document.one("mouseup",function(){lastActive=null;});}).bind("mouseup"+this.eventNamespace,function(){if(options.disabled){return false;}$(this).removeClass("ui-state-active");}).bind("keydown"+this.eventNamespace,function(event){if(options.disabled){return false;}if(event.keyCode===$.ui.keyCode.SPACE||event.keyCode===$.ui.keyCode.ENTER){$(this).addClass("ui-state-active");}})// see #8559, we bind to blur here in case the button element loses
// focus between keydown and keyup, it would be left in an "active" state
.bind("keyup"+this.eventNamespace+" blur"+this.eventNamespace,function(){$(this).removeClass("ui-state-active");});if(this.buttonElement.is("a")){this.buttonElement.keyup(function(event){if(event.keyCode===$.ui.keyCode.SPACE){// TODO pass through original event correctly (just as 2nd argument doesn't work)
$(this).click();}});}}this._setOption("disabled",options.disabled);this._resetButton();},_determineButtonType:function _determineButtonType(){var ancestor,labelSelector,checked;if(this.element.is("[type=checkbox]")){this.type="checkbox";}else if(this.element.is("[type=radio]")){this.type="radio";}else if(this.element.is("input")){this.type="input";}else{this.type="button";}if(this.type==="checkbox"||this.type==="radio"){// we don't search against the document in case the element
// is disconnected from the DOM
ancestor=this.element.parents().last();labelSelector="label[for='"+this.element.attr("id")+"']";this.buttonElement=ancestor.find(labelSelector);if(!this.buttonElement.length){ancestor=ancestor.length?ancestor.siblings():this.element.siblings();this.buttonElement=ancestor.filter(labelSelector);if(!this.buttonElement.length){this.buttonElement=ancestor.find(labelSelector);}}this.element.addClass("ui-helper-hidden-accessible");checked=this.element.is(":checked");if(checked){this.buttonElement.addClass("ui-state-active");}this.buttonElement.prop("aria-pressed",checked);}else{this.buttonElement=this.element;}},widget:function widget(){return this.buttonElement;},_destroy:function _destroy(){this.element.removeClass("ui-helper-hidden-accessible");this.buttonElement.removeClass(baseClasses+" ui-state-active "+typeClasses).removeAttr("role").removeAttr("aria-pressed").html(this.buttonElement.find(".ui-button-text").html());if(!this.hasTitle){this.buttonElement.removeAttr("title");}},_setOption:function _setOption(key,value){this._super(key,value);if(key==="disabled"){this.widget().toggleClass("ui-state-disabled",!!value);this.element.prop("disabled",!!value);if(value){if(this.type==="checkbox"||this.type==="radio"){this.buttonElement.removeClass("ui-state-focus");}else{this.buttonElement.removeClass("ui-state-focus ui-state-active");}}return;}this._resetButton();},refresh:function refresh(){//See #8237 & #8828
var isDisabled=this.element.is("input, button")?this.element.is(":disabled"):this.element.hasClass("ui-button-disabled");if(isDisabled!==this.options.disabled){this._setOption("disabled",isDisabled);}if(this.type==="radio"){radioGroup(this.element[0]).each(function(){if($(this).is(":checked")){$(this).button("widget").addClass("ui-state-active").attr("aria-pressed","true");}else{$(this).button("widget").removeClass("ui-state-active").attr("aria-pressed","false");}});}else if(this.type==="checkbox"){if(this.element.is(":checked")){this.buttonElement.addClass("ui-state-active").attr("aria-pressed","true");}else{this.buttonElement.removeClass("ui-state-active").attr("aria-pressed","false");}}},_resetButton:function _resetButton(){if(this.type==="input"){if(this.options.label){this.element.val(this.options.label);}return;}var buttonElement=this.buttonElement.removeClass(typeClasses),buttonText=$("<span></span>",this.document[0]).addClass("ui-button-text").html(this.options.label).appendTo(buttonElement.empty()).text(),icons=this.options.icons,multipleIcons=icons.primary&&icons.secondary,buttonClasses=[];if(icons.primary||icons.secondary){if(this.options.text){buttonClasses.push("ui-button-text-icon"+(multipleIcons?"s":icons.primary?"-primary":"-secondary"));}if(icons.primary){buttonElement.prepend("<span class='ui-button-icon-primary ui-icon "+icons.primary+"'></span>");}if(icons.secondary){buttonElement.append("<span class='ui-button-icon-secondary ui-icon "+icons.secondary+"'></span>");}if(!this.options.text){buttonClasses.push(multipleIcons?"ui-button-icons-only":"ui-button-icon-only");if(!this.hasTitle){buttonElement.attr("title",$.trim(buttonText));}}}else{buttonClasses.push("ui-button-text-only");}buttonElement.addClass(buttonClasses.join(" "));}});$.widget("ui.buttonset",{version:"1.11.4",options:{items:"button, input[type=button], input[type=submit], input[type=reset], input[type=checkbox], input[type=radio], a, :data(ui-button)"},_create:function _create(){this.element.addClass("ui-buttonset");},_init:function _init(){this.refresh();},_setOption:function _setOption(key,value){if(key==="disabled"){this.buttons.button("option",key,value);}this._super(key,value);},refresh:function refresh(){var rtl=this.element.css("direction")==="rtl",allButtons=this.element.find(this.options.items),existingButtons=allButtons.filter(":ui-button");// Initialize new buttons
allButtons.not(":ui-button").button();// Refresh existing buttons
existingButtons.button("refresh");this.buttons=allButtons.map(function(){return $(this).button("widget")[0];}).removeClass("ui-corner-all ui-corner-left ui-corner-right").filter(":first").addClass(rtl?"ui-corner-right":"ui-corner-left").end().filter(":last").addClass(rtl?"ui-corner-left":"ui-corner-right").end().end();},_destroy:function _destroy(){this.element.removeClass("ui-buttonset");this.buttons.map(function(){return $(this).button("widget")[0];}).removeClass("ui-corner-left ui-corner-right").end().button("destroy");}});var button=$.ui.button;/*!
 * jQuery UI Datepicker 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/datepicker/
 */$.extend($.ui,{datepicker:{version:"1.11.4"}});var datepicker_instActive;function datepicker_getZindex(elem){var position,value;while(elem.length&&elem[0]!==document){// Ignore z-index if position is set to a value where z-index is ignored by the browser
// This makes behavior of this function consistent across browsers
// WebKit always returns auto if the element is positioned
position=elem.css("position");if(position==="absolute"||position==="relative"||position==="fixed"){// IE returns 0 when zIndex is not specified
// other browsers return a string
// we ignore the case of nested elements with an explicit value of 0
// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
value=parseInt(elem.css("zIndex"),10);if(!isNaN(value)&&value!==0){return value;}}elem=elem.parent();}return 0;}/* Date picker manager.
   Use the singleton instance of this class, $.datepicker, to interact with the date picker.
   Settings for (groups of) date pickers are maintained in an instance object,
   allowing multiple different settings on the same page. */function Datepicker(){this._curInst=null;// The current instance in use
this._keyEvent=false;// If the last event was a key event
this._disabledInputs=[];// List of date picker inputs that have been disabled
this._datepickerShowing=false;// True if the popup picker is showing , false if not
this._inDialog=false;// True if showing within a "dialog", false if not
this._mainDivId="ui-datepicker-div";// The ID of the main datepicker division
this._inlineClass="ui-datepicker-inline";// The name of the inline marker class
this._appendClass="ui-datepicker-append";// The name of the append marker class
this._triggerClass="ui-datepicker-trigger";// The name of the trigger marker class
this._dialogClass="ui-datepicker-dialog";// The name of the dialog marker class
this._disableClass="ui-datepicker-disabled";// The name of the disabled covering marker class
this._unselectableClass="ui-datepicker-unselectable";// The name of the unselectable cell marker class
this._currentClass="ui-datepicker-current-day";// The name of the current day marker class
this._dayOverClass="ui-datepicker-days-cell-over";// The name of the day hover marker class
this.regional=[];// Available regional settings, indexed by language code
this.regional[""]={// Default regional settings
closeText:"Done",// Display text for close link
prevText:"Prev",// Display text for previous month link
nextText:"Next",// Display text for next month link
currentText:"Today",// Display text for current month link
monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],// Names of months for drop-down and formatting
monthNamesShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],// For formatting
dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],// For formatting
dayNamesShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],// For formatting
dayNamesMin:["Su","Mo","Tu","We","Th","Fr","Sa"],// Column headings for days starting at Sunday
weekHeader:"Wk",// Column header for week of the year
dateFormat:"mm/dd/yy",// See format options on parseDate
firstDay:0,// The first day of the week, Sun = 0, Mon = 1, ...
isRTL:false,// True if right-to-left language, false if left-to-right
showMonthAfterYear:false,// True if the year select precedes month, false for month then year
yearSuffix:""// Additional text to append to the year in the month headers
};this._defaults={// Global defaults for all the date picker instances
showOn:"focus",// "focus" for popup on focus,
// "button" for trigger button, or "both" for either
showAnim:"fadeIn",// Name of jQuery animation for popup
showOptions:{},// Options for enhanced animations
defaultDate:null,// Used when field is blank: actual date,
// +/-number for offset from today, null for today
appendText:"",// Display text following the input box, e.g. showing the format
buttonText:"...",// Text for trigger button
buttonImage:"",// URL for trigger button image
buttonImageOnly:false,// True if the image appears alone, false if it appears on a button
hideIfNoPrevNext:false,// True to hide next/previous month links
// if not applicable, false to just disable them
navigationAsDateFormat:false,// True if date formatting applied to prev/today/next links
gotoCurrent:false,// True if today link goes back to current selection instead
changeMonth:false,// True if month can be selected directly, false if only prev/next
changeYear:false,// True if year can be selected directly, false if only prev/next
yearRange:"c-10:c+10",// Range of years to display in drop-down,
// either relative to today's year (-nn:+nn), relative to currently displayed year
// (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
showOtherMonths:false,// True to show dates in other months, false to leave blank
selectOtherMonths:false,// True to allow selection of dates in other months, false for unselectable
showWeek:false,// True to show week of the year, false to not show it
calculateWeek:this.iso8601Week,// How to calculate the week of the year,
// takes a Date and returns the number of the week for it
shortYearCutoff:"+10",// Short year values < this are in the current century,
// > this are in the previous century,
// string value starting with "+" for current year + value
minDate:null,// The earliest selectable date, or null for no limit
maxDate:null,// The latest selectable date, or null for no limit
duration:"fast",// Duration of display/closure
beforeShowDay:null,// Function that takes a date and returns an array with
// [0] = true if selectable, false if not, [1] = custom CSS class name(s) or "",
// [2] = cell title (optional), e.g. $.datepicker.noWeekends
beforeShow:null,// Function that takes an input field and
// returns a set of custom settings for the date picker
onSelect:null,// Define a callback function when a date is selected
onChangeMonthYear:null,// Define a callback function when the month or year is changed
onClose:null,// Define a callback function when the datepicker is closed
numberOfMonths:1,// Number of months to show at a time
showCurrentAtPos:0,// The position in multipe months at which to show the current month (starting at 0)
stepMonths:1,// Number of months to step back/forward
stepBigMonths:12,// Number of months to step back/forward for the big links
altField:"",// Selector for an alternate field to store selected dates into
altFormat:"",// The date format to use for the alternate field
constrainInput:true,// The input is constrained by the current date format
showButtonPanel:false,// True to show button panel, false to not show it
autoSize:false,// True to size the input for the date format, false to leave as is
disabled:false// The initial disabled state
};$.extend(this._defaults,this.regional[""]);this.regional.en=$.extend(true,{},this.regional[""]);this.regional["en-US"]=$.extend(true,{},this.regional.en);this.dpDiv=datepicker_bindHover($("<div id='"+this._mainDivId+"' class='ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"));}$.extend(Datepicker.prototype,{/* Class name added to elements to indicate already configured with a date picker. */markerClassName:"hasDatepicker",//Keep track of the maximum number of rows displayed (see #7043)
maxRows:4,// TODO rename to "widget" when switching to widget factory
_widgetDatepicker:function _widgetDatepicker(){return this.dpDiv;},/* Override the default settings for all instances of the date picker.
	 * @param  settings  object - the new settings to use as defaults (anonymous object)
	 * @return the manager object
	 */setDefaults:function setDefaults(settings){datepicker_extendRemove(this._defaults,settings||{});return this;},/* Attach the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 * @param  settings  object - the new settings to use for this date picker instance (anonymous)
	 */_attachDatepicker:function _attachDatepicker(target,settings){var nodeName,inline,inst;nodeName=target.nodeName.toLowerCase();inline=nodeName==="div"||nodeName==="span";if(!target.id){this.uuid+=1;target.id="dp"+this.uuid;}inst=this._newInst($(target),inline);inst.settings=$.extend({},settings||{});if(nodeName==="input"){this._connectDatepicker(target,inst);}else if(inline){this._inlineDatepicker(target,inst);}},/* Create a new instance object. */_newInst:function _newInst(target,inline){var id=target[0].id.replace(/([^A-Za-z0-9_\-])/g,"\\\\$1");// escape jQuery meta chars
return{id:id,input:target,// associated target
selectedDay:0,selectedMonth:0,selectedYear:0,// current selection
drawMonth:0,drawYear:0,// month being drawn
inline:inline,// is datepicker inline or not
dpDiv:!inline?this.dpDiv:// presentation div
datepicker_bindHover($("<div class='"+this._inlineClass+" ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all'></div>"))};},/* Attach the date picker to an input field. */_connectDatepicker:function _connectDatepicker(target,inst){var input=$(target);inst.append=$([]);inst.trigger=$([]);if(input.hasClass(this.markerClassName)){return;}this._attachments(input,inst);input.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress).keyup(this._doKeyUp);this._autoSize(inst);$.data(target,"datepicker",inst);//If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
if(inst.settings.disabled){this._disableDatepicker(target);}},/* Make attachments based on settings. */_attachments:function _attachments(input,inst){var showOn,buttonText,buttonImage,appendText=this._get(inst,"appendText"),isRTL=this._get(inst,"isRTL");if(inst.append){inst.append.remove();}if(appendText){inst.append=$("<span class='"+this._appendClass+"'>"+appendText+"</span>");input[isRTL?"before":"after"](inst.append);}input.unbind("focus",this._showDatepicker);if(inst.trigger){inst.trigger.remove();}showOn=this._get(inst,"showOn");if(showOn==="focus"||showOn==="both"){// pop-up date picker when in the marked field
input.focus(this._showDatepicker);}if(showOn==="button"||showOn==="both"){// pop-up date picker when button clicked
buttonText=this._get(inst,"buttonText");buttonImage=this._get(inst,"buttonImage");inst.trigger=$(this._get(inst,"buttonImageOnly")?$("<img/>").addClass(this._triggerClass).attr({src:buttonImage,alt:buttonText,title:buttonText}):$("<button type='button'></button>").addClass(this._triggerClass).html(!buttonImage?buttonText:$("<img/>").attr({src:buttonImage,alt:buttonText,title:buttonText})));input[isRTL?"before":"after"](inst.trigger);inst.trigger.click(function(){if($.datepicker._datepickerShowing&&$.datepicker._lastInput===input[0]){$.datepicker._hideDatepicker();}else if($.datepicker._datepickerShowing&&$.datepicker._lastInput!==input[0]){$.datepicker._hideDatepicker();$.datepicker._showDatepicker(input[0]);}else{$.datepicker._showDatepicker(input[0]);}return false;});}},/* Apply the maximum length for the date format. */_autoSize:function _autoSize(inst){if(this._get(inst,"autoSize")&&!inst.inline){var findMax,max,maxI,i,date=new Date(2009,12-1,20),// Ensure double digits
dateFormat=this._get(inst,"dateFormat");if(dateFormat.match(/[DM]/)){findMax=function findMax(names){max=0;maxI=0;for(i=0;i<names.length;i++){if(names[i].length>max){max=names[i].length;maxI=i;}}return maxI;};date.setMonth(findMax(this._get(inst,dateFormat.match(/MM/)?"monthNames":"monthNamesShort")));date.setDate(findMax(this._get(inst,dateFormat.match(/DD/)?"dayNames":"dayNamesShort"))+20-date.getDay());}inst.input.attr("size",this._formatDate(inst,date).length);}},/* Attach an inline date picker to a div. */_inlineDatepicker:function _inlineDatepicker(target,inst){var divSpan=$(target);if(divSpan.hasClass(this.markerClassName)){return;}divSpan.addClass(this.markerClassName).append(inst.dpDiv);$.data(target,"datepicker",inst);this._setDate(inst,this._getDefaultDate(inst),true);this._updateDatepicker(inst);this._updateAlternate(inst);//If disabled option is true, disable the datepicker before showing it (see ticket #5665)
if(inst.settings.disabled){this._disableDatepicker(target);}// Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
// http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
inst.dpDiv.css("display","block");},/* Pop-up the date picker in a "dialog" box.
	 * @param  input element - ignored
	 * @param  date	string or Date - the initial date to display
	 * @param  onSelect  function - the function to call when a date is selected
	 * @param  settings  object - update the dialog date picker instance's settings (anonymous object)
	 * @param  pos int[2] - coordinates for the dialog's position within the screen or
	 *					event - with x/y coordinates or
	 *					leave empty for default (screen centre)
	 * @return the manager object
	 */_dialogDatepicker:function _dialogDatepicker(input,date,onSelect,settings,pos){var id,browserWidth,browserHeight,scrollX,scrollY,inst=this._dialogInst;// internal instance
if(!inst){this.uuid+=1;id="dp"+this.uuid;this._dialogInput=$("<input type='text' id='"+id+"' style='position: absolute; top: -100px; width: 0px;'/>");this._dialogInput.keydown(this._doKeyDown);$("body").append(this._dialogInput);inst=this._dialogInst=this._newInst(this._dialogInput,false);inst.settings={};$.data(this._dialogInput[0],"datepicker",inst);}datepicker_extendRemove(inst.settings,settings||{});date=date&&date.constructor===Date?this._formatDate(inst,date):date;this._dialogInput.val(date);this._pos=pos?pos.length?pos:[pos.pageX,pos.pageY]:null;if(!this._pos){browserWidth=document.documentElement.clientWidth;browserHeight=document.documentElement.clientHeight;scrollX=document.documentElement.scrollLeft||document.body.scrollLeft;scrollY=document.documentElement.scrollTop||document.body.scrollTop;this._pos=// should use actual width/height below
[browserWidth/2-100+scrollX,browserHeight/2-150+scrollY];}// move input on screen for focus, but hidden behind dialog
this._dialogInput.css("left",this._pos[0]+20+"px").css("top",this._pos[1]+"px");inst.settings.onSelect=onSelect;this._inDialog=true;this.dpDiv.addClass(this._dialogClass);this._showDatepicker(this._dialogInput[0]);if($.blockUI){$.blockUI(this.dpDiv);}$.data(this._dialogInput[0],"datepicker",inst);return this;},/* Detach a datepicker from its control.
	 * @param  target	element - the target input field or division or span
	 */_destroyDatepicker:function _destroyDatepicker(target){var nodeName,$target=$(target),inst=$.data(target,"datepicker");if(!$target.hasClass(this.markerClassName)){return;}nodeName=target.nodeName.toLowerCase();$.removeData(target,"datepicker");if(nodeName==="input"){inst.append.remove();inst.trigger.remove();$target.removeClass(this.markerClassName).unbind("focus",this._showDatepicker).unbind("keydown",this._doKeyDown).unbind("keypress",this._doKeyPress).unbind("keyup",this._doKeyUp);}else if(nodeName==="div"||nodeName==="span"){$target.removeClass(this.markerClassName).empty();}if(datepicker_instActive===inst){datepicker_instActive=null;}},/* Enable the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 */_enableDatepicker:function _enableDatepicker(target){var nodeName,inline,$target=$(target),inst=$.data(target,"datepicker");if(!$target.hasClass(this.markerClassName)){return;}nodeName=target.nodeName.toLowerCase();if(nodeName==="input"){target.disabled=false;inst.trigger.filter("button").each(function(){this.disabled=false;}).end().filter("img").css({opacity:"1.0",cursor:""});}else if(nodeName==="div"||nodeName==="span"){inline=$target.children("."+this._inlineClass);inline.children().removeClass("ui-state-disabled");inline.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",false);}this._disabledInputs=$.map(this._disabledInputs,function(value){return value===target?null:value;});// delete entry
},/* Disable the date picker to a jQuery selection.
	 * @param  target	element - the target input field or division or span
	 */_disableDatepicker:function _disableDatepicker(target){var nodeName,inline,$target=$(target),inst=$.data(target,"datepicker");if(!$target.hasClass(this.markerClassName)){return;}nodeName=target.nodeName.toLowerCase();if(nodeName==="input"){target.disabled=true;inst.trigger.filter("button").each(function(){this.disabled=true;}).end().filter("img").css({opacity:"0.5",cursor:"default"});}else if(nodeName==="div"||nodeName==="span"){inline=$target.children("."+this._inlineClass);inline.children().addClass("ui-state-disabled");inline.find("select.ui-datepicker-month, select.ui-datepicker-year").prop("disabled",true);}this._disabledInputs=$.map(this._disabledInputs,function(value){return value===target?null:value;});// delete entry
this._disabledInputs[this._disabledInputs.length]=target;},/* Is the first field in a jQuery collection disabled as a datepicker?
	 * @param  target	element - the target input field or division or span
	 * @return boolean - true if disabled, false if enabled
	 */_isDisabledDatepicker:function _isDisabledDatepicker(target){if(!target){return false;}for(var i=0;i<this._disabledInputs.length;i++){if(this._disabledInputs[i]===target){return true;}}return false;},/* Retrieve the instance data for the target control.
	 * @param  target  element - the target input field or division or span
	 * @return  object - the associated instance data
	 * @throws  error if a jQuery problem getting data
	 */_getInst:function _getInst(target){try{return $.data(target,"datepicker");}catch(err){throw"Missing instance data for this datepicker";}},/* Update or retrieve the settings for a date picker attached to an input field or division.
	 * @param  target  element - the target input field or division or span
	 * @param  name	object - the new settings to update or
	 *				string - the name of the setting to change or retrieve,
	 *				when retrieving also "all" for all instance settings or
	 *				"defaults" for all global defaults
	 * @param  value   any - the new value for the setting
	 *				(omit if above is an object or to retrieve a value)
	 */_optionDatepicker:function _optionDatepicker(target,name,value){var settings,date,minDate,maxDate,inst=this._getInst(target);if(arguments.length===2&&typeof name==="string"){return name==="defaults"?$.extend({},$.datepicker._defaults):inst?name==="all"?$.extend({},inst.settings):this._get(inst,name):null;}settings=name||{};if(typeof name==="string"){settings={};settings[name]=value;}if(inst){if(this._curInst===inst){this._hideDatepicker();}date=this._getDateDatepicker(target,true);minDate=this._getMinMaxDate(inst,"min");maxDate=this._getMinMaxDate(inst,"max");datepicker_extendRemove(inst.settings,settings);// reformat the old minDate/maxDate values if dateFormat changes and a new minDate/maxDate isn't provided
if(minDate!==null&&settings.dateFormat!==undefined&&settings.minDate===undefined){inst.settings.minDate=this._formatDate(inst,minDate);}if(maxDate!==null&&settings.dateFormat!==undefined&&settings.maxDate===undefined){inst.settings.maxDate=this._formatDate(inst,maxDate);}if("disabled"in settings){if(settings.disabled){this._disableDatepicker(target);}else{this._enableDatepicker(target);}}this._attachments($(target),inst);this._autoSize(inst);this._setDate(inst,date);this._updateAlternate(inst);this._updateDatepicker(inst);}},// change method deprecated
_changeDatepicker:function _changeDatepicker(target,name,value){this._optionDatepicker(target,name,value);},/* Redraw the date picker attached to an input field or division.
	 * @param  target  element - the target input field or division or span
	 */_refreshDatepicker:function _refreshDatepicker(target){var inst=this._getInst(target);if(inst){this._updateDatepicker(inst);}},/* Set the dates for a jQuery selection.
	 * @param  target element - the target input field or division or span
	 * @param  date	Date - the new date
	 */_setDateDatepicker:function _setDateDatepicker(target,date){var inst=this._getInst(target);if(inst){this._setDate(inst,date);this._updateDatepicker(inst);this._updateAlternate(inst);}},/* Get the date(s) for the first entry in a jQuery selection.
	 * @param  target element - the target input field or division or span
	 * @param  noDefault boolean - true if no default date is to be used
	 * @return Date - the current date
	 */_getDateDatepicker:function _getDateDatepicker(target,noDefault){var inst=this._getInst(target);if(inst&&!inst.inline){this._setDateFromField(inst,noDefault);}return inst?this._getDate(inst):null;},/* Handle keystrokes. */_doKeyDown:function _doKeyDown(event){var onSelect,dateStr,sel,inst=$.datepicker._getInst(event.target),handled=true,isRTL=inst.dpDiv.is(".ui-datepicker-rtl");inst._keyEvent=true;if($.datepicker._datepickerShowing){switch(event.keyCode){case 9:$.datepicker._hideDatepicker();handled=false;break;// hide on tab out
case 13:sel=$("td."+$.datepicker._dayOverClass+":not(."+$.datepicker._currentClass+")",inst.dpDiv);if(sel[0]){$.datepicker._selectDay(event.target,inst.selectedMonth,inst.selectedYear,sel[0]);}onSelect=$.datepicker._get(inst,"onSelect");if(onSelect){dateStr=$.datepicker._formatDate(inst);// trigger custom callback
onSelect.apply(inst.input?inst.input[0]:null,[dateStr,inst]);}else{$.datepicker._hideDatepicker();}return false;// don't submit the form
case 27:$.datepicker._hideDatepicker();break;// hide on escape
case 33:$.datepicker._adjustDate(event.target,event.ctrlKey?-$.datepicker._get(inst,"stepBigMonths"):-$.datepicker._get(inst,"stepMonths"),"M");break;// previous month/year on page up/+ ctrl
case 34:$.datepicker._adjustDate(event.target,event.ctrlKey?+$.datepicker._get(inst,"stepBigMonths"):+$.datepicker._get(inst,"stepMonths"),"M");break;// next month/year on page down/+ ctrl
case 35:if(event.ctrlKey||event.metaKey){$.datepicker._clearDate(event.target);}handled=event.ctrlKey||event.metaKey;break;// clear on ctrl or command +end
case 36:if(event.ctrlKey||event.metaKey){$.datepicker._gotoToday(event.target);}handled=event.ctrlKey||event.metaKey;break;// current on ctrl or command +home
case 37:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,isRTL?+1:-1,"D");}handled=event.ctrlKey||event.metaKey;// -1 day on ctrl or command +left
if(event.originalEvent.altKey){$.datepicker._adjustDate(event.target,event.ctrlKey?-$.datepicker._get(inst,"stepBigMonths"):-$.datepicker._get(inst,"stepMonths"),"M");}// next month/year on alt +left on Mac
break;case 38:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,-7,"D");}handled=event.ctrlKey||event.metaKey;break;// -1 week on ctrl or command +up
case 39:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,isRTL?-1:+1,"D");}handled=event.ctrlKey||event.metaKey;// +1 day on ctrl or command +right
if(event.originalEvent.altKey){$.datepicker._adjustDate(event.target,event.ctrlKey?+$.datepicker._get(inst,"stepBigMonths"):+$.datepicker._get(inst,"stepMonths"),"M");}// next month/year on alt +right
break;case 40:if(event.ctrlKey||event.metaKey){$.datepicker._adjustDate(event.target,+7,"D");}handled=event.ctrlKey||event.metaKey;break;// +1 week on ctrl or command +down
default:handled=false;}}else if(event.keyCode===36&&event.ctrlKey){// display the date picker on ctrl+home
$.datepicker._showDatepicker(this);}else{handled=false;}if(handled){event.preventDefault();event.stopPropagation();}},/* Filter entered characters - based on date format. */_doKeyPress:function _doKeyPress(event){var chars,chr,inst=$.datepicker._getInst(event.target);if($.datepicker._get(inst,"constrainInput")){chars=$.datepicker._possibleChars($.datepicker._get(inst,"dateFormat"));chr=String.fromCharCode(event.charCode==null?event.keyCode:event.charCode);return event.ctrlKey||event.metaKey||chr<" "||!chars||chars.indexOf(chr)>-1;}},/* Synchronise manual entry and field/alternate field. */_doKeyUp:function _doKeyUp(event){var date,inst=$.datepicker._getInst(event.target);if(inst.input.val()!==inst.lastVal){try{date=$.datepicker.parseDate($.datepicker._get(inst,"dateFormat"),inst.input?inst.input.val():null,$.datepicker._getFormatConfig(inst));if(date){// only if valid
$.datepicker._setDateFromField(inst);$.datepicker._updateAlternate(inst);$.datepicker._updateDatepicker(inst);}}catch(err){}}return true;},/* Pop-up the date picker for a given input field.
	 * If false returned from beforeShow event handler do not show.
	 * @param  input  element - the input field attached to the date picker or
	 *					event - if triggered by focus
	 */_showDatepicker:function _showDatepicker(input){input=input.target||input;if(input.nodeName.toLowerCase()!=="input"){// find from button/image trigger
input=$("input",input.parentNode)[0];}if($.datepicker._isDisabledDatepicker(input)||$.datepicker._lastInput===input){// already here
return;}var inst,beforeShow,beforeShowSettings,isFixed,offset,showAnim,duration;inst=$.datepicker._getInst(input);if($.datepicker._curInst&&$.datepicker._curInst!==inst){$.datepicker._curInst.dpDiv.stop(true,true);if(inst&&$.datepicker._datepickerShowing){$.datepicker._hideDatepicker($.datepicker._curInst.input[0]);}}beforeShow=$.datepicker._get(inst,"beforeShow");beforeShowSettings=beforeShow?beforeShow.apply(input,[input,inst]):{};if(beforeShowSettings===false){return;}datepicker_extendRemove(inst.settings,beforeShowSettings);inst.lastVal=null;$.datepicker._lastInput=input;$.datepicker._setDateFromField(inst);if($.datepicker._inDialog){// hide cursor
input.value="";}if(!$.datepicker._pos){// position below input
$.datepicker._pos=$.datepicker._findPos(input);$.datepicker._pos[1]+=input.offsetHeight;// add the height
}isFixed=false;$(input).parents().each(function(){isFixed|=$(this).css("position")==="fixed";return!isFixed;});offset={left:$.datepicker._pos[0],top:$.datepicker._pos[1]};$.datepicker._pos=null;//to avoid flashes on Firefox
inst.dpDiv.empty();// determine sizing offscreen
inst.dpDiv.css({position:"absolute",display:"block",top:"-1000px"});$.datepicker._updateDatepicker(inst);// fix width for dynamic number of date pickers
// and adjust position before showing
offset=$.datepicker._checkOffset(inst,offset,isFixed);inst.dpDiv.css({position:$.datepicker._inDialog&&$.blockUI?"static":isFixed?"fixed":"absolute",display:"none",left:offset.left+"px",top:offset.top+"px"});if(!inst.inline){showAnim=$.datepicker._get(inst,"showAnim");duration=$.datepicker._get(inst,"duration");inst.dpDiv.css("z-index",datepicker_getZindex($(input))+1);$.datepicker._datepickerShowing=true;if($.effects&&$.effects.effect[showAnim]){inst.dpDiv.show(showAnim,$.datepicker._get(inst,"showOptions"),duration);}else{inst.dpDiv[showAnim||"show"](showAnim?duration:null);}if($.datepicker._shouldFocusInput(inst)){inst.input.focus();}$.datepicker._curInst=inst;}},/* Generate the date picker content. */_updateDatepicker:function _updateDatepicker(inst){this.maxRows=4;//Reset the max number of rows being displayed (see #7043)
datepicker_instActive=inst;// for delegate hover events
inst.dpDiv.empty().append(this._generateHTML(inst));this._attachHandlers(inst);var origyearshtml,numMonths=this._getNumberOfMonths(inst),cols=numMonths[1],width=17,activeCell=inst.dpDiv.find("."+this._dayOverClass+" a");if(activeCell.length>0){datepicker_handleMouseover.apply(activeCell.get(0));}inst.dpDiv.removeClass("ui-datepicker-multi-2 ui-datepicker-multi-3 ui-datepicker-multi-4").width("");if(cols>1){inst.dpDiv.addClass("ui-datepicker-multi-"+cols).css("width",width*cols+"em");}inst.dpDiv[(numMonths[0]!==1||numMonths[1]!==1?"add":"remove")+"Class"]("ui-datepicker-multi");inst.dpDiv[(this._get(inst,"isRTL")?"add":"remove")+"Class"]("ui-datepicker-rtl");if(inst===$.datepicker._curInst&&$.datepicker._datepickerShowing&&$.datepicker._shouldFocusInput(inst)){inst.input.focus();}// deffered render of the years select (to avoid flashes on Firefox)
if(inst.yearshtml){origyearshtml=inst.yearshtml;setTimeout(function(){//assure that inst.yearshtml didn't change.
if(origyearshtml===inst.yearshtml&&inst.yearshtml){inst.dpDiv.find("select.ui-datepicker-year:first").replaceWith(inst.yearshtml);}origyearshtml=inst.yearshtml=null;},0);}},// #6694 - don't focus the input if it's already focused
// this breaks the change event in IE
// Support: IE and jQuery <1.9
_shouldFocusInput:function _shouldFocusInput(inst){return inst.input&&inst.input.is(":visible")&&!inst.input.is(":disabled")&&!inst.input.is(":focus");},/* Check positioning to remain on screen. */_checkOffset:function _checkOffset(inst,offset,isFixed){var dpWidth=inst.dpDiv.outerWidth(),dpHeight=inst.dpDiv.outerHeight(),inputWidth=inst.input?inst.input.outerWidth():0,inputHeight=inst.input?inst.input.outerHeight():0,viewWidth=document.documentElement.clientWidth+(isFixed?0:$(document).scrollLeft()),viewHeight=document.documentElement.clientHeight+(isFixed?0:$(document).scrollTop());offset.left-=this._get(inst,"isRTL")?dpWidth-inputWidth:0;offset.left-=isFixed&&offset.left===inst.input.offset().left?$(document).scrollLeft():0;offset.top-=isFixed&&offset.top===inst.input.offset().top+inputHeight?$(document).scrollTop():0;// now check if datepicker is showing outside window viewport - move to a better place if so.
offset.left-=Math.min(offset.left,offset.left+dpWidth>viewWidth&&viewWidth>dpWidth?Math.abs(offset.left+dpWidth-viewWidth):0);offset.top-=Math.min(offset.top,offset.top+dpHeight>viewHeight&&viewHeight>dpHeight?Math.abs(dpHeight+inputHeight):0);return offset;},/* Find an object's position on the screen. */_findPos:function _findPos(obj){var position,inst=this._getInst(obj),isRTL=this._get(inst,"isRTL");while(obj&&(obj.type==="hidden"||obj.nodeType!==1||$.expr.filters.hidden(obj))){obj=obj[isRTL?"previousSibling":"nextSibling"];}position=$(obj).offset();return[position.left,position.top];},/* Hide the date picker from view.
	 * @param  input  element - the input field attached to the date picker
	 */_hideDatepicker:function _hideDatepicker(input){var showAnim,duration,postProcess,onClose,inst=this._curInst;if(!inst||input&&inst!==$.data(input,"datepicker")){return;}if(this._datepickerShowing){showAnim=this._get(inst,"showAnim");duration=this._get(inst,"duration");postProcess=function postProcess(){$.datepicker._tidyDialog(inst);};// DEPRECATED: after BC for 1.8.x $.effects[ showAnim ] is not needed
if($.effects&&($.effects.effect[showAnim]||$.effects[showAnim])){inst.dpDiv.hide(showAnim,$.datepicker._get(inst,"showOptions"),duration,postProcess);}else{inst.dpDiv[showAnim==="slideDown"?"slideUp":showAnim==="fadeIn"?"fadeOut":"hide"](showAnim?duration:null,postProcess);}if(!showAnim){postProcess();}this._datepickerShowing=false;onClose=this._get(inst,"onClose");if(onClose){onClose.apply(inst.input?inst.input[0]:null,[inst.input?inst.input.val():"",inst]);}this._lastInput=null;if(this._inDialog){this._dialogInput.css({position:"absolute",left:"0",top:"-100px"});if($.blockUI){$.unblockUI();$("body").append(this.dpDiv);}}this._inDialog=false;}},/* Tidy up after a dialog display. */_tidyDialog:function _tidyDialog(inst){inst.dpDiv.removeClass(this._dialogClass).unbind(".ui-datepicker-calendar");},/* Close date picker if clicked elsewhere. */_checkExternalClick:function _checkExternalClick(event){if(!$.datepicker._curInst){return;}var $target=$(event.target),inst=$.datepicker._getInst($target[0]);if($target[0].id!==$.datepicker._mainDivId&&$target.parents("#"+$.datepicker._mainDivId).length===0&&!$target.hasClass($.datepicker.markerClassName)&&!$target.closest("."+$.datepicker._triggerClass).length&&$.datepicker._datepickerShowing&&!($.datepicker._inDialog&&$.blockUI)||$target.hasClass($.datepicker.markerClassName)&&$.datepicker._curInst!==inst){$.datepicker._hideDatepicker();}},/* Adjust one of the date sub-fields. */_adjustDate:function _adjustDate(id,offset,period){var target=$(id),inst=this._getInst(target[0]);if(this._isDisabledDatepicker(target[0])){return;}this._adjustInstDate(inst,offset+(period==="M"?this._get(inst,"showCurrentAtPos"):0),// undo positioning
period);this._updateDatepicker(inst);},/* Action for current link. */_gotoToday:function _gotoToday(id){var date,target=$(id),inst=this._getInst(target[0]);if(this._get(inst,"gotoCurrent")&&inst.currentDay){inst.selectedDay=inst.currentDay;inst.drawMonth=inst.selectedMonth=inst.currentMonth;inst.drawYear=inst.selectedYear=inst.currentYear;}else{date=new Date();inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear();}this._notifyChange(inst);this._adjustDate(target);},/* Action for selecting a new month/year. */_selectMonthYear:function _selectMonthYear(id,select,period){var target=$(id),inst=this._getInst(target[0]);inst["selected"+(period==="M"?"Month":"Year")]=inst["draw"+(period==="M"?"Month":"Year")]=parseInt(select.options[select.selectedIndex].value,10);this._notifyChange(inst);this._adjustDate(target);},/* Action for selecting a day. */_selectDay:function _selectDay(id,month,year,td){var inst,target=$(id);if($(td).hasClass(this._unselectableClass)||this._isDisabledDatepicker(target[0])){return;}inst=this._getInst(target[0]);inst.selectedDay=inst.currentDay=$("a",td).html();inst.selectedMonth=inst.currentMonth=month;inst.selectedYear=inst.currentYear=year;this._selectDate(id,this._formatDate(inst,inst.currentDay,inst.currentMonth,inst.currentYear));},/* Erase the input field and hide the date picker. */_clearDate:function _clearDate(id){var target=$(id);this._selectDate(target,"");},/* Update the input field with the selected date. */_selectDate:function _selectDate(id,dateStr){var onSelect,target=$(id),inst=this._getInst(target[0]);dateStr=dateStr!=null?dateStr:this._formatDate(inst);if(inst.input){inst.input.val(dateStr);}this._updateAlternate(inst);onSelect=this._get(inst,"onSelect");if(onSelect){onSelect.apply(inst.input?inst.input[0]:null,[dateStr,inst]);// trigger custom callback
}else if(inst.input){inst.input.trigger("change");// fire the change event
}if(inst.inline){this._updateDatepicker(inst);}else{this._hideDatepicker();this._lastInput=inst.input[0];if(_typeof(inst.input[0])!=="object"){inst.input.focus();// restore focus
}this._lastInput=null;}},/* Update any alternate field to synchronise with the main field. */_updateAlternate:function _updateAlternate(inst){var altFormat,date,dateStr,altField=this._get(inst,"altField");if(altField){// update alternate field too
altFormat=this._get(inst,"altFormat")||this._get(inst,"dateFormat");date=this._getDate(inst);dateStr=this.formatDate(altFormat,date,this._getFormatConfig(inst));$(altField).each(function(){$(this).val(dateStr);});}},/* Set as beforeShowDay function to prevent selection of weekends.
	 * @param  date  Date - the date to customise
	 * @return [boolean, string] - is this date selectable?, what is its CSS class?
	 */noWeekends:function noWeekends(date){var day=date.getDay();return[day>0&&day<6,""];},/* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	 * @param  date  Date - the date to get the week for
	 * @return  number - the number of the week within the year that contains this date
	 */iso8601Week:function iso8601Week(date){var time,checkDate=new Date(date.getTime());// Find Thursday of this week starting on Monday
checkDate.setDate(checkDate.getDate()+4-(checkDate.getDay()||7));time=checkDate.getTime();checkDate.setMonth(0);// Compare with Jan 1
checkDate.setDate(1);return Math.floor(Math.round((time-checkDate)/86400000)/7)+1;},/* Parse a string value into a date object.
	 * See formatDate below for the possible formats.
	 *
	 * @param  format string - the expected format of the date
	 * @param  value string - the date in the above format
	 * @param  settings Object - attributes include:
	 *					shortYearCutoff  number - the cutoff year for determining the century (optional)
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  Date - the extracted date value or null if value is blank
	 */parseDate:function parseDate(format,value,settings){if(format==null||value==null){throw"Invalid arguments";}value=(typeof value==="undefined"?"undefined":_typeof(value))==="object"?value.toString():value+"";if(value===""){return null;}var iFormat,dim,extra,iValue=0,shortYearCutoffTemp=(settings?settings.shortYearCutoff:null)||this._defaults.shortYearCutoff,shortYearCutoff=typeof shortYearCutoffTemp!=="string"?shortYearCutoffTemp:new Date().getFullYear()%100+parseInt(shortYearCutoffTemp,10),dayNamesShort=(settings?settings.dayNamesShort:null)||this._defaults.dayNamesShort,dayNames=(settings?settings.dayNames:null)||this._defaults.dayNames,monthNamesShort=(settings?settings.monthNamesShort:null)||this._defaults.monthNamesShort,monthNames=(settings?settings.monthNames:null)||this._defaults.monthNames,year=-1,month=-1,day=-1,doy=-1,literal=false,date,// Check whether a format character is doubled
lookAhead=function lookAhead(match){var matches=iFormat+1<format.length&&format.charAt(iFormat+1)===match;if(matches){iFormat++;}return matches;},// Extract a number from the string value
getNumber=function getNumber(match){var isDoubled=lookAhead(match),size=match==="@"?14:match==="!"?20:match==="y"&&isDoubled?4:match==="o"?3:2,minSize=match==="y"?size:1,digits=new RegExp("^\\d{"+minSize+","+size+"}"),num=value.substring(iValue).match(digits);if(!num){throw"Missing number at position "+iValue;}iValue+=num[0].length;return parseInt(num[0],10);},// Extract a name from the string value and convert to an index
getName=function getName(match,shortNames,longNames){var index=-1,names=$.map(lookAhead(match)?longNames:shortNames,function(v,k){return[[k,v]];}).sort(function(a,b){return-(a[1].length-b[1].length);});$.each(names,function(i,pair){var name=pair[1];if(value.substr(iValue,name.length).toLowerCase()===name.toLowerCase()){index=pair[0];iValue+=name.length;return false;}});if(index!==-1){return index+1;}else{throw"Unknown name at position "+iValue;}},// Confirm that a literal character matches the string value
checkLiteral=function checkLiteral(){if(value.charAt(iValue)!==format.charAt(iFormat)){throw"Unexpected literal at position "+iValue;}iValue++;};for(iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)==="'"&&!lookAhead("'")){literal=false;}else{checkLiteral();}}else{switch(format.charAt(iFormat)){case"d":day=getNumber("d");break;case"D":getName("D",dayNamesShort,dayNames);break;case"o":doy=getNumber("o");break;case"m":month=getNumber("m");break;case"M":month=getName("M",monthNamesShort,monthNames);break;case"y":year=getNumber("y");break;case"@":date=new Date(getNumber("@"));year=date.getFullYear();month=date.getMonth()+1;day=date.getDate();break;case"!":date=new Date((getNumber("!")-this._ticksTo1970)/10000);year=date.getFullYear();month=date.getMonth()+1;day=date.getDate();break;case"'":if(lookAhead("'")){checkLiteral();}else{literal=true;}break;default:checkLiteral();}}}if(iValue<value.length){extra=value.substr(iValue);if(!/^\s+/.test(extra)){throw"Extra/unparsed characters found in date: "+extra;}}if(year===-1){year=new Date().getFullYear();}else if(year<100){year+=new Date().getFullYear()-new Date().getFullYear()%100+(year<=shortYearCutoff?0:-100);}if(doy>-1){month=1;day=doy;do{dim=this._getDaysInMonth(year,month-1);if(day<=dim){break;}month++;day-=dim;}while(true);}date=this._daylightSavingAdjust(new Date(year,month-1,day));if(date.getFullYear()!==year||date.getMonth()+1!==month||date.getDate()!==day){throw"Invalid date";// E.g. 31/02/00
}return date;},/* Standard date formats. */ATOM:"yy-mm-dd",// RFC 3339 (ISO 8601)
COOKIE:"D, dd M yy",ISO_8601:"yy-mm-dd",RFC_822:"D, d M y",RFC_850:"DD, dd-M-y",RFC_1036:"D, d M y",RFC_1123:"D, d M yy",RFC_2822:"D, d M yy",RSS:"D, d M y",// RFC 822
TICKS:"!",TIMESTAMP:"@",W3C:"yy-mm-dd",// ISO 8601
_ticksTo1970:((1970-1)*365+Math.floor(1970/4)-Math.floor(1970/100)+Math.floor(1970/400))*24*60*60*10000000,/* Format a date object into a string value.
	 * The format can be combinations of the following:
	 * d  - day of month (no leading zero)
	 * dd - day of month (two digit)
	 * o  - day of year (no leading zeros)
	 * oo - day of year (three digit)
	 * D  - day name short
	 * DD - day name long
	 * m  - month of year (no leading zero)
	 * mm - month of year (two digit)
	 * M  - month name short
	 * MM - month name long
	 * y  - year (two digit)
	 * yy - year (four digit)
	 * @ - Unix timestamp (ms since 01/01/1970)
	 * ! - Windows ticks (100ns since 01/01/0001)
	 * "..." - literal text
	 * '' - single quote
	 *
	 * @param  format string - the desired format of the date
	 * @param  date Date - the date value to format
	 * @param  settings Object - attributes include:
	 *					dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
	 *					dayNames		string[7] - names of the days from Sunday (optional)
	 *					monthNamesShort string[12] - abbreviated names of the months (optional)
	 *					monthNames		string[12] - names of the months (optional)
	 * @return  string - the date in the above format
	 */formatDate:function formatDate(format,date,settings){if(!date){return"";}var iFormat,dayNamesShort=(settings?settings.dayNamesShort:null)||this._defaults.dayNamesShort,dayNames=(settings?settings.dayNames:null)||this._defaults.dayNames,monthNamesShort=(settings?settings.monthNamesShort:null)||this._defaults.monthNamesShort,monthNames=(settings?settings.monthNames:null)||this._defaults.monthNames,// Check whether a format character is doubled
lookAhead=function lookAhead(match){var matches=iFormat+1<format.length&&format.charAt(iFormat+1)===match;if(matches){iFormat++;}return matches;},// Format a number, with leading zero if necessary
formatNumber=function formatNumber(match,value,len){var num=""+value;if(lookAhead(match)){while(num.length<len){num="0"+num;}}return num;},// Format a name, short or long as requested
formatName=function formatName(match,value,shortNames,longNames){return lookAhead(match)?longNames[value]:shortNames[value];},output="",literal=false;if(date){for(iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)==="'"&&!lookAhead("'")){literal=false;}else{output+=format.charAt(iFormat);}}else{switch(format.charAt(iFormat)){case"d":output+=formatNumber("d",date.getDate(),2);break;case"D":output+=formatName("D",date.getDay(),dayNamesShort,dayNames);break;case"o":output+=formatNumber("o",Math.round((new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime()-new Date(date.getFullYear(),0,0).getTime())/86400000),3);break;case"m":output+=formatNumber("m",date.getMonth()+1,2);break;case"M":output+=formatName("M",date.getMonth(),monthNamesShort,monthNames);break;case"y":output+=lookAhead("y")?date.getFullYear():(date.getYear()%100<10?"0":"")+date.getYear()%100;break;case"@":output+=date.getTime();break;case"!":output+=date.getTime()*10000+this._ticksTo1970;break;case"'":if(lookAhead("'")){output+="'";}else{literal=true;}break;default:output+=format.charAt(iFormat);}}}}return output;},/* Extract all possible characters from the date format. */_possibleChars:function _possibleChars(format){var iFormat,chars="",literal=false,// Check whether a format character is doubled
lookAhead=function lookAhead(match){var matches=iFormat+1<format.length&&format.charAt(iFormat+1)===match;if(matches){iFormat++;}return matches;};for(iFormat=0;iFormat<format.length;iFormat++){if(literal){if(format.charAt(iFormat)==="'"&&!lookAhead("'")){literal=false;}else{chars+=format.charAt(iFormat);}}else{switch(format.charAt(iFormat)){case"d":case"m":case"y":case"@":chars+="0123456789";break;case"D":case"M":return null;// Accept anything
case"'":if(lookAhead("'")){chars+="'";}else{literal=true;}break;default:chars+=format.charAt(iFormat);}}}return chars;},/* Get a setting value, defaulting if necessary. */_get:function _get(inst,name){return inst.settings[name]!==undefined?inst.settings[name]:this._defaults[name];},/* Parse existing date and initialise date picker. */_setDateFromField:function _setDateFromField(inst,noDefault){if(inst.input.val()===inst.lastVal){return;}var dateFormat=this._get(inst,"dateFormat"),dates=inst.lastVal=inst.input?inst.input.val():null,defaultDate=this._getDefaultDate(inst),date=defaultDate,settings=this._getFormatConfig(inst);try{date=this.parseDate(dateFormat,dates,settings)||defaultDate;}catch(event){dates=noDefault?"":dates;}inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear();inst.currentDay=dates?date.getDate():0;inst.currentMonth=dates?date.getMonth():0;inst.currentYear=dates?date.getFullYear():0;this._adjustInstDate(inst);},/* Retrieve the default date shown on opening. */_getDefaultDate:function _getDefaultDate(inst){return this._restrictMinMax(inst,this._determineDate(inst,this._get(inst,"defaultDate"),new Date()));},/* A date may be specified as an exact value or a relative one. */_determineDate:function _determineDate(inst,date,defaultDate){var offsetNumeric=function offsetNumeric(offset){var date=new Date();date.setDate(date.getDate()+offset);return date;},offsetString=function offsetString(offset){try{return $.datepicker.parseDate($.datepicker._get(inst,"dateFormat"),offset,$.datepicker._getFormatConfig(inst));}catch(e){// Ignore
}var date=(offset.toLowerCase().match(/^c/)?$.datepicker._getDate(inst):null)||new Date(),year=date.getFullYear(),month=date.getMonth(),day=date.getDate(),pattern=/([+\-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g,matches=pattern.exec(offset);while(matches){switch(matches[2]||"d"){case"d":case"D":day+=parseInt(matches[1],10);break;case"w":case"W":day+=parseInt(matches[1],10)*7;break;case"m":case"M":month+=parseInt(matches[1],10);day=Math.min(day,$.datepicker._getDaysInMonth(year,month));break;case"y":case"Y":year+=parseInt(matches[1],10);day=Math.min(day,$.datepicker._getDaysInMonth(year,month));break;}matches=pattern.exec(offset);}return new Date(year,month,day);},newDate=date==null||date===""?defaultDate:typeof date==="string"?offsetString(date):typeof date==="number"?isNaN(date)?defaultDate:offsetNumeric(date):new Date(date.getTime());newDate=newDate&&newDate.toString()==="Invalid Date"?defaultDate:newDate;if(newDate){newDate.setHours(0);newDate.setMinutes(0);newDate.setSeconds(0);newDate.setMilliseconds(0);}return this._daylightSavingAdjust(newDate);},/* Handle switch to/from daylight saving.
	 * Hours may be non-zero on daylight saving cut-over:
	 * > 12 when midnight changeover, but then cannot generate
	 * midnight datetime, so jump to 1AM, otherwise reset.
	 * @param  date  (Date) the date to check
	 * @return  (Date) the corrected date
	 */_daylightSavingAdjust:function _daylightSavingAdjust(date){if(!date){return null;}date.setHours(date.getHours()>12?date.getHours()+2:0);return date;},/* Set the date(s) directly. */_setDate:function _setDate(inst,date,noChange){var clear=!date,origMonth=inst.selectedMonth,origYear=inst.selectedYear,newDate=this._restrictMinMax(inst,this._determineDate(inst,date,new Date()));inst.selectedDay=inst.currentDay=newDate.getDate();inst.drawMonth=inst.selectedMonth=inst.currentMonth=newDate.getMonth();inst.drawYear=inst.selectedYear=inst.currentYear=newDate.getFullYear();if((origMonth!==inst.selectedMonth||origYear!==inst.selectedYear)&&!noChange){this._notifyChange(inst);}this._adjustInstDate(inst);if(inst.input){inst.input.val(clear?"":this._formatDate(inst));}},/* Retrieve the date(s) directly. */_getDate:function _getDate(inst){var startDate=!inst.currentYear||inst.input&&inst.input.val()===""?null:this._daylightSavingAdjust(new Date(inst.currentYear,inst.currentMonth,inst.currentDay));return startDate;},/* Attach the onxxx handlers.  These are declared statically so
	 * they work with static code transformers like Caja.
	 */_attachHandlers:function _attachHandlers(inst){var stepMonths=this._get(inst,"stepMonths"),id="#"+inst.id.replace(/\\\\/g,"\\");inst.dpDiv.find("[data-handler]").map(function(){var handler={prev:function prev(){$.datepicker._adjustDate(id,-stepMonths,"M");},next:function next(){$.datepicker._adjustDate(id,+stepMonths,"M");},hide:function hide(){$.datepicker._hideDatepicker();},today:function today(){$.datepicker._gotoToday(id);},selectDay:function selectDay(){$.datepicker._selectDay(id,+this.getAttribute("data-month"),+this.getAttribute("data-year"),this);return false;},selectMonth:function selectMonth(){$.datepicker._selectMonthYear(id,this,"M");return false;},selectYear:function selectYear(){$.datepicker._selectMonthYear(id,this,"Y");return false;}};$(this).bind(this.getAttribute("data-event"),handler[this.getAttribute("data-handler")]);});},/* Generate the HTML for the current state of the date picker. */_generateHTML:function _generateHTML(inst){var maxDraw,prevText,prev,nextText,next,currentText,gotoDate,controls,buttonPanel,firstDay,showWeek,dayNames,dayNamesMin,monthNames,monthNamesShort,beforeShowDay,showOtherMonths,selectOtherMonths,defaultDate,html,dow,row,group,col,selectedDate,cornerClass,calender,thead,day,daysInMonth,leadDays,curRows,numRows,printDate,dRow,tbody,daySettings,otherMonth,unselectable,tempDate=new Date(),today=this._daylightSavingAdjust(new Date(tempDate.getFullYear(),tempDate.getMonth(),tempDate.getDate())),// clear time
isRTL=this._get(inst,"isRTL"),showButtonPanel=this._get(inst,"showButtonPanel"),hideIfNoPrevNext=this._get(inst,"hideIfNoPrevNext"),navigationAsDateFormat=this._get(inst,"navigationAsDateFormat"),numMonths=this._getNumberOfMonths(inst),showCurrentAtPos=this._get(inst,"showCurrentAtPos"),stepMonths=this._get(inst,"stepMonths"),isMultiMonth=numMonths[0]!==1||numMonths[1]!==1,currentDate=this._daylightSavingAdjust(!inst.currentDay?new Date(9999,9,9):new Date(inst.currentYear,inst.currentMonth,inst.currentDay)),minDate=this._getMinMaxDate(inst,"min"),maxDate=this._getMinMaxDate(inst,"max"),drawMonth=inst.drawMonth-showCurrentAtPos,drawYear=inst.drawYear;if(drawMonth<0){drawMonth+=12;drawYear--;}if(maxDate){maxDraw=this._daylightSavingAdjust(new Date(maxDate.getFullYear(),maxDate.getMonth()-numMonths[0]*numMonths[1]+1,maxDate.getDate()));maxDraw=minDate&&maxDraw<minDate?minDate:maxDraw;while(this._daylightSavingAdjust(new Date(drawYear,drawMonth,1))>maxDraw){drawMonth--;if(drawMonth<0){drawMonth=11;drawYear--;}}}inst.drawMonth=drawMonth;inst.drawYear=drawYear;prevText=this._get(inst,"prevText");prevText=!navigationAsDateFormat?prevText:this.formatDate(prevText,this._daylightSavingAdjust(new Date(drawYear,drawMonth-stepMonths,1)),this._getFormatConfig(inst));prev=this._canAdjustMonth(inst,-1,drawYear,drawMonth)?"<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'"+" title='"+prevText+"'><span class='ui-icon ui-icon-circle-triangle-"+(isRTL?"e":"w")+"'>"+prevText+"</span></a>":hideIfNoPrevNext?"":"<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='"+prevText+"'><span class='ui-icon ui-icon-circle-triangle-"+(isRTL?"e":"w")+"'>"+prevText+"</span></a>";nextText=this._get(inst,"nextText");nextText=!navigationAsDateFormat?nextText:this.formatDate(nextText,this._daylightSavingAdjust(new Date(drawYear,drawMonth+stepMonths,1)),this._getFormatConfig(inst));next=this._canAdjustMonth(inst,+1,drawYear,drawMonth)?"<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'"+" title='"+nextText+"'><span class='ui-icon ui-icon-circle-triangle-"+(isRTL?"w":"e")+"'>"+nextText+"</span></a>":hideIfNoPrevNext?"":"<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='"+nextText+"'><span class='ui-icon ui-icon-circle-triangle-"+(isRTL?"w":"e")+"'>"+nextText+"</span></a>";currentText=this._get(inst,"currentText");gotoDate=this._get(inst,"gotoCurrent")&&inst.currentDay?currentDate:today;currentText=!navigationAsDateFormat?currentText:this.formatDate(currentText,gotoDate,this._getFormatConfig(inst));controls=!inst.inline?"<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>"+this._get(inst,"closeText")+"</button>":"";buttonPanel=showButtonPanel?"<div class='ui-datepicker-buttonpane ui-widget-content'>"+(isRTL?controls:"")+(this._isInRange(inst,gotoDate)?"<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'"+">"+currentText+"</button>":"")+(isRTL?"":controls)+"</div>":"";firstDay=parseInt(this._get(inst,"firstDay"),10);firstDay=isNaN(firstDay)?0:firstDay;showWeek=this._get(inst,"showWeek");dayNames=this._get(inst,"dayNames");dayNamesMin=this._get(inst,"dayNamesMin");monthNames=this._get(inst,"monthNames");monthNamesShort=this._get(inst,"monthNamesShort");beforeShowDay=this._get(inst,"beforeShowDay");showOtherMonths=this._get(inst,"showOtherMonths");selectOtherMonths=this._get(inst,"selectOtherMonths");defaultDate=this._getDefaultDate(inst);html="";dow;for(row=0;row<numMonths[0];row++){group="";this.maxRows=4;for(col=0;col<numMonths[1];col++){selectedDate=this._daylightSavingAdjust(new Date(drawYear,drawMonth,inst.selectedDay));cornerClass=" ui-corner-all";calender="";if(isMultiMonth){calender+="<div class='ui-datepicker-group";if(numMonths[1]>1){switch(col){case 0:calender+=" ui-datepicker-group-first";cornerClass=" ui-corner-"+(isRTL?"right":"left");break;case numMonths[1]-1:calender+=" ui-datepicker-group-last";cornerClass=" ui-corner-"+(isRTL?"left":"right");break;default:calender+=" ui-datepicker-group-middle";cornerClass="";break;}}calender+="'>";}calender+="<div class='ui-datepicker-header ui-widget-header ui-helper-clearfix"+cornerClass+"'>"+(/all|left/.test(cornerClass)&&row===0?isRTL?next:prev:"")+(/all|right/.test(cornerClass)&&row===0?isRTL?prev:next:"")+this._generateMonthYearHeader(inst,drawMonth,drawYear,minDate,maxDate,row>0||col>0,monthNames,monthNamesShort)+// draw month headers
"</div><table class='ui-datepicker-calendar'><thead>"+"<tr>";thead=showWeek?"<th class='ui-datepicker-week-col'>"+this._get(inst,"weekHeader")+"</th>":"";for(dow=0;dow<7;dow++){// days of the week
day=(dow+firstDay)%7;thead+="<th scope='col'"+((dow+firstDay+6)%7>=5?" class='ui-datepicker-week-end'":"")+">"+"<span title='"+dayNames[day]+"'>"+dayNamesMin[day]+"</span></th>";}calender+=thead+"</tr></thead><tbody>";daysInMonth=this._getDaysInMonth(drawYear,drawMonth);if(drawYear===inst.selectedYear&&drawMonth===inst.selectedMonth){inst.selectedDay=Math.min(inst.selectedDay,daysInMonth);}leadDays=(this._getFirstDayOfMonth(drawYear,drawMonth)-firstDay+7)%7;curRows=Math.ceil((leadDays+daysInMonth)/7);// calculate the number of rows to generate
numRows=isMultiMonth?this.maxRows>curRows?this.maxRows:curRows:curRows;//If multiple months, use the higher number of rows (see #7043)
this.maxRows=numRows;printDate=this._daylightSavingAdjust(new Date(drawYear,drawMonth,1-leadDays));for(dRow=0;dRow<numRows;dRow++){// create date picker rows
calender+="<tr>";tbody=!showWeek?"":"<td class='ui-datepicker-week-col'>"+this._get(inst,"calculateWeek")(printDate)+"</td>";for(dow=0;dow<7;dow++){// create date picker days
daySettings=beforeShowDay?beforeShowDay.apply(inst.input?inst.input[0]:null,[printDate]):[true,""];otherMonth=printDate.getMonth()!==drawMonth;unselectable=otherMonth&&!selectOtherMonths||!daySettings[0]||minDate&&printDate<minDate||maxDate&&printDate>maxDate;tbody+="<td class='"+((dow+firstDay+6)%7>=5?" ui-datepicker-week-end":"")+(// highlight weekends
otherMonth?" ui-datepicker-other-month":"")+(// highlight days from other months
printDate.getTime()===selectedDate.getTime()&&drawMonth===inst.selectedMonth&&inst._keyEvent||// user pressed key
defaultDate.getTime()===printDate.getTime()&&defaultDate.getTime()===selectedDate.getTime()?// or defaultDate is current printedDate and defaultDate is selectedDate
" "+this._dayOverClass:"")+(// highlight selected day
unselectable?" "+this._unselectableClass+" ui-state-disabled":"")+(// highlight unselectable days
otherMonth&&!showOtherMonths?"":" "+daySettings[1]+(// highlight custom dates
printDate.getTime()===currentDate.getTime()?" "+this._currentClass:"")+(// highlight selected day
printDate.getTime()===today.getTime()?" ui-datepicker-today":""))+"'"+(// highlight today (if different)
(!otherMonth||showOtherMonths)&&daySettings[2]?" title='"+daySettings[2].replace(/'/g,"&#39;")+"'":"")+(// cell title
unselectable?"":" data-handler='selectDay' data-event='click' data-month='"+printDate.getMonth()+"' data-year='"+printDate.getFullYear()+"'")+">"+(// actions
otherMonth&&!showOtherMonths?"&#xa0;":// display for other months
unselectable?"<span class='ui-state-default'>"+printDate.getDate()+"</span>":"<a class='ui-state-default"+(printDate.getTime()===today.getTime()?" ui-state-highlight":"")+(printDate.getTime()===currentDate.getTime()?" ui-state-active":"")+(// highlight selected day
otherMonth?" ui-priority-secondary":"")+// distinguish dates from other months
"' href='#'>"+printDate.getDate()+"</a>")+"</td>";// display selectable date
printDate.setDate(printDate.getDate()+1);printDate=this._daylightSavingAdjust(printDate);}calender+=tbody+"</tr>";}drawMonth++;if(drawMonth>11){drawMonth=0;drawYear++;}calender+="</tbody></table>"+(isMultiMonth?"</div>"+(numMonths[0]>0&&col===numMonths[1]-1?"<div class='ui-datepicker-row-break'></div>":""):"");group+=calender;}html+=group;}html+=buttonPanel;inst._keyEvent=false;return html;},/* Generate the month and year header. */_generateMonthYearHeader:function _generateMonthYearHeader(inst,drawMonth,drawYear,minDate,maxDate,secondary,monthNames,monthNamesShort){var inMinYear,inMaxYear,month,years,thisYear,determineYear,year,endYear,changeMonth=this._get(inst,"changeMonth"),changeYear=this._get(inst,"changeYear"),showMonthAfterYear=this._get(inst,"showMonthAfterYear"),html="<div class='ui-datepicker-title'>",monthHtml="";// month selection
if(secondary||!changeMonth){monthHtml+="<span class='ui-datepicker-month'>"+monthNames[drawMonth]+"</span>";}else{inMinYear=minDate&&minDate.getFullYear()===drawYear;inMaxYear=maxDate&&maxDate.getFullYear()===drawYear;monthHtml+="<select class='ui-datepicker-month' data-handler='selectMonth' data-event='change'>";for(month=0;month<12;month++){if((!inMinYear||month>=minDate.getMonth())&&(!inMaxYear||month<=maxDate.getMonth())){monthHtml+="<option value='"+month+"'"+(month===drawMonth?" selected='selected'":"")+">"+monthNamesShort[month]+"</option>";}}monthHtml+="</select>";}if(!showMonthAfterYear){html+=monthHtml+(secondary||!(changeMonth&&changeYear)?"&#xa0;":"");}// year selection
if(!inst.yearshtml){inst.yearshtml="";if(secondary||!changeYear){html+="<span class='ui-datepicker-year'>"+drawYear+"</span>";}else{// determine range of years to display
years=this._get(inst,"yearRange").split(":");thisYear=new Date().getFullYear();determineYear=function determineYear(value){var year=value.match(/c[+\-].*/)?drawYear+parseInt(value.substring(1),10):value.match(/[+\-].*/)?thisYear+parseInt(value,10):parseInt(value,10);return isNaN(year)?thisYear:year;};year=determineYear(years[0]);endYear=Math.max(year,determineYear(years[1]||""));year=minDate?Math.max(year,minDate.getFullYear()):year;endYear=maxDate?Math.min(endYear,maxDate.getFullYear()):endYear;inst.yearshtml+="<select class='ui-datepicker-year' data-handler='selectYear' data-event='change'>";for(;year<=endYear;year++){inst.yearshtml+="<option value='"+year+"'"+(year===drawYear?" selected='selected'":"")+">"+year+"</option>";}inst.yearshtml+="</select>";html+=inst.yearshtml;inst.yearshtml=null;}}html+=this._get(inst,"yearSuffix");if(showMonthAfterYear){html+=(secondary||!(changeMonth&&changeYear)?"&#xa0;":"")+monthHtml;}html+="</div>";// Close datepicker_header
return html;},/* Adjust one of the date sub-fields. */_adjustInstDate:function _adjustInstDate(inst,offset,period){var year=inst.drawYear+(period==="Y"?offset:0),month=inst.drawMonth+(period==="M"?offset:0),day=Math.min(inst.selectedDay,this._getDaysInMonth(year,month))+(period==="D"?offset:0),date=this._restrictMinMax(inst,this._daylightSavingAdjust(new Date(year,month,day)));inst.selectedDay=date.getDate();inst.drawMonth=inst.selectedMonth=date.getMonth();inst.drawYear=inst.selectedYear=date.getFullYear();if(period==="M"||period==="Y"){this._notifyChange(inst);}},/* Ensure a date is within any min/max bounds. */_restrictMinMax:function _restrictMinMax(inst,date){var minDate=this._getMinMaxDate(inst,"min"),maxDate=this._getMinMaxDate(inst,"max"),newDate=minDate&&date<minDate?minDate:date;return maxDate&&newDate>maxDate?maxDate:newDate;},/* Notify change of month/year. */_notifyChange:function _notifyChange(inst){var onChange=this._get(inst,"onChangeMonthYear");if(onChange){onChange.apply(inst.input?inst.input[0]:null,[inst.selectedYear,inst.selectedMonth+1,inst]);}},/* Determine the number of months to show. */_getNumberOfMonths:function _getNumberOfMonths(inst){var numMonths=this._get(inst,"numberOfMonths");return numMonths==null?[1,1]:typeof numMonths==="number"?[1,numMonths]:numMonths;},/* Determine the current maximum date - ensure no time components are set. */_getMinMaxDate:function _getMinMaxDate(inst,minMax){return this._determineDate(inst,this._get(inst,minMax+"Date"),null);},/* Find the number of days in a given month. */_getDaysInMonth:function _getDaysInMonth(year,month){return 32-this._daylightSavingAdjust(new Date(year,month,32)).getDate();},/* Find the day of the week of the first of a month. */_getFirstDayOfMonth:function _getFirstDayOfMonth(year,month){return new Date(year,month,1).getDay();},/* Determines if we should allow a "next/prev" month display change. */_canAdjustMonth:function _canAdjustMonth(inst,offset,curYear,curMonth){var numMonths=this._getNumberOfMonths(inst),date=this._daylightSavingAdjust(new Date(curYear,curMonth+(offset<0?offset:numMonths[0]*numMonths[1]),1));if(offset<0){date.setDate(this._getDaysInMonth(date.getFullYear(),date.getMonth()));}return this._isInRange(inst,date);},/* Is the given date in the accepted range? */_isInRange:function _isInRange(inst,date){var yearSplit,currentYear,minDate=this._getMinMaxDate(inst,"min"),maxDate=this._getMinMaxDate(inst,"max"),minYear=null,maxYear=null,years=this._get(inst,"yearRange");if(years){yearSplit=years.split(":");currentYear=new Date().getFullYear();minYear=parseInt(yearSplit[0],10);maxYear=parseInt(yearSplit[1],10);if(yearSplit[0].match(/[+\-].*/)){minYear+=currentYear;}if(yearSplit[1].match(/[+\-].*/)){maxYear+=currentYear;}}return(!minDate||date.getTime()>=minDate.getTime())&&(!maxDate||date.getTime()<=maxDate.getTime())&&(!minYear||date.getFullYear()>=minYear)&&(!maxYear||date.getFullYear()<=maxYear);},/* Provide the configuration settings for formatting/parsing. */_getFormatConfig:function _getFormatConfig(inst){var shortYearCutoff=this._get(inst,"shortYearCutoff");shortYearCutoff=typeof shortYearCutoff!=="string"?shortYearCutoff:new Date().getFullYear()%100+parseInt(shortYearCutoff,10);return{shortYearCutoff:shortYearCutoff,dayNamesShort:this._get(inst,"dayNamesShort"),dayNames:this._get(inst,"dayNames"),monthNamesShort:this._get(inst,"monthNamesShort"),monthNames:this._get(inst,"monthNames")};},/* Format the given date for display. */_formatDate:function _formatDate(inst,day,month,year){if(!day){inst.currentDay=inst.selectedDay;inst.currentMonth=inst.selectedMonth;inst.currentYear=inst.selectedYear;}var date=day?(typeof day==="undefined"?"undefined":_typeof(day))==="object"?day:this._daylightSavingAdjust(new Date(year,month,day)):this._daylightSavingAdjust(new Date(inst.currentYear,inst.currentMonth,inst.currentDay));return this.formatDate(this._get(inst,"dateFormat"),date,this._getFormatConfig(inst));}});/*
 * Bind hover events for datepicker elements.
 * Done via delegate so the binding only occurs once in the lifetime of the parent div.
 * Global datepicker_instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
 */function datepicker_bindHover(dpDiv){var selector="button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a";return dpDiv.delegate(selector,"mouseout",function(){$(this).removeClass("ui-state-hover");if(this.className.indexOf("ui-datepicker-prev")!==-1){$(this).removeClass("ui-datepicker-prev-hover");}if(this.className.indexOf("ui-datepicker-next")!==-1){$(this).removeClass("ui-datepicker-next-hover");}}).delegate(selector,"mouseover",datepicker_handleMouseover);}function datepicker_handleMouseover(){if(!$.datepicker._isDisabledDatepicker(datepicker_instActive.inline?datepicker_instActive.dpDiv.parent()[0]:datepicker_instActive.input[0])){$(this).parents(".ui-datepicker-calendar").find("a").removeClass("ui-state-hover");$(this).addClass("ui-state-hover");if(this.className.indexOf("ui-datepicker-prev")!==-1){$(this).addClass("ui-datepicker-prev-hover");}if(this.className.indexOf("ui-datepicker-next")!==-1){$(this).addClass("ui-datepicker-next-hover");}}}/* jQuery extend now ignores nulls! */function datepicker_extendRemove(target,props){$.extend(target,props);for(var name in props){if(props[name]==null){target[name]=props[name];}}return target;}/* Invoke the datepicker functionality.
   @param  options  string - a command, optionally followed by additional parameters or
					Object - settings for attaching new datepicker functionality
   @return  jQuery object */$.fn.datepicker=function(options){/* Verify an empty collection wasn't passed - Fixes #6976 */if(!this.length){return this;}/* Initialise the date picker. */if(!$.datepicker.initialized){$(document).mousedown($.datepicker._checkExternalClick);$.datepicker.initialized=true;}/* Append datepicker main container to body if not exist. */if($("#"+$.datepicker._mainDivId).length===0){$("body").append($.datepicker.dpDiv);}var otherArgs=Array.prototype.slice.call(arguments,1);if(typeof options==="string"&&(options==="isDisabled"||options==="getDate"||options==="widget")){return $.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this[0]].concat(otherArgs));}if(options==="option"&&arguments.length===2&&typeof arguments[1]==="string"){return $.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this[0]].concat(otherArgs));}return this.each(function(){typeof options==="string"?$.datepicker["_"+options+"Datepicker"].apply($.datepicker,[this].concat(otherArgs)):$.datepicker._attachDatepicker(this,options);});};$.datepicker=new Datepicker();// singleton instance
$.datepicker.initialized=false;$.datepicker.uuid=new Date().getTime();$.datepicker.version="1.11.4";var datepicker=$.datepicker;/*!
 * jQuery UI Dialog 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/dialog/
 */var dialog=$.widget("ui.dialog",{version:"1.11.4",options:{appendTo:"body",autoOpen:true,buttons:[],closeOnEscape:true,closeText:"Close",dialogClass:"",draggable:true,hide:null,height:"auto",maxHeight:null,maxWidth:null,minHeight:150,minWidth:150,modal:false,position:{my:"center",at:"center",of:window,collision:"fit",// Ensure the titlebar is always visible
using:function using(pos){var topOffset=$(this).css(pos).offset().top;if(topOffset<0){$(this).css("top",pos.top-topOffset);}}},resizable:true,show:null,title:null,width:300,// callbacks
beforeClose:null,close:null,drag:null,dragStart:null,dragStop:null,focus:null,open:null,resize:null,resizeStart:null,resizeStop:null},sizeRelatedOptions:{buttons:true,height:true,maxHeight:true,maxWidth:true,minHeight:true,minWidth:true,width:true},resizableRelatedOptions:{maxHeight:true,maxWidth:true,minHeight:true,minWidth:true},_create:function _create(){this.originalCss={display:this.element[0].style.display,width:this.element[0].style.width,minHeight:this.element[0].style.minHeight,maxHeight:this.element[0].style.maxHeight,height:this.element[0].style.height};this.originalPosition={parent:this.element.parent(),index:this.element.parent().children().index(this.element)};this.originalTitle=this.element.attr("title");this.options.title=this.options.title||this.originalTitle;this._createWrapper();this.element.show().removeAttr("title").addClass("ui-dialog-content ui-widget-content").appendTo(this.uiDialog);this._createTitlebar();this._createButtonPane();if(this.options.draggable&&$.fn.draggable){this._makeDraggable();}if(this.options.resizable&&$.fn.resizable){this._makeResizable();}this._isOpen=false;this._trackFocus();},_init:function _init(){if(this.options.autoOpen){this.open();}},_appendTo:function _appendTo(){var element=this.options.appendTo;if(element&&(element.jquery||element.nodeType)){return $(element);}return this.document.find(element||"body").eq(0);},_destroy:function _destroy(){var next,originalPosition=this.originalPosition;this._untrackInstance();this._destroyOverlay();this.element.removeUniqueId().removeClass("ui-dialog-content ui-widget-content").css(this.originalCss)// Without detaching first, the following becomes really slow
.detach();this.uiDialog.stop(true,true).remove();if(this.originalTitle){this.element.attr("title",this.originalTitle);}next=originalPosition.parent.children().eq(originalPosition.index);// Don't try to place the dialog next to itself (#8613)
if(next.length&&next[0]!==this.element[0]){next.before(this.element);}else{originalPosition.parent.append(this.element);}},widget:function widget(){return this.uiDialog;},disable:$.noop,enable:$.noop,close:function close(event){var activeElement,that=this;if(!this._isOpen||this._trigger("beforeClose",event)===false){return;}this._isOpen=false;this._focusedElement=null;this._destroyOverlay();this._untrackInstance();if(!this.opener.filter(":focusable").focus().length){// support: IE9
// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
try{activeElement=this.document[0].activeElement;// Support: IE9, IE10
// If the <body> is blurred, IE will switch windows, see #4520
if(activeElement&&activeElement.nodeName.toLowerCase()!=="body"){// Hiding a focused element doesn't trigger blur in WebKit
// so in case we have nothing to focus on, explicitly blur the active element
// https://bugs.webkit.org/show_bug.cgi?id=47182
$(activeElement).blur();}}catch(error){}}this._hide(this.uiDialog,this.options.hide,function(){that._trigger("close",event);});},isOpen:function isOpen(){return this._isOpen;},moveToTop:function moveToTop(){this._moveToTop();},_moveToTop:function _moveToTop(event,silent){var moved=false,zIndices=this.uiDialog.siblings(".ui-front:visible").map(function(){return+$(this).css("z-index");}).get(),zIndexMax=Math.max.apply(null,zIndices);if(zIndexMax>=+this.uiDialog.css("z-index")){this.uiDialog.css("z-index",zIndexMax+1);moved=true;}if(moved&&!silent){this._trigger("focus",event);}return moved;},open:function open(){var that=this;if(this._isOpen){if(this._moveToTop()){this._focusTabbable();}return;}this._isOpen=true;this.opener=$(this.document[0].activeElement);this._size();this._position();this._createOverlay();this._moveToTop(null,true);// Ensure the overlay is moved to the top with the dialog, but only when
// opening. The overlay shouldn't move after the dialog is open so that
// modeless dialogs opened after the modal dialog stack properly.
if(this.overlay){this.overlay.css("z-index",this.uiDialog.css("z-index")-1);}this._show(this.uiDialog,this.options.show,function(){that._focusTabbable();that._trigger("focus");});// Track the dialog immediately upon openening in case a focus event
// somehow occurs outside of the dialog before an element inside the
// dialog is focused (#10152)
this._makeFocusTarget();this._trigger("open");},_focusTabbable:function _focusTabbable(){// Set focus to the first match:
// 1. An element that was focused previously
// 2. First element inside the dialog matching [autofocus]
// 3. Tabbable element inside the content element
// 4. Tabbable element inside the buttonpane
// 5. The close button
// 6. The dialog itself
var hasFocus=this._focusedElement;if(!hasFocus){hasFocus=this.element.find("[autofocus]");}if(!hasFocus.length){hasFocus=this.element.find(":tabbable");}if(!hasFocus.length){hasFocus=this.uiDialogButtonPane.find(":tabbable");}if(!hasFocus.length){hasFocus=this.uiDialogTitlebarClose.filter(":tabbable");}if(!hasFocus.length){hasFocus=this.uiDialog;}hasFocus.eq(0).focus();},_keepFocus:function _keepFocus(event){function checkFocus(){var activeElement=this.document[0].activeElement,isActive=this.uiDialog[0]===activeElement||$.contains(this.uiDialog[0],activeElement);if(!isActive){this._focusTabbable();}}event.preventDefault();checkFocus.call(this);// support: IE
// IE <= 8 doesn't prevent moving focus even with event.preventDefault()
// so we check again later
this._delay(checkFocus);},_createWrapper:function _createWrapper(){this.uiDialog=$("<div>").addClass("ui-dialog ui-widget ui-widget-content ui-corner-all ui-front "+this.options.dialogClass).hide().attr({// Setting tabIndex makes the div focusable
tabIndex:-1,role:"dialog"}).appendTo(this._appendTo());this._on(this.uiDialog,{keydown:function keydown(event){if(this.options.closeOnEscape&&!event.isDefaultPrevented()&&event.keyCode&&event.keyCode===$.ui.keyCode.ESCAPE){event.preventDefault();this.close(event);return;}// prevent tabbing out of dialogs
if(event.keyCode!==$.ui.keyCode.TAB||event.isDefaultPrevented()){return;}var tabbables=this.uiDialog.find(":tabbable"),first=tabbables.filter(":first"),last=tabbables.filter(":last");if((event.target===last[0]||event.target===this.uiDialog[0])&&!event.shiftKey){this._delay(function(){first.focus();});event.preventDefault();}else if((event.target===first[0]||event.target===this.uiDialog[0])&&event.shiftKey){this._delay(function(){last.focus();});event.preventDefault();}},mousedown:function mousedown(event){if(this._moveToTop(event)){this._focusTabbable();}}});// We assume that any existing aria-describedby attribute means
// that the dialog content is marked up properly
// otherwise we brute force the content as the description
if(!this.element.find("[aria-describedby]").length){this.uiDialog.attr({"aria-describedby":this.element.uniqueId().attr("id")});}},_createTitlebar:function _createTitlebar(){var uiDialogTitle;this.uiDialogTitlebar=$("<div>").addClass("ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix").prependTo(this.uiDialog);this._on(this.uiDialogTitlebar,{mousedown:function mousedown(event){// Don't prevent click on close button (#8838)
// Focusing a dialog that is partially scrolled out of view
// causes the browser to scroll it into view, preventing the click event
if(!$(event.target).closest(".ui-dialog-titlebar-close")){// Dialog isn't getting focus when dragging (#8063)
this.uiDialog.focus();}}});// support: IE
// Use type="button" to prevent enter keypresses in textboxes from closing the
// dialog in IE (#9312)
this.uiDialogTitlebarClose=$("<button type='button'></button>").button({label:this.options.closeText,icons:{primary:"ui-icon-closethick"},text:false}).addClass("ui-dialog-titlebar-close").appendTo(this.uiDialogTitlebar);this._on(this.uiDialogTitlebarClose,{click:function click(event){event.preventDefault();this.close(event);}});uiDialogTitle=$("<span>").uniqueId().addClass("ui-dialog-title").prependTo(this.uiDialogTitlebar);this._title(uiDialogTitle);this.uiDialog.attr({"aria-labelledby":uiDialogTitle.attr("id")});},_title:function _title(title){if(!this.options.title){title.html("&#160;");}title.text(this.options.title);},_createButtonPane:function _createButtonPane(){this.uiDialogButtonPane=$("<div>").addClass("ui-dialog-buttonpane ui-widget-content ui-helper-clearfix");this.uiButtonSet=$("<div>").addClass("ui-dialog-buttonset").appendTo(this.uiDialogButtonPane);this._createButtons();},_createButtons:function _createButtons(){var that=this,buttons=this.options.buttons;// if we already have a button pane, remove it
this.uiDialogButtonPane.remove();this.uiButtonSet.empty();if($.isEmptyObject(buttons)||$.isArray(buttons)&&!buttons.length){this.uiDialog.removeClass("ui-dialog-buttons");return;}$.each(buttons,function(name,props){var click,buttonOptions;props=$.isFunction(props)?{click:props,text:name}:props;// Default to a non-submitting button
props=$.extend({type:"button"},props);// Change the context for the click callback to be the main element
click=props.click;props.click=function(){click.apply(that.element[0],arguments);};buttonOptions={icons:props.icons,text:props.showText};delete props.icons;delete props.showText;$("<button></button>",props).button(buttonOptions).appendTo(that.uiButtonSet);});this.uiDialog.addClass("ui-dialog-buttons");this.uiDialogButtonPane.appendTo(this.uiDialog);},_makeDraggable:function _makeDraggable(){var that=this,options=this.options;function filteredUi(ui){return{position:ui.position,offset:ui.offset};}this.uiDialog.draggable({cancel:".ui-dialog-content, .ui-dialog-titlebar-close",handle:".ui-dialog-titlebar",containment:"document",start:function start(event,ui){$(this).addClass("ui-dialog-dragging");that._blockFrames();that._trigger("dragStart",event,filteredUi(ui));},drag:function drag(event,ui){that._trigger("drag",event,filteredUi(ui));},stop:function stop(event,ui){var left=ui.offset.left-that.document.scrollLeft(),top=ui.offset.top-that.document.scrollTop();options.position={my:"left top",at:"left"+(left>=0?"+":"")+left+" "+"top"+(top>=0?"+":"")+top,of:that.window};$(this).removeClass("ui-dialog-dragging");that._unblockFrames();that._trigger("dragStop",event,filteredUi(ui));}});},_makeResizable:function _makeResizable(){var that=this,options=this.options,handles=options.resizable,// .ui-resizable has position: relative defined in the stylesheet
// but dialogs have to use absolute or fixed positioning
position=this.uiDialog.css("position"),resizeHandles=typeof handles==="string"?handles:"n,e,s,w,se,sw,ne,nw";function filteredUi(ui){return{originalPosition:ui.originalPosition,originalSize:ui.originalSize,position:ui.position,size:ui.size};}this.uiDialog.resizable({cancel:".ui-dialog-content",containment:"document",alsoResize:this.element,maxWidth:options.maxWidth,maxHeight:options.maxHeight,minWidth:options.minWidth,minHeight:this._minHeight(),handles:resizeHandles,start:function start(event,ui){$(this).addClass("ui-dialog-resizing");that._blockFrames();that._trigger("resizeStart",event,filteredUi(ui));},resize:function resize(event,ui){that._trigger("resize",event,filteredUi(ui));},stop:function stop(event,ui){var offset=that.uiDialog.offset(),left=offset.left-that.document.scrollLeft(),top=offset.top-that.document.scrollTop();options.height=that.uiDialog.height();options.width=that.uiDialog.width();options.position={my:"left top",at:"left"+(left>=0?"+":"")+left+" "+"top"+(top>=0?"+":"")+top,of:that.window};$(this).removeClass("ui-dialog-resizing");that._unblockFrames();that._trigger("resizeStop",event,filteredUi(ui));}}).css("position",position);},_trackFocus:function _trackFocus(){this._on(this.widget(),{focusin:function focusin(event){this._makeFocusTarget();this._focusedElement=$(event.target);}});},_makeFocusTarget:function _makeFocusTarget(){this._untrackInstance();this._trackingInstances().unshift(this);},_untrackInstance:function _untrackInstance(){var instances=this._trackingInstances(),exists=$.inArray(this,instances);if(exists!==-1){instances.splice(exists,1);}},_trackingInstances:function _trackingInstances(){var instances=this.document.data("ui-dialog-instances");if(!instances){instances=[];this.document.data("ui-dialog-instances",instances);}return instances;},_minHeight:function _minHeight(){var options=this.options;return options.height==="auto"?options.minHeight:Math.min(options.minHeight,options.height);},_position:function _position(){// Need to show the dialog to get the actual offset in the position plugin
var isVisible=this.uiDialog.is(":visible");if(!isVisible){this.uiDialog.show();}this.uiDialog.position(this.options.position);if(!isVisible){this.uiDialog.hide();}},_setOptions:function _setOptions(options){var that=this,resize=false,resizableOptions={};$.each(options,function(key,value){that._setOption(key,value);if(key in that.sizeRelatedOptions){resize=true;}if(key in that.resizableRelatedOptions){resizableOptions[key]=value;}});if(resize){this._size();this._position();}if(this.uiDialog.is(":data(ui-resizable)")){this.uiDialog.resizable("option",resizableOptions);}},_setOption:function _setOption(key,value){var isDraggable,isResizable,uiDialog=this.uiDialog;if(key==="dialogClass"){uiDialog.removeClass(this.options.dialogClass).addClass(value);}if(key==="disabled"){return;}this._super(key,value);if(key==="appendTo"){this.uiDialog.appendTo(this._appendTo());}if(key==="buttons"){this._createButtons();}if(key==="closeText"){this.uiDialogTitlebarClose.button({// Ensure that we always pass a string
label:""+value});}if(key==="draggable"){isDraggable=uiDialog.is(":data(ui-draggable)");if(isDraggable&&!value){uiDialog.draggable("destroy");}if(!isDraggable&&value){this._makeDraggable();}}if(key==="position"){this._position();}if(key==="resizable"){// currently resizable, becoming non-resizable
isResizable=uiDialog.is(":data(ui-resizable)");if(isResizable&&!value){uiDialog.resizable("destroy");}// currently resizable, changing handles
if(isResizable&&typeof value==="string"){uiDialog.resizable("option","handles",value);}// currently non-resizable, becoming resizable
if(!isResizable&&value!==false){this._makeResizable();}}if(key==="title"){this._title(this.uiDialogTitlebar.find(".ui-dialog-title"));}},_size:function _size(){// If the user has resized the dialog, the .ui-dialog and .ui-dialog-content
// divs will both have width and height set, so we need to reset them
var nonContentHeight,minContentHeight,maxContentHeight,options=this.options;// Reset content sizing
this.element.show().css({width:"auto",minHeight:0,maxHeight:"none",height:0});if(options.minWidth>options.width){options.width=options.minWidth;}// reset wrapper sizing
// determine the height of all the non-content elements
nonContentHeight=this.uiDialog.css({height:"auto",width:options.width}).outerHeight();minContentHeight=Math.max(0,options.minHeight-nonContentHeight);maxContentHeight=typeof options.maxHeight==="number"?Math.max(0,options.maxHeight-nonContentHeight):"none";if(options.height==="auto"){this.element.css({minHeight:minContentHeight,maxHeight:maxContentHeight,height:"auto"});}else{this.element.height(Math.max(0,options.height-nonContentHeight));}if(this.uiDialog.is(":data(ui-resizable)")){this.uiDialog.resizable("option","minHeight",this._minHeight());}},_blockFrames:function _blockFrames(){this.iframeBlocks=this.document.find("iframe").map(function(){var iframe=$(this);return $("<div>").css({position:"absolute",width:iframe.outerWidth(),height:iframe.outerHeight()}).appendTo(iframe.parent()).offset(iframe.offset())[0];});},_unblockFrames:function _unblockFrames(){if(this.iframeBlocks){this.iframeBlocks.remove();delete this.iframeBlocks;}},_allowInteraction:function _allowInteraction(event){if($(event.target).closest(".ui-dialog").length){return true;}// TODO: Remove hack when datepicker implements
// the .ui-front logic (#8989)
return!!$(event.target).closest(".ui-datepicker").length;},_createOverlay:function _createOverlay(){if(!this.options.modal){return;}// We use a delay in case the overlay is created from an
// event that we're going to be cancelling (#2804)
var isOpening=true;this._delay(function(){isOpening=false;});if(!this.document.data("ui-dialog-overlays")){// Prevent use of anchors and inputs
// Using _on() for an event handler shared across many instances is
// safe because the dialogs stack and must be closed in reverse order
this._on(this.document,{focusin:function focusin(event){if(isOpening){return;}if(!this._allowInteraction(event)){event.preventDefault();this._trackingInstances()[0]._focusTabbable();}}});}this.overlay=$("<div>").addClass("ui-widget-overlay ui-front").appendTo(this._appendTo());this._on(this.overlay,{mousedown:"_keepFocus"});this.document.data("ui-dialog-overlays",(this.document.data("ui-dialog-overlays")||0)+1);},_destroyOverlay:function _destroyOverlay(){if(!this.options.modal){return;}if(this.overlay){var overlays=this.document.data("ui-dialog-overlays")-1;if(!overlays){this.document.unbind("focusin").removeData("ui-dialog-overlays");}else{this.document.data("ui-dialog-overlays",overlays);}this.overlay.remove();this.overlay=null;}}});/*!
 * jQuery UI Progressbar 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/progressbar/
 */var progressbar=$.widget("ui.progressbar",{version:"1.11.4",options:{max:100,value:0,change:null,complete:null},min:0,_create:function _create(){// Constrain initial value
this.oldValue=this.options.value=this._constrainedValue();this.element.addClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").attr({// Only set static values, aria-valuenow and aria-valuemax are
// set inside _refreshValue()
role:"progressbar","aria-valuemin":this.min});this.valueDiv=$("<div class='ui-progressbar-value ui-widget-header ui-corner-left'></div>").appendTo(this.element);this._refreshValue();},_destroy:function _destroy(){this.element.removeClass("ui-progressbar ui-widget ui-widget-content ui-corner-all").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");this.valueDiv.remove();},value:function value(newValue){if(newValue===undefined){return this.options.value;}this.options.value=this._constrainedValue(newValue);this._refreshValue();},_constrainedValue:function _constrainedValue(newValue){if(newValue===undefined){newValue=this.options.value;}this.indeterminate=newValue===false;// sanitize value
if(typeof newValue!=="number"){newValue=0;}return this.indeterminate?false:Math.min(this.options.max,Math.max(this.min,newValue));},_setOptions:function _setOptions(options){// Ensure "value" option is set after other values (like max)
var value=options.value;delete options.value;this._super(options);this.options.value=this._constrainedValue(value);this._refreshValue();},_setOption:function _setOption(key,value){if(key==="max"){// Don't allow a max less than min
value=Math.max(this.min,value);}if(key==="disabled"){this.element.toggleClass("ui-state-disabled",!!value).attr("aria-disabled",value);}this._super(key,value);},_percentage:function _percentage(){return this.indeterminate?100:100*(this.options.value-this.min)/(this.options.max-this.min);},_refreshValue:function _refreshValue(){var value=this.options.value,percentage=this._percentage();this.valueDiv.toggle(this.indeterminate||value>this.min).toggleClass("ui-corner-right",value===this.options.max).width(percentage.toFixed(0)+"%");this.element.toggleClass("ui-progressbar-indeterminate",this.indeterminate);if(this.indeterminate){this.element.removeAttr("aria-valuenow");if(!this.overlayDiv){this.overlayDiv=$("<div class='ui-progressbar-overlay'></div>").appendTo(this.valueDiv);}}else{this.element.attr({"aria-valuemax":this.options.max,"aria-valuenow":value});if(this.overlayDiv){this.overlayDiv.remove();this.overlayDiv=null;}}if(this.oldValue!==value){this.oldValue=value;this._trigger("change");}if(value===this.options.max){this._trigger("complete");}}});/*!
 * jQuery UI Selectmenu 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/selectmenu
 */var selectmenu=$.widget("ui.selectmenu",{version:"1.11.4",defaultElement:"<select>",options:{appendTo:null,disabled:null,icons:{button:"ui-icon-triangle-1-s"},position:{my:"left top",at:"left bottom",collision:"none"},width:null,// callbacks
change:null,close:null,focus:null,open:null,select:null},_create:function _create(){var selectmenuId=this.element.uniqueId().attr("id");this.ids={element:selectmenuId,button:selectmenuId+"-button",menu:selectmenuId+"-menu"};this._drawButton();this._drawMenu();if(this.options.disabled){this.disable();}},_drawButton:function _drawButton(){var that=this;// Associate existing label with the new button
this.label=$("label[for='"+this.ids.element+"']").attr("for",this.ids.button);this._on(this.label,{click:function click(event){this.button.focus();event.preventDefault();}});// Hide original select element
this.element.hide();// Create button
this.button=$("<span>",{"class":"ui-selectmenu-button ui-widget ui-state-default ui-corner-all",tabindex:this.options.disabled?-1:0,id:this.ids.button,role:"combobox","aria-expanded":"false","aria-autocomplete":"list","aria-owns":this.ids.menu,"aria-haspopup":"true"}).insertAfter(this.element);$("<span>",{"class":"ui-icon "+this.options.icons.button}).prependTo(this.button);this.buttonText=$("<span>",{"class":"ui-selectmenu-text"}).appendTo(this.button);this._setText(this.buttonText,this.element.find("option:selected").text());this._resizeButton();this._on(this.button,this._buttonEvents);this.button.one("focusin",function(){// Delay rendering the menu items until the button receives focus.
// The menu may have already been rendered via a programmatic open.
if(!that.menuItems){that._refreshMenu();}});this._hoverable(this.button);this._focusable(this.button);},_drawMenu:function _drawMenu(){var that=this;// Create menu
this.menu=$("<ul>",{"aria-hidden":"true","aria-labelledby":this.ids.button,id:this.ids.menu});// Wrap menu
this.menuWrap=$("<div>",{"class":"ui-selectmenu-menu ui-front"}).append(this.menu).appendTo(this._appendTo());// Initialize menu widget
this.menuInstance=this.menu.menu({role:"listbox",select:function select(event,ui){event.preventDefault();// support: IE8
// If the item was selected via a click, the text selection
// will be destroyed in IE
that._setSelection();that._select(ui.item.data("ui-selectmenu-item"),event);},focus:function focus(event,ui){var item=ui.item.data("ui-selectmenu-item");// Prevent inital focus from firing and check if its a newly focused item
if(that.focusIndex!=null&&item.index!==that.focusIndex){that._trigger("focus",event,{item:item});if(!that.isOpen){that._select(item,event);}}that.focusIndex=item.index;that.button.attr("aria-activedescendant",that.menuItems.eq(item.index).attr("id"));}}).menu("instance");// Adjust menu styles to dropdown
this.menu.addClass("ui-corner-bottom").removeClass("ui-corner-all");// Don't close the menu on mouseleave
this.menuInstance._off(this.menu,"mouseleave");// Cancel the menu's collapseAll on document click
this.menuInstance._closeOnDocumentClick=function(){return false;};// Selects often contain empty items, but never contain dividers
this.menuInstance._isDivider=function(){return false;};},refresh:function refresh(){this._refreshMenu();this._setText(this.buttonText,this._getSelectedItem().text());if(!this.options.width){this._resizeButton();}},_refreshMenu:function _refreshMenu(){this.menu.empty();var item,options=this.element.find("option");if(!options.length){return;}this._parseOptions(options);this._renderMenu(this.menu,this.items);this.menuInstance.refresh();this.menuItems=this.menu.find("li").not(".ui-selectmenu-optgroup");item=this._getSelectedItem();// Update the menu to have the correct item focused
this.menuInstance.focus(null,item);this._setAria(item.data("ui-selectmenu-item"));// Set disabled state
this._setOption("disabled",this.element.prop("disabled"));},open:function open(event){if(this.options.disabled){return;}// If this is the first time the menu is being opened, render the items
if(!this.menuItems){this._refreshMenu();}else{// Menu clears focus on close, reset focus to selected item
this.menu.find(".ui-state-focus").removeClass("ui-state-focus");this.menuInstance.focus(null,this._getSelectedItem());}this.isOpen=true;this._toggleAttr();this._resizeMenu();this._position();this._on(this.document,this._documentClick);this._trigger("open",event);},_position:function _position(){this.menuWrap.position($.extend({of:this.button},this.options.position));},close:function close(event){if(!this.isOpen){return;}this.isOpen=false;this._toggleAttr();this.range=null;this._off(this.document);this._trigger("close",event);},widget:function widget(){return this.button;},menuWidget:function menuWidget(){return this.menu;},_renderMenu:function _renderMenu(ul,items){var that=this,currentOptgroup="";$.each(items,function(index,item){if(item.optgroup!==currentOptgroup){$("<li>",{"class":"ui-selectmenu-optgroup ui-menu-divider"+(item.element.parent("optgroup").prop("disabled")?" ui-state-disabled":""),text:item.optgroup}).appendTo(ul);currentOptgroup=item.optgroup;}that._renderItemData(ul,item);});},_renderItemData:function _renderItemData(ul,item){return this._renderItem(ul,item).data("ui-selectmenu-item",item);},_renderItem:function _renderItem(ul,item){var li=$("<li>");if(item.disabled){li.addClass("ui-state-disabled");}this._setText(li,item.label);return li.appendTo(ul);},_setText:function _setText(element,value){if(value){element.text(value);}else{element.html("&#160;");}},_move:function _move(direction,event){var item,next,filter=".ui-menu-item";if(this.isOpen){item=this.menuItems.eq(this.focusIndex);}else{item=this.menuItems.eq(this.element[0].selectedIndex);filter+=":not(.ui-state-disabled)";}if(direction==="first"||direction==="last"){next=item[direction==="first"?"prevAll":"nextAll"](filter).eq(-1);}else{next=item[direction+"All"](filter).eq(0);}if(next.length){this.menuInstance.focus(event,next);}},_getSelectedItem:function _getSelectedItem(){return this.menuItems.eq(this.element[0].selectedIndex);},_toggle:function _toggle(event){this[this.isOpen?"close":"open"](event);},_setSelection:function _setSelection(){var selection;if(!this.range){return;}if(window.getSelection){selection=window.getSelection();selection.removeAllRanges();selection.addRange(this.range);// support: IE8
}else{this.range.select();}// support: IE
// Setting the text selection kills the button focus in IE, but
// restoring the focus doesn't kill the selection.
this.button.focus();},_documentClick:{mousedown:function mousedown(event){if(!this.isOpen){return;}if(!$(event.target).closest(".ui-selectmenu-menu, #"+this.ids.button).length){this.close(event);}}},_buttonEvents:{// Prevent text selection from being reset when interacting with the selectmenu (#10144)
mousedown:function mousedown(){var selection;if(window.getSelection){selection=window.getSelection();if(selection.rangeCount){this.range=selection.getRangeAt(0);}// support: IE8
}else{this.range=document.selection.createRange();}},click:function click(event){this._setSelection();this._toggle(event);},keydown:function keydown(event){var preventDefault=true;switch(event.keyCode){case $.ui.keyCode.TAB:case $.ui.keyCode.ESCAPE:this.close(event);preventDefault=false;break;case $.ui.keyCode.ENTER:if(this.isOpen){this._selectFocusedItem(event);}break;case $.ui.keyCode.UP:if(event.altKey){this._toggle(event);}else{this._move("prev",event);}break;case $.ui.keyCode.DOWN:if(event.altKey){this._toggle(event);}else{this._move("next",event);}break;case $.ui.keyCode.SPACE:if(this.isOpen){this._selectFocusedItem(event);}else{this._toggle(event);}break;case $.ui.keyCode.LEFT:this._move("prev",event);break;case $.ui.keyCode.RIGHT:this._move("next",event);break;case $.ui.keyCode.HOME:case $.ui.keyCode.PAGE_UP:this._move("first",event);break;case $.ui.keyCode.END:case $.ui.keyCode.PAGE_DOWN:this._move("last",event);break;default:this.menu.trigger(event);preventDefault=false;}if(preventDefault){event.preventDefault();}}},_selectFocusedItem:function _selectFocusedItem(event){var item=this.menuItems.eq(this.focusIndex);if(!item.hasClass("ui-state-disabled")){this._select(item.data("ui-selectmenu-item"),event);}},_select:function _select(item,event){var oldIndex=this.element[0].selectedIndex;// Change native select element
this.element[0].selectedIndex=item.index;this._setText(this.buttonText,item.label);this._setAria(item);this._trigger("select",event,{item:item});if(item.index!==oldIndex){this._trigger("change",event,{item:item});}this.close(event);},_setAria:function _setAria(item){var id=this.menuItems.eq(item.index).attr("id");this.button.attr({"aria-labelledby":id,"aria-activedescendant":id});this.menu.attr("aria-activedescendant",id);},_setOption:function _setOption(key,value){if(key==="icons"){this.button.find("span.ui-icon").removeClass(this.options.icons.button).addClass(value.button);}this._super(key,value);if(key==="appendTo"){this.menuWrap.appendTo(this._appendTo());}if(key==="disabled"){this.menuInstance.option("disabled",value);this.button.toggleClass("ui-state-disabled",value).attr("aria-disabled",value);this.element.prop("disabled",value);if(value){this.button.attr("tabindex",-1);this.close();}else{this.button.attr("tabindex",0);}}if(key==="width"){this._resizeButton();}},_appendTo:function _appendTo(){var element=this.options.appendTo;if(element){element=element.jquery||element.nodeType?$(element):this.document.find(element).eq(0);}if(!element||!element[0]){element=this.element.closest(".ui-front");}if(!element.length){element=this.document[0].body;}return element;},_toggleAttr:function _toggleAttr(){this.button.toggleClass("ui-corner-top",this.isOpen).toggleClass("ui-corner-all",!this.isOpen).attr("aria-expanded",this.isOpen);this.menuWrap.toggleClass("ui-selectmenu-open",this.isOpen);this.menu.attr("aria-hidden",!this.isOpen);},_resizeButton:function _resizeButton(){var width=this.options.width;if(!width){width=this.element.show().outerWidth();this.element.hide();}this.button.outerWidth(width);},_resizeMenu:function _resizeMenu(){this.menu.outerWidth(Math.max(this.button.outerWidth(),// support: IE10
// IE10 wraps long text (possibly a rounding bug)
// so we add 1px to avoid the wrapping
this.menu.width("").outerWidth()+1));},_getCreateOptions:function _getCreateOptions(){return{disabled:this.element.prop("disabled")};},_parseOptions:function _parseOptions(options){var data=[];options.each(function(index,item){var option=$(item),optgroup=option.parent("optgroup");data.push({element:option,index:index,value:option.val(),label:option.text(),optgroup:optgroup.attr("label")||"",disabled:optgroup.prop("disabled")||option.prop("disabled")});});this.items=data;},_destroy:function _destroy(){this.menuWrap.remove();this.button.remove();this.element.show();this.element.removeUniqueId();this.label.attr("for",this.ids.element);}});/*!
 * jQuery UI Slider 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/slider/
 */var slider=$.widget("ui.slider",$.ui.mouse,{version:"1.11.4",widgetEventPrefix:"slide",options:{animate:false,distance:0,max:100,min:0,orientation:"horizontal",range:false,step:1,value:0,values:null,// callbacks
change:null,slide:null,start:null,stop:null},// number of pages in a slider
// (how many times can you page up/down to go through the whole range)
numPages:5,_create:function _create(){this._keySliding=false;this._mouseSliding=false;this._animateOff=true;this._handleIndex=null;this._detectOrientation();this._mouseInit();this._calculateNewMax();this.element.addClass("ui-slider"+" ui-slider-"+this.orientation+" ui-widget"+" ui-widget-content"+" ui-corner-all");this._refresh();this._setOption("disabled",this.options.disabled);this._animateOff=false;},_refresh:function _refresh(){this._createRange();this._createHandles();this._setupEvents();this._refreshValue();},_createHandles:function _createHandles(){var i,handleCount,options=this.options,existingHandles=this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),handle="<span class='ui-slider-handle ui-state-default ui-corner-all' tabindex='0'></span>",handles=[];handleCount=options.values&&options.values.length||1;if(existingHandles.length>handleCount){existingHandles.slice(handleCount).remove();existingHandles=existingHandles.slice(0,handleCount);}for(i=existingHandles.length;i<handleCount;i++){handles.push(handle);}this.handles=existingHandles.add($(handles.join("")).appendTo(this.element));this.handle=this.handles.eq(0);this.handles.each(function(i){$(this).data("ui-slider-handle-index",i);});},_createRange:function _createRange(){var options=this.options,classes="";if(options.range){if(options.range===true){if(!options.values){options.values=[this._valueMin(),this._valueMin()];}else if(options.values.length&&options.values.length!==2){options.values=[options.values[0],options.values[0]];}else if($.isArray(options.values)){options.values=options.values.slice(0);}}if(!this.range||!this.range.length){this.range=$("<div></div>").appendTo(this.element);classes="ui-slider-range"+// note: this isn't the most fittingly semantic framework class for this element,
// but worked best visually with a variety of themes
" ui-widget-header ui-corner-all";}else{this.range.removeClass("ui-slider-range-min ui-slider-range-max")// Handle range switching from true to min/max
.css({"left":"","bottom":""});}this.range.addClass(classes+(options.range==="min"||options.range==="max"?" ui-slider-range-"+options.range:""));}else{if(this.range){this.range.remove();}this.range=null;}},_setupEvents:function _setupEvents(){this._off(this.handles);this._on(this.handles,this._handleEvents);this._hoverable(this.handles);this._focusable(this.handles);},_destroy:function _destroy(){this.handles.remove();if(this.range){this.range.remove();}this.element.removeClass("ui-slider"+" ui-slider-horizontal"+" ui-slider-vertical"+" ui-widget"+" ui-widget-content"+" ui-corner-all");this._mouseDestroy();},_mouseCapture:function _mouseCapture(event){var position,normValue,distance,closestHandle,index,allowed,offset,mouseOverHandle,that=this,o=this.options;if(o.disabled){return false;}this.elementSize={width:this.element.outerWidth(),height:this.element.outerHeight()};this.elementOffset=this.element.offset();position={x:event.pageX,y:event.pageY};normValue=this._normValueFromMouse(position);distance=this._valueMax()-this._valueMin()+1;this.handles.each(function(i){var thisDistance=Math.abs(normValue-that.values(i));if(distance>thisDistance||distance===thisDistance&&(i===that._lastChangedValue||that.values(i)===o.min)){distance=thisDistance;closestHandle=$(this);index=i;}});allowed=this._start(event,index);if(allowed===false){return false;}this._mouseSliding=true;this._handleIndex=index;closestHandle.addClass("ui-state-active").focus();offset=closestHandle.offset();mouseOverHandle=!$(event.target).parents().addBack().is(".ui-slider-handle");this._clickOffset=mouseOverHandle?{left:0,top:0}:{left:event.pageX-offset.left-closestHandle.width()/2,top:event.pageY-offset.top-closestHandle.height()/2-(parseInt(closestHandle.css("borderTopWidth"),10)||0)-(parseInt(closestHandle.css("borderBottomWidth"),10)||0)+(parseInt(closestHandle.css("marginTop"),10)||0)};if(!this.handles.hasClass("ui-state-hover")){this._slide(event,index,normValue);}this._animateOff=true;return true;},_mouseStart:function _mouseStart(){return true;},_mouseDrag:function _mouseDrag(event){var position={x:event.pageX,y:event.pageY},normValue=this._normValueFromMouse(position);this._slide(event,this._handleIndex,normValue);return false;},_mouseStop:function _mouseStop(event){this.handles.removeClass("ui-state-active");this._mouseSliding=false;this._stop(event,this._handleIndex);this._change(event,this._handleIndex);this._handleIndex=null;this._clickOffset=null;this._animateOff=false;return false;},_detectOrientation:function _detectOrientation(){this.orientation=this.options.orientation==="vertical"?"vertical":"horizontal";},_normValueFromMouse:function _normValueFromMouse(position){var pixelTotal,pixelMouse,percentMouse,valueTotal,valueMouse;if(this.orientation==="horizontal"){pixelTotal=this.elementSize.width;pixelMouse=position.x-this.elementOffset.left-(this._clickOffset?this._clickOffset.left:0);}else{pixelTotal=this.elementSize.height;pixelMouse=position.y-this.elementOffset.top-(this._clickOffset?this._clickOffset.top:0);}percentMouse=pixelMouse/pixelTotal;if(percentMouse>1){percentMouse=1;}if(percentMouse<0){percentMouse=0;}if(this.orientation==="vertical"){percentMouse=1-percentMouse;}valueTotal=this._valueMax()-this._valueMin();valueMouse=this._valueMin()+percentMouse*valueTotal;return this._trimAlignValue(valueMouse);},_start:function _start(event,index){var uiHash={handle:this.handles[index],value:this.value()};if(this.options.values&&this.options.values.length){uiHash.value=this.values(index);uiHash.values=this.values();}return this._trigger("start",event,uiHash);},_slide:function _slide(event,index,newVal){var otherVal,newValues,allowed;if(this.options.values&&this.options.values.length){otherVal=this.values(index?0:1);if(this.options.values.length===2&&this.options.range===true&&(index===0&&newVal>otherVal||index===1&&newVal<otherVal)){newVal=otherVal;}if(newVal!==this.values(index)){newValues=this.values();newValues[index]=newVal;// A slide can be canceled by returning false from the slide callback
allowed=this._trigger("slide",event,{handle:this.handles[index],value:newVal,values:newValues});otherVal=this.values(index?0:1);if(allowed!==false){this.values(index,newVal);}}}else{if(newVal!==this.value()){// A slide can be canceled by returning false from the slide callback
allowed=this._trigger("slide",event,{handle:this.handles[index],value:newVal});if(allowed!==false){this.value(newVal);}}}},_stop:function _stop(event,index){var uiHash={handle:this.handles[index],value:this.value()};if(this.options.values&&this.options.values.length){uiHash.value=this.values(index);uiHash.values=this.values();}this._trigger("stop",event,uiHash);},_change:function _change(event,index){if(!this._keySliding&&!this._mouseSliding){var uiHash={handle:this.handles[index],value:this.value()};if(this.options.values&&this.options.values.length){uiHash.value=this.values(index);uiHash.values=this.values();}//store the last changed value index for reference when handles overlap
this._lastChangedValue=index;this._trigger("change",event,uiHash);}},value:function value(newValue){if(arguments.length){this.options.value=this._trimAlignValue(newValue);this._refreshValue();this._change(null,0);return;}return this._value();},values:function values(index,newValue){var vals,newValues,i;if(arguments.length>1){this.options.values[index]=this._trimAlignValue(newValue);this._refreshValue();this._change(null,index);return;}if(arguments.length){if($.isArray(arguments[0])){vals=this.options.values;newValues=arguments[0];for(i=0;i<vals.length;i+=1){vals[i]=this._trimAlignValue(newValues[i]);this._change(null,i);}this._refreshValue();}else{if(this.options.values&&this.options.values.length){return this._values(index);}else{return this.value();}}}else{return this._values();}},_setOption:function _setOption(key,value){var i,valsLength=0;if(key==="range"&&this.options.range===true){if(value==="min"){this.options.value=this._values(0);this.options.values=null;}else if(value==="max"){this.options.value=this._values(this.options.values.length-1);this.options.values=null;}}if($.isArray(this.options.values)){valsLength=this.options.values.length;}if(key==="disabled"){this.element.toggleClass("ui-state-disabled",!!value);}this._super(key,value);switch(key){case"orientation":this._detectOrientation();this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-"+this.orientation);this._refreshValue();// Reset positioning from previous orientation
this.handles.css(value==="horizontal"?"bottom":"left","");break;case"value":this._animateOff=true;this._refreshValue();this._change(null,0);this._animateOff=false;break;case"values":this._animateOff=true;this._refreshValue();for(i=0;i<valsLength;i+=1){this._change(null,i);}this._animateOff=false;break;case"step":case"min":case"max":this._animateOff=true;this._calculateNewMax();this._refreshValue();this._animateOff=false;break;case"range":this._animateOff=true;this._refresh();this._animateOff=false;break;}},//internal value getter
// _value() returns value trimmed by min and max, aligned by step
_value:function _value(){var val=this.options.value;val=this._trimAlignValue(val);return val;},//internal values getter
// _values() returns array of values trimmed by min and max, aligned by step
// _values( index ) returns single value trimmed by min and max, aligned by step
_values:function _values(index){var val,vals,i;if(arguments.length){val=this.options.values[index];val=this._trimAlignValue(val);return val;}else if(this.options.values&&this.options.values.length){// .slice() creates a copy of the array
// this copy gets trimmed by min and max and then returned
vals=this.options.values.slice();for(i=0;i<vals.length;i+=1){vals[i]=this._trimAlignValue(vals[i]);}return vals;}else{return[];}},// returns the step-aligned value that val is closest to, between (inclusive) min and max
_trimAlignValue:function _trimAlignValue(val){if(val<=this._valueMin()){return this._valueMin();}if(val>=this._valueMax()){return this._valueMax();}var step=this.options.step>0?this.options.step:1,valModStep=(val-this._valueMin())%step,alignValue=val-valModStep;if(Math.abs(valModStep)*2>=step){alignValue+=valModStep>0?step:-step;}// Since JavaScript has problems with large floats, round
// the final value to 5 digits after the decimal point (see #4124)
return parseFloat(alignValue.toFixed(5));},_calculateNewMax:function _calculateNewMax(){var max=this.options.max,min=this._valueMin(),step=this.options.step,aboveMin=Math.floor(+(max-min).toFixed(this._precision())/step)*step;max=aboveMin+min;this.max=parseFloat(max.toFixed(this._precision()));},_precision:function _precision(){var precision=this._precisionOf(this.options.step);if(this.options.min!==null){precision=Math.max(precision,this._precisionOf(this.options.min));}return precision;},_precisionOf:function _precisionOf(num){var str=num.toString(),decimal=str.indexOf(".");return decimal===-1?0:str.length-decimal-1;},_valueMin:function _valueMin(){return this.options.min;},_valueMax:function _valueMax(){return this.max;},_refreshValue:function _refreshValue(){var lastValPercent,valPercent,value,valueMin,valueMax,oRange=this.options.range,o=this.options,that=this,animate=!this._animateOff?o.animate:false,_set={};if(this.options.values&&this.options.values.length){this.handles.each(function(i){valPercent=(that.values(i)-that._valueMin())/(that._valueMax()-that._valueMin())*100;_set[that.orientation==="horizontal"?"left":"bottom"]=valPercent+"%";$(this).stop(1,1)[animate?"animate":"css"](_set,o.animate);if(that.options.range===true){if(that.orientation==="horizontal"){if(i===0){that.range.stop(1,1)[animate?"animate":"css"]({left:valPercent+"%"},o.animate);}if(i===1){that.range[animate?"animate":"css"]({width:valPercent-lastValPercent+"%"},{queue:false,duration:o.animate});}}else{if(i===0){that.range.stop(1,1)[animate?"animate":"css"]({bottom:valPercent+"%"},o.animate);}if(i===1){that.range[animate?"animate":"css"]({height:valPercent-lastValPercent+"%"},{queue:false,duration:o.animate});}}}lastValPercent=valPercent;});}else{value=this.value();valueMin=this._valueMin();valueMax=this._valueMax();valPercent=valueMax!==valueMin?(value-valueMin)/(valueMax-valueMin)*100:0;_set[this.orientation==="horizontal"?"left":"bottom"]=valPercent+"%";this.handle.stop(1,1)[animate?"animate":"css"](_set,o.animate);if(oRange==="min"&&this.orientation==="horizontal"){this.range.stop(1,1)[animate?"animate":"css"]({width:valPercent+"%"},o.animate);}if(oRange==="max"&&this.orientation==="horizontal"){this.range[animate?"animate":"css"]({width:100-valPercent+"%"},{queue:false,duration:o.animate});}if(oRange==="min"&&this.orientation==="vertical"){this.range.stop(1,1)[animate?"animate":"css"]({height:valPercent+"%"},o.animate);}if(oRange==="max"&&this.orientation==="vertical"){this.range[animate?"animate":"css"]({height:100-valPercent+"%"},{queue:false,duration:o.animate});}}},_handleEvents:{keydown:function keydown(event){var allowed,curVal,newVal,step,index=$(event.target).data("ui-slider-handle-index");switch(event.keyCode){case $.ui.keyCode.HOME:case $.ui.keyCode.END:case $.ui.keyCode.PAGE_UP:case $.ui.keyCode.PAGE_DOWN:case $.ui.keyCode.UP:case $.ui.keyCode.RIGHT:case $.ui.keyCode.DOWN:case $.ui.keyCode.LEFT:event.preventDefault();if(!this._keySliding){this._keySliding=true;$(event.target).addClass("ui-state-active");allowed=this._start(event,index);if(allowed===false){return;}}break;}step=this.options.step;if(this.options.values&&this.options.values.length){curVal=newVal=this.values(index);}else{curVal=newVal=this.value();}switch(event.keyCode){case $.ui.keyCode.HOME:newVal=this._valueMin();break;case $.ui.keyCode.END:newVal=this._valueMax();break;case $.ui.keyCode.PAGE_UP:newVal=this._trimAlignValue(curVal+(this._valueMax()-this._valueMin())/this.numPages);break;case $.ui.keyCode.PAGE_DOWN:newVal=this._trimAlignValue(curVal-(this._valueMax()-this._valueMin())/this.numPages);break;case $.ui.keyCode.UP:case $.ui.keyCode.RIGHT:if(curVal===this._valueMax()){return;}newVal=this._trimAlignValue(curVal+step);break;case $.ui.keyCode.DOWN:case $.ui.keyCode.LEFT:if(curVal===this._valueMin()){return;}newVal=this._trimAlignValue(curVal-step);break;}this._slide(event,index,newVal);},keyup:function keyup(event){var index=$(event.target).data("ui-slider-handle-index");if(this._keySliding){this._keySliding=false;this._stop(event,index);this._change(event,index);$(event.target).removeClass("ui-state-active");}}}});/*!
 * jQuery UI Spinner 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/spinner/
 */function spinner_modifier(fn){return function(){var previous=this.element.val();fn.apply(this,arguments);this._refresh();if(previous!==this.element.val()){this._trigger("change");}};}var spinner=$.widget("ui.spinner",{version:"1.11.4",defaultElement:"<input>",widgetEventPrefix:"spin",options:{culture:null,icons:{down:"ui-icon-triangle-1-s",up:"ui-icon-triangle-1-n"},incremental:true,max:null,min:null,numberFormat:null,page:10,step:1,change:null,spin:null,start:null,stop:null},_create:function _create(){// handle string values that need to be parsed
this._setOption("max",this.options.max);this._setOption("min",this.options.min);this._setOption("step",this.options.step);// Only format if there is a value, prevents the field from being marked
// as invalid in Firefox, see #9573.
if(this.value()!==""){// Format the value, but don't constrain.
this._value(this.element.val(),true);}this._draw();this._on(this._events);this._refresh();// turning off autocomplete prevents the browser from remembering the
// value when navigating through history, so we re-enable autocomplete
// if the page is unloaded before the widget is destroyed. #7790
this._on(this.window,{beforeunload:function beforeunload(){this.element.removeAttr("autocomplete");}});},_getCreateOptions:function _getCreateOptions(){var options={},element=this.element;$.each(["min","max","step"],function(i,option){var value=element.attr(option);if(value!==undefined&&value.length){options[option]=value;}});return options;},_events:{keydown:function keydown(event){if(this._start(event)&&this._keydown(event)){event.preventDefault();}},keyup:"_stop",focus:function focus(){this.previous=this.element.val();},blur:function blur(event){if(this.cancelBlur){delete this.cancelBlur;return;}this._stop();this._refresh();if(this.previous!==this.element.val()){this._trigger("change",event);}},mousewheel:function mousewheel(event,delta){if(!delta){return;}if(!this.spinning&&!this._start(event)){return false;}this._spin((delta>0?1:-1)*this.options.step,event);clearTimeout(this.mousewheelTimer);this.mousewheelTimer=this._delay(function(){if(this.spinning){this._stop(event);}},100);event.preventDefault();},"mousedown .ui-spinner-button":function mousedownUiSpinnerButton(event){var previous;// We never want the buttons to have focus; whenever the user is
// interacting with the spinner, the focus should be on the input.
// If the input is focused then this.previous is properly set from
// when the input first received focus. If the input is not focused
// then we need to set this.previous based on the value before spinning.
previous=this.element[0]===this.document[0].activeElement?this.previous:this.element.val();function checkFocus(){var isActive=this.element[0]===this.document[0].activeElement;if(!isActive){this.element.focus();this.previous=previous;// support: IE
// IE sets focus asynchronously, so we need to check if focus
// moved off of the input because the user clicked on the button.
this._delay(function(){this.previous=previous;});}}// ensure focus is on (or stays on) the text field
event.preventDefault();checkFocus.call(this);// support: IE
// IE doesn't prevent moving focus even with event.preventDefault()
// so we set a flag to know when we should ignore the blur event
// and check (again) if focus moved off of the input.
this.cancelBlur=true;this._delay(function(){delete this.cancelBlur;checkFocus.call(this);});if(this._start(event)===false){return;}this._repeat(null,$(event.currentTarget).hasClass("ui-spinner-up")?1:-1,event);},"mouseup .ui-spinner-button":"_stop","mouseenter .ui-spinner-button":function mouseenterUiSpinnerButton(event){// button will add ui-state-active if mouse was down while mouseleave and kept down
if(!$(event.currentTarget).hasClass("ui-state-active")){return;}if(this._start(event)===false){return false;}this._repeat(null,$(event.currentTarget).hasClass("ui-spinner-up")?1:-1,event);},// TODO: do we really want to consider this a stop?
// shouldn't we just stop the repeater and wait until mouseup before
// we trigger the stop event?
"mouseleave .ui-spinner-button":"_stop"},_draw:function _draw(){var uiSpinner=this.uiSpinner=this.element.addClass("ui-spinner-input").attr("autocomplete","off").wrap(this._uiSpinnerHtml()).parent()// add buttons
.append(this._buttonHtml());this.element.attr("role","spinbutton");// button bindings
this.buttons=uiSpinner.find(".ui-spinner-button").attr("tabIndex",-1).button().removeClass("ui-corner-all");// IE 6 doesn't understand height: 50% for the buttons
// unless the wrapper has an explicit height
if(this.buttons.height()>Math.ceil(uiSpinner.height()*0.5)&&uiSpinner.height()>0){uiSpinner.height(uiSpinner.height());}// disable spinner if element was already disabled
if(this.options.disabled){this.disable();}},_keydown:function _keydown(event){var options=this.options,keyCode=$.ui.keyCode;switch(event.keyCode){case keyCode.UP:this._repeat(null,1,event);return true;case keyCode.DOWN:this._repeat(null,-1,event);return true;case keyCode.PAGE_UP:this._repeat(null,options.page,event);return true;case keyCode.PAGE_DOWN:this._repeat(null,-options.page,event);return true;}return false;},_uiSpinnerHtml:function _uiSpinnerHtml(){return"<span class='ui-spinner ui-widget ui-widget-content ui-corner-all'></span>";},_buttonHtml:function _buttonHtml(){return""+"<a class='ui-spinner-button ui-spinner-up ui-corner-tr'>"+"<span class='ui-icon "+this.options.icons.up+"'>&#9650;</span>"+"</a>"+"<a class='ui-spinner-button ui-spinner-down ui-corner-br'>"+"<span class='ui-icon "+this.options.icons.down+"'>&#9660;</span>"+"</a>";},_start:function _start(event){if(!this.spinning&&this._trigger("start",event)===false){return false;}if(!this.counter){this.counter=1;}this.spinning=true;return true;},_repeat:function _repeat(i,steps,event){i=i||500;clearTimeout(this.timer);this.timer=this._delay(function(){this._repeat(40,steps,event);},i);this._spin(steps*this.options.step,event);},_spin:function _spin(step,event){var value=this.value()||0;if(!this.counter){this.counter=1;}value=this._adjustValue(value+step*this._increment(this.counter));if(!this.spinning||this._trigger("spin",event,{value:value})!==false){this._value(value);this.counter++;}},_increment:function _increment(i){var incremental=this.options.incremental;if(incremental){return $.isFunction(incremental)?incremental(i):Math.floor(i*i*i/50000-i*i/500+17*i/200+1);}return 1;},_precision:function _precision(){var precision=this._precisionOf(this.options.step);if(this.options.min!==null){precision=Math.max(precision,this._precisionOf(this.options.min));}return precision;},_precisionOf:function _precisionOf(num){var str=num.toString(),decimal=str.indexOf(".");return decimal===-1?0:str.length-decimal-1;},_adjustValue:function _adjustValue(value){var base,aboveMin,options=this.options;// make sure we're at a valid step
// - find out where we are relative to the base (min or 0)
base=options.min!==null?options.min:0;aboveMin=value-base;// - round to the nearest step
aboveMin=Math.round(aboveMin/options.step)*options.step;// - rounding is based on 0, so adjust back to our base
value=base+aboveMin;// fix precision from bad JS floating point math
value=parseFloat(value.toFixed(this._precision()));// clamp the value
if(options.max!==null&&value>options.max){return options.max;}if(options.min!==null&&value<options.min){return options.min;}return value;},_stop:function _stop(event){if(!this.spinning){return;}clearTimeout(this.timer);clearTimeout(this.mousewheelTimer);this.counter=0;this.spinning=false;this._trigger("stop",event);},_setOption:function _setOption(key,value){if(key==="culture"||key==="numberFormat"){var prevValue=this._parse(this.element.val());this.options[key]=value;this.element.val(this._format(prevValue));return;}if(key==="max"||key==="min"||key==="step"){if(typeof value==="string"){value=this._parse(value);}}if(key==="icons"){this.buttons.first().find(".ui-icon").removeClass(this.options.icons.up).addClass(value.up);this.buttons.last().find(".ui-icon").removeClass(this.options.icons.down).addClass(value.down);}this._super(key,value);if(key==="disabled"){this.widget().toggleClass("ui-state-disabled",!!value);this.element.prop("disabled",!!value);this.buttons.button(value?"disable":"enable");}},_setOptions:spinner_modifier(function(options){this._super(options);}),_parse:function _parse(val){if(typeof val==="string"&&val!==""){val=window.Globalize&&this.options.numberFormat?Globalize.parseFloat(val,10,this.options.culture):+val;}return val===""||isNaN(val)?null:val;},_format:function _format(value){if(value===""){return"";}return window.Globalize&&this.options.numberFormat?Globalize.format(value,this.options.numberFormat,this.options.culture):value;},_refresh:function _refresh(){this.element.attr({"aria-valuemin":this.options.min,"aria-valuemax":this.options.max,// TODO: what should we do with values that can't be parsed?
"aria-valuenow":this._parse(this.element.val())});},isValid:function isValid(){var value=this.value();// null is invalid
if(value===null){return false;}// if value gets adjusted, it's invalid
return value===this._adjustValue(value);},// update the value without triggering change
_value:function _value(value,allowAny){var parsed;if(value!==""){parsed=this._parse(value);if(parsed!==null){if(!allowAny){parsed=this._adjustValue(parsed);}value=this._format(parsed);}}this.element.val(value);this._refresh();},_destroy:function _destroy(){this.element.removeClass("ui-spinner-input").prop("disabled",false).removeAttr("autocomplete").removeAttr("role").removeAttr("aria-valuemin").removeAttr("aria-valuemax").removeAttr("aria-valuenow");this.uiSpinner.replaceWith(this.element);},stepUp:spinner_modifier(function(steps){this._stepUp(steps);}),_stepUp:function _stepUp(steps){if(this._start()){this._spin((steps||1)*this.options.step);this._stop();}},stepDown:spinner_modifier(function(steps){this._stepDown(steps);}),_stepDown:function _stepDown(steps){if(this._start()){this._spin((steps||1)*-this.options.step);this._stop();}},pageUp:spinner_modifier(function(pages){this._stepUp((pages||1)*this.options.page);}),pageDown:spinner_modifier(function(pages){this._stepDown((pages||1)*this.options.page);}),value:function value(newVal){if(!arguments.length){return this._parse(this.element.val());}spinner_modifier(this._value).call(this,newVal);},widget:function widget(){return this.uiSpinner;}});/*!
 * jQuery UI Tabs 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tabs/
 */var tabs=$.widget("ui.tabs",{version:"1.11.4",delay:300,options:{active:null,collapsible:false,event:"click",heightStyle:"content",hide:null,show:null,// callbacks
activate:null,beforeActivate:null,beforeLoad:null,load:null},_isLocal:function(){var rhash=/#.*$/;return function(anchor){var anchorUrl,locationUrl;// support: IE7
// IE7 doesn't normalize the href property when set via script (#9317)
anchor=anchor.cloneNode(false);anchorUrl=anchor.href.replace(rhash,"");locationUrl=location.href.replace(rhash,"");// decoding may throw an error if the URL isn't UTF-8 (#9518)
try{anchorUrl=decodeURIComponent(anchorUrl);}catch(error){}try{locationUrl=decodeURIComponent(locationUrl);}catch(error){}return anchor.hash.length>1&&anchorUrl===locationUrl;};}(),_create:function _create(){var that=this,options=this.options;this.running=false;this.element.addClass("ui-tabs ui-widget ui-widget-content ui-corner-all").toggleClass("ui-tabs-collapsible",options.collapsible);this._processTabs();options.active=this._initialActive();// Take disabling tabs via class attribute from HTML
// into account and update option properly.
if($.isArray(options.disabled)){options.disabled=$.unique(options.disabled.concat($.map(this.tabs.filter(".ui-state-disabled"),function(li){return that.tabs.index(li);}))).sort();}// check for length avoids error when initializing empty list
if(this.options.active!==false&&this.anchors.length){this.active=this._findActive(options.active);}else{this.active=$();}this._refresh();if(this.active.length){this.load(options.active);}},_initialActive:function _initialActive(){var active=this.options.active,collapsible=this.options.collapsible,locationHash=location.hash.substring(1);if(active===null){// check the fragment identifier in the URL
if(locationHash){this.tabs.each(function(i,tab){if($(tab).attr("aria-controls")===locationHash){active=i;return false;}});}// check for a tab marked active via a class
if(active===null){active=this.tabs.index(this.tabs.filter(".ui-tabs-active"));}// no active tab, set to false
if(active===null||active===-1){active=this.tabs.length?0:false;}}// handle numbers: negative, out of range
if(active!==false){active=this.tabs.index(this.tabs.eq(active));if(active===-1){active=collapsible?false:0;}}// don't allow collapsible: false and active: false
if(!collapsible&&active===false&&this.anchors.length){active=0;}return active;},_getCreateEventData:function _getCreateEventData(){return{tab:this.active,panel:!this.active.length?$():this._getPanelForTab(this.active)};},_tabKeydown:function _tabKeydown(event){var focusedTab=$(this.document[0].activeElement).closest("li"),selectedIndex=this.tabs.index(focusedTab),goingForward=true;if(this._handlePageNav(event)){return;}switch(event.keyCode){case $.ui.keyCode.RIGHT:case $.ui.keyCode.DOWN:selectedIndex++;break;case $.ui.keyCode.UP:case $.ui.keyCode.LEFT:goingForward=false;selectedIndex--;break;case $.ui.keyCode.END:selectedIndex=this.anchors.length-1;break;case $.ui.keyCode.HOME:selectedIndex=0;break;case $.ui.keyCode.SPACE:// Activate only, no collapsing
event.preventDefault();clearTimeout(this.activating);this._activate(selectedIndex);return;case $.ui.keyCode.ENTER:// Toggle (cancel delayed activation, allow collapsing)
event.preventDefault();clearTimeout(this.activating);// Determine if we should collapse or activate
this._activate(selectedIndex===this.options.active?false:selectedIndex);return;default:return;}// Focus the appropriate tab, based on which key was pressed
event.preventDefault();clearTimeout(this.activating);selectedIndex=this._focusNextTab(selectedIndex,goingForward);// Navigating with control/command key will prevent automatic activation
if(!event.ctrlKey&&!event.metaKey){// Update aria-selected immediately so that AT think the tab is already selected.
// Otherwise AT may confuse the user by stating that they need to activate the tab,
// but the tab will already be activated by the time the announcement finishes.
focusedTab.attr("aria-selected","false");this.tabs.eq(selectedIndex).attr("aria-selected","true");this.activating=this._delay(function(){this.option("active",selectedIndex);},this.delay);}},_panelKeydown:function _panelKeydown(event){if(this._handlePageNav(event)){return;}// Ctrl+up moves focus to the current tab
if(event.ctrlKey&&event.keyCode===$.ui.keyCode.UP){event.preventDefault();this.active.focus();}},// Alt+page up/down moves focus to the previous/next tab (and activates)
_handlePageNav:function _handlePageNav(event){if(event.altKey&&event.keyCode===$.ui.keyCode.PAGE_UP){this._activate(this._focusNextTab(this.options.active-1,false));return true;}if(event.altKey&&event.keyCode===$.ui.keyCode.PAGE_DOWN){this._activate(this._focusNextTab(this.options.active+1,true));return true;}},_findNextTab:function _findNextTab(index,goingForward){var lastTabIndex=this.tabs.length-1;function constrain(){if(index>lastTabIndex){index=0;}if(index<0){index=lastTabIndex;}return index;}while($.inArray(constrain(),this.options.disabled)!==-1){index=goingForward?index+1:index-1;}return index;},_focusNextTab:function _focusNextTab(index,goingForward){index=this._findNextTab(index,goingForward);this.tabs.eq(index).focus();return index;},_setOption:function _setOption(key,value){if(key==="active"){// _activate() will handle invalid values and update this.options
this._activate(value);return;}if(key==="disabled"){// don't use the widget factory's disabled handling
this._setupDisabled(value);return;}this._super(key,value);if(key==="collapsible"){this.element.toggleClass("ui-tabs-collapsible",value);// Setting collapsible: false while collapsed; open first panel
if(!value&&this.options.active===false){this._activate(0);}}if(key==="event"){this._setupEvents(value);}if(key==="heightStyle"){this._setupHeightStyle(value);}},_sanitizeSelector:function _sanitizeSelector(hash){return hash?hash.replace(/[!"$%&'()*+,.\/:;<=>?@\[\]\^`{|}~]/g,"\\$&"):"";},refresh:function refresh(){var options=this.options,lis=this.tablist.children(":has(a[href])");// get disabled tabs from class attribute from HTML
// this will get converted to a boolean if needed in _refresh()
options.disabled=$.map(lis.filter(".ui-state-disabled"),function(tab){return lis.index(tab);});this._processTabs();// was collapsed or no tabs
if(options.active===false||!this.anchors.length){options.active=false;this.active=$();// was active, but active tab is gone
}else if(this.active.length&&!$.contains(this.tablist[0],this.active[0])){// all remaining tabs are disabled
if(this.tabs.length===options.disabled.length){options.active=false;this.active=$();// activate previous tab
}else{this._activate(this._findNextTab(Math.max(0,options.active-1),false));}// was active, active tab still exists
}else{// make sure active index is correct
options.active=this.tabs.index(this.active);}this._refresh();},_refresh:function _refresh(){this._setupDisabled(this.options.disabled);this._setupEvents(this.options.event);this._setupHeightStyle(this.options.heightStyle);this.tabs.not(this.active).attr({"aria-selected":"false","aria-expanded":"false",tabIndex:-1});this.panels.not(this._getPanelForTab(this.active)).hide().attr({"aria-hidden":"true"});// Make sure one tab is in the tab order
if(!this.active.length){this.tabs.eq(0).attr("tabIndex",0);}else{this.active.addClass("ui-tabs-active ui-state-active").attr({"aria-selected":"true","aria-expanded":"true",tabIndex:0});this._getPanelForTab(this.active).show().attr({"aria-hidden":"false"});}},_processTabs:function _processTabs(){var that=this,prevTabs=this.tabs,prevAnchors=this.anchors,prevPanels=this.panels;this.tablist=this._getList().addClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").attr("role","tablist")// Prevent users from focusing disabled tabs via click
.delegate("> li","mousedown"+this.eventNamespace,function(event){if($(this).is(".ui-state-disabled")){event.preventDefault();}})// support: IE <9
// Preventing the default action in mousedown doesn't prevent IE
// from focusing the element, so if the anchor gets focused, blur.
// We don't have to worry about focusing the previously focused
// element since clicking on a non-focusable element should focus
// the body anyway.
.delegate(".ui-tabs-anchor","focus"+this.eventNamespace,function(){if($(this).closest("li").is(".ui-state-disabled")){this.blur();}});this.tabs=this.tablist.find("> li:has(a[href])").addClass("ui-state-default ui-corner-top").attr({role:"tab",tabIndex:-1});this.anchors=this.tabs.map(function(){return $("a",this)[0];}).addClass("ui-tabs-anchor").attr({role:"presentation",tabIndex:-1});this.panels=$();this.anchors.each(function(i,anchor){var selector,panel,panelId,anchorId=$(anchor).uniqueId().attr("id"),tab=$(anchor).closest("li"),originalAriaControls=tab.attr("aria-controls");// inline tab
if(that._isLocal(anchor)){selector=anchor.hash;panelId=selector.substring(1);panel=that.element.find(that._sanitizeSelector(selector));// remote tab
}else{// If the tab doesn't already have aria-controls,
// generate an id by using a throw-away element
panelId=tab.attr("aria-controls")||$({}).uniqueId()[0].id;selector="#"+panelId;panel=that.element.find(selector);if(!panel.length){panel=that._createPanel(panelId);panel.insertAfter(that.panels[i-1]||that.tablist);}panel.attr("aria-live","polite");}if(panel.length){that.panels=that.panels.add(panel);}if(originalAriaControls){tab.data("ui-tabs-aria-controls",originalAriaControls);}tab.attr({"aria-controls":panelId,"aria-labelledby":anchorId});panel.attr("aria-labelledby",anchorId);});this.panels.addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").attr("role","tabpanel");// Avoid memory leaks (#10056)
if(prevTabs){this._off(prevTabs.not(this.tabs));this._off(prevAnchors.not(this.anchors));this._off(prevPanels.not(this.panels));}},// allow overriding how to find the list for rare usage scenarios (#7715)
_getList:function _getList(){return this.tablist||this.element.find("ol,ul").eq(0);},_createPanel:function _createPanel(id){return $("<div>").attr("id",id).addClass("ui-tabs-panel ui-widget-content ui-corner-bottom").data("ui-tabs-destroy",true);},_setupDisabled:function _setupDisabled(disabled){if($.isArray(disabled)){if(!disabled.length){disabled=false;}else if(disabled.length===this.anchors.length){disabled=true;}}// disable tabs
for(var i=0,li;li=this.tabs[i];i++){if(disabled===true||$.inArray(i,disabled)!==-1){$(li).addClass("ui-state-disabled").attr("aria-disabled","true");}else{$(li).removeClass("ui-state-disabled").removeAttr("aria-disabled");}}this.options.disabled=disabled;},_setupEvents:function _setupEvents(event){var events={};if(event){$.each(event.split(" "),function(index,eventName){events[eventName]="_eventHandler";});}this._off(this.anchors.add(this.tabs).add(this.panels));// Always prevent the default action, even when disabled
this._on(true,this.anchors,{click:function click(event){event.preventDefault();}});this._on(this.anchors,events);this._on(this.tabs,{keydown:"_tabKeydown"});this._on(this.panels,{keydown:"_panelKeydown"});this._focusable(this.tabs);this._hoverable(this.tabs);},_setupHeightStyle:function _setupHeightStyle(heightStyle){var maxHeight,parent=this.element.parent();if(heightStyle==="fill"){maxHeight=parent.height();maxHeight-=this.element.outerHeight()-this.element.height();this.element.siblings(":visible").each(function(){var elem=$(this),position=elem.css("position");if(position==="absolute"||position==="fixed"){return;}maxHeight-=elem.outerHeight(true);});this.element.children().not(this.panels).each(function(){maxHeight-=$(this).outerHeight(true);});this.panels.each(function(){$(this).height(Math.max(0,maxHeight-$(this).innerHeight()+$(this).height()));}).css("overflow","auto");}else if(heightStyle==="auto"){maxHeight=0;this.panels.each(function(){maxHeight=Math.max(maxHeight,$(this).height("").height());}).height(maxHeight);}},_eventHandler:function _eventHandler(event){var options=this.options,active=this.active,anchor=$(event.currentTarget),tab=anchor.closest("li"),clickedIsActive=tab[0]===active[0],collapsing=clickedIsActive&&options.collapsible,toShow=collapsing?$():this._getPanelForTab(tab),toHide=!active.length?$():this._getPanelForTab(active),eventData={oldTab:active,oldPanel:toHide,newTab:collapsing?$():tab,newPanel:toShow};event.preventDefault();if(tab.hasClass("ui-state-disabled")||// tab is already loading
tab.hasClass("ui-tabs-loading")||// can't switch durning an animation
this.running||// click on active header, but not collapsible
clickedIsActive&&!options.collapsible||// allow canceling activation
this._trigger("beforeActivate",event,eventData)===false){return;}options.active=collapsing?false:this.tabs.index(tab);this.active=clickedIsActive?$():tab;if(this.xhr){this.xhr.abort();}if(!toHide.length&&!toShow.length){$.error("jQuery UI Tabs: Mismatching fragment identifier.");}if(toShow.length){this.load(this.tabs.index(tab),event);}this._toggle(event,eventData);},// handles show/hide for selecting tabs
_toggle:function _toggle(event,eventData){var that=this,toShow=eventData.newPanel,toHide=eventData.oldPanel;this.running=true;function complete(){that.running=false;that._trigger("activate",event,eventData);}function show(){eventData.newTab.closest("li").addClass("ui-tabs-active ui-state-active");if(toShow.length&&that.options.show){that._show(toShow,that.options.show,complete);}else{toShow.show();complete();}}// start out by hiding, then showing, then completing
if(toHide.length&&this.options.hide){this._hide(toHide,this.options.hide,function(){eventData.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active");show();});}else{eventData.oldTab.closest("li").removeClass("ui-tabs-active ui-state-active");toHide.hide();show();}toHide.attr("aria-hidden","true");eventData.oldTab.attr({"aria-selected":"false","aria-expanded":"false"});// If we're switching tabs, remove the old tab from the tab order.
// If we're opening from collapsed state, remove the previous tab from the tab order.
// If we're collapsing, then keep the collapsing tab in the tab order.
if(toShow.length&&toHide.length){eventData.oldTab.attr("tabIndex",-1);}else if(toShow.length){this.tabs.filter(function(){return $(this).attr("tabIndex")===0;}).attr("tabIndex",-1);}toShow.attr("aria-hidden","false");eventData.newTab.attr({"aria-selected":"true","aria-expanded":"true",tabIndex:0});},_activate:function _activate(index){var anchor,active=this._findActive(index);// trying to activate the already active panel
if(active[0]===this.active[0]){return;}// trying to collapse, simulate a click on the current active header
if(!active.length){active=this.active;}anchor=active.find(".ui-tabs-anchor")[0];this._eventHandler({target:anchor,currentTarget:anchor,preventDefault:$.noop});},_findActive:function _findActive(index){return index===false?$():this.tabs.eq(index);},_getIndex:function _getIndex(index){// meta-function to give users option to provide a href string instead of a numerical index.
if(typeof index==="string"){index=this.anchors.index(this.anchors.filter("[href$='"+index+"']"));}return index;},_destroy:function _destroy(){if(this.xhr){this.xhr.abort();}this.element.removeClass("ui-tabs ui-widget ui-widget-content ui-corner-all ui-tabs-collapsible");this.tablist.removeClass("ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all").removeAttr("role");this.anchors.removeClass("ui-tabs-anchor").removeAttr("role").removeAttr("tabIndex").removeUniqueId();this.tablist.unbind(this.eventNamespace);this.tabs.add(this.panels).each(function(){if($.data(this,"ui-tabs-destroy")){$(this).remove();}else{$(this).removeClass("ui-state-default ui-state-active ui-state-disabled "+"ui-corner-top ui-corner-bottom ui-widget-content ui-tabs-active ui-tabs-panel").removeAttr("tabIndex").removeAttr("aria-live").removeAttr("aria-busy").removeAttr("aria-selected").removeAttr("aria-labelledby").removeAttr("aria-hidden").removeAttr("aria-expanded").removeAttr("role");}});this.tabs.each(function(){var li=$(this),prev=li.data("ui-tabs-aria-controls");if(prev){li.attr("aria-controls",prev).removeData("ui-tabs-aria-controls");}else{li.removeAttr("aria-controls");}});this.panels.show();if(this.options.heightStyle!=="content"){this.panels.css("height","");}},enable:function enable(index){var disabled=this.options.disabled;if(disabled===false){return;}if(index===undefined){disabled=false;}else{index=this._getIndex(index);if($.isArray(disabled)){disabled=$.map(disabled,function(num){return num!==index?num:null;});}else{disabled=$.map(this.tabs,function(li,num){return num!==index?num:null;});}}this._setupDisabled(disabled);},disable:function disable(index){var disabled=this.options.disabled;if(disabled===true){return;}if(index===undefined){disabled=true;}else{index=this._getIndex(index);if($.inArray(index,disabled)!==-1){return;}if($.isArray(disabled)){disabled=$.merge([index],disabled).sort();}else{disabled=[index];}}this._setupDisabled(disabled);},load:function load(index,event){index=this._getIndex(index);var that=this,tab=this.tabs.eq(index),anchor=tab.find(".ui-tabs-anchor"),panel=this._getPanelForTab(tab),eventData={tab:tab,panel:panel},complete=function complete(jqXHR,status){if(status==="abort"){that.panels.stop(false,true);}tab.removeClass("ui-tabs-loading");panel.removeAttr("aria-busy");if(jqXHR===that.xhr){delete that.xhr;}};// not remote
if(this._isLocal(anchor[0])){return;}this.xhr=$.ajax(this._ajaxSettings(anchor,event,eventData));// support: jQuery <1.8
// jQuery <1.8 returns false if the request is canceled in beforeSend,
// but as of 1.8, $.ajax() always returns a jqXHR object.
if(this.xhr&&this.xhr.statusText!=="canceled"){tab.addClass("ui-tabs-loading");panel.attr("aria-busy","true");this.xhr.done(function(response,status,jqXHR){// support: jQuery <1.8
// http://bugs.jquery.com/ticket/11778
setTimeout(function(){panel.html(response);that._trigger("load",event,eventData);complete(jqXHR,status);},1);}).fail(function(jqXHR,status){// support: jQuery <1.8
// http://bugs.jquery.com/ticket/11778
setTimeout(function(){complete(jqXHR,status);},1);});}},_ajaxSettings:function _ajaxSettings(anchor,event,eventData){var that=this;return{url:anchor.attr("href"),beforeSend:function beforeSend(jqXHR,settings){return that._trigger("beforeLoad",event,$.extend({jqXHR:jqXHR,ajaxSettings:settings},eventData));}};},_getPanelForTab:function _getPanelForTab(tab){var id=$(tab).attr("aria-controls");return this.element.find(this._sanitizeSelector("#"+id));}});/*!
 * jQuery UI Tooltip 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tooltip/
 */var tooltip=$.widget("ui.tooltip",{version:"1.11.4",options:{content:function content(){// support: IE<9, Opera in jQuery <1.7
// .text() can't accept undefined, so coerce to a string
var title=$(this).attr("title")||"";// Escape title, since we're going from an attribute to raw HTML
return $("<a>").text(title).html();},hide:true,// Disabled elements have inconsistent behavior across browsers (#8661)
items:"[title]:not([disabled])",position:{my:"left top+15",at:"left bottom",collision:"flipfit flip"},show:true,tooltipClass:null,track:false,// callbacks
close:null,open:null},_addDescribedBy:function _addDescribedBy(elem,id){var describedby=(elem.attr("aria-describedby")||"").split(/\s+/);describedby.push(id);elem.data("ui-tooltip-id",id).attr("aria-describedby",$.trim(describedby.join(" ")));},_removeDescribedBy:function _removeDescribedBy(elem){var id=elem.data("ui-tooltip-id"),describedby=(elem.attr("aria-describedby")||"").split(/\s+/),index=$.inArray(id,describedby);if(index!==-1){describedby.splice(index,1);}elem.removeData("ui-tooltip-id");describedby=$.trim(describedby.join(" "));if(describedby){elem.attr("aria-describedby",describedby);}else{elem.removeAttr("aria-describedby");}},_create:function _create(){this._on({mouseover:"open",focusin:"open"});// IDs of generated tooltips, needed for destroy
this.tooltips={};// IDs of parent tooltips where we removed the title attribute
this.parents={};if(this.options.disabled){this._disable();}// Append the aria-live region so tooltips announce correctly
this.liveRegion=$("<div>").attr({role:"log","aria-live":"assertive","aria-relevant":"additions"}).addClass("ui-helper-hidden-accessible").appendTo(this.document[0].body);},_setOption:function _setOption(key,value){var that=this;if(key==="disabled"){this[value?"_disable":"_enable"]();this.options[key]=value;// disable element style changes
return;}this._super(key,value);if(key==="content"){$.each(this.tooltips,function(id,tooltipData){that._updateContent(tooltipData.element);});}},_disable:function _disable(){var that=this;// close open tooltips
$.each(this.tooltips,function(id,tooltipData){var event=$.Event("blur");event.target=event.currentTarget=tooltipData.element[0];that.close(event,true);});// remove title attributes to prevent native tooltips
this.element.find(this.options.items).addBack().each(function(){var element=$(this);if(element.is("[title]")){element.data("ui-tooltip-title",element.attr("title")).removeAttr("title");}});},_enable:function _enable(){// restore title attributes
this.element.find(this.options.items).addBack().each(function(){var element=$(this);if(element.data("ui-tooltip-title")){element.attr("title",element.data("ui-tooltip-title"));}});},open:function open(event){var that=this,target=$(event?event.target:this.element)// we need closest here due to mouseover bubbling,
// but always pointing at the same event target
.closest(this.options.items);// No element to show a tooltip for or the tooltip is already open
if(!target.length||target.data("ui-tooltip-id")){return;}if(target.attr("title")){target.data("ui-tooltip-title",target.attr("title"));}target.data("ui-tooltip-open",true);// kill parent tooltips, custom or native, for hover
if(event&&event.type==="mouseover"){target.parents().each(function(){var parent=$(this),blurEvent;if(parent.data("ui-tooltip-open")){blurEvent=$.Event("blur");blurEvent.target=blurEvent.currentTarget=this;that.close(blurEvent,true);}if(parent.attr("title")){parent.uniqueId();that.parents[this.id]={element:this,title:parent.attr("title")};parent.attr("title","");}});}this._registerCloseHandlers(event,target);this._updateContent(target,event);},_updateContent:function _updateContent(target,event){var content,contentOption=this.options.content,that=this,eventType=event?event.type:null;if(typeof contentOption==="string"){return this._open(event,target,contentOption);}content=contentOption.call(target[0],function(response){// IE may instantly serve a cached response for ajax requests
// delay this call to _open so the other call to _open runs first
that._delay(function(){// Ignore async response if tooltip was closed already
if(!target.data("ui-tooltip-open")){return;}// jQuery creates a special event for focusin when it doesn't
// exist natively. To improve performance, the native event
// object is reused and the type is changed. Therefore, we can't
// rely on the type being correct after the event finished
// bubbling, so we set it back to the previous value. (#8740)
if(event){event.type=eventType;}this._open(event,target,response);});});if(content){this._open(event,target,content);}},_open:function _open(event,target,content){var tooltipData,tooltip,delayedShow,a11yContent,positionOption=$.extend({},this.options.position);if(!content){return;}// Content can be updated multiple times. If the tooltip already
// exists, then just update the content and bail.
tooltipData=this._find(target);if(tooltipData){tooltipData.tooltip.find(".ui-tooltip-content").html(content);return;}// if we have a title, clear it to prevent the native tooltip
// we have to check first to avoid defining a title if none exists
// (we don't want to cause an element to start matching [title])
//
// We use removeAttr only for key events, to allow IE to export the correct
// accessible attributes. For mouse events, set to empty string to avoid
// native tooltip showing up (happens only when removing inside mouseover).
if(target.is("[title]")){if(event&&event.type==="mouseover"){target.attr("title","");}else{target.removeAttr("title");}}tooltipData=this._tooltip(target);tooltip=tooltipData.tooltip;this._addDescribedBy(target,tooltip.attr("id"));tooltip.find(".ui-tooltip-content").html(content);// Support: Voiceover on OS X, JAWS on IE <= 9
// JAWS announces deletions even when aria-relevant="additions"
// Voiceover will sometimes re-read the entire log region's contents from the beginning
this.liveRegion.children().hide();if(content.clone){a11yContent=content.clone();a11yContent.removeAttr("id").find("[id]").removeAttr("id");}else{a11yContent=content;}$("<div>").html(a11yContent).appendTo(this.liveRegion);function position(event){positionOption.of=event;if(tooltip.is(":hidden")){return;}tooltip.position(positionOption);}if(this.options.track&&event&&/^mouse/.test(event.type)){this._on(this.document,{mousemove:position});// trigger once to override element-relative positioning
position(event);}else{tooltip.position($.extend({of:target},this.options.position));}tooltip.hide();this._show(tooltip,this.options.show);// Handle tracking tooltips that are shown with a delay (#8644). As soon
// as the tooltip is visible, position the tooltip using the most recent
// event.
if(this.options.show&&this.options.show.delay){delayedShow=this.delayedShow=setInterval(function(){if(tooltip.is(":visible")){position(positionOption.of);clearInterval(delayedShow);}},$.fx.interval);}this._trigger("open",event,{tooltip:tooltip});},_registerCloseHandlers:function _registerCloseHandlers(event,target){var events={keyup:function keyup(event){if(event.keyCode===$.ui.keyCode.ESCAPE){var fakeEvent=$.Event(event);fakeEvent.currentTarget=target[0];this.close(fakeEvent,true);}}};// Only bind remove handler for delegated targets. Non-delegated
// tooltips will handle this in destroy.
if(target[0]!==this.element[0]){events.remove=function(){this._removeTooltip(this._find(target).tooltip);};}if(!event||event.type==="mouseover"){events.mouseleave="close";}if(!event||event.type==="focusin"){events.focusout="close";}this._on(true,target,events);},close:function close(event){var tooltip,that=this,target=$(event?event.currentTarget:this.element),tooltipData=this._find(target);// The tooltip may already be closed
if(!tooltipData){// We set ui-tooltip-open immediately upon open (in open()), but only set the
// additional data once there's actually content to show (in _open()). So even if the
// tooltip doesn't have full data, we always remove ui-tooltip-open in case we're in
// the period between open() and _open().
target.removeData("ui-tooltip-open");return;}tooltip=tooltipData.tooltip;// disabling closes the tooltip, so we need to track when we're closing
// to avoid an infinite loop in case the tooltip becomes disabled on close
if(tooltipData.closing){return;}// Clear the interval for delayed tracking tooltips
clearInterval(this.delayedShow);// only set title if we had one before (see comment in _open())
// If the title attribute has changed since open(), don't restore
if(target.data("ui-tooltip-title")&&!target.attr("title")){target.attr("title",target.data("ui-tooltip-title"));}this._removeDescribedBy(target);tooltipData.hiding=true;tooltip.stop(true);this._hide(tooltip,this.options.hide,function(){that._removeTooltip($(this));});target.removeData("ui-tooltip-open");this._off(target,"mouseleave focusout keyup");// Remove 'remove' binding only on delegated targets
if(target[0]!==this.element[0]){this._off(target,"remove");}this._off(this.document,"mousemove");if(event&&event.type==="mouseleave"){$.each(this.parents,function(id,parent){$(parent.element).attr("title",parent.title);delete that.parents[id];});}tooltipData.closing=true;this._trigger("close",event,{tooltip:tooltip});if(!tooltipData.hiding){tooltipData.closing=false;}},_tooltip:function _tooltip(element){var tooltip=$("<div>").attr("role","tooltip").addClass("ui-tooltip ui-widget ui-corner-all ui-widget-content "+(this.options.tooltipClass||"")),id=tooltip.uniqueId().attr("id");$("<div>").addClass("ui-tooltip-content").appendTo(tooltip);tooltip.appendTo(this.document[0].body);return this.tooltips[id]={element:element,tooltip:tooltip};},_find:function _find(target){var id=target.data("ui-tooltip-id");return id?this.tooltips[id]:null;},_removeTooltip:function _removeTooltip(tooltip){tooltip.remove();delete this.tooltips[tooltip.attr("id")];},_destroy:function _destroy(){var that=this;// close open tooltips
$.each(this.tooltips,function(id,tooltipData){// Delegate to close method to handle common cleanup
var event=$.Event("blur"),element=tooltipData.element;event.target=event.currentTarget=element[0];that.close(event,true);// Remove immediately; destroying an open tooltip doesn't use the
// hide animation
$("#"+id).remove();// Restore the title
if(element.data("ui-tooltip-title")){// If the title attribute has changed since open(), don't restore
if(!element.attr("title")){element.attr("title",element.data("ui-tooltip-title"));}element.removeData("ui-tooltip-title");}});this.liveRegion.remove();}});/*!
 * jQuery UI Effects 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/effects-core/
 */var dataSpace="ui-effects-",// Create a local jQuery because jQuery Color relies on it and the
// global may not exist with AMD and a custom build (#10199)
jQuery=$;$.effects={effect:{}};/*!
 * jQuery Color Animations v2.1.2
 * https://github.com/jquery/jquery-color
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * Date: Wed Jan 16 08:47:09 2013 -0600
 */(function(jQuery,undefined){var stepHooks="backgroundColor borderBottomColor borderLeftColor borderRightColor borderTopColor color columnRuleColor outlineColor textDecorationColor textEmphasisColor",// plusequals test for += 100 -= 100
rplusequals=/^([\-+])=\s*(\d+\.?\d*)/,// a set of RE's that can match strings and generate color tuples.
stringParsers=[{re:/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function parse(execResult){return[execResult[1],execResult[2],execResult[3],execResult[4]];}},{re:/rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,parse:function parse(execResult){return[execResult[1]*2.55,execResult[2]*2.55,execResult[3]*2.55,execResult[4]];}},{// this regex ignores A-F because it's compared against an already lowercased string
re:/#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})/,parse:function parse(execResult){return[parseInt(execResult[1],16),parseInt(execResult[2],16),parseInt(execResult[3],16)];}},{// this regex ignores A-F because it's compared against an already lowercased string
re:/#([a-f0-9])([a-f0-9])([a-f0-9])/,parse:function parse(execResult){return[parseInt(execResult[1]+execResult[1],16),parseInt(execResult[2]+execResult[2],16),parseInt(execResult[3]+execResult[3],16)];}},{re:/hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d?(?:\.\d+)?)\s*)?\)/,space:"hsla",parse:function parse(execResult){return[execResult[1],execResult[2]/100,execResult[3]/100,execResult[4]];}}],// jQuery.Color( )
color=jQuery.Color=function(color,green,blue,alpha){return new jQuery.Color.fn.parse(color,green,blue,alpha);},spaces={rgba:{props:{red:{idx:0,type:"byte"},green:{idx:1,type:"byte"},blue:{idx:2,type:"byte"}}},hsla:{props:{hue:{idx:0,type:"degrees"},saturation:{idx:1,type:"percent"},lightness:{idx:2,type:"percent"}}}},propTypes={"byte":{floor:true,max:255},"percent":{max:1},"degrees":{mod:360,floor:true}},support=color.support={},// element for support tests
supportElem=jQuery("<p>")[0],// colors = jQuery.Color.names
colors,// local aliases of functions called often
each=jQuery.each;// determine rgba support immediately
supportElem.style.cssText="background-color:rgba(1,1,1,.5)";support.rgba=supportElem.style.backgroundColor.indexOf("rgba")>-1;// define cache name and alpha properties
// for rgba and hsla spaces
each(spaces,function(spaceName,space){space.cache="_"+spaceName;space.props.alpha={idx:3,type:"percent",def:1};});function clamp(value,prop,allowEmpty){var type=propTypes[prop.type]||{};if(value==null){return allowEmpty||!prop.def?null:prop.def;}// ~~ is an short way of doing floor for positive numbers
value=type.floor?~~value:parseFloat(value);// IE will pass in empty strings as value for alpha,
// which will hit this case
if(isNaN(value)){return prop.def;}if(type.mod){// we add mod before modding to make sure that negatives values
// get converted properly: -10 -> 350
return(value+type.mod)%type.mod;}// for now all property types without mod have min and max
return 0>value?0:type.max<value?type.max:value;}function stringParse(string){var inst=color(),rgba=inst._rgba=[];string=string.toLowerCase();each(stringParsers,function(i,parser){var parsed,match=parser.re.exec(string),values=match&&parser.parse(match),spaceName=parser.space||"rgba";if(values){parsed=inst[spaceName](values);// if this was an rgba parse the assignment might happen twice
// oh well....
inst[spaces[spaceName].cache]=parsed[spaces[spaceName].cache];rgba=inst._rgba=parsed._rgba;// exit each( stringParsers ) here because we matched
return false;}});// Found a stringParser that handled it
if(rgba.length){// if this came from a parsed string, force "transparent" when alpha is 0
// chrome, (and maybe others) return "transparent" as rgba(0,0,0,0)
if(rgba.join()==="0,0,0,0"){jQuery.extend(rgba,colors.transparent);}return inst;}// named colors
return colors[string];}color.fn=jQuery.extend(color.prototype,{parse:function parse(red,green,blue,alpha){if(red===undefined){this._rgba=[null,null,null,null];return this;}if(red.jquery||red.nodeType){red=jQuery(red).css(green);green=undefined;}var inst=this,type=jQuery.type(red),rgba=this._rgba=[];// more than 1 argument specified - assume ( red, green, blue, alpha )
if(green!==undefined){red=[red,green,blue,alpha];type="array";}if(type==="string"){return this.parse(stringParse(red)||colors._default);}if(type==="array"){each(spaces.rgba.props,function(key,prop){rgba[prop.idx]=clamp(red[prop.idx],prop);});return this;}if(type==="object"){if(red instanceof color){each(spaces,function(spaceName,space){if(red[space.cache]){inst[space.cache]=red[space.cache].slice();}});}else{each(spaces,function(spaceName,space){var cache=space.cache;each(space.props,function(key,prop){// if the cache doesn't exist, and we know how to convert
if(!inst[cache]&&space.to){// if the value was null, we don't need to copy it
// if the key was alpha, we don't need to copy it either
if(key==="alpha"||red[key]==null){return;}inst[cache]=space.to(inst._rgba);}// this is the only case where we allow nulls for ALL properties.
// call clamp with alwaysAllowEmpty
inst[cache][prop.idx]=clamp(red[key],prop,true);});// everything defined but alpha?
if(inst[cache]&&jQuery.inArray(null,inst[cache].slice(0,3))<0){// use the default of 1
inst[cache][3]=1;if(space.from){inst._rgba=space.from(inst[cache]);}}});}return this;}},is:function is(compare){var is=color(compare),same=true,inst=this;each(spaces,function(_,space){var localCache,isCache=is[space.cache];if(isCache){localCache=inst[space.cache]||space.to&&space.to(inst._rgba)||[];each(space.props,function(_,prop){if(isCache[prop.idx]!=null){same=isCache[prop.idx]===localCache[prop.idx];return same;}});}return same;});return same;},_space:function _space(){var used=[],inst=this;each(spaces,function(spaceName,space){if(inst[space.cache]){used.push(spaceName);}});return used.pop();},transition:function transition(other,distance){var end=color(other),spaceName=end._space(),space=spaces[spaceName],startColor=this.alpha()===0?color("transparent"):this,start=startColor[space.cache]||space.to(startColor._rgba),result=start.slice();end=end[space.cache];each(space.props,function(key,prop){var index=prop.idx,startValue=start[index],endValue=end[index],type=propTypes[prop.type]||{};// if null, don't override start value
if(endValue===null){return;}// if null - use end
if(startValue===null){result[index]=endValue;}else{if(type.mod){if(endValue-startValue>type.mod/2){startValue+=type.mod;}else if(startValue-endValue>type.mod/2){startValue-=type.mod;}}result[index]=clamp((endValue-startValue)*distance+startValue,prop);}});return this[spaceName](result);},blend:function blend(opaque){// if we are already opaque - return ourself
if(this._rgba[3]===1){return this;}var rgb=this._rgba.slice(),a=rgb.pop(),blend=color(opaque)._rgba;return color(jQuery.map(rgb,function(v,i){return(1-a)*blend[i]+a*v;}));},toRgbaString:function toRgbaString(){var prefix="rgba(",rgba=jQuery.map(this._rgba,function(v,i){return v==null?i>2?1:0:v;});if(rgba[3]===1){rgba.pop();prefix="rgb(";}return prefix+rgba.join()+")";},toHslaString:function toHslaString(){var prefix="hsla(",hsla=jQuery.map(this.hsla(),function(v,i){if(v==null){v=i>2?1:0;}// catch 1 and 2
if(i&&i<3){v=Math.round(v*100)+"%";}return v;});if(hsla[3]===1){hsla.pop();prefix="hsl(";}return prefix+hsla.join()+")";},toHexString:function toHexString(includeAlpha){var rgba=this._rgba.slice(),alpha=rgba.pop();if(includeAlpha){rgba.push(~~(alpha*255));}return"#"+jQuery.map(rgba,function(v){// default to 0 when nulls exist
v=(v||0).toString(16);return v.length===1?"0"+v:v;}).join("");},toString:function toString(){return this._rgba[3]===0?"transparent":this.toRgbaString();}});color.fn.parse.prototype=color.fn;// hsla conversions adapted from:
// https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021
function hue2rgb(p,q,h){h=(h+1)%1;if(h*6<1){return p+(q-p)*h*6;}if(h*2<1){return q;}if(h*3<2){return p+(q-p)*(2/3-h)*6;}return p;}spaces.hsla.to=function(rgba){if(rgba[0]==null||rgba[1]==null||rgba[2]==null){return[null,null,null,rgba[3]];}var r=rgba[0]/255,g=rgba[1]/255,b=rgba[2]/255,a=rgba[3],max=Math.max(r,g,b),min=Math.min(r,g,b),diff=max-min,add=max+min,l=add*0.5,h,s;if(min===max){h=0;}else if(r===max){h=60*(g-b)/diff+360;}else if(g===max){h=60*(b-r)/diff+120;}else{h=60*(r-g)/diff+240;}// chroma (diff) == 0 means greyscale which, by definition, saturation = 0%
// otherwise, saturation is based on the ratio of chroma (diff) to lightness (add)
if(diff===0){s=0;}else if(l<=0.5){s=diff/add;}else{s=diff/(2-add);}return[Math.round(h)%360,s,l,a==null?1:a];};spaces.hsla.from=function(hsla){if(hsla[0]==null||hsla[1]==null||hsla[2]==null){return[null,null,null,hsla[3]];}var h=hsla[0]/360,s=hsla[1],l=hsla[2],a=hsla[3],q=l<=0.5?l*(1+s):l+s-l*s,p=2*l-q;return[Math.round(hue2rgb(p,q,h+1/3)*255),Math.round(hue2rgb(p,q,h)*255),Math.round(hue2rgb(p,q,h-1/3)*255),a];};each(spaces,function(spaceName,space){var props=space.props,cache=space.cache,to=space.to,from=space.from;// makes rgba() and hsla()
color.fn[spaceName]=function(value){// generate a cache for this space if it doesn't exist
if(to&&!this[cache]){this[cache]=to(this._rgba);}if(value===undefined){return this[cache].slice();}var ret,type=jQuery.type(value),arr=type==="array"||type==="object"?value:arguments,local=this[cache].slice();each(props,function(key,prop){var val=arr[type==="object"?key:prop.idx];if(val==null){val=local[prop.idx];}local[prop.idx]=clamp(val,prop);});if(from){ret=color(from(local));ret[cache]=local;return ret;}else{return color(local);}};// makes red() green() blue() alpha() hue() saturation() lightness()
each(props,function(key,prop){// alpha is included in more than one space
if(color.fn[key]){return;}color.fn[key]=function(value){var vtype=jQuery.type(value),fn=key==="alpha"?this._hsla?"hsla":"rgba":spaceName,local=this[fn](),cur=local[prop.idx],match;if(vtype==="undefined"){return cur;}if(vtype==="function"){value=value.call(this,cur);vtype=jQuery.type(value);}if(value==null&&prop.empty){return this;}if(vtype==="string"){match=rplusequals.exec(value);if(match){value=cur+parseFloat(match[2])*(match[1]==="+"?1:-1);}}local[prop.idx]=value;return this[fn](local);};});});// add cssHook and .fx.step function for each named hook.
// accept a space separated string of properties
color.hook=function(hook){var hooks=hook.split(" ");each(hooks,function(i,hook){jQuery.cssHooks[hook]={set:function set(elem,value){var parsed,curElem,backgroundColor="";if(value!=="transparent"&&(jQuery.type(value)!=="string"||(parsed=stringParse(value)))){value=color(parsed||value);if(!support.rgba&&value._rgba[3]!==1){curElem=hook==="backgroundColor"?elem.parentNode:elem;while((backgroundColor===""||backgroundColor==="transparent")&&curElem&&curElem.style){try{backgroundColor=jQuery.css(curElem,"backgroundColor");curElem=curElem.parentNode;}catch(e){}}value=value.blend(backgroundColor&&backgroundColor!=="transparent"?backgroundColor:"_default");}value=value.toRgbaString();}try{elem.style[hook]=value;}catch(e){// wrapped to prevent IE from throwing errors on "invalid" values like 'auto' or 'inherit'
}}};jQuery.fx.step[hook]=function(fx){if(!fx.colorInit){fx.start=color(fx.elem,hook);fx.end=color(fx.end);fx.colorInit=true;}jQuery.cssHooks[hook].set(fx.elem,fx.start.transition(fx.end,fx.pos));};});};color.hook(stepHooks);jQuery.cssHooks.borderColor={expand:function expand(value){var expanded={};each(["Top","Right","Bottom","Left"],function(i,part){expanded["border"+part+"Color"]=value;});return expanded;}};// Basic color names only.
// Usage of any of the other color names requires adding yourself or including
// jquery.color.svg-names.js.
colors=jQuery.Color.names={// 4.1. Basic color keywords
aqua:"#00ffff",black:"#000000",blue:"#0000ff",fuchsia:"#ff00ff",gray:"#808080",green:"#008000",lime:"#00ff00",maroon:"#800000",navy:"#000080",olive:"#808000",purple:"#800080",red:"#ff0000",silver:"#c0c0c0",teal:"#008080",white:"#ffffff",yellow:"#ffff00",// 4.2.3. "transparent" color keyword
transparent:[null,null,null,0],_default:"#ffffff"};})(jQuery);/******************************************************************************//****************************** CLASS ANIMATIONS ******************************//******************************************************************************/(function(){var classAnimationActions=["add","remove","toggle"],shorthandStyles={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};$.each(["borderLeftStyle","borderRightStyle","borderBottomStyle","borderTopStyle"],function(_,prop){$.fx.step[prop]=function(fx){if(fx.end!=="none"&&!fx.setAttr||fx.pos===1&&!fx.setAttr){jQuery.style(fx.elem,prop,fx.end);fx.setAttr=true;}};});function getElementStyles(elem){var key,len,style=elem.ownerDocument.defaultView?elem.ownerDocument.defaultView.getComputedStyle(elem,null):elem.currentStyle,styles={};if(style&&style.length&&style[0]&&style[style[0]]){len=style.length;while(len--){key=style[len];if(typeof style[key]==="string"){styles[$.camelCase(key)]=style[key];}}// support: Opera, IE <9
}else{for(key in style){if(typeof style[key]==="string"){styles[key]=style[key];}}}return styles;}function styleDifference(oldStyle,newStyle){var diff={},name,value;for(name in newStyle){value=newStyle[name];if(oldStyle[name]!==value){if(!shorthandStyles[name]){if($.fx.step[name]||!isNaN(parseFloat(value))){diff[name]=value;}}}}return diff;}// support: jQuery <1.8
if(!$.fn.addBack){$.fn.addBack=function(selector){return this.add(selector==null?this.prevObject:this.prevObject.filter(selector));};}$.effects.animateClass=function(value,duration,easing,callback){var o=$.speed(duration,easing,callback);return this.queue(function(){var animated=$(this),baseClass=animated.attr("class")||"",applyClassChange,allAnimations=o.children?animated.find("*").addBack():animated;// map the animated objects to store the original styles.
allAnimations=allAnimations.map(function(){var el=$(this);return{el:el,start:getElementStyles(this)};});// apply class change
applyClassChange=function applyClassChange(){$.each(classAnimationActions,function(i,action){if(value[action]){animated[action+"Class"](value[action]);}});};applyClassChange();// map all animated objects again - calculate new styles and diff
allAnimations=allAnimations.map(function(){this.end=getElementStyles(this.el[0]);this.diff=styleDifference(this.start,this.end);return this;});// apply original class
animated.attr("class",baseClass);// map all animated objects again - this time collecting a promise
allAnimations=allAnimations.map(function(){var styleInfo=this,dfd=$.Deferred(),opts=$.extend({},o,{queue:false,complete:function complete(){dfd.resolve(styleInfo);}});this.el.animate(this.diff,opts);return dfd.promise();});// once all animations have completed:
$.when.apply($,allAnimations.get()).done(function(){// set the final class
applyClassChange();// for each animated element,
// clear all css properties that were animated
$.each(arguments,function(){var el=this.el;$.each(this.diff,function(key){el.css(key,"");});});// this is guarnteed to be there if you use jQuery.speed()
// it also handles dequeuing the next anim...
o.complete.call(animated[0]);});});};$.fn.extend({addClass:function(orig){return function(classNames,speed,easing,callback){return speed?$.effects.animateClass.call(this,{add:classNames},speed,easing,callback):orig.apply(this,arguments);};}($.fn.addClass),removeClass:function(orig){return function(classNames,speed,easing,callback){return arguments.length>1?$.effects.animateClass.call(this,{remove:classNames},speed,easing,callback):orig.apply(this,arguments);};}($.fn.removeClass),toggleClass:function(orig){return function(classNames,force,speed,easing,callback){if(typeof force==="boolean"||force===undefined){if(!speed){// without speed parameter
return orig.apply(this,arguments);}else{return $.effects.animateClass.call(this,force?{add:classNames}:{remove:classNames},speed,easing,callback);}}else{// without force parameter
return $.effects.animateClass.call(this,{toggle:classNames},force,speed,easing);}};}($.fn.toggleClass),switchClass:function switchClass(remove,add,speed,easing,callback){return $.effects.animateClass.call(this,{add:add,remove:remove},speed,easing,callback);}});})();/******************************************************************************//*********************************** EFFECTS **********************************//******************************************************************************/(function(){$.extend($.effects,{version:"1.11.4",// Saves a set of properties in a data storage
save:function save(element,set){for(var i=0;i<set.length;i++){if(set[i]!==null){element.data(dataSpace+set[i],element[0].style[set[i]]);}}},// Restores a set of previously saved properties from a data storage
restore:function restore(element,set){var val,i;for(i=0;i<set.length;i++){if(set[i]!==null){val=element.data(dataSpace+set[i]);// support: jQuery 1.6.2
// http://bugs.jquery.com/ticket/9917
// jQuery 1.6.2 incorrectly returns undefined for any falsy value.
// We can't differentiate between "" and 0 here, so we just assume
// empty string since it's likely to be a more common value...
if(val===undefined){val="";}element.css(set[i],val);}}},setMode:function setMode(el,mode){if(mode==="toggle"){mode=el.is(":hidden")?"show":"hide";}return mode;},// Translates a [top,left] array into a baseline value
// this should be a little more flexible in the future to handle a string & hash
getBaseline:function getBaseline(origin,original){var y,x;switch(origin[0]){case"top":y=0;break;case"middle":y=0.5;break;case"bottom":y=1;break;default:y=origin[0]/original.height;}switch(origin[1]){case"left":x=0;break;case"center":x=0.5;break;case"right":x=1;break;default:x=origin[1]/original.width;}return{x:x,y:y};},// Wraps the element around a wrapper that copies position properties
createWrapper:function createWrapper(element){// if the element is already wrapped, return it
if(element.parent().is(".ui-effects-wrapper")){return element.parent();}// wrap the element
var props={width:element.outerWidth(true),height:element.outerHeight(true),"float":element.css("float")},wrapper=$("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0}),// Store the size in case width/height are defined in % - Fixes #5245
size={width:element.width(),height:element.height()},active=document.activeElement;// support: Firefox
// Firefox incorrectly exposes anonymous content
// https://bugzilla.mozilla.org/show_bug.cgi?id=561664
try{active.id;}catch(e){active=document.body;}element.wrap(wrapper);// Fixes #7595 - Elements lose focus when wrapped.
if(element[0]===active||$.contains(element[0],active)){$(active).focus();}wrapper=element.parent();//Hotfix for jQuery 1.4 since some change in wrap() seems to actually lose the reference to the wrapped element
// transfer positioning properties to the wrapper
if(element.css("position")==="static"){wrapper.css({position:"relative"});element.css({position:"relative"});}else{$.extend(props,{position:element.css("position"),zIndex:element.css("z-index")});$.each(["top","left","bottom","right"],function(i,pos){props[pos]=element.css(pos);if(isNaN(parseInt(props[pos],10))){props[pos]="auto";}});element.css({position:"relative",top:0,left:0,right:"auto",bottom:"auto"});}element.css(size);return wrapper.css(props).show();},removeWrapper:function removeWrapper(element){var active=document.activeElement;if(element.parent().is(".ui-effects-wrapper")){element.parent().replaceWith(element);// Fixes #7595 - Elements lose focus when wrapped.
if(element[0]===active||$.contains(element[0],active)){$(active).focus();}}return element;},setTransition:function setTransition(element,list,factor,value){value=value||{};$.each(list,function(i,x){var unit=element.cssUnit(x);if(unit[0]>0){value[x]=unit[0]*factor+unit[1];}});return value;}});// return an effect options object for the given parameters:
function _normalizeArguments(effect,options,speed,callback){// allow passing all options as the first parameter
if($.isPlainObject(effect)){options=effect;effect=effect.effect;}// convert to an object
effect={effect:effect};// catch (effect, null, ...)
if(options==null){options={};}// catch (effect, callback)
if($.isFunction(options)){callback=options;speed=null;options={};}// catch (effect, speed, ?)
if(typeof options==="number"||$.fx.speeds[options]){callback=speed;speed=options;options={};}// catch (effect, options, callback)
if($.isFunction(speed)){callback=speed;speed=null;}// add options to effect
if(options){$.extend(effect,options);}speed=speed||options.duration;effect.duration=$.fx.off?0:typeof speed==="number"?speed:speed in $.fx.speeds?$.fx.speeds[speed]:$.fx.speeds._default;effect.complete=callback||options.complete;return effect;}function standardAnimationOption(option){// Valid standard speeds (nothing, number, named speed)
if(!option||typeof option==="number"||$.fx.speeds[option]){return true;}// Invalid strings - treat as "normal" speed
if(typeof option==="string"&&!$.effects.effect[option]){return true;}// Complete callback
if($.isFunction(option)){return true;}// Options hash (but not naming an effect)
if((typeof option==="undefined"?"undefined":_typeof(option))==="object"&&!option.effect){return true;}// Didn't match any standard API
return false;}$.fn.extend({effect:function effect()/* effect, options, speed, callback */{var args=_normalizeArguments.apply(this,arguments),mode=args.mode,queue=args.queue,effectMethod=$.effects.effect[args.effect];if($.fx.off||!effectMethod){// delegate to the original method (e.g., .show()) if possible
if(mode){return this[mode](args.duration,args.complete);}else{return this.each(function(){if(args.complete){args.complete.call(this);}});}}function run(next){var elem=$(this),complete=args.complete,mode=args.mode;function done(){if($.isFunction(complete)){complete.call(elem[0]);}if($.isFunction(next)){next();}}// If the element already has the correct final state, delegate to
// the core methods so the internal tracking of "olddisplay" works.
if(elem.is(":hidden")?mode==="hide":mode==="show"){elem[mode]();done();}else{effectMethod.call(elem[0],args,done);}}return queue===false?this.each(run):this.queue(queue||"fx",run);},show:function(orig){return function(option){if(standardAnimationOption(option)){return orig.apply(this,arguments);}else{var args=_normalizeArguments.apply(this,arguments);args.mode="show";return this.effect.call(this,args);}};}($.fn.show),hide:function(orig){return function(option){if(standardAnimationOption(option)){return orig.apply(this,arguments);}else{var args=_normalizeArguments.apply(this,arguments);args.mode="hide";return this.effect.call(this,args);}};}($.fn.hide),toggle:function(orig){return function(option){if(standardAnimationOption(option)||typeof option==="boolean"){return orig.apply(this,arguments);}else{var args=_normalizeArguments.apply(this,arguments);args.mode="toggle";return this.effect.call(this,args);}};}($.fn.toggle),// helper functions
cssUnit:function cssUnit(key){var style=this.css(key),val=[];$.each(["em","px","%","pt"],function(i,unit){if(style.indexOf(unit)>0){val=[parseFloat(style),unit];}});return val;}});})();/******************************************************************************//*********************************** EASING ***********************************//******************************************************************************/(function(){// based on easing equations from Robert Penner (http://www.robertpenner.com/easing)
var baseEasings={};$.each(["Quad","Cubic","Quart","Quint","Expo"],function(i,name){baseEasings[name]=function(p){return Math.pow(p,i+2);};});$.extend(baseEasings,{Sine:function Sine(p){return 1-Math.cos(p*Math.PI/2);},Circ:function Circ(p){return 1-Math.sqrt(1-p*p);},Elastic:function Elastic(p){return p===0||p===1?p:-Math.pow(2,8*(p-1))*Math.sin(((p-1)*80-7.5)*Math.PI/15);},Back:function Back(p){return p*p*(3*p-2);},Bounce:function Bounce(p){var pow2,bounce=4;while(p<((pow2=Math.pow(2,--bounce))-1)/11){}return 1/Math.pow(4,3-bounce)-7.5625*Math.pow((pow2*3-2)/22-p,2);}});$.each(baseEasings,function(name,easeIn){$.easing["easeIn"+name]=easeIn;$.easing["easeOut"+name]=function(p){return 1-easeIn(1-p);};$.easing["easeInOut"+name]=function(p){return p<0.5?easeIn(p*2)/2:1-easeIn(p*-2+2)/2;};});})();var effect=$.effects;/*!
 * jQuery UI Effects Blind 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/blind-effect/
 */var effectBlind=$.effects.effect.blind=function(o,done){// Create element
var el=$(this),rvertical=/up|down|vertical/,rpositivemotion=/up|left|vertical|horizontal/,props=["position","top","bottom","left","right","height","width"],mode=$.effects.setMode(el,o.mode||"hide"),direction=o.direction||"up",vertical=rvertical.test(direction),ref=vertical?"height":"width",ref2=vertical?"top":"left",motion=rpositivemotion.test(direction),animation={},show=mode==="show",wrapper,distance,margin;// if already wrapped, the wrapper's properties are my property. #6245
if(el.parent().is(".ui-effects-wrapper")){$.effects.save(el.parent(),props);}else{$.effects.save(el,props);}el.show();wrapper=$.effects.createWrapper(el).css({overflow:"hidden"});distance=wrapper[ref]();margin=parseFloat(wrapper.css(ref2))||0;animation[ref]=show?distance:0;if(!motion){el.css(vertical?"bottom":"right",0).css(vertical?"top":"left","auto").css({position:"absolute"});animation[ref2]=show?margin:distance+margin;}// start at 0 if we are showing
if(show){wrapper.css(ref,0);if(!motion){wrapper.css(ref2,margin+distance);}}// Animate
wrapper.animate(animation,{duration:o.duration,easing:o.easing,queue:false,complete:function complete(){if(mode==="hide"){el.hide();}$.effects.restore(el,props);$.effects.removeWrapper(el);done();}});};/*!
 * jQuery UI Effects Bounce 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/bounce-effect/
 */var effectBounce=$.effects.effect.bounce=function(o,done){var el=$(this),props=["position","top","bottom","left","right","height","width"],// defaults:
mode=$.effects.setMode(el,o.mode||"effect"),hide=mode==="hide",show=mode==="show",direction=o.direction||"up",distance=o.distance,times=o.times||5,// number of internal animations
anims=times*2+(show||hide?1:0),speed=o.duration/anims,easing=o.easing,// utility:
ref=direction==="up"||direction==="down"?"top":"left",motion=direction==="up"||direction==="left",i,upAnim,downAnim,// we will need to re-assemble the queue to stack our animations in place
queue=el.queue(),queuelen=queue.length;// Avoid touching opacity to prevent clearType and PNG issues in IE
if(show||hide){props.push("opacity");}$.effects.save(el,props);el.show();$.effects.createWrapper(el);// Create Wrapper
// default distance for the BIGGEST bounce is the outer Distance / 3
if(!distance){distance=el[ref==="top"?"outerHeight":"outerWidth"]()/3;}if(show){downAnim={opacity:1};downAnim[ref]=0;// if we are showing, force opacity 0 and set the initial position
// then do the "first" animation
el.css("opacity",0).css(ref,motion?-distance*2:distance*2).animate(downAnim,speed,easing);}// start at the smallest distance if we are hiding
if(hide){distance=distance/Math.pow(2,times-1);}downAnim={};downAnim[ref]=0;// Bounces up/down/left/right then back to 0 -- times * 2 animations happen here
for(i=0;i<times;i++){upAnim={};upAnim[ref]=(motion?"-=":"+=")+distance;el.animate(upAnim,speed,easing).animate(downAnim,speed,easing);distance=hide?distance*2:distance/2;}// Last Bounce when Hiding
if(hide){upAnim={opacity:0};upAnim[ref]=(motion?"-=":"+=")+distance;el.animate(upAnim,speed,easing);}el.queue(function(){if(hide){el.hide();}$.effects.restore(el,props);$.effects.removeWrapper(el);done();});// inject all the animations we just queued to be first in line (after "inprogress")
if(queuelen>1){queue.splice.apply(queue,[1,0].concat(queue.splice(queuelen,anims+1)));}el.dequeue();};/*!
 * jQuery UI Effects Clip 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/clip-effect/
 */var effectClip=$.effects.effect.clip=function(o,done){// Create element
var el=$(this),props=["position","top","bottom","left","right","height","width"],mode=$.effects.setMode(el,o.mode||"hide"),show=mode==="show",direction=o.direction||"vertical",vert=direction==="vertical",size=vert?"height":"width",position=vert?"top":"left",animation={},wrapper,animate,distance;// Save & Show
$.effects.save(el,props);el.show();// Create Wrapper
wrapper=$.effects.createWrapper(el).css({overflow:"hidden"});animate=el[0].tagName==="IMG"?wrapper:el;distance=animate[size]();// Shift
if(show){animate.css(size,0);animate.css(position,distance/2);}// Create Animation Object:
animation[size]=show?distance:0;animation[position]=show?0:distance/2;// Animate
animate.animate(animation,{queue:false,duration:o.duration,easing:o.easing,complete:function complete(){if(!show){el.hide();}$.effects.restore(el,props);$.effects.removeWrapper(el);done();}});};/*!
 * jQuery UI Effects Drop 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/drop-effect/
 */var effectDrop=$.effects.effect.drop=function(o,done){var el=$(this),props=["position","top","bottom","left","right","opacity","height","width"],mode=$.effects.setMode(el,o.mode||"hide"),show=mode==="show",direction=o.direction||"left",ref=direction==="up"||direction==="down"?"top":"left",motion=direction==="up"||direction==="left"?"pos":"neg",animation={opacity:show?1:0},distance;// Adjust
$.effects.save(el,props);el.show();$.effects.createWrapper(el);distance=o.distance||el[ref==="top"?"outerHeight":"outerWidth"](true)/2;if(show){el.css("opacity",0).css(ref,motion==="pos"?-distance:distance);}// Animation
animation[ref]=(show?motion==="pos"?"+=":"-=":motion==="pos"?"-=":"+=")+distance;// Animate
el.animate(animation,{queue:false,duration:o.duration,easing:o.easing,complete:function complete(){if(mode==="hide"){el.hide();}$.effects.restore(el,props);$.effects.removeWrapper(el);done();}});};/*!
 * jQuery UI Effects Explode 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/explode-effect/
 */var effectExplode=$.effects.effect.explode=function(o,done){var rows=o.pieces?Math.round(Math.sqrt(o.pieces)):3,cells=rows,el=$(this),mode=$.effects.setMode(el,o.mode||"hide"),show=mode==="show",// show and then visibility:hidden the element before calculating offset
offset=el.show().css("visibility","hidden").offset(),// width and height of a piece
width=Math.ceil(el.outerWidth()/cells),height=Math.ceil(el.outerHeight()/rows),pieces=[],// loop
i,j,left,top,mx,my;// children animate complete:
function childComplete(){pieces.push(this);if(pieces.length===rows*cells){animComplete();}}// clone the element for each row and cell.
for(i=0;i<rows;i++){// ===>
top=offset.top+i*height;my=i-(rows-1)/2;for(j=0;j<cells;j++){// |||
left=offset.left+j*width;mx=j-(cells-1)/2;// Create a clone of the now hidden main element that will be absolute positioned
// within a wrapper div off the -left and -top equal to size of our pieces
el.clone().appendTo("body").wrap("<div></div>").css({position:"absolute",visibility:"visible",left:-j*width,top:-i*height})// select the wrapper - make it overflow: hidden and absolute positioned based on
// where the original was located +left and +top equal to the size of pieces
.parent().addClass("ui-effects-explode").css({position:"absolute",overflow:"hidden",width:width,height:height,left:left+(show?mx*width:0),top:top+(show?my*height:0),opacity:show?0:1}).animate({left:left+(show?0:mx*width),top:top+(show?0:my*height),opacity:show?1:0},o.duration||500,o.easing,childComplete);}}function animComplete(){el.css({visibility:"visible"});$(pieces).remove();if(!show){el.hide();}done();}};/*!
 * jQuery UI Effects Fade 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/fade-effect/
 */var effectFade=$.effects.effect.fade=function(o,done){var el=$(this),mode=$.effects.setMode(el,o.mode||"toggle");el.animate({opacity:mode},{queue:false,duration:o.duration,easing:o.easing,complete:done});};/*!
 * jQuery UI Effects Fold 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/fold-effect/
 */var effectFold=$.effects.effect.fold=function(o,done){// Create element
var el=$(this),props=["position","top","bottom","left","right","height","width"],mode=$.effects.setMode(el,o.mode||"hide"),show=mode==="show",hide=mode==="hide",size=o.size||15,percent=/([0-9]+)%/.exec(size),horizFirst=!!o.horizFirst,widthFirst=show!==horizFirst,ref=widthFirst?["width","height"]:["height","width"],duration=o.duration/2,wrapper,distance,animation1={},animation2={};$.effects.save(el,props);el.show();// Create Wrapper
wrapper=$.effects.createWrapper(el).css({overflow:"hidden"});distance=widthFirst?[wrapper.width(),wrapper.height()]:[wrapper.height(),wrapper.width()];if(percent){size=parseInt(percent[1],10)/100*distance[hide?0:1];}if(show){wrapper.css(horizFirst?{height:0,width:size}:{height:size,width:0});}// Animation
animation1[ref[0]]=show?distance[0]:size;animation2[ref[1]]=show?distance[1]:0;// Animate
wrapper.animate(animation1,duration,o.easing).animate(animation2,duration,o.easing,function(){if(hide){el.hide();}$.effects.restore(el,props);$.effects.removeWrapper(el);done();});};/*!
 * jQuery UI Effects Highlight 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/highlight-effect/
 */var effectHighlight=$.effects.effect.highlight=function(o,done){var elem=$(this),props=["backgroundImage","backgroundColor","opacity"],mode=$.effects.setMode(elem,o.mode||"show"),animation={backgroundColor:elem.css("backgroundColor")};if(mode==="hide"){animation.opacity=0;}$.effects.save(elem,props);elem.show().css({backgroundImage:"none",backgroundColor:o.color||"#ffff99"}).animate(animation,{queue:false,duration:o.duration,easing:o.easing,complete:function complete(){if(mode==="hide"){elem.hide();}$.effects.restore(elem,props);done();}});};/*!
 * jQuery UI Effects Size 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/size-effect/
 */var effectSize=$.effects.effect.size=function(o,done){// Create element
var original,baseline,factor,el=$(this),props0=["position","top","bottom","left","right","width","height","overflow","opacity"],// Always restore
props1=["position","top","bottom","left","right","overflow","opacity"],// Copy for children
props2=["width","height","overflow"],cProps=["fontSize"],vProps=["borderTopWidth","borderBottomWidth","paddingTop","paddingBottom"],hProps=["borderLeftWidth","borderRightWidth","paddingLeft","paddingRight"],// Set options
mode=$.effects.setMode(el,o.mode||"effect"),restore=o.restore||mode!=="effect",scale=o.scale||"both",origin=o.origin||["middle","center"],position=el.css("position"),props=restore?props0:props1,zero={height:0,width:0,outerHeight:0,outerWidth:0};if(mode==="show"){el.show();}original={height:el.height(),width:el.width(),outerHeight:el.outerHeight(),outerWidth:el.outerWidth()};if(o.mode==="toggle"&&mode==="show"){el.from=o.to||zero;el.to=o.from||original;}else{el.from=o.from||(mode==="show"?zero:original);el.to=o.to||(mode==="hide"?zero:original);}// Set scaling factor
factor={from:{y:el.from.height/original.height,x:el.from.width/original.width},to:{y:el.to.height/original.height,x:el.to.width/original.width}};// Scale the css box
if(scale==="box"||scale==="both"){// Vertical props scaling
if(factor.from.y!==factor.to.y){props=props.concat(vProps);el.from=$.effects.setTransition(el,vProps,factor.from.y,el.from);el.to=$.effects.setTransition(el,vProps,factor.to.y,el.to);}// Horizontal props scaling
if(factor.from.x!==factor.to.x){props=props.concat(hProps);el.from=$.effects.setTransition(el,hProps,factor.from.x,el.from);el.to=$.effects.setTransition(el,hProps,factor.to.x,el.to);}}// Scale the content
if(scale==="content"||scale==="both"){// Vertical props scaling
if(factor.from.y!==factor.to.y){props=props.concat(cProps).concat(props2);el.from=$.effects.setTransition(el,cProps,factor.from.y,el.from);el.to=$.effects.setTransition(el,cProps,factor.to.y,el.to);}}$.effects.save(el,props);el.show();$.effects.createWrapper(el);el.css("overflow","hidden").css(el.from);// Adjust
if(origin){// Calculate baseline shifts
baseline=$.effects.getBaseline(origin,original);el.from.top=(original.outerHeight-el.outerHeight())*baseline.y;el.from.left=(original.outerWidth-el.outerWidth())*baseline.x;el.to.top=(original.outerHeight-el.to.outerHeight)*baseline.y;el.to.left=(original.outerWidth-el.to.outerWidth)*baseline.x;}el.css(el.from);// set top & left
// Animate
if(scale==="content"||scale==="both"){// Scale the children
// Add margins/font-size
vProps=vProps.concat(["marginTop","marginBottom"]).concat(cProps);hProps=hProps.concat(["marginLeft","marginRight"]);props2=props0.concat(vProps).concat(hProps);el.find("*[width]").each(function(){var child=$(this),c_original={height:child.height(),width:child.width(),outerHeight:child.outerHeight(),outerWidth:child.outerWidth()};if(restore){$.effects.save(child,props2);}child.from={height:c_original.height*factor.from.y,width:c_original.width*factor.from.x,outerHeight:c_original.outerHeight*factor.from.y,outerWidth:c_original.outerWidth*factor.from.x};child.to={height:c_original.height*factor.to.y,width:c_original.width*factor.to.x,outerHeight:c_original.height*factor.to.y,outerWidth:c_original.width*factor.to.x};// Vertical props scaling
if(factor.from.y!==factor.to.y){child.from=$.effects.setTransition(child,vProps,factor.from.y,child.from);child.to=$.effects.setTransition(child,vProps,factor.to.y,child.to);}// Horizontal props scaling
if(factor.from.x!==factor.to.x){child.from=$.effects.setTransition(child,hProps,factor.from.x,child.from);child.to=$.effects.setTransition(child,hProps,factor.to.x,child.to);}// Animate children
child.css(child.from);child.animate(child.to,o.duration,o.easing,function(){// Restore children
if(restore){$.effects.restore(child,props2);}});});}// Animate
el.animate(el.to,{queue:false,duration:o.duration,easing:o.easing,complete:function complete(){if(el.to.opacity===0){el.css("opacity",el.from.opacity);}if(mode==="hide"){el.hide();}$.effects.restore(el,props);if(!restore){// we need to calculate our new positioning based on the scaling
if(position==="static"){el.css({position:"relative",top:el.to.top,left:el.to.left});}else{$.each(["top","left"],function(idx,pos){el.css(pos,function(_,str){var val=parseInt(str,10),toRef=idx?el.to.left:el.to.top;// if original was "auto", recalculate the new value from wrapper
if(str==="auto"){return toRef+"px";}return val+toRef+"px";});});}}$.effects.removeWrapper(el);done();}});};/*!
 * jQuery UI Effects Scale 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/scale-effect/
 */var effectScale=$.effects.effect.scale=function(o,done){// Create element
var el=$(this),options=$.extend(true,{},o),mode=$.effects.setMode(el,o.mode||"effect"),percent=parseInt(o.percent,10)||(parseInt(o.percent,10)===0?0:mode==="hide"?0:100),direction=o.direction||"both",origin=o.origin,original={height:el.height(),width:el.width(),outerHeight:el.outerHeight(),outerWidth:el.outerWidth()},factor={y:direction!=="horizontal"?percent/100:1,x:direction!=="vertical"?percent/100:1};// We are going to pass this effect to the size effect:
options.effect="size";options.queue=false;options.complete=done;// Set default origin and restore for show/hide
if(mode!=="effect"){options.origin=origin||["middle","center"];options.restore=true;}options.from=o.from||(mode==="show"?{height:0,width:0,outerHeight:0,outerWidth:0}:original);options.to={height:original.height*factor.y,width:original.width*factor.x,outerHeight:original.outerHeight*factor.y,outerWidth:original.outerWidth*factor.x};// Fade option to support puff
if(options.fade){if(mode==="show"){options.from.opacity=0;options.to.opacity=1;}if(mode==="hide"){options.from.opacity=1;options.to.opacity=0;}}// Animate
el.effect(options);};/*!
 * jQuery UI Effects Puff 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/puff-effect/
 */var effectPuff=$.effects.effect.puff=function(o,done){var elem=$(this),mode=$.effects.setMode(elem,o.mode||"hide"),hide=mode==="hide",percent=parseInt(o.percent,10)||150,factor=percent/100,original={height:elem.height(),width:elem.width(),outerHeight:elem.outerHeight(),outerWidth:elem.outerWidth()};$.extend(o,{effect:"scale",queue:false,fade:true,mode:mode,complete:done,percent:hide?percent:100,from:hide?original:{height:original.height*factor,width:original.width*factor,outerHeight:original.outerHeight*factor,outerWidth:original.outerWidth*factor}});elem.effect(o);};/*!
 * jQuery UI Effects Pulsate 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/pulsate-effect/
 */var effectPulsate=$.effects.effect.pulsate=function(o,done){var elem=$(this),mode=$.effects.setMode(elem,o.mode||"show"),show=mode==="show",hide=mode==="hide",showhide=show||mode==="hide",// showing or hiding leaves of the "last" animation
anims=(o.times||5)*2+(showhide?1:0),duration=o.duration/anims,animateTo=0,queue=elem.queue(),queuelen=queue.length,i;if(show||!elem.is(":visible")){elem.css("opacity",0).show();animateTo=1;}// anims - 1 opacity "toggles"
for(i=1;i<anims;i++){elem.animate({opacity:animateTo},duration,o.easing);animateTo=1-animateTo;}elem.animate({opacity:animateTo},duration,o.easing);elem.queue(function(){if(hide){elem.hide();}done();});// We just queued up "anims" animations, we need to put them next in the queue
if(queuelen>1){queue.splice.apply(queue,[1,0].concat(queue.splice(queuelen,anims+1)));}elem.dequeue();};/*!
 * jQuery UI Effects Shake 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/shake-effect/
 */var effectShake=$.effects.effect.shake=function(o,done){var el=$(this),props=["position","top","bottom","left","right","height","width"],mode=$.effects.setMode(el,o.mode||"effect"),direction=o.direction||"left",distance=o.distance||20,times=o.times||3,anims=times*2+1,speed=Math.round(o.duration/anims),ref=direction==="up"||direction==="down"?"top":"left",positiveMotion=direction==="up"||direction==="left",animation={},animation1={},animation2={},i,// we will need to re-assemble the queue to stack our animations in place
queue=el.queue(),queuelen=queue.length;$.effects.save(el,props);el.show();$.effects.createWrapper(el);// Animation
animation[ref]=(positiveMotion?"-=":"+=")+distance;animation1[ref]=(positiveMotion?"+=":"-=")+distance*2;animation2[ref]=(positiveMotion?"-=":"+=")+distance*2;// Animate
el.animate(animation,speed,o.easing);// Shakes
for(i=1;i<times;i++){el.animate(animation1,speed,o.easing).animate(animation2,speed,o.easing);}el.animate(animation1,speed,o.easing).animate(animation,speed/2,o.easing).queue(function(){if(mode==="hide"){el.hide();}$.effects.restore(el,props);$.effects.removeWrapper(el);done();});// inject all the animations we just queued to be first in line (after "inprogress")
if(queuelen>1){queue.splice.apply(queue,[1,0].concat(queue.splice(queuelen,anims+1)));}el.dequeue();};/*!
 * jQuery UI Effects Slide 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/slide-effect/
 */var effectSlide=$.effects.effect.slide=function(o,done){// Create element
var el=$(this),props=["position","top","bottom","left","right","width","height"],mode=$.effects.setMode(el,o.mode||"show"),show=mode==="show",direction=o.direction||"left",ref=direction==="up"||direction==="down"?"top":"left",positiveMotion=direction==="up"||direction==="left",distance,animation={};// Adjust
$.effects.save(el,props);el.show();distance=o.distance||el[ref==="top"?"outerHeight":"outerWidth"](true);$.effects.createWrapper(el).css({overflow:"hidden"});if(show){el.css(ref,positiveMotion?isNaN(distance)?"-"+distance:-distance:distance);}// Animation
animation[ref]=(show?positiveMotion?"+=":"-=":positiveMotion?"-=":"+=")+distance;// Animate
el.animate(animation,{queue:false,duration:o.duration,easing:o.easing,complete:function complete(){if(mode==="hide"){el.hide();}$.effects.restore(el,props);$.effects.removeWrapper(el);done();}});};/*!
 * jQuery UI Effects Transfer 1.11.4
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/transfer-effect/
 */var effectTransfer=$.effects.effect.transfer=function(o,done){var elem=$(this),target=$(o.to),targetFixed=target.css("position")==="fixed",body=$("body"),fixTop=targetFixed?body.scrollTop():0,fixLeft=targetFixed?body.scrollLeft():0,endPosition=target.offset(),animation={top:endPosition.top-fixTop,left:endPosition.left-fixLeft,height:target.innerHeight(),width:target.innerWidth()},startPosition=elem.offset(),transfer=$("<div class='ui-effects-transfer'></div>").appendTo(document.body).addClass(o.className).css({top:startPosition.top-fixTop,left:startPosition.left-fixLeft,height:elem.innerHeight(),width:elem.innerWidth(),position:targetFixed?"fixed":"absolute"}).animate(animation,o.duration,o.easing,function(){transfer.remove();done();});};});
});

require.register("web/static/js/scripts", function(exports, require, module) {
"use strict";

$(document).ready(function () {
	$('.datetimepicker').datepicker({
		dateFormat: "yy/mm/dd"
	});

	$("#site_agreed_amount").on("change", function (event) {
		var agreedAmount = $(this).val();
		var estimatedBudget = 50 / 100 * agreedAmount;

		$("#site_estimated_budget").val(estimatedBudget);
	});

	$(".closeSubMilestone").on("click", function (event) {
		var clickElem = $(this);
		var siteSubMilestoneId = clickElem.data('id');
		var confirmClose = confirm("Are you sure?");

		if (confirmClose) {
			$.ajax({
				url: "/close/" + siteSubMilestoneId,
				type: "GET",
				dataType: "JSON",
				success: function success(data) {
					var data = $.parseJSON(data);
					var progressDiv = $(".progress").find(".progress-bar");

					progressDiv.css("width", data.progress + "%");
					progressDiv.html("<span>" + data.progress + "% Complete</span>");
					clickElem.hide();
					clickElem.prev().hide();
				}
			});
		}
	});

	$("#labour_control_labour_id").on("change", function (event) {
		var labourId = $(this).val();
		var days = $("#labour_control_no_of_workers").val();
		days = days === "" ? 1 : days;

		calculateLabourCost(labourId, days);
	});

	$("#labour_control_no_of_workers").on("change", function (event) {
		var days = $(this).val() === "" ? 1 : $(this).val();
		var labourId = $("#labour_control_labour_id").val();

		calculateLabourCost(labourId, days);
	});

	$("#labour_control_specified_rate").on("change", function (event) {
		if ($(this).val() !== "") {
			var totalCost = $(this).val() * $("#labour_control_no_of_workers").val();
			$("#labour_control_total_cost").val(totalCost);
		}
	});

	$("#material_control_specified_rate").on("change", function (event) {
		if ($(this).val() !== "") {
			var totalCost = $(this).val() * $("#material_control_amount").val();
			$("#material_control_total_cost").val(totalCost);
		}
	});

	function calculateLabourCost(labourId, days) {
		$.ajax({
			url: "/labours/" + labourId,
			type: "GET",
			dataType: "JSON",
			success: function success(data) {
				var data = $.parseJSON(data);
				var totalCost = 0;

				totalCost = parseFloat(data.cost) * days;
				$("#labour_control_total_cost").val(totalCost);
			}
		});
	}

	$("#material_control_material_id").on("change", function (event) {
		var materialId = $(this).val();
		var amount = $("#material_control_amount").val();
		amount = amount === "" ? 1 : amount;

		calculateMaterialCost(materialId, amount);
	});

	$("#material_control_amount").on("change", function (event) {
		var amount = $(this).val() === "" ? 1 : $(this).val();
		var materialId = $("#material_control_material_id").val();

		calculateMaterialCost(materialId, amount);
	});

	function calculateMaterialCost(materialId, amount) {
		$.ajax({
			url: "/materials/" + materialId,
			type: "GET",
			dataType: "JSON",
			success: function success(data) {
				var data = $.parseJSON(data);
				var totalCost = 0;

				totalCost = parseFloat(data.cost) * amount;
				$("#material_control_total_cost").val(totalCost);
			}
		});
	}

	$(".editSubMilestone").on("click", function (event) {
		var subMilestone = $(this).data("milestone");
		var updateHtml = '<input name="_method" type="hidden" value="put">';
		var editForm = $('#editSubMilestone').find("form");
		var action = "/site_sub_milestones/" + subMilestone.id;

		// Replace form action
		editForm.attr("action", action);
		editForm.prepend(updateHtml);

		// Insert form values
		editForm.find("#site_sub_milestone_notes").val(subMilestone.notes);
		editForm.find("#site_sub_milestone_cost").val(subMilestone.cost);

		if (subMilestone.is_completed) {
			editForm.find("#site_sub_milestone_is_completed").prop("checked", true);
		} else {
			editForm.find("#site_sub_milestone_is_completed").prop("checked", false);
		}
		// Open modal
		$('#editSubMilestone').modal();
	});

	$("#site_internal_walls_measurement").on("change", function (event) {
		getTotalSquareMetres(this);
		event.preventDefault();
	});

	$("#site_ceilings_measurement").on("change", function (event) {
		getTotalSquareMetres(this);
		event.preventDefault();
	});

	$("#site_woodwork_measurement").on("change", function (event) {
		getTotalSquareMetres(this);
		event.preventDefault();
	});

	$("#site_metalwork_measurement").on("change", function (event) {
		getTotalSquareMetres(this);
		event.preventDefault();
	});

	$("#site_externalworks_measurement").on("change", function (event) {
		getTotalSquareMetres(this);
		event.preventDefault();
	});

	function getTotalSquareMetres(self) {
		var uniqueId = $(self).attr('id');
		var measurement = $(self).val();
		sumMeasurements(measurement, uniqueId);
	}

	function changeStyle() {
		console.log("something");
		console.log($(self));
	}

	function sumMeasurements(measurement, uniqueId) {
		var totalMeasurement = 0.0;
		var internalWalls = $("#site_internal_walls_measurement").val();
		internalWalls = internalWalls === "" ? 0.0 : internalWalls;

		var ceilings = $("#site_ceilings_measurement").val();
		ceilings = ceilings === "" ? 0.0 : ceilings;

		var woodWork = $("#site_woodwork_measurement").val();
		woodWork = woodWork === "" ? 0.0 : woodWork;

		var metalWork = $("#site_metalwork_measurement").val();
		metalWork = metalWork === "" ? 0.0 : metalWork;

		var externalWorks = $("#site_externalworks_measurement").val();
		externalWorks = externalWorks === "" ? 0.0 : externalWorks;

		switch (uniqueId) {
			case "site_internal_walls_measurement":
				internalWalls = measurement;
				totalMeasurement = parseInt(internalWalls) + parseInt(ceilings) + parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks);
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			case "site_ceilings_measurement":
				ceilings = measurement;
				totalMeasurement = parseInt(internalWalls) + parseInt(ceilings) + parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks);
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			case "site_woodwork_measurement":
				woodWork = measurement;
				totalMeasurement = parseInt(internalWalls) + parseInt(ceilings) + parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks);
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			case "site_metalwork_measurement":
				metalWork = measurement;
				totalMeasurement = parseInt(internalWalls) + parseInt(ceilings) + parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks);
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			case "site_externalworks_measurement":
				externalWorks = measurement;
				totalMeasurement = parseInt(internalWalls) + parseInt(ceilings) + parseInt(woodWork) + parseInt(metalWork) + parseInt(externalWorks);
				$("#site_total_square_meters").val(totalMeasurement);
				break;
			default:
				$("#site_total_square_meters").val(totalMeasurement);
		}
	}
});
});

require.register("web/static/js/sites", function(exports, require, module) {
"use strict";

$(document).ready(function () {
	$(".measurement-select").on("change", function (event) {
		var currentSelect = $(this);
		var currentSelectId = $(this).attr('id');
		var currentSelectVal = $(this).val();

		$(".measurement-select").each(function (index) {
			var selectId = $(this).attr('id');

			$("#" + selectId + " option").each(function (idex) {
				if (selectId != currentSelectId && $(this).val() == currentSelectVal) {
					$(this).remove();
				}
			});
		});
		event.preventDefault();
	});

	$(".price_per_metre").on("change", function (event) {
		var pricePerMetre = $(this).val() == "" ? 0.00 : parseFloat($(this).val());
		var totalSqMetres = $(this).parent().prev().find("input[type='number']").val();
		totalSqMetres = totalSqMetres == "" ? 0.00 : parseFloat(totalSqMetres);
		var totalPrice = pricePerMetre * totalSqMetres;
		var estimatedBudget = $("#site_estimated_budget").val() == "" ? 0.00 : parseFloat($("#site_estimated_budget").val());
		estimatedBudget += totalPrice;

		console.log("SQUARE METRES: " + totalSqMetres + ", PRICE PER METER: " + pricePerMetre + ", TOTAL PRICE: " + totalPrice);
		$("#site_estimated_budget").val(estimatedBudget);
	});

	$(".square_metres").on("change", function (event) {
		var totalSqMetres = $("#site_total_square_meters").val();
		totalSqMetres = totalSqMetres === "" ? 0.00 : parseFloat(totalSqMetres);
		totalSqMetres += $(this).val() === "" ? 0.00 : parseFloat($(this).val());

		$("#site_total_square_meters").val(totalSqMetres);
	});
});
});

require.register("web/static/js/socket", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _phoenix = require("phoenix");

var socket = new _phoenix.Socket("/socket", { params: { token: window.userToken } });

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
socket.connect();

// Now that you are connected, you can join channels with a topic:
var channel = socket.channel("topic:subtopic", {});
channel.join().receive("ok", function (resp) {
  console.log("Joined successfully", resp);
}).receive("error", function (resp) {
  console.log("Unable to join", resp);
});

exports.default = socket;
});

;require('web/static/js/app');
//# sourceMappingURL=app.js.map