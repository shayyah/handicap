// api-routes.js
// Initialize express router
let router = require('express').Router();
// Set default API response
router.get('/', function (req, res) {
    res.json({
        status: 'API is Working',
        message: 'Welcome to the library sub-system of the blind support application',
    });
});

// Import order controller
var orderController = require('./controllers/orderController');
// order routes
router.route('/orders')
    .get(orderController.index)
    .post(orderController.new)
    .delete(orderController.erase);
router.route('/orders/:order_id')
    .get(orderController.view)
    .patch(orderController.update)
    .put(orderController.update)
    .delete(orderController.delete);

// Import book controller
var bookController = require('./controllers/bookController');
// book routes
router.route('/books')
    .get(bookController.index)
    .post(bookController.new);
router.route('/books/content/:book_id')
    .get(bookController.lastPageRead);
router.route('/books/:book_id')
    .get(bookController.view)
    .patch(bookController.update)
    .put(bookController.update)
    .delete(bookController.delete);
router.route('/blind/books/:blind_id')
    .get(bookController.myBooks);

// Import page controller
var pageController = require('./controllers/pageController');
// page routes
router.route('/pages')
      .get(pageController.index)
      .post(pageController.new);
router.route('/book/pages/:book_id')
      .get(pageController.bookPages);
router.route('/pages/:page_id')
      .get(pageController.view)
      .patch(pageController.update)
      .put(pageController.update)
      .delete(pageController.delete);

  // Import user controller
var userController=require('./controllers/userController');
router.route('/user/login')
  .get(userController.login);
router.route('/user/register')
  .post(userController.register);

var locationController=require('./controllers/locationController');
router.route('/location')
  .get(locationController.getlocations)
  .post(locationController.addlocation)
  .put(locationController.changestate);
router.route('/admin/location')
  .get(locationController.getpubliclocations)
  .put(locationController.deletelocation)
  .post(locationController.addpubliclocation);
router.route('/mylocations')
  .get(locationController.getmylocations);


// Export API routes
module.exports = router;
