'use strict';

var dgram = require('dgram');

var Alert = {
    HOST: '127.0.0.1',
    PORT: 9998,
    FROM: 'app',
    REASON: {
	// 0-99 is reserved for app
	// 100-199 is reserved for ruffd
	APPLICATION_EXIT: 100,
	// 200-299 is reserved for explorer
	CONNECTION_LOST: 200,
	CONNECTION_ERROR: 201,
	CONNECTION_AGAIN: 202
    }
};

var types = ['info', 'warn', 'error'];

for (var level = 0; level < types.length; ++level) {
    var type = types[level];
    Alert[type] = doAlert.bind({type: type, level: level});
}

module.exports = Alert;

function doAlert(reason, callback) {
    if (arguments.length < 1) {
	throw new Error('"reason" is required');
    }
    var packet = buildPacket.call(this, reason);
    sendPacket(packet, callback);
    return packet;
}

function buildPacket(reason, message) {
    var packet = Object.create(null);

    for (var prop in this) {
	packet[prop] = this[prop];
    }

    packet.from = Alert.FROM;
    packet.timestamp = Date.now();
    packet.reason = reason;

    return packet;
}

function sendPacket(packet, callback) {
    if (!Alert.PORT || !Alert.HOST) {
	return;
    }

    var client = dgram.createSocket('udp4');
    var data = JSON.stringify(packet);
    client.send(data, 0, data.length, Alert.PORT, Alert.HOST, function (err) {
	client.close();
	if (typeof callback === 'function') {
	    callback(err);
	}
    });
}
