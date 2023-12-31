#!/bin/bash
#---------------------------------------------------------------------------------------------------
# executes unit tests
#
# prepares a staging directory with the requirements
set -e
script_dir=$(cd $(dirname $0) && pwd)

# prepare staging directory
staging=$(mktemp -d)
mkdir -p ${staging}
cd ${staging}

# copy src and overlay with test
cp ${script_dir}/../../../lib/aws-s3/notifications-resource-handler/index.py $PWD
cp ${script_dir}/test_index.py $PWD
cp ${script_dir}/Dockerfile $PWD

NOTIFICATIONS_RESOURCE_TEST_NO_DOCKER=${NOTIFICATIONS_RESOURCE_TEST_NO_DOCKER:-""}
DOCKER_CMD=${CDK_DOCKER:-docker}

if [ -z ${NOTIFICATIONS_RESOURCE_TEST_NO_DOCKER} ]; then
  # this will run our tests inside the right environment
  $DOCKER_CMD build .
else
  python test_index.py
fi
