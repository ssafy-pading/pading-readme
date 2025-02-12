import React from 'react'
import { Link, useNavigate } from 'react-router-dom'


function LoginPage() {
    const navigate = useNavigate();

  return (
    <div>
        <h1 className='text-3xl text-bold underline'>LoginPage</h1>
        <hr />
        <br />
        <Link to="project">방 들어가기</Link>
        
    </div>
    
  )
}

export default LoginPage