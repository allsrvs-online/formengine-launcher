const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  workboxOptions: {
    exclude: [/\.htaccess$/],
  },
});
