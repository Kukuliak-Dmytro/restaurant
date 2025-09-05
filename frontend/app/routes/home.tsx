import { createClient, type Session, type User } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISH_KEY)

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(session)
      setSession(session)
    })
  }, [])
 
  if (session) {
    return (
      <div>
        <h1>Home</h1>
        <p>Welcome, {session.user.email}</p>
        <p>{JSON.stringify(session)}</p>
      </div>
    )
  } 
  return (
    <div>
      <h1>Home</h1>
      <p>Please login</p>
    </div>
  )
}