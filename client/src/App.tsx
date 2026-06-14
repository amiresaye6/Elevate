import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-lg p-6 space-y-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
          Academic Mentorship Platform
        </h1>
        <p className="text-muted-foreground text-sm">
          Welcome to the ITI React + NestJS Final Project. The frontend environment is successfully configured!
        </p>
        <div className="flex flex-col items-center justify-center gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/95 transition duration-150 ease-in-out"
            onClick={() => setCount((c) => c + 1)}
          >
            Count is {count}
          </button>
          
          <button
            type="button"
            className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground font-semibold rounded-md shadow transition duration-150 ease-in-out"
            onClick={() => document.documentElement.classList.toggle('dark')}
          >
            Toggle Dark Mode
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
