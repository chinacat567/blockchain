import React, { useState, useEffect, useContext } from 'react'
import styles from '../styles/Home.module.css'
import { Web3Context } from '../src/components/providers/Web3Provider'
import AuthenticatedUser from '../src/components/molecules/AuthenticatedUser'
import axios from 'axios'

export default function Home () {
  const { account, marketplaceContract, nftContract, isReady, hasWeb3, network, isVerified } = useContext(Web3Context)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [governmentId, setGovernmentId] = useState('')

  const onConnect = async () => {
    const formData = new FormData()
    formData.append('firstName', firstName)
    formData.append('lastName', lastName)
    formData.append('governmentId', governmentId)
    formData.append('account', account)

    const { data } = await axios.post('/api/signup', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (data) {
      alert('User Registered Successfully')
      window.location.assign('http://localhost:3000/')
    }
  }
  function handleChangeFirstName (e) {
    setFirstName(e.target.value)
  }

  function handleChangeLastName (e) {
    setLastName(e.target.value)
  }

  function handleChangeGovernmentId (e) {
    setGovernmentId(e.target.value)
  }
  if (isVerified) return <AuthenticatedUser/>

  return (
        <div className={styles.container}>
            <label>First Name : </label>
            <input type="text" name="firstName" id="firstname" onChange={ handleChangeFirstName }/>
            <div className='new-line'>{}</div>
            <label>Last Name : </label>
            <input type="text" name="lastname" id="lastname" onChange={ handleChangeLastName }/>
            <div className='new-line'>{}</div>
            <label>Government ID : </label>
            <input type="text" name="governmentId" id="governmentId " onChange={ handleChangeGovernmentId }/>
            <main>
                <button className={styles.button} onClick={onConnect}>Register</button>
            </main>
        </div>
  )
}
