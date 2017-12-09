golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');

const ico = {
  //ico.createPost({password: '', author: 'melnikaite', maintag: 'maintag', permalink: 'permalink', title: 'title', body: 'body'}, console.log);
  createPost: (options, callback) => {
    const wif = golos.auth.toWif(options.author, options.password, 'posting');
    golos.broadcast.comment(wif, '', options.maintag, options.author, options.permalink, options.title, options.body, {}, callback);
  },

  //ico.createAsset({password: '', author: 'melnikaite', assetName: 'TESTTEST', precision: 2, supply: 1000000, golosAmount: 2, assetAmount: 100}, console.log);
  createAsset: (options, callback) => {
    const wif = golos.auth.toWif(options.author, options.password, 'active');
    const operations = [
      ['asset_create', {
        issuer: options.author,
        asset_name: options.assetName,
        precision: options.precision,
        common_options: {
          max_supply: options.supply * Math.pow(10, options.precision),
          market_fee_percent: 0,
          max_market_fee: "0",
          issuer_permissions: 79,
          flags: 0,
          core_exchange_rate: {
            base: `${options.golosAmount}.000 GOLOS`,
            quote: `${options.assetAmount}.000 ${options.assetName}`
          },
          whitelist_authorities: [],
          blacklist_authorities: [],
          whitelist_markets: [],
          blacklist_markets: [],
          description: `{"main":"${options.description || ''}",short_name:"${options.shortDescription || ''}","market":""}`,
          extensions: []
        }, 'is_prediction_market': false, 'extensions': []
      }]
    ];
    golos.broadcast.send({extensions: [], operations}, [wif], callback);
  },

  getAsset: (assetName, callback) => {
    golos.api.getAssets([assetName], callback);
  },

  //ico.issueAsset({password: '', issuer: 'melnikaite', amount: '100.000', assetName: 'AAAAAAAA'}, console.log);
  issueAsset: (options, callback) => {
    const wif = golos.auth.toWif(options.issuer, options.password, 'active');
    golos.broadcast.assetIssue(wif, options.issuer, `${options.amount} ${options.assetName}`, options.issuer, '', [], callback);
  },

  //ico.sendToMarket({password: '', issuer: 'melnikaite', amountGolos: 2, amountAsset: 100, assetName: 'AAAAAAAA', expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}, console.log);
  sendToMarket: (options, callback) => {
    const wif = golos.auth.toWif(options.issuer, options.password, 'active');
    golos.broadcast.limitOrderCreate(wif, options.issuer, Math.round(Date.now() / 1000), `${options.amountGolos}.000 GOLOS`, `${options.amountAsset}.000 ${options.assetName}`, false, options.expiration, callback);
  },

  //ico.sendToMarket({password: '', issuer: 'melnikaite', amountGolos: 2, amountAsset: 100, assetName: 'AAAAAAAA', expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}, console.log);
  buyFromMarket: (options, callback) => {
    const wif = golos.auth.toWif(options.issuer, options.password, 'active');
    golos.broadcast.limitOrderCreate(wif, options.issuer, Math.round(Date.now() / 1000), `${options.amountAsset}.000 ${options.assetName}`, `${options.amountGolos}.000 GOLOS`, false, options.expiration, callback);
  },

  //todo: get_limit_orders_by_owner/ getorderbook
};
