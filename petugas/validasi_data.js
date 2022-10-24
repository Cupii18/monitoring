const { check } = require("express-validator");
const database = require("../config/database");

module.exports.register = [
    check('id_jabatan').not().isEmpty().withMessage('Jabatan tidak boleh kosong'),
    check('id_role').not().isEmpty().withMessage('Role tidak boleh kosong'),
    check('id_card').not().isEmpty().withMessage('ID Card tidak boleh kosong'),
    check('nama_lengkap').not().isEmpty().withMessage('Nama Lengkap tidak boleh kosong'),
    check('email').not().isEmpty().withMessage('Email tidak boleh kosong').isEmail().withMessage('Email tidak valid')
        .custom((value, { req }) => {
            return database.select('*').from('tb_petugas').where('email', value).then((data) => {
                if (data.length > 0) {
                    return Promise.reject('Email sudah ada');
                }
            })
        }),
    check('no_tlp').not().isEmpty().withMessage('No Tlp tidak boleh kosong').isMobilePhone().withMessage('No Tlp tidak valid')
        .custom((value, { req }) => {
            return database.select('*').from('tb_petugas').where('no_tlp', value).then((data) => {
                if (data.length > 0) {
                    return Promise.reject('No Tlp sudah ada');
                }
            })
        }),
    check('username').not().isEmpty().withMessage('Username tidak boleh kosong').isLength({ min: 5 }).withMessage('Username minimal 5 karakter')
        .custom((value, { req }) => {
            return database.select('*').from('tb_petugas').where('username', value).then((data) => {
                if (data.length > 0) {
                    return Promise.reject('Username tidak tersedia');
                }
            })
        }),
    check('password').not().isEmpty().withMessage('Password tidak boleh kosong').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
]