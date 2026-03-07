const dashboardService = require('../services/dashboard.service'); 
const {can} = require("../utilities"); 

async function show(req, res) {

    can(req.session.user, 'dashboard:view');

    const orders = await dashboardService.getAllOrders();

    return res.render('layouts/main', {
      contentPartial: 'dashboard/index',
      contentData: { orders },
      activeSection: 'dashboard',
      title: 'Dashboard'
    });
}

module.exports = {
    show
};