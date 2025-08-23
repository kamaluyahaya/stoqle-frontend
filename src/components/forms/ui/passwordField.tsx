import { Eye } from "lucide-react";

export default function PasswordField() {
  return (
    <div className="relative w-64">
      <input
        type="password"
        placeholder="Enter password"
        className="w-full pl-4 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" size={20} />
    </div>
  );
}
