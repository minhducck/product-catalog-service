const TerserPlugin = require('terser-webpack-plugin');
module.exports = (options, webpack) => {
  const lazyImports = [
    // '@nestjs/microservices/microservices-module',
    // '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    externals: [],
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
          },
        }),
      ],
    },

    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
  };
};
