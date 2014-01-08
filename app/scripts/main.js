/* canvas experiment */
/*jslint indent:2 */
'use strict';
(function(window, $) {
  var loadCanvas = function() {
    var context = $('canvas#drawable')[0].getContext("2d");
    context.fillStyle = '#ffffaa';
    context.fillRect(0, 0, 50, 50);

    context.fillStyle = 'green';
    context.font = '20px Sans-Serif';

    context.textBaseLine = "top";
    context.fillText("Hello World", 195, 80);

    //now load an image
    var starfighter = new Image();
    starfighter.src = "/images/fighter.png";
    starfighter.onload = function() {
      context.drawImage(starfighter, 50, 100);
    };


  };


  $(window).on('ready', loadCanvas);


}).call(this, window, jQuery);



