import React from 'react'
import "./Home.css"
import Navbar from "../../Components/Navbar/Navbar"
import Hero from '../../Components/Hero/Hero'
import Footer from '../../Components/Footer/Footer'
function Home() {
  return (
    <div>
      <Navbar></Navbar>
      <Hero></Hero>
      <Footer></Footer>
    </div>
  )
}

export default Home
