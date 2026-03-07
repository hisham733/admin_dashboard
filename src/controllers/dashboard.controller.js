const dashbaordService = require('../services/dashboard.service'); 
const {can} = require("../utilitie"); 

async function show(req, res) {

  try {

    can(req.session.user, 'dashboard:view');

    const orders = await dashbaordService.getAllOrders();

    return res.render('dashboard/index', { orders });

  } catch (error) {

    return res.redirect('/unauthorized');
  }
}

module.exports = {
    show
};