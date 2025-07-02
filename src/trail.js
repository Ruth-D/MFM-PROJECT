import React, { useEffect, useState } from "react";
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
  const [editOpen, setEditOpen] = useState(false);
  const [editTender, setEditTender] = useState(null);

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

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tenders/${id}`);
      fetchTenders();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleEdit = (N_o) => {
    const tender = tenders.find((t) => t.N_o === N_o);
    setEditTender({ ...tender });
    setEditOpen(true);
    handleMenuClose();
  };

  const handleEditChange = (key, value) => {
    setEditTender((prev) => ({ ...prev, [key]: value }));
  };

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

  const handleConfirmClose = () => setConfirmOpen(false);

  const handleConfirmDelete = async () => {
    if (selectedTenderId) await handleDelete(selectedTenderId);
    setConfirmOpen(false);
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
            <TableHead
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

        {/* Menu */}
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
         {/* Edit Confirmation Dialog */}
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
            }}
          >
            <EditIcon sx={{ mr: 1 }} />
            Edit Tender
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
      </Box>
    </Box>
  );
}

export default App;



app.put('/api/tenders/:N_o', async (req, res) => {
  try {
    const { N_o } = req.params;
    const [updated] = await Tender.update(req.body, {
      where: { N_o }
    });
    if (updated) {
      const updatedTender = await Tender.findByPk(N_o);
      return res.json(updatedTender);
    }
    res.status(404).json({ error: 'Tender not found' });
  } catch (err) {
    console.error('Error updating tender:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});