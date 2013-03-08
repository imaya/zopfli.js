NodeList.prototype.forEach = Array.prototype.forEach;

window.addEventListener('DOMContentLoaded', onload, false);
function onload(e) {
  window.removeEventListener('DOMContentLoaded', onload, false);

  var demo = new ZopfliDemo();
  demo.setEvents();
}

/**
 * @constructor
 */
function ZopfliDemo() {
  /** @type {string} */
  this.compressionMode;
  /** @type {Worker} */
  this.worker;
  /** @type {Element} */
  this.result = document.getElementById('result');
  /** @type {string} */
  this.srcFileName;
  /** @type {number} */
  this.srcFileSize;
}

ZopfliDemo.prototype.setEvents = function() {
  var demo = this;

  // compression type
  $('.dropdown-toggle').dropdown();
  document.querySelectorAll('.dropdown-menu > li > a').forEach(function(element) {
    element.addEventListener('click', function(ev) {
      ev.preventDefault();

      document.getElementById('compression-type').innerHTML =
        element.textContent + '&nbsp;<span class="caret"></span>';
      demo.compressionType = element.getAttribute('data-value');
    }, false);
  });

  // zopfli parameter


  // file handler
  document.getElementById('file').addEventListener('change', function(ev) {
    var files = ev.target.files;
    var file;
    var reader = new FileReader();

    if (files.length === 0) {
      demo.error('file not selected');
      return;
    }

    file = files[0];

    // validate png recompression
    if (demo.compressionType === 'png' && file.type !== 'image/png') {
      demo.error(file.name + ' is not PNG');
      return;
    }

    reader.addEventListener('load', function loaded(ev) {
      reader.removeEventListener('load', loaded, false);

      var data = new Uint8Array(ev.target.result);
      demo.srcFileName = file.name;
      demo.srcFileSize = data.length;
      demo.processData(data);
    });
    reader.readAsArrayBuffer(file);

  }, false);

};

ZopfliDemo.prototype.processData = function(input) {
  var worker = this.worker;

  if (this.compressionType === void 0) {
    this.error('compression type not selected');
    return;
  }

  if (this.worker === void 0) {
    worker = this.createWorker();
  }

  $('#modal').modal({backdrop: 'static', keyboard: false});

  worker.postMessage({
    type: this.compressionType,
    data: input,
    option: {
      iterations: (document.getElementById('iterations').valueAsNumber | 0)
    }
  })
};

ZopfliDemo.prototype.createWorker = function() {
  var demo = this;
  var worker = this.worker = new Worker("./js/worker.js");

  worker.addEventListener('message', function(ev) {
    demo.handleWorkerMessage.call(demo, ev);
  }, false);

  worker.addEventListener('error', function(ev) {
    demo.error(ev.message);
  }, false);

  return worker;
};

ZopfliDemo.prototype.handleWorkerMessage = function(ev) {
  var message = ev.data;
  var data = message.data;
  var time = message.time;
  var type;
  var ext;
  var compressedName;
  var objectURL;

  $('#modal').modal('hide');
  this.resetFile();

  // MIME type, extname
  switch (this.compressionType) {
    case 'defalte':
      ext = '.deflate';
      break;
    case 'zlib':
      ext = '.zlib';
      break;
    case 'gzip':
      type = 'application/x-gzip';
      ext = '.gz';
      break;
    case 'png':
      type = 'image/png';
      ext = this.srcFileName.substr(-4, 4) === '.png' ? '' : '.png';
      break;
  }

  compressedName = this.srcFileName + ext;
  objectURL = createObjectURL(data, type);

  this.result.setAttribute('class', '');
  this.result.innerHTML = [
    '<table class="table table-bordered table-striped">',
      '<colgroup>',
        '<col class="span2">',
        '<col class="span6">',
      '</colgroup>',
      '<tbody>',
        '<tr><th>Filename</th>',        '<td>', this.srcFileName,                          '</td></tr>',
        '<tr><th>Source Size</th>',     '<td>', numeralCommas(this.srcFileSize), ' Bytes', '</td></tr>',
        '<tr><th>Compressed Size</th>', '<td>', numeralCommas(data.length),      ' Bytes', '</td></tr>',
        '<tr><th>Process Time</th>',    '<td>', numeralCommas(time),             ' ms',    '</td></tr>',
        '<tr><th>Download</th>',        '<td>',
          '<a href="', objectURL, '" download="', compressedName, '">',
          compressedName,
          '</a>',
        '</td></tr>',
        this.compressionType === 'png' ?
          '<tr><th>Preview</th><td><img class="span5 preview" src="' + objectURL + '"></td></tr>' : '',
      '</tbody>',
    '</table>'
  ].join('');
};

ZopfliDemo.prototype.error = function(message) {
  $('#modal').modal('hide');
  this.result.setAttribute('class', 'alert alert-error');
  this.result.textContent = message;
  this.resetFile();
};

ZopfliDemo.prototype.resetFile = function() {
  var event = document.createEvent('Event');
  event.initEvent('click', false, false);
  document.getElementById('filereset').dispatchEvent(event);
};

function numeralCommas(number) {
  return ("" + number).replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, "$1,");
}

//
// create object url
//
function createObjectURL(array, type) {
  var useTypedArray = (typeof Uint8Array !== 'undefined');
  var isSafari = (
    navigator.userAgent.indexOf('Safari') !== -1 &&
      navigator.vendor.indexOf('Apple')     !== -1
    );
  var data = '';
  var bb;
  var blob;
  var tmp;
  var i;
  var il;

  if (useTypedArray) {
    array = new Uint8Array(array);
  }

  // avoid blob url in safari
  if (!isSafari) {

    // Blob constructor
    try {
      blob = new Blob([array], {type: type});
    } catch(e) {
    }

    // BlobBuilder
    if (
      (tmp = window.WebkitBlobBuilder) !== void 0 ||
        (tmp = window.MozBlobBuilder) !== void 0 ||
        (tmp = window.MSBlobBuilder) !== void 0
      ) {
      bb = new tmp();
      bb.append(array.buffer);
      blob = bb.getBlob(type);
    }

    // createObjectURL
    if (blob && (
      ((tmp = window.URL)       && tmp.createObjectURL) ||
        ((tmp = window.webkitURL) && tmp.createObjectURL)
      )) {
      return tmp.createObjectURL(blob);
    }
  }

  // DataURL
  for (i = 0, il = array.length; i < il;) {
    data += String.fromCharCode.apply(
      null,
      useTypedArray ?
        array.subarray(i, i+= 0x7fff) :
        array.slice(i, i += 0x7fff)
    );
  }

  return 'data:' + type + ';base64,'+ window.btoa(data);
}

