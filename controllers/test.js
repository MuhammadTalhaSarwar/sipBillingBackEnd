var request = require("request").defaults({jar: true});

var cookieJar = request.jar();

var options = { method: 'POST',
  url: 'http://69.30.210.130:8082/api/session',
  headers:
        { 'content-type': 'application/x-www-form-urlencoded' },
  form: { email: 'admin', password: 'admin' } };

request(options, async function (error, response, body) {
  if (error) throw new Error(error);

   await console.log(body);
});

var options = { method: 'GET',
  url: 'http://69.30.210.130:8082/api/devices',
  qs: { id: '1' },
  headers:
   { 'postman-token': '021a3566-e1ea-4dd4-4ceb-c81ecd25ddd1',
     'cache-control': 'no-cache' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
