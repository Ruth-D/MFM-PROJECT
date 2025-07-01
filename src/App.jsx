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
  ListItemIcon,
  ListItemText,
  Toolbar,
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
import TablePagination from "@mui/material/TablePagination";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InfoIcon from "@mui/icons-material/Info";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";

const drawerWidth = 200;

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
  const [editOpen, setEditOpen] = useState(false);
  const [editTender, setEditTender] = useState(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchTenders = () => {
    axios
      .get("http://localhost:5000/api/tenders")
      .then((response) => setTenders(response.data))
      .catch((error) => console.error("Error fetching tenders:", error));
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tenders/${id}`);
      fetchTenders();
    } catch (error) {
      console.error("Error deleting tender:", error);
    }
  };

  const handleEdit = (id) => {
    const tender = tenders.find((t) => t.id === id);
    setEditTender({ ...tender });
    setEditOpen(true);
    handleMenuClose();
  };

  // Handle changes in edit form
  const handleEditChange = (key, value) => {
    setEditTender((prev) => ({ ...prev, [key]: value }));
  };

  // Save edited tender
  const handleEditSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/tenders/${editTender.id}`,
        editTender
      );
      setEditOpen(false);
      setEditTender(null);
      fetchTenders();
    } catch (error) {
      console.error("Error updating tender:", error);
    }
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
    { key: "Actions", label: "Actions", filterable: false },
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

    if (searchTerm.trim() !== "") {
      data = data.filter((item) => {
        // Convert all values to string, including formatted dates
        return Object.entries(item)
          .map(([key, value]) => {
            if (
              key.toLowerCase().includes("date") &&
              value &&
              !isNaN(new Date(value))
            ) {
              // Format date as string (e.g., MM/DD/YYYY)
              return new Date(value).toLocaleDateString();
            }
            return String(value ?? "");
          })
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
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
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  };

  const processedTenders = getProcessedData();

  const regionOptions = [
    ...new Set(tenders.map((t) => t.Region).filter(Boolean)),
  ];
  const descriptionOptions = [
    ...new Set(tenders.map((t) => t.Description).filter(Boolean)),
  ];

  const handleMenuOpen = (event, id) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTenderId(id);
  };
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTenderId(null);
  };

  // Dialog handlers
  const handleDeleteClick = () => {
    setConfirmOpen(true);
    handleMenuClose();
  };
  const handleConfirmClose = () => {
    setConfirmOpen(false);
    setSelectedTenderId(null);
  };
  const handleConfirmDelete = async () => {
    if (selectedTenderId) {
      await handleDelete(selectedTenderId);
    }
    setConfirmOpen(false);
    setSelectedTenderId(null);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Side Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "#213d50",
            color: "#fff",
            borderRight: "none",
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#1a2e3b",
            mb: 1,
          }}
        >
          {/* Logo or App Name */}
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Tenders
          </Typography>
        </Toolbar>
        <Box sx={{ overflow: "auto", px: 1 }}>
          <List>
            <ListItem
              button
              sx={{
                borderRadius: 2,
                mb: 1,
                "&:hover": { background: "#29506a" },
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Home"
                primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
              />
            </ListItem>
            <ListItem
              button
              sx={{
                borderRadius: 2,
                mb: 1,
                "&:hover": { background: "#29506a" },
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>
                <ListAltIcon />
              </ListItemIcon>
              <ListItemText
                primary="Tenders"
                primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
              />
            </ListItem>
            <ListItem
              button
              sx={{
                borderRadius: 2,
                mb: 1,
                "&:hover": { background: "#29506a" },
              }}
            >
              <ListItemIcon sx={{ color: "#fff", minWidth: 36 }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="Add New Tender"
                primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
              />
            </ListItem>
          </List>
          <Box
            sx={{
              borderTop: "1px solid #29506a",
              mt: 2,
              pt: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="caption" sx={{ color: "#b0bec5" }}>
              &copy; {new Date().getFullYear()} MFM
            </Typography>
          </Box>
        </Box>
      </Drawer>
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" className="title">
          Available Tenders
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <TextField
            placeholder="Search all records..."
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
        {tenders.length === 0 ? (
          <Typography variant="body2" className="emptyText">
            No tenders available.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} className="tableContainer">
              <Table size="small">
                <TableHead
                  className="tableHead"
                  sx={{
                    backgroundColor: "#213d50",
                    "& th": { color: "#fff" },
                  }}
                >
                  <TableRow>
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
                                ? regionOptions
                                : descriptionOptions
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
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, tender.id)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => handleEdit(selectedTenderId)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
              <MenuItem onClick={handleDeleteClick}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
              </MenuItem>
            </Menu>
            <Dialog
              open={editOpen}
              onClose={() => setEditOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Edit Tender</DialogTitle>
              <DialogContent>
                {editTender && (
                  <>
                    <TextField
                      margin="dense"
                      label="Reference Number"
                      fullWidth
                      value={editTender.RefNum || ""}
                      onChange={(e) =>
                        handleEditChange("RefNum", e.target.value)
                      }
                    />
                    <TextField
                      margin="dense"
                      label="Description"
                      fullWidth
                      value={editTender.Description || ""}
                      onChange={(e) =>
                        handleEditChange("Description", e.target.value)
                      }
                    />
                    <TextField
                      margin="dense"
                      label="Start Date"
                      type="date"
                      fullWidth
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
                      InputLabelProps={{ shrink: true }}
                      value={
                        editTender.EndDate
                          ? editTender.EndDate.slice(0, 10)
                          : ""
                      }
                      onChange={(e) =>
                        handleEditChange("EndDate", e.target.value)
                      }
                    />
                    <TextField
                      margin="dense"
                      label="Region"
                      fullWidth
                      value={editTender.Region || ""}
                      onChange={(e) =>
                        handleEditChange("Region", e.target.value)
                      }
                    />
                    <TextField
                      margin="dense"
                      label="Amount"
                      type="number"
                      fullWidth
                      value={editTender.Amount || ""}
                      onChange={(e) =>
                        handleEditChange("Amount", e.target.value)
                      }
                    />
                    <TextField
                      margin="dense"
                      label="Remark"
                      fullWidth
                      value={editTender.Remark || ""}
                      onChange={(e) =>
                        handleEditChange("Remark", e.target.value)
                      }
                    />
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleEditSave}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
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
            <TablePagination
              component="div"
              count={processedTenders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              // sx={{ maxWidth: 800, margin: "0 auto" }}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

export default App;
