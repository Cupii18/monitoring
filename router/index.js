const express = require("express");
const router = express.Router();

router.use("/admin" ,require("../admin/admin"));
router.use("/report", require("../report/report"));
router.use("/petugas", require("../petugas/petugas"));
router.use("/monitor", require("../monitor/monitor"));
router.use("/alert", require("../alert/alert"));
router.use("/histori", require("../histori/histori"));
router.use("/kategori", require("../kategori/kategori"));
router.use("/dashboard", require("../dashboard/dashboard"));


module.exports = router;