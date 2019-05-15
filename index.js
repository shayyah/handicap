// Import express
let express = require('express');
// Import Body parser
let bodyParser = require('body-parser');
// Import Mongoose
let mongoose = require('mongoose');
// Initialize the app
let app = express();
// Import routes
let apiRoutes = require("./api_routes");
var path = require('path');
var server = require('http').Server(app);
var serveStatic = require('serve-static');  // serve static files
var io = require('socket.io')(server);
var cors = require('cors');
 var fs=require('fs');
 var admin = require("firebase-admin");



// Configure bodyparser to handle post requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(serveStatic('locations', {'locations': ['locations.html']}));
//app.use(express.static(path.join(__dirname, './Content')));
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
app.use(cors());

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://handicap-cfcb0.firebaseio.com"
});
// Send message for default URL
app.get('/', function(req, res) {
  res.send('Server Working on port '+port);

});
app.get('/locations', function(req, res) {
  fs.readFile('locations/locations.html',function (err, data){
       res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
       res.write(data);
       res.end();
   });
});
// Use Api routes in the App
app.use('/api', apiRoutes);
/*app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

 // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

 // Set to true if you need the website to include cookies in the requests sent
 // to the API (e.g. in case you use sessions)
 res.setHeader('Access-Control-Allow-Credentials', true);

 // Pass to next layer of middleware
 next();
});*/
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
      console.log('getunreadmessages');
      UserController.getUser(id,function(user){
          ConversationController.getAllConversations(id,function(conversations){
              console.log('conversations   '+JSON.stringify(conversations));
                console.log('conversations   '+JSON.stringify(conversations));

            conversations.forEach(conversation=>{
              UserController.UnreadMessages(user,conversation.id,function(messages){
                  console.log('messages   '+JSON.stringify(messages));
                  messages.forEach(message=>{
                      socket.emit('newmessage',message);
                  });

              });
            });
            UserController.UnreadMessages(user,'0',function(messages){
                console.log('messages   '+JSON.stringify(messages));
                messages.forEach(message=>{
                  if(message.senderId!=user.id)
                    socket.emit('newmessage',message);
                });

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
    var phone=data.other_phone;
    UserController.GetUserByPhone(phone,function(other){
    var other_id=other.id;
    ConversationController.createConversation(creator_id,other_id,function(conversation){
        if(conversation!=null)
        {
            socket.emit('conversationCreated',conversation);
        }
    });
  });
  });

  socket.on('sendmessage',function(data){
      //var resieverId=data.resieverId;
      console.log('messs');
      var senderId=data.senderId;
      var conversation_id=data.conversation_id;
      var sound=data.content;
      var text=data.text;
      var local_id=data.local_id;
      console.log('senderId: '+senderId);
      console.log('conversation_id: '+conversation_id);
      console.log('sound: '+sound);
      console.log('text: '+text);
      console.log('local_id  '+local_id  );
      //dasdsa
      var date=new Date();
      UserController.getUser(senderId,function(user){
          if(user!=null){

              UserController.CreateNewMessage(user,conversation_id,text,sound,date,function(message){
                  socket.emit('confirmsend',{status:'done',local_id:local_id});
                  if(message!=null)
                  {

                  //  io.emit('newmessage',message);


                    console.log(JSON.stringify(message));
                    if(conversation_id=='0')
                    {
                      UserController.getAllUsers(function(users){
                          if(users!=null)
                          {
              //              console.log(users.length);
                            users.forEach(other =>{
                              //

                    //            console.log('other  '+other.id+ '   '+ other.online+'   '+other.socketId);
                              //  console.log(user.id);
                                if(other.online&&other.id!=user.id){

                                  io.to(other.socketId).emit('newmessage',message);
                                }
                                else if(!other.online&&other.id!=user.id)
                                {
                                //  console.log(other.id+'   '+other.firebaseId);
                                  if(other.unreadMessages!=null)
                                  {
                                  UserController.addunreadMessage(other,function(newother){
                                  if(other.firebaseId!=null&&other.firebaseId!='')
                                      sendnotification(conversation_id,user,other,newother.unreadMessages);

                                    });
                                  }
                                }

                            });

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
                                  {
                                    if(other.online)
                                        io.to(other.socketId).emit('newmessage',message);
                                    else {
                                      if(other.unreadMessages!=null)
                                      {
                                        UserController.addunreadMessage(other,function(newother){
                                      if(other.firebaseId!=null&&other.firebaseId!='')
                                        sendnotification(conversation_id,user,other,newother.UnreadMessages);

                                      });
                                      }
                                    }
                              //      socket.emit('confirmsend',{status:'done',local_id:local_id});
                                   }
                               });
                           }
                           else {
                             UserController.getUser(conversation.creator_id,function(other){
                                 if(other!=null)
                                  {
                                    if(other.online)
                                        io.to(other.socketId).emit('newmessage',message);
                                    else{
                                      if(other.unreadMessages!=null)
                                      {
                                        UserController.addunreadMessage(other,function(newother){
                                      if(other.firebaseId!=null&&other.firebaseId!='')
                                         sendnotification(conversation_id,user,other,newother.UnreadMessages);
                                       });

                                       }
                                     }
                              //     socket.emit('confirmsend',{status:'done',local_id:local_id});
                                 }
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
  function sendnotification(conversation_Id,sender,destanation,totmessages)
  {
    console.log('send notification');
    var mes= " وصلتك "+totmessages+ " رسالة جديدة ";
    var notification = {

      data: {
        senderId:sender.id,
        conversationId:conversation_Id,
        senderName:sender.name,
        title: mes,
        message: ""
      }
    };
    var options = {
      priority: "high"
    };
    var token=destanation.firebaseId;
    console.log('token   '+token);
    admin.messaging().sendToDevice(token, notification, options)
      .then(function(response) {
        console.log("Successfully sent message:", response);
      })
      .catch(function(error) {
        console.log("Error sending message:", error);
      });
  }
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
