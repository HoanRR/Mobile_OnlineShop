/**
 * Products Page JavaScript
 * Handles products page initialization and common functionality
 */

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  initCommonUI();
  displayCurrentDate();
  highlightActivePage();
  setupLogout();
  console.log('Products page loaded successfully');
});
