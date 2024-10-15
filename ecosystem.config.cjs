module.exports = {
  apps: [
    {
      /** Change the name to project name */
      name: "SimpleO-FE",
      script: "./build/server.mjs",
      instances: "1",
      exec_mode: "fork",
      max_restarts: 5,
      restart_delay: 1000,
    },
    {
      name: "Test-API",
      script: "./build/testApi.js",
      instances: "1",
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        ENV: "production",
      },
      max_restarts: 5,
      restart_delay: 1000,
    },
  ],
};
