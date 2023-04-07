const http = require("http");
const url = require("url");
const server = http.createServer(Users);
server.listen(5500, console.log("¡The server users is running now!"));

const { clearTimeout, clearInterval } = require("timers");
const { isUtf8 } = require("buffer");
const StringDecoder = require("string_decoder").StringDecoder;

// CORS opciones en json
const corsOptions = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  Credentials: "false",
  "Access-Control-Allow-Methods": "POST, GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Allow, Origin, X-Requested-With, X-API-KEY, Content-Type, Accept, Accept-Encoding, Access-Control-Request-Method, Connection, User-Agent, Host, Token",
  AllowedHeaders: "Content-Type, Authorization",
};

global.users = null; // array de usuarios
let timer = 0; // variable de tiempo para reseteo de usuarios
let onTimer = false; // controlador del timer de reseteo de usuarios
const timeReset = 300; // tiempo para resetear el array usuarios  (en segundos)

// FUNCTION PRINCIPAL DEL SERVER
function Users(req, res) {
  // Creo variables y las asigno con los datos del Request
  const urlParseada = url.parse(req.url, true);
  const { query = {} } = urlParseada;
  const { method, headers } = req;
  const path = urlParseada.pathname.replace(/^\/+|\/+$/g, "");
  const handler = router[method.toLowerCase()];
  let codeStatus;

  // Permisos CORS sencillo
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  // Finalizar si el method es OPTIONS
  if (method.toLowerCase() === "options"){
    res.writeHead(200);
      res.end();
      return;
  }

  switch (method.toLowerCase()) {
    case "get":
      codeStatus = 200;
      break;
    case "delete":
      codeStatus = 204;
      break;
    case "patch":
      codeStatus = 201;
      break;
    case "post":
      codeStatus = 201;
      break;
  }

  // Almacenamos el payload en el buffer
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", (data) => {
    buffer += decoder.end();
    data = {
      path,
      method,
      query,
      headers,
      payload: buffer,
    };
    SendServerResponse(data);
  });

  function SendServerResponse(data) {
    // res.setHeader("Content-Type", "application/json");

    if (typeof handler === "function") {
      // res.writeHead(codeStatus);
      res.writeHead(codeStatus,corsOptions);
      res.end(JSON.stringify(handler(data)));
    } else {
      res.writeHead(400);
      res.end(JSON.stringify({ Error: "Bad Request" }));
    }

    setTimer(true);
  }
}

if (!users) {
  ResetUsers();
}

function ResetUsers() {
  users = [];
  for (let i = 0; i < 5; i++) {
    users.push({ name: "user " + i, body: "description " + i });
  }
}

// const router = require("./router");
const router = {
  // parseInt(path);
  get: ({ path }) => {
    const ind = path;
    if (ind) {
      return users[ind];
    } else {
      return users;
    }
  },
  post: ({ query, payload }) => {
    payload = JSON.parse(payload);
    if (Object.entries(query).length !== 0) {
      users.push(query);
    } else if (Object.entries(payload).length !== 0) {
      users.push(payload);
    }
    return {message: 'User added'};
  },
  delete: ({ path }) => {
    const ind = path;
    users = users.filter((user, i) => {
      return i != ind;
    });
    return {message: 'User deleted'};
  },
  patch: ({ path, query, payload }) => {
    const ind = path;
    payload = JSON.parse(payload);
    users = users.map((user, i) => {
      if (i == ind) {
        if (Object.entries(query).length !== 0) {
          return query;
        } else if (Object.entries(payload).length !== 0) {
          return payload;
        }
      } else {
        return user;
      }
    });
    return {message: 'User updated'};
  }
};

let ContarSeg;
function OnContarSeg() {
  if (onTimer === true) {
    ContarSeg = setInterval(() => {
      setTimer();
    }, 1000);
  } else {
    timer = 0;
    clearInterval(ContarSeg);
  }
}

const setTimer = (isOn) => {
  clearInterval(ContarSeg);

  if (isOn === false) {
    // console.log("setTimer off");
    onTimer = false;
  }
  if (isOn === true) {
    // console.log("setTimer on");
    timer = 0;
    onTimer = true;
  }
  if (!isOn) {
    if (onTimer === true && timer < timeReset) {
      // console.log("setTimer sumando 1 a timer");
      timer += 1;
    } else {
      console.log("Time Out, Array users is reseted");
      onTimer = false;
      ResetUsers();
    }
  }
  if (onTimer === true) {
    OnContarSeg();
  }
};
