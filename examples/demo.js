const Koa = require('koa');
const proxy = require('../index');
const app = new Koa();

// x-response-time
app.use(async(ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
app.use(async(ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// proxy
app.use(proxy('/rest', 'http://192.168.1.240/api2'));
app.use(proxy(['/api2', '/api'], 'http://192.168.1.240/api2'));
app.use(proxy('/api3', 'http://192.168.1.240/api2', {
  events: {
    error(err, req, res) {
      res.writeHead(500, err.message, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify(Object.assign({}, err, {
        message: err.message, // 有时候message字段不能被输出
        url: req.url
      })));
    }
  }
}));

// response
app.use(async ctx => {
  ctx.body = 'Hello World';
});

app.listen(9527, () => {
  console.log(`Listening on 9527`);
});
