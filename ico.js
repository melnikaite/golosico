golos.config.set('websocket', 'wss://ws.testnet.golos.io');

const ico = {
  createPost: (options, callback) => {
    golos.broadcast.comment(options.postingKey, '', options.maintag, options.author, options.permalink, options.title, options.body, {}, (err, result) => {
      callback(err, result);
    });
  },

  //ico.createAsset({activeKey: '', author: 'melnikaite', assetName: 'TESTTEST0', precision: 2}, console.log);
  createAsset: (options, callback) => {
    golos.broadcast.assetCreate(options.activeKey, options.author, options.assetName, options.precision, {
      max_supply: 100000000,
      market_fee_percent: 0,
      max_market_fee: 0,
      // charge_market_fee = 0x01, /**< an issuer-specified percentage of all market trades in this asset is paid to the issuer */
      // white_list = 0x02, /**< accounts must be whitelisted in order to hold this asset */
      // override_authority = 0x04, /**< issuer may transfer asset back to himself */
      // transfer_restricted = 0x08, /**< require the issuer to be one party to every transfer */
      // disable_force_settle = 0x10, /**< disable force settling */
      // global_settle = 0x20, /**< allow the bitasset issuer to force a global settling -- this may be set in permissions, but not flags */
      // disable_confidential = 0x40, /**< allow the asset to be used with confidential transactions */
      // witness_fed_asset = 0x80, /**< allow the asset to be fed by witnesses */
      // committee_fed_asset = 0x100 /**< allow the asset to be fed by the committee */
      issuer_permissions: 79,
      flags: 0,
      core_exchange_rate: {
        base: '1.000 GOLOS',
        quote: '1.000 TESTTEST1',
      },
      whitelist_authorities: [],
      blacklist_authorities: [],
      whitelist_markets: [],
      blacklist_markets: [],
      description: '{"main":"","market":""}',
      extensions: [],
    }, {
      short_backing_asset: '',
      feed_lifetime_sec: 0,
      force_settlement_delay_sec: 0,
      minimum_feeds: 0,
      force_settlement_offset_percent: 0,
      maximum_force_settlement_volume: 0,
      extensions: [],
    }, false, [], (err, result) => {
      callback(err, result);
    });
  },

  getAsset: (assetName, callback) => {
    golos.api.getAssets([assetName], callback);
  },
};
