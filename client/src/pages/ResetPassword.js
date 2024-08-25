import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ResetPassword() {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { id, token } = useParams();

    axios.defaults.withCredentials = true;

    const handleSubmit = (e) => {
        e.preventDefault();
        const URL = `${process.env.REACT_APP_BACKEND_URL}/api/reset-password/${id}/${token}`;

        axios.post(URL, { password })
            .then((res) => {
                if (res.data.Status === "Success") {
                    toast.success("Password updated successfully!");
                    setTimeout(() => {
                        navigate("/login");
                    }, 3000); // Redirect to login after 3 seconds
                } else {
                    toast.error(res.data.Status || "Error updating password");
                }
            })
            .catch((err) => {
                toast.error("Something went wrong. Please try again.");
                console.log(err);
            });
    };

    return (
        <div className='mt-5'>
            <ToastContainer />
            <div className='bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto'>
                <h3>Reset Password</h3>
                <form className="grid gap-4 mt-3" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="password">
                            <strong>New Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            autoComplete="off"
                            name="password"
                            className="bg-slate-100 px-2 py-1 focus:outline-primary"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'>
                        Update
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
