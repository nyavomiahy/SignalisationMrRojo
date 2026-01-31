import MapViewLogged from "../components/MapViewLogged";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  return <MapViewLogged onLogout={onLogout} />;
}

export default Dashboard;
