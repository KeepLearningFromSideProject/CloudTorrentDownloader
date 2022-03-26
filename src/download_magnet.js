const parseTorrent = require("parse-torrent");
const WebTorrent = require("webtorrent");
const fs = require("fs");

const torrentId = process.argv[2];
const updateInterval = parseInt(process.argv[3]);
const downloadDir = process.argv[4];
const client = new WebTorrent();

client.add(torrentId, { path: downloadDir }, function (torrent) {
    let interval = setInterval(function () {
        console.log("[Download Speed]: " + client.downloadSpeed / 1024 + "kBs");
        console.log("[Progress]: " + client.progress * 100 + "%");
    }, updateInterval);

    torrent.on("done", function () {
        console.log("torrent download finished");
        process.exit(0);
    });
});
