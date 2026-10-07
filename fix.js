const fs = require('fs');
const files = [
  "c:/Users/Asus Vivobook/Desktop/Adalat/Adalat_frontend-/src/pages/lawyer/LawyerDocumentsPage.jsx",
  "c:/Users/Asus Vivobook/Desktop/Adalat/Adalat_frontend-/src/pages/customer/CustomerProfilePage.jsx",
  "c:/Users/Asus Vivobook/Desktop/Adalat/Adalat_frontend-/src/pages/lawyer/LawyerConsultationsPage.jsx",
  "c:/Users/Asus Vivobook/Desktop/Adalat/Adalat_frontend-/src/pages/customer/CustomerPaymentsPage.jsx",
  "c:/Users/Asus Vivobook/Desktop/Adalat/Adalat_frontend-/src/pages/customer/CustomerConsultationPage.jsx",
  "c:/Users/Asus Vivobook/Desktop/Adalat/Adalat_frontend-/src/pages/admin/AdminVerificationsPage.jsx",
  "c:/Users/Asus Vivobook/Desktop/Adalat/Adalat_frontend-/src/pages/admin/AdminLawyersPage.jsx",
  "c:/Users/Asus Vivobook/Desktop/Adalat/Adalat_frontend-/src/pages/admin/AdminDashboardPage.jsx"
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.split('http://:8082').join('http://${window.location.hostname}:8082');
  fs.writeFileSync(f, content, 'utf8');
});
console.log('Fixed files');
