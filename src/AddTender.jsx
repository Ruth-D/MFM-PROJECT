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
    <Box component="main" sx={{ flexGrow: 1, width: '100%', minHeight: 'calc(100vh - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 0, m: 0 }}>
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4, width: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Add New Tender
        </Typography>
  <form onSubmit={handleSubmit} style={{ maxWidth: 600, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TextField
            label="Reference Number"
            name="RefNum"
            value={form.RefNum}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            name="Description"
            value={form.Description}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Start Date"
              name="StartDate"
              type="date"
              value={form.StartDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
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
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              label="Region"
              name="Region"
              value={form.Region}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Amount"
              name="Amount"
              type="number"
              value={form.Amount}
              onChange={handleChange}
              fullWidth
              required
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
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ minWidth: 140 }}
          >
            {loading ? "Saving..." : "Add Tender"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default AddTender;
