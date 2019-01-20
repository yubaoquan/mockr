module.exports = async (ctx, next) => {
  console.info('before');
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  if (ctx.request.path === '/foo' && ctx.request.method === 'DELETE') {
    ctx.body = { retCode: 200 };
  } else {
    await next();
  }
};
