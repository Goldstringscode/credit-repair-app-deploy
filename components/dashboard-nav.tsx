import { MessageNotification } from "@/components/messaging/message-notification"

const DashboardNav = () => {
  return (
    <nav>
      <ul>
        <li>Dashboard</li>
        <li>Settings</li>
        <li>
          Notifications <MessageNotification />
        </li>
      </ul>
    </nav>
  )
}

export default DashboardNav
