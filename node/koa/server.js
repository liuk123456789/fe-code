/**
 * Created by wyw on 2018/10/14.
 */
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');
const path = require('path');
const koaSend = require('koa-send');
const static = require('koa-static');
const fs = require('fs');
const https = require('https');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

app.use(static(
    path.join( __dirname,  './public')
));

// logger

app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// response

// 对于任何请求，app将调用该异步函数处理请求：

app.use((ctx, next) => {
    let query = ctx.query;
    ctx.body = `${query['callback']}('wuyw')`;
    next();
});

app.use(async (ctx, next) => {
    if (/\./.test(ctx.request.url)) {
        await koaSend(
            ctx,
            'index.html',
            {
                root: path.join(__dirname, './'),
                maxage: 1000 * 60 * 60 * 24 * 7,
                gzip: true,
            } // eslint-disable-line
        );
    } else {
        await next();
    }
});
// 在端口3001监听:
app.listen(3001, _ => {
    console.log('app started at port 3001...');
});
// let options = {
//     key: fs.readFileSync('./privatekey.pem'),
//     cert: fs.readFileSync('./certificate.pem')
// };
// https协议需要生成相关证书
// https.createServer(options, app.callback()).listen(3001, _ => {
//     console.log('app started at port 3001...');
// });
// https.createServer(app.callback()).listen(3001);