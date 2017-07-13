window.TimePicker = (function() {
  'use strict';

  function installStyles() {
    var style = ['<style type="text/css">'];
    var cx = 130;
    var cy = 130;
    var sizeHalf = 16;
    var padding = 5;
    var radius = 130;
    for (var i = 0; i < 60; i++) {
      var angle = i * Math.PI * 2 / 60;
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      style.push('.tp-clock-number-', i, '{left:', 'px;top:21px;}');
      style.push('.tp-clock-number-', i, '  .tp-clock-overlay-container{left:-114px;top:-5px;}');
    }
    style.push('</style>');
    $(style.join('')).appendTo('head');
  }

  function createDom() {
    var numbers = [];
    for (var i = 0; i < 12; i++) {
      var num = i || 12;
      numbers.push('<span class="tp-clock-number tp-clock-number-' + (num * 5) + '">' + num + '</span>');
    }

    return $(
        '<div class="tp-popup">\n' +
        '   <div class="tp-shadow"></div>\n' +
        '   <div class="tp-container">\n' +
        '       <div class="tp-header-container">\n' +
        '           <div class="tp-header-time-container">\n' +
        '               <div class="tp-header-time">\n' +
        '                   <span class="tp-header-hours">12</span><span>:</span><span class="tp-header-minutes">00</span>\n' +
        '                   <div class="tp-header-am-pm-container">\n' +
        '                       <span class="tp-header-am-pm tp-header-am-pm-active">AM</span>\n' +
        '                       <span class="tp-header-am-pm">PM</span>\n' +
        '                   </div>\n' +
        '               </div>\n' +
        '           </div>\n' +
        '       </div>\n' +
        '       <div class="tp-body">\n' +
        '           <div class="tp-clock">\n' +
        '               <div class="tp-clock-center"></div>\n' +
        '                   ' + numbers.join('\n                   ') +
        '               <div class="tp-clock-pointer" style="transform: rotateZ(0deg);"></div>\n' +
        '               <div class="tp-clock-overlay-clip tp-clock-number-0">\n' +
        '                   <div class="tp-clock-overlay-container">\n' +
        '                       ' + numbers.join('\n                       ') +
        '                   </div>\n' +
        '               </div>\n' +
        '           </div>\n' +
        '       </div>\n' +
        '       <div class="tp-footer">\n' +
        '           <button tabindex="0" type="button" class="tp-button">\n' +
        '               <span class="tp-button-content">CANCEL</span>\n' +
        '           </button>\n' +
        '           <button tabindex="1" type="button" class="tp-button">\n' +
        '               <span class="tp-button-content">OK</span>\n' +
        '           </button>\n' +
        '       </div>\n' +
        '   </div>\n' +
        '</div>\n');
  }

  return {
    a: installStyles,
    b: createDom
  };
})();
