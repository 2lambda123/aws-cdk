import { Template } from '../../assertions';
import * as autoscaling from '../../aws-autoscaling';
import * as cloudwatch from '../../aws-cloudwatch';
import * as ec2 from '../../aws-ec2';
import { Stack } from '../../core';
import * as actions from '../lib';

test('can use topic as alarm action', () => {
  // GIVEN
  const stack = new Stack();
  const vpc = new ec2.Vpc(stack, 'Vpc');
  const autoScalingGroup = new autoscaling.AutoScalingGroup(stack, 'ASG', {
    minCapacity: 1,
    maxCapacity: 100,
    instanceType: new ec2.InstanceType('t-1000.macro'),
    machineImage: new ec2.AmazonLinuxImage(),
    vpc,
  });
  const action = new autoscaling.StepScalingAction(stack, 'Action', {
    autoScalingGroup,
  });
  const alarm = new cloudwatch.Alarm(stack, 'Alarm', {
    metric: new cloudwatch.Metric({ namespace: 'AWS', metricName: 'Henk' }),
    evaluationPeriods: 3,
    threshold: 100,
  });

  // WHEN
  alarm.addAlarmAction(new actions.AutoScalingAction(action));

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::CloudWatch::Alarm', {
    AlarmActions: [
      { Ref: 'Action62AD07C0' },
    ],
  });
});
