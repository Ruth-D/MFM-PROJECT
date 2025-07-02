import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function EditTender({
  open,
  onClose,
  tender,
  onChange,
  onSave,
}) {
  if (!tender) return null;

  return React.createElement(
    Dialog,
    {
      open: open,
      onClose: onClose,
      maxWidth: "sm",
      fullWidth: true,
      PaperProps: {
        sx: {
          borderRadius: 3,
          background: "#f7fbfc",
          boxShadow: 8,
        },
      },
    },
    [
      React.createElement(
        DialogTitle,
        {
          key: "title",
          sx: {
            background: "#213d50",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: 1,
            pb: 2,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          },
        },
        [
          React.createElement(EditIcon, { sx: { mr: 1 }, key: "icon" }),
          "Edit Tender",
        ]
      ),
      React.createElement(
        DialogContent,
        { key: "content", sx: { pt: 3 } },
        React.createElement(
          Box,
          {
            component: "form",
            sx: {
              display: "flex",
              flexDirection: "column",
              gap: 2,
            },
          },
          [
            React.createElement(TextField, {
              key: "refnum",
              margin: "dense",
              label: "Reference Number",
              fullWidth: true,
              variant: "outlined",
              value: tender.RefNum || "",
              onChange: (e) => onChange("RefNum", e.target.value),
            }),
            React.createElement(TextField, {
              key: "desc",
              margin: "dense",
              label: "Description",
              fullWidth: true,
              variant: "outlined",
              value: tender.Description || "",
              onChange: (e) => onChange("Description", e.target.value),
            }),
            React.createElement(
              Box,
              { key: "dates", sx: { display: "flex", gap: 2 } },
              [
                React.createElement(TextField, {
                  key: "start",
                  margin: "dense",
                  label: "Start Date",
                  type: "date",
                  fullWidth: true,
                  variant: "outlined",
                  InputLabelProps: { shrink: true },
                  value: tender.StartDate ? tender.StartDate.slice(0, 10) : "",
                  onChange: (e) => onChange("StartDate", e.target.value),
                }),
                React.createElement(TextField, {
                  key: "end",
                  margin: "dense",
                  label: "End Date",
                  type: "date",
                  fullWidth: true,
                  variant: "outlined",
                  InputLabelProps: { shrink: true },
                  value: tender.EndDate ? tender.EndDate.slice(0, 10) : "",
                  onChange: (e) => onChange("EndDate", e.target.value),
                }),
              ]
            ),
            React.createElement(
              Box,
              { key: "regionamount", sx: { display: "flex", gap: 2 } },
              [
                React.createElement(TextField, {
                  key: "region",
                  margin: "dense",
                  label: "Region",
                  fullWidth: true,
                  variant: "outlined",
                  value: tender.Region || "",
                  onChange: (e) => onChange("Region", e.target.value),
                }),
                React.createElement(TextField, {
                  key: "amount",
                  margin: "dense",
                  label: "Amount",
                  type: "number",
                  fullWidth: true,
                  variant: "outlined",
                  value: tender.Amount || "",
                  onChange: (e) => onChange("Amount", e.target.value),
                }),
              ]
            ),
            React.createElement(TextField, {
              key: "remark",
              margin: "dense",
              label: "Remark",
              fullWidth: true,
              variant: "outlined",
              multiline: true,
              minRows: 2,
              value: tender.Remark || "",
              onChange: (e) => onChange("Remark", e.target.value),
            }),
          ]
        )
      ),
      React.createElement(
        DialogActions,
        { key: "actions", sx: { px: 3, pb: 2 } },
        [
          React.createElement(
            Button,
            {
              key: "cancel",
              onClick: onClose,
              variant: "outlined",
              color: "inherit",
            },
            "Cancel"
          ),
          React.createElement(
            Button,
            {
              key: "save",
              onClick: onSave,
              variant: "contained",
              color: "primary",
              sx: { boxShadow: 2 },
              startIcon: React.createElement(EditIcon, null),
            },
            "Save Changes"
          ),
        ]
      ),
    ]
  );
}