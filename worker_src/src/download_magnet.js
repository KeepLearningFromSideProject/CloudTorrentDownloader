const WebTorrent = require("webtorrent");

const defaultProcessCallback = (client) => {
    console.log("[Download Speed]: " + client.downloadSpeed / 1024 + "kBs");
    console.log("[Progress]: " + client.progress * 100 + "%");
}

const defaultFinishCallback = (client) => {
    console.log("torrent download finished");
}

const downloadMagnet = (torrentId, updateInterval, downloadDir, timeout,
    processCallback=defaultProcessCallback, finishCallback=defaultFinishCallback) => {

    return new Promise((resolve, reject) => {
        let client = new WebTorrent();
        client.add(torrentId, { path: downloadDir }, function (torrent) {
            let interval = setInterval(() => processCallback(client), updateInterval);

            let timeoutKiller = setTimeout(() => {
                clearInterval(interval);
                client.destroy();
                resolve('timeout')
            }, timeout);

            torrent.on("done", () => {
                clearInterval(interval);
                clearTimeout(timeoutKiller);
                client.destroy();
                finishCallback(client);
                resolve('success');
            });
        });
    });
}

module.exports = downloadMagnet;
