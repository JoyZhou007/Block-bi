var env = 'local';

const localConfig = {
  APP_VERSION: '0.4.3',
  domain: 'http://localhost/',
  staticResourceDomain: 'http://localhost:3000/',
  apiPrefix:'api',
  resourceDomain: 'http://devapi.blockbi.com/',
  resourceFolderDomain:  'http://devapi.blockbi.com/',
  resourceContactUsDomain:  'http://devadmin.blockbi.com/',
  socketDomain:'ws://dev-bi-im.blockbi.com:9988/',
  requestByDomain: false,
  apiDomain : 'http://devapi.blockbi.com',
  debug: true,
  cnzzSrc: ''
};

const devConfig = {
  APP_VERSION: '0.4.3',
  domain: 'http://devfront.blockbi.com/',
  staticResourceDomain: 'http://devfront.blockbi.com/',
  apiPrefix:'api',
  resourceDomain: 'http://devapi.blockbi.com/',
  resourceFolderDomain:  'http://devapi.blockbi.com/',
  resourceContactUsDomain:  'http://devadmin.blockbi.com/',
  socketDomain:'ws://dev-bi-im.blockbi.com:9988/',
  requestByDomain: true,
  apiDomain : 'http://devapi.blockbi.com',
  debug: true,
  cnzzSrc: ''
};

const uatConfig = {
  APP_VERSION: '0.4.3',
  domain: 'https://uatwww.blockbi.com/',
  staticResourceDomain: 'https://uatwww.blockbi.com/',
  apiPrefix:'api',
  resourceDomain: 'https://uatapi.blockbi.com/',
  resourceFolderDomain:  'https://uatapi.blockbi.com/',
  resourceContactUsDomain:  'http://uatadmin.blockbi.com/',
  socketDomain:'wss://uatapi.blockbi.com/',
  requestByDomain: true,
  apiDomain : 'https://uatapi.blockbi.com',
  debug: false,
  cnzzSrc: '1267453118'
};

const prodConfig = {
  APP_VERSION: '1.0.0',
  domain: 'https://www.blockbi.com/',
  staticResourceDomain: 'https://static.blockbi.com/',
  apiPrefix:'api',
  resourceDomain: 'https://api.blockbi.com/',
  resourceFolderDomain:  'https://api.blockbi.com/',
  socketDomain: 'wss://api.blockbi.com/',
  requestByDomain: true,
  apiDomain : 'https://api.blockbi.com',
  debug: false,
  cnzzSrc: '1267288208'
};

if (env === 'local') {
  exports.biConfig = localConfig;
}
if (env === 'dev') {
  exports.biConfig = devConfig;
}
if (env === 'uat') {
  exports.biConfig = uatConfig;
}
if (env === 'prod' || env === 'production') {
  exports.biConfig = prodConfig;
}