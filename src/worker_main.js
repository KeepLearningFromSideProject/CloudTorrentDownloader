const fs = require("fs")
const AWS = require("aws-sdk");
const downloadMagnet = require("./download_magnet");
const upload = require("./upload");

const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });


// SQS operations
const sendTaskMsg = () => {
    let params = {
        MessageBody: `{
            "request": {
                "uuid": "1",
                "magnetLink": "magnet:?xt=urn:btih:KQ3OF6HCXO63OIMOYLCKORO57Q3S3ZXO&dn=&tr=http%3A%2F%2F104.143.10.186%3A8000%2Fannounce&tr=udp%3A%2F%2F104.143.10.186%3A8000%2Fannounce&tr=http%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&tr=http%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&tr=http%3A%2F%2Ftracker.publicbt.com%3A80%2Fannounce&tr=http%3A%2F%2Ftracker.prq.to%2Fannounce&tr=http%3A%2F%2Fopen.acgtracker.com%3A1096%2Fannounce&tr=https%3A%2F%2Ft-115.rhcloud.com%2Fonly_for_ylbud&tr=http%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&tr=http%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&tr=udp%3A%2F%2Ftracker1.itzmx.com%3A8080%2Fannounce&tr=udp%3A%2F%2Ftracker2.itzmx.com%3A6961%2Fannounce&tr=udp%3A%2F%2Ftracker3.itzmx.com%3A6961%2Fannounce&tr=udp%3A%2F%2Ftracker4.itzmx.com%3A2710%2Fannounce&tr=http%3A%2F%2Ftr.bangumi.moe%3A6969%2Fannounce&tr=http%3A%2F%2Ft.nyaatracker.com%2Fannounce&tr=http%3A%2F%2Fopen.nyaatorrents.info%3A6544%2Fannounce&tr=http%3A%2F%2Ft2.popgo.org%3A7456%2Fannonce&tr=http%3A%2F%2Fshare.camoe.cn%3A8080%2Fannounce&tr=http%3A%2F%2Fopentracker.acgnx.se%2Fannounce&tr=http%3A%2F%2Ftracker.acgnx.se%2Fannounce&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=https%3A%2F%2Ftr.bangumi.moe%3A9696%2Fannounce&tr=http%3A%2F%2Ft.acg.rip%3A6699%2Fannounce"
            },
            "storage": {
                "rcloneConf": "conf",
                "uploadDest": "self:/"
            }
        }`,
        QueueUrl: process.env.SQS_URL,
    };
    return sqs.sendMessage(params).promise();
};

const getTaskMsg = () => {
    let params = {
        QueueUrl: process.env.SQS_URL,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 1, // TODO: need to be changed before push
    };
    return sqs.receiveMessage(params).promise();
}

const deleteTaskMsg = (msg) => {
    let params = {
        QueueUrl: process.env.SQS_URL,
        ReceiptHandle: msg.ReceiptHandle,
    };
    return sqs.deleteMessage(params).promise();
};

// Dynamodb operations
const syncTaskStatus = (task, phase, progress) => {
    let params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            task_name: { S: task.request.uuid },
            task_content: { S: JSON.stringify(task) },
            phase: { S: phase },
            progress: { S: progress + "%" }
        },
    };
    return ddb.putItem(params).promise();
};

const deleteTaskStatus = (task) => {
    let params = {
        TableName: process.env.TABLE_NAME,
        Key: { task_name: { S: task.request.uuid } }
    }
    return ddb.deleteItem(params).promise();
};

// Callbacks
const downloadProcessCallback = (client, task) => {
    syncTaskStatus(task, "downloading", client.progress * 100);
};

const downloadFinishCallBack = (client, task) => {
    syncTaskStatus(task, "downloading", 100);
};

// Utils
const parseTaskMsg = (taskMsg) => {
    var task = JSON.parse(taskMsg.Body);
    task.storage.rcloneConf = Buffer.from(task.storage.rcloneConf, 'base64').toString();
    return task;
}

const main = async () => {
    // get task
    console.log("[Init]");
    await sendTaskMsg();
    let taskMsg = (await getTaskMsg()).Messages[0];
    let task = parseTaskMsg(taskMsg);
    let request = task.request;
    let storage = task.storage;
    fs.writeFile('/tmp/rclone.conf', storage.rcloneConf, (err) => console.log(err));
    await syncTaskStatus(task, phase="initializing", progress=100);
    
    // do download
    console.log("[Download]: " + JSON.stringify(request));
    let tmpDir = fs.mkdtempSync('/tmp/magnet');
    await downloadMagnet(
        request.magnetLink, 1000, tmpDir,
        processCallBack= (client) => downloadProcessCallback(client, task),
        finishCallback= (client) => downloadFinishCallBack(client, task)
    );

    // do upload
    console.log("[Upload]: " + storage.uploadDest);
    await syncTaskStatus(task, "uploading", 0);
    await upload(tmpDir, storage.uploadDest)
    await syncTaskStatus(task, "uploading", 100);
    
    // ending
    console.log("[CleanUp]");
    fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.rmSync('/tmp/rclone.conf', { force: true });
    await deleteTaskMsg(taskMsg);
    await deleteTaskStatus(task);
    process.exit(0);
};

main();
