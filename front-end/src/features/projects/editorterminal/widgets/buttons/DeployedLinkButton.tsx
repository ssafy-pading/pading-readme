import React from "react";
import { MdOpenInBrowser } from "react-icons/md";

type DeployedLinkButtonType = {
  link:string;
}

const DeployedLinkButton :React.FC<DeployedLinkButtonType> = ({ link }) => {
  const handleClick = () => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        disabled={!link}
        className={`flex items-center bg-transparent border-none ${
          link ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-60"
        } group`}
      >
        <MdOpenInBrowser className="text-white text-md" />
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-gray-700 text-white text-xs whitespace-nowrap rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          Go to Deployed Web-site
        </div>
      </button>
    </div>
  );
};

export default DeployedLinkButton;
