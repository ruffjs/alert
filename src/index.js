'use strict';

var dgram = require('dgram');

var Alert = {
    HOST: '127.0.0.1',
    PORT: 9998
};

var types = ['info', 'warn', 'error'];

for (var level = 0; level < types.length; ++level) {
    var type = types[level];
    Alert[type] = doAlert.bind({type: type, level: level});
}

module.exports = Alert;

function doAlert() {
    var callback;

    var data = Array.prototype.slice.call(arguments);
    if (typeof data[data.length - 1] === 'function') {
	callback = data[data.length - 1];
	data.pop();
    }

    var packet = buildPacket.call(this, data);

    var message = JSON.stringify(packet);

    sendMessage(message, callback);
}

function buildPacket(data) {
    var packet = Object.create(null);

    for (var prop in this) {
	packet[prop] = this[prop];
    }

    packet.timestamp = Date.now();

    packet.data = data;

    return packet;
}

function sendMessage(message, callback) {
    var client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, Alert.PORT, Alert.HOST, function (err) {
	client.close();
	if (callback) {
	    callback(err);
	}
    });
}
