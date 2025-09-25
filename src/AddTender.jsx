import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Paper, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { useNavigate } from "react-router-dom";
import './App.css'; // Import the CSS file

const initialState = {
  RefNum: "",
  Description: "",
  OpeningDateTime: "",
  ClosingDateTime: "",
  Region: "",
  Amount: "",
  CompanyName: "",
  TenderType: "Goods", // Default value
};

const tenderTypeOptions = [
  "National Competitive bid",
  "International Competitive Bid",
  "Goods",
  "Consultancy",
  "Non-consultancy",
  "Works"
];


// Accept editTender and onEditComplete as props for edit mode
function AddTender({ editTender = null, onEditComplete }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (editTender) {
      setForm(editTender);
      setIsEditMode(true);
    } else {
      setForm(initialState);
      setIsEditMode(false);
    }
  }, [editTender]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:5000/api/tenders/${form.N_o}`, form);
        setSuccessDialogOpen(true);
        if (onEditComplete) onEditComplete();
      } else {
        await axios.post("http://localhost:5000/api/tenders", form);
        setSuccessDialogOpen(true);
        setForm(initialState); // Optionally reset form
      }
    } catch (err) {
      setError(err?.response?.data?.error || (isEditMode ? "Failed to update tender" : "Failed to add tender"));
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
  <Box className="addTenderMain" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)' }}>
      <Paper className="addTenderCard centerTenderCard">
        <Typography variant="h4" className="addTenderTitle">
          {isEditMode ? "Edit Tender" : "Add New Tender"}
        </Typography>
        <Typography variant="subtitle1" className="addTenderSubtitle">
          {isEditMode
            ? "Update the details below to edit this tender."
            : "Please fill in the details below to create a new tender."}
        </Typography>
        <form onSubmit={handleSubmit} className="addTenderForm" style={{ width: '100%', maxWidth: 520, margin: '0 auto', background: 'rgba(255,255,255,0.97)', borderRadius: 32, boxShadow: '0 4px 32px 0 rgba(16, 42, 67, 0.10)', padding: '48px 36px 36px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <TextField
            label="Reference Number"
            name="RefNum"
            value={form.RefNum}
            onChange={handleChange}
            fullWidth
            required
            className="addTenderInput"
          />
          <TextField
            label="Description"
            name="Description"
            value={form.Description}
            onChange={handleChange}
            fullWidth
            required
            className="addTenderInput"
          />
          <Box className="addTenderRow">
            <TextField
              label="Opening Date and Time"
              name="OpeningDateTime"
              type="datetime-local"
              value={form.OpeningDateTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              className="addTenderInput"
            />
            <TextField
              label="Closing Date and Time"
              name="ClosingDateTime"
              type="datetime-local"
              value={form.ClosingDateTime}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
              className="addTenderInput"
            />
          </Box>
          <Box className="addTenderRow">
            <TextField
              label="Region"
              name="Region"
              value={form.Region}
              onChange={handleChange}
              fullWidth
              required
              className="addTenderInput"
            />
            <TextField
              label="Amount"
              name="Amount"
              type="number"
              value={form.Amount}
              onChange={handleChange}
              fullWidth
              required
              className="addTenderInput"
            />
          </Box>
          <TextField
            label="Company Name"
            name="CompanyName"
            value={form.CompanyName}
            onChange={handleChange}
            fullWidth
            required
            className="addTenderInput"
          />
          <TextField
            select
            label="Tender Type"
            name="TenderType"
            value={form.TenderType}
            onChange={handleChange}
            fullWidth
            required
            className="addTenderInput"
          >
            {tenderTypeOptions.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          {error && (
            <></>
          )}
          {/* Enhanced Error Dialog */}
          <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffeaea 0%, #f8fafc 100%)',
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
                background: '#ef444422',
                mr: 2,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" fill="#ef4444" fillOpacity="0.15"/>
                  <path d="M8 8l8 8M16 8l-8 8" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Typography variant="h5" sx={{ color: '#b91c1c', fontWeight: 700, letterSpacing: 1 }}>
                Error
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ pt: 1, pb: 2 }}>
              <DialogContentText sx={{ color: '#991b1b', fontSize: 18, fontWeight: 500, textAlign: 'center', mb: 1 }}>
                {error}
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
              <Button
                onClick={() => setErrorDialogOpen(false)}
                autoFocus
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  px: 4,
                  borderRadius: 2,
                  boxShadow: 2,
                  textTransform: 'none',
                  fontSize: 16,
                  '&:hover': { background: '#b91c1c' },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
          {/* Enhanced Success Dialog */}
          <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: 4,
                background: 'linear-gradient(135deg, #e0ffe8 0%, #f8fafc 100%)',
                boxShadow: 8,
                minWidth: 340,
              },
            }}
          >
          </Dialog>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className="addTenderButton"
          >
            {loading ? "Saving..." : "Add Tender"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default AddTender;
