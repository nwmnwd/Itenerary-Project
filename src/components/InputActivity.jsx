import { TaskIcon } from "../assets/icons";

export default function InputActivity({
  value,
  onChange,
  isEditing,
  autoFocus,
}) {
  if (!isEditing) return null;

  return (
    <div className="flex items-center rounded-md">
      <input
        type="text"
        name="activity"
        placeholder="Add Activity"
        className="text-lg block min-w-0 grow font-semibold text-gray-900 caret-violet-800 placeholder:text-gray-500 focus:outline-none "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
    </div>
  );
}
