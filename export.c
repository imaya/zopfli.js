#include <stdio.h>
#include "zopfli/zopfli.h"
#include "zopfli/deflate.h"
#include "zopfli/zlib_container.h"
#include "zopfli/gzip_container.h"

ZopfliOptions create_options(int iterations) {
  ZopfliOptions options;

  ZopfliInitOptions(&options);
  options.numiterations = iterations;

  return options;
}

typedef struct {
  unsigned char *output_buffer;
  size_t output_buffer_size;
} zopfli_exporter_context_t;

zopfli_exporter_context_t *
create_exporter(unsigned char *input_buffer, size_t input_buffer_size) {
  zopfli_exporter_context_t *ctx;

  ctx = malloc(sizeof(zopfli_exporter_context_t));

  return ctx;
}

void
free_exporter(zopfli_exporter_context_t *ctx) {
  if (ctx != NULL) {
    if (ctx->output_buffer != NULL) {
      free(ctx->output_buffer);
      ctx->output_buffer = NULL;
    }
    free(ctx);
    ctx = NULL;
  }
}

unsigned char *
get_buffer(zopfli_exporter_context_t *ctx) {
  return ctx->output_buffer;
}

size_t
get_buffer_size(zopfli_exporter_context_t *ctx) {
  return ctx->output_buffer_size;
}

void
compress_deflate(zopfli_exporter_context_t *ctx, unsigned char *buffer, size_t bufferlen, int iterations) {
  ZopfliOptions options;
  unsigned char *out;
  size_t outsize;
  unsigned char bit_point = 0;

  outsize = 0;
  out = 0;
  options = create_options(iterations);
  ZopfliDeflate(&options, 2, 1, buffer, bufferlen, &bit_point, &out, &outsize);

  ctx->output_buffer = out;
  ctx->output_buffer_size = outsize;

  return;
}

void
compress_zlib(zopfli_exporter_context_t *ctx, unsigned char *buffer, size_t bufferlen, int iterations) {
  ZopfliOptions options;
  unsigned char *out;
  size_t outsize;

  outsize = 0;
  out = 0;
  options = create_options(iterations);
  ZopfliZlibCompress(&options, buffer, bufferlen, &out, &outsize);

  ctx->output_buffer = out;
  ctx->output_buffer_size = outsize;

  return;
}

void
compress_gzip(zopfli_exporter_context_t *ctx, unsigned char *buffer, size_t bufferlen, int iterations) {
  ZopfliOptions options;
  unsigned char *out;
  size_t outsize;

  outsize = 0;
  out = 0;
  options = create_options(iterations);
  ZopfliGzipCompress(&options, buffer, bufferlen, &out, &outsize);

  ctx->output_buffer = out;
  ctx->output_buffer_size = outsize;

  return;
}

