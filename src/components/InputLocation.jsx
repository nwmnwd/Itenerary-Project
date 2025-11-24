import { NavigationIcon, PinIcon } from "../assets/icons";

export default function InputLocation({ value, onChange, isEditing }) {
  if (!isEditing) return null; // kalau tidak edit, tidak tampil

  return (

      
      <div className="mt-1.5 flex items-center rounded-md px-2 outline-1 outline-gray-400">
        <div className="shrink-0 pr-1.5 text-base text-gray-500 select-none sm:text-sm/6">
          <PinIcon className="h-3.5 w-3.5" />
        </div>
        <input
          type="search"
          name="location"
          placeholder="Location"
          className="block w-full min-w-0 grow py-1 pl-1 text-sm text-gray-500 placeholder:text-gray-400 focus:outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

  );
}
