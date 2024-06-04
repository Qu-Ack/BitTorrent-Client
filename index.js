const dgram = require('node:dgram');
const Tracker = require('./tracker')
const download = require('./download')
const socket = dgram.createSocket('udp4');


socket.bind(6110)

socket.on('error', (err) => {
    console.log(`socket error: ${err}`);
});

socket.on('listening', () => {
    console.log(`listening on ${socket.address().port} ...`);
    Tracker.getPeers(socket, (peers) => {
        console.log(peers)
        download.ConnectWithPeers(peers);

    })
});

