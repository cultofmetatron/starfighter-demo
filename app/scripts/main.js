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
    this.canvas = canvas
    this.context = 5
    this.drawableObjects = [];

  }

  var DrawableObject = function(src, options) {
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
  DrawableObject.fn.draw = function(context) {
    this.imgLoaded.done(bind(function() {
      context.drawImage(this.image,this.xPos, this.yPos, this.width, this.height);
    }, this));
    return this;
  };


  var StarFighter = function(options) {
    DrawableObject.call(this, '/images/fighter.png', options);
    //this.bindKeyHandler('keydown',  this.moveDown);
    this.bindKeyHandler('keydown'  ,  {
      38: this.moveUp,
      37: this.moveLeft,
      39: this.moveRight,
      40: this.moveDown
    });


    //this.bindKeyHandler('keyleft',  this.moveLeft);
    //this.bindKeyHandler('keyright', this.moveRight);
  };

  StarFighter.prototype = Object.create(DrawableObject.prototype);
  StarFighter.fn = StarFighter.prototype;
  StarFighter.fn.bindKeyHandler = function(key, keyMap) {
    //$(window).on(key, _.bind(fn, this));
    $(window).on('keydown', _.bind(function(e) {
      e.preventDefault();
      keyMap[event.keyCode].call(this);
    }, this));
  };

  StarFighter.fn.moveLeft = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos - 5, pos.yPos);
  };

  StarFighter.fn.moveRight = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos + 5, pos.yPos);
  };

  StarFighter.fn.moveUp = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos, pos.yPos - 5);
  };

  StarFighter.fn.moveDown = function() {
    var pos = this.getPosition();
    this.setPosition(pos.xPos, pos.yPos + 5);
  };





  
  var drawCanvas = function(context, drawableObjects) {
    _(drawableObjects).each(function(drawableObject) {
      drawableObject.draw(context);
    });
  };
  var redrawCanvas = function(context, drawableObjects, canvasWidth, canvasHeight) {
    requestAnimationFrame(
      _.bind(redrawCanvas, this, context, drawableObjects, canvasWidth, canvasHeight));
    clearCanvas(context, canvasWidth, canvasHeight);
    drawCanvas(context, drawableObjects);
  };


  var clearCanvas = function(context, width, height) {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
  };

  var loadCanvas = function() {
    var $canvas = $('canvas#drawable');
    var canvasWidth  = $canvas.width();
    var canvasHeight = $canvas.height();
    var context = $canvas[0].getContext("2d");
    var drawableObjects = [];
    
    drawableObjects.push(new DrawableObject('/images/background.jpeg', {
      xPos: 0,
      yPos: 0,
      scale: 1
    }));
    
    drawableObjects.push(new StarFighter({
      xPos: 200,
      yPos: 300,
      scale: .5
    }));
    redrawCanvas(context, drawableObjects, canvasWidth, canvasHeight);
  };


  $(window).on('ready', loadCanvas);


}).call(this, window, jQuery);



