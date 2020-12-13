const pactum = require('../../src/index');
const handler = pactum.handler;

function addDefaultMockHandlers() {
  handler.addMockInteractionHandler('default get', () => {
    return {
      withRequest: {
        method: 'GET',
        path: '/default/get'
      },
      willRespondWith: {
        status: 200,
        body: {
          method: 'GET',
          path: '/default/get'
        }
      }
    };
  });
  handler.addMockInteractionHandler('default post', () => {
    return {
      withRequest: {
        method: 'POST',
        path: '/default/post',
        body: {
          method: 'POST',
          path: '/default/post'
        }
      },
      willRespondWith: {
        status: 200
      }
    };
  });
  handler.addMockInteractionHandler('get people', () => {
    return {
      withRequest: {
        method: 'GET',
        path: '/api/people'
      },
      willRespondWith: {
        status: 200,
        body: {
          people: [
            { name: 'Matt', country: 'NZ' },
            { name: 'Pete', country: 'AU' },
            { name: 'Mike', country: 'NZ' }
          ]
        }
      }
    };
  });
  handler.addMockInteractionHandler('get user with id 1', () => {
    return {
      withRequest: {
        method: 'GET',
        path: '/api/users/1'
      },
      willRespondWith: {
        status: 200,
        body: {
          id: 1,
          name: 'snow'
        }
      }
    };
  });
  handler.addMockInteractionHandler('default flow get', () => {
    return {
      provider: 'some-provider',
      flow: 'get default',
      withRequest: {
        method: 'GET',
        path: '/default/get'
      },
      willRespondWith: {
        status: 200,
        body: {
          method: 'GET',
          path: '/default/get'
        }
      }
    };
  });
}

before(async () => {
  pactum.consumer.setConsumerName('consumer');
  addDefaultMockHandlers();
  await pactum.mock.start();
});

after(async () => {
  await pactum.mock.stop();
  pactum.consumer.save();
});