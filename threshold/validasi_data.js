const { check } = require("express-validator");

module.exports.data = [
    check("id_indikator").not().isEmpty().withMessage('indikator tidak boleh kosong'),
    check('minimum').not().not().isEmpty().withMessage('Minimum tidak boleh kosong'),
    check('maksimum').not().not().isEmpty().withMessage('Maksimum tidak boleh kosong'),
]

module.exports.edit_data = [
    check("id_indikator").not().isEmpty().withMessage('indikator tidak boleh kosong'),
    check('minimum').not().not().isEmpty().withMessage('Minimum tidak boleh kosong'),
    check('maksimum').not().not().isEmpty().withMessage('Maksimum tidak boleh kosong'),
]