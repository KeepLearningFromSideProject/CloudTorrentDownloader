const { spawn } = require("child_process");
const fs = require("fs");
const driveId = process.argv[2];
const localPath = process.argv[3];
const remotePath = process.argv[4];
const rcloneConf = process.argv[5];

fs.writeFile("/tmp/rclone.conf", rcloneConf, function (err) {
    if (err) return console.log(err);
});

spawn("rclone", [
    "--config",
    "/tmp/rclone.conf",
    "copy",
    localPath,
    `${driveId}:${remotePath}`,
]);
