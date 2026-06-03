import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function useProfile(session) {
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', session.user.id)
      .single()
    if (data?.display_name) setDisplayName(data.display_name)
    setLoading(false)
  }

  const updateDisplayName = async (name) => {
    await supabase
      .from('profiles')
      .update({ display_name: name })
      .eq('id', session.user.id)
    setDisplayName(name)
  }

  return { displayName, setDisplayName, updateDisplayName, loading }
}