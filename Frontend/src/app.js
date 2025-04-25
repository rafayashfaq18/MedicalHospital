import React from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/dashboard';
import Protected from './components/protected';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/*Login*/}
        <Route path="/login" element={<Login/>}/>

        {/*Dashboard (wrapped in protected route)*/}
        <Route path="/dashboard" element={
          <Protected>
            <Dashboard/>
          </Protected>}/>

        {/*Others (redirect to login)*/}
        <Route path="*" element={<Navigate to="/login"/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
