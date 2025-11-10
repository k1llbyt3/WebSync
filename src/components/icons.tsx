
import {
  type LucideIcon,
  LayoutDashboard,
  ListTodo,
  BookUser,
  Code2,
  Settings,
  Bot,
  Sparkles,
  ChevronLeft,
  PlusCircle,
  MoreVertical,
  Copy,
  Plus,
  Search,
  Users,
  Moon,
  Sun,
  Laptop,
  ChevronsUpDown,
  Check,
  LogOut,
  LogIn,
  Upload,
  Calendar,
  Bell,
  FileEdit,
  PanelLeft,
  FlaskConical,
  Trash2,
  XCircle,
} from 'lucide-react'

export type Icon = LucideIcon

const WorkSyncLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="logo-gradient-icon" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--secondary))" />
        </linearGradient>
      </defs>
      <path
        d="M17.5 9.00004C17.5 11.4853 15.4853 13.5 13 13.5C10.5147 13.5 8.5 11.4853 8.5 9.00004C8.5 6.51473 10.5147 4.50002 13 4.50002V13.5C10.5147 13.5 8.5 15.5147 8.5 18C8.5 20.4853 10.5147 22.5 13 22.5C15.4853 22.5 17.5 20.4853 17.5 18C17.5 15.5147 15.4853 13.5 13 13.5V4.50002C15.4853 4.50002 17.5 6.51473 17.5 9.00004ZM13 0.00012207C8.02944 0.00012207 4 4.02956 4 9.00012C4 13.9707 8.02944 18.0001 13 18.0001C13 15.2387 15.2386 13.0001 18 13.0001C20.7614 13.0001 23 10.7615 23 8.00012C23 5.23868 20.7614 3.00012 18 3.00012C18 1.47726 16.7761 0.250122 15.25 0.250122H13V0.00012207Z"
        fill="url(#logo-gradient-icon)"
      />
    </svg>
);


export const Icons = {
  dashboard: LayoutDashboard,
  tasks: ListTodo,
  meetings: BookUser,
  codegen: Code2,
  settings: Settings,
  bot: Bot,
  sparkles: Sparkles,
  chevronLeft: ChevronLeft,
  add: PlusCircle,
  plus: Plus,
  more: MoreVertical,
  copy: Copy,
  search: Search,
  users: Users,
  sun: Sun,
  moon: Moon,
  laptop: Laptop,
  logo: WorkSyncLogo,
  chevronsUpDown: ChevronsUpDown,
  check: Check,
  logout: LogOut,
  logIn: LogIn,
  upload: Upload,
  calendar: Calendar,
  bell: Bell,
  edit: FileEdit,
  panelLeft: PanelLeft,
  testTube: FlaskConical,
  trash: Trash2,
  close: XCircle,
}

    