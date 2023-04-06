"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lambda = require("aws-cdk-lib/aws-lambda");
const sns = require("aws-cdk-lib/aws-sns");
const sqs = require("aws-cdk-lib/aws-sqs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const integ = require("@aws-cdk/integ-tests-alpha");
const triggers = require("aws-cdk-lib/triggers");
const app = new aws_cdk_lib_1.App();
const stack = new aws_cdk_lib_1.Stack(app, 'MyStack');
const topic1 = new sns.Topic(stack, 'Topic1');
const topic2 = new sns.Topic(stack, 'Topic2');
const triggerFunction = new triggers.TriggerFunction(stack, 'MyTriggerFunction', {
    runtime: lambda.Runtime.NODEJS_16_X,
    handler: 'index.handler',
    code: lambda.Code.fromInline('exports.handler = function() { console.log("hi"); };'),
    executeBefore: [topic1],
});
const assertionQueue = new sqs.Queue(stack, 'TestQueue', {
    queueName: 'trigger-assertion-queue',
});
const func = new lambda.Function(stack, 'MyLambdaFunction', {
    runtime: lambda.Runtime.NODEJS_16_X,
    handler: 'index.handler',
    timeout: aws_cdk_lib_1.Duration.minutes(15),
    code: lambda.Code.fromInline('exports.handler = async function() { await setTimeout(() => {console.log("hi")}, 3*60*1000); };'),
});
const trigger = new triggers.Trigger(stack, 'MyTrigger', {
    handler: func,
    invocationType: triggers.InvocationType.EVENT,
    timeout: aws_cdk_lib_1.Duration.minutes(1),
    executeAfter: [topic1],
});
const funcWithAssertion = new lambda.Function(stack, 'MyAssertionLambdaFunction', {
    runtime: lambda.Runtime.NODEJS_16_X,
    handler: 'index.handler',
    timeout: aws_cdk_lib_1.Duration.minutes(15),
    code: lambda.Code.fromAsset('lib'),
    environment: {
        QUEUE_URL: assertionQueue.queueUrl,
    },
});
assertionQueue.grantSendMessages(funcWithAssertion);
new triggers.Trigger(stack, 'MyAssertionTrigger', {
    handler: funcWithAssertion,
    invocationType: triggers.InvocationType.REQUEST_RESPONSE,
    timeout: aws_cdk_lib_1.Duration.minutes(1),
    executeAfter: [assertionQueue],
});
triggerFunction.executeAfter(topic2);
trigger.executeAfter(topic2);
new triggers.TriggerFunction(stack, 'MySecondFunction', {
    runtime: lambda.Runtime.NODEJS_16_X,
    handler: 'index.handler',
    code: lambda.Code.fromInline('exports.handler = function() { console.log("hello"); };'),
});
new triggers.Trigger(stack, 'MyDefaultPropTrigger', {
    handler: func,
});
const testCase = new integ.IntegTest(app, 'TriggerTest', {
    testCases: [stack],
});
testCase.assertions.awsApiCall('SQS', 'receiveMessage', {
    QueueUrl: assertionQueue.queueUrl,
    WaitTimeSeconds: 20,
}).assertAtPath('Messages.0.Body', integ.ExpectedResult.stringLikeRegexp('^hello world!$')).waitForAssertions({
    totalTimeout: aws_cdk_lib_1.Duration.minutes(5),
    interval: aws_cdk_lib_1.Duration.seconds(15),
    backoffRate: 3,
});
app.synth();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZWcudHJpZ2dlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbnRlZy50cmlnZ2Vycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlEQUFpRDtBQUNqRCwyQ0FBMkM7QUFDM0MsMkNBQTJDO0FBQzNDLDZDQUFtRDtBQUNuRCxvREFBb0Q7QUFDcEQsaURBQWlEO0FBRWpELE1BQU0sR0FBRyxHQUFHLElBQUksaUJBQUcsRUFBRSxDQUFDO0FBQ3RCLE1BQU0sS0FBSyxHQUFHLElBQUksbUJBQUssQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFFeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM5QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBRTlDLE1BQU0sZUFBZSxHQUFHLElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLEVBQUU7SUFDL0UsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVztJQUNuQyxPQUFPLEVBQUUsZUFBZTtJQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsc0RBQXNELENBQUM7SUFDcEYsYUFBYSxFQUFFLENBQUMsTUFBTSxDQUFDO0NBQ3hCLENBQUMsQ0FBQztBQUVILE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsV0FBVyxFQUFFO0lBQ3ZELFNBQVMsRUFBRSx5QkFBeUI7Q0FDckMsQ0FBQyxDQUFDO0FBRUgsTUFBTSxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxrQkFBa0IsRUFBRTtJQUMxRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO0lBQ25DLE9BQU8sRUFBRSxl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aWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBzbnMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNucyc7XG5pbXBvcnQgKiBhcyBzcXMgZnJvbSAnYXdzLWNkay1saWIvYXdzLXNxcyc7XG5pbXBvcnQgeyBBcHAsIER1cmF0aW9uLCBTdGFjayB9IGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGludGVnIGZyb20gJ0Bhd3MtY2RrL2ludGVnLXRlc3RzLWFscGhhJztcbmltcG9ydCAqIGFzIHRyaWdnZXJzIGZyb20gJ2F3cy1jZGstbGliL3RyaWdnZXJzJztcblxuY29uc3QgYXBwID0gbmV3IEFwcCgpO1xuY29uc3Qgc3RhY2sgPSBuZXcgU3RhY2soYXBwLCAnTXlTdGFjaycpO1xuXG5jb25zdCB0b3BpYzEgPSBuZXcgc25zLlRvcGljKHN0YWNrLCAnVG9waWMxJyk7XG5jb25zdCB0b3BpYzIgPSBuZXcgc25zLlRvcGljKHN0YWNrLCAnVG9waWMyJyk7XG5cbmNvbnN0IHRyaWdnZXJGdW5jdGlvbiA9IG5ldyB0cmlnZ2Vycy5UcmlnZ2VyRnVuY3Rpb24oc3RhY2ssICdNeVRyaWdnZXJGdW5jdGlvbicsIHtcbiAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE2X1gsXG4gIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUlubGluZSgnZXhwb3J0cy5oYW5kbGVyID0gZnVuY3Rpb24oKSB7IGNvbnNvbGUubG9nKFwiaGlcIik7IH07JyksXG4gIGV4ZWN1dGVCZWZvcmU6IFt0b3BpYzFdLFxufSk7XG5cbmNvbnN0IGFzc2VydGlvblF1ZXVlID0gbmV3IHNxcy5RdWV1ZShzdGFjaywgJ1Rlc3RRdWV1ZScsIHtcbiAgcXVldWVOYW1lOiAndHJpZ2dlci1hc3NlcnRpb24tcXVldWUnLFxufSk7XG5cbmNvbnN0IGZ1bmMgPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHN0YWNrLCAnTXlMYW1iZGFGdW5jdGlvbicsIHtcbiAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE2X1gsXG4gIGhhbmRsZXI6ICdpbmRleC5oYW5kbGVyJyxcbiAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygxNSksXG4gIGNvZGU6IGxhbWJkYS5Db2RlLmZyb21JbmxpbmUoJ2V4cG9ydHMuaGFuZGxlciA9IGFzeW5jIGZ1bmN0aW9uKCkgeyBhd2FpdCBzZXRUaW1lb3V0KCgpID0+IHtjb25zb2xlLmxvZyhcImhpXCIpfSwgMyo2MCoxMDAwKTsgfTsnKSxcbn0pO1xuXG5jb25zdCB0cmlnZ2VyID0gbmV3IHRyaWdnZXJzLlRyaWdnZXIoc3RhY2ssICdNeVRyaWdnZXInLCB7XG4gIGhhbmRsZXI6IGZ1bmMsXG4gIGludm9jYXRpb25UeXBlOiB0cmlnZ2Vycy5JbnZvY2F0aW9uVHlwZS5FVkVOVCxcbiAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygxKSxcbiAgZXhlY3V0ZUFmdGVyOiBbdG9waWMxXSxcbn0pO1xuXG5jb25zdCBmdW5jV2l0aEFzc2VydGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24oc3RhY2ssICdNeUFzc2VydGlvbkxhbWJkYUZ1bmN0aW9uJywge1xuICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTZfWCxcbiAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICB0aW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDE1KSxcbiAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsaWInKSxcbiAgZW52aXJvbm1lbnQ6IHtcbiAgICBRVUVVRV9VUkw6IGFzc2VydGlvblF1ZXVlLnF1ZXVlVXJsLFxuICB9LFxufSk7XG5cbmFzc2VydGlvblF1ZXVlLmdyYW50U2VuZE1lc3NhZ2VzKGZ1bmNXaXRoQXNzZXJ0aW9uKTtcblxubmV3IHRyaWdnZXJzLlRyaWdnZXIoc3RhY2ssICdNeUFzc2VydGlvblRyaWdnZXInLCB7XG4gIGhhbmRsZXI6IGZ1bmNXaXRoQXNzZXJ0aW9uLFxuICBpbnZvY2F0aW9uVHlwZTogdHJpZ2dlcnMuSW52b2NhdGlvblR5cGUuUkVRVUVTVF9SRVNQT05TRSxcbiAgdGltZW91dDogRHVyYXRpb24ubWludXRlcygxKSxcbiAgZXhlY3V0ZUFmdGVyOiBbYXNzZXJ0aW9uUXVldWVdLFxufSk7XG5cbnRyaWdnZXJGdW5jdGlvbi5leGVjdXRlQWZ0ZXIodG9waWMyKTtcbnRyaWdnZXIuZXhlY3V0ZUFmdGVyKHRvcGljMik7XG5cbm5ldyB0cmlnZ2Vycy5UcmlnZ2VyRnVuY3Rpb24oc3RhY2ssICdNeVNlY29uZEZ1bmN0aW9uJywge1xuICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMTZfWCxcbiAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tSW5saW5lKCdleHBvcnRzLmhhbmRsZXIgPSBmdW5jdGlvbigpIHsgY29uc29sZS5sb2coXCJoZWxsb1wiKTsgfTsnKSxcbn0pO1xuXG5uZXcgdHJpZ2dlcnMuVHJpZ2dlcihzdGFjaywgJ015RGVmYXVsdFByb3BUcmlnZ2VyJywge1xuICBoYW5kbGVyOiBmdW5jLFxufSk7XG5cbmNvbnN0IHRlc3RDYXNlID0gbmV3IGludGVnLkludGVnVGVzdChhcHAsICdUcmlnZ2VyVGVzdCcsIHtcbiAgdGVzdENhc2VzOiBbc3RhY2tdLFxufSk7XG5cbnRlc3RDYXNlLmFzc2VydGlvbnMuYXdzQXBpQ2FsbCgnU1FTJywgJ3JlY2VpdmVNZXNzYWdlJywge1xuICBRdWV1ZVVybDogYXNzZXJ0aW9uUXVldWUucXVldWVVcmwsXG4gIFdhaXRUaW1lU2Vjb25kczogMjAsXG59KS5hc3NlcnRBdFBhdGgoJ01lc3NhZ2VzLjAuQm9keScsIGludGVnLkV4cGVjdGVkUmVzdWx0LnN0cmluZ0xpa2VSZWdleHAoJ15oZWxsbyB3b3JsZCEkJykpLndhaXRGb3JBc3NlcnRpb25zKHtcbiAgdG90YWxUaW1lb3V0OiBEdXJhdGlvbi5taW51dGVzKDUpLFxuICBpbnRlcnZhbDogRHVyYXRpb24uc2Vjb25kcygxNSksXG4gIGJhY2tvZmZSYXRlOiAzLFxufSk7XG5cbmFwcC5zeW50aCgpO1xuIl19