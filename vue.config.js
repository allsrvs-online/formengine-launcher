const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    workboxOptions: {
      exclude: [/\.htaccess$/],
    },
  },
});
