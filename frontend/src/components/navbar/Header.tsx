import Link from "next/link";
import MainNav from "./MainNav";
import MobileNav from "./MobileNav";
import { ChatBot } from "../ai-chat/ai-chatbot";
import Image from "next/image";
import SearchBar from "../SearchBar";

const Header = () => {
  return (
    <div className="border-b-2 border-neutral-200 py-6 px-1 sm:px-4">
      <div className="container mx-auto flex justify-between items-center space-x-2">
        <Link
          href="/"
          className="hidden md:block text-2xl md:text-5xl font-semibold bg-gradient-to-b from-blue-500 to-blue-900 text-transparent bg-clip-text"
        >
          ToolStack
        </Link>
        <ChatBot />
        <Link href="/" className="block md:hidden">
          <Image src="/ToolStack.png" alt="ToolStack" width={48} height={48} />
        </Link>
        <SearchBar />
        <div className="md:hidden">
          <MobileNav />
        </div>
        <div className="hidden md:block">
          <MainNav />
        </div>
      </div>
    </div>
  );
};

export default Header;
