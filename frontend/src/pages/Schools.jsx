import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { schoolApi } from '../api/schoolApi';

const Schools = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const response = await schoolApi.getSchools();
        setSchools(response.data);
      } catch (err) {
        console.error('Failed to load schools', err);
      } finally {
        setLoading(false);
      }
    };
    loadSchools();
  }, []);

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.city || '').toLowerCase().includes(search.toLowerCase())
  );

  const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

  const handleSchoolClick = (schoolId) => {
    navigate(`/catalog?schoolId=${schoolId}`);
  };

  return (
    <div className="fade-in">
      <div className="container py-5 mt-4" style={{ minHeight: '60vh' }}>
        <h1 className="font-serif fw-bold" style={{ fontSize: '3rem' }}>Find Your School</h1>
        <p className="text-dark fs-5 mb-5">Select your school to see approved uniforms and accessories.</p>

        <div className="position-relative mb-5" style={{ maxWidth: '600px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            className="bi bi-search position-absolute text-muted"
            style={{ left: '16px', top: '16px' }} viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
          </svg>
          <input
            type="text"
            className="form-control form-control-lg border-0 ps-5"
            placeholder="Search by school name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ backgroundColor: '#f0f2f5', borderRadius: '8px' }}
          />
        </div>

        {loading ? (
          <div className="text-center py-5 text-muted">Loading schools...</div>
        ) : (
          <div className="row g-4 mb-5 pb-5">
            {filtered.length === 0 ? (
              <div className="text-center py-5 text-muted">No schools found.</div>
            ) : filtered.map(school => (
              <div className="col-md-4" key={school.id}>
                <div
                  className="school-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSchoolClick(school.id)}
                >
                  <div className="school-letter">{getInitial(school.name)}</div>
                  <div>
                    <div className="school-name-large">{school.name}</div>
                    <div className="school-meta mb-1">{school.city}{school.state ? `, ${school.state}` : ''}</div>
                    <div className="school-meta">View uniforms →</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Schools;
