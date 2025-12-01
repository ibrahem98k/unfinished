import React from 'react'
import UserList from './components/UserList'

export default function App(){
  return (
    <div className="app">
      <header className="app-header">
        <h1>User Management</h1>
        <p className="subtitle">Basic CRUD with mockapi.io — React (no TypeScript)</p>
      </header>

      <main className="container">
        <UserList />
      </main>

      <footer className="footer">Powered by mockapi.io</footer>
    </div>
  )
}
