const router = require("express").Router();
const multer = require("multer");
const ctrl   = require("../controllers/studentsController");
const { validateStudent, validateStudentPartial } = require("../middleware/validate");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get("/",         ctrl.getAll);
router.get("/:id",      ctrl.getOne);
router.post("/upload",  upload.single("photo"), ctrl.uploadPhoto);
router.post("/",        validateStudent, ctrl.create);
router.patch("/:id",    validateStudentPartial, ctrl.update);
router.delete("/:id",   ctrl.remove);

module.exports = router;
