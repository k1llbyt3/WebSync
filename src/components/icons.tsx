
import { cn } from "@/lib/utils"
import Image from 'next/image'
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
  Eye,
  ListChecks,
  Inbox,
  Target,
  Wand2,
  ChevronDown,
} from 'lucide-react'

export type Icon = LucideIcon

const WorkSyncLogo = (props: React.HTMLAttributes<HTMLDivElement> & { className?: string }) => (
  <div className={cn("relative h-10 w-10", props.className)} style={{ display: 'inline-flex', alignItems: 'center' }}>
    <Image
      src="/s-logo.png"
      alt="S Logo"
      fill
      className="object-contain" // Use fill + object-contain for flexible sizing via className
      priority
    />
  </div>
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
  eye: Eye,
  listChecks: ListChecks,
  inbox: Inbox,
  target: Target,
  wand: Wand2,
  chevronDown: ChevronDown,
}
