# node-push
Simple Node Push service based on Socket.io

![node-push diagram](https://i.imgur.com/umZBLKy.png "node-push diagram")

Here is a simple demo of a Node TCP Push notification service using "realtime" Socket.io socket connection for web, that you can adopt to your own liking. 

## How it works

1. Client subscribes on the service over Socket.io on port 8080 (you can change the port depending on your configuration) via his unique user_id, the demo doesn't have the user validation, but you can add a validation process and adopt it to your liking. If user creds are valid, that user is subscribed to the service.
2. Upon notification happening on the server (in this example it's a Web Server with PHP, but it can be any really) the server connects to the service via the TCP socket over the port 9555 and sends a JSON formated message targeting a user via user_id.
`{"user_id": the_id_of_your_user, "message": "some notification message"}`
3. If that user is subscribed to the service the message is passed to the client with that ID. Multiple connections can be made by one user.
4. Client get's the message and can request the details from the server like it would regularly via HTTP.

That's it.
 
## How to run the demo

* `npm install` -  will install the required nodejs dependancies
* Open `index.html` in two bowsers or tabs, you can open it like a file, they don't have to be hosted. Enter the id 0 in one, and id 1 in the other
* Run hosted `test.php`, each client will recieve it's own messages
* Remember, php and nodejs should run on the same machine for the demo. You can edit the targeted IP and IP check if you want to host the push service somewhere else, for instance HEROKU.
* Code is pretty simple and straightforward. It should be extremely easy to adopt it to your needs. I hope you enjoy it.

## Thanks

This demo is adapted from the Socket.io chat demo, thanks socket.io!

Your's truly,
Stamat
