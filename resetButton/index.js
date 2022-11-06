const express = require("express");
const router = express.Router();
const button = require("./button.json");

router.get("/", (req, res) => {
  res.json(button);
});

router.post("/", (req, res) => {
  const value = req.body.nilai;
  setTimeout(() => {
    button.nilai = 0;
  }, 2000);

  button.nilai = value;
  res.json(button);
});

module.exports = router;
