module.exports = {
  swSrc: 'src/custom-sw.js',    // Your custom SW source file
  swDest: 'build/custom-sw.js', // Output file after injection
  globDirectory: 'build',       // Folder to cache files from (CRA build output)
  globPatterns: ["**/*.{html,js,css,woff2,woff,json}"],
};

