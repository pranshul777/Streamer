import React, { lazy, Suspense } from 'react';
import Header from './Components/Header.jsx';
import Home from './Pages/Home.jsx';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Error from './Pages/Error.jsx';

const Login = lazy(()=> import("./Pages/Login.jsx"));
const Profile = lazy(()=> import('./Pages/Profile.jsx'));
const Register = lazy(()=> import('./Pages/Register.jsx'));


function Layout() {
    return (
        <>
            <Header />
            <Outlet />
        </>
    );
}

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />, // Root element that renders the header and the outlet
        errorElement : <Error/>,
        children: [
            {
                path: "",
                element: <Home />
            },
            {
                path: "profile",
                element: <Suspense fallback={<div>Loading...</div>}><Profile /></Suspense>
            },
            {
                path: "register",
                element: <Suspense fallback={<div>Loading...</div>}><Register /></Suspense>
            }
        ]
    },
    {
        path: "/login",
        element: <Suspense fallback={<div>Loading...</div>}><Login /></Suspense>
    }
]);

// Wrap the RouterProvider in a functional component
const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
