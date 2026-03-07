const express = require('express');  
const userController = require('../controllers/user.controller'); 
const {asyncHandler}  = require('../utilities');
const authenticated = require('../middlewares/authenticate.middleware');

const router = express.Router(); 

router.get('/', authenticated, asyncHandler(userController.getUsers));
router.get('/create', authenticated, asyncHandler(userController.createUser));
router.get('/:id/edit', authenticated, asyncHandler(userController.editUser));
router.get('/:id', authenticated, asyncHandler(userController.getUser));
router.post('/', authenticated, asyncHandler(userController.storeUser));
router.patch('/:id', authenticated, asyncHandler(userController.updateUser));
router.delete('/:id', authenticated, asyncHandler(userController.deleteUser));

module.exports = router;