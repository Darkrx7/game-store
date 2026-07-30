import {
  Joystick, Keyboard, Headphones, Mouse, Monitor, Cpu, Gamepad2, LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Joystick, Keyboard, Headphones, Mouse, Monitor, Cpu, Gamepad2,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Gamepad2;
}
