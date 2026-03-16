const { Prisma } = require('@prisma/client');
const prisma = require('../configs/prisma');

const SUPER_ADMIN_EMAIL = 'superadmin@system.local';

/* ── strip time component so comparisons are calendar-day accurate
   regardless of how MySQL/Prisma handles timezone offsets ── */
function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* ── chart aggregation (runs on all order dates, server-side) ── */
function buildChartData(dates) {
  const now    = new Date();
  const today  = startOfDay(now);
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const weekLabels  = [], weekData  = [];
  const monthLabels = [], monthData = [];
  const yearLabels  = [], yearData  = [];

  for (let i = 6;  i >= 0;  i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    weekLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    weekData.push(0);
  }
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    monthLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    monthData.push(0);
  }
  for (let i = 11; i >= 0; i--) {
    yearLabels.push(MONTHS[((now.getMonth() - i) % 12 + 12) % 12]);
    yearData.push(0);
  }

  for (const { created_at } of dates) {
    if (!created_at) continue;
    const d       = new Date(created_at);
    const orderDay = startOfDay(d);
    /* dayDiff is now always a whole non-negative integer for past/present orders */
    const dayDiff = Math.round((today - orderDay) / 86400000);

    if (dayDiff >= 0 && dayDiff <  7) weekData[6  - dayDiff]++;
    if (dayDiff >= 0 && dayDiff < 30) monthData[29 - dayDiff]++;

    const mDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (mDiff >= 0 && mDiff < 12) yearData[11 - mDiff]++;
  }

  return {
    week:  { labels: weekLabels,  data: weekData  },
    month: { labels: monthLabels, data: monthData },
    year:  { labels: yearLabels,  data: yearData  }
  };
}

/* ── raw-query results have JSON as string — parse if needed ── */
function normalizeOrders(orders) {
  return orders.map(o => {
    if (o.fields && typeof o.fields === 'string') {
      try { o.fields = JSON.parse(o.fields); } catch (_) { o.fields = null; }
    }
    return o;
  });
}

/* ── main service function ── */
async function getDashboardData(page, perPage, search) {
  const now      = new Date();
  const weekAgo  = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const skip     = (page - 1) * perPage;
  const q        = search ? search.trim() : '';

  /* paginated table queries */
  let ordersP, filteredCountP;

  if (q) {
    const pattern = `%${q}%`;
    const limitVal  = Prisma.raw(String(perPage));
    const offsetVal = Prisma.raw(String(skip));

    ordersP = prisma.$queryRaw`
      SELECT id, fields, pdf_url, created_at
      FROM   orders
      WHERE  CAST(fields AS CHAR) LIKE ${pattern}
          OR COALESCE(pdf_url, '') LIKE ${pattern}
      ORDER  BY created_at DESC
      LIMIT  ${limitVal} OFFSET ${offsetVal}
    `;
    filteredCountP = prisma.$queryRaw`
      SELECT COUNT(*) AS total
      FROM   orders
      WHERE  CAST(fields AS CHAR) LIKE ${pattern}
          OR COALESCE(pdf_url, '') LIKE ${pattern}
    `;
  } else {
    ordersP        = prisma.order.findMany({ orderBy: { created_at: 'desc' }, take: perPage, skip });
    filteredCountP = Promise.resolve(null);
  }

  /* run all queries in parallel */
  const [
    orders,
    filteredCountResult,
    totalOrders,
    ordersThisWeek,
    ordersThisMonth,
    totalUsers,
    chartDates             /* only created_at — for chart aggregation */
  ] = await Promise.all([
    ordersP,
    filteredCountP,
    prisma.order.count(),
    prisma.order.count({ where: { created_at: { gte: weekAgo  } } }),
    prisma.order.count({ where: { created_at: { gte: monthAgo } } }),
    prisma.user.count({ where: { NOT: { email: SUPER_ADMIN_EMAIL } } }),
    prisma.order.findMany({ select: { created_at: true } })
  ]);

  /* filtered total for pagination */
  const filteredTotal = q
    ? Number(filteredCountResult[0]?.total ?? 0)
    : totalOrders;

  const normalizedOrders = normalizeOrders(orders);

  /* discover column keys from the current page's orders only —
     they change naturally as search / page changes */
  const allKeys = [];
  const keySet  = new Set();
  for (const order of normalizedOrders) {
    if (!order.fields || typeof order.fields !== 'object') continue;
    for (const k of Object.keys(order.fields)) {
      if (k !== 'order_id' && !keySet.has(k)) { keySet.add(k); allKeys.push(k); }
    }
  }

  return {
    orders:    normalizedOrders,
    allKeys,
    chartData: buildChartData(chartDates),
    stats:     { totalOrders, ordersThisWeek, ordersThisMonth, totalUsers },
    pagination: { page, perPage, total: filteredTotal }
  };
}

module.exports = { getDashboardData };
