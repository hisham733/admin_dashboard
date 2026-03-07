const express = require('express');
const roleController = require('../controllers/role.controller');
const { asyncHandler } = require('../utilities');
const authenticated = require('../middlewares/authenticate.middleware');

const router = express.Router();

router.get('/', authenticated, asyncHandler(roleController.getRoles));
router.get('/create', authenticated, asyncHandler(roleController.createRole));
router.get('/:id/edit', authenticated, asyncHandler(roleController.editRole));
router.get('/:id', authenticated, asyncHandler(roleController.showRole));
router.post('/', authenticated, asyncHandler(roleController.storeRole));
router.patch('/:id', authenticated, asyncHandler(roleController.updateRole));
router.delete('/:id', authenticated, asyncHandler(roleController.deleteRole));

module.exports = router;
