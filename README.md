## User Management Tasks

this is only backend service to manage tasks user's

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Features

* user can register, login, profile
* create todo
* view and filter all todos | detail todo
* update ``is on the way``
* ajv validator
* jwt token

by default, the response each request will get response

````
{
    status: Boolean,
    message: String
    data: Object || Array
}
````

> ### _**LIST URI**_

* *POST*    /api/ping
>>> `to check if this service is on (StatusCode: 200) or not (StatusCode: 500). `


* *POST*    /api/auth/register
>>> `User Registration`

```
body :
{
    "fullname": "mrbontor",
    "username": "mrbontor11",
    "email": "mrbontor11@gmail.com",
    "password": "123456",
    "re_password": "123456"
}

```

* *POST*    /api/auth/login
>>> `User login`

```
body :
{
    "username": "mrbontor11",
    "email": "mrbontor11@gmail.com"
}
```

You will need `token` to access uri below.
Token will given while doing `login` successful

this backend service using standard authorization,  `jsonwebtoken`
so you need to put headers for each request below

````
Authentication: Bearer Token
````

* *GET*    /api/auth/profile
>>> `User profile, u can check how JWT is working by this uri.`


* *POST*    /api/task/create
>>> i made an optional to create task, `is_forever`

`is_forever` mean to be the task is active forever :D

request if `is_forever` false
```
body :
{
    "name": String,
    "description": String,
    "start_at": Datetime,
    "end_at":" Datetime",
    "is_forever": Boolean(0,1),

}
````

than
```
body :
{
    "name": String,
    "description": String,
    "start_at": Datetime,
    "end_at":" Datetime",
    "is_forever": Boolean(0,1),
    "data_forever": {
        "at_time": Date time,
        "at_date": Datetime,
        "description": String       
    }

}
````

* *POST*    /api/task/update
>>> ` Is on going..`

* *GET*    /api/task/today
>>> ` Get List tasks today`

* *GET*    /api/task/forever/:is
>>> ` this uri mean to filter tasks`

```
params : is => yes | no
````

* *GET*    /api/task/:name
>>> ` this uri mean to get tasks by name`

```
params : name of task created ||
````


* *GET*    /api/task/detail/:id
>>> ` this uri mean to get detail task by id`

```
params : name of task created ||
````


### Prerequisites

What things you need to install the software and how to install them

```
node js
mysql2
sequelize
winston
jsonwebtoken
ajv
```

### Installing

```
git clone
npm install --save
node index.js --config=/path/to/configs/file --logLevel=info
```

The default path for config file is `./configs/config.user.task.api.dev.ini`, you can explicitly add config file in `--config` or `-c` argument.

### Configuring

[app]
host	= 0.0.0.0
port	= 2369

; log Configuration
[log]
path    	                = var/log/
level 	                    = debug

[credential]
secret                      = TobokBontorSitanggangDeveloper
;the secret for jwt token
method                      = sha512
;the method to make hash password
expired                     = 1h
;jwt token expire time

### Running as a Service

This module is running in the foreground, to run it as a background service please add `2>&1 &` following the command. So it would be like:

```sh
node index.js --config=/path/to/config/file --logLevel=info 2>&1 &
```

Or you can utilize Linux systemd (if you are a Linux user). Create systemd file in `/etc/systemd/system`:
```
[Unit]
Description=User Task Management

[Service]
ExecStart=/path/to/node /app/index.js
Restart=always
User=nobody
# Note Debian/Ubuntu uses 'nogroup', RHEL/Fedora uses 'nobody'
Group=nogroup
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/app

[Install]
WantedBy=multi-user.target
```

## Running the tests

No tests yet. You can add yourself as a contributior and make it by yourself. We would appreciate it a lot.

## Deployment

This app has `Dockerfile` to deploy it in docker system. Build image and run it as a container:

```sh
docker build --tag user-tasks-management
docker run --rm user-tasks-management
```

You can also use `docker-compose` to deploy it. Create a `yaml` configuration:

```yaml
version: '2'
services:
  user-tasks-management:
    build: .
    container_name: user-tasks-management
    volumes:
      - /volumes/user-tasks-management/log:/app/var/log
networks:
  default:
    external:
      name: network_name

```

Change `network_name` to the name of your docker network


You can also monitor any request to service . Open terminal(linux)/bash - cmd(windows)

```
tail -f var/log/logUsersTask.log
```


## Contributing

Please contact your team leader for details of the process for submitting pull requests to us.

## Acknowledgments

* User Tasks Management


## to be continue...
