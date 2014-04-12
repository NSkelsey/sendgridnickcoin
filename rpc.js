'use strict';


exports.getRPCConnection = function() {
  var bitcore = require('bitcore');
  var RpcClient = bitcore.RpcClient;
  var config = {
    protocol: 'http',
    user:'thesecretestrpcuser',
    pass: 'VgiDamPnQxzEoLgfdd9jFPDRtg6rj3sWexq6GjSBBPF',
    host: '127.0.0.1',
    port: '18332',
  };

  var rpc = new RpcClient(config);
  return rpc
};

var run = function() {
    var rpc = exports.getRPCConnection();
    rpc.getPeerInfo(function cBack(err, ret) {
        if (err) {
            throw("RPC Died:\n" + err);
        }   
        console.log(ret);
    });
}

module.exports.run = run;
if (require.main === module) {
  run();
}
