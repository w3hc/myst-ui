import axios from 'axios'
import { useState } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'

const Login = () => {
  const [userId, setUserId] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleLogin = async () => {
    try {
      console.log(`Starting login for userId: ${userId}`)

      const { data: options } = await axios.post('http://localhost:3000/webauthn/login', { userId })
      console.log('Authentication options received:', options)

      const assertion = await startAuthentication(options)
      console.log('Assertion created:', assertion)

      const { data: result } = await axios.post('http://localhost:3000/webauthn/login/finish', { assertion, userId })
      console.log('Result received:', result)

      if (result.success) {
        console.log('Login successful!')
      } else {
        setError('Login failed')
      }
    } catch (err: any) {
      console.error('Error during login:', err)
      setError(err.message)
    }
  }

  return (
    <div>
      <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
      <button onClick={handleLogin}>Login</button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default Login
