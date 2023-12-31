module.exports = () => {
    const fs= require('fs');
    const regions = JSON.parse(process.env.REGIONS);
    const content = generateFileContent(regions);
    const path = './packages/aws-cdk-lib/region-info/build-tools/metadata.ts';
    fs.writeFileSync(path, content);
}

function generateFileContent(regions) {
    const template = `/*
* Do not edit this file manually. To prevent misconfiguration, this file
* should only be modified by an automated GitHub workflow, that ensures
* that the regions present in this list correspond to all the regions
* where we have the AWS::CDK::Metadata handler deployed.
*
* See: https://github.com/aws/aws-cdk/issues/27189
*/

export const AWS_CDK_METADATA = new Set([
$REGIONS
]);
`;

    const list = regions.sort().map(r => `  '${r}',`).join('\n');
    return template.replace('$REGIONS', list);
}