function PNGRecompressor(input, opt_params) {
  opt_params = opt_params || {};
  /** @type {Uint8Array} */
  this.input = input;
  /** @type {number} */
  this.iterations = (typeof opt_params['iterations'] === 'number') ?
    opt_params['iterations'] : 15;
}

PNGRecompressor.prototype.arrayToString = function(array, start, end) {
  return String.fromCharCode.apply(null, array.subarray(start, end));
};

PNGRecompressor.prototype.recompress = function() {
  var input = this.input;
  var ipos = 0;
  var output = new Uint8Array(input.length * 2);
  var opos = 0;
  var idat_buffer = new Uint8Array(input.length);
  var dpos = 0;
  var insize = input.length;
  var outsize;
  var chunkLength;
  var chunkType;
  var width;
  var height;
  var depth;
  var type;
  var compress;
  var filter;
  var interlace;
  var plain;
  var compressed;
  var crc32;

  /* check signature */
  if (this.arrayToString(input, 0, 8) !== "\x89\x50\x4e\x47\x0d\x0a\x1a\x0a") {
    throw new Error('invalid signature:' + this.arrayToString(input, 0, 8));
  }

  output.set(input.subarray(ipos, ipos+=8));
  opos += 8;

  // parse chunks
  do {
    // Length
    chunkLength =
      (input[ipos++] << 24) | (input[ipos++] << 16) |
      (input[ipos++] <<  8) | (input[ipos++] <<  0);

    // Type
    chunkType = this.arrayToString(input, ipos, ipos + 4);

    switch (chunkType) {
      case "IHDR":
        output.set(input.subarray(ipos - 4, ipos + chunkLength + 8), opos);
        ipos += 4;

        // image information
        width     =
          (input[ipos++] << 24) | (input[ipos++] << 16) |
          (input[ipos++] <<  8) | (input[ipos++] <<  0);
        height    =
          (input[ipos++] << 24) | (input[ipos++] << 16) |
          (input[ipos++] <<  8) | (input[ipos++] <<  0);
        depth     = input[ipos++];
        type      = input[ipos++];
        compress  = input[ipos++];
        filter    = input[ipos++];
        interlace = input[ipos++];

        // decide image buffer size
        var plain_size = width * height *
          // bitdepth
          (depth == 16 ? 2 : 1) *
          // alpha
          ((type & 0x4) != 0 ? 4 : 3) +
          // filter byte
          height;

        ipos += 4;
        opos += chunkLength + 12;
        break;
      case "IDAT":
        ipos += 4;

        // concat idat
        idat_buffer.set(input.subarray(ipos, ipos += chunkLength), dpos);
        ipos += 4;
        dpos += chunkLength;
        break;
      case "IEND":
        // recompress
        plain = new Zlib.Inflate(idat_buffer.subarray(0, dpos), {
          'bufferSize': plain_size
        }).decompress();
        compressed = new Zopfli.Deflate(plain, {
          'iterations': this.iterations
        }).compress();
        outsize = compressed.length;

        // output idat chunk length
        output[opos++] = (outsize >> 24) & 0xff;
        output[opos++] = (outsize >> 16) & 0xff;
        output[opos++] = (outsize >>  8) & 0xff;
        output[opos++] = (outsize      ) & 0xff;

        // output idat chunk type
        output.set([73, 68, 65, 84], opos)
        opos += 4;

        // output idat chunk data
        output.set(compressed, opos);
        opos += outsize;

        // output idat chunk crc
        crc32 = Zlib.CRC32.calc([73, 68, 65, 84]);
        crc32 = Zlib.CRC32.update(compressed, crc32);
        output[opos++] = crc32 >> 24;
        output[opos++] = crc32 >> 16;
        output[opos++] = crc32 >>  8;
        output[opos++] = crc32;

        // output iend
        output.set(input.subarray(ipos - 4, ipos + chunkLength + 8), opos);
        ipos += chunkLength + 8;
        opos += chunkLength + 12;
        break;
      default:
        // skip current chunk
        output.set(input.subarray(ipos - 4, ipos + chunkLength + 8), opos);
        ipos += chunkLength + 8;
        opos += chunkLength + 12;
        break;
    }
  } while (ipos < insize);

  output = new Uint8Array(output.subarray(0, opos));

  return output;
};
