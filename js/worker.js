importScripts("zopfli.min.js", "inflate.min.js", "crc32.min.js", "recompress.js");

this.addEventListener('message', function(ev) {
  var data = ev.data;
  var start;
  var end;
  var output;

  switch (data.type) {
    case 'raw':
      start = Date.now();
      output = new Zopfli.RawDeflate(data.data, data.option).compress();
      end = Date.now();
      break;
    case 'zlib':
      start = Date.now();
      output = new Zopfli.Deflate(data.data, data.option).compress();
      end = Date.now();
      break;
    case 'gzip':
      start = Date.now();
      output = new Zopfli.Gzip(data.data, data.option).compress();
      end = Date.now();
      break;
    case 'png':
      start = Date.now();
      output = new PNGRecompressor(data.data, data.option).recompress();
      end = Date.now();
      break;
  }

  this.postMessage({
    data: output,
    time: end - start | 0
  });
}, false);