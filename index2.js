const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const server = http.createServer(callbackServer);
server.listen(5500, () => {
  console.log("server running");
});


const routers = {
  index: (data, callback) => {
    callback(200, { message: "estas en /index" });
  },
  noEncontrado: (data, callback) => {
    callback(404, { message: "ruta no encontrada" });
  },
};

  function callbackServer(req, res) {
  const urlActual = req.url;
  const urlParceada = url.parse(req.url, true);

  const path = urlParceada.pathname.replace(/^\/+|\/+$/g, "");
  const { method, headers = {} } = req;
  const { query = {} } = urlParceada;

  // recibir el payload
  const decoder = new StringDecoder("utf-8");
  let buffer = "";

  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", (data) => {
    buffer += decoder.end();

    // Ordenar la data del request
    data = {
      ruta: path,
      query,
      method,
      headers,
      payload: buffer,
    };

    // Elejir el manejador (handler)
    let handler;
    if (path && routers[path]) {
      handler = routers[path];
    } else {
      handler = routers["noEncontrado"];
    }

    // ENVIO RESPUESTA DEL SERVER
    if (typeof handler === "function") {
      handler(data, (statusCode = 200, message) => {
        const response = JSON.stringify(message);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);

        res.end(response);
      });
    } else {
      res.end("Algo salio mal, intenta de nuevo");
    }
  });
  // fin payload

}

