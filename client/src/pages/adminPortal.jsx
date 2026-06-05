import userContext from "../contexts/userContext";
import { useContext, useEffect, useState } from "react";
import authService from "../services/authService";
import usersService from "../services/usersService";
import UsersList from "../components/usersList";

function AdminPortal(){

    const {user } = useContext(userContext)
    const [usersList , setUsersList] = useState([])
    const [error , setError] = useState("")
    const [loading , setLoading] = useState(true)
    const role = user.userRole
    //fatch all users
    useEffect(()=>{
        const fetchUsers = async () =>{
            try{
                const users = await usersService.getAll()
                setUsersList(users)
            }catch(err){
                setError(err.message || "Couldn't load users")
            }
            finally{
                setLoading(false)
            }
        }
        fetchUsers()
    },[])
    //delete with maneger / admin 
    //delete with admin
    //put with maneger
    //put with admin
    return(
        
        <div><UsersList users={usersList } setUsersList = {setUsersList}/></div>
    )

}
export default AdminPortal