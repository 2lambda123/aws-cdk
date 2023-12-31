import { Template } from '../../assertions';
import * as cdk from '../../core';
import * as apigateway from '../lib';

describe('http integration', () => {
  test('minimal setup', () => {
    // GIVEN
    const stack = new cdk.Stack();
    const api = new apigateway.RestApi(stack, 'my-api');

    // WHEN
    const integ = new apigateway.HttpIntegration('http://foo/bar');

    api.root.addMethod('GET', integ);

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::Method', {
      Integration: {
        IntegrationHttpMethod: 'GET',
        Type: 'HTTP_PROXY',
        Uri: 'http://foo/bar',
      },
    });
  });

  test('options can be passed via props', () => {
    // GIVEN
    const stack = new cdk.Stack();
    const api = new apigateway.RestApi(stack, 'my-api');

    // WHEN
    const integ = new apigateway.HttpIntegration('http://foo/bar', {
      httpMethod: 'POST',
      proxy: false,
      options: {
        cacheNamespace: 'hey',
      },
    });

    api.root.addMethod('GET', integ);

    // THEN
    Template.fromStack(stack).hasResourceProperties('AWS::ApiGateway::Method', {
      Integration: {
        CacheNamespace: 'hey',
        IntegrationHttpMethod: 'POST',
        Type: 'HTTP',
        Uri: 'http://foo/bar',
      },
    });
  });
});
