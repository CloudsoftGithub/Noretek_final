import CustomerList from "@/MainComponent/(SubComponents)/AdminComponent/CustomerList";
import ManagerDashboard from "@/MainComponent/(SubComponents)/AdminComponent/Manager-Dashboard";
import UserList from "@/MainComponent/UserList";

export default function AminDashboard() {
  return (
    <>
      <ManagerDashboard />
      <CustomerList />
      <UserList />
    </>
  );
}
