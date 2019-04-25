// Import express
let express = require('express');
// Import Body parser
let bodyParser = require('body-parser');
// Import Mongoose
let mongoose = require('mongoose');
// Initialize the app
let app = express();
// Import routes
let apiRoutes = require("./api_routes")
var server = require('http').Server(app);
var io = require('socket.io')(server);
// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Connect to Mongoose and set connection variable
var db_uri = process.env.MONGODB_URI || process.env.MONGOHQ_URL ||'mongodb://127.0.0.1:27017/blind_support_data';
//  console.log(db_uri);
var db_params = { useNewUrlParser : true };
mongoose.connect(db_uri, db_params,function(err,res){
  if(err)console.log('database error  '+err);
  console.log('dbconnected  '+db_uri);
});

var db = mongoose.connection;
// Setup server port
var port = process.env.PORT || 3000;
console.log(port);

// Send message for default URL
app.get('/', (req, res) => res.send('Blind support server is running'));
// Use Api routes in the App
app.use('/api', apiRoutes);
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://almacfufin.herokuapp.com/');

}
// Launch app to listen to specified port
//app.listen(port, function () {
//   console.log("Running blind_support server on port " + port);
//});
server.listen(port,function(){
  console.log("Running blind_support server on port " + port);
});
var UserController = require('./controllers/userController');
var ConversationController =require('./controllers/conversationController');



io.on('connection', function (socket){
  console.log('User connected');
  var socketId=socket.id;
  var myId;
  socket.emit('connected');
  socket.on('login', function (data) {
      console.log('logiiiiin user');
      UserController.getUser(data.id,function(user){
            if(user!=null)
            {

              myId=user.id;
              UserController.LoginSocket(user,socketId,function(MyUser){
                if(MyUser!=null)
                        console.log('logiiii  '+JSON.stringify(user));
                    socket.emit('logindone',user);
              });
            }
      });


  });
  socket.on('getunreadmessages',function(data){
      var id=data.id;
      UserController.getUser(id,function(user){
          ConversationController.getAllConversations(id,function(conversations){
            var conversationsIds=[];
            conversations.forEach(conversation=>{
              conversationsIds.push(conversation.id);
            });
          UserController.UnreadMessages(user,conversationsIds,function(messages){
              messages.forEach(message=>{
                  socket.emit('newmessage',message);
              })

          });
        });
      });
  });
  socket.on('getallconversations',function(data){
      var id=data.id;
        ConversationController.getAllConversations(id,function(conversations){
            if(conversations!=null)
            {
              socket.emit('allconversations',{'conversations':conversations});
            }
        });
  });
  socket.on('createConversation',function(data){
    var creator_id=data.creator_id;
    var other_id=data.other_id;
    ConversationController.createConversation(creator_id,other_id,function(conversation){
        if(conversation!=null)
        {
            socket.emit('conversationCreated',conversation);
        }
    });
  });

  socket.on('sendmessage',function(data){
      //var resieverId=data.resieverId;
      console.log('messs');
      var senderId=data.senderId;
      var conversation_id=data.conversation_id;
      var sound=data.content;
      var text=data.text;

      console.log('senderId: '+senderId);
      console.log('conversation_id: '+conversation_id);
      console.log('sound: '+sound);
      console.log('text: '+text);


      var date=new Date();
      UserController.getUser(senderId,function(user){
          if(user!=null){

              UserController.CreateNewMessage(user,conversation_id,text,sound,date,function(message){

                  if(message!=null)
                  {

                  //  io.emit('newmessage',message);


                    console.log(JSON.stringify(message));
                    if(conversation_id=='0')
                    {
                      UserController.getAllUsers(function(users){
                          if(users!=null)
                          {
                            console.log(users.length);
                            users.forEach(other =>{
                              //

                                console.log('other  '+other.id+ '   '+ other.online+'   '+other.socketId);
                              //  console.log(user.id);
                                if(other.online&&other.id!=user.id){

                                  io.to(other.socketId).emit('newmessage',message);
                                }
                            });
                            socket.emit('confirmsend',{status:'done'});
                          }
                        });
                    }
                     else {
                       Conversation.getConversation(conversation_id,function(conversation){
                        if(conversation!=null){
                           if(conversation.creator_id==senderId)
                           {
                               UserController.getUser(conversation.other_id,function(other){
                                 if(other!=null)
                                   io.to(other.socketId).emit('newmessage',message);
                               });
                           }
                           else {
                             UserController.getUser(conversation.creator_id,function(other){
                                 if(other!=null)
                                   io.to(other.socketId).emit('newmessage',message);
                             });
                           }
                         }
                       });
                     }
                  }
              });
          }

      });
  });
  socket.on('disconnect', () => {
    console.log('disscooonect  '+myId);
        UserController.getUser(myId,function(user){
            if(user!=null)
            {
              //    console.log(JSON.stringify(user));
              UserController.DisconnectSocket(user);
            }
        });
  });
});
