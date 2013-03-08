(function() {

var assert = buster.assert;

buster.testCase(
  "code path",
  {
    setUp: function() {
      var size = 3500;
      var testData = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);

      console.log("use typedarray:", USE_TYPEDARRAY);

      this.testData = testData;
      this.raw = sinon.spy(window, "_compress_deflate");
      this.zlib = sinon.spy(window, "_compress_zlib");
      this.gzip = sinon.spy(window, "_compress_gzip");
    },
    tearDown: function() {
      this.raw.restore();
      this.zlib.restore();
      this.gzip.restore();
    },
    "raw": function() {
      makeRandomData(this.testData);
      inflateTest(Zopfli.RawDeflate, Zlib.RawInflate, this.testData);

      assert(this.raw.called);
      refute(this.zlib.called);
      refute(this.gzip.called);
    },
    "zlib": function() {
      makeRandomData(this.testData);
      inflateTest(Zopfli.Deflate, Zlib.Inflate, this.testData);

      refute(this.raw.called);
      assert(this.zlib.called);
      refute(this.gzip.called);
    },
    "gzip": function() {
      makeRandomData(this.testData);
      inflateTest(Zopfli.Gzip, Zlib.Gunzip, this.testData);

      refute(this.raw.called);
      refute(this.zlib.called);
      assert(this.gzip.called);
    }
  }
);

// inflate test
function inflateTest(compressor, decompressor, testData) {
  var deflate;
  var inflate;

  // deflate
  deflate = new compressor(testData).compress();
  console.log("deflated data size:", deflate.length);

  // inflate
  inflate = (new decompressor(deflate, {
    verify: true
  })).decompress();
  console.log("inflated data size:", inflate.length)

  // assertion
  assert(inflate.length, testData.length);
  assert(arrayEquals(inflate, testData));
}

})();
