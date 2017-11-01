# MessageClient

Minimal message board application to demonstrate how to get started with develping a full-stack application. 

The client is and single-page application (SPA) made with Angular 4 framework. The Angular CLI tool is used for 
generating the initial project and running the development web server.

The server uses the restify library to implement a Rest API for storing and retrieving the messages. The server is
written in TypeScript just like the client and run with Node.js.

Here are the insctructions/tutorial for creating this project. There isn't any authentication, so run the server only in 
firewalled network. 

## Summary

1. Standalone client
2. Test in a browser
3. Server
4. Modify the client to store messages on the server

## Standalone client

```
# create two github repositories in the github.com and clone them (your own empty repositories, these URLs will
# clone the finished example)

git clone https://github.com/klemela/message-client.git
git clone https://github.com/klemela/message-server.git

# Client v1

# install Angular CLI (assuming you already have npm installed)
sudo npm install -g @angular/cli

# create new Angular project
ng new message-client
cd message-client

# Start serving it
ng serve

# implement the client functionality in src/app/app.component.ts like this  

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  messages = [];

  save(msg) {
    this.messages.push(msg);
  }
}

# implement a view for the client  in src/app/app.component.html

<div style="text-align:center">
  <h1>Messages</h1>
  <p *ngFor="let msg of messages">{{msg}}</p>

  <br>
  <input #newMessage>
  <button (click)="save(newMessage.value)">Save</button>
</div>

```



## Test in a browser

Open localhost:4200 in browser, hit cmd+shif+I to show developer console. You should be able to save new messages, but
those are lost if you reload the page.

## Server
```
cd ../message-server
# create a new npm project
npm init

# install the restify library
npm install restify@5.2.0 --save

# create file index.ts and implement the server

const restify = require('restify');

export class MessageServer {
	messages = [];

	start() {
		const server = restify.createServer();

		server.use(restify.plugins.bodyParser());

		server.post('/', (req, res, next) => {
			console.log('POST reqeust', req.body);
			this.messages.push(req.body.message);
			res.send('{}');
			return next();
		});

		server.get('/', (req, res, next) => {
			console.log('GET request');
			res.send(this.messages);
			return next();
		});

		server.listen(8080, () => {
			console.log('listening');
		})
	}
}

new MessageServer().start();


# add a simple script to package.json next to the "test" script to compile and run the server 

"start": "tsc *.ts; node index.js"

# and run it
npm start

# you can test the server by sending requests with curl
curl localhost:8080
curl localhost:8080 -X POST  -H "Content-Type: application/json" --data '{"message": "Hello world!"}'
curl localhost:8080

# we have configure CORS headers to allow browser to make requests, install a plugin for it 

npm install restify-cors-middleware --save

# configure the CORS headers in index.ts
# import the plugin in the beginning of the file
const corsMiddleware = require('restify-cors-middleware');

# and configure it later after the server object is created
const cors = corsMiddleware({origins: ['*']});
server.pre(cors.preflight);
server.use(cors.actual);

```

## Modify the client to store messages on the server
```
# create a file (in message-client project) src/app/assets/server.conf that will be a configuration file for the 
# backend address. Put this text to it:

http://localhost:8080

# Import the HttpModule in src/app/app.module.ts

imports: [ HttpModule ]

# make the wollowing changes to the src/app/app.component.ts
# keep the rows that are not mentioned here or get the whole file from the git repository

import 'rxjs/Rx';

export class AppComponent implements OnInit {

  constructor (private http: Http) {
  }

  ngOnInit() {
    this.update();
  }

  getUrl() {
    return this.http.get('assets/server.conf')
      .map(response => response.text());
  }

  update() {
    this.getUrl()
      .mergeMap(url => this.http.get(url))
      .subscribe(response => {
        this.messages = response.json()
      });
  }

  save(msg) {
    // this.messages.push(msg);
    this.getUrl()
      .mergeMap(url => this.http.post(url, {message: msg}))
      .subscribe(() => this.update());
  }

```

## Suplementary material

### Server compile errors

The server compile errors can be fixed by installing these typings

```
npm install @types/node --save-dev
npm install @types/es6-promise --save-dev

```

### Run the server in OpenShift

Before starting, make sure you can firewall the instance appropriately. You should really compile the server project in 
OpenShift instead of using the committed .js file like we do here. And you should replace the development server too.
```
# login the OpenShift
# create new project ?message?
# Create new deployments for both projects by selecting JavaScript -> Nodejs v6 -> paste git repo urls
# Add an env for the client: SERVER http://message-server-message.oso-qa.csc.fi

# modify client?s package.json to configure the server address and run the development server
# we used "ng serve" instead of "npm start" to test the client locally, which will still work 

"start": "echo $SERVER > src/assets/server.conf; ng serve --port 8080 --host 0.0.0.0 --disable-host-check --live-reload false",

```
