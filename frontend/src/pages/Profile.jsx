import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  if (user && user.employeeId) {
    return <Navigate to={`/employees/${user.employeeId}`} replace />;
  }
  return (
    <div className="p-6 text-center text-slate-500 font-medium">
      This user account is not linked to any Employee profile.
    </div>
  );
};

export default Profile;
