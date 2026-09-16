const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const fs = require('fs')
const path = require('path')
const { fotos_cardapio } = require('./src/Utilis/listFotosCardapio.js')

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
// localPath: caminho absoluto no disco (vem da array)
// destino no bucket: prefixo fotos_cardapio/ + só o nome do arquivo (sem /home/... e mantendo espaços)
async function uploadFile(localPath) {
  if (!fs.existsSync(localPath)) {
    console.error('Arquivo local não encontrado:', localPath)
    return
  }
  const fileBuffer = fs.readFileSync(localPath)
  const dest = 'fotos_cardapio/' + path.basename(localPath)

  const { data, error } = await supabase.storage.from(supabaseBUCKET).upload(dest, fileBuffer, {
    contentType: 'image/svg+xml',
    upsert: true,
  })
  if (error) {
    // Handle error
    console.error(`Erro ao fazer upload de ${localPath}:`, error.message || error)
  } else {
    // Handle success
    console.log(`imagem: ${localPath} -> ${data.path}, criada com sucesso!`)
  }
}

async function main() {
  for (const item of fotos_cardapio) {
    await uploadFile(item)
  }
}

main()
