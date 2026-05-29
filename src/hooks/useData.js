import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useData() {
  const [sites, setSites] = useState([])
  const [agents, setAgents] = useState([])
  const [audits, setAudits] = useState([])
  const [seuil, setSeuil] = useState(80)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [s, a, au, cfg] = await Promise.all([
        supabase.from('sites').select('*').order('name'),
        supabase.from('agents').select('*').order('name'),
        supabase.from('audits').select(`
          *,
          site:sites(id, name, type),
          agent:agents(id, name)
        `).order('date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('config').select('*'),
      ])
      if (s.error) throw s.error
      if (a.error) throw a.error
      if (au.error) throw au.error
      setSites(s.data || [])
      setAgents(a.data || [])
      setAudits(au.data || [])
      const seuilCfg = cfg.data?.find(c => c.key === 'seuil')
      if (seuilCfg) setSeuil(parseInt(seuilCfg.value))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addSite = async (name, type = 'Bureau') => {
    const { data, error } = await supabase.from('sites').insert({ name, type }).select().single()
    if (error) throw error
    setSites(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const removeSite = async (id) => {
    const { error } = await supabase.from('sites').delete().eq('id', id)
    if (error) throw error
    setSites(prev => prev.filter(s => s.id !== id))
  }

  const addAgent = async (name) => {
    const { data, error } = await supabase.from('agents').insert({ name }).select().single()
    if (error) throw error
    setAgents(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  const removeAgent = async (id) => {
    const { error } = await supabase.from('agents').delete().eq('id', id)
    if (error) throw error
    setAgents(prev => prev.filter(a => a.id !== id))
  }

  const saveAudit = async (auditData) => {
    const { data, error } = await supabase.from('audits').insert(auditData).select(`
      *, site:sites(id, name, type), agent:agents(id, name)
    `).single()
    if (error) throw error
    setAudits(prev => [data, ...prev])
    return data
  }

  const deleteAudit = async (id) => {
    const { error } = await supabase.from('audits').delete().eq('id', id)
    if (error) throw error
    setAudits(prev => prev.filter(a => a.id !== id))
  }

  const updateSeuil = async (val) => {
    const { error } = await supabase.from('config').upsert({ key: 'seuil', value: String(val) })
    if (error) throw error
    setSeuil(val)
  }

  return {
    sites, agents, audits, seuil,
    loading, error,
    addSite, removeSite,
    addAgent, removeAgent,
    saveAudit, deleteAudit,
    updateSeuil, refetch: fetchAll,
  }
}
