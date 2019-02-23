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
  console.log(db_uri);
var db_params = { useNewUrlParser : true };
mongoose.connect(db_uri, db_params,function(err,res){
  if(err)console.log('database error  '+err);
  console.log('connected  '+db_uri);
});

var db = mongoose.connection;
// Setup server port
var port = process.env.PORT || 3000;

// Send message for default URL
app.get('/', (req, res) => res.send('Blind support server is running'));
// Use Api routes in the App
app.use('/api', apiRoutes)
// Launch app to listen to specified port
//app.listen(port, function () {
//   console.log("Running blind_support server on port " + port);
//});
server.listen(port,function(){
  console.log("Running blind_support server on port " + port);
});
var UserController = require('./controllers/userController');

io.on('connection', function (socket){
  console.log('User connected');
  var socketId=socket.id;
  var myId;
  socket.emit('connected');
  socket.on('login', function (data) {
      UserController.getUser(data.id,function(user){
            if(user!=null)
            {
            //      console.log(JSON.stringify(user));
              myId=user.id;
              UserController.LoginSocket(user,socketId,function(MyUser){
                if(MyUser!=null)

                    socket.emit('logindone',user);
              });
            }
      });


  });
  socket.on('getunreadmessages',function(data){
      var id=data.id;
      UserController.getUser(id,function(user){
          UserController.UnreadMessages(user,function(messages){
              console.log(JSON.stringify(messages));
              socket.emit('unreadmessages',{messages:messages});
          });
      });
  });
  socket.on('sendmessage',function(data){
      //var resieverId=data.resieverId;
      console.log('messs');
      var senderId=data.senderId;
      var sound=data.content;
      var date=new Date();
      UserController.getUser(senderId,function(user){
          if(user!=null){
            console.log(JSON.stringify(user));
              UserController.CreateNewMessage(user,sound,date,function(message){
                  if(message!=null)
                  {
                    console.log(JSON.stringify(message));
                    UserController.getAllUsers(function(users){
                          if(users!=null)
                          {
                            console.log(users.length);
                            users.forEach(other =>{
                              //
                                if(other.online&&other.id!=user.id){
                                  io.to(other.socketId).emit('newmessage',message);
                                }
                            });
                            socket.emit('confirmsend',{status:'done'});
                          }
                    });
                  }
              });
          }

      });
  });
  socket.on('disconnect', () => {
        UserController.getUser(myId,function(user){
            if(user!=null)
            {
              //    console.log(JSON.stringify(user));
              UserController.DisconnectSocket(user);
            }
        });
  });
});
