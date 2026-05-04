import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="container py-5 text-center">Loading user profile...</div>;
  }

  return (
    <div className="fade-in d-flex flex-column" style={{ minHeight: '100vh' }}>
      <div className="container py-5 mt-4 flex-grow-1" style={{ maxWidth: '900px' }}>
        
        {/* Header Block */}
        <div className="d-flex align-items-center mb-5 pb-3">
          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-4" style={{ width: '120px', height: '120px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" className="bi bi-person-circle text-dark" viewBox="0 0 16 16">
              <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
              <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z"/>
            </svg>
          </div>
          <div>
            <h1 className="fw-bold mb-1" style={{ fontSize: '2.5rem' }}>{user.firstName} {user.lastName || ''}</h1>
            <div className="text-dark fs-5 d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-envelope-fill me-2" viewBox="0 0 16 16">
                <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
              </svg>
              {user.email}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="info-block p-4">
              <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Total Orders</div>
              <div className="fw-bold fs-4">1</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="info-block p-4">
              <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Total Spend</div>
              <div className="fw-bold fs-4">₹ 2,069</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="info-block p-4">
              <div className="fw-bold text-dark mb-2" style={{ fontSize: '0.9rem' }}>Total Spend</div>
              <div className="fw-bold fs-4">₹ 2,069</div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <Link to="/orders" className="profile-link-card h-100 flex-column align-items-start">
              <div className="d-flex justify-content-between align-items-center w-100 mb-4">
                <div className="d-flex align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-box me-3" viewBox="0 0 16 16">
                    <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                  </svg>
                  <span className="fw-bold fs-4">My Orders</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>
              <div className="text-muted">View and Track your orders.</div>
            </Link>
          </div>
          <div className="col-md-6">
            <Link to="/address" className="profile-link-card h-100 flex-column align-items-start">
              <div className="d-flex justify-content-between align-items-center w-100 mb-4">
                <div className="d-flex align-items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-geo-alt-fill me-3" viewBox="0 0 16 16">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                  <span className="fw-bold fs-4">My Address</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-chevron-right" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </div>
              <div className="text-muted">Save delivery addresses for faster checkout</div>
            </Link>
          </div>
        </div>

        {/* Personal Details Block */}
        <div className="info-block p-5 mt-3">
          <h2 className="fw-bold fs-4 mb-5">Personal Details</h2>
          
          <div className="row g-5">
            <div className="col-md-6">
              <div className="text-dark mb-1 fs-5">First Name</div>
              <div className="fw-bold fs-5">{user.firstName}</div>
            </div>
            <div className="col-md-6">
              <div className="text-dark mb-1 fs-5">Last Name</div>
              <div className="fw-bold fs-5">{user.lastName || '-'}</div>
            </div>
            <div className="col-md-6">
              <div className="text-dark mb-1 fs-5">Email Address</div>
              <div className="fw-bold fs-5">{user.email}</div>
            </div>
            <div className="col-md-6">
              <div className="text-dark mb-1 fs-5">Phone Number</div>
              <div className="fw-bold fs-5">{user.phone || '-'}</div>
            </div>
            <div className="col-md-6">
              <div className="text-dark mb-1 fs-5">User ID</div>
              <div className="fw-bold fs-5">{user.id}</div>
            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Profile;
