import { Template } from '../../assertions';
import * as cloudfront from '../../aws-cloudfront';
import * as route53 from '../../aws-route53';
import * as s3 from '../../aws-s3';
import { NestedStack, Stack } from '../../core';
import * as targets from '../lib';

test('use CloudFrontTarget partition hosted zone id mapping', () => {
  // GIVEN
  const stack = new Stack();

  // WHEN
  targets.CloudFrontTarget.getHostedZoneId(stack);

  // THEN
  Template.fromStack(stack).hasMapping('AWSCloudFrontPartitionHostedZoneIdMap', {
    'aws': {
      zoneId: 'Z2FDTNDATAQYW2',
    },
    'aws-cn': {
      zoneId: 'Z3RFFRIM2A3IF5',
    },
  });
});

test('use CloudFrontTarget hosted zone id mappings in nested stacks', () => {
  // GIVEN
  const stack = new Stack();
  const nestedStackA = new NestedStack(stack, 'nestedStackA');
  const nestedStackB = new NestedStack(stack, 'nestedStackB');

  // WHEN
  targets.CloudFrontTarget.getHostedZoneId(nestedStackA);
  targets.CloudFrontTarget.getHostedZoneId(nestedStackB);

  // THEN
  for (let nestedStack of [nestedStackA, nestedStackB]) {
    Template.fromStack(nestedStack).hasMapping('AWSCloudFrontPartitionHostedZoneIdMap', {
      'aws': {
        zoneId: 'Z2FDTNDATAQYW2',
      },
      'aws-cn': {
        zoneId: 'Z3RFFRIM2A3IF5',
      },
    });
  }
});

test('use CloudFront as record target', () => {
  // GIVEN
  const stack = new Stack();

  const sourceBucket = new s3.Bucket(stack, 'Bucket');

  const distribution = new cloudfront.CloudFrontWebDistribution(stack, 'MyDistribution', {
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource: sourceBucket,
        },
        behaviors: [{ isDefaultBehavior: true }],
      },
    ],
  });

  // WHEN
  const zone = new route53.PublicHostedZone(stack, 'HostedZone', { zoneName: 'test.public' });
  new route53.ARecord(zone, 'Alias', {
    zone,
    recordName: '_foo',
    target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
  });

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::Route53::RecordSet', {
    AliasTarget: {
      DNSName: { 'Fn::GetAtt': ['MyDistributionCFDistributionDE147309', 'DomainName'] },
      HostedZoneId: {
        'Fn::FindInMap': [
          'AWSCloudFrontPartitionHostedZoneIdMap',
          {
            Ref: 'AWS::Partition',
          },
          'zoneId',
        ],
      },
    },
  });
});
