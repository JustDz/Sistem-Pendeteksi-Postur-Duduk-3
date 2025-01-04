import React from "react";
import { motion } from "framer-motion";
import { Reveal } from "../animate/Reveal";

const About = () => {
  return (
    <section id="About">
      <div className="bg-second-bg relative">
        <div className=" py-12 font-poppins">
          {/* Max-width container with padding */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
            <header className="text-center">
              {/*--------------- Pengenalan sistem ---------------*/}
              <Reveal>
                <p className="mt-10 items-center font-text tracking-wider text-font-clr my-5 text-6xl leading-8 font-extrabold sm:text-6xl text-center">
                  Pengenalan Sistem
                </p>
              </Reveal>

              <Reveal>
                <p className="font-text text-font-clr mt-2 font-normal text-justify text-xl lg:mx-auto">
                  Sistem pemantauan posisi duduk ini dirancang untuk membantu
                  memonitor dan menganalisis posisi tubuh pengguna saat duduk,
                  dengan tujuan untuk meningkatkan kenyamanan dan mencegah
                  masalah kesehatan seperti nyeri punggung, postur tubuh yang
                  buruk, dan masalah terkait lainnya.
                </p>
              </Reveal>
            </header>

            {/*--------------- Jenis Posisi Duduk ---------------*/}
            <div className="mt-16 space-y-12">
              {/* Posisi Duduk yang Baik */}
              <div className="mb-8 flex flex-col lg:flex-row justify-between items-start space-y-6 lg:space-y-0">
                {/* Gambar */}
                <div className="flex-2 lg:order-1 mb-6 lg:mb-0">
                  <Reveal>
                    <img
                      src="/assets/baiq.png"
                      alt="Posisi Duduk yang Baik"
                      className="max-w-[300px] mx-auto rounded-lg shadow-lg mr-6"
                    />
                  </Reveal>
                </div>

                {/* Teks */}
                <div className="ml-5 flex-1 lg:order-2 text-left">
                  <Reveal>
                    <h3 className="tracking-wider font-text text-4xl font-semibold text-font-clr">
                      Posisi Duduk yang Baik
                    </h3>
                  </Reveal>

                  <Reveal>
                    <p className="font-text mt-4 text-lg text-font-clr font-normal text-justify">
                      Posisi duduk yang baik adalah ketika tubuh tegak dengan
                      punggung lurus, bahu rileks, dan kaki menapak di lantai
                      dengan lutut membentuk sudut 90 derajat. Kepala dan leher
                      sejajar dengan tubuh untuk menghindari ketegangan pada
                      otot leher dan punggung. Posisi ini membantu menjaga
                      sirkulasi darah lancar, mengurangi stres pada tulang
                      belakang, dan mencegah masalah kesehatan jangka panjang
                      seperti nyeri punggung dan sakit kepala.
                    </p>
                  </Reveal>
                </div>
              </div>

              {/* Posisi Duduk yang Buruk */}
              <div className="flex flex-col lg:flex-row justify-between items-start space-y-6 lg:space-y-0">
                {/* Gambar */}
                <div className="flex-2 lg:order-2 mb-6 lg:mb-0">
                  <Reveal>
                    <img
                      src="/assets/buruq.png"
                      alt="Posisi Duduk yang Buruk"
                      className="max-w-[300px] mx-auto rounded-lg shadow-lg ml-6"
                    />
                  </Reveal>
                </div>

                {/* Teks */}
                <div className="mr-5 flex-1 text-left lg:order-1">
                  <Reveal>
                    <h3 className="tracking-wider font-text text-4xl font-semibold text-font-clr">
                      Posisi Duduk yang Buruk
                    </h3>
                  </Reveal>

                  <Reveal>
                    <p className="font-text mt-4 text-lg text-font-clr font-normal text-justify">
                      Posisi duduk yang buruk terjadi ketika punggung
                      membungkuk, bahu tertarik ke depan, atau kaki tidak
                      menapak dengan kokoh di lantai. Posisi seperti ini
                      menyebabkan distribusi beban tubuh yang tidak merata,
                      memberi tekanan berlebih pada tulang belakang, otot, dan
                      sendi. Hal ini dapat menyebabkan nyeri punggung,
                      ketegangan otot, dan gangguan postur tubuh. Jika dibiarkan
                      dalam waktu lama, masalah tersebut bisa berkembang menjadi
                      gangguan muskuloskeletal jangka panjang yang sulit
                      disembuhkan dan memengaruhi kualitas hidup.
                    </p>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
