module.exports = {
  restfulURLs: [
    ['/a', null, '/b', null],
  ],
  pageEntries: [
    {
      url: url => ['', '/', '/index'].includes(url),
      template: 'index.ftl',
      syncDataPath: 'index-data',
    },
    {
      url: '/tanks/shining.do',
      template: 'pages/tanks/shining.ftl',
    },
    {
      url: '/page',
      template: '/aa/bb/cc.ftl',
      syncDataPath: 'pageASpecial',
    },
    {
      url: url => url.includes('pageEntry'),
      template: 'page/entry2.ftl',
    },
    {
      url: /^\/regexp\/page/,
      template: '/page/entry3.html',
    },
  ],
  noTemplateEngine: true,
  templateRoots: ['./template'],
  syncDataRoot: 'sync',
  controllerRoot: 'controller',
  specialControllers: [
    {
      url: /^\/ax\//,
      path: './xxx/special.js',
    },
    {
      url: url => url.includes('love'),
      path: './love/a.js',
    },
  ],
  static: [
    '.',
  ],
  beforeController: './before.js',
  async afterController(ctx, next) {
    console.info('this is after handler');
    await next();
  },
  onStartUp() {
    console.info(`onstartup called`);
  },
  defaultController: './default.js',
  // async defaultController(ctx, next) {
  //   console.info('this is default controller');
  //   console.info(ctx.error);
  //   ctx.body = ctx.error && ctx.error.stack;
  //   await next();
  // },
};
