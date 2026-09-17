const { createClient } = require('@supabase/supabase-js')
const Url = process.env.SUPABASE_URL
const Key = process.env.SUPABASE_SECRET
const Bucket = process.env.SUPABASE_BUCKET

if (!Url||!Key||!Bucket){//valida se as tre existe, se nao da error com throw new 
    throw new Error('Error supabase config, secrets not defined!')
}
const supabase= createClient(Url, Key) //Url, pra onde ele acessa, secreta é a key de acesso para a url
module.exports = {supabase, Bucket}