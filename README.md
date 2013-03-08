zopfli.js
=========

## About

Porting [Zopfli](https://code.google.com/p/zopfli/) to JavaScript with [Emscripten](https://github.com/kripken/emscripten).

## Usage

Use one in "bin" directory.

- zopfli.min.js: Deflate + Zlib + Gzip
- zopfli.raw.min.js: Deflate
- zopfli.zlib.min.js: Zlib
- zopfli.gzip.min.js: Gzip

### Compression

#### RawDeflate

```js
/** @type {(Array.<number>|Uint8Array)} */
var plain = [1, 2, 3, 4];

/** @type {Zopfli.Deflate} */
var compressor = new Zopfli.RawDeflate(plain);

/** @type {Uint8Array} */
var compressed = compressor.compress();
```

#### Zlib

```js
/** @type {(Array.<number>|Uint8Array)} */
var plain = [1, 2, 3, 4];

/** @type {Zopfli.Deflate} */
var compressor = new Zopfli.Deflate(plain);

/** @type {Uint8Array} */
var compressed = compressor.compress();
```

#### Gzip

```js
/** @type {(Array.<number>|Uint8Array)} */
var plain = [1, 2, 3, 4];

/** @type {Zopfli.Deflate} */
var compressor = new Zopfli.Gzip(plain);

/** @type {Uint8Array} */
var compressed = compressor.compress();
```

### Compression Option

Second argument of constructor functions.

```js
{
    'iterations': number // Zopfli iterations parameter (Default: 15)
}
```

## How to Build

### Requirement

- Ant 1.8+
- JRE 1.6+
- Emscripten's Dependencies

### Build

Use "ant" command.

```
$ ant [target]
```

#### Build target

target  | generate file        | implementation
--------|----------------------|-------------
debug   | zopfli.debug.min.js  | -
plain   | zopfli.plain.min.js  | -
deflate | zopfli.raw.min.js    | Raw Deflate
zlib    | zopfli.zlib.min.js   | ZLIB Deflate
gzip    | zopfli.gzip.min.js   | GZIP
all     | *                    | default target

## License

Apache License 2.0

