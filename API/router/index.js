const express = require("express");
const router = express.Router();

router.use("/petugas/" ,require("../petugas/petugas"));
router.use("/report", require("../report/report"));
router.use("/tambah_petugas", require("../tambah_petugas/tambah_petugas"));


module.exports = router;