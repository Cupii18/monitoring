const express = require("express");
const router = express.Router();


router.use("/petugas", require("../petugas/petugas"));
router.use("/jabatan", require("../jabatan/jabatan"));
router.use("/role", require("../role/index"));
router.use("/jenis_device", require("../jenis_device/jenis_device"));
router.use("/sektor", require("../sektor/sektor"));
router.use("/indikator", require("../indikator/indikator"));
router.use("/device", require("../device/device"));
router.use("/monitor_dc", require("../monitor_dc/monitor_dc"));
router.use("/alert", require("../alert/alert"));
router.use("/report", require("../report/report"));
router.use("/threshold", require("../threshold/threshold"));
router.use("/button", require("../resetButton/index"));




module.exports = router;