import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import "./StudentDashboard.css"



export function StudentDashboard(){
  return (
    <div className="layout">
      <Navbar />
      <main className="main">
        <h1 className="title">Welcome to Your Dashboard</h1>
      </main>
      <Footer />
    </div>
  )
}


