const express = require("express");
const router = express.Router();
const petugas = require('../petugas/petugas');

router.GetAll(require('./petugas', petugas.All));
router.Post(require('./petugas', petugas.Simpan));
router.Put(require('./petugas/:id_petugas', petugas.Edit));
router.Delete(require('./petugas/:id_petugas', petugas.Delete));

module.exports = router;