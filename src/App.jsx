import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [tenders, setTenders] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/tenders')
      .then(response => setTenders(response.data))
      .catch(error => console.error('Error fetching tenders:', error));
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>📋 Available Tenders</h1>

      {tenders.length === 0 ? (
        <p style={emptyTextStyle}>No tenders available.</p>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRowStyle}>
                <th style={thStyle}>NO</th>
                <th style={thStyle}>Reference Number</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Start Date</th>
                <th style={thStyle}>End Date</th>
                <th style={thStyle}>Region</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((tender, index) => (
                <tr
                  key={tender.id}
                  style={{
                    ...tdRowStyle,
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#ffffff'
                  }}
                >
                  <td style={tdStyle}>{tender.N_o}</td>
                  <td style={tdStyle}>{tender.RefNum}</td>
                  <td style={tdStyle}>{tender.Description}</td>
                  <td style={tdStyle}>{new Date(tender.StartDate).toLocaleDateString()}</td>
                  <td style={tdStyle}>{new Date(tender.EndDate).toLocaleDateString()}</td>
                  <td style={tdStyle}>{tender.Region}</td>
                  <td style={tdStyle}>{tender.Amount?.toLocaleString()}</td>
                  <td style={tdStyle}>{tender.Remark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Style objects
const containerStyle = {
  maxWidth: '95%',
  margin: '40px auto',
  padding: 20,
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  color: '#2c3e50'
};

const headerStyle = {
  textAlign: 'center',
  fontSize: 28,
  color: '#2c3e50',
  marginBottom: 30
};

const emptyTextStyle = {
  textAlign: 'center',
  fontSize: 18,
  marginTop: 40
};

const tableWrapperStyle = {
  overflowX: 'auto',
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  padding: 10
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse', // can also try 'separate' for spaced borders
  minWidth: 800,
  transition: 'all 0.3s ease',
  border: '2px solid #3498db', 
  borderRadius: '15px',         
  overflow: 'hidden'           
};


const headerRowStyle = {
  backgroundColor: '#3498db',
  color: 'white'
};

const thStyle = {
  padding: '14px 18px',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: 15,
  whiteSpace: 'nowrap'
};

const tdRowStyle = {
  transition: 'background-color 0.3s ease',
  cursor: 'pointer'
};

const tdStyle = {
  padding: '12px 18px',
  borderBottom: '1px solid #e1e1e1',
  fontSize: 14,
  color: '#333'
};

export default App;
