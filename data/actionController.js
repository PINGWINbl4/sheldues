var http = require('http');
var querystring = require('querystring');

async function checkActions(stationsShelldue, user){
    try{
        //console.log(stationsShelldue)
        const actions = stationsShelldue.shelldueScript.actions
        
        for (let i = 0; i < actions.length; i++) {
            const actionsKeys = Object.keys(actions[i])
            
            if(actionsKeys.includes("notification")){
                //console.log(actions[i].notification)
                
                const body = actions[i].notification.notificationMessage
                switch (actions[i].notification.messageType) {
                    case "push":
                        const title = stationsShelldue.name
                        postPushMessage(user, title, body)
                        break;
                    case "email":
                        postEmailMessage(user, body)
                        break
                    default:
                        throw new Error(`Invalid notification action. Expected push or email. Geted ${actions[i].notification.messageType}`);
                }
            }
        }    
    }
    catch(err){
        console.log(err)
    }
}

async function postPushMessage(user, title, body){
    try{
        if(!user.get_push){
            throw new Error(`User ${user.email} don't wont to get push messages`)
        }
        const push = {
            to: user.token,
            title: title,
            body: body,
          };
        const postData = {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
    
        //make sure to serialize your JSON body
            body: JSON.stringify({
                push: push
            })
        }
        fetch(`http://${process.env.PUSH_HOST}:${process.env.PUSH_PORT}/api/push`, postData)
        .then(async (res) => {console.log(await res.json())})
        .catch(err => {throw new Error(err)})
    
    }
    catch(err){
        console.log(err)
    }
}

async function postEmailMessage(user, content, html = undefined){
    try{
        // Build the post string from an object
        //console.log(html)
        var post_data = querystring.stringify({
            user    :   user,
            content :   content,
            html    :   html
        });
      
        // An object of options to indicate where to post to
        var post_options = {
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            path: '/api/mail',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(post_data)
            }
        };
      
        // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('Response: ' + chunk);
            });
        });
      console.log(post_data)
        // post the data
        post_req.write(post_data);
        post_req.end();
    }
    catch(err){
        console.log(err)
    }
}

module.exports = {
    checkActions
}