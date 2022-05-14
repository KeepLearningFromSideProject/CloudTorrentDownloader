const { spawn } = require("child_process");

const upload = (src, rcloneDest) => {
    return new Promise((resolve, reject) => {
        let uploadProcess = spawn("rclone", [
            "--config",
            "/tmp/rclone.conf",
            "copy",
            src,
            rcloneDest
        ]);

        uploadProcess.on("close", (code) => {
            code === 0 ? resolve():reject();
        });
    });
}

module.exports = upload;
