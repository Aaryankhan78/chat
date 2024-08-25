import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    axios.defaults.withCredentials = true;

    const handleSubmit = (e) => {
        e.preventDefault();

        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/forgot-password`;

        axios.post(URL, { email })
        .then(res => {
            if(res.data.Status === "Success") {
                toast.success('Reset password link sent successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);  // Wait for 3 seconds before navigating to the login page
            } else {
                toast.error('User does not exist.');
            }
        }).catch(err => {
            toast.error('Something went wrong. Please try again.');
            console.log(err);
        });
    }

    return (
        <div className='mt-5'>
            <ToastContainer />
            <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto'>
                <h3>Forgot Password</h3>

                <form className="grid gap-4 mt-3" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            autoComplete="off"
                            name="email"
                            className="bg-slate-100 px-2 py-1 focus:outline-primary"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <button type='submit'
                        className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
