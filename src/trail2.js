import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {Table,TableBody,TableCell,TableContainer,TableHead,TableRow,
  Paper,
  Typography,
  IconButton,
  TextField,
  TableSortLabel,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import TablePagination from "@mui/material/TablePagination";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import SideNav from "./SideNav"; 


function App() {
  const [tenders, setTenders] = useState([]);
  const [filters, setFilters] = useState({});
  const [visibleFilters, setVisibleFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = () => {
    axios
      .get("http://localhost:5000/api/tenders")
      .then((res) => setTenders(res.data))
      .catch((err) => console.error("Error fetching tenders:", err));
  };

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
    setVisibleFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (e, id) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedTenderId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTenderId(null);
  };

  const handleDeleteClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
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

  const regionOptions = [
    ...new Set(tenders.map((t) => t.Region).filter(Boolean)),
  ];
  const descriptionOptions = [
    ...new Set(tenders.map((t) => t.Description).filter(Boolean)),
  ];

  const getProcessedData = () => {
    let data = [...tenders];

    if (searchTerm.trim()) {
      data = data.filter((item) =>
        Object.entries(item)
          .map(([key, value]) => {
            if (key.toLowerCase().includes("date") && !isNaN(new Date(value))) {
              return new Date(value).toLocaleDateString();
            }
            return String(value ?? "");
          })
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

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
        return sortConfig.direction === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }

    return data;
  };

  const processedTenders = getProcessedData();

  return (
    <Box sx={{ display: "flex" }}>
      <SideNav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5">Available Tenders</Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              endAdornment: (
                <IconButton disabled>
                  <SearchIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <div
                      style={{
                        display: "flex",
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
                          <FilterAltIcon fontSize="small" />
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
                          value={filters[col.key] || ""}
                          onChange={(e) =>
                            handleFilterChange(col.key, e.target.value)
                          }
                          SelectProps={{ native: true }}
                        >
                          <option value="">All</option>
                          {(col.key === "Region"
                            ? regionOptions
                            : descriptionOptions
                          ).map((option, i) => (
                            <option key={i} value={option}>
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
                  <TableRow key={tender.id}>
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
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, tender.N_o)}
                      >
                        <MoreVertIcon />
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
          rowsPerPageOptions={[5, 10, 25, 100]}
        />
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleEdit(selectedTenderId)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

export default App;
