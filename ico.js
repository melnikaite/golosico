golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');

const ico = {
  getProjects: (callback) => {
    golos.api.getDiscussionsByTrending({select_tags: ['peoples'], limit: 100}, function (err, result) {
      if (err) console.error(err);
      else {
        let array = [];
        for (let i = 0; i < result.length; i++) {
          result[i].permlink = result[i].permlink.replace(/proekt-/g, '');
          result[i] = ico.extractUnnecessary(result[i]);
          // remove all html tags
          result[i].body = result[i].body.replace(/<(?:.|\n)*?>/gm, '');
          //console.log(result[i].body);
          // trim string length by word coun || cut with words count
          result[i].body = result[i].body.split('.').splice(0, 2).join('.').concat('...');
          let metadata = JSON.parse(result[i].json_metadata),
            image;
          if (metadata.image) image = imgUrlReplace(metadata.image[0]);
          array.push({
            author: result[i].author,
            permlink: 'ru/projects/' + result[i].permlink,
            created: result[i].created,
            title: result[i].title,
            body: result[i].body,
            image: image
          });
        }
        callback(array);
      }
    });
  },

  extractUnnecessary: (result) => {
    result.title = result.title.replace(/Проект: "/g, '').replace(/"/g, '');
    //result.body = result.body.replace(/"Этот пост является контентом для платформы \[''\]\(https:\/\/''.com\)"/g, '');
    result.body = result.body.replace(/<p>"Этот пост является контентом для платформы <a href="https:\/\/''.com">''<\/a>"<\/p>/g, '');
    result.body = result.body.replace(/<p>"Этот пост является контентом для платформы <a href="https:\/\/''.com">''"<\/a><\/p>/g, '');
    result.body = result.body.replace(/(<html>|<\/html>)/g, '');
    return result;
  },

  //ico.createPost({password: '', author: 'melnikaite', maintag: 'maintag', permalink: 'permalink', title: 'title', body: 'body'}, console.log);
  createPost: (options, callback) => {
    const wif = golos.auth.toWif(options.author, options.password, 'posting');
    golos.broadcast.comment(wif, '', options.maintag, options.author, options.permalink, options.title, options.body, {}, callback);
  },

  //ico.createAsset({password: '', author: 'melnikaite', assetName: 'TESTTEST', supply: 1000000, golosAmount: 2, assetAmount: 100}, console.log);
  createAsset: (options, callback) => {
    const wif = golos.auth.toWif(options.author, options.password, 'active');
    const operations = [
      ['asset_create', {
        issuer: options.author,
        asset_name: options.assetName,
        precision: 3,
        common_options: {
          max_supply: options.supply * Math.pow(10, 3),
          market_fee_percent: 0,
          max_market_fee: "0",
          issuer_permissions: 79,
          flags: 0,
          core_exchange_rate: {
            base: `${options.golosAmount.toFixed(3)} GOLOS`,
            quote: `${options.assetAmount.toFixed(3)} ${options.assetName}`
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
    golos.api.getAssets([assetName], (err, res) => {
      callback(err, res[0]);
    });
  },

  getAssetDynamicData: (assetName, callback) => {
    golos.api.getAssetsDynamicData([assetName], (err, res) => {
      callback(err, res[0]);
    });
  },

  getIssuerAssetBalance: (issuer, assetName, callback) => {
    golos.api.getAccountBalances(issuer, [assetName], (err, res) => {
      callback(err, parseFloat(res[0].split(' ')[0]));
    });
  },

  getMyAssets: (issuer, callback) => {
    golos.api.getAccountBalances(issuer, [], callback);
  },

  getBackedAmount: (assetName, callback) => {
    ico.getAssetDynamicData(assetName, (err, res) => {
      const currentSupply = res.current_supply / Math.pow(10, 3);
      ico.getAsset(assetName, (err, res) => {
        ico.getIssuerAssetBalance(res.issuer, assetName, (err, currentAmount) => {
          callback({
            currentSupply: currentSupply,
            currentAmount: currentAmount,
            currentBacked: currentSupply - currentAmount,
          });
        });
      });
    });
  },

  getExchangeRate: (assetName, callback) => {
    ico.getAsset(assetName, (err, res) => {
      const base = parseFloat(res.options.core_exchange_rate.base);
      const quote = parseFloat(res.options.core_exchange_rate.quote);
      callback(err, {
        to: quote / base,
        from: base / quote,
      });
    });
  },

  //ico.issueAsset({password: '', issuer: 'melnikaite', amount: 100, assetName: 'AAAAAAAA'}, console.log);
  issueAsset: (options, callback) => {
    const wif = golos.auth.toWif(options.issuer, options.password, 'active');
    golos.broadcast.assetIssue(wif, options.issuer, `${options.amount}.${'0'.repeat(3)} ${options.assetName}`, options.issuer, '', [], callback);
  },

  //ico.sellAssets({password: '', issuer: 'melnikaite', amountGolos: 2, amountAsset: 100, assetName: 'AAAAAAAA', expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}, console.log);
  sellAssets: (options, callback) => {
    const wif = golos.auth.toWif(options.issuer, options.password, 'active');
    golos.broadcast.limitOrderCreate(wif, options.issuer, Math.round(Date.now() / 1000), `${options.amountAsset.toFixed(3)} ${options.assetName}`, `${options.amountGolos.toFixed(3)} GOLOS`, false, options.expiration, callback);
  },

  //ico.buyAssets({password: '', buyer: 'melnikaite', amountGolos: 2, amountAsset: 100, assetName: 'AAAAAAAA', expiration: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}, console.log);
  buyAssets: (options, callback) => {
    const wif = golos.auth.toWif(options.buyer, options.password, 'active');
    golos.broadcast.limitOrderCreate(wif, options.buyer, Math.round(Date.now() / 1000), `${options.amountGolos.toFixed(3)} GOLOS`, `${options.amountAsset.toFixed(3)} ${options.assetName}`, false, options.expiration, callback);
  },
};
