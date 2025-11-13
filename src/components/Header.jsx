import { PinIcon, Calendar } from "../assets/icons";

function Header() {
  return (
    <>
      <div className="w-full bg-[#65558F] px-8 pt-6 pb-6">
        <div className="mb-1 text-left text-xl font-semibold text-white">
          Arrival at Hotel
        </div>
        <div className="mb-4 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <PinIcon className="h-2.5 w-2.5 text-white" />
            <div className="my-0 text-xs font-normal text-white">
              Natural View
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-2.5 w-2.5 text-white" />
            <div className="my-0 text-xs font-normal text-white">
              Wednesday, December 2025
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="m-0 inline-flex items-center justify-center rounded-sm bg-[#222B59] px-4 py-1 text-sm leading-none text-white text-md font-normal">
            Day 1
          </div>
          <div className="rounded-sm bg-amber-50 px-4 py-1 text-black text-md font-normal">
            1/10 complited
          </div> 
        </div>
      </div>
    </>
  );
}

export default Header;
