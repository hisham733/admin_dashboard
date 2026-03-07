const formService = require('../services/form.service'); 

const create = (req, res) => {
    res.render('form/create')
};

module.exports = {
    create
};