const router = require("express").Router();
const ctrl   = require("../controllers/selectionsController");
const { validateSelection } = require("../middleware/validate");

router.get("/",                       ctrl.getAll);
router.get("/student/:studentId",     ctrl.getByStudent);
router.post("/",                      validateSelection, ctrl.submit);
router.patch("/:id/review",           ctrl.review);
router.patch("/:id",                  ctrl.updateChoices);
router.delete("/student/:studentId", ctrl.removeByStudent);

module.exports = router;
