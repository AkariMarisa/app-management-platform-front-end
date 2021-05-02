const { getDefaultSettings } = require('http2')
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: 'static',
  devServer: {
    port: 8080,
    host: 'localhost',
    proxy: {
      "/dev-api": {
        target: "http://127.0.0.1:8090/api/v1/web",
        pathRewrite: {"^/dev-api" : ""}
      }
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap(options => Object.assign(options, { limit: 10240000 }))
  }
}
