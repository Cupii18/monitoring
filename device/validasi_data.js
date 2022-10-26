const { check } = require("express-validator");
const database = require("../config/database");

module.exports.data = [
    check("id_device").not().isEmpty().withMessage('ID Device tidak boleh kosong').custom((value) => {
        return database("tb_device")
            .where("id_device", value)
            .then((data) => {
                if (data.length > 0) {
                    return Promise.reject("ID Device sudah ada");
                }
            });
    }),
    check('id_jenis_device').not().isEmpty().withMessage('Jenis Device tidak boleh kosong'),
    check('id_sektor').not().isEmpty().withMessage('Sektor tidak boleh kosong'),
    check('id_indikator').not().isEmpty().withMessage('Indikator tidak boleh kosong'),
    check('nama_device').not().isEmpty().withMessage('Nama Device tidak boleh kosong'),

]

module.exports.edit_data = [
    check('id_device').not().isEmpty().withMessage('ID Device tidak boleh kosong').custom((value, { req }) => {
        return database("tb_device")
            .where("id_device", value)
            .then((data) => {
                if (data.length > 0) {
                    if (data[0].id_device != req.params.id_device) {
                        return Promise.reject("ID Device sudah ada");
                    }
                }
            });
    }),
    check('id_jenis_device').not().isEmpty().withMessage('Jenis Device tidak boleh kosong'),
    check('id_sektor').not().isEmpty().withMessage('Sektor tidak boleh kosong'),
    check('id_indikator').not().isEmpty().withMessage('Indikator tidak boleh kosong'),
    check('nama_device').not().isEmpty().withMessage('Nama Device tidak boleh kosong'),
]