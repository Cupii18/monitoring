const {check} = require("express-validator");

module.exports.data = [
    check('device').not().isEmpty().withMessage('device harus ada data'),
    check('indikator').not().isEmpty().withMessage('indikator harus ada data'),
    check('periode').not().isEmpty().withMessage('periode harus ada data'),
    check('interval').not().isEmpty().withMessage('interval harus ada data'),
    check('waktu').not().isEmpty().withMessage('waktu harus ada data'),
    check('status').not().not().isEmpty().withMessage('status harus ada data')
    
]

module.exports.edit_data = [
    check('device').not().isEmpty().withMessage('device harus ada data'),
    check('indikator').not().isEmpty().withMessage('indikator harus ada data'),
    check('periode').not().isEmpty().withMessage('periode harus ada data'),
    check('interval').not().isEmpty().withMessage('interval harus ada data'),
    check('waktu').not().isEmpty().withMessage('waktu harus ada data'),
    check('status').not().not().isEmpty().withMessage('status harus ada data')
]