'use strict';

var run = function() {
  // Replace '../bitcore' with 'bitcore' if you use this code elsewhere.
  var bitcore = require('bitcore');
  var Address = bitcore.Address;
  var coinUtil = bitcore.util;
  var Script = bitcore.Script;
  var network = bitcore.networks.testnet;

  var getAddrStr = function(s) {
    var addrStrs = [];
    var type = s.classify();
    var addr;

    switch (type) {
      case Script.TX_PUBKEY:
        var chunk = s.captureOne();
        addr = new Address(network.addressVersion, coinUtil.sha256ripe160(chunk));
        addrStrs.push(addr.toString());
        break;
      case Script.TX_PUBKEYHASH:
        addr = new Address(network.addressVersion, s.captureOne());
        console.log(addr.toString());
        addrStrs.push(addr.toString());
        break;
      case Script.TX_SCRIPTHASH:
        addr = new Address(network.P2SHVersion, s.captureOne());
        addrStrs.push(addr.toString());
        break;
      case Script.TX_MULTISIG:
        var chunks = s.capture();
        chunks.forEach(function(chunk) {
          var a = new Address(network.addressVersion, coinUtil.sha256ripe160(chunk));
          addrStrs.push(a.toString());
        });
        break;
      case Script.TX_UNKNOWN:
        console.log('tx type unkown');
        break;
    }
    return addrStrs;
  };


  var msg = (new Buffer("This is my test data")).toString('hex');
  var script = 'OP_RETURN ' + msg
  var s = Script.fromHumanReadable(script);
  console.log(s)
};

module.exports.run = run;
if (require.main === module) {
  run();
}
