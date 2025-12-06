import React, { useState } from "react";
import {
  Home,
  Users,
  Inbox,
  Settings,
  FileText,
  ChevronDown,
  Circle,
} from "lucide-react";

const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState("Services");
  const [activeSubmenu, setActiveSubmenu] = useState("Proforma Invoices");

  const menuItems = [
    { icon: Home, label: "Dashboard", hasSubmenu: false },
    { icon: Users, label: "Nexus", hasSubmenu: false },
    { icon: Inbox, label: "Intake", hasSubmenu: false },
    {
      icon: Settings,
      label: "Services",
      hasSubmenu: true,
      submenu: ["Pre-active", "Active", "Blocked", "Closed"],
    },
    {
      icon: FileText,
      label: "Invoices",
      hasSubmenu: true,
      submenu: ["Proforma Invoices", "Final Invoices"],
    },
  ];

  const toggleSubmenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <div className="w-64 bg-[#F4F5F7] text-black/80 h-screen fixed left-0 top-0 overflow-y-auto shadow-sm">
      {/* Logo/Brand */}
      <div className="p-4">
        <div className="flex items-center gap-3 border bg-white p-2 rounded-lg shadow-sm">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <div>
            <div className="font-semibold text-sm">Vault</div>
            <div className="text-xs text-gray-500">Anurag Yadav</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="px-3 space-y-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            <div
              onClick={() => item.hasSubmenu && toggleSubmenu(item.label)}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition 
                ${
                  expandedMenu === item.label
                    ? "bg-white shadow-sm"
                    : "hover:bg-gray-200"
                }
              `}
            >
              <item.icon className="w-5 h-5 text-gray-700" />
              <span className="flex-1 text-sm">{item.label}</span>
              {item.hasSubmenu && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedMenu === item.label ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>

            {/* Submenu */}
            {item.hasSubmenu && expandedMenu === item.label && (
              <div className="bg-white rounded-md my-1 ml-6 py-2 shadow-sm">
                {item.submenu.map((sub) => (
                  <div
                    key={sub}
                    onClick={() => setActiveSubmenu(sub)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer 
                      ${
                        activeSubmenu === sub
                          ? "font-semibold text-black"
                          : "text-gray-700"
                      }
                      hover:bg-gray-100 rounded-md
                    `}
                  >
                    <Circle className="w-2 h-2" />
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
