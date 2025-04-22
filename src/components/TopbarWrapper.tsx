import { Topbar } from './Topbar'

const mockUser = {
  name: "Bartosz Rolnik",
  email: "bartosz.rolnik@accenture.com"
}

export function TopbarWrapper() {
  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked')
  }

  return <Topbar user={mockUser} onLogout={handleLogout} />
} 