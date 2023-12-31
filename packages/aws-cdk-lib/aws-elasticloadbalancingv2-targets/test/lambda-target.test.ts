import { Template } from '../../assertions';
import * as ec2 from '../../aws-ec2';
import * as elbv2 from '../../aws-elasticloadbalancingv2';
import * as lambda from '../../aws-lambda';
import { Stack } from '../../core';
import * as targets from '../lib';

let stack: Stack;
let listener: elbv2.ApplicationListener;
let fn: lambda.Function;

beforeEach(() => {
  stack = new Stack();
  const vpc = new ec2.Vpc(stack, 'Stack');
  const lb = new elbv2.ApplicationLoadBalancer(stack, 'LB', { vpc });
  listener = lb.addListener('Listener', { port: 80 });

  fn = new lambda.Function(stack, 'Fun', {
    code: lambda.Code.fromInline('foo'),
    runtime: lambda.Runtime.PYTHON_3_9,
    handler: 'index.handler',
  });
});

test('Can create target groups with lambda targets', () => {
  // WHEN
  listener.addTargets('Targets', {
    targets: [new targets.LambdaTarget(fn)],
  });

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::ElasticLoadBalancingV2::TargetGroup', {
    TargetType: 'lambda',
    Targets: [
      { Id: { 'Fn::GetAtt': ['FunA2CCED21', 'Arn'] } },
    ],
  });
});

test('Lambda targets create dependency on Invoke permission', () => {
  // WHEN
  listener.addTargets('Targets', {
    targets: [new targets.LambdaTarget(fn)],
  });

  // THEN
  Template.fromStack(stack).hasResource('AWS::ElasticLoadBalancingV2::TargetGroup', (def: any) => {
    return (def.DependsOn ?? []).includes('FunInvokeServicePrincipalelasticloadbalancingamazonawscomD2CAC0C4');
  });
});
