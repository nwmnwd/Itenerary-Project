import { TaskIcon } from "../assets/icons";

export default function InputActivity({
  value,
  onChange,
  isEditing,
  autoFocus,
}) {
  if (!isEditing) return null; // kalau tidak edit, tidak tampil

  return (
    <div className="flex items-center rounded-md">
      <input
        type="text"
        name="activity"
        placeholder=""
        className="text-md block min-w-0 grow py-0 pl-1 font-semibold text-gray-900 caret-violet-800 placeholder:text-gray-500 focus:outline-none "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
    </div>
  );
}
