// config-overrides.js
const { override, addWebpackPlugin } = require('customize-cra');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const path = require('path');

module.exports = override(
  addWebpackPlugin(
    new WorkboxWebpackPlugin.InjectManifest({
      swSrc: path.resolve(__dirname, 'src', 'custom-sw.js'),
      swDest: 'service-worker.js',
    })
  )
);
