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
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItem button>
              <ListItemIcon sx={{ color: "#fff" }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button>
              <ListItemIcon sx={{ color: "#fff" }}>
                <ListAltIcon />
              </ListItemIcon>
              <ListItemText primary="Tenders" />
            </ListItem>
            <ListItem button>
              <ListItemIcon sx={{ color: "#fff" }}>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText primary="About" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h5" className="title">
          Available Tenders
        </Typography>
        {tenders.length === 0 ? (
          <Typography variant="body2" className="emptyText">
            No tenders available.
          </Typography>
        ) : (
          <>
            <TableContainer
              component={Paper}
              className="tableContainer"
              // sx={{
              //     maxWidth: 1000,
              //     margin: "0 auto",
              //     boxShadow: 2,
              //     borderRadius: 2,}}
            >
              <Table size="small">
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
              <MenuItem
                onClick={() => {
                  handleEdit(selectedTenderId);
                  handleMenuClose();
                }}
              >
                <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
              </MenuItem>
              <MenuItem onClick={handleDeleteClick}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
              </MenuItem>
            </Menu>
            <Dialog
              open={confirmOpen}
              onClose={handleConfirmClose}
            >
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this tender?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleConfirmClose}>Cancel</Button>
                <Button onClick={handleConfirmDelete} color="error" variant="contained">
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
