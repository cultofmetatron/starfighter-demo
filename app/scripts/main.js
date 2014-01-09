/* canvas experiment */
/*jslint indent:2 */
'use strict';
(function(window, $) {

  var bind = function(fn, context) {
    return function() {
      fn.apply(context, arguments);
    };
  };

  /*
   * Scene is a structure containing all objects in a scene
   */
  var Scene = function(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.drawableObjects = [];
    this.width  = $(canvas).width();
    this.height = $(canvas).height();
    
  };
  Scene.prototype = Object.create({});
  Scene.fn = Scene.prototype;
  Scene.fn.push = function(drawableObject) {
    this.drawableObjects.push(drawableObject);
    return this;
  };
  Scene.fn.render = function() {
    _(this.drawableObjects).chain().
      sortBy('order')
      .each(function(drawableObject) {
        drawableObject.draw(this.context);
      }, this)
      .value();
      return this;
  };
  Scene.fn.clear = function() {
    this.context.fillStyle = 'white';
    this.context.fillRect(0, 0, this.width, this.height);
  };

  var DrawableObject = function(src, options) {
    this.subObjects = [];
    this.order = options.order || 0;
    var imgLoad = $.Deferred();
    this.imgLoaded = imgLoad.promise();
    options = options || {};
    this.setPosition(options.xPos || 0, options.yPos || 0);
    this.image = new Image();
    this.image.src = src;

    this.image.onload = bind(function() {
      this.setScale(options.scale || 1);
      imgLoad.resolve();
    }, this);
    setInterval(_.bind(this.removeStaleObjects, this), 100);
  };

  DrawableObject.prototype = Object.create({});
  DrawableObject.fn = DrawableObject.prototype;
  DrawableObject.fn.setPosition = function(x, y) {
    this.xPos = x;
    this.yPos = y;
    return this;
  };

  DrawableObject.fn.getPosition = function() {
    return {
      xPos: this.xPos,
      yPos: this.yPos
    };
  };

  DrawableObject.fn.setScale = function(scale) {
    this.width  = Math.floor(this.image.width * scale);
    this.height = Math.floor(this.image.height * scale);
    return this;
  };
  DrawableObject.fn.addSubObject = function(drawableObject) {
    this.subObjects.push(drawableObject);
  };
  DrawableObject.fn.removeSubObject = function(drawableObject) {
    this.subObjects = _(this.subObjects).filter(function(obj){
      return drawableObject !== obj;
    }, this);
  };
  DrawableObject.fn.drawSubObjects = function(context) {
    _(this.subObjects).chain()
      .sort('order')
      .each(function(drawableObject) {
        drawableObject.draw(context);
      })
      .value();
    return this;
  };
  DrawableObject.fn.removeStaleObjects = function() {
    this.subObjects = _(this.subObjects).filter(function(obj) {
      if (_.isFunction(obj.isStale)) {
        return !obj.isStale();
      } else {
        return true;
      }
    }, this);
    return this;
  };
  DrawableObject.fn.draw = function(context) {
    this.imgLoaded.done(bind(function() {
      context.drawImage(this.image,this.xPos, this.yPos, this.width, this.height);
      this.drawSubObjects(context);
    }, this));
    return this;
  };

  var Missile = function(options) {
    DrawableObject.call(this, '/images/missile.png', options);
    this.lifespan = options.lifespan || 2000;
    this.createdAt = Date.now();
    setInterval(_.bind(this.moveUp, this), 10);
  };
  Missile.prototype = Object.create(DrawableObject.prototype);
  Missile.fn = Missile.prototype;
  Missile.fn.isStale = function() {
    return (Date.now() - this.lifespan) > this.createdAt;
  };
  Missile.fn.moveUp = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos, pos.yPos - 10);
  };



  var StarFighter = function(options) {
    DrawableObject.call(this, '/images/fighter.png', options);
    //this.bindKeyHandler('keydown',  this.moveDown);
    this.bindKeyHandler('keydown',  {
      38: this.moveUp,
      37: this.moveLeft,
      39: this.moveRight,
      40: this.moveDown,
      32: this.fireMissile
    });
  };


  StarFighter.prototype = Object.create(DrawableObject.prototype);
  StarFighter.fn = StarFighter.prototype;
  StarFighter.fn.bindKeyHandler = function(key, keyMap) {
    //$(window).on(key, _.bind(fn, this));
    $(window).on('keydown', _.bind(function(e) {
      if (keyMap[event.keyCode]) { 
        e.preventDefault();
        keyMap[event.keyCode].call(this);
      }
    }, this));
  };
  StarFighter.fn.fireMissile = function() {

    this.addSubObject(new Missile({
      xPos: this.xPos + 10,
      yPos: this.yPos - 30,
      scale: 1
    }));
    return this;
  };

  StarFighter.fn.moveLeft = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos - 10, pos.yPos);
  };

  StarFighter.fn.moveRight = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos + 10, pos.yPos);
  };

  StarFighter.fn.moveUp = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos, pos.yPos - 10);
  };

  StarFighter.fn.moveDown = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos, pos.yPos + 10);
  };

  var redrawCanvas = function(scene) {
    requestAnimationFrame(_.bind(redrawCanvas, this, scene));
    scene.clear();
    scene.render();
  };

  var loadCanvas = function() {
    var $canvas = $('canvas#drawable');
    var scene = new Scene($canvas[0]);
    scene.push(new DrawableObject('/images/background.jpeg', {
      xPos: 0,
      yPos: 0,
      scale: 1
    }));
    scene.push(new StarFighter({
      xPos: 200,
      yPos: 300,
      scale: .5
    }));
    redrawCanvas(scene);
  };

  $(window).on('ready', loadCanvas);


}).call(this, window, jQuery);



