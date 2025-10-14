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
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddIcon from '@mui/icons-material/Add';

const drawerWidth = 200;

const SideNav = ({ selectedTab, onTabChange }) => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          background: 'linear-gradient(135deg, #1a2e3b 0%, #213d50 100%)',
          color: "#e0f2fe",
          borderRight: "none",
          boxShadow: '0 4px 24px 0 rgba(16, 42, 67, 0.10)',
          borderRadius: '0 24px 24px 0',
          position: 'relative',
          overflow: 'hidden',
        },
      }}
    >
      <Toolbar
        sx={{
          minHeight: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: 'linear-gradient(90deg, #1a2e3b 0%, #213d50 100%)',
          mb: 1,
          borderBottom: '1px solid #29506a',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #0ea5e9 0%, #29506a 100%)',
            boxShadow: '0 2px 8px 0 #0ea5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img src="/vite.svg" alt="Logo" style={{ width: 24, height: 24, borderRadius: 2 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: 1, color: '#38bdf8', fontFamily: 'Montserrat, sans-serif', fontSize: 18 }}
          >
            Tenders
          </Typography>
        </Box>
      </Toolbar>
      <Box sx={{ overflow: "auto", px: 2, pt: 2 }}>
        <List>
          <ListItem
            button
            selected={selectedTab === 'tenders'}
            onClick={() => onTabChange('tenders')}
            sx={{
              borderRadius: 3,
              mb: 1,
              background: selectedTab === 'tenders' ? 'linear-gradient(90deg, #0ea5e9 0%, #213d50 100%)' : 'rgba(255,255,255,0.04)',
              boxShadow: selectedTab === 'tenders' ? '0 2px 8px 0 #0ea5e9' : 'none',
              color: selectedTab === 'tenders' ? '#fff' : '#e0f2fe',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 0.5,
              transition: 'all 0.2s',
              '&:hover': { background: 'linear-gradient(90deg, #38bdf8 0%, #213d50 100%)', color: '#fff' },
            }}
          >
            <ListItemIcon sx={{ color: selectedTab === 'tenders' ? '#38bdf8' : '#e0f2fe', minWidth: 32 }}>
              <ListAltIcon />
            </ListItemIcon>
            <ListItemText
              primary="Tenders"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}
            />
          </ListItem>
          <ListItem
            button
            selected={selectedTab === 'add'}
            onClick={() => onTabChange('add')}
            sx={{
              borderRadius: 3,
              mb: 1,
              background: selectedTab === 'add' ? 'linear-gradient(90deg, #0ea5e9 0%, #213d50 100%)' : 'rgba(255,255,255,0.04)',
              boxShadow: selectedTab === 'add' ? '0 2px 8px 0 #0ea5e9' : 'none',
              color: selectedTab === 'add' ? '#fff' : '#e0f2fe',
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: 0.5,
              transition: 'all 0.2s',
              '&:hover': { background: 'linear-gradient(90deg, #38bdf8 0%, #213d50 100%)', color: '#fff' },
            }}
          >
            <ListItemIcon sx={{ color: selectedTab === 'add' ? '#38bdf8' : '#e0f2fe', minWidth: 32 }}>
              <AddIcon />
            </ListItemIcon>
            <ListItemText
              primary="Add New Tender"
              primaryTypographyProps={{ fontSize: 15, fontWeight: 600, fontFamily: 'Montserrat, sans-serif' }}
            />
          </ListItem>
        </List>
        <Box
          sx={{
            borderTop: '1px solid #29506a',
            mt: 2,
            pt: 2,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 3,
            boxShadow: '0 2px 8px 0 rgba(16, 42, 67, 0.10)',
          }}
        >
          <Typography variant="caption" sx={{ color: '#38bdf8', fontWeight: 600, letterSpacing: 0.5, fontFamily: 'Montserrat, sans-serif' }}>
            &copy; {new Date().getFullYear()} Tender System
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default SideNav;
