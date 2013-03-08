goog.provide('Zopfli.RawDeflate');
goog.require('Zopfli');

/**
 * @param {(Array.<number>|Uint8Array)} input
 * @param {Object=} opt_params
 * @constructor
 */
Zopfli.RawDeflate = function(input, opt_params) {
  opt_params = opt_params || {};
  /** @type {Array.<number>|Uint8Array} */
  this.input = input;
  /** @type {number} */
  this.iterations = (typeof opt_params['iterations'] === 'number') ?
    opt_params['iterations'] : 15;
};

Zopfli.RawDeflate.prototype.compress = function() {
  /** @type {Array.<number>|Uint8Array} */
  var input = this.input;
  /** @type {number} */
  var bufferOffset;
  /** @type {number} */
  var bufferSize;
  /** @type {number} */
  var ctx = _create_exporter();
  /** @type {number} */
  var output;

  try {
    ccallFunc(
      _compress_deflate,
      void 0,
      ["number", "array", "number", "number"],
      [ctx, input, input.length, this.iterations]
    );
    bufferOffset = _get_buffer(ctx);
    bufferSize = _get_buffer_size(ctx);
    output = new Uint8Array(HEAP8.subarray(bufferOffset, bufferOffset + bufferSize));
  } finally {
    _free_exporter(ctx);
  }

  return output;
};

goog.exportSymbol('Zopfli.RawDeflate', Zopfli.RawDeflate);
goog.exportSymbol(
  'Zopfli.RawDeflate.prototype.compress',
  Zopfli.RawDeflate.prototype.compress
);
