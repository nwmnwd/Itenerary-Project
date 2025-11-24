function NotesInput({ value, onChange, isEditing }) {
  if (isEditing) {
    return (
      <div className="mt-1.5 flex items-center rounded-md px-2 outline-1 outline-gray-400">
        <input
          type="text"
          name="notes"
          placeholder="Notes"
          className="block min-w-0 w-full grow bg-transparent py-2 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // View mode - only show if there's content
  if (!value || value.trim() === "") return null;

  return (
    <div className="mt-4">
      <div className="flex items-center rounded-md bg-[#f8f4ff] px-3 py-2">
        <div className="text-xs text-gray-700">{value}</div>
      </div>
    </div>
  );
}

export default NotesInput;
