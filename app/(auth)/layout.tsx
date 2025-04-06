import React from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="auth bg-white">{children}</main>
  )
}

export default Layout