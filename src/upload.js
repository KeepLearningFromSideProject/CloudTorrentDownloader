const { spawn } = require("child_process");
const driveId = process.argv[2];
const localPath = process.argv[3];
const remotePath = process.argv[4];

spawn("rclone", ["copy", localPath, `${driveId}:${remotePath}`]);
