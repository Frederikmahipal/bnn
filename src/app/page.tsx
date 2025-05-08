'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import bcrypt from 'bcryptjs'

// The plain access code from env
const ACCESS_CODE = process.env.NEXT_PUBLIC_ACCESS_CODE || '123456'

export default function Home() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      setError('Please enter a valid 6-digit code')
      return
    }

    try {
      setIsChecking(true)
      setError('')

      // Simple comparison with the access code
      if (code !== ACCESS_CODE) {
        setError('Invalid access code')
        return
      }

      // Generate a hashed session token
      const sessionToken = await bcrypt.hash(Date.now().toString(), 10)
      Cookies.set('access_token', sessionToken, { 
        expires: 7,
        secure: true,    // Only send cookie over HTTPS
        sameSite: 'Strict' // Protect against CSRF
      })
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Error processing access code:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setError('')
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-2 text-lg text-center text-black tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isChecking}
              inputMode="numeric"
              autoComplete="off"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={code.length !== 6 || isChecking}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isChecking ? 'Checking...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  )
}
