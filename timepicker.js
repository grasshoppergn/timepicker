window.TimePicker = (function() {
  'use strict';

  var $popup, $pointer, $clip, $ampm, $am, $pm, $hours, $minutes, $clock12Hours,
      $clock24Hours, $clockMinutes, $clockOverlay, onOk, okData, onCancel;
  var mode12h = true, inited = false, h = 0, m = 0, showingHours = true, showingAM = true, pointsTo = 0;
  var $document = $(document);

  var cx = 130, cy = 130; // cx and cy - due to tp-clock-overlay
  var sizeHalf = 16;
  var radius = 109;
  var innerRadius = 69;

  function installStyles() {
    var style = ['<style type="text/css">'];
    for (var i = 0; i < 60; i++) {
      var angle = (i - 15) * Math.PI * 2 / 60;
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      style.push('.tp-clock-number-', i,
          '{left:', (cx + cos * radius).toFixed(), 'px;',
          'top:', (cy + sin * radius).toFixed(), 'px;}');
      style.push('.tp-clock-number-', i, '  .tp-clock-overlay-container',
          '{left:-', (cx - sizeHalf + cos * radius).toFixed(), 'px;',
          'top:-', (cy - sizeHalf + sin * radius).toFixed(), 'px;}');
      style.push('.tp-clock-inner-number-', i,
          '{left:', (cx + cos * innerRadius).toFixed(), 'px;',
          'top:', (cy + sin * innerRadius).toFixed(), 'px;}');
      style.push('.tp-clock-inner-number-', i, '  .tp-clock-overlay-container',
          '{left:-', (cx - sizeHalf + cos * innerRadius).toFixed(), 'px;',
          'top:-', (cy - sizeHalf + sin * innerRadius).toFixed(), 'px;}');
    }
    style.push('</style>');
    $(style.join('')).appendTo('head');
  }

  function createDom() {
    var hours12 = [];
    var hours24 = [];
    var minutes = [];
    for (var i = 0; i < 12; i++) {
      hours12.push('<span class="tp-clock-number tp-clock-hours-12 tp-clock-number-' + (i * 5) + '">' + (i || 12) + '</span>');
      hours24.push('<span class="tp-clock-inner-number tp-clock-hours-24 tp-clock-inner-number-' + (i * 5) + '">' + to2Digit(i ? i + 12 : 0) + '</span>');
      minutes.push('<span class="tp-clock-number tp-clock-minutes tp-clock-number-' + (i * 5) + ' tp-disabled">' + (i * 5) + '</span>');
    }

    $popup = $(
        '<div class="tp-popup tp-popup-invisible tp-disabled">\n' +
        '   <div class="tp-shadow"></div>\n' +
        '   <div class="tp-container">\n' +
        '       <div class="tp-header-container">\n' +
        '           <div class="tp-header-time-container">\n' +
        '               <div class="tp-header-time">\n' +
        '                   <span class="tp-header-hours tp-header-time-active">12</span><span>:</span><span class="tp-header-minutes">00</span>\n' +
        '                   <div class="tp-header-am-pm-container">\n' +
        '                       <span class="tp-header-am tp-header-am-pm-active">AM</span>\n' +
        '                       <span class="tp-header-pm">PM</span>\n' +
        '                   </div>\n' +
        '               </div>\n' +
        '           </div>\n' +
        '       </div>\n' +
        '       <div class="tp-body">\n' +
        '           <div class="tp-clock">\n' +
        '               <div class="tp-clock-center"></div>\n' +
        '               ' + hours12.join('\n               ') +
        '               ' + hours24.join('\n               ') +
        '               ' + minutes.join('\n               ') +
        '               <div class="tp-clock-pointer" style="transform: rotateZ(0deg);"></div>\n' +
        '               <div class="tp-clock-overlay-clip tp-clock-number-0">\n' +
        '                   <div class="tp-clock-overlay-container">\n' +
        '                       ' + hours12.join('\n                       ') +
        '                       ' + hours24.join('\n                       ') +
        '                       ' + minutes.join('\n                       ') +
        '                   </div>\n' +
        '               </div>\n' +
        '               <div class="tp-clock-overlay-interceptor">\n' +
        '               </div>\n' +
        '           </div>\n' +
        '       </div>\n' +
        '       <div class="tp-footer">\n' +
        '           <button tabindex="0" type="button" class="tp-button tp-button-cancel">\n' +
        '               <span class="tp-button-content">CANCEL</span>\n' +
        '           </button>\n' +
        '           <button tabindex="1" type="button" class="tp-button tp-button-ok">\n' +
        '               <span class="tp-button-content">OK</span>\n' +
        '           </button>\n' +
        '       </div>\n' +
        '   </div>\n' +
        '</div>\n');
    $popup.appendTo('body');

    $pointer = $popup.find('.tp-clock-pointer');
    $clip = $popup.find('.tp-clock-overlay-clip');
    $ampm = $popup.find('.tp-header-am-pm-container');
    $am = $ampm.find('.tp-header-am');
    $pm = $ampm.find('.tp-header-pm');
    $hours = $popup.find('.tp-header-hours');
    $minutes = $popup.find('.tp-header-minutes');
    $clock12Hours = $popup.find('.tp-clock-hours-12');
    $clock24Hours = $popup.find('.tp-clock-hours-24');
    $clockMinutes = $popup.find('.tp-clock-minutes');
    $clockOverlay = $popup.find('.tp-clock-overlay-interceptor');

    $clockOverlay.on('touchstart mousedown', null, null, clockMouseDown);
    $hours.on('click', null, 'hours', timeClick);
    $minutes.on('click', null, 'minutes', timeClick);
    $am.on('click', null, 'am', timeClick);
    $pm.on('click', null, 'pm', timeClick);
    $popup.find('.tp-shadow, .tp-button-cancel').on('click', null, null, function() { hide(false); });
    $popup.find('.tp-button-ok').on('click', null, null, hide);
  }

  function clockMouseDown(e) {
    e.preventDefault();
    $document.on('touchmove mousemove', null, null, clockMouseMove);
    $document.on('touchend mouseup', null, null, clockMouseUp);
    if (e.type == 'touchstart')
      e = e.originalEvent.touches[0];
    updateTime(e.clientX, e.clientY);
  }

  function clockMouseMove(e) {
    if (e.type == 'touchmove')
      e = e.originalEvent.touches[0];
    updateTime(e.clientX, e.clientY);
  }

  function clockMouseUp(e) {
    $document.off('touchmove mousemove', null, clockMouseMove);
    $document.off('touchend mouseup', null, clockMouseUp);
    if (e.type == 'touchend')
      e = e.originalEvent.changedTouches[0];
    updateTime(e.clientX, e.clientY);
    if (showingHours)
      showMinutes();
  }

  function timeClick(e) {
    e.preventDefault();
    switch (e.data) {
      case 'hours':
        showHours();
        break;
      case 'minutes':
        showMinutes();
        break;
      case 'am':
        if (h >= 12)
          h -= 12;
        setupTime();
        break;
      case 'pm':
        if (h < 12)
          h += 12;
        setupTime();
        break;
    }
  }

  function updateTime(x, y) {
    var offset = $clockOverlay.offset();
    x -= offset.left + cx;
    y -= offset.top + cy;
    var angle = (Math.atan2(y, x) * 180 / Math.PI + 90 + 360) % 360;
    if (showingHours) {
      h = Math.round(angle / 30) % 12;
      if (mode12h) {
        if (!showingAM) {
          h += 12;
        }
      } else if (Math.sqrt(x * x + y * y) <= innerRadius) {
        h = h ? h + 12 : 0;
      } else if (!h) {
        h = 12;
      }
    } else {
      m = Math.round(angle / 6) % 60;
    }
    setupTime();
    updatePointer();
  }

  function to2Digit(value) {
    return (value < 10 ? '0' : '') + value;
  }

  function formatTime(hours, minutes, to12h, hours2Digits) {
    if (to12h) {
      hours = (hours % 12) || 12;
    }
    return (hours2Digits ? to2Digit(hours) : hours) + ':' + to2Digit(minutes);
  }

  function show(hours, minutes, opt_in12hMode, opt_onOk, opt_okData, opt_onCancel) {
    if (!inited) {
      installStyles();
      createDom();
      inited = true;
    }
    onOk = opt_onOk || null;
    okData = opt_okData;
    onCancel = opt_onCancel || null;
    mode12h = !!opt_in12hMode;
    h = hours;
    m = minutes;
    setupTime();
    showHours(true);
    $popup.removeClass('tp-disabled').removeClass('tp-popup-invisible');
  }

  function setupTime() {
    $hours.text(to2Digit(mode12h ? (h % 12) || 12 : h));
    $minutes.text(to2Digit(m));
    if (mode12h) {
      var active,
          inactive;
      if (showingAM = (h < 12)) {
        active = $am;
        inactive = $pm;
      } else {
        active = $pm;
        inactive = $am;
      }
      active.addClass('tp-header-am-pm-active');
      inactive.removeClass('tp-header-am-pm-active');
      $ampm.removeClass('tp-disabled');
    } else {
      $ampm.addClass('tp-disabled');
    }
  }

  function showHours(opt_force) {
    if (!showingHours || opt_force) {
      showingHours = true;
      $hours.removeClass('tp-header-time-inactive');
      $minutes.addClass('tp-header-time-inactive');
      $clockMinutes.addClass('tp-disabled');
      $clock12Hours.removeClass('tp-disabled');
      if (mode12h) {
        $clock24Hours.addClass('tp-disabled');
      } else {
        $clock24Hours.removeClass('tp-disabled');
      }
      updatePointer();
    }
  }

  function showMinutes(opt_force) {
    if (showingHours || opt_force) {
      showingHours = false;
      $hours.addClass('tp-header-time-inactive');
      $minutes.removeClass('tp-header-time-inactive');
      $clockMinutes.removeClass('tp-disabled');
      $clock12Hours.addClass('tp-disabled');
      $clock24Hours.addClass('tp-disabled');
      updatePointer(m);
    }
  }

  function updatePointer() {
    var to;
    if (showingHours) {
      if (mode12h) {
        to = (h % 12) * 5;
      } else {
        to = (h ? (h == 12 ? 0 : h) : 12) * 5;
      }
    } else {
      to = m;
    }
    $pointer.css('transform', 'rotateZ(' + (to % 60) * 6 + 'deg)');
    $clip.removeClass(getPointerClass());
    if (to < 60) {
      $pointer.removeClass('tp-clock-pointer-inner');
    } else {
      $pointer.addClass('tp-clock-pointer-inner');
    }
    pointsTo = to;
    $clip.addClass(getPointerClass());
  }

  function getPointerClass() {
    return (pointsTo < 60) ? 'tp-clock-number-' + pointsTo : 'tp-clock-inner-number-' + (pointsTo - 60);
  }

  function hide(ok) {
    if (inited) {
      $popup.addClass('tp-disabled').addClass('tp-popup-invisible');
    }
    if (ok) {
      if (onOk)
        onOk(h, m, okData);
    } else {
      if (onCancel)
        onCancel();
    }
    okData = null;
  }

  return {
    show: show,
    hide: hide,
    formatTime: formatTime
  };
})();
