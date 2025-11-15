function NotesInput() {
  return (
    <div className="mt-4">
      <div className="flex items-center rounded-md bg-[#f8f4ff] pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
        <input
          type="text"
          name="notes"
          placeholder="Notes"
          className="block min-w-0 grow py-2 pr-3 pl-1 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

export default NotesInput;
