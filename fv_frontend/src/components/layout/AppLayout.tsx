import { Outlet } from 'react-router-dom';
import TopNavBar from './TopNavBar';

export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopNavBar />
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
