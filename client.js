const net = require('net');


function createClientConnection(PORT, HOST) {
    const client = new net.Socket();
    client.connect(PORT, HOST, () => {
        console.log('Connected to server');
    });
    return client;
}

function handleClientEvents(client) {
    client.on('data', (data) => {
        console.log('Received from server:', data.toString());
        client.end();
    });

    client.on('end', () => {
        console.log('Server closed the connection');
    });

    client.on('close', () => {
        console.log('Connection closed by client');
    });

    client.on('error', (err) => {
        console.error('Connection error:', err.message);
    });
}

module.exports = { createClientConnection, handleClientEvents }