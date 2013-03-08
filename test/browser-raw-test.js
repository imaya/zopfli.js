(function() {

var assert = buster.assert;

buster.testCase(
  'raw',
  {
    setUp: function() {
      var size = 3500;
      var testData = new (USE_TYPEDARRAY ? Uint8Array : Array)(size);

      console.log("use typedarray:", USE_TYPEDARRAY);

      this.testData = testData;
    },

    "random data":
      function() {
        makeRandomData(this.testData);
        inflateTest('random', this.testData);
      },
    "sequential data":
      function() {
        makeSequentialData(this.testData);
        inflateTest('sequential', this.testData);
      },
    "random sequential data":
      function() {
        makeRandomSequentialData(this.testData);
        inflateTest('random sequential', this.testData);
      }
  }
);

// inflate test
function inflateTest(mode, testData, inflateOption) {
  var deflate;
  var inflate;

  console.log("mode:", mode);

  // deflate
  deflate = new Zopfli.RawDeflate(testData, {iterations: 1}).compress();
  console.log("deflated data size:", deflate.length);

  // inflate
  if (inflateOption) {
    inflateOption.verify = true;
  } else {
    inflateOption = {verify: true};
  }
  inflate = new Zlib.RawInflate(deflate, inflateOption).decompress();
  console.log("inflated data size:", inflate.length);

  // assertion
  assert(inflate.length, testData.length);
  assert(arrayEquals(inflate, testData));
}

})();
