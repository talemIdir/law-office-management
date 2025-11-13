import { Font } from "@react-pdf/renderer";

/**
 * Register Arabic Tajawal font family with all weights
 * This font supports RTL (Right-to-Left) text rendering for Arabic
 */
export const registerArabicFont = () => {
  Font.register({
    family: "Tajawal",
    fonts: [
      {
        src: "/src/fonts/Tajawal-Regular.ttf",
        fontWeight: 400,
      },
      {
        src: "/src/fonts/Tajawal-Light.ttf",
        fontWeight: 300,
      },
      {
        src: "/src/fonts/Tajawal-Medium.ttf",
        fontWeight: 500,
      },
      {
        src: "/src/fonts/Tajawal-Bold.ttf",
        fontWeight: 700,
      },
      {
        src: "/src/fonts/Tajawal-ExtraBold.ttf",
        fontWeight: 800,
      },
    ],
  });
};
