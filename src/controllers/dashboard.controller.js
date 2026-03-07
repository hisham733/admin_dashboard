const dashboardService = require('../services/dashboard.service'); 
const {can} = require("../utilities"); 

async function show(req, res) {

    can(req.session.user, 'dashboard:view');

    const orders = await dashboardService.getAllOrders();

    return res.render('dashboard/index', { orders });
}

module.exports = {
    show
};