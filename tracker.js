const bencode = require('bencode');
const fs = require('fs');
const dgram = require('node:dgram');

const crypto = require('crypto');
const torrent_parser = require('./torrent_parser')



module.exports.getPeers = function (socket, callback) {

    const torrent = bencode.decode(fs.readFileSync('test.torrent'));
    const announce_url = torrent.announce.toString('utf-8');
    const parseURL = new URL(announce_url);

    const con_req = buildConnReq();

    RequestTracker(socket, con_req, parseURL)

    socket.on('message', response => {

        if (ResponseType(response) == 1) {
            const announce_resp = parseAnnounceResponse(response)
            callback(announce_resp.peers)

        } else if (ResponseType(response) == 0) {
            let resp = connResponseParse(response, con_req.readUInt32BE(12));
            let announce_req = buildAnnounceReq(torrent, resp.connection_id)
            RequestTracker(socket, announce_req, parseURL)
        }
    });
}



function buildConnReq() {
    const buf = Buffer.alloc(16);
    buf.writeUInt32BE(0x417, 0);
    buf.writeUInt32BE(0x27101980, 4);
    buf.writeUInt32BE(0, 8);
    crypto.randomBytes(4).copy(buf, 12);
    return buf;
}


function connResponseParse(buffer, given_transaction_id) {
    if (buffer.length >= 16) {
        let transaction_id = buffer.readUInt32BE(4)
        if (transaction_id == given_transaction_id) {
            return {
                action: buffer.readUInt32BE(0),
                transaction_id: transaction_id,
                connection_id: buffer.slice(8)
            }
        } else {
            console.log("ID_MATCH_ERR")
        }

    } else {
        console.log("CON_RESP_LENGTH_BAD")
    }

}


function peerIdGen() {
    let id = crypto.randomBytes(20);
    Buffer.from('-QA0001-').copy(id, 0);
    const stringId = id.toString('utf-8')
    console.log(stringId)
    const urlEncodedID = encodeURIComponent(stringId)
    return Buffer.from(urlEncodedID);
}


function RequestTracker(socket, request, url) {
    socket.send(request, 0, request.length, url.port, url.hostname, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('success');
        }
    });
}

function buildAnnounceReq(torrent, connection_id, port = 6110) {
    const announceRequest = Buffer.alloc(98);

    connection_id.copy(announceRequest, 0);


    announceRequest.writeUInt32BE(1, 8);


    crypto.randomBytes(4).copy(announceRequest, 12);

    torrent_parser.info_hash.copy(announceRequest, 16);

    peerIdGen().copy(announceRequest, 36);

    Buffer.alloc(8).copy(announceRequest, 56);

    torrent_parser.size(torrent).copy(announceRequest, 64);

    Buffer.alloc(8).copy(announceRequest, 72);

    announceRequest.writeUInt32BE(0, 80);

    announceRequest.writeUInt32BE(0, 80);

    crypto.randomBytes(4).copy(announceRequest, 88);

    announceRequest.writeUInt32BE(port, 92);

    return announceRequest;
}



function parseAnnounceResponse(resp) {
    function group(iterable, groupSize) {
        let groups = [];
        for (let i = 0; i < iterable.length; i += groupSize) {
            groups.push(iterable.slice(i, i + groupSize));
        }
        return groups;
    }

    return {
        action: resp.readUInt32BE(0),
        transactionId: resp.readUInt32BE(4),
        leechers: resp.readUInt32BE(8),
        seeders: resp.readUInt32BE(12),
        peers: group(resp.slice(20), 6).map(address => {
            return {
                ip: address.slice(0, 4).join('.'),
                port: address.readUInt16BE(4)
            }
        })
    }

}


function ResponseType(response) {
    let action = response.readUInt32BE(0);

    return action;
}