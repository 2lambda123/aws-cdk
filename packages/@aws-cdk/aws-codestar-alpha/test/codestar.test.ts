import { Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { GitHubRepository, RepositoryVisibility } from '../lib';

describe('GitHub Repository', () => {
  let stack: cdk.Stack;

  beforeEach(() => {
    const app = new cdk.App();
    stack = new cdk.Stack(app, 'GitHubDemo');
  });

  test('create', () => {
    new GitHubRepository(stack, 'GitHubRepo', {
      owner: 'foo',
      repositoryName: 'bar',
      accessToken: cdk.SecretValue.secretsManager('my-github-token', {
        jsonField: 'token',
      }),
      contentsBucket: Bucket.fromBucketName(stack, 'Bucket', 'bucket-name'),
      contentsKey: 'import.zip',
    });

    Template.fromStack(stack).hasResourceProperties('AWS::CodeStar::GitHubRepository', {
      RepositoryAccessToken: '{{resolve:secretsmanager:my-github-token:SecretString:token::}}',
      RepositoryName: 'bar',
      RepositoryOwner: 'foo',
      Code: {
        S3: {
          Bucket: 'bucket-name',
          Key: 'import.zip',
        },
      },
    });
  });

  test('enable issues and private', () => {
    new GitHubRepository(stack, 'GitHubRepo', {
      owner: 'foo',
      repositoryName: 'bar',
      accessToken: cdk.SecretValue.secretsManager('my-github-token', {
        jsonField: 'token',
      }),
      contentsBucket: Bucket.fromBucketName(stack, 'Bucket', 'bucket-name'),
      contentsKey: 'import.zip',
      enableIssues: true,
      visibility: RepositoryVisibility.PRIVATE,
    });

    Template.fromStack(stack).hasResourceProperties('AWS::CodeStar::GitHubRepository', {
      EnableIssues: true,
      IsPrivate: true,
    });
  });
});
