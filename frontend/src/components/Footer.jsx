import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative z-20 w-full">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <p className="text-sm text-gray-500 md:text-right">
          © {new Date().getFullYear()} EasyCase. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
