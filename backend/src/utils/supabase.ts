import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseClient = createClient(process.env.SUPABASE_URL || '', process.env.PUBLISH_KEY || '')

export default supabaseClient