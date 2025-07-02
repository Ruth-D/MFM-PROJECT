// src/components/SideNav.js
import React from "react";
import {
  Drawer,
  Toolbar,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from '@mui/icons-material/Add';

const drawerWidth = 200;

const SideNav = () => {
  return (
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
              <AddIcon />
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
            &copy; {new Date().getFullYear()} Tender
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideNav;
