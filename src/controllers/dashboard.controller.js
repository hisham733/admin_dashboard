const dashboardService = require('../services/dashboard.service');
const { can } = require('../utilities');

const VALID_PER_PAGE = [5, 10, 25, 50];

async function show(req, res) {
  can(req.session.user, 'dashboard:view');

  const page    = Math.max(1, parseInt(req.query.page) || 1);
  const perPage = VALID_PER_PAGE.includes(parseInt(req.query.perPage))
    ? parseInt(req.query.perPage)
    : 5;
  const search  = req.query.search || '';

  const { orders, allKeys, chartData, stats, pagination } =
    await dashboardService.getDashboardData(page, perPage, search);

  return res.render('layouts/main', {
    contentPartial: 'dashboard/index',
    contentData: { orders, allKeys, chartData, stats, pagination, search, query: req.query },
    activeSection: 'dashboard',
    title: 'Dashboard'
  });
}

module.exports = { show };
