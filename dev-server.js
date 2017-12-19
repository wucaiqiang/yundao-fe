var path = require("path");
var express = require("express");
var webpack = require("webpack");
var http = require("http");
var url = require("url");
var fs = require("fs");
var process = require("process");
var config = require("./tools/build/config/webpack-config.dev.babel");
var WebpackDevServer = require("webpack-dev-server");

var webpackDevMiddleware = require("webpack-dev-middleware");
var webpackHotMiddleware = require("webpack-hot-middleware");


var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});



var nconf = require("nconf");

require("babel-register")({
  presets: ["es2015", "stage-2", "react"]
});

var defaultConfig = path.resolve(__dirname, "app", "config/default.json");

nconf
  .argv()
  .env()
  .file({ file: defaultConfig })
  .defaults({ ENV: "development" });

var env = process.env.mode || "local";

var assetsManager = require("./app/infra/assets-manager").default;
var configManager = require("./app/infra/config-manager").default;
var middlewareManager = require("./app/infra/middleware-manager").default;
var baseManager = require("./app/infra/base-manager").default;

var matchRoutes = require("react-router-config").matchRoutes;

var apiConfig = require("./app/config/api-config").default;
apiConfig.setEnv(env);
// var routes =require("./app/routes-server").default

var port = nconf.get("port");
// var port = 3001

var app = express();

var compiler = webpack(config);


var devServerConfig = {
  contentBase: path.join(__dirname, "dev/"),
  publicPath: config.output.publicPath,
  hot: true,
  compress: true,
  disableHostCheck: true,//解决其它机器不能访问问题
  historyApiFallback: true,
  setup: app => {
    configManager.handle(app);
    middlewareManager.handle(app);
    assetsManager.handle(app);
    if (env == "mock") {
      app.all("/api/*", (req, res) => {
        let url = req.url.replace("api", "mock");
        url = url.split("?")[0];
        url = url.split("&")[0];
        url = url + (url[url.length - 1] == "/" ? "index.json" : ".json");
        fs.readFile(`./${url}`, "utf-8", (err, content) => {
          // callback(err, JSON.parse(content));
          res.send(content);
        });
      });
    } else {
      app.all("/api/*", (req, res) => {
        // req.url = req.url.replace("/api/", "");
        // proxy.web(req, res, {target:apiConfig.getApi()});
        let url = apiConfig.getApi() + req.url.replace("/api/", "");
        console.log("request proxy url:", url);

        
        transpondAndWrite(url, req, res);

        //更新Mock
        
      });
    }

    // app.all('/assets/*',(req,res)=>{

    // })

    //     // app.get('/assets/*', (req, res) => {

    //     //     fs.readFile(`./${url}index.json`, "utf-8", (err, content) => {
    //     //         // callback(err, JSON.parse(content));
    //     //         res.send(content)
    //     //     });
    //     // })
  }
};

var server = new WebpackDevServer(compiler, devServerConfig);
server.listen(port);

function transpondAndWrite(reqUrl, req, res) {
  var clientRequest, options, accept, isPage;
  accept = req.headers.accept;
  // if (accept) {
  //   accept = accept.split(",");
  //   if ("text/html" == accept[0]) {
  //     isPage = 1;
  //   }
  // }
  reqUrl = url.parse(reqUrl);
  options = {
    method: "get"
  };
  Object.assign(options, {
    host: reqUrl.hostname,
    path: reqUrl.path,
    port: reqUrl.port,
    method: req.method,
    headers: req.headers
  });
  console.log('options',options)

  clientRequest = http.request(options, function(clientResponse) {
    var headers, k, v, source, bufferHelper;

    clientResponse.setEncoding('utf8');

    headers = clientResponse.headers;
    res.statusCode = clientResponse.statusCode;

    for (k in headers) {
      v = headers[k];
      res.setHeader(k, v);
    }

    req.req = clientResponse.req;

    clientResponse.on("data", function(data) {
      console.log('data',data)
      res.write(data);
    });

    clientResponse.on("end", function() {
      res.end();
    });
  });

  clientRequest.on("error", function(e) {
    console.log("clientRequest error");
    console.log(reqUrl.href);
    console.log(e);
  });

  req.on("data", function(data) {
    console.log('data',data)
    clientRequest.write(data);
  });

  req.on("end", function(data) {
    clientRequest.end();
  });
  return req
}
