import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";

interface Props {
  children: JSX.Element;
  width?: "fit-content" | "100%";
}

export const Reveal: React.FC<Props> = ({
  children,
  width = "fit-content",
}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false); // Mengelola status inView
  const mainControls = useAnimation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Periksa apakah elemen masuk atau keluar dari viewport
        if (entry.isIntersecting) {
          setInView(true); // Jika masuk ke layar
        } else {
          setInView(false); // Jika keluar dari layar
        }
      },
      {
        threshold: 0.1, // Elemen dianggap terlihat jika 10% terlihat di viewport
      }
    );

    // Mulai mengamati elemen dengan ref
    if (ref.current) {
      observer.observe(ref.current);
    }

    // Hapus observer ketika komponen di-unmount
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (inView) {
      mainControls.start("visible");
    } else {
      mainControls.start("hidden");
    }
  }, [inView, mainControls]);

  return (
    <div ref={ref} style={{ position: "relative", overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 50 }, // Animasi hilang dengan pergeseran
          visible: { opacity: 1, y: 0 }, // Animasi muncul
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, ease: "easeOut" }}>
        {children}
      </motion.div>
    </div>
  );
};
