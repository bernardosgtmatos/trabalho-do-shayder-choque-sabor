const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')

dotenv.config()

const supabaseAPI = process.env.SUPABASE_SECRET
const supabaseURL = process.env.SUPABASE_URL
const supabaseBUCKET = process.env.SUPABASE_BUCKET

if (!supabaseURL || !supabaseAPI || !supabaseBUCKET) {
  console.error('Faltando SUPABASE_URL / SUPABASE_SECRET / SUPABASE_BUCKET no .env')
  process.exit(1)
}

const supabase = createClient(supabaseURL, supabaseAPI)
// Upload file using standard upload
async function uploadFile() {
  const localPath = path.join(__dirname, '../frontend/public/favicon.svg')
  if (!fs.existsSync(localPath)) {
    console.error('Arquivo local não encontrado:', localPath)
    process.exit(1)
  }
  const fileBuffer = fs.readFileSync(localPath)

  const { data, error } = await supabase.storage
    .from(supabaseBUCKET)
    .upload('teste/favicon.svg', fileBuffer, {
      contentType: 'image/svg+xml',
      upsert: true,
    })

  if (error) {
    console.log('Erro ao fazer upload', error)
    process.exit(1)
    // Handle error
  } else {
    console.log('Foto enviada com sucesso:', data.path)
    // Handle success
  }
}

uploadFile()
