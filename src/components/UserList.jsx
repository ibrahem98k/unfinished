import React, { useEffect, useState } from 'react'
import UserForm from './UserForm'

const API = 'https://68a04cea6e38a02c58184c4b.mockapi.io/users'

export default function UserList(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [editing, setEditing] = useState(null) // used for modal editing
  const [showForm, setShowForm] = useState(false)

  // Inline-edit state for table rows (spreadsheet-like)
  const [inlineId, setInlineId] = useState(null)
  const [inlineData, setInlineData] = useState({ name: '', avatar: '' })
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers(){
    setLoading(true)
    setError(null)
    try{
      const res = await fetch(API)
      if(!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data)
    }catch(err){
      setError(err.message)
    }finally{
      setLoading(false)
    }
  }

  async function handleDelete(id){
    if(!confirm('Delete this user?')) return
    try{
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if(!res.ok) throw new Error('Delete failed')
      setUsers(prev => prev.filter(u => u.id !== id))
    }catch(err){
      alert('Delete failed: ' + err.message)
    }
  }

  function handleEdit(user){
    // start inline edit on click
    setInlineId(user.id)
    setInlineData({ name: user.name || '', avatar: user.avatar || '' })
    // also keep editing for modal if ever needed
    setEditing(user)
  }

  function handleAdd(){
    setEditing(null)
    setShowForm(true)
  }

  async function upsertUser(payload){
    // payload may contain id to update, otherwise create
    try{
      const method = payload.id ? 'PUT' : 'POST'
      const path = payload.id ? `${API}/${payload.id}` : API
      const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if(!res.ok) throw new Error('Save failed')
      const saved = await res.json()
      if(method === 'POST') setUsers(prev => [saved, ...prev])
      else setUsers(prev => prev.map(u => u.id === saved.id ? saved : u))
      setShowForm(false)
    }catch(err){
      alert('Save failed: ' + err.message)
    }
  }

  // Save inline - wrapper that calls upsertUser and clears inline state
  async function saveInline(){
    if(!inlineId) return
    const payload = { id: inlineId, ...inlineData }
    await upsertUser(payload)
    setInlineId(null)
    setInlineData({ name: '', avatar: '' })
  }

  function cancelInline(){
    setInlineId(null)
    setInlineData({ name: '', avatar: '' })
  }

  function copyIdToClipboard(id){
    if(!id) return
    try{
      navigator.clipboard?.writeText(String(id))
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    }catch(e){
      // fallback for older environments
      try{window.prompt('Copy id (ctrl/cmd+C then Enter):', String(id))}catch(_){/* ignore */}
    }
  }

  return (
    <div className="user-list">
      <div className="controls">
        <button className="btn primary" onClick={handleAdd}>+ Add user</button>
        <button className="btn" onClick={fetchUsers}>Refresh</button>
      </div>

      {loading && <div className="info">Loading users…</div>}
      {error && <div className="error">{error}</div>}

      {!loading && users.length === 0 && <div className="info">No users found — try adding one.</div>}

      <div className="table-wrap">
        <table className="users-table" role="grid">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-avatar">Avatar</th>
              <th className="col-name">Name</th>
              <th className="col-created">Created At</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="row" tabIndex={0}>
                <td className="col-id">
                  <div className="id-badge-wrap">
                    <span className="id-badge">{user.id}</span>
                    <button title="Copy ID" className="id-copy-btn" onClick={() => copyIdToClipboard(user.id)}>{copiedId === user.id ? 'Copied' : '📋'}</button>
                  </div>
                </td>
                <td className="col-avatar">
                  {inlineId === user.id ? (
                    <input value={inlineData.avatar} onChange={e => setInlineData(prev => ({ ...prev, avatar: e.target.value }))} placeholder="avatar url" />
                  ) : (
                    <img className="avatar" src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                  )}
                </td>
                <td className="col-name">
                  {inlineId === user.id ? (
                    <input value={inlineData.name} onChange={e => setInlineData(prev => ({ ...prev, name: e.target.value }))} />
                  ) : (
                    (user.name || '—')
                  )}
                </td>
                <td className="col-created">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</td>
                <td className="col-actions">
                  <div className="actions">
                    {inlineId === user.id ? (
                      <>
                        <button className="btn" onClick={cancelInline}>Cancel</button>
                        <button className="btn primary" onClick={saveInline}>Save</button>
                      </>
                    ) : (
                      <>
                        <button className="btn" onClick={() => handleEdit(user)}>Edit</button>
                        <button className="btn danger" onClick={() => handleDelete(user.id)}>Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-inner">
            <button className="close" onClick={() => setShowForm(false)}>×</button>
            <UserForm user={editing} onCancel={() => setShowForm(false)} onSave={upsertUser} />
          </div>
        </div>
      )}
    </div>
  )
}
