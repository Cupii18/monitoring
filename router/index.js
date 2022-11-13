const express = require("express");
const router = express.Router();
const verifikasi_token = require("../middleware/verifikasi_token");


router.use("/petugas", require("../petugas/petugas"));
router.use("/jabatan", verifikasi_token, require("../jabatan/jabatan"));
router.use("/role", verifikasi_token, require("../role/index"));
router.use("/jenis_device", verifikasi_token, require("../jenis_device/jenis_device"));
router.use("/sektor", verifikasi_token, require("../sektor/sektor"));
router.use("/indikator", verifikasi_token, require("../indikator/indikator"));
router.use("/device", verifikasi_token, require("../device/device"));
// router.use("/monitor_dc", require("../monitor_dc/monitor_dc"));
router.use("/alert", verifikasi_token, require("../alert/alert"));
router.use("/report", verifikasi_token, require("../report/report"));
router.use("/threshold", verifikasi_token, require("../threshold/threshold"));
router.use("/button", verifikasi_token, require("../resetButton/index"));




module.exports = router;