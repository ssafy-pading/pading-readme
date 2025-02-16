import React from "react";
import { MdOpenInBrowser } from "react-icons/md";

const DeployedLinkButton = ({ link }) => {
  const handleClick = () => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  return (
    <div>
        <button
          onClick={handleClick}
          disabled={!link}
          className={`flex items-center bg-transparent border-none ${
            link ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-60"
          }`}
        >
          <MdOpenInBrowser className="text-white text-md" />
        </button>
      <div className="absolute top-full left-0 mt-1/2 px-2 py-1 bg-gray-700 text-white text-xs whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        Go to Deployed Web-site
      </div>
    </div>

    
  );
};

export default DeployedLinkButton;
