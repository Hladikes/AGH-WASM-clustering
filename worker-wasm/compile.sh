#!/bin/bash
docker run \
  --rm \
  -v $(pwd):/src \
  -u $(id -u):$(id -g) \
  emscripten/emsdk \
  emcc main.cpp -o main.mjs \
  --no-entry \
  -O3 \
  -s TOTAL_MEMORY=2048MB \
  -s WASM=1 \
  -s EXPORTED_FUNCTIONS='["_do_centroids", "_malloc", "_free"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall"]' \
  -s EXPORT_ES6=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME=loadWASM