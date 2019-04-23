const prettier = require("prettier/standalone");
const plugins = [require("prettier/parser-babylon")];
const Terser = require("terser")
const flowPlugin = require('@babel/plugin-transform-flow-strip-types')

const plugin = require('./babel')
const makeWrapper = require('./wrapper')
const { transform, babelify } = require('./transform')

exports.transpile = async (src, { 
  minify = false,
  minifyOpts = {},
  prettier = false,
  prettierOpts = {},
  context = "/" }) => {

  src = await transform(src, context)

  // The decorated plugins should append this, but for now we add here to simplify
  // src += ';const __contract = new __contract_name();const __metadata = {}'
  // then, babelify it
  src = babelify(src, [plugin])

  // remove flow types
  src = babelify(src, [flowPlugin])

  // finally, wrap it
  src = makeWrapper(src).trim()

  // preparation for minified
  src = prettify(src, {semi: true})

  if (prettier) {
    src = prettify(src, prettierOpts)
  } else if (minify) {
    src = doMinify(src, minifyOpts)
  }

  // console.log(src)

  return src
}

function prettify(src, opts = {}) {
  return prettier.format(src, { parser: "babel", plugins });
}

function doMinify(src, opts = {}) {
  const result = Terser.minify(src, {
    parse: {
      bare_returns: true
    },
    keep_classnames: true,
    keep_fnames: true,
    ...opts
  })
  if (result.error) {
    throw new Error(JSON.stringify(result.error))
  }
  return result.code
}