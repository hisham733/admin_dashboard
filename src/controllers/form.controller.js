const create = (req, res) => {
  res.render('layouts/main', {
    contentPartial: 'form/create',
    contentData: {},
    activeSection: 'forms',
    title: 'Forms Manager'
  });
};

module.exports = {
  create
};