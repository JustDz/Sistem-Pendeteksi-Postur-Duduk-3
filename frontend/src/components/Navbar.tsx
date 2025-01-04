import React, { useState, useEffect } from "react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPercentage =
        (scrollPosition / (documentHeight - windowHeight)) * 100;

      if (scrollPercentage < 35) {
        setIsScrolled(false);
      } else if (scrollPercentage >= 35 && scrollPercentage < 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full px-10 z-50 transition-all ease-in-out ${
        isScrolled
          ? "text-body-clr bg-transparent bg-opacity-35 backdrop-blur-lg"
          : "text-heading-clr bg-transparent bg-opacity-35 backdrop-blur-lg"
      }`}>
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-15">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%35' height='100%35' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
          }}
        />
      </div>

      {/* Navbar content */}
      <nav className="mx-4 flex justify-between items-center px-6 h-16 relative z-10">
        <div className="text-lg font-extrabold font-heading tracking-widest">
          Kelompok 4
        </div>
        <ul className="flex space-x-8">
          <li>
            <a
              href="#Hero"
              className="font-heading tracking-wider text-lg hover:text-gray-500 transition-colors duration-350">
              Home
            </a>
          </li>
          <li>
            <a
              href="#About"
              className="font-heading tracking-wider text-lg hover:text-gray-500 transition-colors duration-350">
              About
            </a>
          </li>
          <li>
            <a
              href="#Monitoring"
              className="font-heading tracking-wider text-lg hover:text-gray-500 transition-colors duration-350">
              Monitoring
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
