/* eslint-disable */
const MP = require('./mp');

MP.init = function init(options,...params){
    return MP.init({
        appId:options,
        appKey:params[0],
        masterKey:params[1]
    })
}

MP.initialize = MP.init;
