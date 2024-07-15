import axios from 'axios'
import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'

const Register = () => {
  const [userId, setUserId] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleRegister = async () => {
    try {
      // Step 1: Get registration options from the server
      const { data: options } = await axios.post('http://localhost:3000/webauthn/register', { userId })
      console.log('options (in Register.tsx):', options)

      // Step 2: Perform the registration ceremony
      const attResp = await startRegistration(options)
      console.log('attResp (in Register.tsx):', attResp)

      // Step 3: Send the attestation response back to the server
      const { data } = await axios.post('http://localhost:3000/webauthn/register/finish', { attResp, userId })
      console.log('Server response:', data)
      console.log('Registration successful!')
    } catch (err: any) {
      console.error('Error in handleRegister:', err)
      setError(err.message)
    }
  }

  return (
    <div>
      <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
      <button onClick={handleRegister}>Register</button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default Register
