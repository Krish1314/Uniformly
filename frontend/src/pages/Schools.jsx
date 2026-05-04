import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const Schools = () => {
  const schoolsList = [
    { id: 1, name: "Bishop Cotton School", location: "Bangalore", items: 5, letter: "B" },
    { id: 2, name: "Delhi Public School", location: "Delhi", items: 7, letter: "D" },
    { id: 3, name: "La Martiniere College", location: "Chennai", items: 4, letter: "L" },
    { id: 4, name: "Delhi Public School", location: "Mumbai", items: 7, letter: "D" },
    { id: 5, name: "The Doon School", location: "Dheradun", items: 7, letter: "T" },
  ];

  return (
    <div className="fade-in">
      <div className="container py-5 mt-4" style={{ minHeight: '60vh' }}>
        <h1 className="font-serif fw-bold" style={{ fontSize: '3rem' }}>Find Your School</h1>
        <p className="text-dark fs-5 mb-5">Select your school to see approved uniforms and accessories.</p>

        <div className="position-relative mb-5" style={{ maxWidth: '600px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search position-absolute text-muted" style={{ left: '16px', top: '16px' }} viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          <input
            type="text"
            className="form-control form-control-lg border-0 ps-5"
            placeholder="Search by Schools..."
            style={{ backgroundColor: '#f0f2f5', borderRadius: '8px' }}
          />
        </div>

        <div className="row g-4 mb-5 pb-5">
          {schoolsList.map(school => (
            <div className="col-md-4" key={school.id}>
              <Link to="/catalog" className="text-decoration-none">
                <div className={`school-card ${school.active ? 'active' : ''}`}>
                  <div className="school-letter">{school.letter}</div>
                  <div>
                    <div className="school-name-large">{school.name}</div>
                    <div className="school-meta mb-1">{school.location}</div>
                    <div className="school-meta">{school.items} items</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Schools;
