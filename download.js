// establish a tcp connection with peers and Handshake with them
const net = require('node:net')

module.exports.ConnectWithPeers = function (peers) {
    console.log("connect with peers called ")
    peers.map(peer => {
        console.log("going over eveyr peer", peer);
        const socket = new net.Socket();

        socket.on('error', (err) => {
            console.log()
            console.log("CON_ERR", err)
        })

        socket.connect({port: peer.port, host: peer.ip}, function() {
            console.log(`Connection successful with ${peer.ip}`)
        })

        socket.on('data' , function(data) {
            console.log(data)
        })
    })
}