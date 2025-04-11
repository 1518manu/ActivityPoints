
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute = () => {

  const user = JSON.parse(localStorage.getItem('userData'));
  console.log(user);

  return user ? <Outlet /> : <Navigate to="/" />;
};
