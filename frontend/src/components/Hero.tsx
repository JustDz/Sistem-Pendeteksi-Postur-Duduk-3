import React from "react";
import { Link } from "react-router-dom"; // Menggunakan Link untuk navigasi
import { motion } from "framer-motion";
import { Reveal } from "../animate/Reveal";

const Hero = () => {
  return (
    <section id="Hero">
      <div className="bg-first-bg relative h-[100vh]">
        <div className="absolute inset-0 opacity-15">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              mixBlendMode: "overlay",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center flex flex-col md:flex-row items-center lg:h-[90vh] justify-between">
            {/*--------------- Home ---------------*/}
            <div className="w-full md:mb-0 flex flex-col space-y-4 px-6 lg:mt-0 mt-10">
              <Reveal>
                <p className="mt-16 font-main text-heading-clr font-medium md:text-2xl text-xl mb-4">
                  IOT X Machine Learning
                </p>
              </Reveal>

              <Reveal>
                <h1 className="font-extrabold text-heading-clr tracking-wider text-9xl lg:leading-snug font-heading">
                  Sistem Pendeteksi <br />
                  Postur Duduk
                </h1>
              </Reveal>

              {/*--------------- Button Left ---------------*/}
              <Reveal>
                <div className="items-center flex justify-center gap-x-6 dark:text-white h-[11vh]">
                  <Link
                    to="/stream"
                    className="my-8 group flex items-center justify-center disabled:opacity-50 disabled:hover:opacity-50 hover:opacity-95 ring-none rounded-full shadow-lg font-semibold py-3 px-6 font-dm text-sm sm:text-base bg-btn-clr text-body-clr font-heading tracking-widest transform transition-all duration-300 ease-in-out hover:scale-110 hover:rotate-[-3deg] hover:bg-second-bg">
                    Periksa Sekarang
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
