// src/app/cali_meter_dashboard/page.jsx
import CustomerList from "@/MainComponent/(SubComponents)/AdminComponent/CustomerList";
import ManagerDashboard from "@/MainComponent/(SubComponents)/AdminComponent/Manager-Dashboard";
import UserList from "@/MainComponent/UserList";

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <ManagerDashboard />
      <CustomerList />
      <UserList />
    </div>
  );
}