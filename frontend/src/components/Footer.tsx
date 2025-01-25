import { Button } from "@/components/ui/button";
import Feedback from "./Feedback";
import Link from "next/link";
import { Icons } from "./icons";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              ToolStack
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built by MM
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end items-center gap-2">
            <Feedback />

            <Button variant="outline" className="" asChild>
              <Link
                href="https://github.com/marcm8793/tool-stack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Icons.GithubIcon />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="mt-2 flex flex-wrap justify-center items-center gap-2">
            <span className="flex items-center gap-1">
              Frontend: React
              <Icons.react className="" />
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              Backend: Firebase
              <Icons.firebase className="" />
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              Search: <Icons.typeSense className="" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
