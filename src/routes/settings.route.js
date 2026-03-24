const express = require('express');
const settingsController = require('../controllers/settings.controller');
const { asyncHandler } = require('../utilities');
const authenticated = require('../middlewares/authenticate.middleware');
const { logoUpload } = require('../middlewares/upload-logo.middleware');

const router = express.Router();

function handleLogoUpload(req, res, next) {
  logoUpload.single('logo')(req, res, (err) => {
    if (err) {
      const msg = err.message || 'Upload failed';
      return res.redirect(`/settings?error=${encodeURIComponent(msg)}`);
    }
    next();
  });
}

router.get('/', authenticated, asyncHandler(settingsController.index));
router.post('/', authenticated, handleLogoUpload, asyncHandler(settingsController.update));

module.exports = router;
