export type IconName =
  | "/FaHome"
  | "/LibraryBig"
  | "/NotebookPen"
  | "/GraduationCap"
  | "/Zap"
  | "/LayoutDashboard"
  | "/Info"
  | "/BookOpen"
  | "/Mail"
  | "/Newspaper"
  | "/Users";

export const homeNavLinks: { label: string; route: string; icon: IconName }[] = [
  {
    label: "Dashboard",
    route: "/dashboard",
    icon: "/LayoutDashboard",
  },
  {
    label: "About Us",
    route: "/about",
    icon: "/Info",
  },
  {
    label: "Courses",
    route: "/courses",
    icon: "/GraduationCap",
  },
  {
    label: "Mentorship",
    route: "/mentors",
    icon: "/Users",
  },
  {
    label: "CUET Syllabus",
    route: "/cuet-syllabus",
    icon: "/BookOpen",
  },
  {
    label: "Contact Us",
    route: "/contact",
    icon: "/Mail",
  },
];

export const dashboardNavLinks: {
  label: string;
  route: string;
  icon: IconName;
}[] = [
  {
    label: "Home",
    route: "/",
    icon: "/FaHome",
  },
  {
    label: "Dashboard",
    route: "/dashboard",  
    icon: "/LayoutDashboard",
  },
  {
    label: "Study Materials",
    route: "/dashboard/study-materials",
    icon: "/LibraryBig",
  },
  {
    label: "Quiz",
    route: "/dashboard/quiz",
    icon: "/NotebookPen",
  },
  {
    label: "Flash Cards",
    route: "/dashboard/flashcards",
    icon: "/Zap",
  },
  {
    label: "Question Banks",
    route: "/dashboard/question-banks",
    icon: "/BookOpen",
  },
  {
    label: "Blogs",
    route: "/dashboard/blogs",
    icon: "/Newspaper",
  }
];
