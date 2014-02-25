# Crowd Register

A standalone web application that provides a registration feature for an Atlassian Crowd openid server.

## Workflow

1. User signs up for an account.
2. Admin get notified by email.
3. Admin checks the new request and accepts the user.
4. User gets a confirmation email and is fully activated.

## Install

Go to ```lib/config/env/``` and copy the ```_template_.sh``` to ```all.js``` and change the configuration for your needs. After this you can build the package with

      npm install
      grunt build

Copy the the content of the ```dist``` folder to your server and start the server with

      NODE_ENV=production node server

You find a start/stop script in ```extras/``` (based on https://www.exratione.com/2013/02/nodejs-and-forever-as-a-service-simple-upstart-and-init-scripts-for-ubuntu/ ).

## Technical details

This app doesn't have an own backend. It uses the crowd server's rest api to create and manipulate user. A special group is used to mark user waiting for activation. Until the user is activated by the admin the account is disabled.
