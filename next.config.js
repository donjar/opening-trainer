const withTM = require("next-transpile-modules")(["react-chessground"]);

module.exports = withTM({
  reactStrictMode: true,
  experimental: {
    esmExternals: "loose",
  },
});
