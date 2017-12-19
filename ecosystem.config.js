module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    {
      name: "yundao-saas",
      script: "./app/babel-server.js",
      exec_mode: "cluster_mode",
      error_file: "./log/error.log",
      out_file: "./log/out.log"
    }
  ]
};
