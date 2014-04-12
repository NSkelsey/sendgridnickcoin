var bitcore = require('bitcore');
var Script = bitcore.Script;
var COIN = bitcore.util.COIN;
var TransactionBuilder = bitcore.TransactionBuilder;
var TransactionOut = bitcore.Transaction.Out;

var MAX_OP_RETURN_RELAY = 40;
var MIN_TX_OUT = 0.0001;


var c = require('./rpc.js');
var conn = c.getRPCConnection();

// chunk is a utf string
function createSmallData(chunk){

    // as defined by our friends at https://github.com/bitcoin/bitcoin/blob/ae7e5d7cebd9466d0c095233c9273e72e88fede1/src/script.h#L212
    var OP_SMALLDATA = 249; 
    var script = new Script();

    script.writeOp(OP_SMALLDATA);
    script.writeBytes(chunk);

    if (script.length > MAX_OP_RETURN_RELAY) {
        throw "Script too large, len: " + script.length;
    }
    return script;
}


// pass in a msg to send and get the output needed to form a valid txn
function createCheapOuts(msg){
    // deal with script generation
    var raw = new Buffer(msg);

    if (raw.length > 140) {
        throw "This is twitter not some blog service"
    } 

    // round up
    var numOuts = Math.ceil(raw.length / MAX_OP_RETURN_RELAY);
    var outs = [];

    for (var i = 0; i < numOuts; i++){
    
        var msgWidth = MAX_OP_RETURN_RELAY - 1,
            slice = raw.slice(0, msgWidth),
            script = createSmallData(slice)
            raw = raw.slice(msgWidth);

        var data = {
            script: script,
            value: MIN_TX_OUT * COIN
        }; 
        var txOut = new TransactionOut();
        txOut.v = data.value;
        txOut.s = data.script;
        outs.push(txOut);
        console.log(typeof txOut.serialize);
    }
    console.log(outs)
    return outs
}

function createAddressOuts(msg) {
// finds DER encodings of public keys that are actually utf character encodings


    return []
}


function createHashTagOuts(hashtags) {
// returns regular pay to pubkey of addresses that function as hashtags
// these addresses look like uuuuuuuuuEuroMaidenuuuuuuuuu

    return []
}

// Generates a single transaction that contains a msg
// cheap is a flag to either use standard txs or op push ones
function singleTx(msg, hashtags, cheap) {
    // provides funding utxos and keys to spend from
    conn.listunspent(function (err, ret){
        if (err) {
            throw("RPC woes: " + err);
        }
        var utxos = ret.result;

        var MAX_TX_SPEND = 0.0005;

        // we should do inputs after outputs NOT before
        var inputTxs = [];
        var keys = [];
        var inputBTC = 0;
        for (var i = 0; i < utxos.length; i++) {
            if (inputBTC > MAX_TX_SPEND) {
                break;
            } 
            var utxo = utxos[i]; 
            inputBTC += utxo.amount;
            inputTxs.push(utxo); 
        }   
        console.log(inputTxs);


        var tx = null;

        // NOTE that the create Outs functions return different types
        if (cheap) {
          /* cheap transactions are hard to make in JS
           outs = createCheapOuts(msg);

           var txobj = {
              version: 1,
              lock_time: 0,
              ins: [],
              outs: []
           };

           txobj.ins = inputTXs.map(function (utxo) { 
                            var txin = new Transaction.In(data);
                            return { 
                               s: coinUtil.EMPTY_BUFFER,
                               q: 0xffffffff, 
                               o: txin.o
                               
                            }
                        });

           // TODO real change addr
           var addr = "3800ba32c194cc08d3c0324b68df7a21c64996ec"
           var eng = "DUP HASH160 0x14 " + addr + " EQUALVERIFY CHECKSIG"; 
           var script = Script.fromHumanReadable(eng);
           // set remainder
           var rem = new TransactionOut({script: script,
                                         value: (MAX_TX_SPEND - .0004) * COIN
                                        })
           // we are just adding these outputs into the raw tx
           tx.outs = [rem] + outs


           tx = new Transaction(txobj);
        */

        } else {

           outs = createAddressOuts(msg);
           // a tx builder obj 
           // we can set remainderOut
           tx = (new TransactionBuilder())
                .setUnspent(inputTxs)
                .setOutputs(outs)
                .build();
        }

        // TODO does nothing
        outs += createHashTagOuts(hashtags);
        
        var unsigned = tx.serialize().toString('hex')
        console.log(unsigned);
        conn.signRawTransaction(unsigned, function(err, ret) {
            if (err) {
                throw("Malformed TX to sign" + unsigned);
            }
            console.log(ret.result)

        });


    });
}

var run = function() {
    var msg = "This is a tweet that is suprisingly lucid that the world should read or a meme.";
    singleTx(msg, [], true)
}

module.exports.run = run;
if (require.main === module) {
    run();
}
