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
      setEditSuccess(true); // Show success dialog
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
    { key: "N_o", label: "NO", filterable: false, sortable: true },
    { key: "CompanyName", label: "Company Name", sortable: true },
    { key: "Description", label: "Description", sortable: false },
    { key: "RefNum", label: "Reference Number", sortable: false },
    { key: "ClosingDateTime", label: "Closing Date and Time", filterable: false, sortable: false },
    { key: "OpeningDateTime", label: "Opening Date and Time", filterable: false, sortable: false },
    { key: "Region", label: "Region", sortable: true },
    { key: "Amount", label: "Amount", sortable: false },
    { key: "TenderType", label: "Tender Type", filterable: true, sortable: false },
    { key: "Actions", label: "Actions", filterable: false, sortable: false },
  ];

  const regionOptions = [
    ...new Set(tenders.map((t) => t.Region).filter(Boolean)),
  ];
  const descriptionOptions = [
    ...new Set(tenders.map((t) => t.Description).filter(Boolean)),
  ];
  // Use the same tender type options as AddTender.jsx for consistent filtering
  const tenderTypeOptions = [
    "National Competitive bid",
    "International Competitive Bid",
    "Goods",
    "Consultancy",
    "Non-consultancy",
    "Works"
  ];
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTenderId, setSelectedTenderId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTender, setEditTender] = useState(null);
  const [editSearch, setEditSearch] = useState("");
  const [editSearchResult, setEditSearchResult] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  // Add tender type filter state
  const [tenderTypeFilter, setTenderTypeFilter] = useState("");
  // Apply TenderType filter client-side if set
  // Normalize comparison for tender type filter (case and whitespace insensitive)
  const processedTenders = tenderTypeFilter
    ? tenders.filter((t) =>
        t.TenderType &&
        t.TenderType.trim().toLowerCase() === tenderTypeFilter.trim().toLowerCase()
      )
    : tenders;

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

  // Toggle visibility of filter input for a column
  const toggleFilterVisibility = (key) => {
    setVisibleFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle filter value change for a column
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(0); // Reset to first page when filtering
  };

  // Open edit dialog for a tender
  const handleEdit = (N_o) => {
    const tender = tenders.find((t) => t.N_o === N_o || t.N_o === Number(N_o));
    if (tender) {
      setEditTender({ ...tender });
      setEditOpen(true);
    }
  };

  // Delete a tender by N_o
  const handleDelete = async (N_o) => {
    try {
      await axios.delete(`http://localhost:5000/api/tenders/${N_o}`);
      fetchTenders();
      setDeleteSuccess(true);
    } catch (err) {
      alert('Failed to delete tender.');
      console.error('Delete error:', err);
    }
  };

  // Handle delete click (open confirm dialog)
  const handleDeleteClick = (tender) => {
    setSelectedTenderId(tender.N_o);
    setConfirmOpen(true);
  };

  // Handle changes in the edit dialog fields
  const handleEditChange = (key, value) => {
    setEditTender((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handler for searching a tender to edit
  const handleEditSearch = async () => {
    if (!editSearch) {
      setEditSearchResult(null);
      setEditTender(null);
      setEditMode(false);
      return;
    }
    // Try to find in current tenders first (current page)
    let found = tenders.find(
      (t) =>
        (t.RefNum && t.RefNum.trim().toLowerCase() === editSearch.trim().toLowerCase()) ||
        (t.CompanyName && t.CompanyName.trim().toLowerCase() === editSearch.trim().toLowerCase())
    );
    if (found) {
      setEditSearchResult(found);
      setEditTender(found);
      setEditMode(true);
      return;
    }
    // If not found, fetch from backend (search all tenders)
    try {
      const params = new URLSearchParams();
      params.append('page', 1);
      params.append('pageSize', 1); // Only need one result
      params.append('search', editSearch);
      const res = await axios.get(`http://localhost:5000/api/tenders?${params.toString()}`);
      const tender = res.data.tenders && res.data.tenders.length > 0 ? res.data.tenders[0] : null;
      if (tender) {
        setEditSearchResult(tender);
        setEditTender(tender);
        setEditMode(true);
      } else {
        setEditSearchResult(null);
        setEditTender(null);
        setEditMode(false);
      }
    } catch (err) {
      setEditSearchResult(null);
      setEditTender(null);
      setEditMode(false);
    }
  };

  const handleEditComplete = () => {
    setEditMode(false);
    setEditTender(null);
    setEditSearch("");
    setEditSearchResult(null);
    fetchTenders();
  };

  return (
    <Box sx={{ display: "flex" }}>
      <SideNav selectedTab={selectedTab} onTabChange={handleTabChange} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)', minHeight: '100vh' }}>
        <Routes>
          <Route path="/add-tender" element={
            <Box>
              {/* Remove the outer Paper to avoid double card */}
              <AddTender
                editTender={editMode ? editTender : null}
                onEditComplete={handleEditComplete}
              />
            </Box>
          } />
          <Route path="/" element={
            <>
              {selectedTab === 'tenders' && (
                <>
                  <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 4, boxShadow: 8, maxWidth: 1200, mx: 'auto', mb: 4, background: 'linear-gradient(135deg, #f0f4f8 0%, #e0e7ef 100%)' }}>
                    <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#1e293b' }}>Available Tenders</Typography>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, mt: 1, gap: 2 }}>
                      <Button 
                        variant="contained" 
                        sx={{ minWidth: 160, fontWeight: 600, fontSize: 16, borderRadius: 2, boxShadow: 2, textTransform: 'none', letterSpacing: 1, backgroundColor: '#0ea5e9', color: '#fff', '&:hover': { backgroundColor: '#0369a1' } }}
                        onClick={() => navigate('/add-tender')}
                      >
                        Add Tender
                      </Button>
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                        <TextField
                          placeholder="Search..."
                          variant="outlined"
                          size="small"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          sx={{ width: { xs: '100%', sm: 220 }, background: '#f1f5f9', borderRadius: 2, boxShadow: 'none', border: 'none', '& .MuiOutlinedInput-root': { boxShadow: 'none', border: 'none', background: 'transparent' }, '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                          InputProps={{
                            endAdornment: (
                              <IconButton disabled>
                                <SearchIcon />
                              </IconButton>
                            ),
                          }}
                        />
                        <TextField
                          select
                          label="Filter by Tender Type"
                          value={tenderTypeFilter}
                          onChange={e => {
                            setTenderTypeFilter(e.target.value);
                            setFilters(prev => ({ ...prev, TenderType: e.target.value }));
                            setPage(0);
                          }}
                          sx={{ width: { xs: '100%', sm: 180 }, background: '#f1f5f9', borderRadius: 2 }}
                          size="small"
                          className="addTenderInput"
                        >
                          <MenuItem value="">All Types</MenuItem>
                          {tenderTypeOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Box>
                    <TableContainer sx={{ borderRadius: 3, boxShadow: 2, background: '#f8fafc' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                             {columns.map((col) => (
                               <TableCell key={col.key} sx={{ background: '#e0e7ef', color: '#334155', fontWeight: 600 }}>
                                 {col.sortable !== false ? (
                                   <TableSortLabel
                                     active={sortConfig.key === col.key}
                                     direction={
                                       sortConfig.key === col.key
                                         ? sortConfig.direction
                                         : "asc"
                                     }
                                     onClick={() => handleSort(col.key)}
                                     sx={{ color: '#334155', '& .MuiTableSortLabel-icon': { color: '#334155' } }}
                                   >
                                     <strong style={{ color: '#334155' }}>{col.label}</strong>
                                   </TableSortLabel>
                                 ) : (
                                   <strong style={{ color: '#334155' }}>{col.label}</strong>
                                 )}
                               </TableCell>
                             ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {processedTenders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={columns.length} align="center">
                                No matches found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            processedTenders.map((tender) => (
                              <TableRow key={tender.N_o} sx={{ '&:hover': { background: '#e0f2fe' } }}>
                                <TableCell>{tender.N_o}</TableCell>
                                <TableCell>{tender.CompanyName}</TableCell>
                                <TableCell>{tender.Description}</TableCell>
                                <TableCell>{tender.RefNum}</TableCell>
                                <TableCell>{tender.ClosingDateTime ? new Date(tender.ClosingDateTime).toLocaleString() : ''}</TableCell>
                                <TableCell>{tender.OpeningDateTime ? new Date(tender.OpeningDateTime).toLocaleString() : ''}</TableCell>
                                <TableCell>{tender.Region}</TableCell>
                                <TableCell>{tender.Amount?.toLocaleString()}</TableCell>
                                <TableCell>{tender.TenderType}</TableCell>
                                
                                <TableCell>
                                  <IconButton onClick={(e) => handleMenuOpen(e, tender.N_o)} sx={{ color: '#0ea5e9' }}>
                                    <MoreVertIcon />
                                  </IconButton>
                                  <Menu
                                    anchorEl={menuAnchorEl}
                                    open={Boolean(menuAnchorEl) && selectedTenderId === tender.N_o}
                                    onClose={handleMenuClose}
                                  >
                                    <MenuItem onClick={() => handleEdit(tender.N_o)}>
                                      <EditIcon fontSize="small" sx={{ mr: 1, color: '#0ea5e9' }} />
                                      Edit
                                    </MenuItem>
                                    <MenuItem onClick={() => handleDeleteClick(tender)}>
                                      <DeleteIcon fontSize="small" sx={{ mr: 1, color: '#ef4444' }} />
                                      Delete
                                    </MenuItem>
                                  </Menu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {/* Display count of items on this page */}
                <Typography variant="body2" sx={{ mt: 2, mb: 0, textAlign: 'right', color: '#64748b' }}>
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
                  sx={{ mt: 1, background: '#f1f5f9', borderRadius: 2 }}
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
              </Paper>
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
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)',
                        boxShadow: 8,
                        minWidth: 380,
                      },
                    }}
                  >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0, background: 'transparent' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#0ea5e922',
                        mr: 2,
                      }}>
                        <EditIcon sx={{ color: '#0ea5e9', fontSize: 32 }} />
                      </Box>
                      <Typography variant="h5" sx={{ color: '#0369a1', fontWeight: 700, letterSpacing: 1 }}>
                        Edit Tender
                      </Typography>
                      <IconButton
                        aria-label="close"
                        onClick={() => setEditOpen(false)}
                        sx={{
                          color: '#0369a1',
                          ml: 'auto',
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
                            label="Company Name"
                            fullWidth
                            variant="outlined"
                            value={editTender.CompanyName || ""}
                            onChange={(e) => handleEditChange("CompanyName", e.target.value)}
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
                          <TextField
                            margin="dense"
                            label="Reference Number"
                            fullWidth
                            variant="outlined"
                            value={editTender.RefNum || ""}
                            onChange={(e) => handleEditChange("RefNum", e.target.value)}
                          />
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                              margin="dense"
                              label="Closing Date and Time"
                              type="datetime-local"
                              fullWidth
                              variant="outlined"
                              InputLabelProps={{ shrink: true }}
                              value={
                                editTender.ClosingDateTime
                                  ? editTender.ClosingDateTime.slice(0, 16)
                                  : ""
                              }
                              onChange={(e) =>
                                handleEditChange("ClosingDateTime", e.target.value)
                              }
                            />
                            <TextField
                              margin="dense"
                              label="Opening Date and Time"
                              type="datetime-local"
                              fullWidth
                              variant="outlined"
                              InputLabelProps={{ shrink: true }}
                              value={
                                editTender.OpeningDateTime ? editTender.OpeningDateTime.slice(0, 16) : ""
                              }
                              onChange={(e) =>
                                handleEditChange("OpeningDateTime", e.target.value)
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
                            select
                            margin="dense"
                            label="Tender Type"
                            fullWidth
                            variant="outlined"
                            value={editTender.TenderType || ""}
                            onChange={(e) => handleEditChange("TenderType", e.target.value)}
                          >
                            {["National Competitive bid", "International Competitive Bid", "Goods", "Consultancy", "Non-consultancy", "Works"].map((option) => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      )}
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 2, px: 3 }}>
                      <Button
                        onClick={() => setEditOpen(false)}
                        variant="outlined"
                        sx={{ color: '#0369a1', borderColor: '#0ea5e9', fontWeight: 600, px: 4, borderRadius: 2, textTransform: 'none', fontSize: 16, mr: 2 }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditSave}
                        variant="contained"
                        sx={{ background: 'linear-gradient(90deg, #0ea5e9 0%, #0369a1 100%)', color: '#fff', fontWeight: 600, px: 4, borderRadius: 2, boxShadow: 2, textTransform: 'none', fontSize: 16, '&:hover': { background: '#0369a1' } }}
                        startIcon={<EditIcon />}
                      >
                        Save Changes
                      </Button>
                    </DialogActions>
                  </Dialog>
                  {/* Delete Confirmation Dialog */}
                  {/* Enhanced Confirm Delete Dialog */}
                  <Dialog open={confirmOpen} onClose={handleConfirmClose}
                    PaperProps={{
                      sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #fffbe6 0%, #f8fafc 100%)',
                        boxShadow: 8,
                        minWidth: 340,
                      },
                    }}
                  >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0, background: 'transparent' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#facc1522',
                        mr: 2,
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="12" fill="#facc15" fillOpacity="0.15"/>
                          <path d="M12 8v4m0 4h.01" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Box>
                      <Typography variant="h5" sx={{ color: '#b45309', fontWeight: 700, letterSpacing: 1 }}>
                        Confirm Delete
                      </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1, pb: 2 }}>
                      <DialogContentText sx={{ color: '#92400e', fontSize: 18, fontWeight: 500, textAlign: 'center', mb: 1 }}>
                        Are you sure you want to delete this tender?
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                      <Button onClick={handleConfirmClose} variant="outlined" sx={{ color: '#b45309', borderColor: '#facc15', fontWeight: 600, px: 4, borderRadius: 2, textTransform: 'none', fontSize: 16, mr: 2 }}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(90deg, #facc15 0%, #b45309 100%)',
                          color: '#fff',
                          fontWeight: 600,
                          px: 4,
                          borderRadius: 2,
                          boxShadow: 2,
                          textTransform: 'none',
                          fontSize: 16,
                          '&:hover': { background: '#b45309' },
                        }}
                      >
                        Delete
                      </Button>
                    </DialogActions>
                  </Dialog>
                  {/* Enhanced Delete Success Dialog */}
                  <Dialog open={deleteSuccess} onClose={handleDeleteSuccessClose}
                    PaperProps={{
                      sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #e0ffe8 0%, #f8fafc 100%)',
                        boxShadow: 8,
                        minWidth: 340,
                      },
                    }}
                  >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0, background: 'transparent' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#22c55e22',
                        mr: 2,
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="12" fill="#22c55e" fillOpacity="0.15"/>
                          <path d="M7 13.5L10.5 17L17 10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Box>
                      <Typography variant="h5" sx={{ color: '#15803d', fontWeight: 700, letterSpacing: 1 }}>
                        Delete Successful
                      </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1, pb: 2 }}>
                      <DialogContentText sx={{ color: '#166534', fontSize: 18, fontWeight: 500, textAlign: 'center', mb: 1 }}>
                        Tender was deleted successfully.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                      <Button onClick={handleDeleteSuccessClose} autoFocus variant="contained" sx={{ background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', color: '#fff', fontWeight: 600, px: 4, borderRadius: 2, boxShadow: 2, textTransform: 'none', fontSize: 16, '&:hover': { background: '#16a34a' } }}>OK</Button>
                    </DialogActions>
                  </Dialog>
                  {/* Enhanced Edit Success Dialog */}
                  <Dialog open={editSuccess} onClose={() => setEditSuccess(false)}
                    PaperProps={{
                      sx: {
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #e0ffe8 0%, #f8fafc 100%)',
                        boxShadow: 8,
                        minWidth: 340,
                      },
                    }}
                  >
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0, background: 'transparent' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#22c55e22',
                        mr: 2,
                      }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="12" fill="#22c55e" fillOpacity="0.15"/>
                          <path d="M7 13.5L10.5 17L17 10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Box>
                      <Typography variant="h5" sx={{ color: '#15803d', fontWeight: 700, letterSpacing: 1 }}>
                        Edit Successful
                      </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 1, pb: 2 }}>
                      <DialogContentText sx={{ color: '#166534', fontSize: 18, fontWeight: 500, textAlign: 'center', mb: 1 }}>
                        The tender was updated successfully.
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
                      <Button onClick={() => setEditSuccess(false)} color="primary" autoFocus variant="contained" sx={{ background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)', color: '#fff', fontWeight: 600, px: 4, borderRadius: 2, boxShadow: 2, textTransform: 'none', fontSize: 16, '&:hover': { background: '#16a34a' } }}>Close</Button>
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

