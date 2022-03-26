const readline = require("readline");
const { spawn } = require("child_process");
const driveId = process.argv[2];

const rclone = spawn("rclone", [
    "config",
    "create",
    driveId,
    "drive",
    "config_is_local",
    "false",
]);

rclone.stdout.on("data", (data) => {
    for (let s of data.toString().split("\n")) {
        let urlStart = s.indexOf("http");
        if (urlStart !== -1) {
            console.log(`Auth URL: ${s.substring(urlStart)}`);
        }
    }
});

rclone.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
});

rclone.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
});

const inputKey = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
    });

    const key = await new Promise((resolve) =>
        rl.question("", (ans) => {
            rl.close();
            resolve(ans);
        })
    );

    rclone.stdin.write(key + "\n");
    rclone.stdin.end();
};

inputKey();
