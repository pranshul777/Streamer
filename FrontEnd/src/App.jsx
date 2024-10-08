import React, { lazy, Suspense } from 'react';
import Header from './Components/Header.jsx';
import Home from './Pages/Home.jsx';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Error from './Pages/Error.jsx';

const Login = lazy(()=> import("./Pages/Login.jsx"));
const Profile = lazy(()=> import('./Pages/Profile.jsx'));
const Register = lazy(()=> import('./Pages/Register.jsx'));
const VideoUpload = lazy(()=> import('./Pages/VideoUpload.jsx'));
const Video = lazy(() => import('./Pages/Video.jsx'));

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
            },,
            {
                path : "uploadvideo",
                element: <Suspense fallback={<div>Loading...</div>}><VideoUpload /></Suspense>
            },
            {
                path : "watch/:id",
                element: <Suspense fallback={<div>Loading...</div>}><Video /></Suspense>
            }
        ]
    },,
    {
        path: "/login",
        element: <Suspense fallback={<div>Loading...</div>}><Login /></Suspense>
    },
    {
        path: "/register",
        element: <Suspense fallback={<div>Loading...</div>}><Register /></Suspense>
    }
]);

// Wrap the RouterProvider in a functional component
const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
