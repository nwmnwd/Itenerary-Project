import { Search } from "../assets/icons";
function SearchBox() {
  return (
    <>
      <div className="mx-5 mt-5">
        <div className="flex items-center rounded-4xl bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            id="search"
            type="text"
            name="search"
            placeholder="Search activities, locations, or notes"
            className="block min-w-0 grow py-2.5 pr-3 pl-1 text-xs font-normal text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>
    </>
  );
}

export default SearchBox;
