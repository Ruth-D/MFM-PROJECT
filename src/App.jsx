import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography,
  IconButton, TextField, TableSortLabel
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import './App.css';

function App() {
  const [tenders, setTenders] = useState([]);
  const [filters, setFilters] = useState({});
  const [visibleFilters, setVisibleFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/tenders')
      .then(response => setTenders(response.data))
      .catch(error => console.error('Error fetching tenders:', error));
  }, []);

  const columns = [
    { key: 'N_o', label: 'NO', filterable: false },
    { key: 'RefNum', label: 'Reference Number' },
    { key: 'Description', label: 'Description' },
    { key: 'StartDate', label: 'Start Date' },
    { key: 'EndDate', label: 'End Date' },
    { key: 'Region', label: 'Region' },
    { key: 'Amount', label: 'Amount' },
    { key: 'Remark', label: 'Remark' }
  ];

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleFilterVisibility = (key) => {
    setVisibleFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getProcessedData = () => {
    let data = [...tenders];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        data = data.filter(item =>
          String(item[key] ?? '').toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  };

  const processedTenders = getProcessedData();

  return (
    <div className="container">
      <Typography variant="h4" className="title">
        📋 Available Tenders
      </Typography>

      {tenders.length === 0 ? (
        <Typography variant="body1" className="emptyText">
          No tenders available.
        </Typography>
      ) : (
        <TableContainer component={Paper} className="tableContainer">
          <Table>
            <TableHead className="tableHead">
              <TableRow>
                {columns.map(col => (
                  <TableCell key={col.key}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <TableSortLabel
                        active={sortConfig.key === col.key}
                        direction={sortConfig.key === col.key ? sortConfig.direction : 'asc'}
                        onClick={() => handleSort(col.key)}
                      >
                        <strong>{col.label}</strong>
                      </TableSortLabel>
                      {col.filterable !== false && (
                        <IconButton size="small" onClick={() => toggleFilterVisibility(col.key)}>
                          <FilterListIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                    {col.filterable !== false && visibleFilters[col.key] && (
                      <TextField
                        size="small"
                        variant="standard"
                        placeholder="Filter..."
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        fullWidth
                        sx={{ mt: 1 }}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {processedTenders.map((tender, index) => (
                <TableRow key={tender.id} className={index % 2 === 0 ? "evenRow" : "oddRow"}>
                  <TableCell>{tender.N_o}</TableCell>
                  <TableCell>{tender.RefNum}</TableCell>
                  <TableCell>{tender.Description}</TableCell>
                  <TableCell>{new Date(tender.StartDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(tender.EndDate).toLocaleDateString()}</TableCell>
                  <TableCell>{tender.Region}</TableCell>
                  <TableCell>{tender.Amount?.toLocaleString()}</TableCell>
                  <TableCell>{tender.Remark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}

export default App;
