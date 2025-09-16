import { useEffect, useState } from "react";
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
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TablePagination from "@mui/material/TablePagination";
import Pagination from "@mui/material/Pagination";
import Stack from '@mui/material/Stack';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import SideNav from "./SideNav";
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AddTender from './AddTender.jsx';

function App() {
  const location = useLocation();
  // Determine selected tab from route
  const selectedTab = location.pathname === '/add-tender' ? 'add' : 'tenders';
  // Handler to change tab and route
  const handleTabChange = (tab) => {
    if (tab === 'tenders') navigate('/');
    else if (tab === 'add') navigate('/add-tender');
  };
  // Delete success dialog close handler
  const handleDeleteSuccessClose = () => {
    setDeleteSuccess(false);
  };
  // Confirm delete handler
  const handleConfirmDelete = async () => {
    const N_o = Number(selectedTenderId);
    if (!isNaN(N_o) && N_o > 0) {
      await handleDelete(N_o);
      setConfirmOpen(false);
    } else {
      alert("Invalid tender ID for deletion.");
    }
  };
  // Confirm dialog close handler
  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };
  // Edit save handler
  const handleEditSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/tenders/${editTender.N_o}`,
        editTender
      );
      setEditOpen(false);
      fetchTenders();
    } catch (err) {
      console.error("Error updating:", err);
    }
  };
  // Menu handlers
  const handleMenuOpen = (e, N_o) => {
    setMenuAnchorEl(e.currentTarget);
    setSelectedTenderId(Number(N_o));
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    // Do NOT clear selectedTenderId here; keep it until after delete/cancel
  };
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handlePaginationChange = (event, value) => {
    setPage(value - 1);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const navigate = typeof useNavigate === 'function' ? useNavigate() : () => {};

  // State definitions must come first
  const [tenders, setTenders] = useState([]);
  const [totalTenders, setTotalTenders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});
  const [visibleFilters, setVisibleFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Table columns definition
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

  // Options for filters
  const regionOptions = [
    ...new Set(tenders.map((t) => t.Region).filter(Boolean)),
  ];
  const descriptionOptions = [
    ...new Set(tenders.map((t) => t.Description).filter(Boolean)),
  ];

  // For backend-driven filtering, just use tenders as-is
  const processedTenders = tenders;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTender, setEditTender] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    fetchTenders(page + 1, rowsPerPage, filters, searchTerm);
  }, [page, rowsPerPage, filters, searchTerm, sortConfig]);

  const fetchTenders = (pageNum = 1, pageSize = 5, filtersObj = {}, search = "") => {
    // Build query params for filters, search, and sorting
    const params = new URLSearchParams();
    params.append("page", pageNum);
    params.append("pageSize", pageSize);
    if (search) params.append("search", search);
    Object.entries(filtersObj).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    // Add sorting
    if (sortConfig.key) {
      params.append("sortKey", sortConfig.key);
      params.append("sortDirection", sortConfig.direction);
    }
    axios
      .get(`http://localhost:5000/api/tenders?${params.toString()}`)
      .then((res) => {
        setTenders(res.data.tenders);
        setTotalTenders(res.data.total);
        setTotalPages(res.data.totalPages);
        // If current page is out of range (e.g. after deletion), reset to last page
        if (res.data.totalPages > 0 && pageNum > res.data.totalPages) {
          setPage(res.data.totalPages - 1);
        }
      })
      .catch((err) => console.error("Error fetching tenders:", err));
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <SideNav selectedTab={selectedTab} onTabChange={handleTabChange} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/add-tender" element={<AddTender />} />
          <Route path="/" element={
            <>
              {selectedTab === 'tenders' && (
                <>
                  <Typography variant="h5">Available Tenders</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
                    <Button 
                      variant="contained" 
                      sx={{ minWidth: 140, backgroundColor: '#18471aff', color: '#fff', '&:hover': { backgroundColor: '#43a047' } }}
                      onClick={() => navigate('/add-tender')}
                    >
                      Add Tender
                    </Button>
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
                                    sx={{ color: 'white' }}
                                  >
                                    <FilterAltIcon fontSize="small" sx={{ color: 'white' }} />
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
                        {processedTenders.map((tender) => (
                          <TableRow key={tender.N_o}>
                            <TableCell>{tender.N_o}</TableCell>
                            <TableCell>{tender.RefNum}</TableCell>
                            <TableCell>{tender.Description}</TableCell>
                            <TableCell>{new Date(tender.StartDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(tender.EndDate).toLocaleDateString()}</TableCell>
                            <TableCell>{tender.Region}</TableCell>
                            <TableCell>{tender.Amount?.toLocaleString()}</TableCell>
                            <TableCell>{tender.Remark}</TableCell>
                            <TableCell>
                              <IconButton onClick={(e) => handleMenuOpen(e, tender.N_o)}>
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                anchorEl={menuAnchorEl}
                                open={Boolean(menuAnchorEl) && selectedTenderId === tender.N_o}
                                onClose={handleMenuClose}
                              >
                                <MenuItem onClick={() => handleEdit(tender.N_o)}>
                                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                  Edit
                                </MenuItem>
                                <MenuItem onClick={() => handleDeleteClick(tender)}>
                                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                  Delete
                                </MenuItem>
                              </Menu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {/* Display count of items on this page */}
                  <Typography variant="body2" sx={{ mt: 1, mb: 0, textAlign: 'right', color: 'text.secondary' }}>
                    Showing {processedTenders.length} of {totalTenders} tenders
                  </Typography>
                  <TablePagination
                    component="div"
                    count={totalTenders}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 100]}
                    nextIconButtonProps={{ disabled: totalPages <= 1 }}
                    backIconButtonProps={{ disabled: totalPages <= 1 }}
                  />
                  <Stack spacing={2} sx={{ my: 2, alignItems: 'center' }}>
                    <Pagination
                      count={totalPages}
                      page={page + 1}
                      onChange={handlePaginationChange}
                      variant="outlined"
                      color="primary"
                      siblingCount={1}
                      boundaryCount={1}
                      showFirstButton
                      showLastButton
                      disabled={totalPages <= 1}
                    />
                  </Stack>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                  >
                    <MenuItem onClick={() => handleEdit(selectedTenderId)}>
                      <EditIcon fontSize="small" sx={{ mr: 1 }} />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        // Always use selectedTenderId set by handleMenuOpen
                        if (selectedTenderId && !isNaN(Number(selectedTenderId))) {
                          setConfirmOpen(true);
                          handleMenuClose();
                        } else {
                          alert('No tender selected for deletion.');
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                      Delete
                    </MenuItem>
                  </Menu>
                  <Dialog
                    open={editOpen}
                    onClose={() => setEditOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                      sx: {
                        borderRadius: 3,
                        background: "#f7fbfc",
                        boxShadow: 8,
                      },
                    }}
                  >
                    <DialogTitle
                      sx={{
                        background: "#213d50",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        pb: 2,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <EditIcon sx={{ mr: 1 }} />
                        Edit Tender
                      </span>
                      <IconButton
                        aria-label="close"
                        onClick={() => setEditOpen(false)}
                        sx={{
                          color: "#fff",
                          ml: 2,
                          p: 0.5,
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                      {editTender && (
                        <Box
                          component="form"
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <TextField
                            margin="dense"
                            label="Reference Number"
                            fullWidth
                            variant="outlined"
                            value={editTender.RefNum || ""}
                            onChange={(e) => handleEditChange("RefNum", e.target.value)}
                          />
                          <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            variant="outlined"
                            value={editTender.Description || ""}
                            onChange={(e) =>
                              handleEditChange("Description", e.target.value)
                            }
                          />
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                              margin="dense"
                              label="Start Date"
                              type="date"
                              fullWidth
                              variant="outlined"
                              InputLabelProps={{ shrink: true }}
                              value={
                                editTender.StartDate
                                  ? editTender.StartDate.slice(0, 10)
                                  : ""
                              }
                              onChange={(e) =>
                                handleEditChange("StartDate", e.target.value)
                              }
                            />
                            <TextField
                              margin="dense"
                              label="End Date"
                              type="date"
                              fullWidth
                              variant="outlined"
                              InputLabelProps={{ shrink: true }}
                              value={
                                editTender.EndDate ? editTender.EndDate.slice(0, 10) : ""
                              }
                              onChange={(e) =>
                                handleEditChange("EndDate", e.target.value)
                              }
                            />
                          </Box>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                              margin="dense"
                              label="Region"
                              fullWidth
                              variant="outlined"
                              value={editTender.Region || ""}
                              onChange={(e) => handleEditChange("Region", e.target.value)}
                            />
                            <TextField
                              margin="dense"
                              label="Amount"
                              type="number"
                              fullWidth
                              variant="outlined"
                              value={editTender.Amount || ""}
                              onChange={(e) => handleEditChange("Amount", e.target.value)}
                            />
                          </Box>
                          <TextField
                            margin="dense"
                            label="Remark"
                            fullWidth
                            variant="outlined"
                            multiline
                            minRows={2}
                            value={editTender.Remark || ""}
                            onChange={(e) => handleEditChange("Remark", e.target.value)}
                          />
                        </Box>
                      )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                      <Button
                        onClick={() => setEditOpen(false)}
                        variant="outlined"
                        color="inherit"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditSave}
                        variant="contained"
                        color="primary"
                        sx={{ boxShadow: 2 }}
                        startIcon={<EditIcon />}
                      >
                        Save Changes
                      </Button>
                    </DialogActions>
                  </Dialog>
                  {/* Delete Confirmation Dialog */}
                  <Dialog open={confirmOpen} onClose={handleConfirmClose}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        Are you sure you want to delete this tender?
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleConfirmClose}>Cancel</Button>
                      <Button
                        onClick={handleConfirmDelete}
                        color="error"
                        variant="contained"
                      >
                        Delete
                      </Button>
                    </DialogActions>
                  </Dialog>
                  {/* Delete Success Message */}
                  <Dialog open={deleteSuccess} onClose={handleDeleteSuccessClose}>
                    <DialogTitle>Delete Successful</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        Tender was deleted successfully.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleDeleteSuccessClose} autoFocus>OK</Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
            </>
          } />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;

