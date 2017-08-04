'use strict';

var assert = require('assert');
var path = require('path');
var test = require('test');

var alert = require(path.join(__dirname, '..'));

var genid = Date.now;

var ops = Object.create(null);

var dgram = require('dgram');

var cases = {
    'test should alert info': function (next) {
        var args = [genid(), 'hello'];

        registerTest(next, args[0], function (packet) {
            assert.deepEqual('info', packet.type);
            assert.deepEqual(args, packet.data);
        });

        alert.info.apply(undefined, args);
    },
    'test should alert warn': function (next) {
        var args = [genid(), 1, 2, 3];

        registerTest(next, args[0], function (packet) {
            assert.deepEqual('warn', packet.type);
            assert.deepEqual(args, packet.data);
        });

        alert.warn.apply(undefined, args);
    },
    'test should alert error': function (next) {
        var args = [genid()];

        registerTest(next, args[0], function (packet) {
            assert.deepEqual('error', packet.type);
            assert.deepEqual(args, packet.data);
        });

        alert.error.apply(undefined, args);
    }
};

function registerTest(next, id, test) {
    var timer = setTimeout(function () {
        if (ops[id]) {
            next(new Error('Timeout'));
        }
    }, 3000);

    ops[id] = function (packet) {
        try {
            test(packet);
        } catch (e) {
            return next(e);
        }
        clearTimeout(timer);
        delete ops[id];
        next();
    }
}

var count = Object.getOwnPropertyNames(cases).length;

var server = dgram.createSocket('udp4');

server.bind(alert.PORT);

server.on('message', function (msg, rinfo) {
    var packet = JSON.parse(msg);
    try {
        var id = packet.data[0];
        if (typeof ops[id] === 'function') {
            ops[id](packet);
        }
    } catch (e) {
    }

    if (--count === 0) {
        server.close();
    }
});

test.run(cases);

