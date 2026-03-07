const profileService = require('../services/profile.service');

async function getProfile(req, res) {
  let userId = req.session.user?.id;
  if (!userId && req.session.user?.email) {
    const u = await profileService.getProfileByEmail(req.session.user.email);
    if (u) {
      req.session.user.id = u.id;
      userId = u.id;
    }
  }
  if (!userId) {
    return res.redirect('/');
  }

  const profile = await profileService.getProfile(userId);
  if (!profile) {
    return res.redirect('/');
  }

  res.render('layouts/main', {
    contentPartial: 'profile/index',
    contentData: { profile, error: null },
    activeSection: 'profile',
    title: 'My Profile'
  });
}

async function updateProfile(req, res) {
  let userId = req.session.user?.id;
  if (!userId && req.session.user?.email) {
    const u = await profileService.getProfileByEmail(req.session.user.email);
    if (u) {
      req.session.user.id = u.id;
      userId = u.id;
    }
  }
  if (!userId) {
    return res.redirect('/');
  }

  const { name, email, currentPassword, newPassword, confirmPassword } = req.body;
  const profile = await profileService.getProfile(userId);

  try {
    const updated = await profileService.updateProfile(userId, {
      name,
      email,
      currentPassword,
      newPassword,
      confirmPassword
    });

    req.session.user.name = updated.name;
    req.session.user.email = updated.email;

    res.redirect('/profile?success=' + encodeURIComponent('Profile updated successfully.'));
  } catch (err) {
    res.render('layouts/main', {
      contentPartial: 'profile/index',
      contentData: {
        profile: { ...profile, name: name || profile.name, email: email || profile.email },
        error: err.message
      },
      activeSection: 'profile',
      title: 'My Profile'
    });
  }
}

module.exports = { getProfile, updateProfile };
