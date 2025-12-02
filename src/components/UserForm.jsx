import React, { useEffect, useState } from 'react'

export default function UserForm({ user = null, onSave, onCancel }){
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [saving, setSaving] = useState(false)

  // Keep local form state in sync when `user` prop changes (add vs edit)
  useEffect(() => {
    setName(user?.name || '')
    setEmail(user?.email || '')
    setAvatar(user?.avatar || '')
  }, [user])

  async function handleSubmit(e){
    e.preventDefault()
    setSaving(true)
    try{
      const payload = { name, email, avatar }
      if(user?.id) payload.id = user.id
      await onSave(payload)
    }catch(err){
      console.error(err)
      alert('Failed to save')
    }finally{
      setSaving(false)
    }
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h2>{user ? 'Edit User' : 'Add New User'}</h2>
      {user?.id && <div className="editing-info">Currently editing ID: {user.id}</div>}
      <label>
        Name
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
      </label>

      <label>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
      </label>

      <label>
        Avatar URL
        <input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://... (optional)" />
      </label>

      <div className="form-actions">
        <button className="btn" type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Saving…' : (user ? 'Update' : 'Create')}</button>
      </div>
    </form>
  )
}
