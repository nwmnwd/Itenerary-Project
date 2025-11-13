import { PinIcon } from "../assets/icons";

function CardInfo({
  title = "Arrival at Sidemen Hotel",
  location = "Natural View House",
  isActive = false,
  onClick,
}) {
  return (
    <div
      className={`flex w-full items-start ${isActive ? "rounded-md ring-2 ring-violet-100" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex w-full flex-col gap-2">
        <div className="rounded-md bg-white p-5 outline-1 -outline-offset-1 outline-gray-300">
          <h3 className="text-md font-semibold">{title}</h3>
          <div className="mt-2 mb-3 flex items-center gap-2">
            <PinIcon className="h-3 w-3 text-gray-400" />
            <div className="text-xs text-gray-400">{location}</div>
          </div>
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
        </div>
      </div>
    </div>
  );
}

export default CardInfo;
