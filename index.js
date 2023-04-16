const fs = require('fs');
const http = require('http');
const crypto = require("crypto");

const setting = JSON.parse(fs.readFileSync('setting.json', 'utf-8'));
setting.token = crypto.randomUUID();

http.createServer((req, res) => {
  if(req.method === 'GET') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(fs.readFileSync('./html/index.html', 'utf-8'));
	};
	if(req.method === 'POST') {
	  let data = '';
	  req.on('data', function(chunk) {
	    data += chunk;
	  }).on('end', function(){
	    data = JSON.parse(data);
	    if(data.type=="chat_update" && data.token == setting.token) {
	      let chats = [];
	      const chat_list = JSON.parse(fs.readFileSync('chat.json', 'utf-8'));
	      if(chat_list.length == 0) {
	        res.writeHead(200, {'Content-Type': 'application/json'});
	        res.end(JSON.stringify({
	          type: "null"
	        }));
	      }else{
	        for(let i=0;i<chat_list.length;i++){
	          if(data.time < chat_list[i].timestamp) {
	            chats.push(chat_list[i]);
	          }
	        };
	        res.end(JSON.stringify({
	          chat: chats,
	          latest: chat_list[0].timestamp
	        }))
	      }
	    };
	    
	    if(data.type=="message_send" && data.token == setting.token) {
	      let chat_list = JSON.parse(fs.readFileSync('chat.json', 'utf-8'));
	      let chat_message = data.message;
	      chat_message.name = data.name;
	      chat_message.id = fs.readFileSync(`user/${data.uuid}.txt`, 'utf-8');
	      chat_list.unshift(chat_message);
	      if(10 < chat_list.length) {
	        chat_list.pop();
	      }
	      fs.writeFileSync("chat.json", JSON.stringify(chat_list))
	    };
	    
	    if(data.type=="login" && data.password == setting.Password) {
	      res.writeHead(200, {'Content-Type': 'application/json'});
	      res.end(JSON.stringify({
	        type: "success",
	        token: setting.token
	      }))
	    }
	    
	    if(data.type=="signup" && data.password == setting.Password) {
	      const user_uuid = crypto.randomUUID();
	      const user_id = new Date().getTime().toString(36)
	      res.writeHead(200, {'Content-Type': 'application/json'});
	      res.end(JSON.stringify({
	        type: "success",
	        token: setting.token,
	        uuid: user_uuid
	      }));
	      fs.writeFileSync(`user/${user_uuid}.txt`, user_id);
	    }
	  })
	}
}).listen(8080);
