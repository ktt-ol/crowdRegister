#!/bin/bash
DIR=$(dirname $0)
rsync  -avzi --delete --no-owner --exclude 'node_modules/' --no-group $DIR/../dist/ ktt_atlassian:/home/atlassian/crowdRegister/dist/
