var Index = require('../controller');
var Room = require('../controller/room');
var orderController = require('../controllers/orderController');
var bookController = require('../controllers/bookController');
var pageController = require('../controllers/pageController');
var userController=require('../controllers/userController');
var videoController=require('../controllers/videoConversationController');
var locationController=require('../controllers/locationController');
exports.endpoints = [
  { method: 'GET', path: '/api/orders', config: orderController.index },
  { method: 'POST', path: '/api/orders', config: orderController.new },
  { method: 'DELETE', path: '/api/orders', config: orderController.erase },
  { method: 'GET', path: '/api/orders/{order_id}', config: orderController.view },
  { method: 'PATCH', path: '/api/orders/{order_id}', config: orderController.update },
  { method: 'PUT', path: '/api/orders/{order_id}', config: orderController.update },
  { method: 'DELETE', path: '/api/orders/{order_id}', config: orderController.delete },
  { method: 'GET', path: '/api/books', config: bookController.index },
  { method: 'POST', path: '/api/books', config: bookController.new },
  { method: 'GET', path: '/api/books/content/{book_id}', config: bookController.lastPageRead },
  { method: 'GET', path: '/api/books/{book_id}', config: bookController.view },
  { method: 'PATCH', path: '/api/books/{book_id}', config: bookController.update },
  { method: 'PUT', path: '/api/books/{book_id}', config: bookController.update },
  { method: 'DELETE', path: '/api/books/{book_id}', config: bookController.delete },
  { method: 'GET', path: '/api/blind/books/{blind_id}', config: bookController.myBooks },
  { method: 'GET', path: '/api/pages', config: pageController.index },
  { method: 'POST', path: '/api/pages', config: pageController.new },
  { method: 'GET', path: '/api/book/pages/{book_id}', config: pageController.bookPages },
  { method: 'GET', path: '/api/pages/{page_id}', config: pageController.view },
  { method: 'PATCH', path: '/api/pages/{page_id}', config: pageController.update },
  { method: 'PUT', path: '/api/pages/{page_id}', config: pageController.update },
  { method: 'DELETE', path: '/api/pages/{page_id}', config: pageController.delete },
  { method: 'GET', path: '/api/user/login', config: userController.login },
  { method: 'POST', path: '/api/user/register', config: userController.register },
  { method: 'POST', path: '/api/user/token', config: userController.settoken },
  { method: 'GET', path: '/api/location', config: locationController.getlocations },
  { method: 'POST', path: '/api/location', config: locationController.addlocation },
  { method: 'PUT', path: '/api/location', config: locationController.changestate },
  { method: 'GET', path: '/api/admin/location', config: locationController.getpubliclocations },
  { method: 'PUT', path: '/api/admin/location', config: locationController.deletelocation },
  { method: 'POST', path: '/api/admin/location', config: locationController.addpubliclocation },
  { method: 'GET', path: '/api/mylocations', config: locationController.getmylocations },
  { method: 'POST', path: '/api/call', config: videoController.addnewroom },
  { method: 'PUT', path: '/api/call', config: videoController.answercall },
  { method: 'GET', path: '/api/call', config: videoController.getAllUnansweredCall },
  /*{ method: 'GET', path: '/', config: Index.main },*/
  { method: 'GET', path: '/admin/locations', config: Index.locations },
  { method: 'GET', path: '/admin/addLocation', config: Index.addlocations },
  { method: 'POST', path: '/join/{roomId}', config: Room.join },
  { method: 'POST', path: '/message/{roomId}/{clientId}', config: Room.message },
  { method: 'GET', path: '/r/{roomId}', config: Room.main },
  { method: 'POST', path: '/leave/{roomId}/{clientId}', config: Room.leave },
  { method: 'POST', path: '/turn', config: Index.turn },
  { method: 'GET', path: '/{param*}', handler: {
      directory: {
        path: 'public',
        listing: false
      }
    }
  }
];
