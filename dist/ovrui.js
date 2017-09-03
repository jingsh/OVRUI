/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
(function (exports) {
'use strict';

var THREE = window && window.THREE || window.THREE;

if (!THREE) {
  throw new Error("Could not find Three.js! Make sure you've included the appropriate .js file");
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var X_UNIT = new THREE.Vector3(1, 0, 0);
var Y_UNIT$1 = new THREE.Vector3(0, 1, 0);
var Z_UNIT$1 = new THREE.Vector3(0, 0, 1);

var rotation$1 = new THREE.Quaternion();

var YAW_SPEED = 0.5;
var PITCH_SPEED = 0.25;

var MIN_FOV = 10;

var MobilePanControls = function () {
  function MobilePanControls(camera, target) {
    classCallCheck(this, MobilePanControls);

    this._camera = camera;
    this._target = target || window;

    this.enabled = true;
    this._tracking = false;

    this._swipeStart = new THREE.Vector2();
    this._swipeEnd = new THREE.Vector2();
    this._swipeDelta = new THREE.Vector2();

    this._yaw = 0;
    this._pitch = 0;

    this._pinchLengthStart = 0;
    this._pinchLengthEnd = 0;
    this._zoomNeedsUpdate = false;
    this._originalFov = this._camera.fov;

    this._downHandler = this._downHandler.bind(this);
    this._moveHandler = this._moveHandler.bind(this);
    this._upHandler = this._upHandler.bind(this);

    this.connect();
  }

  createClass(MobilePanControls, [{
    key: 'connect',
    value: function connect() {
      this._target.addEventListener('touchstart', this._downHandler);
      window.addEventListener('touchmove', this._moveHandler);
      window.addEventListener('touchend', this._upHandler);
      this.enabled = true;

      this._tracking = false;
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._target.removeEventListener('touchstart', this._downHandler);
      window.removeEventListener('touchmove', this._moveHandler);
      window.removeEventListener('touchend', this._upHandler);
      this.enabled = false;
    }
  }, {
    key: 'resetRotation',
    value: function resetRotation(x, y, z) {
      this._yaw = y;
      this._pitch = x;

      this._camera.fov = this._originalFov;
      this._camera.updateProjectionMatrix();
    }
  }, {
    key: '_downHandler',
    value: function _downHandler(e) {
      this._tracking = true;

      if (e.touches.length > 1) {
        var dx = e.touches[0].pageX - e.touches[1].pageX;
        var dy = e.touches[0].pageY - e.touches[1].pageY;
        this._pinchLengthStart = Math.sqrt(dx * dx + dy * dy);
        this._pinchLengthEnd = this.pinchLengthStart;
        return;
      }
      var touch = e.touches[0];
      this._swipeStart.set(touch.pageX, touch.pageY);
    }
  }, {
    key: '_upHandler',
    value: function _upHandler() {
      this._tracking = false;
    }
  }, {
    key: '_moveHandler',
    value: function _moveHandler(e) {
      if (!this._tracking) {
        return;
      }

      if (e.touches.length > 1) {
        var dx = e.touches[0].pageX - e.touches[1].pageX;
        var dy = e.touches[0].pageY - e.touches[1].pageY;
        this._pinchLengthEnd = Math.sqrt(dx * dx + dy * dy);
        this._zoomNeedsUpdate = true;
        return;
      }

      var touch = e.touches[0];
      this._swipeEnd.set(touch.pageX, touch.pageY);
      this._swipeDelta.subVectors(this._swipeEnd, this._swipeStart);
      this._swipeStart.copy(this._swipeEnd);

      var element = document.body;

      if (Math.abs(this._swipeDelta.y) > Math.abs(this._swipeDelta.x)) {
        var _rotation = 2 * Math.PI * this._swipeDelta.y / element.clientHeight * PITCH_SPEED;

        if (Math.abs(this._pitch + _rotation) <= THREE.Math.degToRad(90)) {
          this._pitch += _rotation;
        }
      } else {
        this._yaw += 2 * Math.PI * this._swipeDelta.x / element.clientWidth * YAW_SPEED;
      }
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this.enabled) {
        return;
      }

      var quaternion = this._camera.quaternion;
      rotation$1.setFromAxisAngle(X_UNIT, this._pitch);
      quaternion.multiply(rotation$1);
      rotation$1.setFromAxisAngle(Y_UNIT$1, this._yaw);
      quaternion.premultiply(rotation$1);

      if (this._zoomNeedsUpdate) {
        var zoomFactor = this._pinchLengthStart / this._pinchLengthEnd;
        this._pinchLengthStart = this._pinchLengthEnd;
        var newFov = this._camera.fov * zoomFactor;

        if (newFov > MIN_FOV && newFov < this._originalFov) {
          this._camera.fov = newFov;
          this._camera.updateProjectionMatrix();
        }
        this._zoomNeedsUpdate = false;
      }
    }
  }]);
  return MobilePanControls;
}();

var Y_UNIT = new THREE.Vector3(0, 1, 0);
var Z_UNIT = new THREE.Vector3(0, 0, 1);

var SCREEN_ROTATION = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

var rotation = new THREE.Quaternion();
var euler = new THREE.Euler();

function getScreenOrientation() {
  var orientation = screen.orientation || screen.mozOrientation || screen.msOrientation || {};
  var angle = orientation.angle || window.orientation || 0;
  return THREE.Math.degToRad(angle);
}

var DeviceOrientationControls = function () {
  function DeviceOrientationControls(camera, target) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, DeviceOrientationControls);

    this.camera = camera;
    this.enabled = true;
    this.mobilePanControls = new MobilePanControls(camera, target);

    if (options.disableTouchPanning) {
      this.mobilePanControls.enabled = false;
    }

    this.screenOrientation = getScreenOrientation();

    this.deviceOrientation = {};

    this.orientationChangeHandler = this.orientationChangeHandler.bind(this);
    this.deviceOrientationHandler = this.deviceOrientationHandler.bind(this);

    this._initialAlpha = null;

    this.connect();
  }

  createClass(DeviceOrientationControls, [{
    key: 'connect',
    value: function connect() {
      this.screenOrientation = getScreenOrientation();
      window.addEventListener('orientationchange', this.orientationChangeHandler);
      window.addEventListener('deviceorientation', this.deviceOrientationHandler);
      this.enabled = true;
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      window.removeEventListener('orientationchange', this.orientationChangeHandler);
      window.removeEventListener('deviceorientation', this.deviceOrientationHandler);
      this.enabled = false;
    }
  }, {
    key: 'orientationChangeHandler',
    value: function orientationChangeHandler() {
      this.screenOrientation = getScreenOrientation();
    }
  }, {
    key: 'deviceOrientationHandler',
    value: function deviceOrientationHandler(event) {
      var alpha = THREE.Math.degToRad(event.alpha);
      var beta = THREE.Math.degToRad(event.beta);
      var gamma = THREE.Math.degToRad(event.gamma);
      if (this._initialAlpha === null) {
        this._initialAlpha = alpha - getScreenOrientation();
      }
      this.deviceOrientation.alpha = alpha;
      this.deviceOrientation.beta = beta;
      this.deviceOrientation.gamma = gamma;
    }
  }, {
    key: 'resetRotation',
    value: function resetRotation(x, y, z) {
      var quaternion = this.camera.quaternion;
      euler.set(x, y, -z, 'YXZ');
      quaternion.setFromEuler(euler);

      this.deviceOrientation = {};
      this._initialAlpha = null;

      if (this.mobilePanControls.enabled) {
        this.mobilePanControls.resetRotation(0, 0, 0);
      }
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this.enabled) {
        return;
      }
      var alpha = this.deviceOrientation.alpha || 0;
      var beta = this.deviceOrientation.beta || 0;
      var gamma = this.deviceOrientation.gamma || 0;
      var orient = this.screenOrientation;

      var quaternion = this.camera.quaternion;
      euler.set(beta, alpha, -gamma, 'YXZ');
      quaternion.setFromEuler(euler);
      if (this._initialAlpha !== null) {
        rotation.setFromAxisAngle(Y_UNIT, -this._initialAlpha);
        quaternion.premultiply(rotation);
      }
      quaternion.multiply(SCREEN_ROTATION);
      rotation.setFromAxisAngle(Z_UNIT, -orient);
      quaternion.multiply(rotation);

      if (this.mobilePanControls.enabled) {
        this.mobilePanControls.update();
      }
    }
  }], [{
    key: 'isSupported',
    value: function isSupported() {
      return 'DeviceOrientationEvent' in window && /Mobi/i.test(navigator.userAgent) && !/OculusBrowser/i.test(navigator.userAgent);
    }
  }]);
  return DeviceOrientationControls;
}();

var HALF_PI = Math.PI / 2;
var RADIAN_CONVERT = Math.PI / 180;

var MousePanControls = function () {
  function MousePanControls(camera, target) {
    classCallCheck(this, MousePanControls);

    this.yaw = camera.rotation.y;
    this.pitch = camera.rotation.x;
    this.camera = camera;
    this.enabled = true;
    this.tracking = false;
    this.target = target || window;

    this.mouseDownHandler = this.mouseDownHandler.bind(this);
    this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
    this.mouseUpHandler = this.mouseUpHandler.bind(this);

    this.connect();
  }

  createClass(MousePanControls, [{
    key: 'connect',
    value: function connect() {
      this.target.addEventListener('mousedown', this.mouseDownHandler);
      window.addEventListener('mousemove', this.mouseMoveHandler);
      window.addEventListener('mouseup', this.mouseUpHandler);
      this.enabled = true;

      this.tracking = false;
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.target.removeEventListener('mousedown', this.mouseDownHandler);
      window.removeEventListener('mousemove', this.mouseMoveHandler);
      window.removeEventListener('mouseup', this.mouseUpHandler);
      this.enabled = false;
    }
  }, {
    key: 'mouseDownHandler',
    value: function mouseDownHandler(e) {
      this.tracking = true;
      this.lastX = e.screenX;
      this.lastY = e.screenY;
    }
  }, {
    key: 'mouseUpHandler',
    value: function mouseUpHandler() {
      this.tracking = false;
    }
  }, {
    key: 'mouseMoveHandler',
    value: function mouseMoveHandler(e) {
      if (!this.tracking) {
        return;
      }

      var width = window.innerWidth;
      var height = window.innerHeight;
      if (this.target !== window) {
        width = this.target.clientWidth;
        height = this.target.clientHeight;
      }
      var deltaX = typeof this.lastX === 'number' ? e.screenX - this.lastX : 0;
      var deltaY = typeof this.lastY === 'number' ? e.screenY - this.lastY : 0;
      this.lastX = e.screenX;
      this.lastY = e.screenY;
      this.yaw += deltaX / width * this.camera.fov * this.camera.aspect * RADIAN_CONVERT;
      this.pitch += deltaY / height * this.camera.fov * RADIAN_CONVERT;
      this.pitch = Math.max(-HALF_PI, Math.min(HALF_PI, this.pitch));
    }
  }, {
    key: 'resetRotation',
    value: function resetRotation(x, y, z) {
      this.yaw = y;
      this.pitch = x;
    }
  }, {
    key: 'update',
    value: function update() {
      if (!this.enabled) {
        return;
      }
      this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    }
  }]);
  return MousePanControls;
}();

var VRControls = function () {
  function VRControls(camera, vrDisplay) {
    classCallCheck(this, VRControls);

    this.camera = camera;
    this._vrDisplay = vrDisplay;
  }

  createClass(VRControls, [{
    key: 'update',
    value: function update() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var pose = options.frameData ? options.frameData.pose : null;
      if (pose) {
        if (pose.position) {
          this.camera.position.fromArray(pose.position);
        }
        if (pose.orientation) {
          this.camera.quaternion.fromArray(pose.orientation);
        }
      }
    }
  }, {
    key: 'vrDisplay',
    get: function get() {
      return this._vrDisplay;
    }
  }]);
  return VRControls;
}();

var AppControls = function () {
  function AppControls(camera, target) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, AppControls);

    this._camera = camera;
    this.nonVRControls = DeviceOrientationControls.isSupported() ? new DeviceOrientationControls(camera, target, options) : new MousePanControls(camera, target);
  }

  createClass(AppControls, [{
    key: 'setVRDisplay',
    value: function setVRDisplay(vrDisplay) {
      if (!vrDisplay) {
        throw new Error('When calling setVRDisplay a non-null value is expected.');
      }
      this.vrControls = new VRControls(this._camera, vrDisplay);
    }
  }, {
    key: 'setCamera',
    value: function setCamera(camera) {
      this._camera = camera;
      this.nonVRControls.camera = camera;
      this.nonVRControls.resetRotation(camera.rotation.x, camera.rotation.y, camera.rotation.z);
      if (this.vrControls) {
        this.vrControls.camera = camera;
      }
    }
  }, {
    key: 'resetRotation',
    value: function resetRotation(x, y, z) {
      this.nonVRControls.resetRotation(x, y, z);
    }
  }, {
    key: 'frame',
    value: function frame(frameOptions) {
      if (this.vrControls) {
        var display = this.vrControls.vrDisplay;
        if (display && display.isPresenting) {
          return this.vrControls.update(frameOptions);
        }
      }
      this.nonVRControls.update(frameOptions);
    }
  }]);
  return AppControls;
}();

var DEFAULT_LEFT_BOUNDS = [0.0, 0.0, 0.5, 1.0];
var DEFAULT_RIGHT_BOUNDS = [0.5, 0.0, 0.5, 1.0];

var leftCamera = new THREE.PerspectiveCamera();
leftCamera.layers.enable(1);
leftCamera.viewID = 0;
var rightCamera = new THREE.PerspectiveCamera();
rightCamera.layers.enable(2);
rightCamera.viewID = 1;
var leftTranslation = new THREE.Vector3();
var rightTranslation = new THREE.Vector3();

var VREffect = function () {
  function VREffect(renderer, vrDisplay) {
    classCallCheck(this, VREffect);

    this.renderer = renderer;
    this.vrDisplay = vrDisplay;
    this.leftBounds = DEFAULT_LEFT_BOUNDS;
    this.rightBounds = DEFAULT_RIGHT_BOUNDS;

    this.originalSize = renderer.getSize();
    this.originalPixelRatio = renderer.getPixelRatio();
  }

  createClass(VREffect, [{
    key: '_configureRendererForVRDisplay',
    value: function _configureRendererForVRDisplay() {
      var leftParams = this.vrDisplay.getEyeParameters('left');
      var rightParams = this.vrDisplay.getEyeParameters('right');

      this.renderer.setPixelRatio(1);
      this.renderer.setSize(leftParams.renderWidth + rightParams.renderWidth, Math.min(leftParams.renderHeight, rightParams.renderHeight), false);
    }
  }, {
    key: 'requestPresent',
    value: function requestPresent() {
      var _this = this;

      if (!this.vrDisplay) {
        return Promise.reject();
      }
      if (this.vrDisplay.isPresenting) {
        return Promise.resolve();
      }
      return this.vrDisplay.requestPresent([{
        source: this.renderer.domElement
      }]).then(function () {
        _this._configureRendererForVRDisplay();
      });
    }
  }, {
    key: 'exitPresent',
    value: function exitPresent() {
      var _this2 = this;

      if (!this.vrDisplay) {
        return Promise.resolve();
      }
      if (!this.vrDisplay.isPresenting) {
        return Promise.resolve();
      }

      return this.vrDisplay.exitPresent().then(function () {
        _this2.renderer.setPixelRatio(_this2.originalPixelRatio);
        _this2.renderer.setSize(_this2.originalSize.width, _this2.originalSize.height, false);
      });
    }
  }, {
    key: 'setSize',
    value: function setSize(width, height) {
      this.originalSize = { width: width, height: height };

      if (this.vrDisplay && this.vrDisplay.isPresenting) {
        this._configureRendererForVRDisplay();
      } else {
        this.renderer.setPixelRatio(this.originalPixelRatio);
        this.renderer.setSize(width, height, false);
      }
    }
  }, {
    key: 'render',
    value: function render(scene, camera, frameData) {
      if (this.vrDisplay && this.vrDisplay.isPresenting) {
        var preserveAutoUpdate = scene.autoUpdate;
        if (preserveAutoUpdate) {
          scene.updateMatrixWorld();
          scene.autoUpdate = false;
        }

        var leftParams = this.vrDisplay.getEyeParameters('left');
        leftTranslation.fromArray(leftParams.offset);
        var rightParams = this.vrDisplay.getEyeParameters('right');
        rightTranslation.fromArray(rightParams.offset);

        var size = this.renderer.getSize();
        var leftRect = {
          x: Math.round(size.width * this.leftBounds[0]),
          y: Math.round(size.height * this.leftBounds[1]),
          width: Math.round(size.width * this.leftBounds[2]),
          height: Math.round(size.height * this.leftBounds[3])
        };
        var rightRect = {
          x: Math.round(size.width * this.rightBounds[0]),
          y: Math.round(size.height * this.rightBounds[1]),
          width: Math.round(size.width * this.rightBounds[2]),
          height: Math.round(size.height * this.rightBounds[3])
        };

        this.renderer.setScissorTest(true);

        if (this.renderer.autoClear) {
          this.renderer.clear();
        }

        if (!camera.parent) {
          camera.updateMatrixWorld();
        }

        camera.matrixWorld.decompose(leftCamera.position, leftCamera.quaternion, leftCamera.scale);
        camera.matrixWorld.decompose(rightCamera.position, rightCamera.quaternion, rightCamera.scale);

        leftCamera.translateOnAxis(leftTranslation, 1);
        rightCamera.translateOnAxis(rightTranslation, 1);

        leftCamera.projectionMatrix.elements = frameData.leftProjectionMatrix;
        rightCamera.projectionMatrix.elements = frameData.rightProjectionMatrix;

        var backupScene = scene.background;

        var isStereoBackgroundReady = !!scene.backgroundLeft && !!scene.backgroundRight;

        if (isStereoBackgroundReady) {
          scene.background = scene.backgroundLeft;
        }

        this.renderer.setViewport(leftRect.x, leftRect.y, leftRect.width, leftRect.height);
        this.renderer.setScissor(leftRect.x, leftRect.y, leftRect.width, leftRect.height);
        this.renderer.render(scene, leftCamera);

        if (isStereoBackgroundReady) {
          scene.background = scene.backgroundRight;
        }

        this.renderer.setViewport(rightRect.x, rightRect.y, rightRect.width, rightRect.height);
        this.renderer.setScissor(rightRect.x, rightRect.y, rightRect.width, rightRect.height);
        this.renderer.render(scene, rightCamera);

        scene.background = backupScene;

        this.renderer.setViewport(0, 0, size.width, size.height);
        this.renderer.setScissorTest(false);

        if (preserveAutoUpdate) {
          scene.autoUpdate = true;
        }
        this.vrDisplay.submitFrame();
      }
    }
  }]);
  return VREffect;
}();

var DEFAULT_FONT_TEXTURE = 'data:image/png;base64,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';

var DEFAULT_FONT_JSON = {
	NaturalWidth: 8192,
	NaturalHeight: 3435,
	FontHeight: 307,
	MaxAscent: 314,
	MaxDescent: 130,
	Weights: [{
		AlphaCenterOffset: 0.0,
		ColorCenterOffset: 0.0
	}, {
		AlphaCenterOffset: -0.025,
		ColorCenterOffset: -0.025
	}, {
		AlphaCenterOffset: -0.0385,
		ColorCenterOffset: -0.0385
	}, {
		AlphaCenterOffset: -0.05,
		ColorCenterOffset: -0.05
	}],
	Glyphs: [[0, -1, -1, 0, 0, 0, 0, 0, 0], [1, -1, -1, 0, 0, 0, 0, 0, 0], [2, -1, -1, 0, 0, 0, 0, 0, 0], [3, -1, -1, 0, 0, 0, 0, 0, 0], [4, -1, -1, 0, 0, 0, 0, 0, 0], [5, -1, -1, 0, 0, 0, 0, 0, 0], [6, -1, -1, 0, 0, 0, 0, 0, 0], [7, -1, -1, 0, 0, 0, 0, 0, 0], [8, -1, -1, 0, 0, 0, 0, 0, 0], [9, -1, -1, 0, 0, 0, 0, 0, 0], [10, -1, -1, 0, 0, 0, 0, 0, 0], [11, -1, -1, 0, 0, 0, 0, 0, 0], [12, -1, -1, 0, 0, 0, 0, 0, 0], [13, 1365, 3220, 128, 128, 116, 253, -64, 64], [14, -1, -1, 0, 0, 0, 0, 0, 0], [15, -1, -1, 0, 0, 0, 0, 0, 0], [16, -1, -1, 0, 0, 0, 0, 0, 0], [17, -1, -1, 0, 0, 0, 0, 0, 0], [18, -1, -1, 0, 0, 0, 0, 0, 0], [19, -1, -1, 0, 0, 0, 0, 0, 0], [20, -1, -1, 0, 0, 0, 0, 0, 0], [21, -1, -1, 0, 0, 0, 0, 0, 0], [22, -1, -1, 0, 0, 0, 0, 0, 0], [23, -1, -1, 0, 0, 0, 0, 0, 0], [24, -1, -1, 0, 0, 0, 0, 0, 0], [25, -1, -1, 0, 0, 0, 0, 0, 0], [26, -1, -1, 0, 0, 0, 0, 0, 0], [27, -1, -1, 0, 0, 0, 0, 0, 0], [28, -1, -1, 0, 0, 0, 0, 0, 0], [29, -1, -1, 0, 0, 0, 0, 0, 0], [30, -1, -1, 0, 0, 0, 0, 0, 0], [31, -1, -1, 0, 0, 0, 0, 0, 0], [32, 1237, 3220, 128, 128, 119, 253, -64, 64], [33, 3410, 1438, 164, 317, 106, 253, -29, 250], [34, 6106, 2964, 203, 197, 121, 253, -41, 250], [35, 2278, 1756, 276, 314, 158, 253, -59, 250], [36, 6816, 752, 260, 327, 152, 253, -54, 257], [37, 4379, 752, 338, 333, 234, 253, -52, 259], [38, 3184, 1114, 300, 322, 192, 253, -54, 254], [39, 6656, 2964, 153, 197, 70, 253, -41, 250], [40, 1362, 0, 187, 380, 75, 253, -52, 274], [41, 1549, 0, 187, 380, 75, 253, -61, 274], [42, 4683, 2964, 238, 232, 127, 253, -56, 250], [43, 5471, 2693, 263, 263, 173, 253, -44, 215], [44, 6309, 2964, 174, 197, 72, 253, -54, 96], [45, 259, 3220, 204, 151, 98, 253, -53, 141], [46, 7774, 2964, 164, 164, 72, 253, -46, 97], [47, 4951, 752, 233, 333, 104, 253, -66, 256], [48, 3773, 1114, 275, 322, 173, 253, -51, 254], [49, 7387, 1756, 202, 314, 119, 253, -52, 250], [50, 7079, 1114, 253, 319, 151, 253, -52, 254], [51, 1418, 1114, 256, 323, 155, 253, -50, 254], [52, 3102, 1756, 272, 314, 158, 253, -56, 250], [53, 6824, 1114, 255, 319, 155, 253, -49, 250], [54, 6559, 1114, 265, 319, 161, 253, -51, 251], [55, 4936, 1756, 253, 314, 143, 253, -55, 250], [56, 4048, 1114, 264, 322, 162, 253, -51, 254], [57, 5300, 1114, 265, 320, 163, 253, -52, 254], [58, 810, 2964, 164, 256, 72, 253, -46, 189], [59, 6375, 2383, 174, 290, 72, 253, -54, 189], [60, 6549, 2383, 256, 280, 168, 253, -44, 219], [61, 5132, 2964, 263, 200, 175, 253, -44, 183], [62, 6805, 2383, 256, 280, 168, 253, -44, 219], [63, 4573, 1114, 249, 321, 148, 253, -51, 254], [64, 318, 1114, 319, 323, 215, 253, -52, 213], [65, 4945, 1438, 309, 315, 187, 253, -61, 250], [66, 1724, 1756, 277, 314, 181, 253, -42, 250], [67, 3484, 1114, 289, 322, 181, 253, -53, 254], [68, 0, 1756, 296, 314, 200, 253, -42, 250], [69, 4681, 1756, 255, 314, 163, 253, -42, 250], [70, 5189, 1756, 250, 314, 153, 253, -42, 250], [71, 2884, 1114, 300, 322, 200, 253, -53, 254], [72, 880, 1756, 285, 314, 201, 253, -42, 250], [73, 7589, 1756, 156, 314, 72, 253, -42, 250], [74, 1146, 1438, 233, 318, 132, 253, -60, 250], [75, 1165, 1756, 280, 314, 179, 253, -41, 250], [76, 5935, 1756, 246, 314, 141, 253, -42, 250], [77, 7199, 1438, 328, 314, 240, 253, -44, 250], [78, 296, 1756, 292, 314, 208, 253, -42, 250], [79, 1915, 1114, 325, 322, 219, 253, -53, 254], [80, 3374, 1756, 263, 314, 166, 253, -42, 250], [81, 0, 1438, 333, 318, 218, 253, -53, 254], [82, 5536, 1438, 271, 315, 172, 253, -42, 250], [83, 4312, 1114, 261, 322, 156, 253, -52, 254], [84, 1445, 1756, 279, 314, 159, 253, -60, 250], [85, 620, 1438, 284, 318, 200, 253, -42, 250], [86, 7527, 1438, 300, 314, 182, 253, -59, 250], [87, 6065, 1438, 384, 314, 265, 253, -59, 250], [88, 7827, 1438, 297, 314, 175, 253, -61, 250], [89, 588, 1756, 292, 314, 174, 253, -59, 250], [90, 2828, 1756, 274, 314, 167, 253, -53, 250], [91, 2445, 0, 178, 379, 83, 253, -39, 273], [92, 4717, 752, 234, 333, 103, 253, -65, 256], [93, 2623, 0, 178, 379, 83, 253, -56, 273], [94, 3559, 2964, 257, 244, 169, 253, -44, 256], [95, 853, 3220, 256, 143, 128, 253, -64, 44], [96, 7245, 2964, 183, 170, 65, 253, -67, 245], [97, 7654, 2693, 244, 257, 145, 253, -53, 190], [98, 898, 1114, 260, 323, 161, 253, -47, 255], [99, 7185, 2693, 239, 259, 132, 253, -53, 191], [100, 637, 1114, 261, 323, 161, 253, -53, 255], [101, 6937, 2693, 248, 259, 142, 253, -53, 191], [102, 1379, 1438, 213, 318, 87, 253, -60, 254], [103, 5565, 1114, 260, 320, 160, 253, -51, 191], [104, 6071, 1114, 244, 320, 150, 253, -47, 255], [105, 7986, 2070, 162, 311, 64, 253, -49, 247], [106, 3577, 0, 190, 376, 65, 253, -77, 247], [107, 6315, 1114, 244, 320, 135, 253, -47, 255], [108, 7761, 1114, 155, 319, 65, 253, -45, 255], [109, 0, 2964, 324, 256, 230, 253, -47, 191], [110, 324, 2964, 244, 256, 150, 253, -47, 191], [111, 6676, 2693, 261, 259, 155, 253, -53, 191], [112, 2486, 1438, 260, 317, 161, 253, -47, 191], [113, 2225, 1438, 261, 317, 161, 253, -53, 191], [114, 974, 2964, 204, 255, 98, 253, -47, 191], [115, 7424, 2693, 230, 258, 123, 253, -54, 191], [116, 6163, 2383, 212, 295, 95, 253, -59, 227], [117, 568, 2964, 242, 256, 147, 253, -47, 188], [118, 1994, 2964, 255, 251, 133, 253, -61, 187], [119, 1413, 2964, 325, 251, 203, 253, -61, 187], [120, 1738, 2964, 256, 251, 134, 253, -61, 187], [121, 774, 2070, 255, 313, 133, 253, -61, 187], [122, 1178, 2964, 235, 252, 119, 253, -57, 187], [123, 2245, 0, 200, 379, 92, 253, -54, 273], [124, 3314, 752, 146, 354, 68, 253, -39, 272], [125, 2045, 0, 200, 379, 92, 253, -54, 273], [126, 6995, 2964, 250, 172, 167, 253, -41, 165], [127, -1, -1, 0, 0, 0, 0, 0, 0], [128, -1, -1, 0, 0, 0, 0, 0, 0], [129, -1, -1, 0, 0, 0, 0, 0, 0], [130, -1, -1, 0, 0, 0, 0, 0, 0], [131, -1, -1, 0, 0, 0, 0, 0, 0], [132, -1, -1, 0, 0, 0, 0, 0, 0], [133, -1, -1, 0, 0, 0, 0, 0, 0], [134, -1, -1, 0, 0, 0, 0, 0, 0], [135, -1, -1, 0, 0, 0, 0, 0, 0], [136, -1, -1, 0, 0, 0, 0, 0, 0], [137, -1, -1, 0, 0, 0, 0, 0, 0], [138, -1, -1, 0, 0, 0, 0, 0, 0], [139, -1, -1, 0, 0, 0, 0, 0, 0], [140, -1, -1, 0, 0, 0, 0, 0, 0], [141, -1, -1, 0, 0, 0, 0, 0, 0], [142, -1, -1, 0, 0, 0, 0, 0, 0], [143, -1, -1, 0, 0, 0, 0, 0, 0], [144, -1, -1, 0, 0, 0, 0, 0, 0], [145, -1, -1, 0, 0, 0, 0, 0, 0], [146, -1, -1, 0, 0, 0, 0, 0, 0], [147, -1, -1, 0, 0, 0, 0, 0, 0], [148, -1, -1, 0, 0, 0, 0, 0, 0], [149, -1, -1, 0, 0, 0, 0, 0, 0], [150, -1, -1, 0, 0, 0, 0, 0, 0], [151, -1, -1, 0, 0, 0, 0, 0, 0], [152, -1, -1, 0, 0, 0, 0, 0, 0], [153, -1, -1, 0, 0, 0, 0, 0, 0], [154, -1, -1, 0, 0, 0, 0, 0, 0], [155, -1, -1, 0, 0, 0, 0, 0, 0], [156, -1, -1, 0, 0, 0, 0, 0, 0], [157, -1, -1, 0, 0, 0, 0, 0, 0], [158, -1, -1, 0, 0, 0, 0, 0, 0], [159, -1, -1, 0, 0, 0, 0, 0, 0], [160, 1109, 3220, 128, 128, 119, 253, -64, 64], [161, 3246, 1438, 164, 317, 106, 253, -29, 191], [162, 7148, 1756, 239, 314, 134, 253, -53, 250], [163, 2746, 1438, 256, 317, 147, 253, -57, 253], [164, 5734, 2693, 263, 262, 147, 253, -58, 224], [165, 5254, 1438, 282, 315, 154, 253, -64, 250], [166, 3168, 752, 146, 354, 68, 253, -39, 272], [167, 3460, 752, 237, 349, 153, 253, -42, 254], [168, 7938, 2964, 216, 160, 65, 253, -76, 240], [169, 2240, 1114, 322, 322, 210, 253, -54, 254], [170, 3137, 2964, 210, 249, 99, 253, -57, 254], [171, 4264, 2964, 239, 242, 146, 253, -49, 183], [172, 5395, 2964, 263, 199, 175, 253, -44, 170], [173, 463, 3220, 190, 149, 82, 257, -54, 143], [174, 2562, 1114, 322, 322, 210, 253, -54, 254], [175, 653, 3220, 200, 145, 65, 253, -68, 229], [176, 4921, 2964, 211, 211, 105, 253, -53, 254], [177, 675, 2693, 263, 268, 173, 253, -44, 215], [178, 4055, 2964, 209, 243, 99, 253, -55, 291], [179, 3347, 2964, 212, 245, 102, 253, -55, 291], [180, 7428, 2964, 182, 170, 65, 253, -49, 245], [181, 7574, 752, 236, 327, 152, 257, -42, 201], [182, 0, 2070, 260, 313, 162, 253, -44, 187], [183, 7610, 2964, 164, 164, 72, 253, -46, 161], [184, 6809, 2964, 186, 186, 65, 253, -58, 64], [185, 4503, 2964, 180, 240, 88, 253, -53, 288], [186, 2916, 2964, 221, 249, 107, 253, -57, 254], [187, 3816, 2964, 239, 243, 146, 253, -44, 183], [188, 5550, 752, 350, 331, 236, 253, -53, 258], [189, 5900, 752, 349, 331, 240, 253, -53, 258], [190, 5184, 752, 366, 331, 251, 253, -55, 258], [191, 4822, 1114, 248, 321, 148, 253, -50, 191], [192, 545, 385, 309, 366, 187, 253, -61, 301], [193, 854, 385, 309, 366, 187, 253, -61, 301], [194, 4354, 385, 309, 364, 187, 253, -61, 299], [195, 650, 752, 309, 361, 187, 253, -61, 296], [196, 7460, 385, 309, 362, 187, 253, -61, 297], [197, 1736, 0, 309, 379, 187, 253, -61, 314], [198, 6449, 1438, 376, 314, 266, 253, -61, 250], [199, 2801, 0, 289, 376, 181, 253, -53, 254], [200, 3150, 385, 255, 365, 163, 253, -42, 301], [201, 3405, 385, 255, 365, 163, 253, -42, 301], [202, 6950, 385, 255, 363, 163, 253, -42, 299], [203, 1560, 752, 255, 361, 163, 253, -42, 297], [204, 3845, 385, 184, 365, 72, 253, -70, 301], [205, 3660, 385, 185, 365, 72, 253, -42, 301], [206, 5526, 385, 212, 364, 72, 253, -70, 299], [207, 274, 752, 216, 362, 72, 253, -72, 297], [208, 4633, 1438, 312, 315, 200, 253, -58, 250], [209, 1268, 752, 292, 361, 208, 253, -42, 296], [210, 6333, 0, 325, 369, 219, 253, -53, 301], [211, 6008, 0, 325, 369, 219, 253, -53, 301], [212, 7510, 0, 325, 367, 219, 253, -53, 299], [213, 4029, 385, 325, 364, 219, 253, -53, 296], [214, 1692, 385, 325, 365, 219, 253, -53, 297], [215, 2403, 2964, 250, 250, 165, 253, -42, 209], [216, 6249, 752, 325, 331, 219, 253, -53, 259], [217, 6658, 0, 284, 369, 200, 253, -42, 301], [218, 6942, 0, 284, 369, 200, 253, -42, 301], [219, 0, 385, 284, 367, 200, 253, -42, 299], [220, 2601, 385, 284, 365, 200, 253, -42, 297], [221, 2017, 385, 292, 365, 174, 253, -59, 301], [222, 5807, 1438, 258, 315, 162, 253, -42, 250], [223, 1158, 1114, 260, 323, 158, 253, -46, 256], [224, 2258, 2070, 244, 312, 145, 253, -53, 245], [225, 2014, 2070, 244, 312, 145, 253, -53, 245], [226, 1852, 2383, 244, 309, 145, 253, -53, 242], [227, 4554, 2383, 244, 306, 145, 253, -53, 239], [228, 4075, 2383, 244, 307, 145, 253, -53, 240], [229, 3002, 1438, 244, 317, 145, 253, -53, 250], [230, 6345, 2693, 331, 259, 225, 253, -53, 191], [231, 1029, 2070, 239, 313, 132, 253, -53, 191], [232, 5687, 1756, 248, 314, 142, 253, -53, 246], [233, 5439, 1756, 248, 314, 142, 253, -53, 246], [234, 509, 2383, 248, 310, 142, 253, -53, 242], [235, 2587, 2383, 248, 308, 142, 253, -53, 240], [236, 1482, 2383, 185, 310, 64, 253, -76, 246], [237, 1667, 2383, 185, 310, 64, 253, -45, 246], [238, 5012, 2383, 212, 306, 64, 253, -74, 242], [239, 5459, 2383, 216, 305, 64, 253, -76, 240], [240, 7810, 752, 262, 325, 156, 253, -53, 257], [241, 5675, 2383, 244, 304, 150, 253, -47, 239], [242, 3898, 1756, 261, 314, 155, 253, -53, 246], [243, 3637, 1756, 261, 314, 155, 253, -53, 246], [244, 0, 2383, 261, 310, 155, 253, -53, 242], [245, 3321, 2383, 261, 307, 155, 253, -53, 239], [246, 2326, 2383, 261, 308, 155, 253, -53, 240], [247, 2653, 2964, 263, 249, 175, 253, -44, 208], [248, 938, 2693, 263, 267, 155, 253, -54, 195], [249, 6423, 1756, 242, 314, 147, 253, -47, 246], [250, 6665, 1756, 242, 314, 147, 253, -47, 246], [251, 1001, 2383, 242, 310, 147, 253, -47, 242], [252, 3079, 2383, 242, 308, 147, 253, -47, 240], [253, 4046, 0, 255, 371, 133, 253, -61, 245], [254, 823, 0, 260, 382, 161, 253, -47, 256], [255, 1437, 385, 255, 366, 133, 253, -61, 240], [257, 5919, 2383, 244, 296, 145, 253, -53, 229], [258, 959, 752, 309, 361, 187, 253, -61, 296], [259, 2835, 2383, 244, 308, 145, 253, -53, 241], [260, 4301, 0, 309, 370, 187, 253, -61, 250], [261, 757, 2383, 244, 310, 145, 253, -53, 190], [262, 4610, 0, 289, 370, 181, 253, -53, 302], [263, 6907, 1756, 241, 314, 132, 253, -53, 246], [268, 7835, 0, 289, 367, 181, 253, -53, 299], [269, 1243, 2383, 239, 310, 132, 253, -53, 242], [270, 6101, 385, 296, 363, 200, 253, -42, 299], [271, 0, 1114, 318, 324, 161, 253, -53, 256], [280, 4899, 0, 263, 370, 163, 253, -42, 250], [281, 3582, 2383, 249, 307, 142, 253, -53, 191], [282, 7205, 385, 255, 363, 163, 253, -42, 299], [283, 261, 2383, 248, 310, 142, 253, -53, 242], [286, 4663, 385, 300, 364, 200, 253, -53, 296], [287, 5423, 0, 260, 370, 160, 253, -51, 241], [304, 490, 752, 160, 362, 72, 253, -44, 297], [305, 2249, 2964, 154, 251, 64, 253, -45, 187], [306, 333, 1438, 287, 318, 204, 253, -42, 250], [307, 3351, 0, 226, 376, 129, 253, -49, 247], [321, 4159, 1756, 261, 314, 141, 253, -57, 250], [322, 7570, 1114, 191, 319, 66, 253, -63, 255], [323, 2309, 385, 292, 365, 208, 253, -42, 301], [324, 6348, 2070, 244, 311, 150, 253, -47, 246], [327, 4963, 385, 292, 364, 208, 253, -42, 299], [328, 3831, 2383, 244, 307, 150, 253, -47, 242], [336, 5683, 0, 325, 369, 219, 253, -53, 301], [337, 4420, 1756, 261, 314, 155, 253, -53, 246], [338, 6825, 1438, 374, 314, 277, 253, -48, 250], [339, 5997, 2693, 348, 259, 241, 253, -53, 191], [344, 5255, 385, 271, 364, 172, 253, -42, 299], [345, 4798, 2383, 214, 306, 98, 253, -57, 242], [346, 5162, 0, 261, 370, 156, 253, -52, 302], [347, 1498, 2070, 230, 313, 123, 253, -54, 246], [350, 3090, 0, 261, 376, 156, 253, -52, 254], [351, 1268, 2070, 230, 313, 123, 253, -54, 191], [352, 284, 385, 261, 367, 156, 253, -52, 299], [353, 2096, 2383, 230, 309, 123, 253, -54, 242], [354, 3767, 0, 279, 372, 159, 253, -60, 250], [355, 3697, 752, 212, 349, 95, 253, -59, 227], [356, 6397, 385, 279, 363, 159, 253, -60, 299], [357, 5825, 1114, 246, 320, 95, 253, -59, 252], [366, 539, 0, 284, 382, 200, 253, -42, 314], [367, 904, 1438, 242, 318, 147, 253, -47, 250], [368, 7226, 0, 284, 369, 200, 253, -42, 301], [369, 6181, 1756, 242, 314, 147, 253, -47, 246], [376, 7769, 385, 292, 362, 174, 253, -59, 297], [377, 1163, 385, 274, 366, 167, 253, -53, 302], [378, 7306, 2070, 235, 311, 119, 253, -57, 246], [379, 0, 752, 274, 362, 167, 253, -53, 297], [380, 5224, 2383, 235, 305, 119, 253, -57, 240], [381, 6676, 385, 274, 363, 167, 253, -53, 299], [382, 4319, 2383, 235, 307, 119, 253, -57, 242], [536, 278, 0, 261, 384, 156, 253, -52, 254], [537, 5070, 1114, 230, 321, 123, 253, -54, 191], [538, 1083, 0, 279, 380, 159, 253, -60, 250], [539, 2956, 752, 212, 357, 95, 253, -59, 227], [1025, 2734, 752, 222, 358, 135, 257, -39, 294], [1040, 1728, 2070, 286, 312, 156, 257, -65, 248], [1041, 7068, 2070, 238, 311, 148, 257, -39, 247], [1042, 6100, 2070, 248, 311, 159, 257, -39, 247], [1043, 7541, 2070, 223, 311, 126, 257, -39, 247], [1044, 2170, 752, 287, 359, 166, 257, -62, 247], [1045, 7764, 2070, 222, 311, 135, 257, -39, 247], [1046, 2502, 2070, 338, 311, 209, 257, -64, 247], [1047, 4388, 1438, 245, 316, 140, 257, -55, 249], [1048, 4313, 2070, 265, 311, 187, 257, -39, 247], [1049, 2885, 385, 265, 365, 187, 257, -39, 301], [1050, 5346, 2070, 252, 311, 148, 257, -39, 247], [1051, 2554, 1756, 274, 314, 171, 257, -64, 247], [1052, 3173, 2070, 301, 311, 223, 257, -39, 247], [1053, 4578, 2070, 258, 311, 180, 257, -39, 247], [1054, 1939, 1438, 286, 317, 190, 257, -48, 250], [1055, 4836, 2070, 255, 311, 177, 257, -39, 247], [1056, 6830, 2070, 238, 311, 148, 257, -39, 247], [1057, 3872, 1438, 259, 316, 154, 257, -48, 249], [1058, 5091, 2070, 255, 311, 133, 257, -61, 247], [1059, 2001, 1756, 277, 314, 150, 257, -62, 247], [1060, 3574, 1438, 298, 316, 196, 257, -51, 249], [1061, 4043, 2070, 270, 311, 140, 257, -65, 247], [1062, 2457, 752, 277, 359, 179, 257, -39, 247], [1063, 5849, 2070, 251, 311, 169, 257, -43, 247], [1064, 2840, 2070, 333, 311, 255, 257, -39, 247], [1065, 1815, 752, 355, 359, 255, 257, -39, 247], [1066, 3763, 2070, 280, 311, 168, 257, -61, 247], [1067, 3474, 2070, 289, 311, 211, 257, -39, 247], [1068, 6592, 2070, 238, 311, 148, 257, -39, 247], [1069, 4131, 1438, 257, 316, 152, 257, -57, 249], [1070, 1592, 1438, 347, 317, 260, 257, -39, 250], [1071, 5598, 2070, 251, 311, 151, 257, -61, 247], [1072, 7846, 2383, 232, 271, 136, 257, -52, 204], [1073, 7329, 752, 245, 327, 146, 257, -49, 260], [1074, 3858, 2693, 237, 265, 145, 257, -42, 201], [1075, 5268, 2693, 203, 265, 102, 257, -42, 201], [1076, 260, 2070, 258, 313, 140, 257, -59, 201], [1077, 7608, 2383, 238, 271, 137, 257, -50, 204], [1078, 1445, 2693, 312, 265, 184, 257, -64, 201], [1079, 0, 2693, 226, 271, 118, 257, -56, 204], [1080, 3379, 2693, 241, 265, 157, 257, -42, 201], [1081, 1674, 1114, 241, 323, 157, 257, -42, 259], [1082, 4805, 2693, 232, 265, 126, 257, -42, 201], [1083, 1201, 2693, 244, 267, 140, 257, -62, 201], [1084, 2623, 2693, 268, 265, 184, 257, -42, 201], [1085, 3138, 2693, 241, 265, 157, 257, -42, 201], [1086, 7360, 2383, 248, 271, 148, 257, -50, 204], [1087, 4569, 2693, 236, 265, 152, 257, -42, 201], [1088, 6574, 752, 242, 330, 150, 257, -42, 204], [1089, 451, 2693, 224, 271, 119, 257, -50, 204], [1090, 5037, 2693, 231, 265, 113, 257, -59, 201], [1091, 7076, 752, 253, 327, 125, 257, -64, 201], [1092, 0, 0, 278, 385, 178, 257, -50, 259], [1093, 2891, 2693, 247, 265, 128, 257, -60, 201], [1094, 518, 2070, 256, 313, 154, 257, -42, 201], [1095, 4095, 2693, 237, 265, 150, 257, -45, 201], [1096, 1757, 2693, 307, 265, 223, 257, -42, 201], [1097, 7745, 1756, 327, 313, 225, 257, -42, 201], [1098, 2064, 2693, 283, 265, 174, 257, -59, 201], [1099, 2347, 2693, 276, 265, 192, 257, -42, 201], [1100, 4332, 2693, 237, 265, 145, 257, -42, 201], [1101, 226, 2693, 225, 271, 118, 257, -57, 204], [1102, 7061, 2383, 299, 271, 207, 257, -42, 204], [1103, 3620, 2693, 238, 265, 136, 257, -60, 201], [1105, 7332, 1114, 238, 319, 137, 257, -50, 252], [7843, 4147, 752, 232, 341, 136, 257, -52, 274], [7867, 3909, 752, 238, 341, 137, 257, -50, 274], [8211, 0, 3220, 259, 151, 153, 253, -53, 141], [8217, 6483, 2964, 173, 197, 73, 253, -53, 250], [8220, 5882, 2964, 224, 197, 124, 253, -47, 251], [8222, 5658, 2964, 224, 197, 122, 253, -54, 96], [65533, 5738, 385, 363, 363, 256, 257, -54, 259]]
};

var BASELINE = 'baseline';
var BOTTOM = 'bottom';
var CENTER = 'center';
var CENTER_FIXEDHEIGHT = 'center_fixedheight';
var CENTER_LINE = 'center_line';
var LEFT = 'left';
var RIGHT = 'right';
var RIGHT_LINE = 'right_line';
var TOP = 'top';
var SDFFONT_MARKER_COLOR = 0;

function isBreakable(code) {
  return code === 32 || code === 13 || code === 10;
}
function isNewLine(code) {
  return code === 13 || code === 10;
}
function isWhiteSpace(code) {
  return code === 32 || code === 9;
}

var vertexShader = '\nvarying vec2 vUv;\nattribute vec4 fontParms;\nattribute vec4 textColors;\nvarying vec4 vFontParms;\nvarying vec4 vTextColor;\nvarying vec4 vMVPosition;\nvoid main( ) {\n  vUv = uv;\n  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n  vFontParms = fontParms;\n  vTextColor = textColors;\n  vMVPosition = mvPosition;\n  gl_Position = projectionMatrix * mvPosition;\n}\n';

var fragmentShader = '\nuniform sampler2D texture;\nuniform vec4 textColor;\nuniform vec4 clipRegion;\nvarying vec4 vTextColor;\nvarying vec4 vFontParms;\nvarying vec4 vMVPosition;\nvarying vec2 vUv;\nvoid main( void ) {\n  float distance = texture2D( texture, vUv ).r;\n  float ds = vFontParms.z * 255.0;\n  float dd = fwidth( vUv.x ) * vFontParms.w * 16.0 * ds;\n  float ALPHA_MIN = vFontParms.x - dd;\n  float ALPHA_MAX = vFontParms.x + dd;\n  float COLOR_MIN = vFontParms.y - dd;\n  float COLOR_MAX = vFontParms.y + dd;\n  float value = ( clamp( distance, COLOR_MIN, COLOR_MAX ) - COLOR_MIN ) / max(0.00001, COLOR_MAX - COLOR_MIN );\n  float alpha = ( clamp( distance, ALPHA_MIN, ALPHA_MAX ) - ALPHA_MIN ) / max(0.00001,  ALPHA_MAX - ALPHA_MIN );\n  if (vMVPosition.x < clipRegion.x) {\n    discard;\n  }\n  if (vMVPosition.y < clipRegion.y) {\n    discard;\n  }\n  if (vMVPosition.x > clipRegion.z) {\n    discard;\n  }\n  if (vMVPosition.y > clipRegion.w) {\n    discard;\n  }\n  float premultAlphaValue = value * vTextColor.w * textColor.w;\n  gl_FragColor = vec4(\n    premultAlphaValue,\n    premultAlphaValue,\n    premultAlphaValue,\n    alpha) *\n    vTextColor *\n    textColor;\n}\n';

function LineBreaker(text, fontObject, fontHeight) {
  var fallback = fontObject.data.CharMap[42];
  return {
    text: text,
    fontObject: fontObject,
    cursor: 0,
    nextBreak: function nextBreak(maxWidth) {
      var width = 0;
      if (this.cursor >= this.text.length) {
        return null;
      }
      var code = this.text.charCodeAt(this.cursor++);
      if (code === SDFFONT_MARKER_COLOR) {
        this.cursor += 4;
        if (this.cursor >= this.text.length) {
          return null;
        }
        code = this.text.charCodeAt(this.cursor++);
      }

      var curFontObject = this.fontObject;
      var g = this.fontObject.data.CharMap[code];
      if (!g) {
        for (var index = 0; index < this.fontObject.fallbacks.length; index++) {
          var fallbackFontObject = this.fontObject.fallbacks[index];
          g = fallbackFontObject.data.CharMap[code];
          if (g) {
            curFontObject = fallbackFontObject;
            break;
          }
        }
      }
      g = g || fallback;
      curFontObject = curFontObject || this.fontObject;
      var font = curFontObject.data;
      var xScale = fontHeight / font.FontHeight;

      width += g.AdvanceX * xScale;
      if (isBreakable(code)) {
        return {
          position: this.cursor,
          required: isNewLine(code),
          whitespace: isWhiteSpace(code),
          split: false,
          width: width
        };
      }
      code = this.text.charCodeAt(this.cursor);
      if (code === SDFFONT_MARKER_COLOR) {
        this.cursor += 5;
        code = this.text.charCodeAt(this.cursor);
      }
      while (this.cursor < this.text.length && !isBreakable(code)) {
        var _g = font.CharMap[code] || fallback;
        var w = _g.AdvanceX * xScale;
        if (width + w > maxWidth) {
          return {
            position: this.cursor,
            required: false,
            whitespace: false,
            split: true,
            width: width
          };
        }
        width += w;
        this.cursor++;
        code = this.text.charCodeAt(this.cursor);
        if (code === SDFFONT_MARKER_COLOR) {
          this.cursor += 5;
          code = this.text.charCodeAt(this.cursor);
        }
      }
      return {
        position: this.cursor,
        required: false,
        whitespace: false,
        split: false,
        width: width
      };
    }
  };
}

function splitLines(fontObject, text, fontHeight, maxWidth, maxHeight, maxLines, hasPerPixelClip) {
  var lineStart = 0;
  var lastOption = 0;
  var breaker = new LineBreaker(text, fontObject, fontHeight);
  var bk = void 0;
  var lines = [];
  var lineWidth = 0;
  while (bk = breaker.nextBreak(maxWidth)) {
    if (bk.whitespace && lineWidth === 0) {
      lineStart = bk.position;
    }

    if (bk.required || lineWidth !== 0 && lineWidth + bk.width > maxWidth) {
      if (lineStart !== lastOption) {
        lines[lines.length] = text.slice(lineStart, lastOption).trim();
      }
      lineWidth = 0;
      lineStart = lastOption;

      if (bk.whitespace) {
        lineStart = bk.position;
        continue;
      }
    }
    lineWidth += bk.width;
    lastOption = bk.position;
  }

  if (lineStart < text.length) {
    lines[lines.length] = text.slice(lineStart).trim();
  }

  if (maxLines > 0) {
    lines.splice(maxLines);
  }

  if (maxHeight) {
    if (hasPerPixelClip) {
      lines.splice(Math.ceil(maxHeight / fontHeight));
    } else {
      lines.splice(Math.floor(maxHeight / fontHeight));
    }
  }
  return lines;
}

function wrapLines(fontObject, text, fontHeight, maxWidth, maxHeight, maxLines, hasPerPixelClip) {
  return splitLines(fontObject, text, fontHeight, maxWidth, maxHeight, maxLines, hasPerPixelClip).join('\n');
}

function measureText(fontObject, text, fontHeight) {
  var dim = {
    maxWidth: 0,
    maxHeight: 0,
    maxDescent: 0,
    numLines: 1,
    lineWidths: []
  };

  var width = 0;
  var fallback = fontObject.data.CharMap[42];
  for (var i = 0; i < text.length; i++) {
    var charCode = text.charCodeAt(i);
    if (charCode === SDFFONT_MARKER_COLOR) {
      i += 4;
      continue;
    }

    if (isNewLine(charCode)) {
      if (width > dim.maxWidth) {
        dim.maxWidth = width;
      }
      if (i !== text.length - 1) {
        dim.maxHeight += fontHeight;
        dim.maxDescent = 0;
      }

      dim.lineWidths[dim.lineWidths.length] = width;
      width = 0;
      dim.numLines++;
      continue;
    }

    var curFontObject = fontObject;
    var g = fontObject.data.CharMap[charCode];
    if (!g) {
      for (var index = 0; index < fontObject.fallbacks.length; index++) {
        var fallbackFontObject = fontObject.fallbacks[index];
        g = fallbackFontObject.data.CharMap[charCode];
        if (g) {
          curFontObject = fallbackFontObject;
          break;
        }
      }
    }
    g = g || fallback;
    curFontObject = curFontObject || fontObject;
    var font = curFontObject.data;
    var xScale = fontHeight / font.FontHeight;
    var yScale = fontHeight / font.FontHeight;

    var descent = (g.Height - g.BearingY) * yScale;
    if (descent > dim.maxDescent) {
      dim.maxDescent = descent;
    }
    width += g.AdvanceX * xScale;
  }
  if (width > dim.maxWidth) {
    dim.maxWidth = width;
  }
  if (width > 0) {
    dim.maxHeight += fontHeight;
    dim.lineWidths[dim.lineWidths.length] = width;
  }
  if (dim.maxDescent > 0) {
    dim.maxHeight += dim.maxDescent;
  }

  return dim;
}

function BitmapFontGeometry(fontObject, text, fontHeight) {
  var config = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  var frame = config.frame || [0, 0, 0, 0];
  var deltaZ = config.deltaZ || 0;
  var hAlign = config.hAlign || LEFT;
  var vAlign = config.vAlign || BASELINE;
  var fontParms = config.fontParms || {
    AlphaCenter: 0.47,
    ColorCenter: 0.49
  };

  var dim = config.dim || measureText(fontObject, text, fontHeight);

  var fontParamsAlphaCenter = Math.min(255, fontParms.AlphaCenter * 255 || 108);
  var fontParamsColorCenter = Math.min(255, fontParms.ColorCenter * 255 || 128);

  THREE.BufferGeometry.apply(this);

  if (!fontObject.data) {
    return;
  }

  var curPos = [0, 0];

  var numGlyphs = text.length;

  var positionsBuffer = new Float32Array(numGlyphs * 4 * 3);
  var texCoordBuffer = new Float32Array(numGlyphs * 4 * 2);
  var fontParmsBuffer = new Uint8Array(numGlyphs * 4 * 4);
  var textColorBuffer = new Uint8Array(numGlyphs * 4 * 4);
  var indicesBuffer = new Uint32Array(numGlyphs * 6);

  if (hAlign === LEFT) {
    curPos[0] = frame[0];
  } else if (hAlign === CENTER) {
    curPos[0] = frame[0] + frame[2] / 2 - dim.maxWidth / 2;
  } else if (hAlign === RIGHT) {
    curPos[0] = frame[0] + frame[2] - dim.maxWidth;
  }

  var baseFont = fontObject.data;

  var yBaseScale = fontHeight / fontObject.data.FontHeight;
  if (vAlign === BASELINE) {
    curPos[1] = frame[1] + dim.maxHeight - fontHeight;
  } else if (vAlign === CENTER) {
    var ma = baseFont.MaxAscent;
    var md = baseFont.MaxDescent;
    var fh = baseFont.FontHeight;

    var maxFontExtent = ma + md + fh * (dim.numLines - 1);
    curPos[1] = (maxFontExtent / 2 - fh) * yBaseScale;
  } else if (vAlign === CENTER_FIXEDHEIGHT) {
    var _ma = baseFont.MaxAscent;
    var _md = baseFont.MaxDescent;
    var _fh = baseFont.FontHeight;
    var maxFontHeight = _ma + _md;
    var maxTextHeight = (_fh * (dim.numLines - 1) + maxFontHeight) * yBaseScale;
    curPos[1] = (maxTextHeight - fontHeight) * 0.5 - _md * yBaseScale;
  } else if (vAlign === TOP) {
    curPos[1] = frame[1] + frame[3] - fontHeight;
  } else if (vAlign === BOTTOM) {
    curPos[1] = frame[1] + dim.maxHeight - fontHeight;
  }

  var startX = curPos[0];
  if (hAlign === CENTER_LINE) {
    curPos[0] = frame[0] + frame[2] / 2 - dim.lineWidths[0] / 2;
  } else if (hAlign === RIGHT_LINE) {
    curPos[0] = frame[0] + frame[2] - dim.lineWidths[0];
  }
  var offsetZ = 0.0;
  var lineIndex = 0;
  var index = 0;
  var textColor = [0xff, 0xff, 0xff, 0xff];
  var fallback = baseFont.CharMap[42];
  var lastGroupIndex = 0;
  var lastFontObject = fontObject;

  var materials = [];
  for (var i = 0; i < text.length; i++) {
    var charCode = text.charCodeAt(i);
    if (charCode === SDFFONT_MARKER_COLOR) {
      textColor[0] = text.charCodeAt(i + 1);
      textColor[1] = text.charCodeAt(i + 2);
      textColor[2] = text.charCodeAt(i + 3);
      textColor[3] = text.charCodeAt(i + 4);
      i += 4;
      continue;
    }
    if (isNewLine(charCode)) {
      curPos[0] = startX;
      curPos[1] -= fontHeight;
      lineIndex++;

      if (hAlign === CENTER_LINE) {
        curPos[0] = frame[0] + frame[2] / 2 - dim.lineWidths[lineIndex] / 2;
      } else if (hAlign === RIGHT_LINE) {
        curPos[0] = frame[0] + frame[2] - dim.lineWidths[lineIndex];
      }

      continue;
    }
    var curFontObject = fontObject;
    var g = fontObject.data.CharMap[charCode];
    if (!g) {
      for (var _index = 0; _index < fontObject.fallbacks.length; _index++) {
        var fallbackFontObject = fontObject.fallbacks[_index];
        g = fallbackFontObject.data.CharMap[charCode];
        if (g) {
          curFontObject = fallbackFontObject;
          break;
        }
      }
    }
    g = g || fallback;
    curFontObject = curFontObject || fontObject;
    var font = curFontObject.data;
    var xScale = fontHeight / font.FontHeight;
    var yScale = fontHeight / font.FontHeight;

    if (curFontObject !== lastFontObject) {
      if (lastGroupIndex !== index) {
        this.addGroup(lastGroupIndex * 6, (index - lastGroupIndex) * 6, materials.length);
        materials.push(lastFontObject.material);
      }
      lastGroupIndex = index;
      lastFontObject = curFontObject;
    }

    var s0 = g.X / font.NaturalWidth;
    var t0 = g.Y / font.NaturalHeight;
    var s1 = (g.X + g.Width) / font.NaturalWidth;
    var t1 = (g.Y + g.Height) / font.NaturalHeight;

    var bearingX = g.BearingX * xScale;
    var bearingY = g.BearingY * yScale;

    var rw = (g.Width + g.BearingX) * xScale;
    var rh = (g.Height - g.BearingY) * yScale;
    var r = [1, 0, 0];
    var u = [0, 1, 0];

    positionsBuffer[index * 12 + 0] = curPos[0] + r[0] * bearingX - u[0] * rh;
    positionsBuffer[index * 12 + 1] = curPos[1] + r[1] * bearingX - u[1] * rh;
    positionsBuffer[index * 12 + 2] = offsetZ + r[2] * bearingX - u[2] * rh;
    texCoordBuffer[index * 8 + 0] = s0;
    texCoordBuffer[index * 8 + 1] = t1;
    fontParmsBuffer[index * 16 + 0] = fontParamsAlphaCenter;
    fontParmsBuffer[index * 16 + 1] = fontParamsColorCenter;
    fontParmsBuffer[index * 16 + 2] = 0x02;
    fontParmsBuffer[index * 16 + 3] = 0xff;
    textColorBuffer[index * 16 + 0] = textColor[0];
    textColorBuffer[index * 16 + 1] = textColor[1];
    textColorBuffer[index * 16 + 2] = textColor[2];
    textColorBuffer[index * 16 + 3] = textColor[3];

    positionsBuffer[index * 12 + 3] = curPos[0] + r[0] * bearingX + u[0] * bearingY;
    positionsBuffer[index * 12 + 4] = curPos[1] + r[1] * bearingX + u[1] * bearingY;
    positionsBuffer[index * 12 + 5] = offsetZ + r[2] * bearingX + u[2] * bearingY;
    texCoordBuffer[index * 8 + 2] = s0;
    texCoordBuffer[index * 8 + 3] = t0;
    fontParmsBuffer[index * 16 + 4] = fontParamsAlphaCenter;
    fontParmsBuffer[index * 16 + 5] = fontParamsColorCenter;
    fontParmsBuffer[index * 16 + 6] = 0x02;
    fontParmsBuffer[index * 16 + 7] = 0xff;
    textColorBuffer[index * 16 + 4] = textColor[0];
    textColorBuffer[index * 16 + 5] = textColor[1];
    textColorBuffer[index * 16 + 6] = textColor[2];
    textColorBuffer[index * 16 + 7] = textColor[3];

    positionsBuffer[index * 12 + 6] = curPos[0] + r[0] * rw + u[0] * bearingY;
    positionsBuffer[index * 12 + 7] = curPos[1] + r[1] * rw + u[1] * bearingY;
    positionsBuffer[index * 12 + 8] = offsetZ + r[2] * rw + u[2] * bearingY;
    texCoordBuffer[index * 8 + 4] = s1;
    texCoordBuffer[index * 8 + 5] = t0;
    fontParmsBuffer[index * 16 + 8] = fontParamsAlphaCenter;
    fontParmsBuffer[index * 16 + 9] = fontParamsColorCenter;
    fontParmsBuffer[index * 16 + 10] = 0x02;
    fontParmsBuffer[index * 16 + 11] = 0xff;
    textColorBuffer[index * 16 + 8] = textColor[0];
    textColorBuffer[index * 16 + 9] = textColor[1];
    textColorBuffer[index * 16 + 10] = textColor[2];
    textColorBuffer[index * 16 + 11] = textColor[3];

    positionsBuffer[index * 12 + 9] = curPos[0] + r[0] * rw - u[0] * rh;
    positionsBuffer[index * 12 + 10] = curPos[1] + r[1] * rw - u[1] * rh;
    positionsBuffer[index * 12 + 11] = offsetZ + r[2] * rw - u[2] * rh;
    texCoordBuffer[index * 8 + 6] = s1;
    texCoordBuffer[index * 8 + 7] = t1;
    fontParmsBuffer[index * 16 + 12] = fontParamsAlphaCenter;
    fontParmsBuffer[index * 16 + 13] = fontParamsColorCenter;
    fontParmsBuffer[index * 16 + 14] = 0x02;
    fontParmsBuffer[index * 16 + 15] = 0xff;
    textColorBuffer[index * 16 + 12] = textColor[0];
    textColorBuffer[index * 16 + 13] = textColor[1];
    textColorBuffer[index * 16 + 14] = textColor[2];
    textColorBuffer[index * 16 + 15] = textColor[3];

    indicesBuffer[index * 6 + 0] = index * 4 + 0;
    indicesBuffer[index * 6 + 1] = index * 4 + 1;
    indicesBuffer[index * 6 + 2] = index * 4 + 2;
    indicesBuffer[index * 6 + 3] = index * 4 + 0;
    indicesBuffer[index * 6 + 4] = index * 4 + 2;
    indicesBuffer[index * 6 + 5] = index * 4 + 3;

    index++;
    curPos[0] += g.AdvanceX * xScale;
    offsetZ += deltaZ;
  }

  this.type = 'SDFText';
  this.isSDFText = true;
  this.onBeforeRender = function (object, material) {
    if (object.parent.textColor) {
      material.uniforms.textColor.value.set(object.parent.textColor.r, object.parent.textColor.g, object.parent.textColor.b, object.opacity);
    }
    var textClip = object.textClip;
    if (textClip && object.parent.clippingEnabled) {
      material.uniforms.clipRegion.value.set(textClip[0], textClip[1], textClip[2], textClip[3]);
    } else {
      material.uniforms.clipRegion.value.set(-16384, -16384, 16384, 16384);
    }
  };
  this.textClip = [-16384, -16384, 16384, 16384];
  this.addAttribute('position', new THREE.BufferAttribute(positionsBuffer, 3));
  this.addAttribute('uv', new THREE.BufferAttribute(texCoordBuffer, 2));
  this.addAttribute('fontParms', new THREE.BufferAttribute(fontParmsBuffer, 4, true));
  this.addAttribute('textColors', new THREE.BufferAttribute(textColorBuffer, 4, true));
  this.setIndex(new THREE.BufferAttribute(indicesBuffer, 1));
  if (lastGroupIndex !== index) {
    this.addGroup(lastGroupIndex * 6, (index - lastGroupIndex) * 6, materials.length);
    materials.push(lastFontObject.material);
  }
  this.computeBoundingSphere();
  this.materials = materials;
}

BitmapFontGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
BitmapFontGeometry.prototype.constructor = BitmapFontGeometry;

function loadFont(fontName, fontTexture, loader) {
  if (!fontName) {
    fontTexture = DEFAULT_FONT_TEXTURE;
  }
  var tex = new THREE.TextureLoader().load(fontTexture, function (texture) {
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.flipY = false;
  });

  var uniforms = {
    texture: {
      value: tex
    },
    textColor: {
      type: 'v4',
      value: new THREE.Vector4()
    },
    clipRegion: {
      type: 'v4',
      value: new THREE.Vector4(-16384, -16384, 16384, 16384)
    }
  };

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    extensions: { derivatives: true }
  });

  material.premultipliedAlpha = true;
  material.depthWrite = false;
  material.transparent = true;

  function initFontData(data) {
    data.CharMap = [];
    data.MaxAscent = 0;
    data.MaxDescent = 0;
    for (var g in data.Glyphs) {
      var glyph = data.Glyphs[g];
      data.CharMap[glyph.CharCode] = glyph;
      var ascent = glyph.BearingY;
      var descent = glyph.Height - glyph.BearingY;
      if (ascent > data.MaxAscent) {
        data.MaxAscent = ascent;
      }
      if (descent > data.MaxDescent) {
        data.MaxDescent = descent;
      }
    }
  }

  function getDefaultFont() {
    var font = {
      CharMap: {},
      NaturalWidth: DEFAULT_FONT_JSON.NaturalWidth,
      NaturalHeight: DEFAULT_FONT_JSON.NaturalHeight,
      FontHeight: DEFAULT_FONT_JSON.FontHeight,
      MaxAscent: DEFAULT_FONT_JSON.MaxAscent,
      MaxDescent: DEFAULT_FONT_JSON.MaxDescent
    };
    var glyphs = DEFAULT_FONT_JSON.Glyphs;
    for (var i = glyphs.length; i--;) {
      var glyph = glyphs[i];
      var glyphData = {
        X: glyph[1],
        Y: glyph[2],
        Width: glyph[3],
        Height: glyph[4],
        AdvanceX: glyph[5],
        AdvanceY: glyph[6],
        BearingX: glyph[7],
        BearingY: glyph[8]
      };
      font.CharMap[glyph[0]] = glyphData;
    }
    return font;
  }

  var font = {
    data: null,
    material: material,
    fallbacks: []
  };

  if (!fontName) {
    font.data = getDefaultFont();
    return font;
  }

  var fileLoader = loader || new THREE.FileLoader();
  return new Promise(function (resolve, reject) {
    fileLoader.load(fontName, function (response) {
      var data = JSON.parse(response);
      initFontData(data);
      font.data = data;
      resolve(font);
    });
  });
}

function addFontFallback(fontObject, fallbackFontObject) {
  fontObject.fallbacks.push(fallbackFontObject);
}

var StereoTextureUniforms = function StereoTextureUniforms() {
  classCallCheck(this, StereoTextureUniforms);

  this.stereoOffsetRepeat = {
    type: 'f',
    value: new THREE.Vector4(0, 0, 1, 1)
  };
};

var StereoShaderLib = {
  stereo_basic_vert: "\n      uniform vec4 stereoOffsetRepeat;\n      varying highp vec3 vPosition;\n      #ifndef USE_ENVMAP\n      varying highp vec2 vUv;\n      #endif\n      void main()\n      {\n          vPosition = position;\n          #ifndef USE_ENVMAP\n          vUv = uv * stereoOffsetRepeat.zw + stereoOffsetRepeat.xy;\n          #endif\n          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n      }\n  ",

  stereo_basic_frag: "\n      #define RECIPROCAL_PI2 0.15915494\n      #define RECIPROCAL_PI 0.31830988\n      uniform vec4 stereoOffsetRepeat;\n      uniform vec3 color;\n      uniform float opacity;\n      uniform float useUV;\n      #ifdef ENVMAP_TYPE_CUBE\n      uniform samplerCube envMap;\n      #else\n      uniform sampler2D map;\n      varying highp vec2 vUv;\n      #endif\n      varying highp vec3 vPosition;\n      void main()\n      {\n        vec4 diffuseColor = vec4( 1.0, 1.0, 1.0, opacity );\n\n        #ifdef ENVMAP_TYPE_CUBE\n        vec4 texColor = textureCube( envMap, vec3( vPosition.z, vPosition.yx ) );\n        #else\n        vec2 sampleUV;\n        if (useUV > 0.0) {\n          sampleUV = vUv;\n        } else {\n          vec3 nrm = normalize(vPosition);\n          sampleUV.y = asin(nrm.y) * RECIPROCAL_PI + 0.5;\n          sampleUV.x = -atan( nrm.z, nrm.x ) * RECIPROCAL_PI2 + 0.5;\n          sampleUV = sampleUV * stereoOffsetRepeat.zw + stereoOffsetRepeat.xy;\n        }\n        vec4 texColor = texture2D( map, sampleUV );\n        #endif\n        diffuseColor *= texColor;\n        diffuseColor.rgb *= color;\n\n        gl_FragColor = diffuseColor;\n      }\n  "
};

var DEFAULT_UNIFORM_COLOR = new THREE.Color();
var DEFAULT_OFFSET_REPEATS = [new THREE.Vector4(0, 0, 1, 1)];

var StereoBasicTextureMaterial = function (_THREE$ShaderMaterial) {
  inherits(StereoBasicTextureMaterial, _THREE$ShaderMaterial);

  function StereoBasicTextureMaterial(parameters) {
    classCallCheck(this, StereoBasicTextureMaterial);

    var uniforms = THREE.UniformsUtils.merge([new StereoTextureUniforms(), {
      color: { value: DEFAULT_UNIFORM_COLOR, type: 'f' },
      opacity: { value: 1.0, type: 'f' },
      useUV: { value: 1.0, type: 'f' },
      map: { value: null, type: 't' },
      envMap: { value: null, type: 't' } }]);

    var _this = possibleConstructorReturn(this, (StereoBasicTextureMaterial.__proto__ || Object.getPrototypeOf(StereoBasicTextureMaterial)).call(this, {
      uniforms: uniforms,
      vertexShader: StereoShaderLib.stereo_basic_vert,
      fragmentShader: StereoShaderLib.stereo_basic_frag
    }));

    _this.isStereoBasicTextureMaterial = true;

    _this.stereoOffsetRepeats = DEFAULT_OFFSET_REPEATS;
    _this.setValues(parameters);
    return _this;
  }

  createClass(StereoBasicTextureMaterial, [{
    key: 'copy',
    value: function copy(source) {
      get(StereoBasicTextureMaterial.prototype.__proto__ || Object.getPrototypeOf(StereoBasicTextureMaterial.prototype), 'copy', this).call(this, source);
      this.stereoOffsetRepeats = source.stereoOffsetRepeats.slice();
      return this;
    }
  }, {
    key: 'color',
    set: function set(value) {
      this.uniforms.color.value = new THREE.Color(value);
    },
    get: function get() {
      return this.uniforms.color.value;
    }
  }, {
    key: 'opacity',
    set: function set(value) {
      this.uniforms && (this.uniforms.opacity.value = value);
    },
    get: function get() {
      return this.uniforms.opacity.value;
    }
  }, {
    key: 'map',
    set: function set(value) {
      this.uniforms.map.value = value;
    },
    get: function get() {
      return this.uniforms.map.value;
    }
  }, {
    key: 'envMap',
    set: function set(value) {
      this.uniforms.envMap.value = value;
    },
    get: function get() {
      return this.uniforms.envMap.value;
    }
  }, {
    key: 'useUV',
    set: function set(value) {
      this.uniforms.useUV.value = value;
    }
  }]);
  return StereoBasicTextureMaterial;
}(THREE.ShaderMaterial);

var GuiSysEventType = {
  HIT_CHANGED: 'HIT_CHANGED',
  INPUT_EVENT: 'INPUT_EVENT'
};

var GuiSysEvent = function GuiSysEvent(eventType, args) {
  classCallCheck(this, GuiSysEvent);

  this.type = 'GuiSysEvent';
  this.eventType = eventType;
  this.args = args;
};

var UIViewEventType = {
  FOCUS_LOST: 'FOCUS_LOST',
  FOCUS_GAINED: 'FOCUS_GAINED'
};

var UIViewEvent = function UIViewEvent(view, eventType, args) {
  classCallCheck(this, UIViewEvent);

  this.type = 'UIViewEvent';
  this.view = view;
  this.eventType = eventType;
  this.args = args;
};

var EventInput = function () {
  function EventInput(eventType) {
    classCallCheck(this, EventInput);

    this._eventType = eventType;
  }

  createClass(EventInput, [{
    key: "getEventType",
    value: function getEventType() {
      return this._eventType;
    }
  }]);
  return EventInput;
}();

var getGamepads = (navigator.getGamepads ? navigator.getGamepads : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : function () {
  return [];
}).bind(navigator);

var LONG_PRESS_TIME = 500;
var AXIS_EPSILON = 0.001;
var GamepadEventInput = function (_EventInput) {
  inherits(GamepadEventInput, _EventInput);

  function GamepadEventInput() {
    classCallCheck(this, GamepadEventInput);

    var _this = possibleConstructorReturn(this, (GamepadEventInput.__proto__ || Object.getPrototypeOf(GamepadEventInput)).call(this, 'GamepadInputEvent'));

    _this._previousState = [];
    return _this;
  }

  createClass(GamepadEventInput, [{
    key: 'getEvents',
    value: function getEvents() {
      var now = Date.now();
      var gamepads = getGamepads();
      var events = [];
      for (var id = 0; id < gamepads.length; id++) {
        if (gamepads[id]) {
          if (!this._previousState[id]) {
            this._previousState[id] = {
              buttons: [],
              axes: []
            };
          }
          var state = this._previousState[id];
          var _buttons = gamepads[id].buttons;
          for (var btn = 0; btn < _buttons.length; btn++) {
            var buttonState = state.buttons[btn];
            if (!buttonState) {
              buttonState = {
                pressed: false,
                startTime: -1
              };
              state.buttons[btn] = buttonState;
            }
            var _pressed = _typeof(_buttons[btn]) === 'object' ? _buttons[btn].pressed : _buttons[btn] === 1.0;
            if (buttonState.pressed !== _pressed) {
              if (_pressed) {
                buttonState.pressed = true;
                buttonState.startTime = now;
                events.push({
                  type: this.getEventType(),
                  eventType: 'keydown',
                  button: btn,
                  gamepad: id,
                  repeat: false
                });
              } else {
                buttonState.pressed = false;
                events.push({
                  type: this.getEventType(),
                  eventType: 'keyup',
                  button: btn,
                  gamepad: id
                });
              }
            } else if (_pressed && now - buttonState.startTime > LONG_PRESS_TIME) {
              events.push({
                type: this.getEventType(),
                eventType: 'keydown',
                button: btn,
                gamepad: id,
                repeat: true
              });
            }
          }

          var _axes = gamepads[id].axes;
          if (_axes) {
            for (var _axis = 0; _axis < _axes.length; _axis++) {
              var oldValue = state.axes[_axis];
              var newValue = _axes[_axis];
              if (typeof oldValue !== 'number') {
                state.axes[_axis] = newValue;
                continue;
              }
              if (Math.abs(newValue - oldValue) > AXIS_EPSILON) {
                events.push({
                  type: this.getEventType(),
                  eventType: 'axismove',
                  axis: _axis,
                  gamepad: id,
                  value: newValue
                });
              }
              state.axes[_axis] = newValue;
            }
          }
        } else {
          if (this._previousState[id]) {
            delete this._previousState[id];
          }
        }
      }
      return events;
    }
  }]);
  return GamepadEventInput;
}(EventInput);

var KEYBOARD_EVENTS = ['keydown', 'keypress', 'keyup'];

var KeyboardEventInput = function (_EventInput) {
  inherits(KeyboardEventInput, _EventInput);

  function KeyboardEventInput() {
    classCallCheck(this, KeyboardEventInput);

    var _this = possibleConstructorReturn(this, (KeyboardEventInput.__proto__ || Object.getPrototypeOf(KeyboardEventInput)).call(this, 'KeyboardInputEvent'));

    _this._batchedEvents = [];
    _this._onKeyboardEvent = _this._onKeyboardEvent.bind(_this);

    _this._addEventListeners();
    return _this;
  }

  createClass(KeyboardEventInput, [{
    key: '_addEventListeners',
    value: function _addEventListeners() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = KEYBOARD_EVENTS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var type = _step.value;

          window.addEventListener(type, this._onKeyboardEvent, true);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: '_removeEventListeners',
    value: function _removeEventListeners() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = KEYBOARD_EVENTS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var type = _step2.value;

          window.removeEventListener(type, this._onKeyboardEvent, true);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: '_onKeyboardEvent',
    value: function _onKeyboardEvent(e) {
      this._batchedEvents.push({
        type: this.getEventType(),
        eventType: e.type,
        altKey: e.altKey,
        code: e.code,
        ctrlKey: e.ctrlKey,
        key: e.key,
        keyCode: e.keyCode,
        metaKey: e.metaKey,
        repeat: e.repeat,
        shiftKey: e.shiftKey
      });
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var events = this._batchedEvents;
      if (events.length < 1) {
        return null;
      }
      this._batchedEvents = [];
      return events;
    }
  }]);
  return KeyboardEventInput;
}(EventInput);

var MOUSE_EVENTS = ['mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'mouseenter', 'mouseleave', 'wheel'];

function getDocumentBounds() {
  return {
    top: 0,
    left: 0,
    width: document.body ? document.body.clientWidth : 0,
    height: document.body ? document.body.clientHeight : 0
  };
}

var MouseEventInput = function (_EventInput) {
  inherits(MouseEventInput, _EventInput);

  function MouseEventInput(target) {
    classCallCheck(this, MouseEventInput);

    var _this = possibleConstructorReturn(this, (MouseEventInput.__proto__ || Object.getPrototypeOf(MouseEventInput)).call(this, 'MouseInputEvent'));

    _this._batchedEvents = [];
    _this._target = target || document;
    _this._onMouseEvent = _this._onMouseEvent.bind(_this);

    _this._addEventListeners();
    return _this;
  }

  createClass(MouseEventInput, [{
    key: 'getTarget',
    value: function getTarget() {
      return this._target;
    }
  }, {
    key: 'setTarget',
    value: function setTarget(target) {
      if (this._target) {
        this._removeEventListeners();
      }
      this._target = target;
      this._addEventListeners();
    }
  }, {
    key: '_addEventListeners',
    value: function _addEventListeners() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = MOUSE_EVENTS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var type = _step.value;

          this._target.addEventListener(type, this._onMouseEvent, true);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: '_removeEventListeners',
    value: function _removeEventListeners() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = MOUSE_EVENTS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var type = _step2.value;

          this._target.removeEventListener(type, this._onMouseEvent, true);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: '_onMouseEvent',
    value: function _onMouseEvent(e) {
      var target = e.currentTarget;
      if (target && target === this._target) {
        var viewport = typeof target.getBoundingClientRect === 'function' ? target.getBoundingClientRect() : getDocumentBounds();
        var _viewportX = (e.clientX - viewport.left) / viewport.width * 2 - 1;
        var _viewportY = -((e.clientY - viewport.top) / viewport.height) * 2 + 1;
        this._batchedEvents.push({
          type: this.getEventType(),
          eventType: e.type,
          altKey: e.altKey,
          button: e.button,
          buttons: e.buttons,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          viewportX: _viewportX,
          viewportY: _viewportY
        });
      }
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var events = this._batchedEvents;
      if (events.length < 1) {
        return null;
      }
      this._batchedEvents = [];
      return events;
    }
  }]);
  return MouseEventInput;
}(EventInput);

var TOUCH_EVENTS = ['touchcancel', 'touchend', 'touchmove', 'touchstart'];

function getDocumentBounds$1() {
  return {
    top: 0,
    left: 0,
    width: document.body ? document.body.clientWidth : 0,
    height: document.body ? document.body.clientHeight : 0
  };
}

function createTouchList(rawList, viewport) {
  var touchList = [];
  for (var i = 0; i < rawList.length; i++) {
    var touch = rawList[i];
    var _viewportX = (touch.clientX - viewport.left) / viewport.width * 2 - 1;
    var _viewportY = -((touch.clientY - viewport.top) / viewport.height) * 2 + 1;
    touchList.push({
      identifier: touch.identifier,
      target: touch.target,
      viewportX: _viewportX,
      viewportY: _viewportY
    });
  }

  return touchList;
}

var TouchEventInput = function (_EventInput) {
  inherits(TouchEventInput, _EventInput);

  function TouchEventInput(target) {
    classCallCheck(this, TouchEventInput);

    var _this = possibleConstructorReturn(this, (TouchEventInput.__proto__ || Object.getPrototypeOf(TouchEventInput)).call(this, 'TouchInputEvent'));

    _this._batchedEvents = [];
    _this._target = target || document;
    _this._onTouchEvent = _this._onTouchEvent.bind(_this);

    _this._addEventListeners();
    _this._immediateListener = null;
    return _this;
  }

  createClass(TouchEventInput, [{
    key: 'getTarget',
    value: function getTarget() {
      return this._target;
    }
  }, {
    key: 'setTarget',
    value: function setTarget(target) {
      if (this._target) {
        this._removeEventListeners();
      }
      this._target = target;
      this._addEventListeners();
    }
  }, {
    key: 'setImmediateListener',
    value: function setImmediateListener(listener) {
      this._immediateListener = listener;
    }
  }, {
    key: '_addEventListeners',
    value: function _addEventListeners() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = TOUCH_EVENTS[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var type = _step.value;

          this._target.addEventListener(type, this._onTouchEvent, true);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: '_removeEventListeners',
    value: function _removeEventListeners() {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = TOUCH_EVENTS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var type = _step2.value;

          this._target.removeEventListener(type, this._onTouchEvent, true);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: '_onTouchEvent',
    value: function _onTouchEvent(e) {
      e.preventDefault();
      var target = e.currentTarget;
      if (target && target === this._target) {
        var viewport = typeof target.getBoundingClientRect === 'function' ? target.getBoundingClientRect() : getDocumentBounds$1();
        var touchEvent = {
          type: this.getEventType(),
          eventType: e.type,
          altKey: e.altKey,
          changedTouches: createTouchList(e.changedTouches, viewport),
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          shiftKey: e.shiftKey,
          targetTouches: createTouchList(e.targetTouches, viewport),
          touches: createTouchList(e.touches, viewport)
        };
        this._batchedEvents.push(touchEvent);
        if (this._immediateListener) {
          this._immediateListener(touchEvent);
        }
      }
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var events = this._batchedEvents;
      if (events.length < 1) {
        return null;
      }
      this._batchedEvents = [];
      return events;
    }
  }]);
  return TouchEventInput;
}(EventInput);

var RayCaster = function () {
  function RayCaster() {
    classCallCheck(this, RayCaster);
  }

  createClass(RayCaster, [{
    key: 'getType',
    value: function getType() {
      throw new Error('RayCaster subclasses must override getType()');
    }
  }, {
    key: 'frame',
    value: function frame(startTime) {}
  }, {
    key: 'getRayOrigin',
    value: function getRayOrigin(camera) {
      throw new Error('RayCaster subclasses must override getRayOrigin()');
    }
  }, {
    key: 'getRayDirection',
    value: function getRayDirection(camera) {
      throw new Error('RayCaster subclasses must override getRayDirection()');
    }
  }, {
    key: 'drawsCursor',
    value: function drawsCursor() {
      return true;
    }
  }]);
  return RayCaster;
}();

var ORIGIN = [0, 0, 0];

var MouseRayCaster = function (_RayCaster) {
  inherits(MouseRayCaster, _RayCaster);

  function MouseRayCaster() {
    classCallCheck(this, MouseRayCaster);

    var _this = possibleConstructorReturn(this, (MouseRayCaster.__proto__ || Object.getPrototypeOf(MouseRayCaster)).call(this));

    _this._lastX = null;
    _this._lastY = null;
    _this._lastOrientation = null;
    _this.touchReleaseDelay = 300;

    _this._active = true;

    _this._handleMouseEvent = _this._handleMouseEvent.bind(_this);
    _this._handleTouchEvent = _this._handleTouchEvent.bind(_this);
    _this._handleTouchEnd = _this._handleTouchEnd.bind(_this);
    _this._resetLastReading = _this._resetLastReading.bind(_this);

    document.addEventListener('mousemove', _this._handleMouseEvent);
    document.addEventListener('touchstart', _this._handleTouchEvent);
    document.addEventListener('touchmove', _this._handleTouchEvent);
    document.addEventListener('touchend', _this._handleTouchEnd);
    document.addEventListener('touchcancel', _this._handleTouchEnd);
    window.addEventListener('vrdisplaypresentchange', function (e) {
      _this._active = !e.display.isPresenting;
    });
    return _this;
  }

  createClass(MouseRayCaster, [{
    key: '_handleMouseEvent',
    value: function _handleMouseEvent(e) {
      if (!this._active) {
        return;
      }
      var width = document.body ? document.body.clientWidth : 0;
      var height = document.body ? document.body.clientHeight : 0;
      var x = e.clientX / width * 2 - 1;
      var y = -(e.clientY / height) * 2 + 1;
      if (this._lastX !== x || this._lastY !== y) {
        this._lastOrientation = null;
      }
      this._lastX = x;
      this._lastY = y;
    }
  }, {
    key: '_handleTouchEvent',
    value: function _handleTouchEvent(e) {
      if (!this._active) {
        return;
      }
      var targetTouches = e.targetTouches;
      if (targetTouches && targetTouches.length > 0) {
        var width = document.body ? document.body.clientWidth : 0;
        var height = document.body ? document.body.clientHeight : 0;
        var rawTouch = e.targetTouches[0];
        var x = rawTouch.clientX / width * 2 - 1;
        var y = -(rawTouch.clientY / height) * 2 + 1;
        if (this._lastX !== x || this._lastY !== y) {
          this._lastOrientation = null;
        }
        this._lastX = x;
        this._lastY = y;
      } else {
        this._endTouch();
      }
    }
  }, {
    key: '_handleTouchEnd',
    value: function _handleTouchEnd(e) {
      if (!this._active) {
        return;
      }
      this._endTouch();
    }
  }, {
    key: '_endTouch',
    value: function _endTouch() {
      if (this._touchReleaseTimeout) {
        clearTimeout(this._touchReleaseTimeout);
      }
      this._touchReleaseTimeout = setTimeout(this._resetLastReading, this.touchReleaseDelay);
    }
  }, {
    key: '_resetLastReading',
    value: function _resetLastReading() {
      this._lastX = null;
      this._lastY = null;
      this._lastOrientation = null;
    }
  }, {
    key: '_clearTouchReleaseTimeout',
    value: function _clearTouchReleaseTimeout() {
      if (this._touchReleaseTimeout) {
        clearTimeout(this._touchReleaseTimeout);
      }
      this._touchReleaseTimeout = null;
    }
  }, {
    key: 'getType',
    value: function getType() {
      return 'mouse';
    }
  }, {
    key: 'getRayOrigin',
    value: function getRayOrigin() {
      if (!this._active) {
        return null;
      }
      return ORIGIN;
    }
  }, {
    key: 'getRayDirection',
    value: function getRayDirection(camera) {
      if (!this._active) {
        return null;
      }
      if (this._lastOrientation) {
        return this._lastOrientation;
      }
      if (this._lastX === null || this._lastY === null) {
        return null;
      }
      var fov = camera.fov * Math.PI / 180;
      var tan = Math.tan(fov / 2);
      var x = camera.aspect * tan * this._lastX;
      var y = tan * this._lastY;
      var mag = Math.sqrt(1 + x * x + y * y);
      this._lastOrientation = [x / mag, y / mag, -1 / mag];
      return this._lastOrientation;
    }
  }, {
    key: 'drawsCursor',
    value: function drawsCursor() {
      return false;
    }
  }]);
  return MouseRayCaster;
}(RayCaster);

function setParams(object, params) {
  if (params === undefined) {
    return;
  }

  for (var key in params) {
    var func = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
    if (typeof object[func] !== 'function') {
      console.warn('"' + func + '" is not a function of UIView.');
      continue;
    }

    var newValue = params[key];
    object[func](newValue);
  }
}

var ScaleFitCenter = {
  getScaleParams: function getScaleParams(dims, textureDim, inset, insetSize, borderWidth) {
    dims = dims || [1, 1];
    textureDim = textureDim || [0, 0];
    var scaledDims = [].concat(toConsumableArray(dims));
    if (dims[0] > 0 && dims[1] > 0 && textureDim[0] > 0 && textureDim[1] > 0) {
      var scale = [dims[0] / textureDim[0], dims[1] / textureDim[1]];
      var minScale = Math.min(scale[0], scale[1]);
      scaledDims = [textureDim[0] * minScale, textureDim[1] * minScale];
    }
    return {
      dims: scaledDims,
      border: {
        cssBorderWidth: borderWidth,
        originalDim: dims
      },
      cropUV: [0, 0, 1, 1]
    };
  }
};

var ScaleFixXY = {
  getScaleParams: function getScaleParams(dims, textureDim, inset, insetSize, borderWidth) {
    dims = dims || [1, 1];
    textureDim = textureDim || [0, 0];
    return {
      dims: dims,
      border: {
        texture: inset,
        factor: [insetSize[0] / dims[0], insetSize[1] / dims[1], insetSize[2] / dims[0], insetSize[3] / dims[1]],
        cssBorderWidth: borderWidth
      },
      cropUV: [0, 0, 1, 1]
    };
  }
};

var ScaleCenterCrop = {
  getScaleParams: function getScaleParams(dims, textureDim, inset, insetSize, borderWidth) {
    dims = dims || [1, 1];
    textureDim = textureDim || [0, 0];
    var cropOffset = [0, 0];
    if (dims[0] > 0 && dims[1] > 0 && textureDim[0] > 0 && textureDim[1] > 0) {
      var scale = [textureDim[0] / dims[0], textureDim[1] / dims[1]];
      var minScale = Math.min(scale[0], scale[1]);
      cropOffset = [(1 - dims[0] * minScale / textureDim[0]) / 2, (1 - dims[1] * minScale / textureDim[1]) / 2];
    }
    return {
      dims: dims,
      border: {
        cssBorderWidth: borderWidth
      },
      cropUV: [cropOffset[0], cropOffset[1], 1 - cropOffset[0], 1 - cropOffset[1]]
    };
  }
};

var ScaleType = {
  FIT_CENTER: ScaleFitCenter,
  FIT_XY: ScaleFixXY,
  CENTER_CROP: ScaleCenterCrop
};

function defaultScaleType() {
  return ScaleType.FIT_XY;
}

function resizeModetoScaleType(resizeModeValue) {
  if (resizeModeValue === 'contain') {
    return ScaleType.FIT_CENTER;
  } else if (resizeModeValue === 'cover') {
    return ScaleType.CENTER_CROP;
  } else if (resizeModeValue === 'stretch') {
    return ScaleType.FIT_XY;
  } else if (resizeModeValue === 'center') {
    return ScaleType.FIT_CENTER;
  } else if (resizeModeValue == null) {
    return defaultScaleType();
  } else {
    console.error("Invalid resize mode: '" + resizeModeValue + "'");
    return defaultScaleType();
  }
}

var PointerEvents = {
  AUTO: 'auto',
  NONE: 'none',
  BOX_NONE: 'box-none',
  BOX_ONLY: 'box-only'
};

var DEFAULT_Z_OFFSET_SCALE = 0.001;
var DEFAULT_CURSOR_DISTANCE = 2.0;
var DEFAULT_CURSOR_WIDTH = 0.025;
var RENDERSORT_DISTANCE_MULTIPLIER = 64;
var RENDERSORT_DISTANCE_SHIFT = 9;
var DEFAULT_TOUCH_RELEASE_DELAY = 300;

var frameUpdateUID = 0;

var raycaster = new THREE.Raycaster();

function matrixDistance(matrixA, matrixB) {
  var x = matrixA.elements[12] - matrixB.elements[12];
  var y = matrixA.elements[13] - matrixB.elements[13];
  var z = matrixA.elements[14] - matrixB.elements[14];
  return Math.sqrt(x * x + y * x + z * z);
}

function _applyUpdates(node, currentOpacity, updateContext, index, clipRect) {
  if (node.renderGroup) {
    var dist = matrixDistance(node.matrixWorld, updateContext.camera.matrixWorld);
    dist += node.zOffset || 0;
    index = updateContext.renderOrder;

    if (node.type === 'UIView') {
      dist = Math.max(0, updateContext.camera.far - dist);
    }

    updateContext.distances[index] = Math.floor(dist * RENDERSORT_DISTANCE_MULTIPLIER) << RENDERSORT_DISTANCE_SHIFT;
  }

  updateContext.renderOrder++;
  node.renderOrder = updateContext.distances[index] + updateContext.renderOrder;

  if (node.type === 'UIView') {
    var worldClipRect = node.calcWorldClipRect();
    currentOpacity *= node.opacity;
    node.setClipPlanes(clipRect);
    node.applyUpdates(currentOpacity, updateContext);
    clipRect = [Math.max(clipRect[0], worldClipRect[0]), Math.max(clipRect[1], worldClipRect[1]), Math.min(clipRect[2], worldClipRect[2]), Math.min(clipRect[3], worldClipRect[3])];
  } else if (node.type === 'SDFText') {
    node.textClip[0] = clipRect[0];
    node.textClip[1] = clipRect[1];
    node.textClip[2] = clipRect[2];
    node.textClip[3] = clipRect[3];
  }
  for (var i in node.children) {
    _applyUpdates(node.children[i], currentOpacity, updateContext, index, clipRect);
  }
}

function updateBillboard(node, updateContext) {
  if (node.type === 'UIView' && node.billboarding === 'on') {
    node.updateBillboard(updateContext);
  }
  for (var i in node.children) {
    updateBillboard(node.children[i], updateContext);
  }
}

function intersectObject(object, raycaster, intersects) {
  if (object.visible === false) {
    return;
  }
  object.raycast(raycaster, intersects);
  var children = object.children;
  for (var i = 0, l = children.length; i < l; i++) {
    intersectObject(children[i], raycaster, intersects);
  }
}

var GuiSys = function () {
  function GuiSys(root) {
    var _this = this;

    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    classCallCheck(this, GuiSys);

    this.root = root;
    this.guiRoot = new THREE.Object3D();
    this.root.add(this.guiRoot);
    this.isVRPresenting = false;
    this._requestFrames = {};
    this._offscreenRenders = {};
    this._offscreenRenderUID = 1;

    this._cursor = {
      intersectDistance: 0,
      lastHit: null,
      lastAlmostHit: null,
      source: null,
      rayOrigin: null,
      rayDirection: null,
      lastHitCache: [],
      drawsCursor: false,

      lastLocalX: null,
      lastLocalY: null,
      lastHitImmediateListeners: null
    };

    this.ZOffsetScale = DEFAULT_Z_OFFSET_SCALE;

    this.mouseOffset = null;

    this.mouseCursorInactiveStyle = 'default';
    this.mouseCursorActiveStyle = 'pointer';

    this.mouseCursorActive = false;

    this.touchReleaseDelay = DEFAULT_TOUCH_RELEASE_DELAY;

    this.cursorVisibility = 'hidden';

    this.cursorAutoDepth = true;

    this.cursorFixedDistance = DEFAULT_CURSOR_DISTANCE;

    if (!params.font) {
      params.font = loadFont();
    }

    if (!params.raycasters) {
      params.raycasters = [new MouseRayCaster()];
    }

    if (params !== undefined) {
      setParams(this, params);
    }

    this.eventDispatcher = new THREE.EventDispatcher();

    var touchEventInput = new TouchEventInput();
    touchEventInput.setImmediateListener(function (event) {
      return _this._onTouchImmediate(event);
    });
    this._inputEventSources = [new KeyboardEventInput(), new MouseEventInput(), touchEventInput, new GamepadEventInput()];

    window.addEventListener('vrdisplaypresentchange', this._onPresentChange.bind(this));
  }

  createClass(GuiSys, [{
    key: 'add',
    value: function add(child) {
      this.guiRoot.add(child);
    }
  }, {
    key: 'remove',
    value: function remove(child) {
      this.guiRoot.remove(child);
    }
  }, {
    key: 'requestFrameFunction',
    value: function requestFrameFunction(func) {
      var uid = frameUpdateUID++;
      this._requestFrames[uid] = func;
      return uid;
    }
  }, {
    key: 'cancelFrameFunction',
    value: function cancelFrameFunction(uid) {
      delete this._requestFrames[uid];
    }
  }, {
    key: 'applyUpdates',
    value: function applyUpdates(camera, root) {
      var updateContext = {
        camera: camera,
        renderOrder: 0,
        distances: [Math.floor(camera.far * RENDERSORT_DISTANCE_MULTIPLIER) << RENDERSORT_DISTANCE_SHIFT],
        distancesNode: [null]
      };

      _applyUpdates(root, 1, updateContext, 0, [-16384, -16384, 16384, 16384]);

      root.updateMatrixWorld();

      return updateContext;
    }
  }, {
    key: 'frameRenderUpdates',
    value: function frameRenderUpdates(camera) {
      var curTime = Date.now();
      var currentRequests = this._requestFrames;
      this._requestFrames = {};
      for (var update in currentRequests) {
        currentRequests[update](curTime);
      }

      for (var scene in this._offscreenRenders) {
        var sceneParams = this._offscreenRenders[scene];
        this.applyUpdates(sceneParams.camera, sceneParams.scene);
      }

      var updateContext = this.applyUpdates(camera, this.root);

      if (!this.isVRPresenting) {
        updateBillboard(this.root, updateContext);
      }

      if (this._raycasters) {
        for (var i = 0; i < this._raycasters.length; i++) {
          if (typeof this._raycasters[i].frame === 'function') {
            this._raycasters[i].frame(curTime);
          }
        }
      }

      if (this.cursorVisibility !== 'hidden' && !this.cursorMesh) {
        this.addCursor();
      }
    }
  }, {
    key: 'frameInputEvents',
    value: function frameInputEvents(camera, renderer) {
      if (this._raycasters) {
        var caster = null;
        var origin = null;
        var direction = null;
        var maxLength = Infinity;

        var r = 0;
        while ((!origin || !direction) && r < this._raycasters.length) {
          caster = this._raycasters[r];
          origin = caster.getRayOrigin(camera);
          direction = caster.getRayDirection(camera);
          if (typeof caster.getMaxLength === 'function') {
            maxLength = caster.getMaxLength();
          } else {
            maxLength = Infinity;
          }
          r++;
        }
        if (origin && direction) {
          var firstHit = null;
          var firstAlmostHit = null;
          var cameraPosition = camera.getWorldPosition();
          raycaster.ray.origin.set(cameraPosition.x + origin[0], cameraPosition.y + origin[1], cameraPosition.z + origin[2]);
          raycaster.ray.direction.fromArray(direction);
          raycaster.ray.direction.normalize();
          raycaster.ray.direction.applyQuaternion(camera.getWorldQuaternion());
          raycaster.far = maxLength;
          var rotatedDirection = [raycaster.ray.direction.x, raycaster.ray.direction.y, raycaster.ray.direction.z];
          var hits = raycaster.intersectObject(this.root, true);
          for (var i = 0; i < hits.length; i++) {
            var hit = hits[i];
            if (hit.uv && hit.object && hit.object.subScene) {
              var distanceToSubscene = hit.distance;
              var scene = hit.object.subScene;
              raycaster.ray.origin.set(scene._rttWidth * hit.uv.x, scene._rttHeight * (1 - hit.uv.y), 0.1);
              raycaster.ray.direction.set(0, 0, -1);
              var subHits = [];
              intersectObject(scene, raycaster, subHits);
              if (subHits.length === 0) {
                continue;
              }
              hit = subHits[subHits.length - 1];
              hit.distance = distanceToSubscene;
            }
            if (!firstHit && !hit.isAlmostHit) {
              firstHit = hit;
            }
            if (!firstAlmostHit && hit.isAlmostHit) {
              firstAlmostHit = hit;
            }
          }

          var source = caster.getType();
          if (firstHit) {
            this.updateLastHit(firstHit.object, source);
            if (firstHit.uv) {
              this._cursor.lastLocalX = firstHit.uv.x;
              this._cursor.lastLocalY = firstHit.uv.y;
            }

            this._cursor.intersectDistance = firstHit.distance;
          } else {
            this.updateLastHit(null, source);
            this._cursor.lastLocalX = null;
            this._cursor.lastLocalY = null;
          }

          if (this.cursorVisibility === 'auto') {
            if (firstAlmostHit && !(firstHit && firstHit.object.isInteractable)) {
              this._cursor.lastAlmostHit = firstAlmostHit.object;
              this._cursor.intersectDistance = firstAlmostHit.distance;
            } else {
              this._cursor.lastAlmostHit = null;
            }
          }

          this._cursor.rayOrigin = origin;
          this._cursor.rayDirection = rotatedDirection;
          this._cursor.drawsCursor = caster.drawsCursor();
        } else {
          this._cursor.lastHit = null;
          this._cursor.source = null;
          this._cursor.drawsCursor = false;
          this._cursor.rayOrigin = null;
          this._cursor.rayDirection = null;
        }
      }

      var renderTarget = renderer ? renderer.domElement : null;
      this._domElement = renderTarget;
      this._fireInputEvents(renderTarget);
      this._updateMouseCursorStyle(renderTarget);
    }
  }, {
    key: 'frame',
    value: function frame(camera, renderer) {
      this.frameRenderUpdates(camera);
      this.frameInputEvents(camera, renderer);
      this.updateCursor(camera);
    }
  }, {
    key: 'updateLastHit',
    value: function updateLastHit(hit, source) {
      var hitCache = [];
      var hitImmediateListeners = [];
      var currentHit = hit;

      var hitViews = [];
      while (currentHit) {
        if (currentHit.type === 'UIView') {
          hitViews.push(currentHit);
        }
        currentHit = currentHit.parent;
      }

      var target = null;
      this.mouseCursorActive = false;
      for (var i = hitViews.length - 1; i >= 0; i--) {
        if (hitViews[i].shouldAcceptHitEvent()) {
          target = hitViews[i].id;
          hitCache[hitViews[i].id] = hitViews[i];
          if (hitViews[i].immediateListener) {
            hitImmediateListeners.push(hitViews[i].immediateListener);
          }
          if (hitViews[i].isMouseInteractable) {
            this.mouseCursorActive = true;
          }
        }

        if (hitViews[i].shouldInterceptHitEvent()) {
          break;
        }
      }

      currentHit = target !== null && hitCache[target] ? hitCache[target] : null;
      if (this._cursor.lastHit !== currentHit || this._cursor.source !== source) {
        this.eventDispatcher.dispatchEvent(new GuiSysEvent(GuiSysEventType.HIT_CHANGED, {
          lastHit: this._cursor.lastHit,
          currentHit: currentHit,
          lastSource: this._cursor.source,
          currentSource: source
        }));
        this._cursor.lastHit = currentHit;
        this._cursor.source = source;
      }

      for (var id in this._cursor.lastHitCache) {
        if (!hitCache[id]) {
          this.eventDispatcher.dispatchEvent(new UIViewEvent(this._cursor.lastHitCache[id], UIViewEventType.FOCUS_LOST, {
            target: this._cursor.lastHit,
            source: this._cursor.source
          }));
        }
      }

      for (var _id in hitCache) {
        if (!this._cursor.lastHitCache[_id]) {
          this.eventDispatcher.dispatchEvent(new UIViewEvent(hitCache[_id], UIViewEventType.FOCUS_GAINED, {
            target: this._cursor.lastHit,
            source: this._cursor.source
          }));
        }
      }

      this._cursor.lastHitCache = hitCache;

      this._cursor.lastHitImmediateListeners = hitImmediateListeners;
    }
  }, {
    key: 'addCursor',
    value: function addCursor() {
      this.cursorMesh = this.makeDefaultCursor();
      this.cursorMesh.raycast = function () {
        return null;
      };
      this.root.add(this.cursorMesh);
      this.cursorMesh.visible = false;

      this.cursorMesh.material.depthTest = false;
      this.cursorMesh.material.depthWrite = false;
      this.cursorMesh.renderOrder = 1;
    }
  }, {
    key: 'updateCursor',
    value: function updateCursor(camera) {
      var cursorZ = this.cursorAutoDepth && this._cursor.lastHit !== null ? this._cursor.intersectDistance : this.cursorFixedDistance;

      var lastOrigin = this._cursor.rayOrigin;
      var lastDirection = this._cursor.rayDirection;

      if (this.cursorMesh && this.cursorVisibility !== 'hidden' && lastOrigin && lastDirection) {
        var cameraToCursorX = lastOrigin[0] + lastDirection[0] * cursorZ;
        var cameraToCursorY = lastOrigin[1] + lastDirection[1] * cursorZ;
        var cameraToCursorZ = lastOrigin[2] + lastDirection[2] * cursorZ;
        this.cursorMesh.position.set(camera.position.x + cameraToCursorX, camera.position.y + cameraToCursorY, camera.position.z + cameraToCursorZ);
        this.cursorMesh.rotation.copy(camera.getWorldRotation());

        if (this.cursorAutoDepth) {
          var scale = Math.sqrt(cameraToCursorX * cameraToCursorX + cameraToCursorY * cameraToCursorY + cameraToCursorZ * cameraToCursorZ);
          this.cursorMesh.scale.set(scale, scale, scale);
        }
      }

      if (this.cursorMesh) {
        var autoVisible = false;
        if (this.cursorVisibility === 'auto') {
          autoVisible = this._cursor.lastHit !== null && this._cursor.lastHit.isInteractable;
          if (!autoVisible) {
            autoVisible = this._cursor.lastAlmostHit !== null && this._cursor.lastAlmostHit.isInteractable;
          }
        }

        this.cursorMesh.visible = this._cursor.drawsCursor && (this.cursorVisibility === 'visible' || autoVisible) && lastOrigin !== null && lastDirection !== null;
      }
    }
  }, {
    key: 'makeDefaultCursor',
    value: function makeDefaultCursor() {
      var canvas = document.createElement('canvas');

      canvas.width = 256;
      canvas.height = 256;

      var ctx = canvas.getContext('2d');
      ctx.beginPath();

      ctx.arc(128, 128, 95, 0, 2 * Math.PI);

      ctx.strokeStyle = 'rgba(256, 256, 256, 1)';
      ctx.fillStyle = 'rgba(256, 256, 256, 0.8)';
      ctx.lineWidth = 25;
      ctx.stroke();
      ctx.fill();

      var texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      var material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        map: texture
      });

      var defaultCursor = new THREE.Mesh(new THREE.PlaneGeometry(DEFAULT_CURSOR_WIDTH, DEFAULT_CURSOR_WIDTH), material);
      return defaultCursor;
    }
  }, {
    key: '_updateMouseCursorStyle',
    value: function _updateMouseCursorStyle(renderTarget) {
      var cursorStyle = this.mouseCursorActive ? this.mouseCursorActiveStyle : this.mouseCursorInactiveStyle;
      if (renderTarget && renderTarget.style) {
        renderTarget.style.cursor = cursorStyle;
        renderTarget.style.cursor = '-webkit-' + cursorStyle;
        renderTarget.style.cursor = '-moz-' + cursorStyle;
      }
    }
  }, {
    key: '_onPresentChange',
    value: function _onPresentChange(e) {
      this.isVRPresenting = e.display.isPresenting;
    }
  }, {
    key: '_fireInputEvents',
    value: function _fireInputEvents(target) {
      var collected = [];
      for (var i = 0; i < this._inputEventSources.length; i++) {
        var source = this._inputEventSources[i];
        if (typeof source.getTarget === 'function') {
          if (source.getTarget() !== target) {
            source.setTarget(target);
          }
        }

        var events = source.getEvents();
        if (events) {
          collected = collected.concat(events);
        }
      }

      for (var _i = 0; _i < collected.length; _i++) {
        this.eventDispatcher.dispatchEvent(new GuiSysEvent(GuiSysEventType.INPUT_EVENT, {
          target: this._cursor.lastHit,
          source: this._cursor.source,
          inputEvent: collected[_i]
        }));
      }
    }
  }, {
    key: '_onTouchImmediate',
    value: function _onTouchImmediate(event) {
      var listeners = this._cursor.lastHitImmediateListeners;
      if (listeners) {
        for (var i = 0; i < listeners.length; i++) {
          if (listeners[i].eventType === event.eventType) {
            listeners[i].callback(event);
          }
        }
      }
    }
  }, {
    key: 'registerOffscreenRender',
    value: function registerOffscreenRender(scene, camera, renderTarget) {
      var uid = this._offscreenRenderUID++;
      this._offscreenRenders[uid] = { scene: scene, camera: camera, renderTarget: renderTarget };
      return uid;
    }
  }, {
    key: 'unregisterOffscreenRender',
    value: function unregisterOffscreenRender(uid) {
      if (!uid) {
        return;
      }
      delete this._offscreenRenders[uid];
    }
  }, {
    key: 'getOffscreenRenders',
    value: function getOffscreenRenders() {
      return this._offscreenRenders;
    }
  }, {
    key: 'setFont',
    value: function setFont(font) {
      this.font = font;
    }
  }, {
    key: 'setMouseCursorInactiveStyle',
    value: function setMouseCursorInactiveStyle(style) {
      this.mouseCursorInactiveStyle = style;
    }
  }, {
    key: 'setMouseCursorActiveStyle',
    value: function setMouseCursorActiveStyle(style) {
      this.mouseCursorActiveStyle = style;
    }
  }, {
    key: 'setCursorVisibility',
    value: function setCursorVisibility(visibility) {
      var modes = ['visible', 'hidden', 'auto'];
      if (!modes.includes(visibility)) {
        console.warn('Unknown cursorVisibility: ' + visibility + ' expected', modes);
        return;
      }
      this.cursorVisibility = visibility;
    }
  }, {
    key: 'setCursorAutoDepth',
    value: function setCursorAutoDepth(flag) {
      this.cursorAutoDepth = flag;
    }
  }, {
    key: 'setCursorFixedDistance',
    value: function setCursorFixedDistance(distance) {
      this.cursorFixedDistance = distance;
    }
  }, {
    key: 'setRaycasters',
    value: function setRaycasters(raycasters) {
      if (!Array.isArray(raycasters)) {
        throw new Error('GuiSys raycasters must be an array of RayCaster objects');
      }
      this._raycasters = raycasters;
    }
  }, {
    key: 'getLastLocalIntersect',
    value: function getLastLocalIntersect() {
      if (this._cursor.lastLocalX === null || this._cursor.lastLocalY === null) {
        return null;
      }
      return [this._cursor.lastLocalX, this._cursor.lastLocalY];
    }
  }]);
  return GuiSys;
}();

var VG_MOVETO = 0;
var VG_LINETO = 1;
var VG_BEZIERTO = 2;

var VG_KAPPA90 = 0.5522847493;

function vgAddPoint(geom, pt) {
  var _geom$positions;

  (_geom$positions = geom.positions).push.apply(_geom$positions, toConsumableArray(pt));
  geom.positions.push(0);
}

function vgAddPointBorder(geom, ptA, ptB) {
  var _geom$positions2, _geom$positions3;

  (_geom$positions2 = geom.positions).push.apply(_geom$positions2, toConsumableArray(ptA));
  geom.positions.push(0);
  (_geom$positions3 = geom.positions).push.apply(_geom$positions3, toConsumableArray(ptB));
  geom.positions.push(0);
}

function vgTesselateBezier(geom, x1, y1, x2, y2, x3, y3, x4, y4, level) {
  if (level > 10) {
    return;
  }

  var x12 = (x1 + x2) * 0.5;
  var y12 = (y1 + y2) * 0.5;
  var x23 = (x2 + x3) * 0.5;
  var y23 = (y2 + y3) * 0.5;
  var x34 = (x3 + x4) * 0.5;
  var y34 = (y3 + y4) * 0.5;
  var x123 = (x12 + x23) * 0.5;
  var y123 = (y12 + y23) * 0.5;

  var dx = x4 - x1;
  var dy = y4 - y1;
  var d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx);
  var d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx);

  var magSqD = (dx * dx + dy * dy) * 0.0001;

  if (magSqD <= 0 || (d2 + d3) * (d2 + d3) < magSqD) {
    vgAddPoint(geom, [x4, y4]);
    return;
  }

  var x234 = (x23 + x34) * 0.5;
  var y234 = (y23 + y34) * 0.5;
  var x1234 = (x123 + x234) * 0.5;
  var y1234 = (y123 + y234) * 0.5;

  vgTesselateBezier(geom, x1, y1, x12, y12, x123, y123, x1234, y1234, level + 1);
  vgTesselateBezier(geom, x1234, y1234, x234, y234, x34, y34, x4, y4, level + 1);
}

function vgTesselateBezierBorder(geom, x1A, y1A, x2A, y2A, x3A, y3A, x4A, y4A, x1B, y1B, x2B, y2B, x3B, y3B, x4B, y4B, level) {
  if (level > 10) {
    return;
  }

  var x12A = (x1A + x2A) * 0.5;
  var y12A = (y1A + y2A) * 0.5;
  var x23A = (x2A + x3A) * 0.5;
  var y23A = (y2A + y3A) * 0.5;
  var x34A = (x3A + x4A) * 0.5;
  var y34A = (y3A + y4A) * 0.5;
  var x123A = (x12A + x23A) * 0.5;
  var y123A = (y12A + y23A) * 0.5;

  var dxA = x4A - x1A;
  var dyA = y4A - y1A;
  var d2A = Math.abs((x2A - x4A) * dyA - (y2A - y4A) * dxA);
  var d3A = Math.abs((x3A - x4A) * dyA - (y3A - y4A) * dxA);

  var magSqD = (dxA * dxA + dyA * dyA) * 0.0001;

  if (magSqD <= 0 || (d2A + d3A) * (d2A + d3A) < magSqD) {
    vgAddPoint(geom, [x4A, y4A]);
    vgAddPoint(geom, [x4B, y4B]);
    return;
  }

  var x234A = (x23A + x34A) * 0.5;
  var y234A = (y23A + y34A) * 0.5;
  var x1234A = (x123A + x234A) * 0.5;
  var y1234A = (y123A + y234A) * 0.5;

  var x12B = (x1B + x2B) * 0.5;
  var y12B = (y1B + y2B) * 0.5;
  var x23B = (x2B + x3B) * 0.5;
  var y23B = (y2B + y3B) * 0.5;
  var x34B = (x3B + x4B) * 0.5;
  var y34B = (y3B + y4B) * 0.5;
  var x123B = (x12B + x23B) * 0.5;
  var y123B = (y12B + y23B) * 0.5;

  var x234B = (x23B + x34B) * 0.5;
  var y234B = (y23B + y34B) * 0.5;
  var x1234B = (x123B + x234B) * 0.5;
  var y1234B = (y123B + y234B) * 0.5;

  vgTesselateBezierBorder(geom, x1A, y1A, x12A, y12A, x123A, y123A, x1234A, y1234A, x1B, y1B, x12B, y12B, x123B, y123B, x1234B, y1234B, level + 1);
  vgTesselateBezierBorder(geom, x1234A, y1234A, x234A, y234A, x34A, y34A, x4A, y4A, x1234B, y1234B, x234B, y234B, x34B, y34B, x4B, y4B, level + 1);
}

function vgFlattenPaths(commands, w, h) {
  var geom = { positions: [] };
  var i = 0;
  var p = void 0,
      last = void 0;
  var cp1 = void 0,
      cp2 = void 0;
  while (i < commands.length) {
    var cmd = commands[i];
    switch (cmd) {
      case VG_MOVETO:
        p = commands[i + 1];
        vgAddPoint(geom, p);
        i += 2;
        break;
      case VG_LINETO:
        p = commands[i + 1];
        vgAddPoint(geom, p);
        i += 2;
        break;
      case VG_BEZIERTO:
        last = geom.positions.length - 1 * 3;
        cp1 = commands[i + 1];
        cp2 = commands[i + 2];
        p = commands[i + 3];
        vgTesselateBezier(geom, geom.positions[last + 0], geom.positions[last + 1], cp1[0], cp1[1], cp2[0], cp2[1], p[0], p[1], 0);
        i += 4;
        break;
    }
  }
  if (geom.length > 1) {
    var last_pt = geom.positions.length - 1 * 3;
    var dx = geom.positions[last_pt + 0] - geom.positions[0];
    var dy = geom.positions[last_pt + 1] - geom.positions[1];
    var dist = dx * dx + dy * dy;
    if (dist < 0.001) {
      geom.length -= 1;
    }
  }

  var uvs = [];
  if (w > 0 && h > 0) {
    for (var _i = 0; _i < geom.positions.length; _i += 3) {
      uvs.push(geom.positions[_i + 0] / w + 0.5);
      uvs.push(geom.positions[_i + 1] / h + 0.5);
    }
  } else {
    for (var _i2 = 0; _i2 < geom.positions.length; _i2 += 3) {
      uvs.push(0);
      uvs.push(0);
    }
  }
  geom.uvs = uvs;
  return geom;
}

function vgFlattenPathsBorder(commands, w, h) {
  var geom = { positions: [] };
  var i = 0;
  var pA = void 0,
      lastA = void 0;
  var pB = void 0,
      lastB = void 0;
  var cp1A = void 0,
      cp2A = void 0;
  var cp1B = void 0,
      cp2B = void 0;
  while (i < commands.length) {
    var cmd = commands[i];
    switch (cmd) {
      case VG_MOVETO:
        pA = commands[i + 1];
        i += 2;
        pB = commands[i + 1];
        vgAddPointBorder(geom, pA, pB);
        i += 2;
        break;
      case VG_LINETO:
        pA = commands[i + 1];
        i += 2;
        pB = commands[i + 1];
        vgAddPointBorder(geom, pA, pB);
        i += 2;
        break;
      case VG_BEZIERTO:
        lastA = geom.positions.length - 2 * 3;
        lastB = geom.positions.length - 1 * 3;
        cp1A = commands[i + 1];
        cp2A = commands[i + 2];
        pA = commands[i + 3];
        i += 4;
        cp1B = commands[i + 1];
        cp2B = commands[i + 2];
        pB = commands[i + 3];
        vgTesselateBezierBorder(geom, geom.positions[lastA + 0], geom.positions[lastA + 1], cp1A[0], cp1A[1], cp2A[0], cp2A[1], pA[0], pA[1], geom.positions[lastB + 0], geom.positions[lastB + 1], cp1B[0], cp1B[1], cp2B[0], cp2B[1], pB[0], pB[1], 0);
        i += 4;
        break;
    }
  }

  var uvs = [];
  if (w > 0 && h > 0) {
    for (var _i3 = 0; _i3 < geom.positions.length; _i3 += 3) {
      uvs.push(geom.positions[_i3 + 0] / w + 0.5);
      uvs.push(geom.positions[_i3 + 1] / h + 0.5);
    }
  } else {
    for (var _i4 = 0; _i4 < geom.positions.length; _i4 += 3) {
      uvs.push(0);
      uvs.push(0);
    }
  }
  geom.uvs = uvs;
  return geom;
}

function vgRect(x, y, w, h) {
  var vals = [VG_MOVETO, [x, y], VG_LINETO, [x, y + h], VG_LINETO, [x + w, y + h], VG_LINETO, [x + w, y]];
  return vgFlattenPaths(vals, w, h);
}

function vgRoundedRectVarying(x, y, w, h, radBottomRight, radBottomLeft, radTopLeft, radTopRight) {
  if (radTopLeft < 0.001 && radTopRight < 0.001 && radBottomRight < 0.001 && radBottomLeft < 0.001) {
    return vgRect(x, y, w, h);
  } else {
    var halfw = Math.abs(w) * 0.5;
    var halfh = Math.abs(h) * 0.5;
    var rxBL = Math.min(radBottomLeft, halfw);
    var ryBL = Math.min(radBottomLeft, halfh);
    var rxBR = Math.min(radBottomRight, halfw);
    var ryBR = Math.min(radBottomRight, halfh);
    var rxTR = Math.min(radTopRight, halfw);
    var ryTR = Math.min(radTopRight, halfh);
    var rxTL = Math.min(radTopLeft, halfw);
    var ryTL = Math.min(radTopLeft, halfh);
    var vals = [VG_MOVETO, [x, y + ryTL], VG_LINETO, [x, y + h - ryBL], VG_BEZIERTO, [x, y + h - ryBL * (1 - VG_KAPPA90)], [x + rxBL * (1 - VG_KAPPA90), y + h], [x + rxBL, y + h], VG_LINETO, [x + w - rxBR, y + h], VG_BEZIERTO, [x + w - rxBR * (1 - VG_KAPPA90), y + h], [x + w, y + h - ryBR * (1 - VG_KAPPA90)], [x + w, y + h - ryBR], VG_LINETO, [x + w, y + ryTR], VG_BEZIERTO, [x + w, y + ryTR * (1 - VG_KAPPA90)], [x + w - rxTR * (1 - VG_KAPPA90), y], [x + w - rxTR, y], VG_LINETO, [x + rxTL, y], VG_BEZIERTO, [x + rxTL * (1 - VG_KAPPA90), y], [x, y + ryTL * (1 - VG_KAPPA90)], [x, y + ryTL]];
    return vgFlattenPaths(vals, w, h);
  }
}

function vgGenerateIndicesConvex(length) {
  var indices = [];
  for (var i = 2; i < length; i++) {
    indices.push(0);
    indices.push(i - 1);
    indices.push(i);
  }
  return indices;
}

function vgRoundedBorderRectVarying(baseX, baseY, width, height, borderLeft, borderBottom, borderRight, borderTop, radBottomRight, radBottomLeft, radTopLeft, radTopRight) {
  var x = Math.min(width, borderLeft);
  var w = Math.max(x, width - borderRight) - x;
  var y = Math.min(height, borderTop);
  var h = Math.max(y, height - borderBottom) - y;
  if (radTopLeft < 0.001 && radTopRight < 0.001 && radBottomRight < 0.001 && radBottomLeft < 0.001) {
    var vals = [VG_MOVETO, [baseX, baseY], VG_MOVETO, [baseX + x, baseY + y], VG_LINETO, [baseX, baseY + height], VG_LINETO, [baseX + x, baseY + y + h], VG_LINETO, [baseX + width, baseY + height], VG_LINETO, [baseX + x + w, baseY + y + h], VG_LINETO, [baseX + width, baseY], VG_LINETO, [baseX + x + w, baseY + y]];
    return vgFlattenPathsBorder(vals);
  } else {
    var halfWidth = width * 0.5;
    var halfHeight = height * 0.5;
    var halfW = w * 0.5;
    var halfH = h * 0.5;
    var rxBLOuter = Math.min(radBottomLeft, halfWidth);
    var ryBLOuter = Math.min(radBottomLeft, halfHeight);
    var rxBROuter = Math.min(radBottomRight, halfWidth);
    var ryBROuter = Math.min(radBottomRight, halfHeight);
    var rxTROuter = Math.min(radTopRight, halfWidth);
    var ryTROuter = Math.min(radTopRight, halfHeight);
    var rxTLOuter = Math.min(radTopLeft, halfWidth);
    var ryTLOuter = Math.min(radTopLeft, halfHeight);
    var rxBLInner = Math.min(radBottomLeft, halfW);
    var ryBLInner = Math.min(radBottomLeft, halfH);
    var rxBRInner = Math.min(radBottomRight, halfW);
    var ryBRInner = Math.min(radBottomRight, halfH);
    var rxTRInner = Math.min(radTopRight, halfW);
    var ryTRInner = Math.min(radTopRight, halfH);
    var rxTLInner = Math.min(radTopLeft, halfW);
    var ryTLInner = Math.min(radTopLeft, halfH);

    var _vals = [VG_MOVETO, [baseX, baseY + ryTLOuter], VG_MOVETO, [baseX + x, baseY + y + ryTLInner], VG_LINETO, [baseX, baseY + height - ryBLOuter], VG_LINETO, [baseX + x, baseY + y + h - ryBLInner], VG_BEZIERTO, [baseX, baseY + height - ryBLOuter * (1 - VG_KAPPA90)], [baseX + rxBLOuter * (1 - VG_KAPPA90), baseY + height], [baseX + rxBLOuter, baseY + height], VG_BEZIERTO, [baseX + x, baseY + y + h - ryBLInner * (1 - VG_KAPPA90)], [baseX + x + rxBLInner * (1 - VG_KAPPA90), baseY + y + h], [baseX + x + rxBLInner, baseY + y + h], VG_LINETO, [baseX + width - rxBROuter, baseY + height], VG_LINETO, [baseX + x + w - rxBRInner, baseY + y + h], VG_BEZIERTO, [baseX + width - rxBROuter * (1 - VG_KAPPA90), baseY + height], [baseX + width, baseY + height - ryBROuter * (1 - VG_KAPPA90)], [baseX + width, baseY + height - ryBROuter], VG_BEZIERTO, [baseX + x + w - rxBRInner * (1 - VG_KAPPA90), baseY + y + h], [baseX + x + w, baseY + y + h - ryBRInner * (1 - VG_KAPPA90)], [baseX + x + w, baseY + y + h - ryBRInner], VG_LINETO, [baseX + width, baseY + ryTROuter], VG_LINETO, [baseX + x + w, baseY + y + ryTRInner], VG_BEZIERTO, [baseX + width, baseY + ryTROuter * (1 - VG_KAPPA90)], [baseX + width - rxTROuter * (1 - VG_KAPPA90), baseY], [baseX + width - rxTROuter, baseY], VG_BEZIERTO, [baseX + x + w, baseY + y + ryTRInner * (1 - VG_KAPPA90)], [baseX + x + w - rxTRInner * (1 - VG_KAPPA90), baseY + y], [baseX + x + w - rxTRInner, baseY + y], VG_LINETO, [baseX + rxTLOuter, baseY], VG_LINETO, [baseX + x + rxTLInner, baseY + y], VG_BEZIERTO, [baseX + rxTLOuter * (1 - VG_KAPPA90), baseY], [baseX, baseY + ryTLOuter * (1 - VG_KAPPA90)], [baseX, baseY + ryTLOuter], VG_BEZIERTO, [baseX + x + rxTLInner * (1 - VG_KAPPA90), baseY + y], [baseX + x, baseY + y + ryTLInner * (1 - VG_KAPPA90)], [baseX + x, baseY + y + ryTLInner]];
    return vgFlattenPathsBorder(_vals);
  }
}

function vgGenerateIndicesBorder(offset, length) {
  var indices = [];
  for (var i = 0; i < length; i += 2) {
    var nexti = (i + 2) % length;
    indices.push(i + offset);
    indices.push(nexti + offset);
    indices.push(i + 1 + offset);
    indices.push(i + 1 + offset);
    indices.push(nexti + offset);
    indices.push(nexti + 1 + offset);
  }
  return indices;
}

function VectorGeometry(dims, borderWidth, borderRadius, backgroundIndex, foregroundIndex, borderIndex) {
  THREE.BufferGeometry.apply(this);

  dims = dims || [1, 1];

  var geom = vgRoundedRectVarying(-dims[0] * 0.5, -dims[1] * 0.5, dims[0], dims[1], borderRadius[0], borderRadius[1], borderRadius[2], borderRadius[3]);
  var indices = vgGenerateIndicesConvex(geom.positions.length / 3);
  var baseIndices = indices.length;
  if (borderWidth) {
    var borderGeom = vgRoundedBorderRectVarying(-dims[0] * 0.5, -dims[1] * 0.5, dims[0], dims[1], borderWidth[0], borderWidth[1], borderWidth[2], borderWidth[3], borderRadius[0], borderRadius[1], borderRadius[2], borderRadius[3]);
    var borderIndices = vgGenerateIndicesBorder(geom.positions.length / 3, borderGeom.positions.length / 3);
    geom.positions = geom.positions.concat(borderGeom.positions);
    geom.uvs = geom.uvs.concat(borderGeom.uvs);
    indices = indices.concat(borderIndices);
  }

  this.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geom.positions), 3));
  this.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geom.uvs), 2));
  this.addGroup(0, baseIndices, backgroundIndex);
  this.addGroup(0, baseIndices, foregroundIndex);
  if (borderWidth) {
    this.addGroup(baseIndices, indices.length - baseIndices, borderIndex);
  }
  this.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
  this.needsUpdate = true;
  this.computeBoundingSphere();
}

VectorGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
VectorGeometry.prototype.constructor = VectorGeometry;

var DEFAULT_Z_OFFSET = 1;

var BACKGROUND_MAT_INDEX = 0;
var BORDER_MAT_INDEX = 1;
var IMAGE_MAT_INDEX = 2;

var DEFAULT_BACKGROUND_COLOR = 0xffffff;
var DEFAULT_BORDER_COLOR = 0x000000;
var DEFAULT_IMAGE_COLOR = 0xffffff;

var AnimationFunctions = {
  spring: function spring(dt) {
    return 1 + Math.pow(2, -10 * dt) * Math.sin((dt - 0.5 / 4) * Math.PI * 2 / 0.5);
  },
  linear: function linear(dt) {
    return dt;
  },
  easeInEaseOut: function easeInEaseOut(dt) {
    return dt < 0.5 ? 2 * dt * dt : -1 + (4 - 2 * dt) * dt;
  },
  easeIn: function easeIn(dt) {
    return dt * dt;
  },
  easeOut: function easeOut(dt) {
    return dt * (2 - dt);
  },
  keyboard: function keyboard(dt) {
    return dt;
  }
};

function UIView(guiSys, params) {
  THREE.Object3D.call(this);

  this.type = 'UIView';
  this.clippingEnabled = false;
  this.clipPlanes = [new THREE.Plane(new THREE.Vector3(1, 0, 0), 16384), new THREE.Plane(new THREE.Vector3(-1, 0, 0), 16384), new THREE.Plane(new THREE.Vector3(0, 1, 0), 16384), new THREE.Plane(new THREE.Vector3(0, -1, 0), 16384)];

  this.geometry = new THREE.PlaneGeometry(0, 0);
  this.backgroundMaterial = new THREE.MeshBasicMaterial({
    clippingPlanes: this.clipPlanes,
    color: DEFAULT_BACKGROUND_COLOR,
    side: THREE.DoubleSide
  });
  this.backgroundMaterial.transparent = true;
  this.backgroundMaterial.visible = false;
  this.backgroundMaterial.depthWrite = false;

  this.borderMaterial = new THREE.MeshBasicMaterial({
    clippingPlanes: this.clipPlanes,
    color: DEFAULT_BORDER_COLOR,
    side: THREE.DoubleSide
  });
  this.borderMaterial.transparent = true;
  this.borderMaterial.visible = false;
  this.borderMaterial.depthWrite = false;
  this.imageMaterial = new THREE.MeshBasicMaterial({
    clippingPlanes: this.clipPlanes,
    color: DEFAULT_IMAGE_COLOR,
    side: THREE.DoubleSide
  });
  this.imageMaterial.transparent = true;
  this.imageMaterial.visible = false;
  this.imageMaterial.depthWrite = false;
  this.material = [this.backgroundMaterial, this.borderMaterial, this.imageMaterial];
  this.material.side = THREE.DoubleSide;
  this.guiSys = guiSys;
  this.zIndex = 0;

  this.drawMode = THREE.TrianglesDrawMode;

  this.opacity = 1.0;
  this.dirtyGeometry = true;
  this.frame = [0, 0, 0, 0];
  this.targetFrame = [0, 0, 0, 0];
  this.frameDirty = true;
  this.inset = [0, 0, 0, 0];
  this.insetSize = [0, 0, 0, 0];

  this.hitSlop = [0, 0, 0, 0];
  this.cursorVisibilitySlop = [0, 0, 0, 0];
  this.borderWidth = [0, 0, 0, 0];
  this.borderRadius = [0, 0, 0, 0];
  this.scaleType = defaultScaleType();
  this.textureDim = [0, 0];

  this.crop = [0, 0, 1, 1];
  this.backgroundOpacity = 1;
  this.borderOpacity = 1;
  this.imageOpacity = 1;
  this.matrixAutoUpdate = false;
  this.localRotate = new THREE.Matrix4();
  this.localPosition = [0, 0, 0];

  this.layoutZOffset = DEFAULT_Z_OFFSET;

  this.text = null;
  this.textDirty = false;
  this.textHAlign = CENTER_LINE;
  this.textLinecount = 0;
  this.textVAlign = CENTER;
  this.textColor = new THREE.Color();
  this.textSize = 2;
  this.textMesh = new THREE.Mesh(new THREE.BufferGeometry(), guiSys.font.material);
  this.textMesh.type = 'SDFText';
  this.textMesh.textClip = [-16384, -16384, 16384, 16384];
  this.textMesh.visible = false;
  this.textMesh.onBeforeRender = function (renderer, scene, camera, geometry, material, group) {
    if (geometry && geometry.isSDFText) {
      geometry.onBeforeRender(this, material);
    }
  };
  this.textFontParms = {
    AlphaCenter: 0.47,
    ColorCenter: 0.5
  };

  this.autoScale = false;

  this.isInteractable = false;

  this.isMouseInteractable = false;

  this.pointerEvents = PointerEvents.AUTO;

  this.billboarding = 'off';

  this.immediateListener = null;

  if (params !== undefined) {
    setParams(this, params);
  }

  this.textMesh.raycast = function () {};
  this.add(this.textMesh);
}

UIView.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
  constructor: UIView,

  isMesh: true,

  isGui: true,

  updateGeometry: function (updateContext) {
    var transform = new THREE.Matrix4();
    var config = {
      frame: [0, 0, 0, 0]
    };
    return function (updateContext) {
      if (!this.dirtyGeometry) {
        return;
      }

      if (this.text) {
        if (this.textDirty) {
          if (this.autoScale) {
            config.dim = measureText(this.guiSys.font, this.text, this.textSize);
            this.frame[2] = config.dim.maxWidth;
            this.frame[3] = config.dim.maxHeight;
          }
          config.frame[0] = -this.frame[2] / 2;
          config.frame[1] = -this.frame[3] / 2;
          config.frame[2] = this.frame[2];
          config.frame[3] = this.frame[3];
          config.hAlign = this.textHAlign;
          config.vAlign = this.textVAlign;
          config.lineCount = this.textLinecount;
          config.fontParms = this.textFontParms;
          config.autoScale = this.autoScale;
          this.textMesh.geometry.dispose();
          this.textMesh.geometry = new BitmapFontGeometry(this.guiSys.font, this.text, this.textSize, config);
          this.textMesh.visible = !!this.textMesh.geometry;
          this.textMesh.material = this.textMesh.geometry.materials;
          this.textMesh.position.z = 0.01;
          this.textDirty = false;
        }
      } else {
        this.textMesh.geometry.dispose();
        this.textMesh.visible = false;
        this.textDirty = false;
      }

      var x = this.frame[0] + this.frame[2] / 2;
      var y = this.frame[1] - this.frame[3] / 2;
      var z = this.layoutZOffset * this.guiSys.ZOffsetScale;
      if (this.parent && this.parent.frame) {
        x -= this.parent.frame[2] / 2;
        y += this.parent.frame[3] / 2;
      }

      if (this.localTransform) {
        this.matrix.fromArray(this.localTransform);
        this.matrix.elements[12] += x;
        this.matrix.elements[13] += y;
        this.matrix.elements[14] += z;
      } else {
        transform.makeTranslation(x + this.localPosition[0], y + this.localPosition[1], z + this.localPosition[2]);
        this.matrix.multiplyMatrices(transform, this.localRotate);
      }

      if (this.frameDirty) {
        this.geometry.dispose();
        this.geometry = new VectorGeometry([this.frame[2], this.frame[3]], this.borderMaterial.visible ? this.borderWidth : undefined, this.borderRadius, BACKGROUND_MAT_INDEX, IMAGE_MAT_INDEX, BORDER_MAT_INDEX);
        this.needsUpdate = true;
        this.frameDirty = false;
      }
      this.dirtyGeometry = false;
    };
  }(),

  updateBillboard: function (updateContext) {
    var thisPosition = new THREE.Vector3();
    var camPosition = new THREE.Vector3();
    var camAxisX = new THREE.Vector3();
    var camAxisY = new THREE.Vector3();
    var camAxisZ = new THREE.Vector3();
    var newAxisX = new THREE.Vector3();
    var newAxisY = new THREE.Vector3();
    var newAxisZ = new THREE.Vector3();
    var up = new THREE.Vector3(0, 1, 0);
    var rotationMatrix = new THREE.Matrix4();
    var parentMatrixWorldInverse = new THREE.Matrix4();
    var parentRotationInverse = new THREE.Matrix4();

    return function (updateContext) {
      var camMatrixWorld = updateContext.camera.matrixWorld;
      thisPosition.setFromMatrixPosition(this.matrixWorld);
      camPosition.setFromMatrixPosition(camMatrixWorld);
      camMatrixWorld.extractBasis(camAxisX, camAxisY, camAxisZ);

      newAxisY.copy(up);

      newAxisZ.copy(camAxisZ);
      newAxisZ.y = 0;
      newAxisZ.normalize();

      newAxisX.crossVectors(newAxisY, newAxisZ).normalize();

      rotationMatrix.identity();
      var e = rotationMatrix.elements;
      e[0] = newAxisX.x;
      e[4] = newAxisY.x;
      e[8] = newAxisZ.x;
      e[1] = newAxisX.y;
      e[5] = newAxisY.y;
      e[9] = newAxisZ.y;
      e[2] = newAxisX.z;
      e[6] = newAxisY.z;
      e[10] = newAxisZ.z;

      if (this.parent) {
        parentMatrixWorldInverse.getInverse(this.parent.matrixWorld);
        parentRotationInverse.extractRotation(parentMatrixWorldInverse);
        rotationMatrix.multiply(parentRotationInverse);
      }

      this.matrix.extractRotation(rotationMatrix);
    };
  }(),

  applyUpdates: function applyUpdates(opacity, updateContext) {
    this.updateGeometry(updateContext);
    this.backgroundMaterial.opacity = opacity * this.backgroundOpacity;
    this.borderMaterial.opacity = opacity * this.borderOpacity;
    this.imageMaterial.opacity = opacity * this.imageOpacity;
    this.textMesh.opacity = opacity;
  },

  setFrame: function setFrame(x, y, width, height, animator) {
    if (x === this.targetFrame[0] && y === this.targetFrame[1] && width === this.targetFrame[2] && height === this.targetFrame[3]) {
      return;
    }
    this.targetFrame[0] = x;
    this.targetFrame[1] = y;
    this.targetFrame[2] = width;
    this.targetFrame[3] = height;
    if (animator) {
      var self = this;
      var startFrame = [this.frame[0], this.frame[1], this.frame[2], this.frame[3]];
      var startTime = Date.now();
      var animState = this.frame[2] === 0 && this.frame[3] === 0 && animator.create ? animator.create : animator.update;

      var frameAnimation = function frameAnimation(curTime) {
        var deltaTime = curTime - startTime;
        var dt = animState ? AnimationFunctions[animState.type](Math.min(1, deltaTime / animator.duration)) : 1;
        var omdt = 1 - dt;
        self.frame[0] = startFrame[0] * omdt + x * dt;
        self.frame[1] = startFrame[1] * omdt + y * dt;
        self.frame[2] = startFrame[2] * omdt + width * dt;
        self.frame[3] = startFrame[3] * omdt + height * dt;
        self.dirtyGeometry = true;
        self.frameDirty = true;
        if (deltaTime < animator.duration && animState) {
          self.animatorHandle = self.guiSys.requestFrameFunction(frameAnimation);
        } else {
          self.animatorHandle = null;
        }
      };

      this.guiSys.cancelFrameFunction(self.animatorHandle);
      frameAnimation(startTime);
    } else {
      this.frame[0] = x;
      this.frame[1] = y;
      this.frame[2] = width;
      this.frame[3] = height;
      this.dirtyGeometry = true;
      this.frameDirty = true;
    }
  },

  setHitSlop: function setHitSlop(l, t, r, b) {
    this.hitSlop[0] = l;
    this.hitSlop[1] = t;
    this.hitSlop[2] = r;
    this.hitSlop[3] = b;
  },

  setCursorVisibilitySlop: function setCursorVisibilitySlop(l, t, r, b) {
    this.cursorVisibilitySlop[0] = l;
    this.cursorVisibilitySlop[1] = t;
    this.cursorVisibilitySlop[2] = r;
    this.cursorVisibilitySlop[3] = b;
  },

  setLayoutZOffset: function setLayoutZOffset(offset) {
    this.layoutZOffset = offset;
    this.dirtyGeometry = true;
  },

  setLocalTransform: function setLocalTransform(transform) {
    this.localTransform = transform.slice();
    this.dirtyGeometry = true;
  },

  setLocalRotation: function setLocalRotation(quatOrEuler) {
    if (quatOrEuler.isEuler) {
      this.localRotate.makeRotationFromEuler(quatOrEuler);
    } else {
      this.localRotate.makeRotationFromQuaternion(quatOrEuler);
    }
    this.localTransform = undefined;
    this.dirtyGeometry = true;
  },

  setLocalPosition: function setLocalPosition(position) {
    this.localTransform = undefined;
    this.localPosition[0] = position[0];
    this.localPosition[1] = position[1];
    this.localPosition[2] = position[2];
    this.dirtyGeometry = true;
  },

  setImage: function setImage(url, loaded, invisibleTillLoad) {
    var _this = this;

    if (url) {
      if (this.imageMaterial.mapurl === url) {
        loaded && loaded(true, this.imageMaterial.map.naturalWidth, this.imageMaterial.map.naturalHeight);
        return;
      }

      delete this.imageMaterial.mapurl;

      var loader = new THREE.TextureLoader();
      loader.setCrossOrigin('Access-Control-Allow-Origin');
      loader.load(url, function (texture) {
        _this.imageMaterial.map = texture;
        _this.imageMaterial.mapurl = url;

        _this.updateOffsetRepeat();
        _this.imageMaterial.visible = true;
        _this.imageMaterial.needsUpdate = true;
        loaded && loaded(true, texture.image.naturalWidth, texture.image.naturalHeight);
      }, function (xhr) {}, function (xhr) {
        _this.imageMaterial.map && _this.imageMaterial.map.dispose();
        _this.imageMaterial.map = undefined;
        loaded && loaded(false);
      });
      this.imageMaterial.visible = !!invisibleTillLoad;
    } else {
      this.imageMaterial.map && this.imageMaterial.map.dispose();
      this.imageMaterial.map = undefined;
      this.imageMaterial.visible = false;
      loaded && loaded(false);
    }
    this.imageMaterial.needsUpdate = true;
  },

  setImageTexture: function setImageTexture(texture) {
    if (!texture) {
      if (this.imageMaterial.mapurl) {
        this.imageMaterial.map && this.imageMaterial.map.dispose();

        delete this.imageMaterial.mapurl;
      }

      delete this.imageMaterial.map;

      this.imageMaterial.visible = false;
    } else if (texture instanceof THREE.Texture || texture.isWebGLRenderTarget) {
      delete this.imageMaterial.mapurl;

      this.imageMaterial.map = texture;

      this.updateOffsetRepeat();

      this.imageMaterial.visible = true;
    } else {
      throw new Error('Image textures must be of type THREE.Texture');
    }

    this.imageMaterial.needsUpdate = true;
  },

  setClipPlanes: function setClipPlanes(rect) {
    this.clipPlanes[0].setComponents(1, 0, 0, -rect[0]);
    this.clipPlanes[1].setComponents(-1, 0, 0, rect[2]);
    this.clipPlanes[2].setComponents(0, 1, 0, -rect[1]);
    this.clipPlanes[3].setComponents(0, -1, 0, rect[3]);
  },

  setImageColor: function setImageColor() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args[0] == null) {
      this.imageOpacity = 1.0;
      this.imageMaterial.color.set(DEFAULT_IMAGE_COLOR);
    } else {
      this.imageOpacity = typeof args[0] === 'number' ? (args[0] >> 24 & 0xff) / 255.0 : 1.0;
      this.imageMaterial.color.set.apply(this.imageMaterial.color, args);
    }
    this.imageMaterial.needsUpdate = true;
  },

  setBackgroundColor: function setBackgroundColor() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (args[0] == null) {
      this.backgroundOpacity = 1.0;
      this.backgroundMaterial.color.set(DEFAULT_BACKGROUND_COLOR);
      this.backgroundMaterial.visible = false;
    } else {
      this.backgroundOpacity = typeof args[0] === 'number' ? (args[0] >> 24 & 0xff) / 255.0 : 1.0;
      this.backgroundMaterial.color.set.apply(this.backgroundMaterial.color, args);
      this.backgroundMaterial.visible = true;
    }
    this.backgroundMaterial.needsUpdate = true;
  },

  setBorderColor: function setBorderColor() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    if (args[0] == null) {
      this.borderOpacity = 1.0;
      this.borderMaterial.color.set(DEFAULT_BORDER_COLOR);
    } else {
      this.borderOpacity = typeof args[0] === 'number' ? (args[0] >> 24 & 0xff) / 255.0 : 1.0;
      this.borderMaterial.color.set.apply(this.borderMaterial.color, arguments);
    }
    this.borderMaterial.needsUpdate = true;
  },

  setInset: function setInset(inset) {
    this.inset = inset.slice();
    this.dirtyGeometry = true;
  },

  setInsetSize: function setInsetSize(insetSize) {
    this.insetSize = insetSize.slice();
    this.dirtyGeometry = true;
  },

  setBorderWidth: function setBorderWidth(width) {
    var newValue = void 0;
    if (typeof width === 'number') {
      newValue = [width, width, width, width];
    } else {
      newValue = width;
    }
    if (newValue[0] !== this.borderWidth[0] || newValue[1] !== this.borderWidth[1] || newValue[2] !== this.borderWidth[2] || newValue[3] !== this.borderWidth[3]) {
      this.borderWidth = newValue.slice();
      this.borderMaterial.visible = newValue[0] > 0 || newValue[1] > 0 || newValue[2] > 0 || newValue[3] > 0;
      this.frameDirty = true;
      this.dirtyGeometry = true;
    }
  },

  setBorderRadius: function setBorderRadius(borderRadius) {
    for (var i = 0; i < 4; i++) {
      if (this.borderRadius[i] !== borderRadius[i]) {
        this.borderRadius[i] = borderRadius[i];
        this.frameDirty = true;
        this.dirtyGeometry = true;
      }
    }
  },

  setResizeMode: function setResizeMode(resizeModeValue) {
    var scaleType = resizeModetoScaleType(resizeModeValue);
    if (this.scaleType !== scaleType) {
      this.scaleType = scaleType;
      this.frameDirty = true;
      this.dirtyGeometry = true;
    }
  },

  setTextureCrop: function setTextureCrop(crop) {
    this.crop = crop.slice();
    this.updateOffsetRepeat();
  },

  updateOffsetRepeat: function updateOffsetRepeat() {
    if (!this.imageMaterial.map) {
      return;
    }

    var offset = new THREE.Vector2(this.crop[0], 1 - (this.crop[1] + this.crop[3]));
    var repeat = new THREE.Vector2(this.crop[2], this.crop[3]);
    if (this.imageMaterial.map.offset === offset && this.imageMaterial.map.repeat === repeat) {
      return;
    }

    this.imageMaterial.map.offset = offset;
    this.imageMaterial.map.repeat = repeat;
    this.imageMaterial.needsUpdate = true;

    var width = this.imageMaterial.map.image ? this.imageMaterial.map.image.width : 0;
    var height = this.imageMaterial.map.image ? this.imageMaterial.map.image.height : 0;
    if (width !== this.textureDim[0] || height !== this.textureDim[0]) {
      this.textureDim = [width, height];
      this.frameDirty = true;
      this.dirtyGeometry = true;
    }
  },

  setOpacity: function setOpacity(value) {
    this.opacity = value;
    this.visible = value > 0;
  },

  setAlphaTest: function setAlphaTest(value) {
    this.imageMaterial.alphaTest = value;
    this.imageMaterial.needsUpdate = true;
  },

  setText: function setText(text) {
    this.text = text;
    this.textDirty = true;
    this.dirtyGeometry = true;
  },

  setTextAlphaCenter: function setTextAlphaCenter(alphaCenter) {
    this.textFontParms.AlphaCenter = alphaCenter;
    this.dirtyGeometry = true;
  },

  setTextColor: function setTextColor(value) {
    this.textColor.set(value);
  },

  setTextColorCenter: function setTextColorCenter(colorCenter) {
    this.textFontParms.ColorCenter = colorCenter;
    this.dirtyGeometry = true;
  },

  setTextHAlign: function setTextHAlign(textAlign) {
    this.textDirty = true;
    this.textHAlign = textAlign;
    this.dirtyGeometry = true;
  },

  setTextLinecount: function setTextLinecount(count) {
    this.textDirty = true;
    this.textLinecount = count;
    this.dirtyGeometry = true;
  },

  setTextSize: function setTextSize(textSize) {
    this.textDirty = true;
    this.textSize = textSize;
    this.dirtyGeometry = true;
  },

  setTextVAlign: function setTextVAlign(textAlign) {
    this.textDirty = true;
    this.textVAlign = textAlign;
    this.dirtyGeometry = true;
  },

  setAutoScale: function setAutoScale(autoScale) {
    this.autoScale = autoScale;
  },

  setIsInteractable: function setIsInteractable(isInteractable) {
    this.isInteractable = isInteractable;
  },

  setIsMouseInteractable: function setIsMouseInteractable(isMouseInteractable) {
    this.isMouseInteractable = isMouseInteractable;
  },

  setPointerEvents: function setPointerEvents(pointerEvents) {
    this.pointerEvents = pointerEvents;
  },

  setBillboarding: function setBillboarding(billboarding) {
    this.billboarding = billboarding;
  },

  calcWorldClipRect: function calcWorldClipRect() {
    if (!this.clippingEnabled) {
      return [0, 0, 16384, 16384];
    }
    return [this.matrixWorld.elements[12] - this.frame[2] / 2, this.matrixWorld.elements[13] - this.frame[3] / 2, this.matrixWorld.elements[12] + this.frame[2] / 2, this.matrixWorld.elements[13] + this.frame[3] / 2];
  },

  setImmediateListener: function setImmediateListener(listener) {
    this.immediateListener = listener;
  },

  shouldAcceptHitEvent: function shouldAcceptHitEvent() {
    return !(this.pointerEvents === PointerEvents.NONE || this.pointerEvents === PointerEvents.BOX_NONE);
  },

  shouldInterceptHitEvent: function shouldInterceptHitEvent() {
    return this.pointerEvents === PointerEvents.NONE || this.pointerEvents === PointerEvents.BOX_ONLY;
  },

  forceRaycastTest: function forceRaycastTest(enabled) {
    this.forceRaycastTestEnabled = enabled;
  },

  raycast: function () {
    var inverseMatrix = new THREE.Matrix4();
    var ray = new THREE.Ray();

    var vTL = new THREE.Vector3();
    var vTR = new THREE.Vector3();
    var vBL = new THREE.Vector3();
    var vBR = new THREE.Vector3();

    function intersectRectangle(frame, slop) {
      var xMin = -frame[2] / 2 - slop[0];
      var yMin = -frame[3] / 2 - slop[3];
      var xMax = frame[2] / 2 + slop[2];
      var yMax = frame[3] / 2 + slop[1];
      vTL.fromArray([xMin, yMax, 0]);
      vTR.fromArray([xMax, yMax, 0]);
      vBL.fromArray([xMin, yMin, 0]);
      vBR.fromArray([xMax, yMin, 0]);

      var intersect = ray.intersectTriangle(vTL, vTR, vBR, false, intersectionPoint);
      intersect = intersect || ray.intersectTriangle(vTL, vBR, vBL, false, intersectionPoint);
      if (intersect) {
        var width = xMax - xMin;
        var height = yMax - yMin;

        intersectionNormalized.set((intersectionPoint.x + width / 2) / width, (-intersectionPoint.y + height / 2) / height, 0);
      }
      return intersect;
    }

    var intersectionNormalized = new THREE.Vector3();
    var intersectionPoint = new THREE.Vector3();
    var intersectionPointWorld = new THREE.Vector3();

    return function raycast(raycaster, intersects) {
      var material = this.material;

      if (!this.forceRaycastTestEnabled) {
        if (material === undefined) return;

        if (this.backgroundMaterial.opacity < 1 / 255 && this.borderMaterial.opacity < 1 / 255 && this.imageMaterial.opacity < 1 / 255) return;

        if (!this.backgroundMaterial.visible && !this.borderMaterial.visible && !this.imageMaterial.visible) return;
      }

      inverseMatrix.getInverse(this.matrixWorld);
      ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

      var intersect = intersectRectangle(this.frame, this.hitSlop);
      var isAlmostHit = false;
      if (!intersect) {
        var needsUpdate = this.cursorVisibilitySlop[0] > this.hitSlop[0] || this.cursorVisibilitySlop[1] > this.hitSlop[1] || this.cursorVisibilitySlop[2] > this.hitSlop[2] || this.cursorVisibilitySlop[3] > this.hitSlop[3];
        if (this.guiSys.cursorVisibility === 'auto' && needsUpdate) {
          intersect = intersectRectangle(this.frame, this.cursorVisibilitySlop);
        }
        if (!intersect) {
          return;
        }
        isAlmostHit = true;
      }

      intersectionPointWorld.copy(intersect);
      intersectionPointWorld.applyMatrix4(this.matrixWorld);

      var distance = raycaster.ray.origin.distanceTo(intersectionPointWorld);

      if (distance < raycaster.near || distance > raycaster.far) return;

      intersects.push({
        distance: distance,
        point: intersectionPointWorld.clone(),
        object: this,
        isAlmostHit: isAlmostHit,
        uv: intersectionNormalized.clone()
      });
    };
  }(),


  clone: function clone() {
    return new this.constructor(this.material).copy(this);
  },

  dispose: function dispose() {
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
  }
});

var isChrome = !!window.chrome;
var isFirefox = !!window.sidebar;
var isEdge = !!navigator.msLaunchUri;

var visibilityEvent = 'hidden' in document ? 'visibilitychange' : 'webkitvisibilitychange';

function attemptOculusPlayer() {
  var url = 'ovrweb:' + window.location.toString();
  return new Promise(function (resolve, reject) {
    if (isEdge && typeof navigator.msLaunchUri === 'function') {
      navigator.msLaunchUri(url, function () {
        resolve();
      }, function () {
        reject();
      });
    } else if (isFirefox) {
      var iframe = document.createElement('iframe');
      iframe.src = 'about:blank';
      iframe.style.display = 'none';
      if (document.body) {
        document.body.appendChild(iframe);
      }
      var success = false;
      try {
        iframe.contentWindow.location = url;
        success = true;
      } catch (e) {
        reject();
      }
      if (success) {
        resolve();
      }
    } else if (isChrome) {
      var topNode = window;

      while (topNode !== topNode.parent) {
        topNode = topNode.parent;
      }
      var timeout = setTimeout(function () {
        topNode.removeEventListener('blur', blurHandler);
        document.removeEventListener(visibilityEvent, blurHandler);
        reject();
      }, 2000);
      var blurHandler = function blurHandler(e) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        topNode.removeEventListener('blur', blurHandler);
        document.removeEventListener(visibilityEvent, blurHandler);
        resolve();
      };

      topNode.addEventListener('blur', blurHandler);
      document.addEventListener(visibilityEvent, blurHandler);
      window.location = url;
    } else {
      reject();
    }
  });
}

function setStyles(node, styles) {
  for (var property in styles) {
    var destination = property;

    if (!node.style.hasOwnProperty(destination)) {
      var uppercase = destination[0].toUpperCase() + destination.substr(1);
      if (node.style.hasOwnProperty('moz' + uppercase)) {
        destination = 'moz' + uppercase;
      } else if (node.style.hasOwnProperty('webkit' + uppercase)) {
        destination = 'webkit' + uppercase;
      }
    }
    node.style[destination] = styles[property];
  }
}

var SVG_NS = 'http://www.w3.org/2000/svg';

var GYRO_PATHS = ['M30,60 C46.5685425,60 60,46.5685425 60,30 C60,13.4314575 46.5685425,0 30,0 C13.4314575,0 0,13.4314575 0,30 C0,46.5685425 13.4314575,60 30,60 Z M30,56 C44.3594035,56 56,44.3594035 56,30 C56,15.6405965 44.3594035,4 30,4 C15.6405965,4 4,15.6405965 4,30 C4,44.3594035 15.6405965,56 30,56 Z', 'M30,56 C38.2842712,56 45,44.3594035 45,30 C45,15.6405965 38.2842712,4 30,4 C21.7157288,4 15,15.6405965 15,30 C15,44.3594035 21.7157288,56 30,56 Z M30,52 C36.0751322,52 41,42.1502645 41,30 C41,17.8497355 36.0751322,8 30,8 C23.9248678,8 19,17.8497355 19,30 C19,42.1502645 23.9248678,52 30,52 Z', 'M30,42 C44.3594035,42 56,36.627417 56,30 C56,23.372583 44.3594035,18 30,18 C15.6405965,18 4,23.372583 4,30 C4,36.627417 15.6405965,42 30,42 Z M30,38 C42.1502645,38 52,34.418278 52,30 C52,25.581722 42.1502645,22 30,22 C17.8497355,22 8,25.581722 8,30 C8,34.418278 17.8497355,38 30,38 Z'];

var FULLSCREEN_PATHS = ['M0,20 L0,0 L20,0 L20,10 L10,10 L10,20 Z', 'M40,0 L60,0 L60,20 L50,20 L50,10 L40,10 Z', 'M60,40 L60,60 L40,60 L40,50 L50,50 L50,40 Z', 'M20,60 L0,60 L0,40 L10,40 L10,50 L20,50 Z'];

var COMPASS_PATHS = ['M30,60 C46.5685425,60 60,46.5685425 60,30 C60,13.4314575 46.5685425,0 30,0 C13.4314575,0 0,13.4314575 0,30 C0,46.5685425 13.4314575,60 30,60 Z M30,58 C45.463973,58 58,45.463973 58,30 C58,14.536027 45.463973,2 30,2 C14.536027,2 2,14.536027 2,30 C2,45.463973 14.536027,58 30,58 Z', 'M42.7174074,12.0460131 C39.1265957,9.49790578 34.7382252,8 30,8 C25.2617748,8 20.8734043,9.49790578 17.2825926,12.0460131 L25.3754882,23.4712775 C26.6812379,22.544693 28.277009,22 30,22 C31.722991,22 33.3187621,22.544693 34.6245118,23.4712775 L42.7174074,12.0460131 Z', 'M26,30 a4,4 0 1,1 8,0 a4,4 0 1,1 -8,0'];

var VIEW_VR_PATHS = ['M17.9,26.2c-2.7,0-4.8,2.1-4.8,4.8s2.1,4.8,4.8,4.8s4.8-2.1,4.8-4.8S20.5,26.2,17.9,26.2z M41.9,12.9H18.1C8.1,12.9,0,21,0,31s8.1,18.1,18.1,18.1H42c10,0,18-8.1,18-18.1S52,12.9,41.9,12.9z M41.9,41.8h-3.6c-4,0-5.5-6.7-8.3-6.7s-4.1,6.7-8.3,6.7h-3.6c-6,0-10.9-4.9-10.9-10.9s4.9-10.9,10.9-10.9H42c6,0,10.9,4.9,10.9,10.9C52.8,37,48,41.8,41.9,41.8zM41.9,26.2c-2.7,0-4.8,2.1-4.8,4.8s2.1,4.8,4.8,4.8c2.7,0,4.8-2.1,4.8-4.8S44.5,26.2,41.9,26.2z'];


function createGlyph(width, height, color, paths) {
  if (!width) {
    throw new Error('No width specified!');
  }
  if (!height) {
    throw new Error('No height specified!');
  }
  var group = document.createElementNS(SVG_NS, 'g');
  group.setAttributeNS(null, 'fill', color);
  group.setAttributeNS(null, 'stroke', 'none');
  group.setAttributeNS(null, 'fill-rule', 'evenodd');
  for (var i = 0; i < paths.length; i++) {
    var path = document.createElementNS(SVG_NS, 'path');
    path.setAttributeNS(null, 'd', paths[i]);
    group.appendChild(path);
  }
  var svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttributeNS(null, 'width', width + 'px');
  svg.setAttributeNS(null, 'height', height + 'px');
  svg.setAttributeNS(null, 'viewBox', '0 0 60 60');
  svg.appendChild(group);
  return svg;
}

function createGyroGlyph(width, height) {
  var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '#ffffff';

  return createGlyph(width, height, color, GYRO_PATHS);
}

function createFullscreenGlyph(width, height) {
  var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '#ffffff';

  return createGlyph(width, height, color, FULLSCREEN_PATHS);
}

function createCompassGlyph(width, height) {
  var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '#ffffff';

  return createGlyph(width, height, color, COMPASS_PATHS);
}

function createViewInVrGlyph(width, height) {
  var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '#ffffff';

  return createGlyph(width, height, color, VIEW_VR_PATHS);
}

var fullscreenMethod = null;
if ('requestFullscreen' in Element.prototype) {
  fullscreenMethod = 'requestFullscreen';
} else if ('webkitRequestFullscreen' in Element.prototype) {
  fullscreenMethod = 'webkitRequestFullscreen';
} else if ('mozRequestFullScreen' in Element.prototype) {
  fullscreenMethod = 'mozRequestFullScreen';
} else if ('msRequestFullscreen' in Element.prototype) {
  fullscreenMethod = 'msRequestFullscreen';
}

var RAD_TO_DEG = 180 / Math.PI;

var OVERLAY_STYLES = {
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
  pointerEvents: 'none',
  userSelect: 'none'
};
var COMPASS_WRAPPER_STYLES = {
  backgroundColor: 'rgba(0,0,0,0.7)',
  borderRadius: '100%',
  height: '30px',
  marginTop: '-20px',
  padding: '5px',
  position: 'absolute',
  right: '20px',
  top: '50%',
  width: '30px'
};
var COMPASS_STYLES = {
  cursor: 'pointer',
  pointerEvents: 'initial',
  transformOrigin: '50% 50%'
};
var VR_BUTTON_STYLES = {
  background: 'rgba(0, 0, 0, 0.7)',
  border: '2px solid #ffffff',
  borderRadius: '5px',
  bottom: '20px',
  color: '#ffffff',
  cursor: 'pointer',
  display: 'none',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  left: '18px',
  padding: '0 10px',
  pointerEvents: 'initial',
  position: 'absolute'
};
var VR_BUTTON_LABEL_STYLES = {
  display: 'inline-block',
  lineHeight: '38px',
  marginLeft: '10px',
  verticalAlign: 'top'
};
var FULLSCREEN_STYLES = {
  background: 'rgba(0, 0, 0, 0.7)',
  border: '2px solid #ffffff',
  borderRadius: '5px',
  bottom: '20px',
  cursor: 'pointer',
  display: 'inline-block',
  height: '30px',
  padding: '4px',
  pointerEvents: 'initial',
  position: 'absolute',
  right: '18px',
  verticalAlign: 'bottom',
  width: '30px'
};
var GYRO_WRAPPER_STYLES = {
  height: '40px',
  left: '50%',
  marginLeft: '-20px',
  marginTop: '-20px',
  position: 'absolute',
  top: '50%',
  width: '40px',
  transition: 'opacity 1s ease-out'
};
var SUPPORT_MESSAGE_STYLES = {
  background: 'rgba(0, 0, 0, 0.7)',
  border: '2px solid #ffffff',
  borderRadius: '5px',
  color: '#ffffff',
  cursor: 'default',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  left: '50%',
  lineHeight: '20px',
  padding: '10px',
  pointerEvents: 'initial',
  position: 'absolute',
  textAlign: 'center',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '240px'
};
var SUPPORT_ACTIONS_STYLES = {
  paddingTop: '16px'
};
var SUPPORT_LEARN_MORE_STYLES = {
  color: '#ffffff',
  display: 'inline-block',
  marginRight: '40px',
  textDecoration: 'none'
};
var SUPPORT_CANCEL_STYLES = {
  color: '#ffffff',
  cursor: 'pointer'
};

var Overlay = function () {
  function Overlay() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Overlay);

    this.vrButtonHandler = options.vrButtonHandler;
    this.fullscreenButtonHandler = options.fullscreenButtonHandler;
    this.handleVRButton = this.handleVRButton.bind(this);
    this.handleFullscreenButton = this.handleFullscreenButton.bind(this);

    var overlayNode = document.createElement('div');
    setStyles(overlayNode, OVERLAY_STYLES);
    var vrButton = document.createElement('a');
    this.vrButton = vrButton;
    setStyles(vrButton, VR_BUTTON_STYLES);
    var vrGlyph = createViewInVrGlyph(38, 38, '#ffffff');
    vrButton.appendChild(vrGlyph);
    var vrButtonLabel = document.createElement('span');
    setStyles(vrButtonLabel, VR_BUTTON_LABEL_STYLES);
    vrButtonLabel.appendChild(document.createTextNode('View in VR'));
    vrButton.appendChild(vrButtonLabel);
    vrButton.addEventListener('click', this.handleVRButton);
    var fullscreenButton = document.createElement('a');
    this.fullscreenButton = fullscreenButton;
    setStyles(fullscreenButton, FULLSCREEN_STYLES);
    var fullscreenGlyph = createFullscreenGlyph(30, 30, '#ffffff');
    fullscreenButton.appendChild(fullscreenGlyph);
    fullscreenButton.title = 'Full Screen';
    fullscreenButton.style.display = fullscreenMethod && !options.hideFullscreen ? 'inline-block' : 'none';
    fullscreenButton.addEventListener('click', this.handleFullscreenButton);
    overlayNode.appendChild(vrButton);
    overlayNode.appendChild(fullscreenButton);

    var compassWrapper = document.createElement('div');
    setStyles(compassWrapper, COMPASS_WRAPPER_STYLES);
    compassWrapper.style.display = !options.hideCompass ? 'inline-block' : 'none';
    this.compass = createCompassGlyph(30, 30, '#ffffff');
    setStyles(this.compass, COMPASS_STYLES);
    if (typeof options.resetAngles === 'function') {
      this.compass.addEventListener('click', options.resetAngles);
    }
    compassWrapper.appendChild(this.compass);
    overlayNode.appendChild(compassWrapper);

    this.gyro = null;
    try {
      var gyro = createGyroGlyph(40, 40, '#ffffff');
      var gyroWrapper = document.createElement('div');
      setStyles(gyroWrapper, GYRO_WRAPPER_STYLES);
      gyroWrapper.appendChild(gyro);
      this.gyro = gyroWrapper;
      overlayNode.appendChild(gyroWrapper);
    } catch (e) {}

    this.domElement = overlayNode;
  }

  createClass(Overlay, [{
    key: 'enableVRButton',
    value: function enableVRButton() {
      this.vrButton.style.display = 'inline-block';
      this.vrButton.style.color = '#ffffff';
      this.vrButton.style.borderColor = '#ffffff';
      this.vrButton.style.cursor = 'pointer';
    }
  }, {
    key: 'disableVRButton',
    value: function disableVRButton() {
      this.vrButton.style.color = '#a0a0a0';
      this.vrButton.style.borderColor = '#a0a0a0';
      this.vrButton.style.cursor = 'inherit';
    }
  }, {
    key: 'hideVRButton',
    value: function hideVRButton() {
      this.vrButton.style.display = 'none';
    }
  }, {
    key: 'setVRButtonText',
    value: function setVRButtonText(text) {
      this.vrButton.childNodes[1].childNodes[0].nodeValue = text;
    }
  }, {
    key: 'setVRButtonHandler',
    value: function setVRButtonHandler(cb) {
      this.vrButtonHandler = cb;
    }
  }, {
    key: 'handleVRButton',
    value: function handleVRButton() {
      if (this.vrButtonHandler) {
        this.vrButtonHandler();
      }
    }
  }, {
    key: 'handleFullscreenButton',
    value: function handleFullscreenButton() {
      if (this.fullscreenButtonHandler) {
        this.fullscreenButtonHandler(fullscreenMethod);
      }
    }
  }, {
    key: 'showGyro',
    value: function showGyro() {
      if (this.gyro) {
        this.gyro.style.opacity = 1;
      }
    }
  }, {
    key: 'hideGyro',
    value: function hideGyro() {
      if (this.gyro) {
        this.gyro.style.opacity = 0;
      }
    }
  }, {
    key: 'showSupportMessage',
    value: function showSupportMessage() {
      var _this = this;

      if (this.supportMessage) {
        this.domElement.appendChild(this.supportMessage);
        return;
      }
      var message = document.createElement('div');
      setStyles(message, SUPPORT_MESSAGE_STYLES);
      this.supportMessage = message;

      var text = document.createElement('div');
      text.appendChild(document.createTextNode('Install a WebVR-enabled browser to experience VR on this device'));
      message.appendChild(text);

      var actions = document.createElement('div');
      setStyles(actions, SUPPORT_ACTIONS_STYLES);

      var learnMore = document.createElement('a');
      setStyles(learnMore, SUPPORT_LEARN_MORE_STYLES);
      learnMore.href = 'https://webvr.info/';
      learnMore.target = '_blank';
      learnMore.appendChild(document.createTextNode('Learn More'));

      var cancel = document.createElement('a');
      setStyles(cancel, SUPPORT_CANCEL_STYLES);
      cancel.appendChild(document.createTextNode('Cancel'));
      cancel.addEventListener('click', function () {
        _this.hideSupportMessage();
      });
      actions.appendChild(learnMore);
      actions.appendChild(cancel);
      message.appendChild(actions);
      this.domElement.appendChild(message);
    }
  }, {
    key: 'hideSupportMessage',
    value: function hideSupportMessage() {
      if (this.supportMessage) {
        this.domElement.removeChild(this.supportMessage);
      }
    }
  }, {
    key: 'setFullscreenButtonVisibility',
    value: function setFullscreenButtonVisibility(show) {
      this.fullscreenButton.style.display = fullscreenMethod && show ? 'inline-block' : 'none';
    }
  }, {
    key: 'setCompassAngle',
    value: function setCompassAngle(rad) {
      var deg = -1 * rad * RAD_TO_DEG;
      this.compass.style.transform = 'rotate(' + deg + 'deg)';
    }
  }]);
  return Overlay;
}();

var isMobile = /Mobi/i.test(navigator.userAgent);
var isAndroid = /Android/i.test(navigator.userAgent);
var isSamsung = isAndroid && /SM-[GN]/i.test(navigator.userAgent);
var fullscreenEvent = 'fullscreenchange';
if (!('onfullscreenchange' in document)) {
  if ('onwebkitfullscreenchange' in document) {
    fullscreenEvent = 'webkitfullscreenchange';
  } else if ('onmozfullscreenchange' in document) {
    fullscreenEvent = 'mozfullscreenchange';
  } else if ('onmsfullscreenchange' in document) {
    fullscreenEvent = 'msfullscreenchange';
  }
}

function isVRBrowser() {
  return 'VRDisplay' in window;
}

var FALLBACK_STYLES = {
  backgroundColor: '#000000',
  cursor: 'not-allowed',
  position: 'relative'
};
var FALLBACK_MESSAGE_STYLES = {
  background: 'rgba(0, 0, 0, 0.7)',
  border: '2px solid #ffffff',
  borderRadius: '5px',
  color: '#ffffff',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  left: '50%',
  padding: '10px',
  position: 'absolute',
  textAlign: 'center',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '190px'
};

function isWebGLSupported() {
  var canvas = document.createElement('canvas');
  var gl = null;
  try {
    gl = canvas.getContext('webgl');
  } catch (e) {}
  if (gl) {
    return true;
  }
  try {
    gl = canvas.getContext('experimental-webgl');
  } catch (e) {}
  return !!gl;
}

function isMobileInLandscapeOrientation() {
  if (!isMobile) {
    return false;
  }

  var orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
  if (orientation) {
    if (orientation.type === 'landscape-primary' || orientation.type === 'landscape-secondary') {
      return true;
    } else if (orientation.type === 'portrait-secondary' || orientation.type === 'portrait-primary') {
      return false;
    }
  }

  if (!window.orientation) {
    return false;
  }
  var quadrant = Math.round(window.orientation / 90);
  while (quadrant < 0) {
    quadrant += 4;
  }
  while (quadrant >= 4) {
    quadrant -= 4;
  }
  return quadrant === 1 || quadrant === 3;
}

var Player = function () {
  function Player() {
    var _this = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, Player);

    this.attemptEnterVR = this.attemptEnterVR.bind(this);
    this.attemptEnterFullscreen = this.attemptEnterFullscreen.bind(this);
    this.enterVR = this.enterVR.bind(this);
    this.exitVR = this.exitVR.bind(this);
    this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
    this.resetAngles = this.resetAngles.bind(this);

    this.isMobile = isMobile;
    this.allowCarmelDeeplink = !!options.allowCarmelDeeplink && isSamsung;
    this.calculateVerticalFOV = options.calculateVerticalFOV;

    this.controlOptions = { disableTouchPanning: !!options.disableTouchPanning };

    var width = options.width;
    var height = options.height;
    var pixelRatio = options.pixelRatio;
    var el = void 0;
    if (typeof options.elementOrId === 'string') {
      var id = options.elementOrId;
      var elementById = document.getElementById(id);
      if (!elementById) {
        throw new Error('No DOM element with id: ' + id);
      }
      el = elementById;
    } else {
      el = options.elementOrId;
    }
    var camera = options.camera;

    if (!el) {
      var body = document.body;
      if (!body) {
        throw new Error('Cannot automatically attach the Player to a document with no body');
      }
      el = body;
    }
    this._el = el;

    var fixedSize = true;
    if (!width) {
      if (this._el === document.body) {
        fixedSize = false;
        width = window.innerWidth;
      } else {
        width = this._el.clientWidth;
      }
    }
    if (!height) {
      if (this._el === document.body) {
        fixedSize = false;
        height = window.innerHeight;
      } else {
        height = this._el.clientHeight;
      }
    }
    if (!pixelRatio) {
      this.fixedPixelRatio = false;
      pixelRatio = window.devicePixelRatio || 1;
    } else {
      this.fixedPixelRatio = true;
    }

    this.width = width;
    this.height = height;
    this.pixelRatio = pixelRatio;

    if (!fixedSize && this._el === document.body) {
      this.addResizeHandler();
    }

    if (camera) {
      this._camera = camera;
    } else {
      var fov = void 0;
      if (isMobileInLandscapeOrientation()) {
        fov = Math.max(30, Math.min(70, 60 / (width / height)));
      } else {
        fov = 60;
      }
      if (typeof this.calculateVerticalFOV === 'function') {
        fov = this.calculateVerticalFOV(width, height);
      }
      this._camera = new THREE.PerspectiveCamera(fov, width / height, 0.01, 10000.0);
    }
    this._initialAngles = {
      x: this._camera.rotation.x,
      y: this._camera.rotation.y,
      z: this._camera.rotation.z
    };
    this._lastAngle = this._camera.rotation.y;

    if (!isWebGLSupported()) {
      this.renderFallback(width, height);
      return this;
    }

    var antialias = options.hasOwnProperty('antialias') ? options.antialias : true;
    var alpha = options.hasOwnProperty('canvasAlpha') ? options.canvasAlpha : true;
    var renderer = new THREE.WebGLRenderer({
      antialias: antialias,
      alpha: alpha
    });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000);
    this.glRenderer = renderer;
    this.controls = new AppControls(this._camera, this.glRenderer.domElement, this.controlOptions);
    this.onEnterVR = options.onEnterVR;
    this.onExitVR = options.onExitVR;

    var overlay = new Overlay({
      vrButtonHandler: this.attemptEnterVR,
      fullscreenButtonHandler: this.attemptEnterFullscreen,
      hideCompass: options.hideCompass,
      hideFullscreen: options.hideFullscreen,
      resetAngles: this.resetAngles
    });
    this.overlay = overlay;
    if (isVRBrowser() || this.allowCarmelDeeplink) {
      this.overlay.enableVRButton();
    }

    var wrapper = document.createElement('div');
    this._wrapper = wrapper;
    setStyles(wrapper, {
      width: width + 'px',
      height: height + 'px',
      position: 'relative',
      cursor: 'grab'
    });
    if (wrapper.style.cursor === '') {
      wrapper.style.cursor = '-webkit-grab';
      if (wrapper.style.cursor === '') {
        wrapper.style.cursor = '-moz-grab';
      }
    }
    wrapper.appendChild(overlay.domElement);
    wrapper.appendChild(renderer.domElement);

    this._el.appendChild(wrapper);

    var hideAndCleanUp = function hideAndCleanUp() {
      wrapper.removeEventListener('mouseover', hideAndCleanUp);
      wrapper.removeEventListener('touchstart', hideAndCleanUp);
      _this.overlay.hideGyro();
    };
    wrapper.addEventListener('mouseover', hideAndCleanUp);
    wrapper.addEventListener('touchstart', hideAndCleanUp);
    if (isMobile) {
      setTimeout(hideAndCleanUp, 4000);
    }
    this._compass = new THREE.Vector3();

    this.frameData = null;
    if ('VRFrameData' in window) {
      this.frameData = new VRFrameData();
    }

    window.addEventListener('vrdisplayactivate', this.enterVR);
    window.addEventListener('vrdisplaydeactivate', this.exitVR);

    if ('getVRDisplays' in navigator) {
      navigator.getVRDisplays().then(function (displays) {
        if (displays.length) {
          var display = displays[0];
          _this.vrDisplay = display;
          _this.controls.setVRDisplay(display);
          var effect = new VREffect(_this.glRenderer, display);
          _this.effect = effect;
          var size = renderer.getSize();
          effect.setSize(size.width, size.height);
          _this.onEnterVR && _this.onEnterVR();

          return effect.requestPresent();
        }
      }).catch(function (err) {
        _this.onExitVR && _this.onExitVR();
      });
    }
  }

  createClass(Player, [{
    key: 'renderFallback',
    value: function renderFallback(width, height) {
      var fallback = document.createElement('div');
      setStyles(fallback, FALLBACK_STYLES);
      setStyles(fallback, {
        width: width + 'px',
        height: height + 'px'
      });
      var message = document.createElement('div');
      message.appendChild(document.createTextNode('The current browser does not support WebGL.'));
      setStyles(message, FALLBACK_MESSAGE_STYLES);
      fallback.appendChild(message);
      this._el.appendChild(fallback);
    }
  }, {
    key: 'frame',
    value: function frame() {
      var frameOptions = {};
      if (this.frameData && this.vrDisplay && this.vrDisplay.isPresenting) {
        this.vrDisplay.getFrameData(this.frameData);
        frameOptions.frameData = this.frameData;
      }
      this.controls.frame(frameOptions);

      this._camera.updateMatrixWorld(true);

      if (!(this.vrDisplay && this.vrDisplay.isPresenting && isMobile)) {
        this._compass.set(1, 0, 0);
        this._compass.applyQuaternion(this._camera.quaternion);
        var rotationY = Math.acos(this._compass.x) * -Math.sign(this._compass.z);
        if (rotationY !== this._lastAngle) {
          this._lastAngle = rotationY;
          this.overlay.setCompassAngle(this._lastAngle);
        }
      }
    }
  }, {
    key: '_renderUpdate',
    value: function _renderUpdate(node, scene, camera) {
      node.onUpdate && node.onUpdate(scene, camera);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = node.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var child = _step.value;

          this._renderUpdate(child, scene, camera);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'render',
    value: function render(scene) {
      this._renderUpdate(scene, scene, this._camera);
      if (this.effect && this.frameData && this.vrDisplay && this.vrDisplay.isPresenting) {
        this.effect.render(scene, this._camera, this.frameData);
        if (!isMobile) {
          this._renderMonoCamera(scene);
        }
      } else {
        this._renderMonoCamera(scene);
      }
    }
  }, {
    key: 'renderOffscreen',
    value: function renderOffscreen(scene, camera, target) {
      this._renderUpdate(scene, scene, camera);
      var oldClearColor = this.glRenderer.getClearColor();
      var oldClearAlpha = this.glRenderer.getClearAlpha();
      var oldSort = this.glRenderer.sortObjects;
      var oldClipping = this.glRenderer.localClippingEnabled;
      this.glRenderer.localClippingEnabled = true;
      this.glRenderer.setClearColor('#000', 0);
      this.glRenderer.sortObjects = false;
      this.glRenderer.render(scene, camera, target, true);
      this.glRenderer.sortObjects = oldSort;
      this.glRenderer.setClearColor(oldClearColor, oldClearAlpha);
      this.glRenderer.setRenderTarget(null);
      this.glRenderer.localClippingEnabled = oldClipping;
    }
  }, {
    key: '_renderMonoCamera',
    value: function _renderMonoCamera(scene) {
      var backupScene = scene.background;

      if (scene.backgroundLeft) {
        scene.background = scene.backgroundLeft;
      }
      this.glRenderer.render(scene, this._camera);
      scene.background = backupScene;
    }
  }, {
    key: 'requestAnimationFrame',
    value: function requestAnimationFrame(fn) {
      if (this.vrDisplay) {
        return this.vrDisplay.requestAnimationFrame(fn);
      }
      return window.requestAnimationFrame(fn);
    }
  }, {
    key: 'enterVR',
    value: function enterVR() {
      var _this2 = this;

      if (!this.vrDisplay || !this.effect) {
        return Promise.reject('Cannot enter VR, no display detected');
      }
      return this.effect.requestPresent().then(function () {
        _this2.onEnterVR && _this2.onEnterVR();
        _this2.overlay.setVRButtonText('Exit VR');
        _this2.overlay.setVRButtonHandler(_this2.exitVR);
      }, function (err) {
        console.error(err);
      });
    }
  }, {
    key: 'exitVR',
    value: function exitVR() {
      var _this3 = this;

      if (!this.vrDisplay || !this.vrDisplay.isPresenting || !this.effect) {
        return Promise.reject('Cannot exit, not currently presenting');
      }
      return this.effect.exitPresent().then(function () {
        _this3.onExitVR && _this3.onExitVR();
        _this3.overlay.setVRButtonText('View in VR');
        _this3.overlay.setVRButtonHandler(_this3.attemptEnterVR);
      }, function (err) {
        console.error(err);
      });
    }
  }, {
    key: 'attemptEnterVR',
    value: function attemptEnterVR() {
      var _this4 = this;

      if (isVRBrowser() && this.vrDisplay) {
        console.log('Entering VR');
        this.enterVR().then(function () {
          console.log('Presenting to VR Display');
        }, function (err) {
          console.error('Failed to present. Is another application is already using the display?');
        });
      } else if (this.allowCarmelDeeplink) {
        console.log('Attempting Oculus Browser');

        this.overlay.disableVRButton();
        attemptOculusPlayer().then(function () {
          _this4.overlay.enableVRButton();
        }, function () {
          console.log('No VR support!');
          _this4.overlay.enableVRButton();
          _this4.overlay.showSupportMessage();
        });
      }
    }
  }, {
    key: 'attemptEnterFullscreen',
    value: function attemptEnterFullscreen(fullscreenMethod) {
      document.addEventListener(fullscreenEvent, this.handleFullscreenChange);
      var canvas = this.glRenderer.domElement;
      if (typeof canvas[fullscreenMethod] === 'function') {
        canvas[fullscreenMethod]();
      }
    }
  }, {
    key: 'handleFullscreenChange',
    value: function handleFullscreenChange() {
      var element = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
      if (element === this.glRenderer.domElement) {
        this.resize(window.innerWidth, window.innerHeight);
      } else if (!element) {
        this.resize(this.width, this.height);
        document.removeEventListener(fullscreenEvent, this.handleFullscreenChange);
      }
    }
  }, {
    key: 'resize',
    value: function resize(width, height) {
      if (this.glRenderer && this._camera) {
        this._wrapper.style.width = width + 'px';
        this._wrapper.style.height = height + 'px';
        if (!this.fixedPixelRatio) {
          this.pixelRatio = window.devicePixelRatio || 1;
        }
        this.glRenderer.setPixelRatio(this.pixelRatio);
        this.glRenderer.setSize(width, height, true);
        var fov = void 0;
        if (isMobileInLandscapeOrientation()) {
          fov = Math.max(30, Math.min(70, 60 / (width / height)));
        } else {
          fov = 60;
        }
        if (typeof this.calculateVerticalFOV === 'function') {
          fov = this.calculateVerticalFOV(width, height);
        }
        this._camera.fov = fov;
        this._camera.aspect = width / height;
        this._camera.updateProjectionMatrix();
      }
    }
  }, {
    key: 'addResizeHandler',
    value: function addResizeHandler() {
      var _this5 = this;

      var last = 0;
      var timer = null;
      var delay = 100;

      this._resizeHandler = function () {
        if (_this5.vrDisplay && _this5.vrDisplay.isPresenting) {
          return;
        }
        var now = Date.now();
        if (!last) {
          last = now;
        }
        if (timer) {
          clearTimeout(timer);
        }
        if (now > last + delay) {
          last = now;
          _this5.resize(window.innerWidth, window.innerHeight);
          return;
        }
        timer = setTimeout(function () {
          last = now;
          _this5.resize(window.innerWidth, window.innerHeight);
        }, delay);
      };
      window.addEventListener('resize', this._resizeHandler);
    }
  }, {
    key: 'removeResizeHandler',
    value: function removeResizeHandler() {
      if (this._resizeHandler) {
        window.removeEventListener('resize', this._resizeHandler);
        this._resizeHandler = null;
      }
    }
  }, {
    key: 'resetAngles',
    value: function resetAngles() {
      var _initialAngles = this._initialAngles,
          x = _initialAngles.x,
          y = _initialAngles.y,
          z = _initialAngles.z;

      this.controls.resetRotation(x, y, z);
    }
  }, {
    key: 'camera',
    get: function get() {
      return this._camera;
    },
    set: function set(value) {
      this._camera = value;
      this._initialAngles = {
        x: value.rotation.x,
        y: value.rotation.y,
        z: value.rotation.z
      };
      if (typeof this.controls.setCamera === 'function') {
        this.controls.setCamera(value);
      }
    }
  }, {
    key: 'renderer',
    get: function get() {
      return this.glRenderer;
    }
  }]);
  return Player;
}();

exports.AppControls = AppControls;
exports.DeviceOrientationControls = DeviceOrientationControls;
exports.VRControls = VRControls;
exports.VREffect = VREffect;
exports.BitmapFontGeometry = BitmapFontGeometry;
exports.loadFont = loadFont;
exports.addFontFallback = addFontFallback;
exports.measureText = measureText;
exports.wrapLines = wrapLines;
exports.BASELINE = BASELINE;
exports.BOTTOM = BOTTOM;
exports.CENTER = CENTER;
exports.CENTER_FIXEDHEIGHT = CENTER_FIXEDHEIGHT;
exports.CENTER_LINE = CENTER_LINE;
exports.LEFT = LEFT;
exports.RIGHT = RIGHT;
exports.RIGHT_LINE = RIGHT_LINE;
exports.TOP = TOP;
exports.SDFFONT_MARKER_COLOR = SDFFONT_MARKER_COLOR;
exports.StereoBasicTextureMaterial = StereoBasicTextureMaterial;
exports.GuiSys = GuiSys;
exports.GuiSysEventType = GuiSysEventType;
exports.GuiSysEvent = GuiSysEvent;
exports.UIViewEventType = UIViewEventType;
exports.UIViewEvent = UIViewEvent;
exports.UIView = UIView;
exports.Overlay = Overlay;
exports.Player = Player;
exports.RayCaster = RayCaster;
exports.MouseRayCaster = MouseRayCaster;

}((this.OVRUI = this.OVRUI || {})));