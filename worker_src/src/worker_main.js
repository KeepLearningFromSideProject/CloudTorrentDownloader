const fs = require("fs")
const AWS = require("aws-sdk");
const downloadMagnet = require("./download_magnet");
const upload = require("./upload");

const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });


// SQS operations
const getTaskMsg = () => {
    let params = {
        QueueUrl: process.env.SQS_URL,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 3600,
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
    await syncTaskStatus(task, 'completed', '-');
    process.exit(0);
};

main();
