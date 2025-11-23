import { TimeIcon } from "../assets/icons";

export default function InputTime({ value, onChange, isEditing }) {
  if (!isEditing) return null; // kalau tidak edit, tidak tampil

  return (

        <div className="flex items-center">
      <div className="shrink-0 pr-1.5 text-base text-gray-500 select-none sm:text-sm/6">
        <TimeIcon className="h-3.5 w-3.5" />
      </div>
      <input
        type="time"
        name="time"
        placeholder="Time"
        className="block min-w-0 grow pl-1 py-1 text-sm text-gray-500 placeholder:text-gray-400 focus:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

    </div>
  );
}
