export type IconName = "/FaHome" | "/FaStar" | "/FaBriefcaseMedical" | "/FaUser" |"/FaStethoscope" | "/FaChat" | "/FaCalendarPlus2" | "/FaHousePlus" | "/FaPlus" | "/FaPill" | "/FaNewspaper"|"/FaMessage" |"/FaBed";

export const navLinks :{label: string; route: string; icon: IconName }[] = [
  {
    label: 'Home',
    route: '/home',
    icon: '/FaHome',
  },
  {
    label: 'Health Calendar',
    route: '/health-calendar',
    icon: '/FaCalendarPlus2',
  },  
  {
    label: 'Care Finder',
    route: '/care-finder',
    icon: '/FaHousePlus',
  },
  {
    label: 'Hospital Capacity',
    route: '/ICUbeds',
    icon: '/FaBed',
  },
  {
    label: 'Community updates',
    route: '/Community-update',
    icon: '/FaMessage',
  },
  {
    label: 'Health Connect',
    route: '/health-connect',
    icon: '/FaStethoscope',
  },
  {
    label: 'MedInfo',
    route: '/medinfo',
    icon: '/FaPill',
  },
  {
    label: 'Inventory',
    route: '/resources',
    icon: '/FaPlus',
  },
  
];
