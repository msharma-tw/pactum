const polka = require('polka');

const Interaction = require('./Interaction.model');
const helper = require('../helpers/helper');
const utils = require('../helpers/utils');
const log = require('../exports/logger').get();
const hr = require('../helpers/handler.runner');
const rlc = require('../helpers/reporter.lifeCycle');
const th = require('../helpers/toss.helper');
const processor = require('../helpers/dataProcessor');
const reporter = require('../exports/reporter');
const config = require('../config');

class Server {

  constructor() {
    this.app = null;
    this.interactions = new Map();
  }

  start() {
    return new Promise((resolve) => {
      if (!this.app) {
        this.app = polka();
        this.app.use(bodyParser);
        registerPactumRemoteRoutes(this);
        registerAllRoutes(this, this.app);
        this.app.listen(config.mock.port, () => {
          log.info(`Mock server is listening on port ${config.mock.port}`);
          resolve();
        });
      } else {
        log.warn(`Mock server is already running on port ${config.mock.port}`);
        resolve();
      }
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (this.app) {
        this.app.server.close(() => {
          this.app = null;
          log.info(`Mock server stopped on port ${config.mock.port}`);
          resolve();
        });
      } else {
        log.warn(`Mock server is not running on port ${config.mock.port}`);
        resolve();
      }
    });
  }

  addInteraction(id, interaction) {
    this.interactions.set(id, interaction);
    const { method, path } = interaction.request;
    log.debug(`Interaction added to Server with id - ${id} | ${method} ${path}`);
  }

  removeInteraction(id) {
    if (this.interactions.has(id)) {
      this.interactions.delete(id);
    } else {
      log.warn(`Interaction not found with id - ${id}`);
    }
  }

  clearInteractions() {
    this.interactions.clear();
  }

  getInteraction(id) {
    if (this.interactions.has(id)) {
      return this.interactions.get(id);
    } else {
      log.warn(`Interaction Not Found - ${id}`);
      return null;
    }
  }

}

/**
 * registers all routes for interactions
 * @param {Server} server - server object
 * @param {Express} app - express app object
 */
function registerAllRoutes(server, app) {
  app.all('/*', (req, response) => {
    log.debug(`Request received - ${req.method} ${req.path}`);
    const res = new ExpressResponse(response);
    const interaction = utils.getMatchingInteraction(req, server.interactions);
    if (interaction) {
      sendInteractionFoundResponse(req, res, interaction);
    } else {
      sendInteractionNotFoundResponse(req, res);
    }
  });
}

/**
 * respond with details in interaction
 * @param {object} req - HTTP request
 * @param {ExpressResponse} res - HTTP response
 * @param {Interaction} interaction - HTTP interaction
 */
function sendInteractionFoundResponse(req, res, interaction) {
  interaction.exercised = true;
  if (interaction.stores) {
    th.storeInteractionData(req, interaction);
  }
  interaction.response = processor.processData(interaction.response);
  const interactionResponse = interaction.response;
  if (typeof interactionResponse === 'function') {
    interactionResponse(req, res);
  } else {
    let _response = {};
    if (interactionResponse[interaction.callCount]) {
      _response = interactionResponse[interaction.callCount];
    } else {
      _response = interactionResponse;
    }
    res.set(_response.headers);
    res.status(_response.status);
    const delay = getDelay(_response);
    if (delay > 0) {
      setTimeout(() => sendResponseBody(res, _response.body), delay);
    } else {
      sendResponseBody(res, _response.body);
    }
  }
  interaction.callCount += 1;
  updateCalls(req, interaction);
  rlc.afterInteraction(interaction);
}

function updateCalls(req, interaction) {
  interaction.calls.push({
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: req.headers,
      body: req.body
    },
    exercisedAt: helper.getCurrentTime()
  });
}

/**
 * sends response body
 * @param {ExpressResponse} res - HTTP response
 * @param {object} body - response body to be sent
 */
function sendResponseBody(res, body) {
  if (body) {
    res.send(body);
  } else {
    res.send();
  }
}

/**
 * returns response delay in ms
 * @param {object} response - will Respond With
 */
function getDelay(response) {
  const delay = response.delay;
  if (!delay) return 0;
  if (delay.type === 'RANDOM') {
    const min = delay.min;
    const max = delay.max;
    return Math.floor(Math.random() * (max - min)) + min;
  } else {
    return delay.value;
  }
}

/**
 * respond with not found response
 * @param {object} req - HTTP request
 * @param {ExpressResponse} res - HTTP response
 */
function sendInteractionNotFoundResponse(req, res) {
  const msg = {
    method: req.method,
    path: req.path,
    headers: req.headers,
  };
  if (req.query && typeof req.query === 'object' && Object.keys(req.query) > 0) {
    msg.queryParams = req.query;
  }
  if (req.body) {
    msg.body = req.body;
  }
  log.warn('Interaction Not Found in Mock Server', msg);
  res.status(404);
  res.send('Interaction Not Found');
}

/**
 * registers all pactum routes
 * @param {Server} server - mock server
 */
function registerPactumRemoteRoutes(server) {
  const app = server.app;
  app.all('/api/pactum/*', (req, res) => {
    switch (req.path) {
      case '/api/pactum/health':
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.write("OK");
        res.end();
        break;
      case '/api/pactum/handlers':
        handleRemoteHandler(req, res, server);
        break;
      case '/api/pactum/interactions':
        handleRemoteInteractions(req, res, server);
        break;
      case '/api/pactum/reporter/end':
        handlerRemoteReporterEnd(res);
        break;
      default:
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("404 Not Found\n");
        res.end();
        break;
    }
  });
}

function handleRemoteHandler(req, res, server) {
  try {
    const ids = [];
    for (let i = 0; i < req.body.length; i++) {
      const { name, data } = req.body[i];
      const raw = hr.interaction(name, data);
      const interaction = new Interaction(raw);
      server.addInteraction(interaction.id, interaction);
      ids.push(interaction.id);
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(ids));
    res.end();
  } catch (error) {
    log.error(`Error running handlers - ${error}`);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ error: error.message }));
    res.end();
  }
}

function handleRemoteInteractions(req, res, server) {
  res = new ExpressResponse(res);
  const raws = [];
  const ids = [];
  try {
    switch (req.method) {
      case 'POST':
        for (let i = 0; i < req.body.length; i++) {
          const raw = req.body[i];
          const interaction = new Interaction(raw);
          server.addInteraction(interaction.id, interaction);
          ids.push(interaction.id);
        }
        res.status(200);
        res.send(ids);
        break;
      case 'GET':
        if (req.query.ids) {
          const ids = req.query.ids.split(',');
          ids.forEach(id => {
            const intObj = server.getInteraction(id);
            if (intObj) {
              raws.push(intObj);
            }
          });
        } else {
          for (const [id, interaction] of server.interactions) {
            raws.push(interaction);
          }
        }
        res.status(200);
        res.send(raws);
        break;
      case 'DELETE':
        if (req.query.ids) {
          const ids = req.query.ids.split(',');
          ids.forEach(id => server.removeInteraction(id));
        } else {
          server.clearInteractions();
        }
        res.status(200);
        res.send();
        break;
      default:
        res.status(405);
        res.send();
        break;
    }
  } catch (error) {
    handlerError('Error handling remote interaction', error, res);
  }
}

async function handlerRemoteReporterEnd(res) {
  res = new ExpressResponse(res);
  try {
    await reporter.end();
    res.status(200);
    res.send({ message: 'Done' });
  } catch (error) {
    handlerError('Error running reporter end', error, res);
  }
}

function handlerError(message, error, res) {
  log.error(message, error);
  res.status(500);
  res.send({ error });
}

function bodyParser(req, res, next) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    req.body = helper.getJson(body);
    next();
  });
}

class ExpressResponse {
  constructor(res) {
    this.res = res;
  }

  status(code) {
    this.res.statusCode = code;
  }

  set(headers) {
    for (const prop in headers) {
      this.res.setHeader(prop, headers[prop]);
    }
  }

  send(data) {
    if (data) {
      if (typeof data === 'object') {
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify(data));
      } else {
        this.res.end(data);
      }
    } else {
      this.res.end();
    }
  }
}

module.exports = Server;
