const {check} = require("express-validator");

module.exports.register = [
    check('id_jabatan').not().isEmpty().withMessage('id_jabatan harus ada data'),
    check('nama_lengkap').not().isEmpty().withMessage('nama_lengkap harus ada data'),
    check('email').not().isEmpty().withMessage('email harus ada data'),
    check('no_tlp').not().isEmpty().withMessage('no_tlp harus ada data'),
    check('username').not().isEmpty().withMessage('username harus ada data'),
    check('password').not().isEmpty().withMessage('password harus ada data')
]

module.exports.login = [
    check('username').not().isEmpty().withMessage('username harus ada data'),
    check('password').not().isEmpty().withMessage('password harus ada data')
]