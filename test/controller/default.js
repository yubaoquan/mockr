module.exports = async (ctx, next) => {
  console.info('this is default controller in seperated file');
  console.info(ctx.error);
  ctx.body = ctx.error && ctx.error.stack;
  await next();
};
