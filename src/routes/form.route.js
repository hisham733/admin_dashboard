const express = require('express');
const formController = require('../controllers/form.controller');
const authenticated = require('../middlewares/authenticate.middleware');
const { asyncHandler } = require('../utilities');

const router = express.Router();

router.get('/', authenticated, asyncHandler(formController.getForms));
router.get('/create', authenticated, asyncHandler(formController.createForm));
router.post('/', authenticated, asyncHandler(formController.storeForm));
router.get('/:id', authenticated, asyncHandler(formController.getForm));
router.get('/:id/edit', authenticated, asyncHandler(formController.editForm));
router.patch('/:id', authenticated, asyncHandler(formController.updateForm));
router.post('/:id/activate', authenticated, asyncHandler(formController.activateForm));
router.post('/:id/deactivate', authenticated, asyncHandler(formController.deactivateForm));
router.delete('/:id', authenticated, asyncHandler(formController.deleteForm));

module.exports = router;  
