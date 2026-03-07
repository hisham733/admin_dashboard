const prisma = require('../configs/prisma'); 

async function getAllOrders (req, res) {
      return await prisma.order.findMany({  
            'orderBy': {  
                  'created_at': 'desc'
            }
      }); 
}

module.exports = {  
      getAllOrders
}