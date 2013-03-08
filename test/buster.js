/**
 * unit test settings for BusterJS.
 */
var config = module.exports;

// ブラウザ共通設定
var browserCommon = {
    rootPath: "../",
    environment: "browser",
    libs: [
      "closure-primitives/base.js",
      "vendor/mt.js/mt.js",
      "test/use_typedarray.js",
      "test/util.js",
      "vendor/zlib.js/bin/rawinflate.min.js",
      "vendor/zlib.js/bin/inflate.min.js",
      "vendor/zlib.js/bin/gunzip.min.js"
    ],
    tests: [
      'test/browser-raw-test.js',
      'test/browser-zlib-test.js',
      'test/browser-gzip-test.js'
    ]
};

// ブラウザでコンパイル前のテスト
config["codepath"] = mixin(
  mixin({}, browserCommon),
  {
    libs: [
      "bin/zopfli.plain.js",
      //"patch/*.js",
      "export/*.js"
    ],
    tests: [
      'test/browser-codepath-test.js'
    ]
  }
);

// 個別ビルド版のテスト
config["respectively build"] = mixin(
  mixin({}, browserCommon),
  {
    libs: [
      "bin/zopfli.raw.min.js",
      "bin/zopfli.zlib.min.js",
      "bin/zopfli.gzip.min.js"
    ]
  }
);

// まとめてビルド版のテスト
config["full build"] = mixin(
  mixin({}, browserCommon),
  {
    libs: [
      "bin/zopfli.min.js"
    ]
  }
);


// config mixin
function mixin(dst, src) {
  var i;

  for (i in src) {
    if (dst[i] instanceof Array && src[i] instanceof Array) {
      dst[i] = dst[i].concat(src[i]);
    } else if (typeof dst[i] === 'object' && typeof src[i] === 'object') {
      mixin(dst[i], src[i]);
    } else {
      dst[i] = src[i];
    }
  }

  return dst;
}
