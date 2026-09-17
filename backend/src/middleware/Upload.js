const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(), // buffer direto p/ Supabase, sem salvar em disco
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  defParamCharset: 'utf8',
  defCharset: 'utf8',
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg','image/png','image/webp','image/svg+xml'];
    if (ok.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Apenas imagens JPEG/PNG/WEBP/SVG'));
  }
});
module.exports = upload; //exporta middleware de updload 