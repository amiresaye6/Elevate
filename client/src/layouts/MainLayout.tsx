import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../components/layouts/Navbar'
import { Footer } from '../components/layouts/Footer'

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default MainLayout
