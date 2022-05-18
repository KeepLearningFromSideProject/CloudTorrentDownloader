import os
import json
import uuid
import boto3
import base64
import datetime
from flask import Flask, request, jsonify
from flask_cors import cross_origin

app = Flask(__name__)
sqs = boto3.client("sqs")
queue_url = os.environ['SQS_URL']
table_name = os.environ['TABLE_NAME']

ddb = boto3.resource('dynamodb')
table = ddb.Table(os.environ['TABLE_NAME'])


@app.route("/task/status/<uuid>", methods=['GET'])
@cross_origin()
def getTaskStatus(uuid: str):
    resp = table.get_item(Key={'task_name': uuid})
    return resp['Item']


@app.route("/task", methods=['POST'])
@cross_origin()
def createTask():
    taskUuid = uuid.uuid5(uuid.NAMESPACE_URL, request.json['magnet_link']).hex
    requestObj = {
        'uuid': taskUuid,
        'magnetLink': request.json['magnet_link']
    }

    storageObj = {
        'rcloneConf': getBase64RcloneConf(request.json['access_token']),
        'uploadDest': 'self:' + request.json['dest']
    }

    msg = json.dumps({'request': requestObj, 'storage': storageObj})
    sqs.send_message(QueueUrl=queue_url, MessageBody=msg)
    return taskUuid


def getBase64RcloneConf(accessToken):
    expiry = datetime.datetime.now() + datetime.timedelta(days=1)

    token = {
        'access_token': accessToken,
        'token_type': 'Bearer',
        'refresh_token': '',
        'expiry': expiry.isoformat() + 'Z'
    }
    rawRcloneConf = "[self]\ntype = drive\nconfig_is_local = false\ntoken = "
    rawRcloneConf += json.dumps(token)

    return base64.b64encode(rawRcloneConf.encode()).decode()


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
    connection.close()
