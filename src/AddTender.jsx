import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./App.css";

const initialState = {
  RefNum: "",
  Description: "",
  OpeningDateTime: "",
  ClosingDateTime: "",
  Region: "",
  Amount: "",
  CompanyName: "",
  TenderType: "Goods",
};

const tenderTypeOptions = [
  "National Competitive bid",
  "International Competitive Bid",
  "Goods",
  "Consultancy",
  "Non-consultancy",
  "Works",
];

function AddTender({ editTender = null, onEditComplete }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("add");
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (editTender) {
      setForm(editTender);
      setIsEditMode(true);
      setMode("edit");
    } else {
      setForm(initialState);
      setIsEditMode(false);
      setMode("add");
    }
  }, [editTender]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResult(null);
      setIsEditMode(false);
      setForm(initialState);
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append("search", searchTerm.trim());
      const res = await axios.get(
        `http://localhost:5000/api/tenders?${params.toString()}&page=1&pageSize=1000`
      );
      let found = null;
      if (res.data.tenders && res.data.tenders.length > 0) {
        found = res.data.tenders.find(
          (t) =>
            (t.RefNum &&
              t.RefNum.trim().toLowerCase() ===
                searchTerm.trim().toLowerCase()) ||
            (t.CompanyName &&
              t.CompanyName.trim().toLowerCase() ===
                searchTerm.trim().toLowerCase())
        );
      }
      if (found) {
        setSearchResult(found);
        setForm({
          RefNum: found.RefNum || "",
          Description: found.Description || "",
          OpeningDateTime: found.OpeningDateTime
            ? found.OpeningDateTime.slice(0, 16)
            : "",
          ClosingDateTime: found.ClosingDateTime
            ? found.ClosingDateTime.slice(0, 16)
            : "",
          Region: found.Region || "",
          Amount: found.Amount || "",
          CompanyName: found.CompanyName || "",
          TenderType: found.TenderType || "Goods",
          N_o: found.N_o,
        });
        setIsEditMode(true);
      } else {
        setSearchResult(null);
        setIsEditMode(false);
        setForm(initialState);
      }
    } catch (err) {
      setSearchResult(null);
      setIsEditMode(false);
      setForm(initialState);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "edit" && isEditMode) {
        await axios.put(`http://localhost:5000/api/tenders/${form.N_o}`, form);
        if (onEditComplete) onEditComplete();
      } else {
        await axios.post("http://localhost:5000/api/tenders", form);
        setForm(initialState);
      }
      alert("Tender saved successfully!");
    } catch (err) {
      alert(
        err?.response?.data?.error ||
          (isEditMode ? "Failed to update tender" : "Failed to add tender")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addTenderMain">
      <div className="centerTenderCard">
        {/* Toggle buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
            gap: 2,
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <Button
            variant={mode === "add" ? "contained" : "outlined"}
            onClick={() => {
              setMode("add");
              setIsEditMode(false);
              setForm(initialState);
              setSearchTerm("");
              setSearchResult(null);
            }}
            sx={{
              flex: 1,
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 3,
              textTransform: "none",
              backgroundColor: mode === "add" ? "#0ea5e9" : "#e0e7ef",
              color: mode === "add" ? "#fff" : "#334155",
              "&:hover": { backgroundColor: "#0369a1", color: "#fff" },
            }}
          >
            Add Tender
          </Button>
          <Button
            variant={mode === "edit" ? "contained" : "outlined"}
            onClick={() => {
              setMode("edit");
              setIsEditMode(false);
              setForm(initialState);
              setSearchTerm("");
              setSearchResult(null);
            }}
            sx={{
              flex: 1,
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 3,
              textTransform: "none",
              backgroundColor: mode === "edit" ? "#0ea5e9" : "#e0e7ef",
              color: mode === "edit" ? "#fff" : "#334155",
              "&:hover": { backgroundColor: "#0369a1", color: "#fff" },
            }}
          >
            Edit Tender
          </Button>
        </Box>

        {/* Search bar in edit mode */}
        {mode === "edit" && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
              justifyContent: "center",
              background: "#f9fafb",
              borderRadius: 2,
              p: 2,
              boxShadow: 1,
              width: "100%",
            }}
          >
            <TextField
              label="Search by Ref. No or Company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                minWidth: 220,
                background: "#fff",
                borderRadius: 2,
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                height: 40,
                fontWeight: 700,
                fontSize: 15,
                borderRadius: 2,
                backgroundColor: "#0ea5e9",
                color: "#fff",
                textTransform: "none",
                "&:hover": { backgroundColor: "#0369a1" },
              }}
            >
              Search
            </Button>
            {searchTerm && !searchResult && (
              <Typography
                sx={{ color: "red", width: "100%", textAlign: "center" }}
              >
                No tender found.
              </Typography>
            )}
            {searchResult && (
              <Typography
                sx={{ color: "green", width: "100%", textAlign: "center" }}
              >
                Tender found. You can edit below.
              </Typography>
            )}
          </Box>
        )}

        {/* Form Card */}
        <Paper elevation={6} className="addTenderCard">
          <Typography
            variant="h5"
            sx={{ mb: 2, fontWeight: 700, textAlign: "center" }}
          >
            {mode === "edit" ? "Edit Tender" : "Add New Tender"}
          </Typography>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
              alignItems: "center",
            }}
          >
            <TextField
              label="Reference Number"
              name="RefNum"
              value={form.RefNum}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Description"
              name="Description"
              value={form.Description}
              onChange={handleChange}
              fullWidth
              required
            />
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", width: "100%" }}>
              <TextField
                label="Opening Date"
                name="OpeningDateTime"
                type="datetime-local"
                value={form.OpeningDateTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Closing Date"
                name="ClosingDateTime"
                type="datetime-local"
                value={form.ClosingDateTime}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", width: "100%" }}>
              <TextField
                label="Region"
                name="Region"
                value={form.Region}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Amount"
                name="Amount"
                type="number"
                value={form.Amount}
                onChange={handleChange}
                fullWidth
              />
            </Box>
            <TextField
              label="Company Name"
              name="CompanyName"
              value={form.CompanyName}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              select
              label="Tender Type"
              name="TenderType"
              value={form.TenderType}
              onChange={handleChange}
              fullWidth
            >
              {tenderTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 3,
                textTransform: "none",
                backgroundColor: "#0ea5e9",
                color: "#fff",
                "&:hover": { backgroundColor: "#0369a1" },
              }}
            >
              {loading
                ? "Saving..."
                : mode === "edit" && isEditMode
                ? "Save Changes"
                : "Add Tender"}
            </Button>
          </form>
        </Paper>
      </div>
    </div>
  );
}

export default AddTender;
