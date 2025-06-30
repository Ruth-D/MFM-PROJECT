import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  TextField,
  TableSortLabel,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import TablePagination from "@mui/material/TablePagination";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";

function App() {
  const [tenders, setTenders] = useState([]);
  const [filters, setFilters] = useState({});
  const [visibleFilters, setVisibleFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tenders")
      .then((response) => setTenders(response.data))
      .catch((error) => console.error("Error fetching tenders:", error));
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tenders/${id}`);
      fetchTenders(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting tender:", error);
    }
  };

  const handleEdit = (id) => {
    console.log("Edit tender with ID:", id);
  };

  const columns = [
    { key: "N_o", label: "NO", filterable: false },
    { key: "RefNum", label: "Reference Number" },
    { key: "Description", label: "Description" },
    { key: "StartDate", label: "Start Date", filterable: false },
    { key: "EndDate", label: "End Date", filterable: false },
    { key: "Region", label: "Region" },
    { key: "Amount", label: "Amount" },
    { key: "Remark", label: "Remark" },
    { key: "Actions", label: "Actions", filterable: false, sortable: false },
  ];

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFilterVisibility = (key) => {
    setVisibleFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getProcessedData = () => {
    let data = [...tenders];

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        data = data.filter((item) =>
          String(item[key] ?? "")
            .toLowerCase()
            .includes(value.toLowerCase())
        );
      }
    });

    if (sortConfig.key) {
      data.sort((a, b) => {
        const valA = a[sortConfig.key] ?? "";
        const valB = b[sortConfig.key] ?? "";
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  };

  const processedTenders = getProcessedData();

  return (
    <div className="container">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Tender Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          <ListItem button>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Tenders" />
          </ListItem>
        </List>
      </Drawer>
   <div className={`content ${drawerOpen ? "shrink" : ""}`}></div>
      <Typography variant="h4" className="title" style={{ marginTop: '20px' }}>
        Available Tenders
      </Typography>

      {tenders.length === 0 ? (
        <Typography variant="body1" className="emptyText">
          No tenders available.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} className="tableContainer">
            <Table>
              <TableHead className="tableHead">
                <TableRow sx={{ backgroundColor: "#213d50" }}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <TableSortLabel
                          active={sortConfig.key === col.key}
                          direction={
                            sortConfig.key === col.key
                              ? sortConfig.direction
                              : "asc"
                          }
                          onClick={() => handleSort(col.key)}
                          sx={{
                            color: "white",
                            "& .MuiTableSortLabel-icon": { color: "white" },
                          }}
                        >
                          <strong>{col.label}</strong>
                        </TableSortLabel>
                        {col.filterable !== false && (
                          <IconButton
                            size="small"
                            onClick={() => toggleFilterVisibility(col.key)}
                          >
                            <FilterListIcon fontSize="small" />
                          </IconButton>
                        )}
                      </div>
                      {col.filterable !== false &&
                        visibleFilters[col.key] &&
                        (col.key === "Region" || col.key === "Description" ? (
                          <TextField
                            select
                            fullWidth
                            variant="standard"
                            size="small"
                            sx={{ mt: 1 }}
                            value={filters[col.key] || ""}
                            onChange={(e) =>
                              handleFilterChange(col.key, e.target.value)
                            }
                            SelectProps={{ native: true }}
                          >
                            <option value="">All</option>
                            {(col.key === "Region"
                              ? [...new Set(tenders.map((t) => t.Region).filter(Boolean))]
                              : [...new Set(tenders.map((t) => t.Description).filter(Boolean))]
                            ).map((option, idx) => (
                              <option key={idx} value={option}>
                                {option}
                              </option>
                            ))}
                          </TextField>
                        ) : (
                          <TextField
                            size="small"
                            variant="standard"
                            placeholder="Filter..."
                            onChange={(e) =>
                              handleFilterChange(col.key, e.target.value)
                            }
                            fullWidth
                            sx={{ mt: 1 }}
                          />
                        ))}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {processedTenders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((tender, index) => (
                    <TableRow
                      key={tender.id}
                      className={index % 2 === 0 ? "evenRow" : "oddRow"}
                    >
                      <TableCell>{tender.N_o}</TableCell>
                      <TableCell>{tender.RefNum}</TableCell>
                      <TableCell>{tender.Description}</TableCell>
                      <TableCell>
                        {new Date(tender.StartDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(tender.EndDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{tender.Region}</TableCell>
                      <TableCell>{tender.Amount?.toLocaleString()}</TableCell>
                      <TableCell>{tender.Remark}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(tender.id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(tender.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={processedTenders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      
    </div>
  );
}

export default App;