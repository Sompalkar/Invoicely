import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Demo data for recent activity
const recentActivityData = [
  {
    id: 1,
    client: "Acme Inc.",
    initials: "AI",
    action: "Invoice #INV-2023-001 was paid",
    amount: 1250.0,
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    client: "Globex Corp",
    initials: "GC",
    action: "New invoice #INV-2023-002 created",
    amount: 3450.75,
    timestamp: "Yesterday",
  },
  {
    id: 3,
    client: "Wayne Enterprises",
    initials: "WE",
    action: "Invoice #INV-2023-003 is overdue",
    amount: 5600.0,
    timestamp: "3 days ago",
  },
  {
    id: 4,
    client: "Stark Industries",
    initials: "SI",
    action: "New client added",
    amount: null,
    timestamp: "1 week ago",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {recentActivityData.map((activity) => (
        <div className="flex items-center" key={activity.id}>
          <Avatar className="h-9 w-9 border border-purple-100 dark:border-purple-800/30">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
              {activity.initials}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.client}</p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <div className="ml-auto font-medium">{activity.amount ? `$${activity.amount.toFixed(2)}` : ""}</div>
        </div>
      ))}
    </div>
  )
}
