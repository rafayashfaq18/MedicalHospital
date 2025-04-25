import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

function Dashboard(){
    //First, set state boxes
    const [active_tab, set_active_tab] = useState('users');
    const [active_sub_tab, set_active_sub_tab] = useState('Pending');
    const [users, set_user] = useState([]);
    const [appointments, set_appointments] = useState([]);

    const navigate = useNavigate();

    //Fetch the data
    useEffect(() => {
        if(active_tab === 'users'){
            const token = sessionStorage.getItem('token');
            fetch(`http://localhost:3000/admin/users?status=${active_sub_tab}`, {headers: {Authorization: `Bearer ${token}`}})
                .then(res => res.json())
                .then(set_user)
                .catch(err => console.error('Error loading dashboard.', err));
        }
    },[active_sub_tab,active_tab])
    useEffect(() => {
        if(active_tab === 'appointments'){
            const token = sessionStorage.getItem('token');
            fetch('http://localhost:3000/admin/appointments', {headers: {Authorization: `Bearer ${token}`}})
                .then(res => res.json())
                .then(set_appointments)
                .catch(err => console.error('Error loading dashboard.', err));
        }
    },[active_tab])

    //Approve or block users
    const change_status = async (id,status) => {
        const token = sessionStorage.getItem('token');
        const url = (
            status === 'Approved'
            ? `/admin/users/${id}/block`
            : `/admin/users/${id}/approve`
        );
        await fetch(`http://localhost:3000${url}`, {method: 'PUT',headers: {Authorization: `Bearer ${token}`}})
            .catch(err => console.error('Error loading dashboard.',err));
        const res = await fetch(`http://localhost:3000/admin/users?status=${active_sub_tab}`, {headers: {Authorization: `Bearer ${token}`}});
        const data = await res.json();
        set_user(data);
    }

    //Logout function
    const Logout = () => {
        sessionStorage.removeItem('token');
        navigate('/login',{replace:true});
    };

    return (
        <div>
            {/*Main buttons*/}
            <button onClick={() => set_active_tab('users')}>
                    Users
            </button>
            <button onClick={() => set_active_tab('appointments')}>
                    Appointments
            </button>

            {/*Check which tab is active*/}
            {
                active_tab==='users'? (
                    <>
                        <br></br>
                        {/*User tab is active*/}
                        {/*Check subtabs*/}
                        {
                            ['Pending','Approved','Blocked'].map(status => (
                                <button key={status} onClick={() => set_active_sub_tab(status)}>
                                    {status}
                                </button>
                            ))
                        }

                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/*Display the data*/}
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>{user.status}</td>
                                        <td>
                                            {
                                                user.role == 'Admin'
                                                ? (<button className='greyed_out'>-</button>)
                                                : (
                                                    <button onClick={() => change_status(user._id, user.status)}>
                                                        {user.status === 'Approved' ? 'Block':'Approve'}
                                                    </button>
                                                )
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ):(
                    <>
                        {/*Appointment tab is active*/}
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/*Display the data*/}
                                {appointments.map(appoint => (
                                    <tr key={appoint._id}>
                                        <td>{appoint.patientID.name}</td>
                                        <td>{appoint.doctorID.name}</td>
                                        <td>{new Date(appoint.date).toLocaleString()}</td>
                                        <td>{appoint.status}</td>
                                        <td>{appoint.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )
            }

            <br></br>
            <br></br>
            <button onClick={Logout}>
                    Logout
            </button>
        </div>
    )
}

export default Dashboard;
