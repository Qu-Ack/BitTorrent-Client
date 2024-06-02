const fs = require('fs')
const bencode = require('bencode')
const crypt = require('crypto')
const bignum = require('bignum');


module.exports.info_hash = function () {
    const torrent = bencode.decode(fs.readFileSync('test.torrent'));
    let str = bencode.encode(torrent.info)
    const hash = crypt.createHash('sha1').update(str).digest()
    return hash
}()


module.exports.size = torrent => {
  const size = torrent.info.files ?
    torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
    torrent.info.length;

  return bignum.toBuffer(size, {size: 8});
};