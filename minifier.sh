#!/bin/sh

minify () {
  curl -s \
    -d compilation_level=SIMPLE_OPTIMIZATIONS \
    -d output_format=text \
    -d output_info=compiled_code \
    --data-urlencode "js_code@${1}.js" \
    http://closure-compiler.appspot.com/compile \
    > "${1}.min.js"
}

minify PorterStemmer1980
minify PorterStemmer2
