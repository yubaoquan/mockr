module.exports = async (ctx, next) => {
  const { error } = ctx;
  ctx.body = error && error.stack;
  console.error(`No default controller found, use mockr default controller`);
  await next();
};
