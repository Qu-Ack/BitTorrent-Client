const bencode = require('bencode')
const fs = require('fs')
const dgram = require('node:dgram')
const socket = dgram.createSocket('udp4')
const url = require('node:url')


const torrent = bencode.decode(fs.readFileSync('puppy.torrent'));
const announce_url = torrent.announce.toString('utf-8')
const parseURL = new URL(announce_url)
console.log(parseURL)

socket.bind(6110, 'localhost')


socket.on('error' , (err) => {
    console.log(`socket error . ${err}`)
})

socket.on('listening' , () => {
    console.log(`listening on ${socket.address().port} ... `)
})


module.exports.getPeers = function () {
    socket.connect(parseURL.port, parseURL.hostname, () => {
        console.log('successfully connected to tracker using udp .. ')
    })
}()