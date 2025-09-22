import React, { useState } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";

const initialState = {
  RefNum: "",
  Description: "",
  StartDate: "",
  EndDate: "",
  Region: "",
  Amount: "",
  Remark: "",
};

function AddTender() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:5000/api/tenders", form);
      navigate("/available-tenders");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to add tender");
    } finally {
      setLoading(false);
    }
  };

  return (
  <Box
  component="main"
  sx={{
    flexGrow: 1,
    p: { xs: 1, sm: 3 },
    background: "linear-gradient(135deg, #f7fafc 0%, #e3f0ff 100%)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",   // horizontally centers the content
    alignItems: "flex-start"    // vertically aligns to the top
  }}
>
  <Paper
    elevation={6}
    sx={{
      p: { xs: 2, sm: 4 },
      borderRadius: 4,
      boxShadow: 8,
      maxWidth: 600,    // Adjust width so it doesn’t stretch too wide
      width: "100%",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      mx: "auto"        // Ensures horizontal centering
    }}
  >
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#18471a' }}>
          Add New Tender
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 3, color: 'text.secondary', textAlign: 'center' }}>
          Please fill in the details below to create a new tender.
        </Typography>
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TextField
            label="Reference Number"
            name="RefNum"
            value={form.RefNum}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2, background: '#f5f7fa', borderRadius: 2 }}
          />
          <TextField
            label="Description"
            name="Description"
            value={form.Description}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2, background: '#f5f7fa', borderRadius: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2, width: '100%' }}>
            <TextField
              label="Start Date"
              name="StartDate"
              type="date"
              value={form.StartDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              sx={{ background: '#f5f7fa', borderRadius: 2 }}
            />
            <TextField
              label="End Date"
              name="EndDate"
              type="date"
              value={form.EndDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              sx={{ background: '#f5f7fa', borderRadius: 2 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, width: '100%' }}>
            <TextField
              label="Region"
              name="Region"
              value={form.Region}
              onChange={handleChange}
              fullWidth
              required
              sx={{ background: '#f5f7fa', borderRadius: 2 }}
            />
            <TextField
              label="Amount"
              name="Amount"
              type="number"
              value={form.Amount}
              onChange={handleChange}
              fullWidth
              required
              sx={{ background: '#f5f7fa', borderRadius: 2 }}
            />
          </Box>
          <TextField
            label="Remark"
            name="Remark"
            value={form.Remark}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2, background: '#f5f7fa', borderRadius: 2 }}
          />
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              minWidth: 160,
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 2,
              mt: 1,
              boxShadow: 2,
              textTransform: 'none',
              letterSpacing: 1,
              backgroundColor: '#2e8b57',
              '&:hover': { backgroundColor: '#41753f' }
            }}
          >
            {loading ? "Saving..." : "Add Tender"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default AddTender;
