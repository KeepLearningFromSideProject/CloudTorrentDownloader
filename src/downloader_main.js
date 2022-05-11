const AWS = require("aws-sdk");
var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
var sqs = new AWS.SQS({ apiVersion: "2012-11-05" });

const getItem = () => {
    let params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            task_name: { S: "bello" },
        },
    };
    return ddb.getItem(params).promise();
};

const putItem = () => {
    let params = {
        TableName: process.env.TABLE_NAME,
        Item: {
            task_name: { S: "bello" },
            title: { S: "title" },
            info: {
                M: {
                    plot: { S: "ppp" },
                    rating: { S: "rating" },
                },
            },
        },
    };
    return ddb.putItem(params).promise();
};

const sendMessage = () => {
    let params = {
        MessageBody: "wtfMsg",
        QueueUrl: process.env.SQS_URL,
    };
    console.log(params);
    return sqs.sendMessage(params).promise();
};

const receiveMessage = () => {
    let params = {
        QueueUrl: process.env.SQS_URL,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: 10,
    };
    return sqs.receiveMessage(params).promise();
};

const deleteMessage = (msg) => {
    let params = {
        QueueUrl: process.env.SQS_URL,
        ReceiptHandle: msg.ReceiptHandle,
    };
    return sqs.deleteMessage(params).promise();
};

const handler = async () => {
    let res = await getItem();
    console.log(res);
    res = await putItem();
    console.log(res);
    res = await getItem();
    console.log(res);

    res = await sendMessage();
    console.log(res);

    res = await receiveMessage();
    console.log(res);

    res = await deleteMessage(res.Messages[0]);
    console.log(res);
};

handler();
