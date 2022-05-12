from aws_cdk import (
    Duration,
    Stack,
    aws_sqs as sqs,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    aws_eks as eks,
    aws_ec2 as ec2,
    aws_ecr_assets as aea,
    aws_ecr as ecr,
)
from constructs import Construct
from os import path, getcwd

import aws_cdk as cdk


class CdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)
        ## Create new VPC
        #vpc = ec2.Vpc(self, id=f"{construct_id}-Vpc")

        ## Create SQS
        #queue = sqs.Queue(
        #    self, f"{construct_id}-TaskQueue",
        #    visibility_timeout=Duration.seconds(300)
        #)

        ## Create Dynamodb
        #table = dynamodb.Table(
        #    self, f"{construct_id}-TaskStatusTable",
        #    partition_key={'name': 'task_name',
        #                   'type': dynamodb.AttributeType.STRING},
        #    removal_policy=cdk.RemovalPolicy.DESTROY
        #)

        ## Create master role for managing EKS
        #iam_role = iam.Role(
        #    self, id=f"{construct_id}-Iam",
        #    role_name=f"{construct_id}-Iam",
        #    assumed_by=iam.AccountRootPrincipal()
        #)

        ## Create Eks cluster
        #eks_cluster = eks.Cluster(
        #    self, id=f"{construct_id}-Cluster",
        #    cluster_name=f"{construct_id}-Cluster",
        #    vpc=vpc,
        #    vpc_subnets=vpc.public_subnets,
        #    masters_role=iam_role,
        #    default_capacity_instance=ec2.InstanceType.of(
        #        ec2.InstanceClass.BURSTABLE2,
        #        ec2.InstanceSize.MICRO
        #    ),
        #    version=eks.KubernetesVersion.V1_21,
        #)

        ## Add service account on EKS and attach permission to it
        #service_account = eks_cluster.add_service_account("EksUser")
        #queue.grant_send_messages(service_account)
        #queue.grant_consume_messages(service_account)
        #table.grant_read_write_data(service_account)

        ## Build image and push to ECR
        #build_context = path.realpath(
        #    path.join(path.dirname(__file__), '..', '..', '..'))
        #worker_dockerfile = path.join(
        #    'env', 'eks', 'docker_imgs', 'worker', 'dockerfile'
        #)
        #build_excludes = [path.join('env', 'cdk')]
        #worker_asset = aea.DockerImageAsset(
        #    self, id=f"{construct_id}-Worker",
        #    directory=build_context,
        #    file=worker_dockerfile,
        #    exclude=build_excludes,
        #    build_args={'SRC_PATH': '.'}
        #)

        ## Start sample pod
        #eks_cluster.add_manifest("workerPod", {
        #    "apiVersion": "v1",
        #    "kind": "Pod",
        #    "metadata": {"name": "worker"},
        #    "spec": {
        #        "serviceAccountName": service_account.service_account_name,
        #        "containers": [{
        #            "name": "worker",
        #            "image": worker_asset.image_uri,
        #            "env": [
        #                {
        #                    "name": "TABLE_NAME",
        #                    "value": table.table_name
        #                },
        #                {
        #                    "name": "SQS_URL",
        #                    "value": queue.queue_url
        #                }
        #            ]
        #        }]
        #    }
        #})

        #cdk.CfnOutput(self, "TaskQueueURL", value=queue.queue_url)
        #cdk.CfnOutput(self, "TaskStatusTableName", value=table.table_name)
        #cdk.CfnOutput(self, "ServiceAccountIamRoleArn",
        #              value=service_account.role.role_arn)
        #cdk.CfnOutput(self, "ServiceAccountName",
        #              value=service_account.service_account_name)
        #cdk.CfnOutput(self, "WorkerImageUri",
        #              value=worker_asset.image_uri)
