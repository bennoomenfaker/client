import { Link } from "react-router-dom"
import NavBar from "../../../health-platform/src/components/NavBar"

const MinistryAdminPage = () => {
  return (
    <div>
        <NavBar/>
        <div>
            <h1>Ministry Admin Page</h1>
            <h1><Link to="/emdn-nomenclature">emdn</Link></h1>
            
        </div>
     
        
    </div>
  )
}

export default MinistryAdminPage
