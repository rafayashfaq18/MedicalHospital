import React, {useState} from 'react';
import {useNavigate,Navigate} from 'react-router-dom';

function Login(){
    //Main boxes and buttons
    const [email, set_email] = useState('');
    const [password, set_password] = useState('');
    const navigate = useNavigate();

    //Check if user is already logged in
    const token = sessionStorage.getItem('token');
    if(token){
        return <Navigate to="/dashboard" replace />;
    }

    //Form submit function
    const submit = async(e) => {
        //Stop browser from reloading on submission
        e.preventDefault();
        try{
            //Call the post method from backend
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email, password})
            });


            //If no valid response, throw error
            if(!response.ok){
                const err = await response.json
                throw new Error(err);
            }

            //Generate token and pass to the dashboard
            const {token} = await response.json();
            sessionStorage.setItem('token', token);
            navigate('/dashboard');

        }
        catch(err){
            console.error("Error logging in: ", err);
            alert("Login failed: ", err);
        }
    }

    //Have the login function return a form
    return(
        <form onSubmit = {submit}>
            <h2>Admin Login</h2>
            <label>
                Email: <input type="email" value = {email} onChange = {(e) => set_email(e.target.value)}/>
            </label>
            <label>
                Password: <input type="password" value = {password} onChange = {(e) => set_password(e.target.value)}/>
            </label>
            <button type="submit">
                Login
            </button>
        </form>
    )
};

export default Login;
